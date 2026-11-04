import {lessonSlides} from './teaching-slides.js';
import {sceneIds,selectScene} from './teaching-scene-catalog.js';
const trimHeading=value=>String(value||'').replace(/[。！？!?].*$/,'').trim();
const placeholders=new Set(['开始','開始','结果','結果','Start','Outcome']);

// Choose the illustration template and scene labels from the lesson content so
// authors never pick them by hand. AI suggestions can still supply their own.
export function autoScene(lesson){
 const body=String(lesson?.body||''),text=`${body} ${String(lesson?.title||'')}`;
 let scene=selectScene(lesson);
 if(/时间线|時間線|阶段|階段|第一步|随后|隨後|里程碑|timeline|phase|milestone/i.test(text))scene='timeline';
 else if(/对比|對比|相比|区别|區別|优点|優點|缺点|缺點|取舍|取捨|versus|compare|trade-?off/i.test(text))scene='compare';
 const items=[];
 for(const slide of lessonSlides(body)){
  const heading=trimHeading(slide.heading);
  if(heading&&!items.includes(heading))items.push(Array.from(heading).slice(0,12).join(''));
  if(items.length>=5)break;
 }
 return {scene,sceneItems:items};
}
export function ensureScene(lesson){
 const items=Array.isArray(lesson?.sceneItems)?lesson.sceneItems.map(String).filter(item=>item.trim()):[];
 const placeholderOnly=items.length<=2&&items.every(item=>placeholders.has(item.trim()));
 const validScene=sceneIds.includes(lesson?.scene);
 if(validScene&&items.length>=2&&!placeholderOnly)return lesson;
 const auto=autoScene(lesson);
 const sceneItems=auto.sceneItems.length>=2?auto.sceneItems:items.length>=2?items:['开始','结果'];
 return {...lesson,scene:auto.scene,sceneItems};
}
