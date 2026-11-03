// Scene identifiers shared by the course validator and the AI response checker.
// public/teaching-scene-catalog.js keeps the learner-facing descriptions; a test
// asserts both lists stay in sync.
export const SCENE_IDS=['auto','flow','compare','timeline','cycle','layers','hub','decision','balance','network','chain','conversation','phone','document','database','robot'];
export const isScene=value=>SCENE_IDS.includes(value);
// Each template draws a fixed number of slots. Extra labels are silently dropped
// by the renderer, so validation rejects them instead.
export const SCENE_CAPACITY={
 auto:{min:1,max:5},flow:{min:2,max:5},compare:{min:2,max:2},timeline:{min:2,max:5},
 cycle:{min:2,max:5},layers:{min:2,max:4},hub:{min:2,max:5},decision:{min:2,max:4},
 balance:{min:2,max:2},network:{min:2,max:5},chain:{min:2,max:4},conversation:{min:2,max:5},
 phone:{min:2,max:5},document:{min:2,max:3},database:{min:2,max:3},robot:{min:2,max:5}
};
export const sceneCapacity=scene=>SCENE_CAPACITY[scene]||SCENE_CAPACITY.auto;
export const itemsFitScene=(scene,count)=>count>=sceneCapacity(scene).min&&count<=sceneCapacity(scene).max;
