// Code Quest — the instruction interpreter behind the practice game.
//
// Every level describes one program a single time, as instructions. The same
// instructions are executed to produce a step trace and rendered into C++,
// Python or Java. That keeps the three languages from drifting out of sync
// with the behaviour the game actually checks: the code on screen and the
// result in the terminal come from one source.
//
// This is a small teaching model. It handles integer variables, arithmetic,
// comparison, if/else and while. It is not a compiler, and the UI says so.

export const QUEST_LANGUAGES=[
 {id:'cpp',label:'C++',file:'main.cpp'},
 {id:'python',label:'Python',file:'main.py'},
 {id:'java',label:'Java',file:'Main.java'}
];

export const QUEST_DIFFICULTIES=[
 {
  id:"rookie",
  name:{
   en:"Rookie",
   "zh-CN":"入门",
   "zh-TW":"入門"
  },
  summary:{
   en:"Straight-line code: store a value, then print it.",
   "zh-CN":"顺序执行：先存值，再输出。",
   "zh-TW":"順序執行：先存值，再輸出。"
  },
  focus:{
   en:"reading a program from top to bottom",
   "zh-CN":"从上到下读懂一段程序",
   "zh-TW":"從上到下讀懂一段程式"
  }
 },
 {
  id:"adept",
  name:{
   en:"Adept",
   "zh-CN":"进阶",
   "zh-TW":"進階"
  },
  summary:{
   en:"Branches: one condition decides which line runs next.",
   "zh-CN":"分支：由一个条件决定接下来执行哪一行。",
   "zh-TW":"分支：由一個條件決定接下來執行哪一行。"
  },
  focus:{
   en:"predicting which branch a condition selects",
   "zh-CN":"判断条件会选中哪个分支",
   "zh-TW":"判斷條件會選中哪個分支"
  }
 },
 {
  id:"master",
  name:{
   en:"Master",
   "zh-CN":"大师",
   "zh-TW":"大師"
  },
  summary:{
   en:"Loops: follow a counter across every pass.",
   "zh-CN":"循环：跟踪每一轮的计数变化。",
   "zh-TW":"迴圈：追蹤每一輪的計數變化。"
  },
  focus:{
   en:"tracking state across repeated passes",
   "zh-CN":"跟踪重复执行中的变量状态",
   "zh-TW":"追蹤重複執行中的變數狀態"
  }
 }
];

const OPERATORS={
 '+':(a,b)=>a+b,'-':(a,b)=>a-b,'*':(a,b)=>a*b,
 '/':(a,b)=>b===0?0:Math.trunc(a/b),'%':(a,b)=>b===0?0:a%b,
 '==':(a,b)=>a===b?1:0,'!=':(a,b)=>a!==b?1:0,
 '<':(a,b)=>a<b?1:0,'>':(a,b)=>a>b?1:0,
 '<=':(a,b)=>a<=b?1:0,'>=':(a,b)=>a>=b?1:0,
 '&&':(a,b)=>a&&b?1:0,'||':(a,b)=>a||b?1:0
};

const PRECEDENCE={'||':1,'&&':2,'==':3,'!=':3,'<':4,'>':4,'<=':4,'>=':4,'+':5,'-':5,'*':6,'/':6,'%':6};

export const num=value=>({type:'num',value});
export const text=value=>({type:'str',value});
export const ref=name=>({type:'var',name});
export const bin=(op,left,right)=>({type:'bin',op,left,right});
export const set=(id,name,value)=>({op:'set',id,name,value});
export const out=(id,value)=>({op:'out',id,value});
export const when=(id,cond,then,otherwise=[])=>({op:'if',id,cond,then,otherwise});
export const repeat=(id,cond,body)=>({op:'while',id,cond,body});
export const gap=id=>({slot:1,id});

function symbol(op,lang){
 if(lang==='python'){
  if(op==='&&')return 'and';
  if(op==='||')return 'or';
 }
 return op;
}

export function exprToString(node,lang='cpp'){
 if(!node)return '???';
 if(node.slot)return '???';
 if(node.type==='num')return String(node.value);
 if(node.type==='str')return JSON.stringify(node.value);
 if(node.type==='var')return node.name;
 return wrapBinary(node,lang,PRECEDENCE[node.op]??9,0);
}

function wrapBinary(node,lang,prec,parent){
 const text=operand(node.left,lang,prec)+' '+symbol(node.op,lang)+' '+operand(node.right,lang,prec+1);
 return parent>prec?'('+text+')':text;
}

function operand(node,lang,min){
 if(node&&node.type==='bin'){
  const prec=PRECEDENCE[node.op]??9;
  const text=wrapBinary(node,lang,prec,prec);
  return prec<min?'('+text+')':text;
 }
 return exprToString(node,lang);
}

