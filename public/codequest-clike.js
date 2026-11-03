// Code Quest — a tiny reader for the C++ and Java subsets the game teaches.
//
// Like the Python reader, it produces the instruction tree that codequest.js
// executes. Supported: int and text variables, = and += -= *= /= %= ++ --,
// cout << ... << endl (C++), System.out.print / println (Java), if / else if /
// else, while and for, braces or a single statement as a body, and the usual
// arithmetic, comparison and && || ! operators. Anything else is reported with
// a line number rather than guessed at.

import {num,text,ref,bin,set,out,when,repeat} from './codequest.js';
import {PySyntaxError,expressionParser} from './codequest-python.js';

const BASE={'||':['||',1],'&&':['&&',2],'==':['==',3],'!=':['!=',3],'<':['<',4],'>':['>',4],'<=':['<=',4],'>=':['>=',4],'+':['+',5],'-':['-',5],'*':['*',6],'/':['/',6],'%':['%',6]};
const JAVA={...BASE,'+':['jplus',5]};
const TYPES={cpp:{int:0,string:''},java:{int:0,String:''}};
const OTHER_TYPES=['double','float','bool','boolean','char','long','short','byte','unsigned','auto','var','string','String'];
const ESCAPES={n:'\n',t:'\t','\\':'\\','"':'"',"'":"'"};
const TWO=['==','!=','<=','>=','&&','||','++','--','+=','-=','*=','/=','%=','<<','::'];

function tokenize(source){
 const tokens=[];
 let i=0,line=1;
 while(i<source.length){
  const ch=source[i];
  if(ch==='\n'){line++;i++;continue;}
  if(ch===' '||ch==='\t'||ch==='\r'){i++;continue;}
  if(ch==='#'){while(i<source.length&&source[i]!=='\n')i++;continue;}
  if(ch==='/'&&source[i+1]==='/'){while(i<source.length&&source[i]!=='\n')i++;continue;}
  if(ch==='/'&&source[i+1]==='*'){
   const end=source.indexOf('*/',i+2);
   const stop=end<0?source.length:end+2;
   for(const c of source.slice(i,stop))if(c==='\n')line++;
   i=stop;
   continue;
  }
  if(ch==='"'){
   let value='',j=i+1;
   while(j<source.length&&source[j]!=='"'&&source[j]!=='\n'){
    if(source[j]==='\\'&&j+1<source.length){value+=ESCAPES[source[j+1]]??source[j+1];j+=2;}
    else value+=source[j++];
   }
   if(source[j]!=='"')throw new PySyntaxError('unterminatedText',line);
   tokens.push({t:'str',v:value,line});
   i=j+1;
   continue;
  }
  const number=/^\d+(?:\.\d+)?/.exec(source.slice(i,i+32));
  if(number){
   if(number[0].includes('.'))throw new PySyntaxError('decimal',line);
   tokens.push({t:'num',v:Number(number[0]),line});
   i+=number[0].length;
   continue;
  }
  const word=/^[A-Za-z_]\w*/.exec(source.slice(i,i+64));
  if(word){tokens.push({t:'name',v:word[0],line});i+=word[0].length;continue;}
  const two=source.slice(i,i+2);
  if(TWO.includes(two)){tokens.push({t:'op',v:two,line});i+=2;continue;}
  if('+-*/%<>=!(){}[];,.'.includes(ch)){tokens.push({t:'op',v:ch,line});i++;continue;}
  throw new PySyntaxError('badCharacter',line,ch);
 }
 // std::cout and std::endl read the same as cout and endl.
 return tokens.filter((tok,k)=>!(tok.t==='name'&&tok.v==='std'&&tokens[k+1]?.v==='::')&&!(tok.v==='::'&&tokens[k-1]?.v==='std'));
}

/**
 * @param {string} source
 * @param {'cpp'|'java'} lang
 */
