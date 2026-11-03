// Code Quest — the story world and every pixel picture in it.
//
// Byte Island's Beacon has gone dark. Bit, a small robot washed ashore, and
// Nib, a curious spark, relight it one chapter at a time. Each chapter has a
// place, a guardian who explains the idea of that chapter, and a spark that
// Bit collects when the chapter is finished. All art is drawn from plain
// rectangles in the site palette, so it stays tiny, sharp at any size and
// follows the same colours as the rest of forma.

const t=(en,cn,tw)=>({en,'zh-CN':cn,'zh-TW':tw});

export const PAL={'2':'#050038','3':'#b9afe8','4':'#ffd02f','5':'#e4ddff','6':'#ffffff','7':'#7864be','8':'#a698da'};

export function spriteRects(rows,scale,mono){
 let out='';
 rows.forEach((row,y)=>{
  row.split('').forEach((ch,x)=>{
   const fill=mono?(PAL[ch]?'#b9afe8':null):PAL[ch];
   if(fill)out+=`<rect x="${x*scale}" y="${y*scale}" width="${scale}" height="${scale}" fill="${fill}"/>`;
  });
 });
 return out;
}

export function sprite(rows,scale=5,mono=false){
 const w=rows[0].length*scale,h=rows.length*scale;
 return `<svg class="quest-sprite" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${spriteRects(rows,scale,mono)}</svg>`;
}

export const BOT=['.222222.','.222222.','.244442.','.244442.','.222222.','..2222..','..2..2..','.22..22.'];
export const STAR=['..4..','.444.','44444','.444.','..4..'];
export const NIB=['.5...5.','.55.55.','..444..','.42424.','..444..','...4...'];
export const BOXY=['222222222','244444442','242444242','244444442','244222442','244444442','222222222','.22...22.'];
export const FORKY=['..2222222.','.244444442','..2222222.','....22....','.2222222..','244444442.','.2222222..','....22....','....22....','...2222...'];
export const LOOPY=['..22222..','.2424242.','244555442','245555542','244555442','.2444442.','..22222..'];
const TOWER=['..44444..','..24442..','..22222..','.2555552.','.2333332.','..25552..','..23332..','..25552..','..23332..','.2555552.','.2222222.'];
export const BEACON=lit=>lit?TOWER:TOWER.map((row,i)=>i<2?row.replace(/4/g,'3'):row);

export const BADGES={
 terminal:['22222222','25555552','25255552','25525552','25255542','25555552','25555552','22222222'],
 box:['.222222.','22444422','24444442','24444442','24444442','24444442','22444422','.222222.'],
 fork:['...22...','..2442..','..2442..','.224422.','22.22.22','24.22.42','24.22.42','22.22.22'],
 loop:['..2222..','.244442.','24555542','24522542','24522542','24555542','.244442.','..2222..'],
 trophy:['22222222','24444442','24444442','.244442.','..2442..','...22...','..2222..','.222222.']
};

const GLYPH={'3':['111','001','111','001','111'],'5':['111','100','111','001','111']};

// ---- the cast and the places --------------------------------------------

export const CAST={
 bit:{rows:BOT,name:t('Bit','比特','比特'),role:t('A small robot who washed ashore.','被冲上岸的小机器人。','被沖上岸的小機器人。')},
 nib:{rows:NIB,name:t('Nib','尼布','尼布'),role:t('A curious spark who lights the way.','爱照路的好奇小火花。','愛照路的好奇小火花。')},
 boxy:{rows:BOXY,name:t('Boxy','箱箱','箱箱'),role:t('Keeper of the crates. Remembers any value you name.','箱子管理员，你给值起名它就记住。','箱子管理員，你給值取名它就記住。')},
 forky:{rows:FORKY,name:t('Forky','岔岔','岔岔'),role:t('A signpost that only points when a condition is true.','路标，只在条件为真时才指路。','路標，只在條件為真時才指路。')},
 loopy:{rows:LOOPY,name:t('Loopy','圈圈','圈圈'),role:t('A ring-worm who rolls until you tell it to stop.','圈形小虫，不叫停就一直滚。','圈形小蟲，不叫停就一直滾。')}
};

