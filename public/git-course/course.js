// Runs a lesson or the project: owns the simulated computer, checks the
// current task after every command (or editor save / GitHub action) and
// advances, firing teammate events when a step or stage completes.
import {basics} from './lessons-basics.js';
import {branching} from './lessons-branch.js';
import {remote} from './lessons-remote.js';
import {project,projectApi} from './project.js';
import {makeCtx,finishSetup,t,ALEX} from './kit.js';
import {run} from '../git-engine/shell.js';

/** @type {{id:string,title:any,lessons:any[]}[]} */
export const GROUPS=[
 {id:'basics',title:t('Getting started','基础操作'),lessons:basics},
 {id:'branching',title:t('Branches and history','分支与历史'),lessons:branching},
 {id:'remote',title:t('Working with GitHub','与 GitHub 协作'),lessons:remote},
 {id:'project',title:t('Final project','综合项目'),lessons:[project]},
];
/** @type {any[]} */
export const LESSONS=GROUPS.flatMap(g=>g.lessons);
export const lessonById=id=>LESSONS.find(l=>l.id===id)||null;

/** Steps in order: lessons have tasks; the project has stages of steps. */
export function stepsOf(lesson){
 if(!lesson.stages)return lesson.tasks.map((s,i)=>({...s,stage:null,index:i}));
 return lesson.stages.flatMap((st,si)=>st.steps.map((s,i)=>({...s,stage:si,index:i})));
}

/** A fresh run of a lesson: the computer, the terminal and progress. */
export function startLesson(id){
 const lesson=lessonById(id);
 const made=lesson.setup();
 const world=made.world;
 if(world.clock.fixed!=null)finishSetup(world);
 world.cwd=made.cwd||world.home;
 const state={v:2,id,world,step:0,log:[],since:0,feed:[],term:[],open:made.open?world.cwd+'/'+made.open:null,github:!!made.github,done:false,startedStages:[]};
 enterStage(state);
 return state;
}
function notifier(state){
 return ev=>{
  if(ev.type==='push')state.feed.push({who:ev.who,kind:'push',text:{en:`pushed "${ev.message}" to ${ev.branch}`,zh:`向 ${ev.branch} 推送了 "${ev.message}"`}});
  else state.feed.push({who:ev.who,kind:'say',text:ev.text});
 };
}
function enterStage(state){
 const lesson=lessonById(state.id);if(!lesson.stages)return;
 const step=stepsOf(lesson)[state.step];if(!step)return;
 if(state.startedStages.includes(step.stage))return;
 state.startedStages.push(step.stage);
 const st=lesson.stages[step.stage];
 st.start?.(state.world,projectApi(state.world,notifier(state)));
}
/** Checks the current step (and following ones a single command may have finished). Returns completed steps. */
export function evaluate(state){
 const lesson=lessonById(state.id),steps=stepsOf(lesson),finished=[];
 while(!state.done&&state.step<steps.length){
  const step=steps[state.step];
  let ok;
  try{ok=!!step.check(makeCtx(state.world,state.log,state.since));}catch(e){console.warn('[git-course] check failed',e);ok=false;}
  if(!ok)break;
  finished.push(step);
  try{step.done?.(state.world,projectApi(state.world,notifier(state)));}catch(e){console.warn(e);}
  state.step++;
  // the command that finished this step may also finish the next one
  state.since=Math.max(0,state.log.length-1);
  if(state.step>=steps.length){state.done=true;break;}
  enterStage(state);
 }
 return finished;
}
/** Runs a command line typed in the terminal. */
export function command(state,line){
 const res=run(state.world,line);
 state.log.push({line:String(line).trim(),code:res.code});
 if(state.log.length>400){const cut=state.log.length-400;state.log=state.log.slice(cut);state.since=Math.max(0,state.since-cut);}
 return res;
}
/** Pull requests opened from the GitHub tab are reviewed by Alex straight away. */
export function reviewPullRequest(state,pr){
 pr.reviews.push({by:ALEX.name,login:ALEX.login,state:'approved',body:{en:'Looks good to me — approved.',zh:'看起来没问题，批准。'}});
 state.feed.push({who:ALEX.name,kind:'say',text:{en:`Approved pull request #${pr.number}: ${pr.title}`,zh:`批准了 Pull Request #${pr.number}：${pr.title}`}});
}
export {stepsOf as steps};
