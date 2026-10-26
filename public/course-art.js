// Self-hosted course cover artwork for the Forma catalogue.
// Every course has its own flat vector motif, drawn with the same stroke weight,
// corner radii and palette as the original covers, so the grid keeps one style.
// `courseArt` keeps the old theme-based covers as a fallback for courses that are
// created inside the browser (self-study) and therefore have no artwork here.

const C = {
  ink: '#050038',
  accent: '#ffd02f',
  accentInk: '#746019',
  page: '#ffffff',
  edge: '#b9afe8',
  line: '#ded9ff',
  wash: '#e4ddff',
  washLight: '#d5ceff',
  purple: '#7864be',
  mute: '#605a8a',
  curve: '#6253a0'
};

/** Rounded "sheet of paper" used as the base of most covers. */
const sheet = (x, y, w, h, r = 10) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${C.page}" stroke="${C.edge}" stroke-width="1.5"/>`;

/** Short rounded bar, used for text lines and table rows. */
const bar = (x, y, w, stroke = C.line, width = 4) =>
  `<path d="M${x} ${y}h${w}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>`;

/** Tick mark, used for checklists and completed stages. */
const tick = (x, y, stroke = C.purple, width = 3) =>
  `<path d="m${x} ${y} 4 5 9-10" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;

/** Empty checkbox, used for the part of a scope that is not included. */
const box = (x, y, s = 15) =>
  `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="4" fill="none" stroke="${C.line}" stroke-width="2"/>`;

/** Four-point sparkle, the accent used for AI-flavoured covers. */
const spark = (x, y, size = 9) =>
  `<path d="M${x} ${y - size}l${size * 0.38} ${size * 0.92} ${size * 0.92} ${size * 0.38}-${size * 0.92} ${size * 0.38}-${size * 0.38} ${size * 0.92}-${size * 0.38}-${size * 0.92}-${size * 0.92}-${size * 0.38} ${size * 0.92}-${size * 0.38}z" fill="${C.accent}"/>`;

/** Window title bar with three dots. */
const titleBar = (x, y, w) =>
  `<path d="M${x} ${y}h${w}" stroke="${C.line}" stroke-width="2"/>` +
  [[x + 12, y - 9], [x + 21, y - 9], [x + 30, y - 9]].map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="2.5" fill="${C.washLight}"/>`).join('');

