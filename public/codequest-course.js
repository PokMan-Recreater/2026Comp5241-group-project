// Code Quest — the course layer: chapters, exercises, XP, levels and badges.
//
// A chapter mixes two kinds of exercise. "write" exercises ask the learner to
// type Python and are checked by running it; "fix" exercises are the existing
// pick-the-missing-line levels from codequest.js. Progress is not stored twice:
// the shared `cleared` map already says which exercises are done, and XP,
// level and badges are all worked out from it.

import {runProgram,questProgress,findLevel} from './codequest.js';
import {parsePython,usedConstructs,PySyntaxError} from './codequest-python.js';
import {parseCLike} from './codequest-clike.js';

const t=(en,cn,tw)=>({en,'zh-CN':cn,'zh-TW':tw});

export const XP_WRITE=10;
export const XP_FIX=15;
export const XP_PROJECT=60;
export const XP_PER_LEVEL=50;

/** @typedef {{id:string,kind:'write'|'fix'|'project',title:any,brief?:any,teach?:any,hint?:any,setup?:[string,string][],todo?:any,goal?:string[],needs?:string[]}} Exercise */

/** @type {{id:string,title:any,summary:any,badge:string,exercises:Exercise[]}[]} */
export const CHAPTERS=[
 {
  id:'hello',badge:'terminal',
  title:t('Hello World','你好，世界','你好，世界'),
  summary:t('Print your first messages to the terminal.','把第一条消息输出到终端。','把第一則訊息輸出到終端。'),
  exercises:[
   {id:'hello-print',kind:'write',
    title:t('Hello World','你好，世界','你好，世界'),
    brief:t('Print the message Hello, World! to the terminal.','把消息 Hello, World! 输出到终端。','把訊息 Hello, World! 輸出到終端。'),
    teach:t('Printing shows whatever you give it. Text goes in quotes.','输出语句会显示你交给它的内容。文字要放在引号里。','輸出語句會顯示你交給它的內容。文字要放在引號裡。'),
    hint:t('Print the text Hello, World! on its own line, with the text inside quotes.','单独一行输出文字 Hello, World!，文字要放在引号里。','單獨一行輸出文字 Hello, World!，文字要放在引號裡。'),
    todo:t('Print Hello, World! below','在下面输出 Hello, World!','在下面輸出 Hello, World!'),goal:['Hello, World!']},
   {id:'hello-lines',kind:'write',
    title:t('Two lines','两行输出','兩行輸出'),
    brief:t('Print two lines: Hello, forma! and then Let\'s learn to code.','输出两行：Hello, forma!，然后是 Let\'s learn to code.','輸出兩行：Hello, forma!，然後是 Let\'s learn to code.'),
    teach:t('Every print starts a new line, and the lines run from top to bottom.','每次输出都会另起一行，程序从上往下执行。','每次輸出都會另起一行，程式從上往下執行。'),
    hint:t('Use two print statements. Double quotes let you keep the apostrophe in Let\'s.','用两条输出语句。外层用双引号，就能保留 Let\'s 里的撇号。','用兩條輸出語句。外層用雙引號，就能保留 Let\'s 裡的撇號。'),
    goal:['Hello, forma!',"Let's learn to code."]},
   {id:'hello-pattern',kind:'write',
    title:t('Pattern','图案','圖案'),
    brief:t('Print a small triangle: one star, then two, then three.','输出一个小三角形：先 1 个星号，再 2 个，再 3 个。','輸出一個小三角形：先 1 個星號，再 2 個，再 3 個。'),
    teach:t('Each print is its own line, and the lines run from top to bottom. In Python, "*" * 3 also repeats text.','每次输出各占一行，从上往下执行。在 Python 里，"*" * 3 还能重复文字。','每次輸出各佔一行，從上往下執行。在 Python 裡，"*" * 3 還能重複文字。'),
    hint:t('Print "*", then "**", then "***", each on its own line.','依次输出 "*"、"**"、"***"，各占一行。','依次輸出 "*"、"**"、"***"，各佔一行。'),
    goal:['*','**','***']},
   {id:'hello-math',kind:'write',
    title:t('Calculator','计算器','計算器'),
    brief:t('Make the program work out 2 + 3 * 4 and print the answer.','让程序算出 2 + 3 * 4 并输出结果。','讓程式算出 2 + 3 * 4 並輸出結果。'),
    teach:t('Programs follow the usual order of operations, so multiplication happens before addition.','程序遵循常规运算顺序，先乘后加。','程式遵循常規運算順序，先乘後加。'),
    hint:t('Put the calculation itself inside the print, not the answer.','把算式本身放进输出语句，而不是直接写答案。','把算式本身放進輸出語句，而不是直接寫答案。'),
    goal:['14']}
  ]
 },
 {
  id:'variables',badge:'box',
  title:t('Variables','变量','變數'),
  summary:t('Give values a name, then reuse and change them.','给值起名字，再反复使用和修改。','給值取名字，再反覆使用和修改。'),
  exercises:[
   {id:'var-greet',kind:'write',needs:['set'],
    title:t('Name tag','名字标签','名字標籤'),
    brief:t('The variable name already holds "Ada". Print Hello, Ada! using that variable, not by typing Ada again.','变量 name 里已经存了 "Ada"。用这个变量输出 Hello, Ada!，不要再手打一次 Ada。','變數 name 裡已經存了 "Ada"。用這個變數輸出 Hello, Ada!，不要再手打一次 Ada。'),
    teach:t('A variable is a name for a value. Joining pieces of text gives one message.','变量是给值起的名字。把几段文字拼在一起就是一条消息。','變數是給值取的名字。把幾段文字拼在一起就是一則訊息。'),
    hint:t('Join "Hello, ", the variable and "!" into one message.','把 "Hello, "、变量和 "!" 拼成一条消息。','把 "Hello, "、變數和 "!" 拼成一則訊息。'),
    setup:[['name','"Ada"']],todo:t('Print Hello, Ada! using name','用 name 输出 Hello, Ada!','用 name 輸出 Hello, Ada!'),goal:['Hello, Ada!']},
   {id:'var-area',kind:'write',needs:['set'],
    title:t('Area','面积','面積'),
    brief:t('Store 6 in width and 4 in height, then print width * height.','把 6 存入 width，4 存入 height，再输出 width * height。','把 6 存入 width，4 存入 height，再輸出 width * height。'),
    teach:t('Once values have names, a formula reads like the sentence it comes from.','值有了名字，公式读起来就像一句话。','值有了名字，公式讀起來就像一句話。'),
    hint:t('Create width and height first, then print width * height.','先创建 width 和 height，再输出 width * height。','先建立 width 和 height，再輸出 width * height。'),
    goal:['24']},
   {id:'var-swap',kind:'write',needs:['set'],
    title:t('Swap','交换','交換'),
    brief:t('a is 3 and b is 7. Swap their values, then print a and b on separate lines (7 then 3).','a 是 3，b 是 7。交换两个值，再分行输出 a 和 b（先 7 后 3）。','a 是 3，b 是 7。交換兩個值，再分行輸出 a 和 b（先 7 後 3）。'),
    teach:t('Assigning a to b would lose b\'s old value, so park one value in a spare variable first.','直接赋值会丢掉原来的值，所以先用一个临时变量存起来。','直接賦值會丟掉原來的值，所以先用一個暫存變數存起來。'),
    hint:t('Use a third variable: spare = a, then a = b, then b = spare.','用第三个变量：spare = a，再 a = b，再 b = spare。','用第三個變數：spare = a，再 a = b，再 b = spare。'),
    setup:[['a','3'],['b','7']],todo:t('Swap a and b, then print a and b','交换 a 和 b，再输出 a 和 b','交換 a 和 b，再輸出 a 和 b'),goal:['7','3']},
   {id:'rookie-print',kind:'fix'},
   {id:'rookie-update',kind:'fix'},
   {id:'rookie-remainder',kind:'fix'}
  ]
 },
 {
  id:'control',badge:'fork',
  title:t('Control Flow','控制流程','控制流程'),
  summary:t('Let a condition decide which lines run.','让条件决定执行哪几行。','讓條件決定執行哪幾行。'),
  exercises:[
   {id:'if-adult',kind:'write',needs:['if'],
    title:t('Age check','年龄检查','年齡檢查'),
    brief:t('age is 20. Print Adult if age is at least 18.','age 是 20。如果 age 至少为 18，就输出 Adult。','age 是 20。如果 age 至少為 18，就輸出 Adult。'),
    teach:t('An if runs its lines only when the condition is true.','if 里的语句只在条件为真时运行。','if 裡的語句只在條件為真時執行。'),
    hint:t('Check whether age is at least 18, and print Adult inside that if.','判断 age 是否至少为 18，并在这个 if 里输出 Adult。','判斷 age 是否至少為 18，並在這個 if 裡輸出 Adult。'),
    setup:[['age','20']],goal:['Adult']},
   {id:'if-else',kind:'write',needs:['if'],
    title:t('Pass or retry','通过或重试','通過或重試'),
    brief:t('score is 45. Print Pass if score is 50 or more, otherwise print Try again.','score 是 45。分数不低于 50 输出 Pass，否则输出 Try again。','score 是 45。分數不低於 50 輸出 Pass，否則輸出 Try again。'),
    teach:t('else covers every case the if did not match.','else 负责处理 if 没有命中的所有情况。','else 負責處理 if 沒有命中的所有情況。'),
    hint:t('Add an else for the other case and print the other message there.','给另一种情况加一个 else，在里面输出另一条消息。','給另一種情況加一個 else，在裡面輸出另一則訊息。'),
    setup:[['score','45']],goal:['Try again']},
   {id:'adept-parity',kind:'fix'},
   {id:'adept-max',kind:'fix'},
   {id:'adept-flag',kind:'fix'}
  ]
 },
 {
  id:'loops',badge:'loop',
  title:t('Loops','循环','迴圈'),
  summary:t('Repeat work while a condition stays true.','条件为真时，重复执行。','條件為真時，重複執行。'),
  exercises:[
   {id:'loop-count',kind:'write',needs:['while'],
    title:t('Count to five','数到五','數到五'),
    brief:t('Use a loop to print the numbers 1 to 5, one per line.','用循环分行输出 1 到 5。','用迴圈分行輸出 1 到 5。'),
    teach:t('A loop needs a counter that changes. If it never changes, the loop never ends.','循环需要一个会变化的计数器。如果它不变，循环就停不下来。','迴圈需要一個會變化的計數器。如果它不變，迴圈就停不下來。'),
    hint:t('Start i at 1, keep looping while i is at most 5, print i, then add 1 to i.','让 i 从 1 开始，当 i 不超过 5 时循环，输出 i，再让 i 加 1。','讓 i 從 1 開始，當 i 不超過 5 時迴圈，輸出 i，再讓 i 加 1。'),
    setup:[['i','1']],goal:['1','2','3','4','5']},
   {id:'loop-sum',kind:'write',needs:['while'],
    title:t('Running total','累加','累加'),
    brief:t('Add up the numbers 1 to 10 with a loop and print the total, 55.','用循环把 1 到 10 加起来，输出总和 55。','用迴圈把 1 到 10 加起來，輸出總和 55。'),
    teach:t('total += i is shorthand for total = total + i. Print only after the loop has finished.','total += i 是 total = total + i 的简写。循环结束后再输出。','total += i 是 total = total + i 的簡寫。迴圈結束後再輸出。'),
    hint:t('Keep total = 0 and i = 1, add i to total inside the loop, print total at the end.','设 total = 0、i = 1，循环里把 i 加到 total，最后输出 total。','設 total = 0、i = 1，迴圈裡把 i 加到 total，最後輸出 total。'),
    setup:[['total','0'],['i','1']],goal:['55']},
   {id:'master-accumulate',kind:'fix'},
   {id:'master-halving',kind:'fix'},
   {id:'master-even-sum',kind:'fix'}
  ]
 },
 {
  id:'checkpoint',badge:'trophy',
  title:t('Checkpoint Project','关卡项目','關卡專案'),
  summary:t('Combine variables, if and loops in one program.','把变量、if 和循环合在一个程序里。','把變數、if 和迴圈合在一個程式裡。'),
  exercises:[
   {id:'project-fizzbuzz',kind:'project',needs:['while','if'],
    title:t('Fizz Buzz','Fizz Buzz','Fizz Buzz'),
    brief:t('Count from 1 to 15. For multiples of 3 print Fizz, for multiples of 5 print Buzz, for multiples of both print FizzBuzz, otherwise print the number.','从 1 数到 15。3 的倍数输出 Fizz，5 的倍数输出 Buzz，两者的公倍数输出 FizzBuzz，其余输出数字本身。','從 1 數到 15。3 的倍數輸出 Fizz，5 的倍數輸出 Buzz，兩者的公倍數輸出 FizzBuzz，其餘輸出數字本身。'),
    teach:t('Check the most specific case first. Here that is "multiple of both 3 and 5", then 3, then 5.','先检查最具体的情况：先判断同时是 3 和 5 的倍数，再判断 3，再判断 5。','先檢查最具體的情況：先判斷同時是 3 和 5 的倍數，再判斷 3，再判斷 5。'),
    hint:t('n % 3 == 0 means n divides by 3. Use if / else if / else inside a loop, and add 1 to n each pass.','n % 3 == 0 表示 n 能被 3 整除。在循环里用 if / else if / else，每轮让 n 加 1。','n % 3 == 0 表示 n 能被 3 整除。在迴圈裡用 if / else if / else，每輪讓 n 加 1。'),
    setup:[['n','1']],
    goal:['1','2','Fizz','4','Buzz','Fizz','7','8','Fizz','Buzz','11','Fizz','13','14','FizzBuzz']}
  ]
 }
];

