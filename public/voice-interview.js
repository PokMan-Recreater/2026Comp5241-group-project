import {backgroundRequest} from './background-ai.js';
import {createRealtimeInterview} from './doubao-interview.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const interviewRoles=[['developer','Software developer','软件开发','軟體開發'],['frontend','Frontend developer','前端开发','前端開發'],['data','Data analyst','数据分析','資料分析'],['product','Product & teamwork','产品与团队协作','產品與團隊協作']];
export function canSubmitAnswer(messages,answer,maxRounds){return !!answer.trim()&&answer.length<=4000&&messages.at(-1)?.role==='assistant'&&messages.filter(m=>m.role==='user').length<maxRounds;}

export function createVoiceInterview({locale,onSave,getHistory=()=>[]}){
 const realtime=createRealtimeInterview();
 const L=(en,cn,tw=cn)=>locale()==='en'?en:locale()==='zh-TW'?tw:cn;
 const state={phase:'setup',settings:{role:'developer',level:'beginner',language:'en',rounds:5,context:''},messages:[],draft:'',review:null,error:'',config:null,consent:false,muted:false,saved:false};
 let root,disposed=true,controller,videoStream,audioStream,recorder,recognition,recordTimer,utterance,epoch=0,cameraPending=false;
 const answers=()=>state.messages.filter(m=>m.role==='user').length;
 const busy=()=>['thinking','transcribing','reviewing','requesting'].includes(state.phase);
 const active=()=>state.messages.length>0&&!state.review;
 const labelRole=()=>{const r=interviewRoles.find(x=>x[0]===state.settings.role)||interviewRoles[0];return L(r[1],r[2],r[3]);};
 const phaseText=()=>({setup:L('Ready when you are','准备开始','準備開始'),thinking:L('Preparing a question…','正在准备问题…','正在準備問題…'),waiting:L('Your turn','轮到你回答','輪到你回答'),speaking:L('Interviewer is speaking','面试官正在说话','面試官正在說話'),recording:L('Listening · stop when finished','正在录音 · 说完请停止','正在錄音 · 說完請停止'),requesting:L('Waiting for microphone permission…','等待麦克风授权…','等待麥克風授權…'),transcribing:L('Transcribing your answer…','正在识别回答…','正在辨識回答…'),reviewing:L('Preparing your review…','正在整理复盘…','正在整理回顧…'),ended:L('Interview ended','面试已结束','面試已結束'),complete:L('Review ready','复盘已生成','回顧已產生')})[state.phase]||'';
 const button=(action,text,disabled=false,primary=false)=>`<button type="button" data-vi="${action}" class="btn ${primary?'':'secondary'}" ${disabled?'disabled':''}>${text}</button>`;
 function errorText(code){
  const map={ai_not_configured:L('The AI connection is not configured yet. Ask the project owner to configure it; no simulated answers will be used.','AI 接口尚未配置，请由项目负责人完成配置；这里不会生成模拟回答。','AI 介面尚未設定，請由專案負責人完成設定；這裡不會產生模擬回答。'),rate_limited:L('The service limit was reached. Wait a minute and retry.','已达到服务调用限制，请稍等一分钟重试。','已達服務呼叫限制，請稍等一分鐘重試。'),provider_timeout:L('The AI response timed out. Your answer is still here; try again.','AI 响应超时，回答已保留，可以重试。','AI 回應逾時，回答已保留，可以重試。'),speech_not_configured:L('Speech recognition is not configured. You can type your answer.','语音识别尚未配置，可以输入回答。','語音辨識尚未設定，可以輸入回答。'),no_speech:L('No speech was detected. Try again or type your answer.','未识别到语音，请重试或输入回答。','未辨識到語音，請重試或輸入回答。')};
  return map[code]||L('The service could not complete the request. Your answer is preserved. Check your connection and retry.','服务暂时未能完成请求，回答已保留。请检查网络后重试。','服務暫時未能完成請求，回答已保留。請檢查網路後重試。');
 }
 const roleOptions=()=>interviewRoles.map(r=>`<option value="${r[0]}" ${state.settings.role===r[0]?'selected':''}>${L(r[1],r[2],r[3])}</option>`).join('');
 function page(){return `<div class="page-heading"><h1>${L('AI mock interview','AI 模拟面试','AI 模擬面試')}</h1></div><section id="voice-interview" class="voice-interview"></section>`;}
 function reportHTML(){const r=state.review;const list=(title,items)=>`<section><h3>${title}</h3><ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`;return `<section class="vi-report panel"><span class="vi-kicker">${L('INTERVIEW REVIEW','面试复盘','面試回顧')}</span><h2>${L('Your answers, reviewed','回顾这次回答','回顧這次回答')}</h2><p>${esc(r.summary)}</p><div class="vi-report-grid">${list(L('What worked','做得好的地方'),r.strengths)}${list(L('What to improve','可以改进的地方','可以改進的地方'),r.improvements)}</div><h3>${L('One answer, improved','一个回答的改写示例','一個回答的改寫範例')}</h3><p class="vi-example">${esc(r.example)}</p>${list(L('Next practice','下一步练习','下一步練習'),r.nextSteps)}<div class="row">${button('save',state.saved?L('Saved on this device','已保存到本机','已儲存至本機'):L('Save review','保存复盘','儲存回顧'),state.saved,true)}${button('new',L('New interview','再练一次','再練一次'))}</div></section>`;}
 function draw(){
  if(disposed||!root)return;
  const configured=state.config?.configured,hasQuestion=!!state.messages.length,last=state.messages.at(-1),canRecord=hasQuestion&&state.phase==='waiting'&&!state.review;
  const browserRecognition=!!(window.SpeechRecognition||window.webkitSpeechRecognition);
  const speechReady=state.config?.speechConfigured?!!(navigator.mediaDevices?.getUserMedia&&window.MediaRecorder):browserRecognition;
  root.innerHTML=`<a class="activity-back" href="#practice/interviews">← ${L('Interview practice','面试练习','面試練習')}</a>
   <div class="vi-statusbar"><span class="vi-status" role="status"><i class="${['speaking','recording'].includes(state.phase)?'live':''}"></i>${phaseText()}</span><span>${hasQuestion?`${Math.min(answers()+1,state.settings.rounds)} / ${state.settings.rounds} ${L('rounds','轮','輪')}`:L('Voice conversation · camera optional','语音对话 · 摄像头可选','語音對話 · 攝影機選用')}</span></div>
   ${!state.config?`<p class="vi-notice">${L('Checking AI connection…','正在检查 AI 连接…','正在檢查 AI 連線…')}</p>`:!configured?`<p class="vi-notice">${errorText('ai_not_configured')} ${button('check',L('Check again','重新检查','重新檢查'))}</p>`:''}
   <div class="vi-stage"><section class="vi-person vi-interviewer ${state.phase==='speaking'?'is-speaking':''}"><span class="vi-person-tag">${L('AI interviewer','AI 面试官','AI 面試官')}</span><div class="vi-avatar" aria-hidden="true">F<span>·</span></div><div class="vi-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><h2>${L('Forma Interview','Forma 面试室','Forma 面試室')}</h2><p>${labelRole()}</p></section><section class="vi-person vi-self"><video id="vi-camera" autoplay playsinline muted aria-label="${L('Your camera preview','你的摄像头预览','你的攝影機預覽')}"></video><div class="vi-camera-placeholder" ${videoStream?'hidden':''}><span aria-hidden="true">◉</span><p>${L('Your camera is off','摄像头未开启','攝影機未開啟')}</p><small>${L('Video stays on this device','画面只在本机显示','畫面只在本機顯示')}</small></div><span class="vi-person-tag">${L('You','你')}</span><button type="button" class="vi-camera-button" data-vi="camera">${videoStream?L('Turn camera off','关闭摄像头','關閉攝影機'):L('Enable camera','开启摄像头','開啟攝影機')}</button></section></div>
   ${state.error?`<p class="vi-error" role="alert">${esc(state.error)}</p>`:''}
   ${!hasQuestion&&!state.review?`<form id="vi-setup" class="panel vi-setup"><div class="vi-settings-grid"><div class="field"><label for="vi-role">${L('Interview role','面试方向','面試方向')}</label><select id="vi-role" name="role">${roleOptions()}</select></div><div class="field"><label for="vi-level">${L('Difficulty','难度','難度')}</label><select id="vi-level" name="level">${[['beginner',L('Entry level','入门','入門')],['intermediate',L('Intermediate','中级','中階')],['advanced',L('Advanced','进阶','進階')]].map(([v,t])=>`<option value="${v}" ${state.settings.level===v?'selected':''}>${t}</option>`).join('')}</select></div><div class="field"><label for="vi-language">${L('Interview language','面试语言','面試語言')}</label><select id="vi-language" name="language">${[['en','English'],['zh-CN','简体中文'],['zh-TW','繁體中文']].map(([v,t])=>`<option value="${v}" ${state.settings.language===v?'selected':''}>${t}</option>`).join('')}</select></div><div class="field"><label for="vi-rounds">${L('Rounds','面试轮数','面試輪數')}</label><select id="vi-rounds" name="rounds">${[5,6,8].map(v=>`<option value="${v}" ${Number(state.settings.rounds)===v?'selected':''}>${v}</option>`).join('')}</select></div></div><div class="field"><label for="vi-context">${L('Project background (optional)','项目背景（可选）','專案背景（選填）')}</label><textarea id="vi-context" name="context" maxlength="2500" rows="3" placeholder="${L('Briefly describe a project you want to discuss; omit personal or confidential details.','简述想讨论的项目，不要填写个人敏感信息或机密。','簡述想討論的專案，請勿填寫個人敏感資訊或機密。')}">${esc(state.settings.context)}</textarea></div><label class="vi-consent"><input id="vi-consent" type="checkbox" ${state.consent?'checked':''}>${L('I agree to send my answers and project context to the configured AI service.','我同意将回答文字和项目背景发送到已配置的 AI 服务。','我同意將回答文字和專案背景傳送至已設定的 AI 服務。')}</label><p class="vi-privacy">${state.config?.speechConfigured?L('Recording is sent to Groq for transcription when you stop. Video is never sent.','停止录音后，音频发送给 Groq 识别，视频不上传。','停止錄音後，音訊傳送至 Groq 辨識，影片不上傳。'):L('Browser speech recognition may use the browser vendor’s online service. Video is never sent.','浏览器语音识别可能使用浏览器厂商的在线服务，视频不上传。','瀏覽器語音辨識可能使用瀏覽器廠商的線上服務，影片不上傳。')} ${L('Transcript history is saved only when you choose Save review.','仅在点击“保存复盘”时保存对话记录。','僅在點選「儲存回顧」時儲存對話紀錄。')}</p><div class="row">${button('start',busy()?L('Connecting…','正在连接…','正在連線…'):L('Start interview','开始面试','開始面試'),!configured||!state.consent||busy(),true)}</div></form>`:''}
   ${hasQuestion&&!state.review?`<section class="panel vi-conversation"><span class="vi-kicker">${L('CURRENT QUESTION','当前问题','目前問題')}</span><p class="vi-question">${esc(last?.role==='assistant'?last.content:L('Preparing your review','正在整理复盘','正在整理回顧'))}</p><div class="vi-call-tools">${button(state.phase==='speaking'?'stop-voice':'replay',state.phase==='speaking'?L('Stop playback','停止朗读','停止朗讀'):L('Replay question','重听问题','重聽問題'),busy()||state.phase==='recording'||!('speechSynthesis'in window))}${button('mute',state.muted?L('Enable voice','开启声音','開啟聲音'):L('Mute interviewer','关闭声音','關閉聲音'))}</div><label for="vi-answer">${L('Your answer · review or edit before sending','你的回答 · 发送前可修改识别文字','你的回答 · 傳送前可修改辨識文字')}</label><textarea id="vi-answer" rows="4" maxlength="4000" ${busy()||['recording','speaking'].includes(state.phase)?'disabled':''} placeholder="${L('Record an answer or type here…','录音回答，或在这里输入…','錄音回答，或在這裡輸入…')}">${esc(state.draft)}</textarea><p class="vi-privacy">${speechReady?L('Stop recording to review the transcript. Each recording is limited to 90 seconds.','停止录音后检查识别文字，每段录音最长 90 秒。','停止錄音後檢查辨識文字，每段錄音最長 90 秒。'):L('Speech recognition is unavailable in this browser. You can type your answers.','当前浏览器未提供可用语音识别，可以输入回答。','目前瀏覽器未提供可用語音辨識，可以輸入回答。')}</p><div class="vi-answer-actions">${button(state.phase==='recording'?'stop-recording':'record',state.phase==='recording'?L('Stop recording','停止录音','停止錄音'):L('Record answer','录音回答','錄音回答'),state.phase==='recording'?false:!canRecord||!speechReady)}${button('send',L('Answer finished','回答完毕','回答完畢'),!canRecord||!canSubmitAnswer(state.messages,state.draft,Number(state.settings.rounds)),true)}${button('end',L('End & review','结束并复盘','結束並回顧'),busy()||state.phase==='recording'||answers()<1)}</div></section>`:''}
   ${state.phase==='ended'&&!state.review?`<section class="panel">${button('review',L('Retry review','重新生成复盘','重新產生回顧'),busy(),true)}${button('new',L('New interview','重新开始','重新開始'))}</section>`:''}
   ${state.review?reportHTML():''}
   ${hasQuestion?`<details class="vi-transcript"><summary>${L('Conversation transcript','查看对话记录','查看對話紀錄')} (${state.messages.length})</summary>${state.messages.map(m=>`<article><strong>${m.role==='assistant'?L('Interviewer','面试官','面試官'):L('You','你')}</strong><p>${esc(m.content)}</p></article>`).join('')}</details>`:''}`;
  if(!active()&&getHistory().length)root.insertAdjacentHTML('beforeend',`<section class="vi-history panel"><h2>${L('Saved interviews','已保存的面试','已儲存的面試')}</h2>${getHistory().slice().reverse().map(x=>`<button type="button" data-vi="history" data-id="${esc(x.id)}">${esc(x.settings.role)} · ${new Date(x.at).toLocaleDateString(locale())} →</button>`).join('')}</section>`);
  if(configured)root.querySelector('.vi-statusbar')?.insertAdjacentHTML('afterend',`<p class="vi-provider">${L('AI service','AI 服务','AI 服務')}: ${esc(state.config.provider)} · ${esc(state.config.model)}</p>`);
  if(videoStream)root.querySelector('video').srcObject=videoStream;
 }
 function stopVoice(){if('speechSynthesis'in window)window.speechSynthesis.cancel();utterance=null;if(state.phase==='speaking')state.phase='waiting';}
 function speak(text){
  stopVoice();if(state.muted||!('speechSynthesis'in window)){state.phase='waiting';draw();return;}
  const u=new SpeechSynthesisUtterance(text);utterance=u;u.lang=state.settings.language==='en'?'en-US':state.settings.language;u.rate=.95;
  const voice=window.speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith(u.lang.toLowerCase()));if(voice)u.voice=voice;
  state.phase='speaking';draw();u.onend=()=>{if(utterance!==u||disposed)return;utterance=null;state.phase='waiting';draw();};u.onerror=()=>{if(utterance!==u||disposed)return;utterance=null;state.phase='waiting';state.error=L('Voice playback failed. Read the question and continue.','朗读未能播放，可阅读问题继续回答。','朗讀未能播放，可閱讀問題繼續回答。');draw();};window.speechSynthesis.speak(u);
 }
 async function request(action,messages){
  if(action==='review')return backgroundRequest('/api/interview',{action,settings:{...state.settings,role:labelRole()},language:state.settings.language,messages});
  controller=new AbortController();const response=await fetch('/api/interview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,settings:{...state.settings,role:labelRole()},language:state.settings.language,messages}),signal:AbortSignal.any([controller.signal,AbortSignal.timeout(50000)])});
  const data=await response.json();if(!response.ok)throw new Error(data.error||'provider_unavailable');return data;
 }
 async function question(nextMessages){
  const token=epoch;state.phase='thinking';state.error='';draw();
  try{const data=await request('question',nextMessages);if(disposed||token!==epoch)return;if(typeof data.question!=='string'||!data.question.trim())throw new Error('empty_question');state.messages=[...nextMessages,{role:'assistant',content:data.question}];state.draft='';speak(data.question);}
  catch(error){if(disposed||token!==epoch)return;state.phase=state.messages.length?'waiting':'setup';state.error=errorText(error.message);draw();}
 }
 function releaseAudio(){clearTimeout(recordTimer);recognition?.abort();recognition=null;if(recorder){recorder.onstop=null;if(recorder.state!=='inactive')recorder.stop();recorder=null;}audioStream?.getTracks().forEach(t=>t.stop());audioStream=null;}
 function releaseCamera(){videoStream?.getTracks().forEach(t=>t.stop());videoStream=null;}
 async function camera(){
  if(cameraPending)return;
  if(videoStream){releaseCamera();draw();return;}
  const token=epoch;cameraPending=true;
  try{const stream=await navigator.mediaDevices.getUserMedia({video:{width:640,height:480},audio:false});if(disposed||epoch!==token){stream.getTracks().forEach(t=>t.stop());return;}videoStream=stream;draw();}
  catch{if(!disposed&&token===epoch){state.error=L('Camera unavailable or permission denied. You can continue without video.','摄像头不可用或未获授权，可以不开视频继续面试。','攝影機無法使用或未獲授權，可以不開影片繼續面試。');draw();}}finally{cameraPending=false;}
 }
 async function transcribe(blob,token){
  state.phase='transcribing';draw();
  try{controller=new AbortController();const response=await fetch('/api/transcribe?language='+(state.settings.language==='en'?'en':'zh'),{method:'POST',headers:{'Content-Type':blob.type},body:blob,signal:AbortSignal.any([controller.signal,AbortSignal.timeout(50000)])});const data=await response.json();if(!response.ok)throw new Error(data.error);if(disposed||epoch!==token)return;state.draft=[state.draft,data.text].filter(Boolean).join(' ');state.phase='waiting';draw();}
  catch(error){if(disposed||epoch!==token)return;state.phase='waiting';state.error=errorText(error.message);draw();}
 }
 async function record(){
  if(state.phase!=='waiting')return;const token=epoch;stopVoice();state.error='';
  if(!state.config.speechConfigured){
   const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Recognition)return;
   recognition=new Recognition();recognition.lang=state.settings.language==='en'?'en-US':state.settings.language;recognition.continuous=true;recognition.interimResults=false;
   recognition.onresult=event=>{if(disposed||token!==epoch)return;for(let i=event.resultIndex;i<event.results.length;i++)if(event.results[i].isFinal)state.draft=[state.draft,event.results[i][0].transcript].filter(Boolean).join(' ');draw();};
   recognition.onerror=()=>{if(disposed||token!==epoch)return;state.error=L('Speech recognition could not complete. Check microphone permission or type your answer.','语音识别未能完成，请检查麦克风权限，或输入回答。','語音辨識未能完成，請檢查麥克風權限，或輸入回答。');};
   recognition.onend=()=>{clearTimeout(recordTimer);recognition=null;if(!disposed&&token===epoch){state.phase='waiting';draw();}};
   try{recognition.start();state.phase='recording';recordTimer=setTimeout(()=>recognition?.stop(),90000);draw();}catch{state.phase='waiting';state.error=errorText('no_speech');draw();}return;
  }
  state.phase='requesting';draw();
  try{
   const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});if(disposed||token!==epoch){stream.getTracks().forEach(t=>t.stop());return;}audioStream=stream;
   const mime=['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus'].find(x=>MediaRecorder.isTypeSupported(x));if(!mime)throw new Error('unsupported_audio');
   recorder=new MediaRecorder(stream,{mimeType:mime,audioBitsPerSecond:64000});let chunks=[],size=0;
   recorder.ondataavailable=e=>{if(e.data.size){chunks.push(e.data);size+=e.data.size;if(size>2800000&&recorder?.state==='recording')recorder.stop();}};
   recorder.onstop=()=>{clearTimeout(recordTimer);const blob=new Blob(chunks,{type:mime});chunks=[];audioStream?.getTracks().forEach(t=>t.stop());audioStream=null;recorder=null;if(disposed||token!==epoch)return;if(!blob.size){state.phase='waiting';state.error=errorText('no_speech');draw();return;}transcribe(blob,token);};
   recorder.onerror=()=>{releaseAudio();if(!disposed){state.phase='waiting';state.error=errorText('no_speech');draw();}};
   recorder.start(1000);state.phase='recording';recordTimer=setTimeout(()=>recorder?.state==='recording'&&recorder.stop(),90000);draw();
  }catch{releaseAudio();if(!disposed&&token===epoch){state.phase='waiting';state.error=L('Microphone unavailable or permission denied. You can type your answer.','麦克风不可用或未获授权，可以输入回答。','麥克風無法使用或未獲授權，可以輸入回答。');draw();}}
 }
 async function review(messages=state.messages){
  stopVoice();releaseAudio();releaseCamera();state.messages=messages;state.phase='reviewing';state.error='';draw();const token=epoch;
  try{const data=await request('review',messages);if(disposed||token!==epoch)return;if(!data.review)throw new Error('invalid_review');state.review=data.review;state.phase='complete';draw();}
  catch(error){if(disposed||token!==epoch)return;state.phase='ended';state.error=errorText(error.message);draw();}
 }
 async function check(){const token=epoch;try{const response=await fetch('/api/interview',{signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error();const config=await response.json();if(disposed||token!==epoch)return;state.config=config;state.error='';draw();}catch{if(!disposed&&token===epoch){state.config={configured:false,speechConfigured:false};state.error=L('Unable to check the AI connection.','无法检查 AI 连接。','無法檢查 AI 連線。');draw();}}}
 async function click(event){
  const buttonElement=event.target.closest('[data-vi]');if(!buttonElement||buttonElement.disabled)return;const action=buttonElement.dataset.vi;
  if(action==='camera')return camera();if(action==='check')return check();
  if(action==='history'){const session=getHistory().find(x=>x.id===buttonElement.dataset.id);if(session){stopVoice();releaseAudio();releaseCamera();state.settings={...session.settings};state.messages=structuredClone(session.messages);state.review=structuredClone(session.review);state.saved=true;state.phase='complete';state.error='';draw();}return;}
  if(action==='start'&&!busy()&&state.config?.configured&&state.consent){state.messages=[];state.review=null;state.saved=false;state.draft='';return question([]);}
  if(action==='record')return record();if(action==='stop-recording'){if(recorder?.state==='recording')recorder.stop();recognition?.stop();return;}
  if(action==='stop-voice'){stopVoice();draw();return;}
  if(action==='replay'&&state.messages.at(-1)?.role==='assistant')return speak(state.messages.at(-1).content);
  if(action==='mute'){state.muted=!state.muted;if(state.muted)stopVoice();draw();return;}
  if(action==='send'&&state.phase==='waiting'&&canSubmitAnswer(state.messages,state.draft,Number(state.settings.rounds))){const messages=[...state.messages,{role:'user',content:state.draft.trim()}];if(answers()+1>=Number(state.settings.rounds))return review(messages);return question(messages);}
  if(['end','review'].includes(action)&&!busy()&&answers()>0)return review();
  if(action==='save'&&state.review&&!state.saved){try{onSave({id:crypto.randomUUID(),at:new Date().toISOString(),settings:{...state.settings},messages:structuredClone(state.messages),review:structuredClone(state.review)});state.saved=true;draw();}catch{state.error=L('Could not save on this device. Copy the review before leaving.','本机保存失败，请离开前复制复盘内容。','本機儲存失敗，請離開前複製回顧內容。');draw();}return;}
  if(action==='new'){stopVoice();releaseAudio();releaseCamera();state.phase='setup';state.messages=[];state.draft='';state.review=null;state.error='';state.saved=false;draw();}
 }
 function input(event){
  if(event.target.id==='vi-answer'){state.draft=event.target.value;const send=root.querySelector('[data-vi="send"]');if(send)send.disabled=state.phase!=='waiting'||!canSubmitAnswer(state.messages,state.draft,Number(state.settings.rounds));}
  if(event.target.closest('#vi-setup')&&event.target.name)state.settings[event.target.name]=event.target.name==='rounds'?Number(event.target.value):event.target.value;
 }
 function change(event){input(event);if(event.target.id==='vi-consent'){state.consent=event.target.checked;const start=root.querySelector('[data-vi="start"]');if(start)start.disabled=!state.consent||!state.config?.configured||busy();}}
 function cleanup(){realtime.cleanup();disposed=true;epoch++;controller?.abort();stopVoice();releaseAudio();releaseCamera();if(busy()||state.phase==='recording')state.phase=active()?'waiting':'setup';if(root){root.removeEventListener('click',click);root.removeEventListener('input',input);root.removeEventListener('change',change);}root=null;}
 async function mount(){root=document.querySelector('#voice-interview');if(!root)return;disposed=false;const token=epoch;
  try{const response=await fetch('/api/realtime-status',{signal:AbortSignal.timeout(3000)});if(response.ok){const options=await response.json();if(disposed||epoch!==token)return;if(options.available){realtime.mount(root,{...options,locale:locale()});return;}}}catch{/* Static hosting retains the existing text interview mode. */}
  if(disposed||epoch!==token)return;state.settings.language=state.messages.length?state.settings.language:locale();root.addEventListener('click',click);root.addEventListener('input',input);root.addEventListener('change',change);draw();check();}
 return {page,mount,cleanup};
}