const ART = {
  // Brief → build → release: three stage cards joined by a rail.
  development: `<g transform="rotate(-5 120 62)">
   ${sheet(28, 20, 184, 84)}
   ${titleBar(28, 36, 184)}
   ${bar(44, 62, 152)}
   <rect x="38" y="46" width="34" height="30" rx="6" fill="${C.wash}"/>
   ${bar(46, 56, 18, C.purple, 2.5)}${bar(46, 64, 18, C.purple, 2.5)}${bar(46, 72, 10, C.purple, 2.5)}
   <rect x="103" y="46" width="34" height="30" rx="6" fill="${C.accent}"/>
   <path d="m112 56-5 7 5 7m16-14 5 7-5 7" fill="none" stroke="${C.ink}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
   <rect x="168" y="46" width="34" height="30" rx="6" fill="${C.wash}"/>
   <path d="M178 53v17" stroke="${C.purple}" stroke-width="2" stroke-linecap="round"/>
   <path d="M178 54h11l-3 4.5 3 4.5h-11z" fill="${C.purple}"/>
  </g>`,

  // Stakeholder interviews: two speech bubbles above a captured requirements list.
  requirements: `<g transform="rotate(-4 112 60)">
   ${sheet(18, 14, 134, 50, 14)}
   ${bar(32, 32, 104)}${bar(32, 46, 72)}
   <path d="M50 62h18l-9 17z" fill="${C.page}" stroke="${C.edge}" stroke-width="1.5"/>
   ${sheet(58, 78, 156, 38, 9)}
   ${tick(74, 88)}${bar(96, 92, 44)}
   ${tick(74, 102)}${bar(96, 106, 30)}
   ${box(148, 96)}
   ${bar(174, 103, 28)}
  </g>
  <circle cx="186" cy="30" r="18" fill="${C.accent}"/>
  <path d="M180 24a6.5 6.5 0 1 1 6.5 6.5V34" fill="none" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="186" cy="38" r="1.9" fill="${C.ink}"/>`,

  // Three tiers: browser, application, data store.
  architecture: `<g transform="rotate(-5 120 62)">
   ${sheet(60, 12, 120, 30, 7)}
   ${bar(74, 22, 48)}${bar(74, 32, 32)}
   <path d="M120 44v9m-4-4 4 4 4-4" fill="none" stroke="${C.mute}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
   <rect x="60" y="54" width="120" height="30" rx="7" fill="${C.accent}"/>
   <path d="m78 66-5 7 5 7m16-14 5 7-5 7" fill="none" stroke="${C.ink}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="M120 86v7m-4-4 4 4 4-4" fill="none" stroke="${C.mute}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="M84 98h72v13a9 9 0 0 1-9 9H93a9 9 0 0 1-9-9z" fill="${C.page}" stroke="${C.edge}" stroke-width="1.5"/>
   <ellipse cx="120" cy="98" rx="36" ry="7" fill="${C.wash}" stroke="${C.edge}" stroke-width="1.5"/>
   <path d="M98 110h44" stroke="${C.line}" stroke-width="3.5" stroke-linecap="round"/>
  </g>`,

  // An assistant beside the code: editor window, sparkle and a chat bubble.
  'ai-coding': `<g transform="rotate(-5 112 60)">
   ${sheet(20, 16, 150, 76)}
   ${titleBar(20, 32, 150)}
   <path d="m46 50-6 8 6 8" fill="none" stroke="${C.purple}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
   ${bar(62, 56, 32)}
   ${bar(46, 72, 74)}
   ${bar(46, 84, 50)}
  </g>
  <g transform="rotate(7 196 78)">
   <rect x="164" y="52" width="64" height="46" rx="13" fill="${C.accent}"/>
   <path d="M178 72h36M178 84h22" stroke="${C.ink}" stroke-width="3.2" stroke-linecap="round"/>
  </g>
  ${spark(200, 22, 10)}`,

  // Test, investigate, ship: checklist with a passing check and an open incident.
  'testing-release': `<g transform="rotate(-5 110 62)">
   ${sheet(22, 20, 150, 88, 10)}
   <rect x="88" y="12" width="38" height="14" rx="6" fill="${C.page}" stroke="${C.edge}" stroke-width="1.5"/>
   ${tick(40, 50)}${bar(62, 54, 90)}
   ${tick(40, 70)}${bar(62, 74, 62)}
   ${box(34, 82)}${bar(62, 90, 76)}
  </g>
  <g transform="rotate(8 196 68)">
   <path d="M198 38l26 46h-52z" fill="${C.accent}"/>
   <path d="M198 54v13" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/>
   <circle cx="198" cy="72" r="2" fill="${C.ink}"/>
  </g>`,

  // Scope decisions: items kept, an item cut, and the team around them.
  'product-decisions': `<g transform="rotate(-5 108 62)">
   ${sheet(18, 22, 148, 84, 10)}
   <path d="M18 44h148" stroke="${C.line}" stroke-width="2"/>
   ${bar(34, 34, 68, C.washLight, 5)}
   ${tick(34, 58)}${bar(56, 62, 84)}
   ${tick(34, 76)}${bar(56, 80, 58)}
   ${box(30, 88)}
   <path d="m35 93 10 10m10-10-10 10" stroke="${C.line}" stroke-width="2" stroke-linecap="round"/>
   ${bar(56, 96, 66)}
  </g>
  <g transform="rotate(6 196 60)">
   <circle cx="178" cy="44" r="15" fill="${C.accent}"/>
   <circle cx="178" cy="39" r="5" fill="${C.ink}"/>
   <path d="M166 56c0-6.6 5.4-10 12-10s12 3.4 12 10" fill="${C.ink}"/>
   <circle cx="206" cy="74" r="12" fill="${C.wash}" stroke="${C.edge}" stroke-width="1.5"/>
   <circle cx="206" cy="70" r="4" fill="${C.mute}"/>
   <path d="M196 82c0-5.5 4.5-8.4 10-8.4s10 2.9 10 8.4" fill="${C.mute}"/>
  </g>`,

  // Technical interview: a candidate badge beside an open question.
  career: `<g transform="rotate(-5 110 58)">
   ${sheet(18, 12, 146, 62, 14)}
   ${bar(32, 30, 116)}${bar(32, 44, 82)}${bar(32, 58, 98)}
   <path d="M58 72h20l-11 19z" fill="${C.page}" stroke="${C.edge}" stroke-width="1.5"/>
  </g>
  <g transform="rotate(7 194 68)">
   <circle cx="194" cy="60" r="23" fill="${C.accent}"/>
   <circle cx="194" cy="52" r="7.5" fill="${C.ink}"/>
   <path d="M176 78c0-9.4 8-15 18-15s18 5.6 18 15" fill="${C.ink}"/>
  </g>
  ${spark(206, 20, 9)}`,

  // A first look at AI tools: tool box plus a magnifier over the result.
  'ai-toolkit': `<g transform="rotate(-5 108 66)">
   ${sheet(20, 40, 148, 62, 8)}
   <path d="M70 40v-7a5 5 0 0 1 5-5h48a5 5 0 0 1 5 5v7" fill="none" stroke="${C.edge}" stroke-width="2.5"/>
   <rect x="32" y="54" width="26" height="22" rx="4" fill="${C.wash}"/>
   <rect x="66" y="54" width="26" height="22" rx="4" fill="${C.accent}"/>
   <rect x="100" y="54" width="26" height="22" rx="4" fill="${C.wash}"/>
   <rect x="134" y="54" width="20" height="22" rx="4" fill="${C.wash}"/>
   <rect x="84" y="32" width="40" height="8" rx="4" fill="${C.washLight}"/>
  </g>
  <g transform="rotate(7 190 40)">
   <circle cx="180" cy="34" r="16" fill="${C.page}" stroke="${C.mute}" stroke-width="2.5"/>
   <path d="m192 46 11 11" stroke="${C.mute}" stroke-width="3.5" stroke-linecap="round"/>
   ${spark(180, 34, 7)}
  </g>`,

  // Commit history: a branch that diverges and then merges back into main.
  'git-essentials': `<g transform="rotate(-4 118 62)">
   <path d="M30 48h176" stroke="${C.line}" stroke-width="3" stroke-linecap="round"/>
   <path d="M96 48c10 6 16 20 34 26h54" fill="none" stroke="${C.purple}" stroke-width="2.6" stroke-linecap="round"/>
   <path d="M184 74c14 0 18-14 12-24" fill="none" stroke="${C.purple}" stroke-width="2.6" stroke-linecap="round"/>
   <circle cx="42" cy="48" r="9" fill="${C.accent}"/>
   <circle cx="96" cy="48" r="9" fill="${C.accent}"/>
   <circle cx="150" cy="48" r="9" fill="${C.page}" stroke="${C.purple}" stroke-width="2.6"/>
   <circle cx="196" cy="48" r="9" fill="${C.page}" stroke="${C.purple}" stroke-width="2.6"/>
   <circle cx="130" cy="74" r="9" fill="${C.page}" stroke="${C.purple}" stroke-width="2.6"/>
   <circle cx="184" cy="74" r="9" fill="${C.page}" stroke="${C.purple}" stroke-width="2.6"/>
  </g>`,

  // A precise data question: rows, a filter funnel and a stored table.
  'data-sql': `<g transform="rotate(-4 116 62)">
   ${sheet(20, 14, 120, 44, 8)}
   ${bar(32, 28, 96)}${bar(32, 40, 62)}${bar(32, 52, 78)}
   <path d="M20 58h120l-34 34H54z" fill="${C.accent}" opacity=".95"/>
   ${bar(58, 72, 44, C.ink, 3)}${bar(58, 82, 26, C.ink, 3)}
   <path d="M148 40h66v48a11 11 0 0 1-11 11h-44a11 11 0 0 1-11-11z" fill="${C.page}" stroke="${C.edge}" stroke-width="1.6"/>
   <ellipse cx="181" cy="40" rx="33" ry="9" fill="${C.wash}" stroke="${C.edge}" stroke-width="1.6"/>
   ${bar(165, 68, 32)}${bar(165, 82, 22)}
  </g>`,

  // Image to service: stacked layers leaving the build stage and running.
  'docker-containers': `<g transform="rotate(-5 112 62)">
   ${sheet(20, 30, 148, 76, 10)}
   <rect x="34" y="72" width="42" height="24" rx="5" fill="${C.wash}" stroke="${C.edge}" stroke-width="1.4"/>
   <rect x="86" y="72" width="42" height="24" rx="5" fill="${C.accent}"/>
   <path d="M34 58h120" stroke="${C.line}" stroke-width="3" stroke-linecap="round"/>
   <path d="m98 36 14 6-14 6z" fill="${C.purple}"/>
   <path d="M52 44h34" stroke="${C.purple}" stroke-width="3" stroke-linecap="round"/>
  </g>
  <g transform="rotate(8 196 60)">
   <circle cx="196" cy="60" r="22" fill="${C.page}" stroke="${C.purple}" stroke-width="2.5"/>
   ${tick(187, 57)}
  </g>`,

  // Read the failure, fix the cause: a looping pipeline of stage checks.
  'cicd-pipelines': `<g transform="rotate(-4 118 62)">
   <circle cx="118" cy="62" r="46" fill="none" stroke="${C.line}" stroke-width="3" stroke-dasharray="9 8"/>
   <circle cx="118" cy="16" r="12" fill="${C.accent}"/>
   ${tick(112, 14)}
   <circle cx="164" cy="62" r="12" fill="${C.page}" stroke="${C.purple}" stroke-width="2.4"/>
   <path d="m159 57 5 5 9-10" fill="none" stroke="${C.purple}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
   <circle cx="118" cy="108" r="12" fill="${C.page}" stroke="${C.purple}" stroke-width="2.4"/>
   <path d="m113 103 5 5 9-10" fill="none" stroke="${C.purple}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
   <circle cx="72" cy="62" r="12" fill="${C.page}" stroke="${C.purple}" stroke-width="2.4"/>
   <path d="m66 57 12 12m0-12-12 12" fill="none" stroke="${C.purple}" stroke-width="2.4" stroke-linecap="round"/>
  </g>`,

  // Prompts you can test: a structured prompt card checked against a target.
  'prompt-engineering': `<g transform="rotate(-5 108 62)">
   ${sheet(18, 18, 146, 78, 10)}
   <circle cx="36" cy="42" r="4" fill="${C.washLight}"/>${bar(48, 42, 94)}
   <circle cx="36" cy="60" r="4" fill="${C.washLight}"/>${bar(48, 60, 70)}
   <circle cx="36" cy="78" r="4" fill="${C.washLight}"/>${bar(48, 78, 82)}
  </g>
  <g transform="rotate(8 198 62)">
   <circle cx="198" cy="62" r="23" fill="${C.page}" stroke="${C.purple}" stroke-width="2.6"/>
   <circle cx="198" cy="62" r="13" fill="none" stroke="${C.line}" stroke-width="2.6"/>
   ${tick(191, 59)}
  </g>
  ${spark(206, 20, 9)}`,

  // Build around a request: retrieval sheets feeding a model and returning.
  'llm-apps': `<g transform="rotate(-4 118 62)">
   ${sheet(16, 30, 60, 54, 9)}
   ${bar(28, 48, 36)}${bar(28, 60, 24)}${bar(28, 70, 30)}
   <path d="M84 55h30m-6-5 6 5-6 5" fill="none" stroke="${C.mute}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
   <circle cx="150" cy="62" r="30" fill="${C.accent}"/>
   <circle cx="150" cy="62" r="13" fill="${C.page}"/>
   <path d="m144 62 4 5 8-9" fill="none" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="M182 62h32m-6-5 6 5-6 5" fill="none" stroke="${C.mute}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
   <g transform="rotate(-7 176 96)">
    <rect x="150" y="86" width="52" height="26" rx="5" fill="${C.wash}" stroke="${C.edge}" stroke-width="1.4"/>
    ${bar(160, 96, 32)}${bar(160, 104, 20)}
   </g>
  </g>`,

  // Fit, check, question: a loss curve that settles as it converges.
  'ml-foundations': `<g transform="rotate(-4 120 62)">
   ${spark(196, 30, 11)}
   <path d="M28 16v96h182" fill="none" stroke="${C.line}" stroke-width="3" stroke-linecap="round"/>
   <path d="M42 32C70 44 92 72 126 84c22 7 44 3 62-6" fill="none" stroke="${C.curve}" stroke-width="4" stroke-linecap="round"/>
   <path d="M28 46h182" fill="none" stroke="${C.washLight}" stroke-width="2.5" stroke-dasharray="7 6"/>
   <circle cx="42" cy="32" r="5" fill="${C.curve}"/>
   <circle cx="126" cy="84" r="5" fill="${C.curve}"/>
   <circle cx="188" cy="78" r="5" fill="${C.curve}"/>
  </g>`,

  // From a script to a small data job: code plus its checked output.
  'python-first-steps': `<g transform="rotate(-4 112 58)">
   ${sheet(18, 12, 128, 62, 9)}
   <path d="M32 30h26" stroke="${C.purple}" stroke-width="3.5" stroke-linecap="round"/>
   <path d="M64 30h20" stroke="${C.line}" stroke-width="3.5" stroke-linecap="round"/>
   <path d="M44 44h30" stroke="${C.line}" stroke-width="3.5" stroke-linecap="round"/>
   <path d="M32 58h24" stroke="${C.purple}" stroke-width="3.5" stroke-linecap="round"/>
   <path d="M62 58h42" stroke="${C.line}" stroke-width="3.5" stroke-linecap="round"/>
  </g>
  <g transform="rotate(6 176 88)">
   <rect x="108" y="62" width="118" height="52" rx="9" fill="${C.accent}"/>
   <path d="M124 78l13 8-13 8z" fill="${C.ink}"/>
   ${bar(146, 86, 52, C.ink, 3.4)}${bar(146, 100, 34, C.ink, 3.4)}
  </g>`
};