export const BADGE_NAMES={
 terminal:t('Printer','输出者','輸出者'),box:t('Collector','收纳者','收納者'),fork:t('Pathfinder','探路者','探路者'),loop:t('Looper','循环者','迴圈者'),trophy:t('Champion','通关者','通關者')
};

const WRITE_KINDS=['write','project'];

const COMMENT={python:'# ',cpp:'// ',java:'// '};
const DEFAULT_TODO=t('Write your code here','在这里写代码','在這裡寫程式碼');

/**
 * The code a learner starts from, built per language from the exercise's
 * setup variables so all three languages begin from the same situation.
 * @param {Exercise} ex
 * @param {'python'|'cpp'|'java'} lang
 * @param {(v:any)=>string} pick Chooses the comment language.
 */
export function starterFor(ex,lang,pick=v=>v.en){
 const lines=(ex.setup||[]).map(([name,value])=>{
  const text=value.startsWith('"');
  if(lang==='python')return name+' = '+value;
  return (text?(lang==='java'?'String':'string'):'int')+' '+name+' = '+value+';';
 });
 const note=COMMENT[lang]+pick(ex.todo||DEFAULT_TODO);
 if(lang==='python')return [...lines,note,''].join('\n');
 const indent=lang==='java'?'    ':'  ';
 const inner=[...lines,'',note,''].map(l=>l?indent+l:l);
 if(lang==='java')return ['public class Main {','  public static void main(String[] args) {',...inner,'  }','}',''].join('\n');
 return ['#include <iostream>','#include <string>','using namespace std;','','int main() {',...inner,'  return 0;','}',''].join('\n');
}