export const WORLD={
 name:t('Byte Island','字节岛','位元島'),
 story:t(
  'The Beacon of Byte Island once spoke to every ship in code. Tonight it went dark. Bit and Nib set out to wake it, one program at a time.',
  '字节岛的灯塔曾经用代码和每艘船对话，今晚它熄灭了。比特和尼布出发去唤醒它，每次写好一段程序。',
  '位元島的燈塔曾經用程式碼和每艘船對話，今晚它熄滅了。比特和尼布出發去喚醒它，每次寫好一段程式。'),
 won:t(
  'The Beacon blazes again. Byte Island can talk to the world!',
  '灯塔重新亮起，字节岛又能和世界对话了！',
  '燈塔重新亮起，位元島又能和世界對話了！')
};

export const CHAPTER_STORY={
 hello:{place:t('The Shore','海岸','海岸'),guide:'bit',
  intro:t('Bit wakes on the shore. The Beacon is dark, but it still listens. Teach it its first words.','比特在海岸醒来。灯塔熄灭了，但它还在听。教它说出第一句话吧。','比特在海岸醒來。燈塔熄滅了，但它還在聽。教它說出第一句話吧。'),
  done:t('The Beacon blinks: Hello, World! Nib catches the first spark.','灯塔闪了一下：Hello, World！尼布接住了第一颗火花。','燈塔閃了一下：Hello, World！尼布接住了第一顆火花。')},
 variables:{place:t('Crate Meadow','箱子草地','箱子草地'),guide:'boxy',
  intro:t('Boxy guards the island\'s supplies. Give a value a name and Boxy keeps it safe, ready to reuse or change.','箱箱看管着岛上的物资。给值起个名字，箱箱就替你保管，随时可以取用或修改。','箱箱看管著島上的物資。給值取個名字，箱箱就替你保管，隨時可以取用或修改。'),
  done:t('Boxy hands over the second spark: every value has a place.','箱箱递来第二颗火花：每个值都有自己的位置。','箱箱遞來第二顆火花：每個值都有自己的位置。')},
 control:{place:t('The Crossroads','岔路口','岔路口'),guide:'forky',
  intro:t('The path forks. Forky only points the way when a condition is true, so read it carefully.','路分成了两条。岔岔只在条件为真时才指路，所以要看仔细。','路分成了兩條。岔岔只在條件為真時才指路，所以要看仔細。'),
  done:t('Forky spins with joy and points to Loop Hills. Third spark!','岔岔开心地转了一圈，指向循环山丘。第三颗火花！','岔岔開心地轉了一圈，指向迴圈山丘。第三顆火花！')},
 loops:{place:t('Loop Hills','循环山丘','迴圈山丘'),guide:'loopy',
  intro:t('Loopy rolls around the hill all day. Tell it when to stop, and its rolling will power the Beacon.','圈圈整天绕着山丘滚。告诉它什么时候停，它滚出来的力量就能点亮灯塔。','圈圈整天繞著山丘滾。告訴它什麼時候停，它滾出來的力量就能點亮燈塔。'),
  done:t('Loopy stops just in time. Fourth spark!','圈圈刚好及时停下。第四颗火花！','圈圈剛好及時停下。第四顆火花！')},
 checkpoint:{place:t('Festival Night','庆典之夜','慶典之夜'),guide:'bit',
  intro:t('Everyone gathers at the Beacon. Tonight its lights must flash Fizz and Buzz in perfect rhythm.','大家聚在灯塔下。今晚灯光要按完美的节奏闪出 Fizz 和 Buzz。','大家聚在燈塔下。今晚燈光要按完美的節奏閃出 Fizz 和 Buzz。'),
  done:t('The Beacon blazes. Byte Island can talk to the world again!','灯塔大放光明，字节岛又能和世界对话了！','燈塔大放光明，位元島又能和世界對話了！')}
};

// ---- drawing helpers ----------------------------------------------------

