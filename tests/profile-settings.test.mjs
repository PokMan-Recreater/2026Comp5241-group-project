import {test} from 'node:test';
import assert from 'node:assert/strict';
import {updatedProfile,lessonReadingDepth,defaultCourseLevel,profileSettingsHTML,experienceFraming} from '../public/profile-settings.js';

const profile={name:'Alex',background:'someCoding',goal:'build',depth:'advanced',weeklyMinutes:120,interests:['architecture'],learningLanguage:'zh-TW',audience:'non-cs'};
function form(values){const f=new FormData();for(const [k,v] of Object.entries(values))for(const x of Array.isArray(v)?v:[v])f.append(k,String(x));return f;}

test('profile saving updates background and language without changing plan difficulty or time',()=>{
 const saved=updatedProfile({...profile,skillLevel:'intermediate'},form({name:' Alex ',background:'someCoding',goal:'career',skillLevel:'advanced',weeklyMinutes:'180',learningLanguage:'zh-TW'}),'learner');
 assert.equal(saved.skillLevel,'intermediate');assert.equal(saved.depth,profile.depth);assert.equal(saved.weeklyMinutes,profile.weeklyMinutes);assert.equal(saved.learningLanguage,'zh-TW');assert.deepEqual(saved.interests,profile.interests);assert.equal(saved.audience,'cs');assert.equal(saved.goal,'career');assert.equal(profile.goal,'build');
});

test('personal settings for staff change only the name and preserve all learning preferences',()=>{
 for(const role of ['instructor','admin'])assert.deepEqual(updatedProfile(profile,form({name:'Teacher',skillLevel:'beginner',interests:[]}),role),{...profile,name:'Teacher'});
 assert.throws(()=>updatedProfile(profile,form({name:'  '}),'learner'));
});

test('legacy defaults remain readable and per-course reading overrides do not change default difficulty',()=>{
 assert.equal(defaultCourseLevel(profile),'advanced');
 const defaults={...profile,skillLevel:'intermediate'};
 const academy={lessonDepths:{development:'advanced'}};
 assert.equal(lessonReadingDepth(defaults,academy,'development'),'advanced');assert.equal(lessonReadingDepth(defaults,academy,'requirements'),'beginner');assert.equal(defaultCourseLevel(defaults),'intermediate');
});

test('profiles omit plan difficulty and time while staff see only basic information in every language',()=>{
 for(const lang of ['en','zh-CN','zh-TW']){
  const html=profileSettingsHTML({...profile,skillLevel:'intermediate'},'learner',lang,[]);
  assert.match(html,/name="learningLanguage"/);assert.doesNotMatch(html,/name="(?:depth|skillLevel|weeklyMinutes)"/);assert.doesNotMatch(html,/profile-more|name="(?:audience|interests)"/);
  for(const role of ['instructor','admin']){const staff=profileSettingsHTML(profile,role,lang,[]);assert.match(staff,/name="name"/);assert.doesNotMatch(staff,/name="(?:skillLevel|background|weeklyMinutes|learningLanguage|interests)"/);}
 }
 const escaped=profileSettingsHTML({...profile,name:'<img src=x onerror=alert(1)>'},'learner','en',[]);assert.doesNotMatch(escaped,/<img/);
});

test('experience controls framing even when a legacy manual selection conflicts',()=>{
 assert.equal(experienceFraming({background:'noCoding',audience:'cs'}),'non-cs');
 for(const background of ['someCoding','experienced'])assert.equal(experienceFraming({background,audience:'non-cs'}),'cs');
});
