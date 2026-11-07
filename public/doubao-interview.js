import {saveCloudInterview,cloudAPI} from './cloud-records.js';
import {interviewLocale,speechLanguage,interviewText,interviewHTML} from './interview-i18n.js';
import {interviewPersonas,personaLabel} from './interview-personas.js';
import {localInterviewReport,interviewReportHTML,interviewReportText} from './interview-report.js';
export function createRealtimeInterview(){
 let uiLocale='zh-CN';const t=text=>withDuration(interviewText(text,uiLocale));
 const maxMinutes=()=>Number(config?.maxMinutes)||10;
 const withDuration=html=>html.replace(/10:00/g,maxMinutes()+':00').replace(/10(?= 分钟| 分鐘| minutes|-minute|分鐘|分钟)/g,String(maxMinutes()));
 let root,config,socket,stream,camera,context,worklet,source,silent,ready=false,muted=false,active=false,epoch=0,clock,nextTime=0,cameraPending=false,room=false,leaving=false;
 let sources=new Set(),messages=[],currentUser=null,currentAI=null,startedAt=0;
 let cloudCanSave=false,cloudSettings,cloudClientId,cloudEndedAt,cloudSaving=false,cloudSaved=false;
 let pendingSettings=null;
 let micCheckedAt=0,lastMicFrame=0,lastMicVoice=0,turnState='waiting',answerPromptTimer;
 function showMicrophone(text){
  const indicator=node('mic-state');
  if(indicator&&indicator.dataset.message!==text){
   indicator.dataset.message=text;
   indicator.textContent=t(text);
   indicator.hidden=!text;
  }
 }
 function microphoneStatus(){
  if(!ready||finishing)return showMicrophone('');
  if(muted)return showMicrophone('麦克风已静音');
  const now=Date.now();
  if(now-lastMicVoice<1500)return showMicrophone('麦克风检测到声音');
  if(now-micCheckedAt>=5000&&now-lastMicFrame>2000)return showMicrophone('未收到麦克风音频，请检查输入设备。');
  if(turnState==='waiting'&&now-micCheckedAt>=8000&&lastMicVoice<micCheckedAt)return showMicrophone('暂未检测到声音，请检查麦克风输入。');
  showMicrophone('麦克风已开启');
 }
 let review=null,finishing=false,closingAudio=false,spokenLanguage='zh',drainTimer,closedReason='';
 const node=name=>root?.querySelector(`[data-rt="${name}"]`);
 const status=text=>{if(node('status'))node('status').textContent=t(text);};
 function send(event){if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify(event));}
 function stopPlayback(){for(const s of sources){try{s.stop();}catch{/* Already stopped. */}}sources.clear();nextTime=0;}
 function stop(reason='通话已结束，麦克风已关闭。'){
  epoch++;active=false;ready=false;showMicrophone('');clearTimeout(answerPromptTimer);clearInterval(clock);clearTimeout(drainTimer);drainTimer=null;
  if(socket){socket.onclose=null;socket.onerror=null;if(socket.readyState===WebSocket.OPEN)send({type:'session.close'});socket.close();socket=null;}
  if(worklet){worklet.port.onmessage=null;worklet.disconnect();worklet=null;}source?.disconnect();source=null;silent?.disconnect();silent=null;
  stream?.getTracks().forEach(t=>t.stop());stream=null;stopPlayback();context?.close().catch(()=>{});context=null;
  camera?.getTracks().forEach(t=>t.stop());camera=null;const video=node('camera');if(video)video.srcObject=null;if(node('camera-caption'))node('camera-caption').hidden=false;
  if(node('camera-toggle'))node('camera-toggle').textContent=t('开启摄像头');
  controls(false);status(reason);
  if(room&&!leaving&&startedAt){review??=localInterviewReport(messages,spokenLanguage);finishPage(reason);}else if(node('connect'))node('connect').hidden=false;
 }
 function controls(running){
  if(node('connect'))node('connect').disabled=running||!config?.configured;
  root?.querySelectorAll('input,select,textarea').forEach(n=>{n.disabled=running;});
  if(node('start'))node('start').disabled=running||!config?.configured||!node('consent')?.checked;
  for(const name of ['mute','interrupt','end'])if(node(name))node(name).disabled=!running;
  if(node('download'))node('download').disabled=!messages.length;
 }
 function addText(role,text,done=false){
  const key=role==='user'?'currentUser':'currentAI';let item=key==='currentUser'?currentUser:currentAI;
  if(!item){item={role,content:'',complete:false};messages.push(item);if(key==='currentUser')currentUser=item;else currentAI=item;}
  if(done&&text)item.content=text;else item.content+=text;
  if(done){item.complete=true;if(key==='currentUser')currentUser=null;else currentAI=null;}
  if(node('download'))node('download').disabled=false;
 }
 function play(encoded){
  if(!context||typeof encoded!=='string')return;
  const binary=atob(encoded),length=Math.floor(binary.length/2);if(!length)return;
  const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0)),view=new DataView(bytes.buffer),buffer=context.createBuffer(1,length,24000),channel=buffer.getChannelData(0);
  for(let i=0;i<length;i++)channel[i]=view.getInt16(i*2,true)/32768;
  // A lagging/paused tab must not build an unbounded playback queue.
  if(nextTime-context.currentTime>8){stop('音频播放积压，通话已停止。请重新开始。');return;}
  const audio=context.createBufferSource();audio.buffer=buffer;audio.connect(context.destination);sources.add(audio);audio.onended=()=>{sources.delete(audio);audio.disconnect();};
  nextTime=Math.max(context.currentTime+.025,nextTime);audio.start(nextTime);nextTime+=buffer.duration;
 }
 function receive(event){
  if(event.type==='forma.time_warning'){
   const seconds=event.remainingSeconds||90;
   showNotice(uiLocale==='en'?`About ${seconds} seconds left. Finish your current answer; we will then wrap up.`:`${uiLocale==='zh-TW'?'約剩':'还剩约'} ${seconds} 秒，${uiLocale==='zh-TW'?'完成目前回答後將進入總結。':'完成当前回答后将进入总结。'}`);return;
  }
  if(event.type==='forma.reviewing'){
   finishing=true;ready=false;showMicrophone('');releaseMic();stopPlayback();status('正在整理复盘，请稍候…');showNotice(t('正在整理复盘，请稍候…'));
   for(const name of ['mute','interrupt','end','camera-toggle'])if(node(name))node(name).disabled=true;
   if(!node('force-end'))root.querySelector('.ir-tools')?.insertAdjacentHTML('beforeend',`<button type="button" data-rt="force-end">${t('立即退出')}</button>`);
   return;
  }
  if(event.type==='forma.review'){review=event.review;return;}
  if(event.type==='forma.closing'){closingAudio=true;status('面试官正在总结…');return;}
  if(finishing&&!closingAudio&&event.type.startsWith('response.output_audio.'))return;
  if(event.type==='session.created'){ready=true;micCheckedAt=Date.now();microphoneStatus();status('已连接豆包 · 可以直接说话，也可以打断面试官');return;}
  if(event.type==='forma.error')return stop('豆包返回错误，请核对服务开通、模型权限和免费额度。');
  if(event.type==='forma.closed'){
   const errors={authentication_failed:'密钥鉴权失败，请检查本地密钥及模型权限。',connection_timeout:'连接超时，请检查网络后重试。',time_limit:'已到单次 10 分钟上限，通话已停止。',provider_connection_failed:'无法连接豆包，请检查网络与服务权限。',provider_error:'豆包返回错误，请核对模型权限、音色和可用额度。',provider_unavailable:'豆包服务暂不可用，请稍后重试。'};
   return settleClose(event.reason==='review_complete'?'通话已结束，麦克风已关闭。':errors[event.reason]||'通话已断开，麦克风已关闭。可手动重新开始。');
  }
  if(event.type==='conversation.item.input_audio_transcription.started'){turnState='listening';stopPlayback();currentUser=null;currentAI=null;status('正在听你回答…');}
  if(event.type==='conversation.item.input_audio_transcription.delta')addText('user',event.delta||'');
  if(event.type==='conversation.item.input_audio_transcription.completed'){
   turnState='thinking';const text=event.transcript||event.text||'';if(currentUser||text)addText('user',text,true);if(!finishing)status('面试官正在思考…');
  }
  if(event.type==='response.output_text.delta')addText('assistant',event.delta||'');
  if(event.type==='response.output_text.done'){if(currentAI||event.text)addText('assistant',event.text||'',true);}
  if(event.type==='response.output_audio.delta'){turnState='speaking';status(finishing?'面试官正在总结…':'面试官正在说话 · 你可以直接打断');play(event.delta);}
  if((event.type==='response.output_audio.done'||event.type==='response.done')&&!finishing&&turnState==='speaking'){
   clearTimeout(answerPromptTimer);
   const remainingAudio=context?Math.max(0,nextTime-context.currentTime)*1000:0;
   answerPromptTimer=setTimeout(()=>{
    if(!ready||finishing||turnState!=='speaking')return;
    turnState='waiting';micCheckedAt=Date.now();
    status(muted?'麦克风已静音':'请开始回答，回答后稍作停顿。');
   },remainingAudio);
  }
  if(event.type==='response.canceled')stopPlayback();
  if(event.type==='conversation.item.input_audio_transcription.failed')status('这次语音未识别成功，请再说一次。');
 }
 async function start(settings){
  cloudSettings={...settings,context:settings.context||''};cloudClientId=crypto.randomUUID();cloudEndedAt=null;cloudSaving=false;cloudSaved=false;
  if(active||!config.configured)return;
  active=true;muted=false;lastMicFrame=0;lastMicVoice=0;turnState='waiting';const token=++epoch;let permissionTimer;controls(true);status('请允许麦克风权限…');
  messages=[];review=null;finishing=false;closingAudio=false;spokenLanguage=settings.language;currentUser=null;currentAI=null;node('mute').textContent=t('麦克风静音');
  try{
   if(!navigator.mediaDevices?.getUserMedia)throw Object.assign(Error('microphone_unavailable'),{name:'UnsupportedError'});
   context=new (window.AudioContext||window.webkitAudioContext)();
   // Both permission and audio activation start in the explicit tap handler.
   const microphone=navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
   const resumed=context.resume();resumed.catch(()=>{});
   microphone.then(acquired=>{if(token!==epoch||!active)acquired.getTracks().forEach(track=>track.stop());}).catch(()=>{});
   const acquired=await Promise.race([microphone,new Promise((_,reject)=>{permissionTimer=setTimeout(()=>reject(Object.assign(Error('permission_timeout'),{name:'PermissionPromptTimeout'})),20000);})]);clearTimeout(permissionTimer);
   if(token!==epoch){acquired.getTracks().forEach(t=>t.stop());return;}stream=acquired;
   await resumed;if(token!==epoch)return;
   await context.audioWorklet.addModule('/realtime-pcm-worklet.js');if(token!==epoch)return;
   worklet=new AudioWorkletNode(context,'forma-pcm');source=context.createMediaStreamSource(stream);silent=context.createGain();silent.gain.value=0;source.connect(worklet);worklet.connect(silent);silent.connect(context.destination);
   worklet.port.onmessage=event=>{
    if(!ready||muted||token!==epoch)return;
    if(socket.bufferedAmount>128000)return stop('网络发送积压，通话已停止，避免继续消耗额度。');
    const bytes=new Uint8Array(event.data);
    lastMicFrame=Date.now();
    const pcm=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
    let energy=0;
    for(let i=0;i+1<pcm.byteLength;i+=2)energy+=pcm.getInt16(i,true)**2;
    if(energy>pcm.byteLength/2*300**2)lastMicVoice=lastMicFrame;
    let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
    send({type:'input_audio_buffer.append',audio:btoa(binary)});
   };
   status('正在连接豆包实时语音…');socket=new WebSocket(`${location.protocol==='https:'?'wss:':'ws:'}//${location.host}/api/realtime`);
   socket.onopen=()=>{if(token!==epoch)return;if(node('connect'))node('connect').hidden=true;send({type:'forma.start',consent:true,settings});startedAt=Date.now();clock=setInterval(()=>{microphoneStatus();const seconds=Math.floor((Date.now()-startedAt)/1000);if(node('elapsed'))node('elapsed').textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')} / ${maxMinutes()}:00`;},1000);};
   socket.onmessage=event=>{if(token!==epoch)return;try{receive(JSON.parse(event.data));}catch{stop('实时语音数据异常，通话已停止。');}};
   socket.onerror=()=>{if(token===epoch)stop('连接失败，请检查登录状态和网络后重试。');};
   socket.onclose=()=>{if(token===epoch)settleClose(closedReason||'连接已断开，麦克风已关闭。');};
  }catch(error){clearTimeout(permissionTimer);if(token===epoch)stop(microphoneErrorText(error));}
 }
 function releaseMic(){ready=false;if(worklet){worklet.port.onmessage=null;worklet.disconnect();worklet=null;}source?.disconnect();source=null;stream?.getTracks().forEach(track=>track.stop());stream=null;}
 function settleClose(reason){
  if(drainTimer)return;closedReason=reason;releaseMic();
  if(closingAudio&&context&&nextTime>context.currentTime){const token=epoch;drainTimer=setTimeout(()=>{drainTimer=null;if(token===epoch)stop(reason);},Math.min(8000,(nextTime-context.currentTime)*1000+150));}
  else stop(reason);
 }
 function showNotice(text){
  if(!node('notice'))root.querySelector('.ir-header')?.insertAdjacentHTML('afterend','<div class="ir-time-warning" data-rt="notice" role="status"></div>');
  if(node('notice'))node('notice').textContent=text;
 }
 function requestFinish(){
  if(!active||!ready)return stop();if(finishing)return;
  finishing=true;send({type:'forma.finish'});status('正在完成当前回答并收尾…');showNotice(t('正在完成当前回答并收尾…'));
  if(node('end'))node('end').disabled=true;
  root.querySelector('.ir-tools')?.insertAdjacentHTML('beforeend',`<button type="button" data-rt="force-end">${t('立即退出')}</button>`);
 }
 async function toggleCamera(){
  if(cameraPending)return;
  if(camera){camera.getTracks().forEach(t=>t.stop());camera=null;node('camera').srcObject=null;if(node('camera-caption'))node('camera-caption').hidden=false;node('camera-toggle').textContent=t('开启摄像头');return;}
  const token=epoch;cameraPending=true;
  try{const acquired=await navigator.mediaDevices.getUserMedia({video:true,audio:false});if(token!==epoch||!root){acquired.getTracks().forEach(t=>t.stop());return;}camera=acquired;node('camera').srcObject=camera;if(node('camera-caption'))node('camera-caption').hidden=true;node('camera-toggle').textContent=t('关闭摄像头');}catch{if(token===epoch)status('摄像头不可用，不影响语音面试。');}finally{cameraPending=false;}
 }
 function click(event){
  const action=event.target.closest('[data-rt]')?.dataset.rt;
  if(action==='connect'&&pendingSettings&&!active&&config?.configured){void start(pendingSettings);return;}
  if(action==='start'&&!active&&config.configured&&node('consent')?.checked){
   const settings=Object.fromEntries(new FormData(node('settings')));settings.language=speechLanguage(settings.language);
   try{sessionStorage.setItem('forma-interview-entry',JSON.stringify({settings,uiLocale,consent:true,at:Date.now()}));location.assign('/interview-room.html');}catch{status('无法进入面试室，请允许当前标签页使用本地临时存储。');}
  }
  if(action==='retry-save')persistCloud();
  if(action==='end'){if(cloudCanSave)stop();else requestFinish();}
  if(action==='force-end')stop();
  if(action==='camera-toggle')toggleCamera();
  if(action==='interrupt'&&ready){send({type:'response.cancel'});stopPlayback();status('已打断，请继续回答。');}
  if(action==='mute'&&ready){muted=!muted;micCheckedAt=Date.now();lastMicVoice=0;microphoneStatus();stream?.getAudioTracks().forEach(t=>{t.enabled=!muted;});send({type:muted?'input_audio_mute.commit':'input_audio_unmute.commit'});node('mute').textContent=t(muted?'恢复麦克风':'麦克风静音');status(muted?'麦克风已静音；连接仍可能计费，不用时请结束通话。':'麦克风已恢复');}
  if(action==='download'&&messages.length){const blob=new Blob([messages.map(m=>`${m.role==='user'?'你':'AI 面试官'}：${m.content}`).join('\n\n')],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Forma-面试记录.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  if(action==='download-review'&&review){const url=URL.createObjectURL(new Blob([interviewReportText(review)],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='Forma-面试复盘.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 }
 function change(){controls(active);}
 function visibility(){if(document.hidden&&active)stop('页面已切到后台，已结束通话以避免继续消耗额度。');}
 function leave(){leaving=true;stop();}
 function restore(event){if(event.persisted&&room){leaving=false;finishPage('上一场通话已结束。请重新准备，不会自动重新连接。');}}
 async function persistCloud(reason='通话已结束'){
  if(cloudSaving||cloudSaved||!startedAt||!cloudClientId)return;
  cloudSaving=true;cloudEndedAt??=Date.now();
  const target=()=>root?.querySelector('[data-cloud-save-status]');
  if(target())target().textContent=uiLocale==='en'?'Saving interview…':'正在保存面试…';
  try{await saveCloudInterview({settings:cloudSettings,messages,clientId:cloudClientId,startedAt,endedAt:cloudEndedAt,reason,uiLocale});cloudSaved=true;if(target())target().textContent=uiLocale==='en'?'Saved. Review will appear in My interviews.':'面试已保存，后台复盘完成后自动存入我的面试记录。';}
  catch(error){if(target()){target().textContent=error.message==='login_required'?(uiLocale==='en'?'Sign in to save this interview, then retry here.':'请先登录，再返回这里重试保存。'):uiLocale==='en'?'Not saved. Please retry or download your transcript.':'尚未保存，请重试或先下载文字记录。';if(!node('retry-save'))target().insertAdjacentHTML('afterend',`<button type="button" class="ir-secondary" data-rt="retry-save">${uiLocale==='en'?'Retry save':'重试保存'}</button>`);}}
  finally{cloudSaving=false;}
 }
 function finishPage(reason){
  const seconds=startedAt?Math.floor((Date.now()-startedAt)/1000):0;
  history.replaceState(null,'','#complete');
  const duration=uiLocale==='en'?`Call duration: ${Math.floor(seconds/60)}m ${seconds%60}s`:`${uiLocale==='zh-TW'?'通話時長':'通话时长'} ${Math.floor(seconds/60)} 分 ${seconds%60} 秒`;
  root.innerHTML=interviewHTML(`<section class="ir-complete"><a class="ir-brand" href="/#learning">forma<span>.</span></a><div class="ir-complete-card"><span class="ir-check" aria-hidden="true">${startedAt?'✓':'·'}</span><p class="ir-eyebrow">${startedAt?'INTERVIEW COMPLETE':'INTERVIEW ROOM'}</p><h1>${startedAt?'本次面试已结束':'尚未开始面试'}</h1><p data-rt="result-reason"></p>${startedAt?`<p class="ir-duration">${duration}</p>`:''}<div class="ir-result-actions ir-result-grid"><a class="ir-primary" href="/#interview-records">我的面试记录</a><a class="ir-primary" href="/#mock-interview">重新准备面试</a><a class="ir-secondary" href="/#learning">返回首页</a><button type="button" class="ir-secondary" data-rt="download" ${messages.length?'':'disabled'}>下载文字记录</button></div></div></section>`,uiLocale);
  node('result-reason').textContent=t(reason);
  if(startedAt){root.querySelector('.ir-complete-card')?.insertAdjacentHTML('beforeend','<p data-cloud-save-status role="status"></p>');persistCloud(reason);}
  if(review)root.querySelector('.ir-complete')?.insertAdjacentHTML('beforeend',interviewReportHTML(review,uiLocale));
  else if(startedAt)root.querySelector('.ir-complete-card')?.insertAdjacentHTML('beforeend',`<p>${t('没有足够的完整回答生成复盘或评分。')}</p>`);
 }
 async function mountRoom(element){
  root=element;room=true;leaving=false;startedAt=0;let entry;
  try{entry=JSON.parse(sessionStorage.getItem('forma-interview-entry'));sessionStorage.removeItem('forma-interview-entry');}catch{/* Require a fresh start from preparation. */}
  uiLocale=interviewLocale(entry?.uiLocale);if(document.documentElement)document.documentElement.lang=uiLocale;
  document.title=uiLocale==='en'?'Forma — Interview room':uiLocale==='zh-TW'?'Forma — 面試室':'Forma — 面试室';
  root.addEventListener('click',click);document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',leave);window.addEventListener('pageshow',restore);
  if(!entry||entry.consent!==true||!entry.settings||!Number.isFinite(entry.at)||entry.at>Date.now()||Date.now()-entry.at>300000){finishPage('请先完成面试准备，再进入面试室。刷新或返回不会自动重新发起通话。');return;}
  root.innerHTML=interviewRoomHTML(uiLocale);
  cloudAPI('/api/account').then(data=>{cloudCanSave=!!data.user;}).catch(()=>{});
  const labels={developer:'软件开发',frontend:'前端开发',data:'数据分析',product:'产品与团队协作'};
  node('direction').textContent=t(labels[entry.settings.role]||labels.developer);
  const badge=root.querySelector('.ir-ai-tag');if(badge)badge.textContent=t('AI 模拟面试官')+' · '+personaLabel(entry.settings.persona,uiLocale);
  const token=epoch;
  try{const response=await fetch('/api/realtime-status',{signal:AbortSignal.timeout(5000)});if(!response.ok)throw new Error();config=await response.json();if(node('elapsed'))node('elapsed').textContent='0:00 / '+maxMinutes()+':00';if(token!==epoch||leaving)return;if(document.hidden){stop('页面已进入后台，请返回准备页重新开始。');return;}if(!config.configured){stop('语音服务尚未配置，请返回准备页。');return;}pendingSettings=entry.settings;controls(false);status('点击下方按钮，开启麦克风并开始面试。');}catch{if(token===epoch&&!leaving)stop('无法连接面试服务，请返回后重试。');}
 }
 function mount(element,options){
  root=element;config=options;room=false;leaving=false;uiLocale=interviewLocale(options.locale);
  const personaField=`<div class="field vi-persona-field"><label>${t('面试官风格')}<select name="persona">${interviewPersonas.map(p=>`<option value="${p.id}">${personaLabel(p.id,uiLocale)}</option>`).join('')}</select></label><p class="vi-privacy">${t('同时改变音色和追问方式；实际声音效果以试听为准。')}</p></div>`;
  root.innerHTML=withDuration(interviewHTML(`<div class="vi-prepare-intro"><h2>面试设置</h2><p>开始后进入独立面试室，通过语音作答。</p></div><p class="vi-prepare-status" data-rt="status" role="status">${config.configured?'语音服务就绪':'语音服务尚未配置，请联系项目负责人。'}</p>
  <form data-rt="settings" class="panel vi-setup">${personaField}<div class="vi-settings-grid"><div class="field"><label>面试方向<select name="role"><option value="developer">软件开发</option><option value="frontend">前端开发</option><option value="data">数据分析</option><option value="product">产品与团队协作</option></select></label></div><div class="field"><label>难度<select name="level"><option value="beginner">入门</option><option value="intermediate">中级</option><option value="advanced">进阶</option></select></label></div><div class="field"><label>面试语言<select name="language"><option value="zh" ${uiLocale==='en'?'':'selected'}>中文</option><option value="en" ${uiLocale==='en'?'selected':''}>英文</option></select></label></div></div><div class="field"><label>项目背景（可选）<textarea name="context" maxlength="2500" rows="3" placeholder="简述想在面试中讨论的项目，不要填写敏感信息。"></textarea></label><p class="vi-privacy">将作为面试背景发送给 AI，用于围绕你的职责、技术选择和遇到的问题追问。</p></div><label class="vi-consent"><input type="checkbox" data-rt="consent">我同意将麦克风音频和项目背景发送给 AI 实时语音服务；登录后将保存文字记录与复盘。</label><div class="vi-prepare-bottom"><p class="vi-privacy">最长 10 分钟 · 摄像头仅本机预览 · 切到后台结束通话</p><button type="button" class="btn" data-rt="start" disabled>开始面试 →</button></div><details class="vi-prepare-details"><summary>隐私与用量说明</summary><p class="vi-privacy">面试中不显示实时文字。登录后，面试转写、设置与复盘将保存到你的私有面试记录；未登录时仅临时保留，可下载。免费额度用尽后可能收费，本页面无法查询余额。10 分钟为时长上限，不代表免费。</p></details></form>`,uiLocale));
  root.addEventListener('click',click);root.addEventListener('change',change);document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',leave);controls(false);
 }
 function cleanup(){leaving=true;stop();root?.removeEventListener('click',click);root?.removeEventListener('change',change);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',leave);window.removeEventListener('pageshow',restore);root=null;}
 return {mount,mountRoom,cleanup};
}

export function interviewRoomHTML(locale='zh-CN'){return interviewHTML(`<div class="ir-room"><header class="ir-header"><a class="ir-brand" href="/#learning">forma<span>.</span></a><span class="ir-room-title">面试室 <i></i> <span data-rt="direction">软件开发</span></span><span class="ir-timer" data-rt="elapsed">0:00 / 10:00</span></header><main class="ir-stage"><div class="ir-interviewer"><span class="ir-ai-tag">AI 模拟面试官</span><div class="ir-orbit" aria-hidden="true"><div class="ir-orb">f<span>.</span></div></div><h1>Forma 面试官</h1><p data-rt="status" role="status">正在准备面试连接…</p><button type="button" class="ir-primary ir-connect" data-rt="connect" disabled>开启麦克风并开始</button><p class="ir-mic-state" data-rt="mic-state" hidden></p><div class="ir-sound" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div></div><aside class="ir-self"><video data-rt="camera" autoplay playsinline muted aria-label="你的摄像头预览"></video><div class="ir-self-placeholder" aria-hidden="true">◉</div><span data-rt="camera-caption">你 · 画面不上传</span></aside></main><footer class="ir-footer"><span class="ir-secure">语音面试 · 摄像头可选</span><div class="ir-tools"><button type="button" data-rt="mute">麦克风静音</button><button type="button" data-rt="camera-toggle">开启摄像头</button><button type="button" data-rt="interrupt">打断面试官</button><button type="button" data-rt="end" class="ir-end">结束面试</button></div><span class="ir-footer-hint">请在安静的环境中作答</span></footer></div>`,locale);}

export function microphoneErrorText(error){
 if(error?.name==='PermissionPromptTimeout')return '浏览器尚未返回麦克风权限。如果没有弹窗，请在网站设置中允许麦克风，或用 Safari、Chrome 打开后重试。';
 if(['NotAllowedError','PermissionDeniedError','SecurityError'].includes(error?.name))return '麦克风权限被阻止。请在浏览器的网站设置中允许麦克风，再点击按钮重试；微信等内置浏览器可改用 Safari 或 Chrome 打开。';
 if(['NotFoundError','DevicesNotFoundError'].includes(error?.name))return '没有找到麦克风，请连接麦克风后重试。';
 if(['NotReadableError','TrackStartError'].includes(error?.name))return '麦克风被其他应用占用，请关闭通话或录音应用后重试。';
 if(error?.name==='UnsupportedError')return '当前浏览器无法使用麦克风。请通过 HTTPS 地址，用 Safari 或 Chrome 打开网站。';
 return '语音未能启动，请再点击一次开启麦克风；如仍失败，请使用 Safari 或 Chrome 打开。';
}
