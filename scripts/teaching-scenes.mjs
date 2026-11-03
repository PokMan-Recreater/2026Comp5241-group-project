// Scene identifiers shared by the course validator and the AI response checker.
// public/teaching-scene-catalog.js keeps the learner-facing descriptions; a test
// asserts both lists stay in sync.
export const SCENE_IDS=['auto','flow','compare','timeline','cycle','layers','hub','decision','balance','network','chain','conversation','phone','document','database','robot'];
export const isScene=value=>SCENE_IDS.includes(value);
