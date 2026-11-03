import {test} from 'node:test';
import assert from 'node:assert/strict';
import {allLessons} from '../public/all-lessons.js';
import {kit,speechLines} from '../public/lesson-art-kit.js';
test('every animation frame renders valid finite SVG geometry in all three languages',()=>{
 for(const lesson of allLessons)for(const step of lesson.steps)for(const lang of ['zh-CN','zh-TW','en'])for(const p of [0,.25,.5,.75,1]){
  const svg=step.art(p,lang);assert.match(svg,/viewBox="0 0 720 360"/);assert.doesNotMatch(svg,/NaN|undefined|Infinity/,lesson.id+' '+step.title);assert.equal((svg.match(/<g(?:\s|>)/g)||[]).length,(svg.match(/<\/g>/g)||[]).length,lesson.id);
 }
});
test('long speech wraps without losing words and short labels stay on one line',()=>{
 const text='Duplicate submits are blocked by the service',lines=speechLines(text,242);assert(lines.length>1);assert.equal(lines.join(' '),text);assert.deepEqual(speechLines('Run checks',200),['Run checks']);
 const svg=kit(1,'en').speech(0,0,200,'占位','I worry about holding a seat unused');assert.match(svg,/<tspan/);assert(svg.includes('dominant-baseline="middle"'));
});
test('shared row portraits leave room for the next portrait, and large documents have no decorative text rules',()=>{
 const portrait=kit(1,'en').face(66,54,'#bad7c2');assert.match(portrait,/height="28"/);assert(54+24+28<134-21);
 const small=kit(1,'en').doc(0,0),large=kit(1,'en').doc(0,0,'#fffefb',160,150);assert(small.includes('M10 28'));assert(!large.includes('M10 28'));
});
