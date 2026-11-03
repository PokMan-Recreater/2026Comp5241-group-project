// Code Quest — a tiny reader for the Python subset the game teaches.
//
// It turns what a learner types into the same instruction tree that
// codequest.js already executes, so typed answers get the same step trace,
// variable tracking and loop guards as the pick-the-line levels. Supported:
// print(), assignment (=, +=, -=, *=), if / elif / else, while, integers,
// decimals, text, arithmetic, comparisons, and / or / not. Everything else is
// rejected with a line number instead of being guessed at.

import {num,text,ref,bin,set,out,when,repeat} from './codequest.js';

export class PySyntaxError extends Error {
 /** @param {string} code @param {number} line @param {string} [detail] */
 constructor(code,line,detail=''){
  super(code+' (line '+line+')');
  this.code=code;
  this.line=line;
  this.detail=detail;
 }
}

/** @type {Record<string,[string,number]>} Operator token to [instruction op, precedence]. */
const BINARY={'or':['||',1],'and':['&&',2],'==':['==',3],'!=':['!=',3],'<':['<',4],'>':['>',4],'<=':['<=',4],'>=':['>=',4],'+':['+',5],'-':['-',5],'*':['*',6],'/':['truediv',6],'//':['/',6],'%':['%',6]};
const ESCAPES={n:'\n',t:'\t','\\':'\\','"':'"',"'":"'"};

function tokenize(source,line){
 const tokens=[];
 let i=0;
 while(i<source.length){
  const ch=source[i];
  if(ch===' '||ch==='\t'){i++;continue;}
  if(ch==='#')break;
  if(ch==='"'||ch==="'"){
   let value='',j=i+1;
   while(j<source.length&&source[j]!==ch){
    if(source[j]==='\\'&&j+1<source.length){value+=ESCAPES[source[j+1]]??source[j+1];j+=2;}
    else value+=source[j++];
   }
   if(source[j]!==ch)throw new PySyntaxError('unterminatedText',line);
   tokens.push({t:'str',v:value});
   i=j+1;
   continue;
  }
  const number=/^\d+(?:\.\d+)?/.exec(source.slice(i));
  if(number){tokens.push({t:'num',v:Number(number[0])});i+=number[0].length;continue;}
  const word=/^[A-Za-z_]\w*/.exec(source.slice(i));
  if(word){
   const w=word[0];
   tokens.push(['and','or','not'].includes(w)?{t:'op',v:w}:{t:'name',v:w});
   i+=w.length;
   continue;
  }
  const two=source.slice(i,i+2);
  if(['==','!=','<=','>=','//','+=','-=','*='].includes(two)){tokens.push({t:'op',v:two});i+=2;continue;}
  if('+-*/%<>=():,'.includes(ch)){tokens.push({t:'op',v:ch});i++;continue;}
  throw new PySyntaxError('badCharacter',line,ch);
 }
 return tokens;
}

/**
 * Shared by the Python and C-family readers. Tokens may carry their own
 * `line`; `binary` maps operator tokens to [instruction op, precedence].
 * @param {Record<string,[string,number]>} [binary]
 */
export function expressionParser(tokens,line,binary=BINARY){
 let pos=0;
 const ln=tok=>tok?.line??line;
 const peek=()=>tokens[pos];
 const isOp=v=>peek()?.t==='op'&&peek().v===v;
 function primary(){
  const tok=tokens[pos++];
  if(!tok)throw new PySyntaxError('unfinished',ln(tokens[pos-2]));
  if(tok.t==='num')return num(tok.v);
  if(tok.t==='str')return text(tok.v);
  if(tok.t==='name')return ref(tok.v);
  if(tok.t==='op'&&tok.v==='('){
   const inner=expression(0);
   if(!isOp(')'))throw new PySyntaxError('missingParen',ln(peek()||tokens[pos-1]));
   pos++;
   return inner;
  }
  if(tok.t==='op'&&tok.v==='-')return bin('-',num(0),unary());
  throw new PySyntaxError('unexpected',ln(tok),String(tok.v));
 }
 function unary(){
  if(isOp('!')){pos++;return bin('==',unary(),num(0));}
  return primary();
 }
 function expression(min){
  let left;
  if(isOp('not')){
   // `not` binds looser than comparisons, so `not x == 3` means not (x == 3).
   pos++;
   left=bin('==',expression(Math.max(min,3)),num(0));
  }else left=unary();
  for(;;){
   const tok=peek();
   const spec=tok?.t==='op'?binary[tok.v]:null;
   if(!spec||spec[1]<min)return left;
   pos++;
   left=bin(spec[0],left,expression(spec[1]+1));
  }
 }
 return {
  expression:()=>expression(0),
  index:()=>pos,
  seek:i=>{pos=i;},
  isOp,
  next:()=>tokens[pos++],
  peek,
  done:()=>pos>=tokens.length,
  rest:()=>tokens.slice(pos),
  skip:()=>{pos++;}
 };
}