// One dialect per language. `base` is the indentation depth of top-level
// statements, so Java sits inside a class and a main method, C++ inside
// main(), and Python at column zero.
const DIALECTS={
 cpp:{lang:'cpp',base:1,decl:'int',
  prelude:['#include <iostream>','using namespace std;','int main() {'],
  epilogue:['  return 0;','}'],
  set:(name,expr)=>'int '+name+' = '+expr+';',
  out:v=>'cout << '+v+' << endl;',
  if:v=>'if ('+v+') {',else:'} else {',close:'}',
  while:v=>'while ('+v+') {',
  placeholder:'/* pick something */'},
 python:{lang:'python',base:0,decl:'',
  prelude:[],epilogue:[],
  set:(name,expr)=>name+' = '+expr,
  out:v=>'print('+v+')',
  if:v=>'if '+v+':',else:'else:',close:null,
  while:v=>'while '+v+':',
  placeholder:'# pick something'},
 java:{lang:'java',base:2,decl:'int',
  prelude:['public class Main {','  public static void main(String[] args) {'],
  epilogue:['  }','}'],
  set:(name,expr)=>'int '+name+' = '+expr+';',
  out:v=>'System.out.println('+v+');',
  if:v=>'if ('+v+') {',else:'} else {',close:'}',
  while:v=>'while ('+v+') {',
  placeholder:'/* pick something */'}
};

export const QUEST_LANG_IDS=Object.keys(DIALECTS);
export function isQuestLanguage(id){return Object.hasOwn(DIALECTS,id);}

function statementText(st,d,seen){
 const lang=d.lang;
 if(st.op==='set'){
  const expr=exprToString(st.value,lang);
  return seen.has(st.name)?st.name+' = '+expr+(lang==='python'?'':';'):d.set(st.name,expr);
 }
 if(st.op==='out')return d.out(exprToString(st.value,lang));
 if(st.op==='if')return d.if(exprToString(st.cond,lang));
 if(st.op==='while')return d.while(exprToString(st.cond,lang));
 return '';
}

// Renders instructions into source lines and records which line each
// instruction landed on, so the runner can highlight the matching line.
export function renderProgram(stmts,lang='cpp'){
 const d=DIALECTS[lang]||DIALECTS.cpp,lines=[],map=new Map(),seen=new Set();
 const emit=(depth,text)=>{if(text!=null)lines.push('  '.repeat(depth)+text);return lines.length;};
 const walk=(list,depth)=>{
  for(const st of list){
   if(st.slot){map.set(st.id,emit(depth,d.placeholder));continue;}
   const text=statementText(st,d,seen);
   if(!text)continue;
   map.set(st.id,emit(depth,text));
   if(st.op==='set')seen.add(st.name);
   if(st.then){
    walk(st.then,depth+1);
    if(st.otherwise?.length){emit(depth,d.else);walk(st.otherwise,depth+1);}
    emit(depth,d.close);
   }
   if(st.body){walk(st.body,depth+1);emit(depth,d.close);}
  }
 };
 d.prelude.forEach(line=>emit(0,line));
 walk(stmts,d.base);
 d.epilogue.forEach(line=>emit(0,line));
 return {code:lines.join('\n'),map};
}

function evaluate(node,vars){
 if(!node)throw new Error('missing expression');
 if(node.slot)throw new Error('unfilled slot');
 if(node.type==='num')return node.value;
 if(node.type==='str')return node.value;
 if(node.type==='var'){
  if(!Object.hasOwn(vars,node.name))throw new Error('unknown variable: '+node.name);
  return vars[node.name];
 }
 const fn=OPERATORS[node.op];
 if(!fn)throw new Error('unsupported operator: '+node.op);
 return fn(evaluate(node.left,vars),evaluate(node.right,vars));
}

export const formatValue=v=>typeof v==='string'?v:Number.isInteger(v)?String(v):String(Math.round(v*1e4)/1e4);

// Executes instructions and records one snapshot per line that runs, so the
// UI can show the exact state after each step instead of only the end result.
export function runProgram(stmts,options={}){
 const limit=options.limit??160,passes=options.passes??64;
 const vars={},output=[],steps=[];
 let budget=limit,error=null;
 const walk=list=>{
  for(const st of list){
   if(error)return;
   if(--budget<0){error='step limit reached';return;}
   if(st.slot){error='unfilled slot';return;}
   try{
    if(st.op==='set'){
     vars[st.name]=evaluate(st.value,vars);
     steps.push({id:st.id,vars:{...vars},output:[...output]});
    }else if(st.op==='out'){
     output.push(formatValue(evaluate(st.value,vars)));
     steps.push({id:st.id,vars:{...vars},output:[...output]});
    }else if(st.op==='if'){
     const taken=evaluate(st.cond,vars)!==0;
     steps.push({id:st.id,vars:{...vars},output:[...output],note:taken?'then':'else'});
     walk(taken?st.then:(st.otherwise||[]));
    }else if(st.op==='while'){
     let guard=0;
     while(evaluate(st.cond,vars)!==0){
      if(error)return;
      if(++guard>passes){error='too many passes';return;}
      if(--budget<0){error='step limit reached';return;}
      steps.push({id:st.id,vars:{...vars},output:[...output]});
      walk(st.body);
     }
     steps.push({id:st.id,vars:{...vars},output:[...output],note:'exit'});
    }
   }catch(err){error=err.message;}
  }
 };
 walk(stmts);
 return {vars,output,steps,error};
}