/** A short syntax reminder per language: [label, code]. */
export const SYNTAX_TIPS={
 python:[[t('Print','输出','輸出'),'print("hi")\nprint(a, b)'],[t('Variable','变量','變數'),'x = 5\nx += 1'],[t('If / else','if / else','if / else'),'if x > 3:\n  print("big")\nelif x == 3:\n  print("three")\nelse:\n  print("small")'],[t('Loop','循环','迴圈'),'while i <= 5:\n  i += 1\nfor i in range(1, 6):\n  print(i)']],
 cpp:[[t('Print','输出','輸出'),'cout << "hi" << endl;\ncout << a << " " << b << endl;'],[t('Variable','变量','變數'),'int x = 5;\nstring s = "hi";\nx += 1;  x++;'],[t('If / else','if / else','if / else'),'if (x > 3) {\n  cout << "big" << endl;\n} else if (x == 3) {\n  cout << "three" << endl;\n} else {\n  cout << "small" << endl;\n}'],[t('Loop','循环','迴圈'),'while (i <= 5) {\n  i++;\n}\nfor (int i = 1; i <= 5; i++) {\n}']],
 java:[[t('Print','输出','輸出'),'System.out.println("hi");\nSystem.out.print(a);'],[t('Variable','变量','變數'),'int x = 5;\nString s = "hi";\nx += 1;  x++;'],[t('If / else','if / else','if / else'),'if (x > 3) {\n  System.out.println("big");\n} else if (x == 3) {\n  System.out.println("three");\n} else {\n  System.out.println("small");\n}'],[t('Loop','循环','迴圈'),'while (i <= 5) {\n  i++;\n}\nfor (int i = 1; i <= 5; i++) {\n}']]
};


