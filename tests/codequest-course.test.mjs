import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parsePython,PySyntaxError} from '../public/codequest-python.js';
import {parseCLike} from '../public/codequest-clike.js';
import {runProgram,questProgress} from '../public/codequest.js';
import {CHAPTERS,allExercises,checkTyped,starterFor,courseStats,chapterProgress,nextExercise,neighbours,levelForXp,findExercise,exerciseLevel,isWriteExercise,XP_WRITE,XP_FIX,XP_PROJECT} from '../public/codequest-course.js';

const run=source=>runProgram(parsePython(source),{limit:800,passes:300});
const syntaxCode=source=>{
 try{parsePython(source);}catch(err){if(err instanceof PySyntaxError)return err;throw err;}
 return null;
};

const SOLUTIONS={
 'hello-print':'print("Hello, World!")',
 'hello-lines':'print("Hello, forma!")\nprint("Let\'s learn to code.")',
 'hello-pattern':'print("*")\nprint("*" * 2)\nprint("***")',
 'hello-math':'print(2 + 3 * 4)',
 'var-greet':'name = "Ada"\nprint("Hello, " + name + "!")',
 'var-area':'width = 6\nheight = 4\nprint(width * height)',
 'var-swap':'a = 3\nb = 7\nspare = a\na = b\nb = spare\nprint(a)\nprint(b)',
 'if-adult':'age = 20\nif age >= 18:\n  print("Adult")',
 'if-else':'score = 45\nif score >= 50:\n  print("Pass")\nelse:\n  print("Try again")',
 'loop-count':'i = 1\nwhile i <= 5:\n  print(i)\n  i += 1',
 'loop-sum':'total = 0\ni = 1\nwhile i <= 10:\n  total += i\n  i += 1\nprint(total)',
 'project-fizzbuzz':'n = 1\nwhile n <= 15:\n  if n % 15 == 0:\n    print("FizzBuzz")\n  elif n % 3 == 0:\n    print("Fizz")\n  elif n % 5 == 0:\n    print("Buzz")\n  else:\n    print(n)\n  n += 1'
};

test('parser handles print, variables and arithmetic',()=>{
 const result=run('a = 3\nb = a * 2 + 1\nprint(a, b)\nprint("n=" + "x")\nprint(7 / 2, 7 // 2, 7 % 4)');
 assert.equal(result.error,null);
 assert.deepEqual(result.output,['3 7','n=x','3.5 3 3']);
});

test('parser handles if, elif, else and nesting',()=>{
 const source='x = 7\nif x < 5:\n  print("low")\nelif x < 10:\n  if x % 2 == 1:\n    print("mid odd")\n  else:\n    print("mid even")\nelse:\n  print("high")\nprint("done")';
 assert.deepEqual(run(source).output,['mid odd','done']);
 assert.deepEqual(run(source.replace('x = 7','x = 12')).output,['high','done']);
 assert.deepEqual(run(source.replace('x = 7','x = 2')).output,['low','done']);
});

test('logical operators and not follow Python precedence',()=>{
 assert.deepEqual(run('x = 3\nprint(not x == 3)\nprint(x > 1 and x < 5)\nprint(x < 1 or x == 3)').output,['0','1','1']);
});

test('instruction ids point at the learner\'s line numbers',()=>{
 const program=parsePython('\n# comment\nx = 1\n\nprint(x)');
 assert.deepEqual(program.map(s=>s.id),['L3','L5']);
 assert.deepEqual(run('x = 1\nprint(x)').steps.map(s=>s.id),['L1','L2']);
});