// Drops the learner's chosen snippet into the level's gap. The instruction id
// is preserved so line highlighting keeps pointing at the right place.
export function buildProgram(level,choice){
 if(!level?.slot||!Number.isInteger(choice))return level.program;
 const node=level.slot.options[choice]?.node;
 if(!node)return level.program;
 const patch=list=>list.map(st=>{
  if(st.id===level.slot.target){
   if(level.slot.field==='stmt')return {...node,id:st.id};
   if(level.slot.field==='cond')return {...st,cond:node};
   return {...st,value:node};
  }
  const next={...st};
  if(st.then){next.then=patch(st.then);if(st.otherwise)next.otherwise=patch(st.otherwise);}
  if(st.body)next.body=patch(st.body);
  return next;
 });
 return patch(level.program);
}

export function checkProgram(level,choice){
 const result=runProgram(buildProgram(level,choice));
 const goal=level.goal;
 const passed=!result.error&&result.output.length===goal.length&&result.output.every((line,i)=>line===goal[i]);
 return {...result,passed,goal};
}

export const QUEST_LEVELS=[
 {
  id:"rookie-print",
  difficulty:"rookie",
  title:{
   en:"Print a sum",
   "zh-CN":"输出两数之和",
   "zh-TW":"輸出兩數之和"
  },
  brief:{
   en:"The program stores 3 in a and 5 in b. Choose the expression that prints their sum, 8.",
   "zh-CN":"程序把 3 存入 a，5 存入 b。选出能输出两数之和 8 的表达式。",
   "zh-TW":"程式把 3 存入 a，5 存入 b。選出能輸出兩數之和 8 的表達式。"
  },
  teach:{
   en:"a + b adds the two stored values. The other operators run too, they just answer a different question.",
   "zh-CN":"a + b 把两个值相加。其他运算符也能运行，只是回答的是另一个问题。",
   "zh-TW":"a + b 把兩個值相加。其他運算子也能執行，只是回答的是另一個問題。"
  },
  goal:[
   "8"
  ],
  program:[
   {
    op:"set",
    id:"s1",
    name:"a",
    value:{
     type:"num",
     value:3
    }
   },
   {
    op:"set",
    id:"s2",
    name:"b",
    value:{
     type:"num",
     value:5
    }
   },
   {
    op:"out",
    id:"s3",
    value:{
     slot:1,
     id:""
    }
   }
  ],
  slot:{
   target:"s3",
   field:"value",
   options:[
    {
     code:"a + b",
     node:{
      type:"bin",
      op:"+",
      left:{
       type:"var",
       name:"a"
      },
      right:{
       type:"var",
       name:"b"
      }
     },
     note:{
      en:"Adds the two values.",
      "zh-CN":"两个值相加。",
      "zh-TW":"兩個值相加。"
     }
    },
    {
     code:"a - b",
     node:{
      type:"bin",
      op:"-",
      left:{
       type:"var",
       name:"a"
      },
      right:{
       type:"var",
       name:"b"
      }
     },
     note:{
      en:"Subtracts, giving -2.",
      "zh-CN":"相减，结果是 -2。",
      "zh-TW":"相減，結果是 -2。"
     }
    },
    {
     code:"a * b",
     node:{
      type:"bin",
      op:"*",
      left:{
       type:"var",
       name:"a"
      },
      right:{
       type:"var",
       name:"b"
      }
     },
     note:{
      en:"Multiplies, giving 15.",
      "zh-CN":"相乘，结果是 15。",
      "zh-TW":"相乘，結果是 15。"
     }
    }
   ],
   correct:0},
 },
 {
  id:"rookie-update",
  difficulty:"rookie",
  title:{
   en:"Update a variable",
   "zh-CN":"更新变量",
   "zh-TW":"更新變數"
  },
  brief:{
   en:"x starts at 2. Pick the line that makes the final output 5.",
   "zh-CN":"x 初始为 2。选出能让最终输出为 5 的那一行。",
   "zh-TW":"x 初始為 2。選出能讓最終輸出為 5 的那一行。"
  },
  teach:{
   en:"x = x + 3 reads the current value of x, adds 3, then stores the result back into x.",
   "zh-CN":"x = x + 3 先读取 x 当前的值，加 3，再把结果存回 x。",
   "zh-TW":"x = x + 3 先讀取 x 目前的值，加 3，再把結果存回 x。"
  },
  goal:[
   "5"
  ],
  program:[
   {
    op:"set",
    id:"s1",
    name:"x",
    value:{
     type:"num",
     value:2
    }
   },
   {
    slot:1,
    id:"s2"
   },
   {
    op:"out",
    id:"s3",
    value:{
     type:"var",
     name:"x"
    }
   }
  ],
  slot:{
   target:"s2",
   field:"stmt",
   options:[
    {
     code:"x = x + 3",
     node:{
      op:"set",
      id:"s2",
      name:"x",
      value:{
       type:"bin",
       op:"+",
       left:{
        type:"var",
        name:"x"
       },
       right:{
        type:"num",
        value:3
       }
      }
     },
     note:{
      en:"Reads x (2), adds 3, stores 5.",
      "zh-CN":"读取 x（2），加 3，存为 5。",
      "zh-TW":"讀取 x（2），加 3，存為 5。"
     }
    },
    {
     code:"x = 3",
     node:{
      op:"set",
      id:"s2",
      name:"x",
      value:{
       type:"num",
       value:3
      }
     },
     note:{
      en:"Overwrites x, so it prints 3.",
      "zh-CN":"把 x 覆盖为 3，输出 3。",
      "zh-TW":"把 x 覆蓋為 3，輸出 3。"
     }
    },
    {
     code:"x = x * 3",
     node:{
      op:"set",
      id:"s2",
      name:"x",
      value:{
       type:"bin",
       op:"*",
       left:{
        type:"var",
        name:"x"
       },
       right:{
        type:"num",
        value:3
       }
      }
     },
     note:{
      en:"Gives 6, not 5.",
      "zh-CN":"结果是 6，不是 5。",
      "zh-TW":"結果是 6，不是 5。"
     }
    }
   ],
   correct:0},
 },
 {
  id:"rookie-remainder",
  difficulty:"rookie",
  title:{
   en:"Left over items",
   "zh-CN":"剩余物品",
   "zh-TW":"剩餘物品"
  },
  brief:{
   en:"17 items are packed 5 to a box. Choose the expression that prints how many are left over.",
   "zh-CN":"17 件物品，每 5 件装一箱。选出能输出剩余件数的表达式。",
   "zh-TW":"17 件物品，每 5 件裝一箱。選出能輸出剩餘件數的表達式。"
  },
  teach:{
   en:"The % operator gives the remainder, so 17 % 5 is 2. The / operator gives 3, because integer division drops the remainder.",
   "zh-CN":"% 运算符给出余数，所以 17 % 5 等于 2。/ 运算符给出 3，因为整数除法会舍弃余数。",
   "zh-TW":"% 運算子給出餘數，所以 17 % 5 等於 2。/ 運算子給出 3，因為整數除法會捨去餘數。"
  },
  goal:[
   "2"
  ],
  program:[
   {
    op:"set",
    id:"s1",
    name:"items",
    value:{
     type:"num",
     value:17
    }
   },
   {
    op:"set",
    id:"s2",
    name:"perBox",
    value:{
     type:"num",
     value:5
    }
   },
   {
    op:"out",
    id:"s3",
    value:{
     slot:1,
     id:""
    }
   }
  ],
  slot:{
   target:"s3",
   field:"value",
   options:[
    {
     code:"items % perBox",
     node:{
      type:"bin",
      op:"%",
      left:{
       type:"var",
       name:"items"
      },
      right:{
       type:"var",
       name:"perBox"
      }
     },
     note:{
      en:"The remainder: 2 items left over.",
      "zh-CN":"余数：剩余 2 件。",
      "zh-TW":"餘數：剩餘 2 件。"
     }
    },
    {
     code:"items / perBox",
     node:{
      type:"bin",
      op:"/",
      left:{
       type:"var",
       name:"items"
      },
      right:{
       type:"var",
       name:"perBox"
      }
     },
     note:{
      en:"Full boxes: 3.",
      "zh-CN":"装满的箱数：3。",
      "zh-TW":"裝滿的箱數：3。"
     }
    },
    {
     code:"items - perBox",
     node:{
      type:"bin",
      op:"-",
      left:{
       type:"var",
       name:"items"
      },
      right:{
       type:"var",
       name:"perBox"
      }
     },
     note:{
      en:"Subtracts just once: 12.",
      "zh-CN":"只减了一次：12。",
      "zh-TW":"只減了一次：12。"
     }
    }
   ],
   correct:0},
 },
 {
  id:"adept-parity",
  difficulty:"adept",
  title:{
   en:"Even or odd",
   "zh-CN":"奇数还是偶数",
   "zh-TW":"奇數還是偶數"
  },
  brief:{
   en:"n holds 7. Choose the condition that sends the program down the odd branch.",
   "zh-CN":"n 的值是 7。选出能让程序走 odd 分支的条件。",
   "zh-TW":"n 的值是 7。選出能讓程式走 odd 分支的條件。"
  },
  teach:{
   en:"n % 2 == 0 is true only when n is even. With n = 7 the remainder is 1, so the condition is false and the else branch runs.",
   "zh-CN":"n % 2 == 0 只在 n 为偶数时成立。n = 7 时余数是 1，条件为假，于是执行 else 分支。",
   "zh-TW":"n % 2 == 0 只在 n 為偶數時成立。n = 7 時餘數是 1，條件為假，於是執行 else 分支。"
  },
  goal:[
   "odd"
  ],
  program:[
   {
    op:"set",
    id:"s1",
    name:"n",
    value:{
     type:"num",
     value:7
    }
   },
   {
    op:"if",
    id:"s2",
    cond:{
     slot:1,
     id:""
    },
    then:[
     {
      op:"out",
      id:"t1",
      value:{
       type:"str",
       value:"even"
      }
     }
    ],
    otherwise:[
     {
      op:"out",
      id:"t2",
      value:{
       type:"str",
       value:"odd"
      }
     }
    ]
   }
  ],
  slot:{
   target:"s2",
   field:"cond",
   options:[
    {
     code:"n % 2 == 0",
     node:{
      type:"bin",
      op:"==",
      left:{
       type:"bin",
       op:"%",
       left:{
        type:"var",
        name:"n"
       },
       right:{
        type:"num",
        value:2
       }
      },
      right:{
       type:"num",
       value:0
      }
     },
     note:{
      en:"False for 7, so the else branch prints odd.",
      "zh-CN":"对 7 为假，所以 else 分支输出 odd。",
      "zh-TW":"對 7 為假，所以 else 分支輸出 odd。"
     }
    },
    {
     code:"n % 2 != 0",
     node:{
      type:"bin",
      op:"!=",
      left:{
       type:"bin",
       op:"%",
       left:{
        type:"var",
        name:"n"
       },
       right:{
        type:"num",
        value:2
       }
      },
      right:{
       type:"num",
       value:0
      }
     },
     note:{
      en:"True for 7, so it would print even.",
      "zh-CN":"对 7 为真，会输出 even。",
      "zh-TW":"對 7 為真，會輸出 even。"
     }
    },
    {
     code:"n > 2",
     node:{
      type:"bin",
      op:">",
      left:{
       type:"var",
       name:"n"
      },
      right:{
       type:"num",
       value:2
      }
     },
     note:{
      en:"Also true, so it would print even.",
      "zh-CN":"同样为真，会输出 even。",
      "zh-TW":"同樣為真，會輸出 even。"
     }
    }
   ],
   correct:0},
 },
 {
  id:"adept-max",
  difficulty:"adept",
  title:{
   en:"Pick the larger value",
   "zh-CN":"取较大的值",
   "zh-TW":"取較大的值"
  },
  brief:{
   en:"a is 4 and b is 9. Choose the condition that prints the larger of the two.",
   "zh-CN":"a 是 4，b 是 9。选出能输出两者中较大值的条件。",
   "zh-TW":"a 是 4，b 是 9。選出能輸出兩者中較大值的條件。"
  },
  teach:{
   en:"When a > b is true the first branch prints a; when it is false the else branch prints b. Here a is smaller, so b (9) is printed.",
   "zh-CN":"当 a > b 为真时，第一个分支输出 a；为假时 else 分支输出 b。这里 a 更小，所以输出 b（9）。",
   "zh-TW":"當 a > b 為真時，第一個分支輸出 a；為假時 else 分支輸出 b。這裡 a 更小，所以輸出 b（9）。"
  },
  goal:[
   "9"
  ],
  program:[
   {
    op:"set",
    id:"s1",
    name:"a",
    value:{
     type:"num",
     value:4
    }
   },
   {
    op:"set",
    id:"s2",
    name:"b",
    value:{
     type:"num",
     value:9
    }
   },
   {
    op:"if",
    id:"s3",
    cond:{
     slot:1,
     id:""
    },
    then:[
     {
      op:"out",
      id:"t1",
      value:{
       type:"var",
       name:"a"
      }
     }
    ],
    otherwise:[
     {
      op:"out",
      id:"t2",
      value:{
       type:"var",
       name:"b"
      }
     }
    ]
   }
  ],
  slot:{
   target:"s3",
   field:"cond",
   options:[
    {
     code:"a > b",
     node:{
      type:"bin",
      op:">",
      left:{
       type:"var",
       name:"a"
      },
      right:{
       type:"var",
       name:"b"
      }
     },
     note:{
      en:"False here, so the else branch prints b (9).",
      "zh-CN":"这里为假，所以 else 分支输出 b（9）。",
      "zh-TW":"這裡為假，所以 else 分支輸出 b（9）。"
     }
    },
    {
     code:"a < b",
     node:{
      type:"bin",
      op:"<",
      left:{
       type:"var",
       name:"a"
      },
      right:{
       type:"var",
       name:"b"
      }
     },
     note:{
      en:"True, so it would print a (4).",
      "zh-CN":"为真，会输出 a（4）。",
      "zh-TW":"為真，會輸出 a（4）。"
     }
    },
    {
     code:"b > a",
     node:{
      type:"bin",
      op:">",
      left:{
       type:"var",
       name:"b"
      },
      right:{
       type:"var",
       name:"a"
      }
     },
     note:{
      en:"Also true, so it would print a (4).",
      "zh-CN":"同样为真，会输出 a（4）。",
      "zh-TW":"同樣為真，會輸出 a（4）。"
     }
    }
   ],
   correct:0},
 },
 {
  id:"adept-flag",
  difficulty:"adept",
  title:{
   en:"Set a flag",
   "zh-CN":"设置标志位",
   "zh-TW":"設定旗標"
  },
  brief:{
   en:"A passing mark is 50. Choose the line inside the branch that makes the program print 1 for a score of 55.",
   "zh-CN":"及格线是 50。选出分支内的那一行，让程序为 55 分输出 1。",
   "zh-TW":"及格線是 50。選出分支內的那一行，讓程式為 55 分輸出 1。"
  },
  teach:{
   en:"A flag is a variable that records a yes or no outcome. The pass variable starts at 0 and is set to 1 only when the score reaches the threshold.",
   "zh-CN":"标志位是用变量记录“是 / 否”结果。pass 变量初始为 0，只有分数达到门槛时才设为 1。",
   "zh-TW":"旗標是用變數記錄「是 / 否」結果。pass 變數初始為 0，只有分數達到門檻時才設為 1。"
  },
  goal:[
   "1"
  ],
  program:[
   {
    op:"set",
    id:"s1",
    name:"score",
    value:{
     type:"num",
     value:55
    }
   },
   {
    op:"set",
    id:"s2",
    name:"pass",
    value:{
     type:"num",
     value:0
    }
   },
   {
    op:"if",
    id:"s3",
    cond:{
     type:"bin",
     op:">=",
     left:{
      type:"var",
      name:"score"
     },
     right:{
      type:"num",
      value:50
     }
    },
    then:[
     {
      slot:1,
      id:"s4"
     }
    ],
    otherwise:[]
   },
   {
    op:"out",
    id:"s5",
    value:{
     type:"var",
     name:"pass"
    }
   }
  ],
  slot:{
   target:"s4",
   field:"stmt",
   options:[
    {
     code:"pass = 1",
     node:{
      op:"set",
      id:"s4",
      name:"pass",
      value:{
       type:"num",
       value:1
      }
     },
     note:{
      en:"Records success as 1.",
      "zh-CN":"用 1 记录通过。",
      "zh-TW":"用 1 記錄通過。"
     }
    },
    {
     code:"pass = 0",
     node:{
      op:"set",
      id:"s4",
      name:"pass",
      value:{
       type:"num",
       value:0
      }
     },
     note:{
      en:"Leaves the flag at 0.",
      "zh-CN":"标志位保持 0。",
      "zh-TW":"旗標保持 0。"
     }
    },
    {
     code:"pass = score",
     node:{
      op:"set",
      id:"s4",
      name:"pass",
      value:{
       type:"var",
       name:"score"
      }
     },
     note:{
      en:"Stores the score itself, printing 55.",
      "zh-CN":"存入的是分数本身，输出 55。",
      "zh-TW":"存入的是分數本身，輸出 55。"
     }
    }
   ],
   correct:0},
 },
 {
  id:"master-accumulate",
  difficulty:"master",
  title:{
   en:"Add one to five",
   "zh-CN":"从一加到五",
   "zh-TW":"從一加到五"
  },
  brief:{
   en:"The loop should add 1, 2, 3, 4 and 5 into total. Choose the condition that stops after 5.",
   "zh-CN":"循环要把 1 到 5 累加进 total。选出在 5 之后停止的条件。",
   "zh-TW":"迴圈要把 1 到 5 累加進 total。選出在 5 之後停止的條件。"
  },
  teach:{
   en:"i <= 5 keeps the loop going while i is 1 through 5, giving 15. i < 5 stops one pass early (10) and i <= 6 runs one pass too far (21).",
   "zh-CN":"i <= 5 让循环在 i 为 1 到 5 时继续，结果是 15。i < 5 少跑一轮（10），i <= 6 多跑一轮（21）。",
   "zh-TW":"i <= 5 讓迴圈在 i 為 1 到 5 時繼續，結果是 15。i < 5 少跑一輪（10），i <= 6 多跑一輪（21）。"
  },
  goal:[
   "15"
  ],
  program:[
   {
    op:"set",
    id:"s1",
    name:"total",
    value:{
     type:"num",
     value:0
    }
   },
   {
    op:"set",
    id:"s2",
    name:"i",
    value:{
     type:"num",
     value:1
    }
   },
   {
    op:"while",
    id:"s3",
    cond:{
     slot:1,
     id:""
    },
    body:[
     {
      op:"set",
      id:"b1",
      name:"total",
      value:{
       type:"bin",
       op:"+",
       left:{
        type:"var",
        name:"total"
       },
       right:{
        type:"var",
        name:"i"
       }
      }
     },
     {
      op:"set",
      id:"b2",
      name:"i",
      value:{
       type:"bin",
       op:"+",
       left:{
        type:"var",
        name:"i"
       },
       right:{
        type:"num",
        value:1
       }
      }
     }
    ]
   },
   {
    op:"out",
    id:"s4",
    value:{
     type:"var",
     name:"total"
    }
   }
  ],
  slot:{
   target:"s3",
   field:"cond",
   options:[
    {
     code:"i <= 5",
     node:{
      type:"bin",
      op:"<=",
      left:{
       type:"var",
       name:"i"
      },
      right:{
       type:"num",
       value:5
      }
     },
     note:{
      en:"Runs for i = 1 to 5, total 15.",
      "zh-CN":"i 取 1 到 5，合计 15。",
      "zh-TW":"i 取 1 到 5，合計 15。"
     }
    },
    {
     code:"i < 5",
     node:{
      type:"bin",
      op:"<",
      left:{
       type:"var",
       name:"i"
      },
      right:{
       type:"num",
       value:5
      }
     },
     note:{
      en:"Stops at 4, total 10.",
      "zh-CN":"到 4 就停，合计 10。",
      "zh-TW":"到 4 就停，合計 10。"
     }
    },
    {
     code:"i <= 6",
     node:{
      type:"bin",
      op:"<=",
      left:{
       type:"var",
       name:"i"
      },
      right:{
       type:"num",
       value:6
      }
     },
     note:{
      en:"Runs one pass too far, total 21.",
      "zh-CN":"多跑一轮，合计 21。",
      "zh-TW":"多跑一輪，合計 21。"
     }
    }
   ],
   correct:0},
 },
 {
  id:"master-halving",
  difficulty:"master",
  title:{
   en:"Halve until one",
   "zh-CN":"不断折半到一",
   "zh-TW":"不斷折半到一"
  },
  brief:{
   en:"n starts at 12 and the loop keeps halving it. Choose the line that makes count finish at 3.",
   "zh-CN":"n 初始为 12，循环不断对它折半。选出能让 count 最终为 3 的那一行。",
   "zh-TW":"n 初始為 12，迴圈不斷對它折半。選出能讓 count 最終為 3 的那一行。"
  },
  teach:{
   en:"Integer division drops the remainder, so 12 to 6 to 3 to 1 is three passes. Subtracting 2 needs six passes, and % 2 drops to 0 in one.",
   "zh-CN":"整数除法会舍弃余数，所以 12 → 6 → 3 → 1 共三轮。减 2 需要六轮，而 % 2 一轮后直接变成 0。",
   "zh-TW":"整數除法會捨去餘數，所以 12 → 6 → 3 → 1 共三輪。減 2 需要六輪，而 % 2 一輪後直接變成 0。"
  },
  goal:[
   "3"
  ],
  program:[
   {
    op:"set",
    id:"s1",
    name:"count",
    value:{
     type:"num",
     value:0
    }
   },
   {
    op:"set",
    id:"s2",
    name:"n",
    value:{
     type:"num",
     value:12
    }
   },
   {
    op:"while",
    id:"s3",
    cond:{
     type:"bin",
     op:">",
     left:{
      type:"var",
      name:"n"
     },
     right:{
      type:"num",
      value:1
     }
    },
    body:[
     {
      slot:1,
      id:"s4"
     },
     {
      op:"set",
      id:"b2",
      name:"count",
      value:{
       type:"bin",
       op:"+",
       left:{
        type:"var",
        name:"count"
       },
       right:{
        type:"num",
        value:1
       }
      }
     }
    ]
   },
   {
    op:"out",
    id:"s5",
    value:{
     type:"var",
     name:"count"
    }
   }
  ],
  slot:{
   target:"s4",
   field:"stmt",
   options:[
    {
     code:"n = n / 2",
     node:{
      op:"set",
      id:"s4",
      name:"n",
      value:{
       type:"bin",
       op:"/",
       left:{
        type:"var",
        name:"n"
       },
       right:{
        type:"num",
        value:2
       }
      }
     },
     note:{
      en:"12 to 6 to 3 to 1: three passes.",
      "zh-CN":"12 → 6 → 3 → 1，三轮。",
      "zh-TW":"12 → 6 → 3 → 1，三輪。"
     }
    },
    {
     code:"n = n - 2",
     node:{
      op:"set",
      id:"s4",
      name:"n",
      value:{
       type:"bin",
       op:"-",
       left:{
        type:"var",
        name:"n"
       },
       right:{
        type:"num",
        value:2
       }
      }
     },
     note:{
      en:"Counts down by two: six passes.",
      "zh-CN":"每次减 2：共六轮。",
      "zh-TW":"每次減 2：共六輪。"
     }
    },
    {
     code:"n = n % 2",
     node:{
      op:"set",
      id:"s4",
      name:"n",
      value:{
       type:"bin",
       op:"%",
       left:{
        type:"var",
        name:"n"
       },
       right:{
        type:"num",
        value:2
       }
      }
     },
     note:{
      en:"Drops to 0 at once: one pass.",
      "zh-CN":"立刻变成 0：只有一轮。",
      "zh-TW":"立刻變成 0：只有一輪。"
     }
    }
   ],
   correct:0},
 },
 {
  id:"master-even-sum",
  difficulty:"master",
  title:{
   en:"Sum the even numbers",
   "zh-CN":"只累加偶数",
   "zh-TW":"只累加偶數"
  },
  brief:{
   en:"The loop walks from 1 to 10 and should add only the even values into sum. Choose the line that does that.",
   "zh-CN":"循环从 1 走到 10，只应把偶数累加进 sum。选出能做到这一点的一行。",
   "zh-TW":"迴圈從 1 走到 10，只應把偶數累加進 sum。選出能做到這一點的一行。"
  },
  teach:{
   en:"The if filters each pass: i % 2 == 0 is true only on even values, so 2 + 4 + 6 + 8 + 10 is 30.",
   "zh-CN":"if 对每一轮做筛选：i % 2 == 0 只在偶数时成立，所以 2 + 4 + 6 + 8 + 10 = 30。",
   "zh-TW":"if 對每一輪做篩選：i % 2 == 0 只在偶數時成立，所以 2 + 4 + 6 + 8 + 10 = 30。"
  },
  goal:[
   "30"
  ],
  program:[
   {
    op:"set",
    id:"s1",
    name:"sum",
    value:{
     type:"num",
     value:0
    }
   },
   {
    op:"set",
    id:"s2",
    name:"i",
    value:{
     type:"num",
     value:1
    }
   },
   {
    op:"while",
    id:"s3",
    cond:{
     type:"bin",
     op:"<=",
     left:{
      type:"var",
      name:"i"
     },
     right:{
      type:"num",
      value:10
     }
    },
    body:[
     {
      op:"if",
      id:"s4",
      cond:{
       type:"bin",
       op:"==",
       left:{
        type:"bin",
        op:"%",
        left:{
         type:"var",
         name:"i"
        },
        right:{
         type:"num",
         value:2
        }
       },
       right:{
        type:"num",
        value:0
       }
      },
      then:[
       {
        slot:1,
        id:"s5"
       }
      ],
      otherwise:[]
     },
     {
      op:"set",
      id:"b3",
      name:"i",
      value:{
       type:"bin",
       op:"+",
       left:{
        type:"var",
        name:"i"
       },
       right:{
        type:"num",
        value:1
       }
      }
     }
    ]
   },
   {
    op:"out",
    id:"s6",
    value:{
     type:"var",
     name:"sum"
    }
   }
  ],
  slot:{
   target:"s5",
   field:"stmt",
   options:[
    {
     code:"sum = sum + i",
     node:{
      op:"set",
      id:"s5",
      name:"sum",
      value:{
       type:"bin",
       op:"+",
       left:{
        type:"var",
        name:"sum"
       },
       right:{
        type:"var",
        name:"i"
       }
      }
     },
     note:{
      en:"Adds 2 + 4 + 6 + 8 + 10 = 30.",
      "zh-CN":"累加 2 + 4 + 6 + 8 + 10 = 30。",
      "zh-TW":"累加 2 + 4 + 6 + 8 + 10 = 30。"
     }
    },
    {
     code:"sum = sum + 1",
     node:{
      op:"set",
      id:"s5",
      name:"sum",
      value:{
       type:"bin",
       op:"+",
       left:{
        type:"var",
        name:"sum"
       },
       right:{
        type:"num",
        value:1
       }
      }
     },
     note:{
      en:"Counts the five even passes instead of adding them.",
      "zh-CN":"统计的是五个偶数轮次，而不是把它们相加。",
      "zh-TW":"統計的是五個偶數輪次，而不是把它們相加。"
     }
    },
    {
     code:"sum = i",
     node:{
      op:"set",
      id:"s5",
      name:"sum",
      value:{
       type:"var",
       name:"i"
      }
     },
     note:{
      en:"Overwrites each pass, leaving 10.",
      "zh-CN":"每轮都覆盖，最后剩下 10。",
      "zh-TW":"每輪都覆蓋，最後剩下 10。"
     }
    }
   ],
   correct:0},
 }
];

export function levelsFor(difficulty){return QUEST_LEVELS.filter(l=>l.difficulty===difficulty);}
export function findLevel(id){return QUEST_LEVELS.find(l=>l.id===id)||null;}

// Progress lives under `academy`, so the reset, undo and export controls that
// already handle academy data pick it up without extra wiring.
export function questProgress(a){
 a.codequest??={};
 const p=a.codequest;
 // Older records, hand-edited exports or a pruned language list can all leave
 // the stored language unusable, so fall back to the first supported one.
 if(!isQuestLanguage(p.lang))p.lang=QUEST_LANGUAGES[0].id;
 p.cleared??={};
 p.attempts??={};
 return p;
}

export function clearedCount(a,difficulty){
 const p=questProgress(a);
 return levelsFor(difficulty).filter(l=>p.cleared[l.id]).length;
}

export function isUnlocked(a,difficulty,level){
 const list=levelsFor(difficulty),index=list.findIndex(l=>l.id===level.id);
 if(index<=0)return true;
 return !!questProgress(a).cleared[list[index-1].id];
}