export function parseCLike(source,lang){
 const tokens=tokenize(String(source));
 const types=TYPES[lang]||TYPES.cpp;
 const p=expressionParser(tokens,1,lang==='java'?JAVA:BASE);
 const lineNow=()=>p.peek()?.line??tokens.at(-1)?.line??1;
 const lastLine=()=>tokens[p.index()-1]?.line??1;
 const isName=v=>p.peek()?.t==='name'&&p.peek().v===v;
 const expect=(v,code)=>{
  if(!p.isOp(v))throw new PySyntaxError(code,v===';'||v===')'?lastLine():lineNow());
  p.skip();
 };

 // Declarations, assignments and ++ / --. `semi` is false inside a for header.
 function simple(semi){
  const first=p.peek();
  const id='L'+first.line;
  const made=[];
  if(first.t==='name'&&Object.hasOwn(types,first.v)){
   p.skip();
   for(;;){
    const name=p.next();
    if(name?.t!=='name')throw new PySyntaxError('unexpected',name?.line??lastLine(),String(name?.v??''));
    let value=types[first.v]===''?text(''):num(0);
    if(p.isOp('=')){p.skip();value=p.expression();}
    made.push(set(id,name.v,value));
    if(p.isOp(',')){p.skip();continue;}
    break;
   }
  }else if(first.t==='name'&&OTHER_TYPES.includes(first.v)&&p.index()+1<tokens.length&&tokens[p.index()+1].t==='name'){
   throw new PySyntaxError('unsupportedType',first.line,first.v);
  }else if(first.t==='name'){
   p.skip();
   const op=p.next();
   const name=first.v;
   if(op?.t==='op'&&op.v==='=')made.push(set(id,name,p.expression()));
   else if(op?.t==='op'&&['+=','-=','*=','/=','%='].includes(op.v))made.push(set(id,name,bin(op.v[0],ref(name),p.expression())));
   else if(op?.t==='op'&&(op.v==='++'||op.v==='--'))made.push(set(id,name,bin(op.v[0],ref(name),num(1))));
   else throw new PySyntaxError('unsupported',first.line);
  }else throw new PySyntaxError('unsupported',first.line);
  if(semi)expect(';','missingSemicolon');
  return made;
 }

 function printStatement(first){
  const id='L'+first.line;
  if(lang==='java'){
   // System.out.println(...) and System.out.print(...)
   const chain=[['System'],['.'],['out'],['.']];
   for(const [v] of chain){
    const tok=p.next();
    if(tok?.v!==v)throw new PySyntaxError('unsupported',first.line);
   }
   const method=p.next();
   if(!['print','println'].includes(method?.v))throw new PySyntaxError('unsupported',first.line);
   expect('(','printParen');
   const value=p.isOp(')')?text(''):p.expression();
   expect(')','missingParen');
   expect(';','missingSemicolon');
   const st=out(id,value);
   st.newline=method.v==='println';
   return [st];
  }
  p.skip();
  if(!p.isOp('<<'))throw new PySyntaxError('unsupported',first.line);
  const result=[];
  let current=[];
  const flush=newline=>{
   if(!current.length&&!newline)return;
   const st=out(id,current[0]??text(''));
   st.values=current.length?current:[text('')];
   st.sep='';
   st.newline=newline;
   result.push(st);
   current=[];
  };
  while(p.isOp('<<')){
   p.skip();
   const value=p.expression();
   if(value.type==='var'&&value.name==='endl')flush(true);
   else current.push(value);
  }
  flush(false);
  expect(';','missingSemicolon');
  return result;
 }

 function body(){
  if(!p.isOp('{'))return statement();
  p.skip();
  const list=[];
  while(!p.isOp('}')){
   if(p.done())throw new PySyntaxError('unclosedBlock',lastLine());
   list.push(...statement());
  }
  p.skip();
  return list;
 }

 function statement(){
  const first=p.peek();
  if(!first)throw new PySyntaxError('unclosedBlock',lastLine());
  const id='L'+first.line;
  if(first.t==='op'&&first.v===';'){p.skip();return [];}
  if(first.t==='op'&&first.v==='{')return body();
  if(first.t!=='name')throw new PySyntaxError('unsupported',first.line);
  if(first.v==='return'){
   p.skip();
   if(!p.isOp(';'))p.expression();
   expect(';','missingSemicolon');
   return [];
  }
  if(first.v==='if'){
   p.skip();
   expect('(','missingParen');
   const cond=p.expression();
   expect(')','missingParen');
   const then=body();
   let otherwise=[];
   if(isName('else')){
    p.skip();
    otherwise=isName('if')?statement():body();
   }
   return [when(id,cond,then,otherwise)];
  }
  if(first.v==='while'){
   p.skip();
   expect('(','missingParen');
   const cond=p.expression();
   expect(')','missingParen');
   return [repeat(id,cond,body())];
  }
  if(first.v==='for'){
   p.skip();
   expect('(','missingParen');
   const init=p.isOp(';')?[]:simple(false);
   expect(';','missingSemicolon');
   const cond=p.isOp(';')?num(1):p.expression();
   expect(';','missingSemicolon');
   const step=p.isOp(')')?[]:simple(false);
   expect(')','missingParen');
   return [...init,repeat(id,cond,[...body(),...step])];
  }
  if(first.v==='cout'&&lang==='cpp')return printStatement(first);
  if(first.v==='System'&&lang==='java')return printStatement(first);
  return simple(true);
 }

 // Find main, then read its body. Everything around it (includes, the class
 // wrapper, closing braces) is boilerplate the learner does not need to get right.
 let start=-1;
 for(let k=0;k<tokens.length-1;k++){
  if(tokens[k].t==='name'&&tokens[k].v==='main'&&tokens[k+1].v==='('){start=k;break;}
 }
 if(start<0)throw new PySyntaxError('noMain',1);
 p.seek(start+2);
 while(!p.isOp(')')){
  if(p.done())throw new PySyntaxError('missingParen',lastLine());
  p.skip();
 }
 p.skip();
 expect('{','missingBrace');
 const program=[];
 while(!p.isOp('}')){
  if(p.done())throw new PySyntaxError('unclosedBlock',lastLine());
  program.push(...statement());
 }
 return program;
}