test('syntax problems report the line instead of throwing something else',()=>{
 assert.equal(syntaxCode('print("hi)').code,'unterminatedText');
 assert.equal(syntaxCode('print("hi"').code,'missingParen');
 assert.equal(syntaxCode('if 1 == 1\n  print(1)').code,'missingColon');
 assert.equal(syntaxCode('if 1 == 1:\nprint(1)').code,'expectedIndent');
 assert.equal(syntaxCode('x = 1\n  y = 2').code,'unexpectedIndent');
 assert.equal(syntaxCode('else:\n  print(1)').code,'strayElse');
 assert.equal(syntaxCode('if 1:\n    print(1)\n  print(2)').code,'unexpectedIndent');
 assert.equal(syntaxCode('import os').code,'unsupported');
 assert.equal(syntaxCode('x = 4 $ 2').code,'badCharacter');
 assert.equal(syntaxCode('x = 1\nprint(x)\nprint(').line,3);
});

test('runtime problems come back as errors, not exceptions',()=>{
 assert.equal(run('print(missing)').error,'unknown variable: missing');
 assert.equal(run('print("a" + 1)').error,'cannot add text and a number');
 assert.equal(run('print(1 / 0)').error,'division by zero');
 assert.equal(run('while 1:\n  x = 1').error,'too many passes');
});

test('runaway loops are stopped',()=>{
 assert.match(String(runProgram(parsePython('i = 0\nwhile i < 10:\n  i += 0'),{limit:100000,passes:50}).error),/too many passes/);
});

test('every written exercise has a solution that passes and a starter that does not',()=>{
 const written=allExercises().filter(isWriteExercise);
 assert.ok(written.length>=10);
 for(const ex of written){
  assert.ok(SOLUTIONS[ex.id],ex.id+' needs a test solution');
  const good=checkTyped(ex,SOLUTIONS[ex.id]);
  assert.equal(good.passed,true,ex.id+' solution should pass: '+JSON.stringify(good.error||good.output));
  assert.equal(checkTyped(ex,starterFor(ex,'python')).passed,false,ex.id+' starter should not already pass');
 }
});

// Each solution is written once as Python and as a body of C-style statements.
// C++ and Java share the body; only the print and the text type differ.
const CBODY={
 'hello-print':'say("Hello, World!");',
 'hello-lines':'say("Hello, forma!");\nsay("Let\'s learn to code.");',
 'hello-pattern':'say("*");\nsay("**");\nsay("***");',
 'hello-math':'say(2 + 3 * 4);',
 'var-greet':'say("Hello, " + name + "!");',
 'var-area':'int width = 6;\nint height = 4;\nsay(width * height);',
 'var-swap':'int spare = a;\na = b;\nb = spare;\nsay(a);\nsay(b);',
 'if-adult':'if (age >= 18) {\n  say("Adult");\n}',
 'if-else':'if (score >= 50) {\n  say("Pass");\n} else {\n  say("Try again");\n}',
 'loop-count':'while (i <= 5) {\n  say(i);\n  i++;\n}',
 'loop-sum':'while (i <= 10) {\n  total += i;\n  i++;\n}\nsay(total);',
 'project-fizzbuzz':'for (int k = 1; k <= 15; k++) {\n  if (k % 15 == 0) say("FizzBuzz");\n  else if (k % 3 == 0) say("Fizz");\n  else if (k % 5 == 0) say("Buzz");\n  else say(k);\n}'
};

function cSolution(ex,lang){
 const say=lang==='java'?v=>'System.out.println('+v+');':v=>'cout << '+v+' << endl;';
 const body=CBODY[ex.id].replace(/say\((.*)\);/g,(_m,v)=>say(v));
 // Keep the starter's own variable lines, drop its comment, add the solution.
 const lines=starterFor(ex,lang).split('\n');
 const comment=lines.findIndex(l=>l.trim().startsWith('//'));
 lines.splice(comment,1,...body.split('\n').map(l=>'  '+l));
 return lines.join('\n');
}

test('every written exercise can be solved in C++ and Java, and the starters do not pass',()=>{
 for(const lang of ['cpp','java']){
  for(const ex of allExercises().filter(isWriteExercise)){
   const solved=checkTyped(ex,cSolution(ex,lang),lang);
   assert.equal(solved.passed,true,lang+' '+ex.id+': '+JSON.stringify(solved.error||solved.output)+'\n'+cSolution(ex,lang));
   assert.equal(checkTyped(ex,starterFor(ex,lang),lang).passed,false,lang+' '+ex.id+' starter should not pass');
  }
 }
});