// Original generic covers, still used for course ids without bespoke artwork.
const FALLBACK = {
  lavender: `<g transform="rotate(-5 120 65)"><rect x="38" y="13" width="165" height="104" rx="7" fill="#fff" stroke="#d5ceff"/><g fill="#d5ceff"><circle cx="51" cy="25" r="2"/><circle cx="59" cy="25" r="2"/><circle cx="67" cy="25" r="2"/></g><path d="m73 48-13 13 13 13m91-26 13 13-13 13m-39-29-15 34" stroke="#7864be" stroke-width="3" stroke-linecap="round"/><path d="M58 95h86" stroke="#ded9ff" stroke-width="4" stroke-linecap="round"/></g><rect x="161" y="86" width="49" height="25" rx="5" fill="#ffd02f"/><path d="m178 98 5 5 11-12" stroke="#050038" stroke-width="2"/>`,
  peach: `<g transform="rotate(-5 86 44)"><path d="M28 20h112a8 8 0 0 1 8 8v39a8 8 0 0 1-8 8H64L47 88V75H28a8 8 0 0 1-8-8V28a8 8 0 0 1 8-8Z" fill="#fff" stroke="#b9afe8"/><path d="M38 39h89M38 52h58" stroke="#d5ceff" stroke-width="4" stroke-linecap="round"/></g><g transform="rotate(5 168 86)"><path d="M121 62h91a7 7 0 0 1 7 7v34a7 7 0 0 1-7 7h-16l-1 10-16-10h-58a7 7 0 0 1-7-7V69a7 7 0 0 1 7-7Z" fill="#e4ddff" stroke="#b9afe8"/><circle cx="145" cy="86" r="3" fill="#605a8a"/><circle cx="165" cy="86" r="3" fill="#605a8a"/><circle cx="185" cy="86" r="3" fill="#605a8a"/></g>`,
  mint: `<g transform="rotate(-7 72 67)"><rect x="22" y="24" width="94" height="85" fill="#ffd02f"/><path d="M38 44h48M38 58h60M38 72h42" stroke="#746019" stroke-width="3" stroke-linecap="round" opacity=".65"/></g><g transform="rotate(4 171 70)"><rect x="126" y="35" width="92" height="73" fill="#fff" stroke="#ded9ff"/><path d="M143 53h53M143 66h41M143 79h47" stroke="#b9afe8" stroke-width="3" stroke-linecap="round"/></g><path d="M101 70h32m-6-5 6 5-6 5" stroke="#605a8a" stroke-width="1.5"/>`
};

/**
 * Cover artwork for a course card.
 * @param {{id?: string, theme?: string}} course
 * @returns {string} inline `<svg>` markup
 */
export function courseArt(course) {
  const key = course?.id;
  const inner = (key && ART[key]) || FALLBACK[course?.theme] || FALLBACK.mint;
  return `<svg class="art" viewBox="0 0 240 126" fill="none" aria-hidden="true">${inner}</svg>`;
}

/** Course ids that have bespoke cover artwork. */
export function courseArtIds() {
  return Object.keys(ART);
}
