import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PAL,CAST,BADGES,STAR,BEACON,WORLD,CHAPTER_STORY,chapterScene,worldScene,sprite} from '../public/codequest-story.js';
import {CHAPTERS,BADGE_NAMES} from '../public/codequest-course.js';

const LANGS=['en','zh-CN','zh-TW'];
const allSprites={...Object.fromEntries(Object.entries(CAST).map(([k,v])=>[k,v.rows])),star:STAR,beaconLit:BEACON(true),beaconDark:BEACON(false),...BADGES};

test('every sprite is a clean rectangle that only uses palette colours',()=>{
 for(const [name,rows] of Object.entries(allSprites)){
  assert.ok(rows.length>0,name);
  for(const row of rows){
   assert.equal(row.length,rows[0].length,name+' has a ragged row');
   for(const ch of row)assert.ok(ch==='.'||Object.hasOwn(PAL,ch),name+' uses unknown colour '+ch);
  }
 }
});

test('the unlit beacon only changes the lantern',()=>{
 assert.equal(BEACON(true).length,BEACON(false).length);
 assert.notDeepEqual(BEACON(true),BEACON(false));
 assert.deepEqual(BEACON(true).slice(2),BEACON(false).slice(2));
});

test('the world, its cast and every chapter are told in three languages',()=>{
 for(const key of LANGS){
  assert.ok(WORLD.name[key]&&WORLD.story[key]&&WORLD.won[key],'world '+key);
  for(const [id,member] of Object.entries(CAST))assert.ok(member.name[key]&&member.role[key],id+' '+key);
 }
 for(const chapter of CHAPTERS){
  const story=CHAPTER_STORY[chapter.id];
  assert.ok(story,chapter.id+' needs a story');
  assert.ok(CAST[story.guide],chapter.id+' guide is not in the cast');
  for(const key of LANGS)for(const field of ['place','intro','done'])assert.ok(story[field][key],chapter.id+'.'+field+'.'+key);
 }
});

test('every chapter draws a scene, lit or not, as well-formed SVG',()=>{
 for(const chapter of CHAPTERS){
  for(const done of [false,true]){
   const svg=chapterScene(chapter.id,done,'label');
   assert.match(svg,/^<svg class="quest-scene"[^>]*viewBox="0 0 320 120"/);
   assert.ok(svg.endsWith('</svg>'));
   assert.equal((svg.match(/<g[ >]/g)||[]).length,(svg.match(/<\/g>/g)||[]).length,chapter.id+' has unbalanced groups');
   assert.ok(!svg.includes('NaN')&&!svg.includes('undefined'),chapter.id+' has a bad number');
  }
 }
 assert.notEqual(chapterScene('hello',false,'x'),chapterScene('hello',true,'x'),'finishing a chapter should change its scene');
 assert.match(worldScene(true,'x'),/<\/svg>$/);
 assert.notEqual(worldScene(true,'x'),worldScene(false,'x'));
});

test('badge sprites match the badge names of the course',()=>{
 for(const chapter of CHAPTERS){
  assert.ok(BADGES[chapter.badge],chapter.badge+' has no sprite');
  assert.ok(BADGE_NAMES[chapter.badge],chapter.badge+' has no name');
 }
 assert.match(sprite(allSprites.bit,4),/^<svg/);
});