test('starters share the same setup variables in all three languages',()=>{
 const ex=findExercise('var-swap').exercise;
 assert.match(starterFor(ex,'python'),/^a = 3\nb = 7\n/);
 assert.match(starterFor(ex,'cpp'),/int a = 3;\s+int b = 7;/);
 assert.match(starterFor(ex,'cpp'),/int main\(\) \{/);
 assert.match(starterFor(ex,'java'),/public static void main\(String\[\] args\)/);
 assert.match(starterFor(findExercise('var-greet').exercise,'cpp'),/string name = "Ada";/);
 assert.match(starterFor(findExercise('var-greet').exercise,'java'),/String name = "Ada";/);
});

test('C++ output follows cout rules: no spaces added, endl ends the line',()=>{
 const run=src=>runProgram(parseCLike('int main() {\n'+src+'\n}','cpp'));
 assert.deepEqual(run('cout << "a" << "b" << 1 << endl; cout << "c"; cout << "d" << endl;').output,['ab1','cd']);
 assert.deepEqual(run('cout << "x\\ny" << endl;').output,['x','y']);
 assert.deepEqual(run('cout << "tail";').output,['tail']);
 assert.deepEqual(run('std::cout << 1 << std::endl;').output,['1']);
});

test('Java output follows print and println, and + joins text with numbers',()=>{
 const run=src=>runProgram(parseCLike('public class Main { public static void main(String[] args) {\n'+src+'\n} }','java'));
 assert.deepEqual(run('System.out.print("a"); System.out.print(1); System.out.println("b" + 2 + 3); System.out.println();').output,['a1b23','']);
 assert.equal(run('int x = 1 + 2; System.out.println("n=" + x);').output[0],'n=3');
});

test('C-style control flow: braces optional, for desugars to a loop, ! and && work',()=>{
 const run=src=>runProgram(parseCLike('int main() {\n'+src+'\n}','cpp'));
 assert.deepEqual(run('for (int i = 0; i < 3; i++) cout << i << endl;').output,['0','1','2']);
 assert.deepEqual(run('int x = 5; if (x > 9) cout << "a" << endl; else if (x > 3 && !(x == 4)) cout << "b" << endl; else cout << "c" << endl;').output,['b']);
 assert.deepEqual(run('int n = 3; int s = 0; while (n > 0) { s += n; n--; } cout << s << endl;').output,['6']);
 assert.deepEqual(run('int i; cout << i << endl;').output,['0']);
});

test('a for loop satisfies an exercise that asks for a loop',()=>{
 const ex=findExercise('loop-count').exercise;
 assert.equal(checkTyped(ex,'for i in range(1, 6):\n  print(i)').passed,true);
 assert.equal(checkTyped(ex,'int main() {\n for (int i = 1; i <= 5; i++) { cout << i << endl; }\n}','cpp').passed,true);
});

test('C++ and Java problems are reported with codes and lines',()=>{
 const code=(src,lang)=>{try{parseCLike(src,lang);return null;}catch(err){if(err instanceof PySyntaxError)return err;throw err;}};
 assert.equal(code('int main() {\n cout << 1\n}','cpp').code,'missingSemicolon');
 assert.equal(code('int main() {\n cout << 1\n}','cpp').line,2);
 assert.equal(code('int main() {\n double x = 1.5;\n}','cpp').code,'decimal');
 assert.equal(code('int main() {\n double x = 1;\n}','cpp').code,'unsupportedType');
 assert.equal(code('class Main { public static void main(String[] a) {\n string s = "a";\n} }','java').code,'unsupportedType');
 assert.equal(code('int main() {\n if (1) {\n','cpp').code,'unclosedBlock');
 assert.equal(code('int x = 1;','cpp').code,'noMain');
 assert.equal(code('int main() {\n cout << "a;\n}','cpp').code,'unterminatedText');
 assert.equal(code('int main() {\n @\n}','cpp').code,'badCharacter');
});

test('an exercise that requires a concept rejects hard-coded output',()=>{
 const loop=findExercise('loop-count').exercise;
 const cheat=checkTyped(loop,'print(1)\nprint(2)\nprint(3)\nprint(4)\nprint(5)');
 assert.equal(cheat.matches,true);
 assert.equal(cheat.passed,false);
 assert.deepEqual(cheat.missing,['while']);
});

test('wrong output and errors never pass',()=>{
 const ex=findExercise('hello-print').exercise;
 assert.equal(checkTyped(ex,'print("hello, world!")').passed,false);
 assert.equal(checkTyped(ex,'').error.kind,'empty');
 assert.equal(checkTyped(ex,'print("Hello, World!"').error.kind,'syntax');
 assert.equal(checkTyped(ex,'print(oops)').error.kind,'runtime');
});

test('course structure: unique ids, translated copy, valid fix levels',()=>{
 const ids=allExercises().map(x=>x.id);
 assert.equal(new Set(ids).size,ids.length,'exercise ids must be unique');
 for(const chapter of CHAPTERS){
  for(const key of ['en','zh-CN','zh-TW'])assert.ok(chapter.title[key]&&chapter.summary[key],chapter.id+' '+key);
  for(const ex of chapter.exercises){
   if(ex.kind==='fix'){assert.ok(exerciseLevel(ex),ex.id+' should wrap an existing level');continue;}
   for(const field of ['title','brief','teach','hint'])for(const key of ['en','zh-CN','zh-TW'])assert.ok(ex[field]?.[key],ex.id+'.'+field+'.'+key);
   assert.ok(ex.goal.length>0,ex.id+' has no goal');
  }
 }
});

test('XP, level, badges and next exercise follow the cleared map',()=>{
 const a={};
 let stats=courseStats(a);
 assert.equal(stats.done,0);
 assert.equal(stats.xp,0);
 assert.equal(stats.level,1);
 assert.equal(stats.badgeCount,0);
 assert.equal(nextExercise(a).id,'hello-print');

 const cleared=questProgress(a).cleared;
 for(const ex of CHAPTERS[0].exercises)cleared[ex.id]=true;
 stats=courseStats(a);
 assert.equal(stats.xp,4*XP_WRITE);
 assert.equal(stats.badges[0],true);
 assert.equal(stats.badgeCount,1);
 assert.equal(chapterProgress(a,CHAPTERS[0]).complete,true);
 assert.equal(nextExercise(a).id,CHAPTERS[1].exercises[0].id);

 for(const ex of allExercises())cleared[ex.id]=true;
 stats=courseStats(a);
 assert.equal(stats.done,stats.total);
 assert.equal(stats.projectsDone,1);
 assert.equal(stats.xp,stats.totalXp);
 assert.equal(stats.badgeCount,CHAPTERS.length);
 assert.equal(nextExercise(a),null);
 const writes=allExercises().filter(x=>x.kind==='write').length,fixes=allExercises().filter(x=>x.kind==='fix').length;
 assert.equal(stats.totalXp,writes*XP_WRITE+fixes*XP_FIX+XP_PROJECT);
});

test('levels rise with XP',()=>{
 assert.equal(levelForXp(0),1);
 assert.equal(levelForXp(49),1);
 assert.equal(levelForXp(50),2);
 assert.equal(levelForXp(120),3);
});

test('neighbours walk the course in order',()=>{
 const first=allExercises()[0],last=allExercises().at(-1);
 assert.equal(neighbours(first.id).prev,null);
 assert.equal(neighbours(first.id).next.id,allExercises()[1].id);
 assert.equal(neighbours(last.id).next,null);
});
