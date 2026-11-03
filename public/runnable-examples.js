// Complete only the built-in teaching snippets. Never rewrite learner code.
import {programmingLessonById} from './programming-lessons.js';
const bodies={
 'c-if':'int age = 18;\nif (age >= 18) printf("Eligible\\n"); else printf("Not yet\\n");',
 'c-loop':'for (int i=0; i<3; ++i) printf("%d\\n", i);',
 'c-pointer':'int value=10; int *p=&value; *p=20; printf("%d\\n",value);',
 'c-heap':'int *p=malloc(3 * sizeof *p); if (!p) return 1; p[0]=1; printf("%d\\n",p[0]); free(p);',
 'c-struct':'struct Student { int id; int active; }; struct Student s={1,1}; printf("id=%d active=%d\\n",s.id,s.active);',
 'c-file':'FILE *f=fopen("notes.txt","w"); if(!f) return 1; fputs("Hello, Forma!\\n",f); fclose(f); f=fopen("notes.txt","r"); if(!f) return 1; char line[64]; if(fgets(line,sizeof line,f)) printf("%s",line); fclose(f);',
 'cpp-class':'class Counter { int n=0; public: void increment(){++n;} int value() const{return n;} }; Counter first,second; first.increment(); std::cout << first.value() << " " << second.value() << "\\n";',
 'cpp-raii':'{ std::ofstream file("notes.txt"); if(!file) return 1; file << "Saved"; } std::ifstream file("notes.txt"); std::string line; std::getline(file,line); std::cout << line << "\\n";',
 'cpp-virtual':'struct Animal { virtual ~Animal()=default; virtual int sound() const{return 0;} }; struct Cat : Animal { int sound() const override{return 1;} }; Cat cat; Animal &animal=cat; std::cout << animal.sound() << "\\n";',
 'cpp-vector':'std::vector<int> values{1,2}; values.push_back(3); for(int value:values) std::cout << value << " "; std::cout << "\\n";',
 'cpp-map':'std::map<int,std::string> names; names[1]="Alex"; names[1]="Sam"; std::cout << names.at(1) << "\\n";',
 'cpp-smart':'auto value=std::make_unique<int>(42); auto next=std::move(value); std::cout << *next << " " << (value==nullptr) << "\\n";'
};
export function runnableExample(topic){
 // The lesson deliberately starts with a scope bug; free coding must load its
 // working reference instead of presenting a broken default as a runnable demo.
 if(topic.id==='js-scope')return programmingLessonById['js-scope'].solution;
 const body=bodies[topic.id];
 if(!body)return topic.code;
 const required={
  'c-heap':['stdio.h','stdlib.h'],
  'cpp-class':['iostream'],'cpp-virtual':['iostream'],
  'cpp-raii':['fstream','string','iostream'],
  'cpp-vector':['iostream','vector'],
  'cpp-map':['iostream','map','string'],
  'cpp-smart':['iostream','memory','utility'],
 };
 const headers=(required[topic.id]||['stdio.h']).map(name=>`#include <${name}>`).join('\n');
 return `${headers}\nint main(${topic.language==='c'?'void':''}) {\n  ${body}\n  return 0;\n}`;
}

// Repair only the exact known broken built-in draft; never infer changes to
// arbitrary learner programs or erase their edits.
export function repairBuiltinDraft(language,source){
 if(language!=='cpp'||typeof source!=='string')return source;
 const fixed=runnableExample({id:'cpp-raii',language:'cpp'});
 const broken=fixed.replace('#include <iostream>\n','');
 return source.trim()===broken.trim()?fixed:source;
}
