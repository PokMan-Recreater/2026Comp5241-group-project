// Bounded local teaching models. No network services, shell commands or model calls.
export const promptCriteria = ['audience','material','format','constraints','example','detail'];
const weights=[15,20,15,15,15,20];
export function promptAnalysis(prompt){
 const raw=String(prompt||'').trim();
 // Ignore labels with no values and common placeholders; the scaffold cannot pass itself.
 const lines=raw.split(/\n/).map(x=>x.replace(/^\s*(?:[-*]|\d+[.)])\s*/,''));
 const content=lines.filter(x=>!/^.{1,45}[:：]\s*(?:\[.*\]|<.*>|TODO|TBD|\.\.\.|…)?\s*$/i.test(x)).join('\n');
 const valueAfter=pattern=>lines.some(line=>{const m=line.match(pattern);if(!m)return false;const v=line.slice(m.index+m[0].length).trim();return v.replace(/\[[^\]]*\]|<[^>]*>|TODO|TBD/gi,'').replace(/[^\p{L}\p{N}]/gu,'').length>=4;});
 const signals=[
  valueAfter(/(?:role|audience|reader|角色|受众|受眾|读者|讀者)\s*[:：]/i)||/(?:for|to) (?:an? |the )?(?:instructor|manager|student|beginner|developer|non-technical)|act as (?:an? )?\w{4,}|面向.{3,}|给.{2,}(?:教师|学生|经理)|給.{2,}(?:教師|學生|經理)/i.test(content),
  valueAfter(/(?:input|source|material|输入|輸入|资料|資料|材料)\s*[:：]/i),
  /(?:json|table|bullet|markdown|表格|项目符号|項目符號)/i.test(content)&&content.replace(/[^\p{L}\p{N}]/gu,'').length>=25,
  valueAfter(/(?:constraints?|must|limit|约束|約束|限制)\s*[:：]/i)||/(?:under|at most|no more than)\s*\d+|do not invent|不得编造|不得編造|不超过\s*\d+|不超過\s*\d+/i.test(content),
  valueAfter(/(?:example|示例|例子|範例)\s*[:：]/i)&&/(?:->|→|=>|input|output|输入|輸入|输出|輸出)/i.test(content),
  content.replace(/[^\p{L}\p{N}]/gu,'').length>=140&&/(?:goal|task|summari[sz]e|write|explain|目标|目標|任务|任務|总结|總結|解释|解釋)/i.test(content)&&/(?:check|verify|test|检查|檢查|验证|驗證|核对|核對)/i.test(content)
 ];
 return {signals,score:signals.reduce((n,x,i)=>n+(x?weights[i]:0),0),weights};
}
export const promptReview=prompt=>promptAnalysis(prompt).signals;
const tokenise=s=>String(s).toLowerCase().match(/[a-z0-9]+|[\u3400-\u9fff]/g)||[];
export function rankDocuments(query,docs,hybrid=false){
 const phrase=String(query||'').trim().toLowerCase(),terms=new Set(tokenise(phrase));
 return docs.map(d=>{const words=new Set(tokenise(d.text)),matched=[...terms].filter(t=>words.has(t));const boost=!!phrase&&terms.size>0&&hybrid&&String(d.text).toLowerCase().includes(phrase)?.3:0;return {...d,matched,score:terms.size?matched.length/Math.sqrt(terms.size*Math.max(words.size,1))+boost:0,phraseBoost:boost};}).sort((a,b)=>b.score-a.score);
}
export function retrieve(query,docs,k=2,hybrid=false){return rankDocuments(query,docs,hybrid).filter(d=>d.score>0).slice(0,Math.max(1,Math.min(5,Number(k)||2)));}
export const initialDocker=()=>({image:false,status:'absent',images:{},containers:{},logs:[]});
export function dockerStep(state,command){
 const s=structuredClone(state),c=String(command).trim(),args=c.split(/\s+/);s.logs??=[];
 // Migrate the earlier fixed-name exercise without discarding its state.
 s.images??=s.image?{forma:{tag:'latest',builds:1}}:{};
 s.containers??=s.status&&s.status!=='absent'?{app:{image:'forma',status:s.status,ports:'',detached:false}}:{};
 let out='';const nameOK=x=>/^[a-zA-Z0-9][\w.:-]{0,63}$/.test(x||'');
 if(c==='clear'){s.logs=[];return s;}
 if(c==='help'||c==='docker help')out='Simulation commands: docker build -t NAME . | images | run [--name NAME] [-d] [-p HOST:CONTAINER] IMAGE | ps [-a] | stop/start/rm NAME | rmi IMAGE | logs NAME | exec NAME COMMAND | help | clear. No real containers are started.';
 else if(args[0]!=='docker')throw new Error('Use help to see the supported simulation commands');
 else {
  const verb=args[1],rest=args.slice(2);
  if(verb==='build'){
   if(rest.length!==3||rest[0]!=='-t'||!nameOK(rest[1])||rest[2]!=='.')throw new Error('Use docker build -t NAME .');
   const name=rest[1],cached=!!s.images[name];s.images[name]={tag:'latest',builds:(s.images[name]?.builds||0)+1};
   out=`[1/4] FROM node:22-alpine — ${cached?'CACHED':'base layer'}\n[2/4] COPY package*.json ./ — ${cached?'CACHED':'dependency input'}\n[3/4] RUN npm ci — ${cached?'CACHED':'install layer'}\n[4/4] COPY . . — ${cached?'CACHED (unchanged simulated context)':'application layer'}\nBuilt ${name}. In a real build, changing a layer invalidates that layer and later layers. This model has a fixed build context.`;
  }else if(verb==='images'&&!rest.length)out=Object.keys(s.images).join('\n')||'No images';
  else if(verb==='run'){
   let name='',image='',ports='',detached=false;
   for(let i=0;i<rest.length;i++){const x=rest[i];if(x==='--name')name=rest[++i];else if(x==='-d')detached=true;else if(x==='-p')ports=rest[++i];else if(x.startsWith('-'))throw new Error('Supported run flags: --name, -d, -p');else if(!image)image=x;else throw new Error('Only one image is accepted');}
   if(!image||!s.images[image])throw new Error('Build this image first');
   if(ports&&!/^\d{1,5}:\d{1,5}$/.test(ports))throw new Error('Port mapping must be HOST:CONTAINER');
   if(ports&&ports.split(':').some(n=>Number(n)<1||Number(n)>65535))throw new Error('Ports must be between 1 and 65535');
   name=name||'container-'+(Object.keys(s.containers).length+1);if(!nameOK(name))throw new Error('Choose a valid container name');if(s.containers[name])throw new Error('Container name already exists');
   if(ports&&Object.values(s.containers).some(x=>x.status==='running'&&x.ports?.split(':')[0]===ports.split(':')[0]))throw new Error('Host port already used by a running container');
   s.containers[name]={image,status:'running',ports,detached};out=`${name} started${ports?' at localhost:'+ports.split(':')[0]:''}${detached?' (detached)':''}. Simulation only.`;
  }else if(verb==='ps'&&(!rest.length||(rest.length===1&&rest[0]==='-a')))out=Object.entries(s.containers).filter(([,x])=>rest[0]==='-a'||x.status==='running').map(([n,x])=>`${n}\t${x.image}\t${x.status}\t${x.ports||'no published port'}`).join('\n')||'No matching containers';
  else if(verb==='rmi'&&rest.length===1){if(!s.images[rest[0]])throw new Error('Image not found');if(Object.values(s.containers).some(x=>x.image===rest[0]))throw new Error('Remove containers using this image first');delete s.images[rest[0]];out='Image removed';}
  else if(['stop','start','rm','logs','exec'].includes(verb)){
   const n=rest[0],x=s.containers[n];if(!x)throw new Error('Container not found');if(verb!=='exec'&&rest.length!==1)throw new Error('Use docker '+verb+' NAME');
   if(verb==='stop'){if(x.status!=='running')throw new Error('Container is not running');x.status='stopped';out=n+' stopped';}
   if(verb==='start'){if(x.status!=='stopped')throw new Error('Container must be stopped first');if(x.ports&&Object.values(s.containers).some(y=>y!==x&&y.status==='running'&&y.ports?.split(':')[0]===x.ports.split(':')[0]))throw new Error('Host port already used');x.status='running';out=n+' started';}
   if(verb==='rm'){if(x.status==='running')throw new Error('Stop the container before removing it');delete s.containers[n];out=n+' removed';}
   if(verb==='logs')out=`[simulated ${n}] Application initialized\n[simulated ${n}] status=${x.status}. Logs remain available after stopping.`;
   if(verb==='exec'){if(x.status!=='running')throw new Error('exec requires a running container');let cmd=rest.slice(1);if(cmd[0]==='-it')throw new Error('Use docker exec NAME node --version');if(!cmd.length)throw new Error('Specify a simulated command');if(cmd.join(' ')==='node --version')out='v22.x (simulated runtime label)';else if(cmd.join(' ')==='pwd')out='/app (simulated working directory)';else throw new Error('This simulation supports exec NAME node --version or exec NAME pwd');}
  }else throw new Error('Unsupported command. Use help.');
 }
 s.image=Object.keys(s.images).length>0;s.status=s.containers.app?.status||Object.values(s.containers)[0]?.status||'absent';s.logs.push('$ '+c+'\n'+out);s.logs=s.logs.slice(-60);return s;
}
export function gradientStep({m=0,b=0,rate=.05,history=[],steps=0},count=1){let loss=0;for(let n=0;n<Math.max(1,Math.min(1000,count));n++){let dm=0,db=0;for(const x of [0,1,2,3,4]){const error=m*x+b-(2*x+1);dm+=2*x*error/5;db+=2*error/5;}m-=rate*dm;b-=rate*db;steps++;loss=[0,1,2,3,4].reduce((sum,x)=>sum+(m*x+b-(2*x+1))**2/5,0);history=[...history,loss].slice(-100);if(!Number.isFinite(loss)||loss>1e12)break;}return {m,b,rate,history,steps,loss,diverged:!Number.isFinite(loss)||loss>1e12};}
const pipelineStages=[['install',null,'npm ci\n42 packages installed from the lockfile.'],['lint','format','src/average.js:4 — missing semicolon.'],['test','edge','average([]): expected 0; received NaN.'],['build','env','Missing PUBLIC_API_ORIGIN; build stopped.'],['deploy',null,'Preview artifact uploaded; smoke check: 200 OK (simulated).']];
export function pipelineResult(fixes=[]){let blocked=false;return pipelineStages.map(([stage,fix,log])=>{const status=blocked?'blocked':!fix||fixes.includes(fix)?'passed':'failed';if(status==='failed')blocked=true;return {stage,fix,status,log:status==='blocked'?'Waiting for preceding stages.':status==='passed'&&fix?`${stage}: repaired; check passed.`:log};});}
export function diagnosePipeline(fixes,choice){const failed=pipelineResult(fixes).find(x=>x.status==='failed');if(!failed)return {fixes:[...fixes],correct:false,message:'All stages already pass. Inspect the deployment smoke check.'};if(choice===failed.fix)return {fixes:[...new Set([...fixes,choice])],correct:true,message:'The cause was repaired. The next stage can now run.'};return {fixes:[...fixes],correct:false,message:choice==='rerun'?'An unchanged rerun reproduces the same defect. Read the first failing log.':choice==='expectation'?'Changing the expected result hides the empty-input defect. Keep the contract and fix the function.':'That change does not address the first failing log. Fix one cause at a time.'};}