/** @param {string} id */
export function findExercise(id){
 for(const chapter of CHAPTERS){
  const exercise=chapter.exercises.find(x=>x.id===id);
  if(exercise)return {chapter,exercise,index:chapter.exercises.indexOf(exercise)};
 }
 return null;
}

export const allExercises=()=>CHAPTERS.flatMap(c=>c.exercises);
export const isWriteExercise=ex=>WRITE_KINDS.includes(ex.kind);
export const exerciseXp=ex=>ex.kind==='project'?XP_PROJECT:ex.kind==='fix'?XP_FIX:XP_WRITE;

/** Titles for "fix" exercises come from the level they wrap. */
export function exerciseLevel(ex){return ex.kind==='fix'?findLevel(ex.id):null;}

export function courseStats(a){
 const cleared=questProgress(a).cleared;
 const list=allExercises();
 const done=list.filter(x=>cleared[x.id]);
 const projects=list.filter(x=>x.kind==='project');
 const xp=done.reduce((sum,x)=>sum+exerciseXp(x),0);
 const totalXp=list.reduce((sum,x)=>sum+exerciseXp(x),0);
 const badges=CHAPTERS.map(c=>c.exercises.every(x=>cleared[x.id]));
 return {
  done:done.length,total:list.length,
  projectsDone:projects.filter(x=>cleared[x.id]).length,projects:projects.length,
  xp,totalXp,level:levelForXp(xp),badges,badgeCount:badges.filter(Boolean).length
 };
}