function parseLine(tokens,line){
 const id='L'+line;
 const p=expressionParser(tokens,line);
 const first=tokens[0];
 const finish=()=>{if(!p.done())throw new PySyntaxError('unexpected',line,String(p.peek().v));};

 if(first.t==='name'&&first.v==='print'){
  p.skip();
  if(!p.isOp('('))throw new PySyntaxError('printParen',line);
  p.skip();
  const values=[];
  if(!p.isOp(')')){
   values.push(p.expression());
   while(p.isOp(',')){p.skip();values.push(p.expression());}
  }
  if(!p.isOp(')'))throw new PySyntaxError('missingParen',line);
  p.skip();
  finish();
  const st=out(id,values[0]??text(''));
  if(values.length>1)st.values=values;
  return st;
 }
 if(first.t==='name'&&['if','elif','while'].includes(first.v)){
  p.skip();
  const cond=p.expression();
  if(!p.isOp(':'))throw new PySyntaxError('missingColon',line);
  p.skip();
  finish();
  return {kind:first.v,id,cond};
 }
 if(first.t==='name'&&first.v==='for'){
  const v=tokens[1],inKw=tokens[2],range=tokens[3];
  if(v?.t!=='name'||inKw?.v!=='in'||range?.v!=='range'||tokens[4]?.v!=='(')throw new PySyntaxError('forRange',line);
  p.skip();p.skip();p.skip();p.skip();p.skip();
  const args=[p.expression()];
  while(p.isOp(',')){p.skip();args.push(p.expression());}
  if(!p.isOp(')'))throw new PySyntaxError('missingParen',line);
  p.skip();
  if(!p.isOp(':'))throw new PySyntaxError('missingColon',line);
  p.skip();
  finish();
  const [from,to,step]=args.length===1?[num(0),args[0],num(1)]:[args[0],args[1],args[2]??num(1)];
  const down=step.type==='num'&&step.value<0;
  return {kind:'for',id,name:v.v,from,cond:bin(down?'>':'<',ref(v.v),to),step:set(id,v.v,bin('+',ref(v.v),step))};
 }
 if(first.t==='name'&&first.v==='else'){
  p.skip();
  if(!p.isOp(':'))throw new PySyntaxError('missingColon',line);
  p.skip();
  finish();
  return {kind:'else',id};
 }
 if(first.t==='name'&&tokens[1]?.t==='op'&&['=','+=','-=','*='].includes(tokens[1].v)){
  const name=first.v,mode=tokens[1].v;
  p.skip();
  p.skip();
  const value=p.expression();
  finish();
  return set(id,name,mode==='='?value:bin(mode[0],ref(name),value));
 }
 throw new PySyntaxError('unsupported',line);
}

/**
 * Parses learner-typed Python into instructions the interpreter understands.
 * Instruction ids are `L<line number>`, so a step in the trace points back at
 * the exact line the learner wrote.
 * @param {string} source
 */
export function parsePython(source){
 const rows=[];
 String(source).replace(/\r\n?/g,'\n').split('\n').forEach((raw,index)=>{
  const line=index+1;
  const expanded=raw.replace(/\t/g,'    ');
  const tokens=tokenize(expanded.trimStart(),line);
  if(!tokens.length)return;
  rows.push({line,indent:expanded.length-expanded.trimStart().length,tokens});
 });

 const root=[];
 // Each frame is a block that is still open: the list receiving statements,
 // the indentation of its body, and the header that opened it.
 const stack=[{body:root,indent:rows[0]?.indent??0,header:null}];
 if(rows[0]&&rows[0].indent>0)throw new PySyntaxError('unexpectedIndent',rows[0].line);
 let expectBody=null;

 for(const row of rows){
  if(expectBody){
   if(row.indent<=stack.at(-1).indent)throw new PySyntaxError('expectedIndent',row.line);
   stack.push({body:expectBody.body,indent:row.indent,header:expectBody.header});
   expectBody=null;
  }
  while(stack.length>1&&row.indent<stack.at(-1).indent)stack.pop();
  const frame=stack.at(-1);
  if(row.indent>frame.indent)throw new PySyntaxError('unexpectedIndent',row.line);

  const st=parseLine(row.tokens,row.line);
  const parent=frame.body;
  if(st.kind==='for'){
   // for x in range(...) becomes: x = start, then a while loop that steps x last.
   const node=repeat(st.id,st.cond,[]);
   node.forStep=st.step;
   parent.push(set(st.id,st.name,st.from),node);
   expectBody={body:node.body,header:node};
   continue;
  }
  if(st.kind==='if'||st.kind==='while'){
   const node=st.kind==='if'?when(st.id,st.cond,[],[]):repeat(st.id,st.cond,[]);
   parent.push(node);
   expectBody={body:st.kind==='if'?node.then:node.body,header:node};
   continue;
  }
  if(st.kind==='elif'||st.kind==='else'){
   const last=parent.at(-1);
   if(!last||last.op!=='if')throw new PySyntaxError('strayElse',row.line);
   // Walk to the innermost still-open else branch so elif chains nest.
   let target=last;
   while(target.elifTail)target=target.elifTail;
   if(target.closed)throw new PySyntaxError('strayElse',row.line);
   if(st.kind==='else'){
    target.closed=true;
    expectBody={body:target.otherwise,header:target};
   }else{
    const node=when(st.id,st.cond,[],[]);
    target.otherwise.push(node);
    target.elifTail=node;
    expectBody={body:node.then,header:node};
   }
   continue;
  }
  parent.push(st);
 }
 if(expectBody)throw new PySyntaxError('expectedIndent',rows.at(-1).line);
 const clean=list=>list.map(st=>{
  const rest={...st};
  delete rest.elifTail;
  delete rest.closed;
  delete rest.forStep;
  if(rest.then)rest.then=clean(rest.then);
  if(rest.otherwise)rest.otherwise=clean(rest.otherwise);
  if(rest.body)rest.body=[...clean(rest.body),...(st.forStep?[st.forStep]:[])];
  return rest;
 });
 return clean(root);
}

/** Which instruction kinds a parsed program uses, for exercises that require a concept. */
export function usedConstructs(program){
 const used=new Set();
 const walk=list=>list.forEach(st=>{
  used.add(st.op);
  if(st.then)walk(st.then);
  if(st.otherwise)walk(st.otherwise);
  if(st.body)walk(st.body);
 });
 walk(program);
 return used;
}
