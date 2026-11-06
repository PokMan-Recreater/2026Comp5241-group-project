import {diversifyLessonScenes, normalizeLesson, strings} from './course-ai-shape.mjs';

const labels = {
 en: {
  headings: ['Learning goals', 'Lesson outline', 'Worked example', 'Check your understanding'],
  goals: ['Identify the main idea.', 'Explain it using an example.'],
  example: 'Add a concrete example showing the situation, what changes, and the result.',
  check: 'Explain the main idea in your own words. What would change in a different example?',
 },
 'zh-CN': {
  headings: ['学习目标', '本节大纲', '案例练习', '理解检查'],
  goals: ['识别本节的核心概念。', '尝试用一个例子解释它。'],
  example: '补充一个具体案例，说明初始情况、发生的变化和结果。',
  check: '用自己的话解释核心概念。换一个情境，结果会怎样变化？',
 },
 'zh-TW': {
  headings: ['學習目標', '本節大綱', '案例練習', '理解檢查'],
  goals: ['識別本節的核心概念。', '嘗試用一個例子解釋它。'],
  example: '補充一個具體案例，說明初始情況、發生的變化和結果。',
  check: '用自己的話解釋核心概念。換一個情境，結果會怎樣變化？',
 },
};

export function lessonDraftFromOutline(lesson, topic, language) {
 const copy = labels[language];
 const title = (typeof lesson?.title === 'string' && lesson.title.trim() || topic.trim()).slice(0, 180);
 const outline = typeof lesson?.body === 'string' ? lesson.body.trim().slice(0, 18000) : '';
 const objectives = strings(lesson?.objectives, 2, 3, 120) ? lesson.objectives : copy.goals;
 const summary = (outline || title).slice(0, 200).trim();
 const sections = [objectives, [summary], [copy.example], [copy.check]];
 const slides = copy.headings.map((heading, index) => ({
  heading,
  concept: title.slice(0, 120),
  bullets: sections[index],
  script: sections[index],
  art: {scene: 'flow', items: [title.slice(0, 60), heading]},
 }));
 return diversifyLessonScenes(normalizeLesson({
  id: typeof lesson?.id === 'string' && lesson.id.trim() ? lesson.id.slice(0, 80) : 'lesson-1',
  title, objectives, body: outline || title, slides,
  scene: 'flow', sceneItems: slides[0].art.items, questions: [],
 }));
}
