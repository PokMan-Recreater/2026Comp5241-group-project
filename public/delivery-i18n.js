import traditional from './delivery-traditional.js';
export function lessonText(lang,zh,en){return lang==='en'?en:lang==='zh-TW'?(traditional[zh]??zh):zh;}
export const lessonLanguages={'zh-CN':'简体中文','zh-TW':'繁體中文',en:'English'};
