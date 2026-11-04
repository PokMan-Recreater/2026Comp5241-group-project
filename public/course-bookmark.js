import {local,tri} from './i18n.js';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function courseBookmarkButton(id,saved=false,locale='zh-CN',meta={}){
 const label=local(saved?tri('Saved course','已收藏课程','已收藏課程'):tri('Save course','收藏课程','收藏課程'),locale);
 return `<button type="button" class="btn secondary small-btn course-bookmark" data-ac="bookmark" data-key="course:${esc(id)}" data-title="${esc(meta.title||'')}" data-route="${esc(meta.route||'')}" aria-pressed="${saved}" aria-label="${label}" title="${label}"><span aria-hidden="true">${saved?'★':'☆'}</span></button>`;
}