const rect=(x,y,w,h,fill,cls='',style='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${cls?` class="${cls}"`:''}${style?` style="${style}"`:''}/>`;

/** A sprite placed at x,y. The inner group carries the animation so it never fights the placement transform. */
function put(rows,scale,x,y,cls='',style='',mono=false){
 return `<g transform="translate(${x} ${y})"><g${cls?` class="${cls}"`:''}${style?` style="${style}"`:''}>${spriteRects(rows,scale,mono)}</g></g>`;
}

function glyph(ch,x,y,scale,fill){
 let out='';
 (GLYPH[ch]||[]).forEach((row,r)=>row.split('').forEach((c,i)=>{if(c==='1')out+=rect(x+i*scale,y+r*scale,scale,scale,fill);}));
 return out;
}

const cloud=(x,y,delay)=>`<g class="px-drift" style="animation-delay:${delay}s">${rect(x,y,36,6,'#fff')}${rect(x+8,y-6,20,6,'#fff')}</g>`;

function ground(top,body,edge){
 return rect(0,top,320,120-top,body)+rect(0,top,320,4,edge)+rect(0,116,320,4,'#050038');
}

/** The ray of light from a lit lantern. */
const rays=(cx,cy)=>`<g class="px-blink">${rect(cx-44,cy-3,40,6,'#ffd02f','','opacity:.55')}${rect(cx+4,cy-3,40,6,'#ffd02f','','opacity:.55')}${rect(cx-3,cy-30,6,26,'#ffd02f','','opacity:.55')}</g>`;

/** The spark of a chapter: bright and hopping once earned, a faint outline until then. */
const spark=(x,y,earned)=>earned?put(STAR,4,x,y,'px-hop'):put(STAR,4,x,y,'','opacity:.7',true);

const frame=(inner,label,fit='xMidYMid slice')=>`<svg class="quest-scene" viewBox="0 0 320 120" preserveAspectRatio="${fit}" shape-rendering="crispEdges" role="img" aria-label="${label}">${inner}</svg>`;

// ---- scenes -------------------------------------------------------------

const SCENES={
 hello:done=>
  rect(0,0,320,120,'#e4ddff')+cloud(30,22,0)+cloud(190,34,-9)
  +rect(0,70,320,30,'#b9afe8')+rect(0,70,320,4,'#a698da')
  +`<g class="px-blink">${rect(40,82,18,3,'#e4ddff')}${rect(150,88,22,3,'#e4ddff')}${rect(220,80,16,3,'#e4ddff')}</g>`
  +ground(98,'#fff3a3','#ffd02f')
  +put(BEACON(done),5,248,43)+(done?rays(270,50):'')
  +put(BOT,4,62,66,'px-bob')+`<g class="px-blink">${rect(98,64,4,4,'#050038')}${rect(106,64,4,4,'#050038')}${rect(114,64,4,4,'#050038')}</g>`
  +put(NIB,4,150,34,'px-float')+spark(196,24,done),
 variables:done=>
  rect(0,0,320,120,'#fff3a3')+cloud(24,20,-3)+cloud(210,28,-14)
  +rect(0,60,100,40,'#b9afe8')+rect(100,70,120,30,'#b9afe8')+rect(200,56,120,44,'#a698da')
  +ground(98,'#e4ddff','#b9afe8')
  +put(BOT,4,40,66,'px-bob')
  +put(BOXY,4,116,66,'px-hop')
  +[[196,'3','0'],[232,'5','-0.5']].map(([x,d,delay])=>`<g transform="translate(${x} 74)"><g class="px-hop" style="animation-delay:${delay}s">${rect(0,0,28,24,'#050038')}${rect(3,3,22,18,'#ffd02f')}${glyph(d,10,4,3,'#050038')}</g></g>`).join('')
  +put(NIB,4,176,30,'px-float')+spark(272,26,done),
 control:done=>
  rect(0,0,320,120,'#e4ddff')+cloud(20,18,-5)+cloud(230,26,-12)
  +rect(0,64,320,34,'#b9afe8')
  +ground(98,'#a698da','#8276a5')
  // two paths leaving the crossroads
  +[0,1,2,3,4].map(i=>rect(146-i*18,94-i*6,22,6,'#fff3a3')+rect(150+i*18,94-i*6,22,6,'#fff3a3')).join('')
  // a cave on the left and a hut with a lit window on the right
  +rect(14,52,40,34,'#050038')+rect(22,44,24,10,'#050038')
  +rect(262,48,44,38,'#fff')+rect(262,48,44,4,'#050038')+rect(256,40,56,10,'#7864be')+rect(278,60,12,12,done?'#ffd02f':'#b9afe8')
  +put(FORKY,4,140,56,'px-sway','transform-origin:20px 40px')
  +put(BOT,4,76,66,'px-bob')
  +put(NIB,4,200,30,'px-float')+spark(110,22,done),
 loops:done=>
  rect(0,0,320,120,'#fff3a3')+cloud(18,18,-2)+cloud(236,22,-16)
  +rect(0,70,130,30,'#b9afe8')+rect(130,56,100,44,'#b9afe8')+rect(230,72,90,28,'#a698da')
  +ground(98,'#e4ddff','#b9afe8')
  // the dotted track Loopy rolls around
  +[0,1,2,3,4,5,6,7].map(i=>{const a=i*Math.PI/4;return rect(Math.round(190+Math.cos(a)*36)-2,Math.round(56+Math.sin(a)*36)-2,5,5,'#7864be');}).join('')
  +put(LOOPY,4,172,4,'px-orbit','transform-origin:18px 52px')
  +put(BOT,4,56,66,'px-bob')
  +put(NIB,4,104,32,'px-float')+spark(268,60,done),
 checkpoint:done=>
  rect(0,0,320,120,'#b9afe8')
  +[[24,34],[78,46],[126,30],[196,42],[250,30],[296,50],[44,72],[286,76]].map(([x,y],i)=>rect(x,y,5,5,['#ffd02f','#fff','#7864be'][i%3],'px-blink',`animation-delay:${-i*0.3}s`)).join('')
  +ground(98,'#7864be','#a698da')
  // bunting that flashes Fizz / Buzz
  +rect(0,10,320,3,'#050038')
  +[0,1,2,3,4,5,6,7,8,9].map(i=>rect(10+i*32,13,14,12,i%2?'#ffd02f':'#fff','px-blink',`animation-delay:${i%2?0:-0.6}s`)).join('')
  +put(BOT,4,16,66,'px-bob')+put(BOXY,4,66,66,'px-hop')
  +put(BEACON(done),5,138,43)+(done?rays(160,50):'')
  +put(FORKY,4,214,56,'px-sway','transform-origin:20px 40px')
  +put(LOOPY,4,262,68,'px-hop','animation-delay:-.4s')
  +put(NIB,4,200,26,'px-float')+spark(112,26,done)
};

/**
 * One animated scene for a chapter. `done` switches on the earned spark and,
 * where the Beacon is in view, lights it.
 * @param {string} chapterId
 * @param {boolean} done

 * @param {string} label Accessible description.
 */
export function chapterScene(chapterId,done,label){
 const draw=SCENES[chapterId]||SCENES.hello;
 return frame(draw(done),label);
}

/** The whole island, for the course banner. */
export function worldScene(lit,label){
 return frame(
  rect(0,0,320,120,'#e4ddff')+cloud(14,20,0)+cloud(150,12,-10)+cloud(250,34,-18)
  +rect(0,72,100,28,'#b9afe8')+rect(100,60,110,40,'#b9afe8')+rect(210,76,110,24,'#a698da')
  +ground(98,'#fff3a3','#ffd02f')
  +rect(268,8,12,12,'#ffd02f')
  +put(BEACON(lit),5,230,43)+(lit?rays(252,50):'')
  +put(BOT,4,150,66,'px-bob')+put(NIB,4,196,34,'px-float'),
  label,'xMaxYMax meet');
}
