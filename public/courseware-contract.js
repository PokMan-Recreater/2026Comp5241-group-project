export const MIN_GENERATED_SLIDES=4;
export const MAX_GENERATED_SLIDES=8;
const nonempty=value=>typeof value==='string'&&!!value.trim();
// A planning summary is never playable courseware. Both API and editor use
// this gate before offering a newly generated lesson for acceptance.
export function hasCompleteCourseware(lesson){
 return Array.isArray(lesson?.slides)&&lesson.slides.length>=MIN_GENERATED_SLIDES&&lesson.slides.length<=MAX_GENERATED_SLIDES&&lesson.slides.every(s=>
  s&&nonempty(s.heading)&&nonempty(s.concept)&&Array.isArray(s.bullets)&&s.bullets.length>0&&s.bullets.every(nonempty)&&
  Array.isArray(s.script)&&s.script.length>0&&s.script.every(nonempty)&&s.art&&nonempty(s.art.scene)&&Array.isArray(s.art.items)&&s.art.items.length>0&&s.art.items.every(nonempty));
}

// Hand-authored lessons only need one playable slide, not the AI minimum, so
// narration and publishing accept a short manual deck as well.
export function isNarratableLesson(lesson){
 return Array.isArray(lesson?.slides)&&lesson.slides.length>0&&lesson.slides.every(s=>
  s&&nonempty(s.heading)&&Array.isArray(s.bullets)&&s.bullets.length>0&&s.bullets.every(nonempty)&&
  s.art&&nonempty(s.art.scene)&&Array.isArray(s.art.items)&&s.art.items.length>0&&s.art.items.every(nonempty));
}

// Manual slides may omit the spoken script; the key points are read in that case.
export const narrationScriptText=slide=>(slide.script?.length?slide.script:slide.bullets||[]).map(line=>String(line).trim()).join(' ').trim();
