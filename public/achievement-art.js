export function achievementArt(index){
 const colors=['#dcebd2','#e5ddf4','#ffe1c9','#d9eaf2','#ffe9ac','#f4dce9','#e0e4fb'];
 const faces=[
 '<path d="M40 69 Q60 55 80 69 V93 Q60 81 40 93Z" fill="#fff8da"/><path d="M60 64 V86 M60 57 V42 Q43 38 43 28 Q62 28 60 45 Q62 29 78 28 Q77 42 60 45" fill="#91b88a"/>',
 '<path d="M35 48 L33 31 50 39 Q60 33 70 39 L87 31 85 48 V76 Q60 101 35 76Z" fill="#bdabe0"/><circle cx="48" cy="60" r="12" fill="#fffbee"/><circle cx="72" cy="60" r="12" fill="#fffbee"/><path d="M56 70 L60 76 64 70" fill="#efbd68"/>',
 '<path d="M36 50 L34 29 52 41 Q60 37 68 41 L86 29 84 50 V75 Q60 98 36 75Z" fill="#edba86"/><path d="M37 65 Q60 83 83 65 Q80 91 60 91 Q40 91 37 65" fill="#fff6e4"/>',
 '<rect x="33" y="40" width="54" height="44" rx="15" fill="#9ec8d6"/><path d="M60 40 V27"/><circle cx="60" cy="24" r="5" fill="#ffdc80"/><path d="M27 55 V70 M93 55 V70 M45 90 H75"/>',
 '<ellipse cx="47" cy="39" rx="9" ry="19" fill="#fffaf0"/><ellipse cx="73" cy="39" rx="9" ry="19" fill="#fffaf0"/><rect x="34" y="45" width="52" height="43" rx="22" fill="#fffaf0"/><path d="M46 35 V44 M74 35 V44" stroke="#efbfd0"/>',
 '<path d="M33 46 Q59 25 86 46 V75 Q61 95 39 77 L31 87Z" fill="#d8badd"/><path d="M43 49 Q60 36 78 49 V73 Q60 85 43 73Z" fill="#fff6e8"/>',
 '<path d="M42 29 H78 M49 29 V51 L34 78 Q30 91 44 93 H76 Q90 91 86 78 L71 51 V29" fill="#f9f5ff"/><path d="M41 72 H79 L85 85 Q86 91 75 91 H45 Q34 91 37 83Z" fill="#aaa8dc"/><circle cx="58" cy="62" r="4" fill="#aaa8dc"/>'
 ];
 return `<svg class="achievement-art" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54" fill="${colors[index%7]}"/><g stroke="#514664" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round">${faces[index%7]}<circle cx="48" cy="62" r="2.3" fill="#514664"/><circle cx="72" cy="62" r="2.3" fill="#514664"/><path d="M55 73 Q60 78 65 73" fill="none"/></g><circle cx="40" cy="70" r="4" fill="#eeb8b1" opacity=".65"/><circle cx="80" cy="70" r="4" fill="#eeb8b1" opacity=".65"/><path d="M96 19 L99 25 105 28 99 31 96 37 93 31 87 28 93 25Z" fill="#d9ad4d"/></svg>`;
}