export const levelForXp=xp=>1+Math.floor(xp/XP_PER_LEVEL);

export function chapterProgress(a,chapter){
 const cleared=questProgress(a).cleared;
 const done=chapter.exercises.filter(x=>cleared[x.id]).length;
 return {done,total:chapter.exercises.length,complete:done===chapter.exercises.length};
}

/** The first exercise the learner has not cleared yet, or null when everything is done. */
export function nextExercise(a){
 const cleared=questProgress(a).cleared;
 return allExercises().find(x=>!cleared[x.id])||null;
}

/** Neighbouring exercises in course order, for the previous / next links. */
export function neighbours(id){
 const list=allExercises(),i=list.findIndex(x=>x.id===id);
 return {prev:i>0?list[i-1]:null,next:i>=0&&i<list.length-1?list[i+1]:null};
}

/**
 * Runs learner-typed code and decides whether it clears the exercise.
 * It never throws: a syntax or runtime problem comes back as `error`, so the
 * page can explain it instead of breaking.
 * @param {Exercise} exercise
 * @param {string} source
 * @param {'python'|'cpp'|'java'} [lang]
 */
export function checkTyped(exercise,source,lang='python'){
 const goal=exercise.goal||[];
 let program;
 try{
  program=lang==='python'?parsePython(source):parseCLike(source,lang);
 }catch(err){
  if(err instanceof PySyntaxError)return {passed:false,output:[],steps:[],vars:{},goal,error:{kind:'syntax',code:err.code,line:err.line,detail:err.detail}};
  throw err;
 }
 if(!program.length)return {passed:false,output:[],steps:[],vars:{},goal,error:{kind:'empty'}};
 const result=runProgram(program,{limit:800,passes:300});
 const used=usedConstructs(program);
 const missing=(exercise.needs||[]).filter(x=>!used.has(x));
 const matches=result.output.length===goal.length&&result.output.every((line,i)=>line===goal[i]);
 const error=result.error?{kind:'runtime',message:result.error}:null;
 return {passed:!error&&matches&&!missing.length,output:result.output,steps:result.steps,vars:result.vars,goal,error,missing,matches};
}
