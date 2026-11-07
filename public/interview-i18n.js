export const interviewLocale=value=>value==='en'?'en':value==='zh-TW'?'zh-TW':'zh-CN';
export const speechLanguage=value=>value==='en'?'en':'zh';
// Interface language and spoken interview language are intentionally independent.
const copy=[
 ['浏览器尚未返回麦克风权限。如果没有弹窗，请在网站设置中允许麦克风，或用 Safari、Chrome 打开后重试。','The browser has not returned microphone permission. If no prompt appeared, allow the microphone in site settings or retry in Safari or Chrome.','瀏覽器尚未回傳麥克風權限。如果沒有彈出視窗，請在網站設定中允許麥克風，或用 Safari、Chrome 開啟後重試。'],
 ['开启麦克风并开始','Enable microphone and start','開啟麥克風並開始'],
 ['点击下方按钮，开启麦克风并开始面试。','Tap below to enable your microphone and start the interview.','點擊下方按鈕，開啟麥克風並開始面試。'],
 ['麦克风权限被阻止。请在浏览器的网站设置中允许麦克风，再点击按钮重试；微信等内置浏览器可改用 Safari 或 Chrome 打开。','Microphone access is blocked. Allow it in this browser’s site settings, then tap to retry. If using an in-app browser, open the site in Safari or Chrome.','麥克風權限被阻擋。請在瀏覽器的網站設定中允許麥克風，再點擊按鈕重試；微信等內建瀏覽器可改用 Safari 或 Chrome 開啟。'],
 ['没有找到麦克风，请连接麦克风后重试。','No microphone was found. Connect a microphone and retry.','沒有找到麥克風，請連接麥克風後重試。'],
 ['麦克风被其他应用占用，请关闭通话或录音应用后重试。','The microphone is in use. Close other calling or recording apps and retry.','麥克風被其他應用程式佔用，請關閉通話或錄音應用程式後重試。'],
 ['当前浏览器无法使用麦克风。请通过 HTTPS 地址，用 Safari 或 Chrome 打开网站。','This browser cannot access a microphone. Open the HTTPS site in Safari or Chrome.','目前瀏覽器無法使用麥克風。請透過 HTTPS 網址，用 Safari 或 Chrome 開啟網站。'],
 ['语音未能启动，请再点击一次开启麦克风；如仍失败，请使用 Safari 或 Chrome 打开。','Audio did not start. Tap to enable the microphone again, or open the site in Safari or Chrome.','語音未能啟動，請再點擊一次開啟麥克風；如仍失敗，請使用 Safari 或 Chrome 開啟。'],

 ['面试中不显示实时文字。','Live transcripts are hidden during the interview.','面試中不顯示即時文字。'],
 ['无法连接面试服务，请返回后重试。','Cannot connect to the interview service. Return to setup and retry.','無法連接面試服務，請返回後重試。'],
 ['连接失败，请检查登录状态和网络后重试。','Connection failed. Check your sign-in status and network, then retry.','連線失敗，請檢查登入狀態和網路後重試。'],
 ['免费额度用尽后可能收费，本页面无法查询余额。10 分钟为时长上限，不代表免费。','Charges may apply after free quota is used. This page cannot check your balance. The 10-minute limit does not mean free usage.','免費額度用盡後可能收費，本頁面無法查詢餘額。10 分鐘為時長上限，不代表免費。'],
 ['我同意将麦克风音频和项目背景发送给 AI 实时语音服务；登录后将保存文字记录与复盘。','I agree to send microphone audio and project context to the AI realtime voice service; transcripts and reviews will be saved when signed in.','我同意將麥克風音訊和專案背景傳送給 AI 即時語音服務；登入後將儲存文字紀錄與回顧。'],
 ['登录后，面试转写、设置与复盘将保存到你的私有面试记录；未登录时仅临时保留，可下载。','When signed in, transcripts, settings and reviews are saved to your private interview records. Otherwise they are temporary and can be downloaded.','登入後，面試轉寫、設定與回顧將儲存至你的私人面試紀錄；未登入時僅暫時保留，可下載。'],
 ['登录 / 我的面试记录','Sign in / My interviews','登入 / 我的面試紀錄'],
 ['没有足够的完整回答生成复盘或评分。','There are not enough complete answers to generate a review or score.','沒有足夠的完整回答產生回顧或評分。'],
 ['正在整理复盘，请稍候…','Preparing your review…','正在整理回顧，請稍候…'],['面试官正在总结…','The interviewer is wrapping up…','面試官正在總結…'],['正在完成当前回答并收尾…','Finishing your current answer and wrapping up…','正在完成目前回答並收尾…'],['立即退出','Leave now','立即離開'],
 ['面试练习','Interview practice','面試練習'],['面试设置','Interview setup','面試設定'],
 ['面试官风格','Interviewer style','面試官風格'],['同时改变音色和追问方式；实际声音效果以试听为准。','Changes both the voice and follow-up style. Try a session to judge the sound.','同時改變音色和追問方式；實際聲音效果以試聽為準。'],
 ['我同意将麦克风音频和项目背景发送给 AI 实时语音服务。','I agree to send microphone audio and project context to the AI realtime voice service.','我同意將麥克風音訊和專案背景傳送給 AI 即時語音服務。'],
 ['开始后进入独立面试室，通过语音作答。','Enter a separate interview room and answer by voice.','開始後進入獨立面試室，透過語音作答。'],
 ['语音服务就绪','Voice service ready','語音服務就緒'],['语音服务尚未配置，请联系项目负责人。','Voice service is not configured. Contact the project owner.','語音服務尚未設定，請聯絡專案負責人。'],
 ['面试方向','Interview role','面試方向'],['软件开发','Software development','軟體開發'],['前端开发','Frontend development','前端開發'],['数据分析','Data analysis','資料分析'],['产品与团队协作','Product & teamwork','產品與團隊協作'],
 ['难度','Difficulty','難度'],['入门','Entry level','入門'],['中级','Intermediate','中階'],['进阶','Advanced','進階'],['面试语言','Interview language','面試語言'],['中文','Chinese','中文'],['英文','English','英文'],
 ['项目背景（可选）','Project background (optional)','專案背景（選填）'],['简述想在面试中讨论的项目，不要填写敏感信息。','Describe a project you want to discuss. Do not include sensitive information.','簡述想在面試中討論的專案，請勿填寫敏感資訊。'],
 ['将作为面试背景发送给 AI，用于围绕你的职责、技术选择和遇到的问题追问。','Sent to the AI as interview context for follow-up questions about your role, technical choices and challenges.','將作為面試背景傳送給 AI，用於圍繞你的職責、技術選擇和遇到的問題追問。'],
 ['我同意将麦克风音频和项目背景发送给豆包实时语音服务。','I agree to send microphone audio and project context to the Doubao realtime voice service.','我同意將麥克風音訊和專案背景傳送給豆包即時語音服務。'],
 ['最长 10 分钟 · 摄像头仅本机预览 · 切到后台结束通话','Up to 10 minutes · Camera preview stays local · Switching away ends the call','最長 10 分鐘 · 攝影機僅本機預覽 · 切至背景結束通話'],
 ['开始面试','Start interview','開始面試'],['隐私与用量说明','Privacy & usage','隱私與用量說明'],
 ['面试中不显示实时文字。转写仅暂存在面试室内存中，结束后可下载，刷新即清除。免费额度用尽后可能收费，本页面无法查询余额。10 分钟为时长上限，不代表免费。','Live transcripts are hidden. Transcripts stay in room memory and can be downloaded after the call; refreshing clears them. Charges may apply after free quota is used. This page cannot check your balance. The 10-minute limit does not guarantee free usage.','面試中不顯示即時文字。轉寫僅暫存於面試室記憶體，結束後可下載，重新整理即清除。免費額度用盡後可能收費，本頁無法查詢餘額。10 分鐘為時長上限，不代表免費。'],
 ['面试室','Interview room','面試室'],['AI 模拟面试官','AI interviewer','AI 模擬面試官'],['Forma 面试官','Forma interviewer','Forma 面試官'],['正在准备面试连接…','Preparing your interview…','正在準備面試連線…'],
 ['你的摄像头预览','Your camera preview','你的攝影機預覽'],['你 · 画面不上传','You · Video stays local','你 · 畫面不上傳'],['语音面试 · 摄像头可选','Voice interview · Camera optional','語音面試 · 攝影機選用'],
 ['麦克风静音','Mute microphone','麥克風靜音'],['恢复麦克风','Unmute microphone','恢復麥克風'],['开启摄像头','Enable camera','開啟攝影機'],['关闭摄像头','Disable camera','關閉攝影機'],['打断面试官','Interrupt interviewer','打斷面試官'],['结束面试','End interview','結束面試'],['请在安静的环境中作答','Find a quiet place to answer','請在安靜的環境中作答'],
 ['本次面试已结束','Interview ended','本次面試已結束'],['尚未开始面试','Interview not started','尚未開始面試'],['重新准备面试','Set up another interview','重新準備面試'],['下载文字记录','Download transcript','下載文字紀錄'],['返回练习中心','Back to practice','返回練習中心'],
 ['通话已结束，麦克风已关闭。','The call has ended. Your microphone is off.','通話已結束，麥克風已關閉。'],
 ['已连接豆包 · 可以直接说话，也可以打断面试官','Connected · Speak naturally and interrupt when needed','已連接豆包 · 可以直接說話，也可以打斷面試官'],
 ['豆包返回错误，请核对服务开通、模型权限和免费额度。','The voice service returned an error. Check service access, model permissions and quota.','豆包回傳錯誤，請核對服務開通、模型權限及免費額度。'],
 ['密钥鉴权失败，请检查本地密钥及模型权限。','Authentication failed. Check your local API key and model permissions.','金鑰驗證失敗，請檢查本機金鑰及模型權限。'],
 ['连接超时，请检查网络后重试。','Connection timed out. Check your network and try again.','連線逾時，請檢查網路後重試。'],
 ['已到单次 10 分钟上限，通话已停止。','The 10-minute limit has been reached. The call has ended.','已達單次 10 分鐘上限，通話已停止。'],
 ['无法连接豆包，请检查网络与服务权限。','Could not connect to Doubao. Check your network and service permissions.','無法連接豆包，請檢查網路與服務權限。'],
 ['豆包返回错误，请核对模型权限、音色和可用额度。','Voice service error. Check model permissions, voice and available quota.','豆包回傳錯誤，請核對模型權限、音色和可用額度。'],
 ['豆包服务暂不可用，请稍后重试。','The voice service is unavailable. Try again later.','豆包服務暫時無法使用，請稍後重試。'],
 ['通话已断开，麦克风已关闭。可手动重新开始。','Disconnected. Your microphone is off. Start a new interview to retry.','通話已中斷，麥克風已關閉。可手動重新開始。'],
 ['请开始回答，回答后稍作停顿。','You can answer now. Pause briefly when you finish.','請開始回答，回答後稍作停頓。'],
 ['麦克风已静音','Microphone muted','麥克風已靜音'],['麦克风已开启','Microphone on','麥克風已開啟'],
 ['麦克风检测到声音','Microphone is picking up sound','麥克風偵測到聲音'],
 ['未收到麦克风音频，请检查输入设备。','No microphone audio is arriving. Check your input device.','未收到麥克風音訊，請檢查輸入裝置。'],
 ['暂未检测到声音，请检查麦克风输入。','No sound detected. Check your microphone input.','暫未偵測到聲音，請檢查麥克風輸入。'],
 ['正在听你回答…','Listening to your answer…','正在聽你回答…'],['面试官正在思考…','The interviewer is thinking…','面試官正在思考…'],['面试官正在说话 · 你可以直接打断','The interviewer is speaking · You can interrupt','面試官正在說話 · 你可以直接打斷'],
 ['这次语音未识别成功，请再说一次。','Could not recognize that answer. Please try again.','這次語音未辨識成功，請再說一次。'],['请允许麦克风权限…','Please allow microphone access…','請允許麥克風權限…'],['正在连接豆包实时语音…','Connecting to realtime voice…','正在連接豆包即時語音…'],
 ['音频播放积压，通话已停止。请重新开始。','Audio playback fell behind. The call has stopped; please start again.','音訊播放積壓，通話已停止。請重新開始。'],['网络发送积压，通话已停止，避免继续消耗额度。','Network congestion detected. The call has stopped to limit usage.','網路傳送積壓，通話已停止，避免繼續消耗額度。'],
 ['实时语音数据异常，通话已停止。','Invalid realtime audio data. The call has stopped.','即時語音資料異常，通話已停止。'],['连接失败，请检查本地服务、密钥和网络。','Connection failed. Check your local server, API key and network.','連線失敗，請檢查本機服務、金鑰和網路。'],['连接已断开，麦克风已关闭。','Disconnected. Your microphone is off.','連線已中斷，麥克風已關閉。'],
 ['无法启用语音，请允许麦克风权限，并使用 Chrome 或 Edge 的本地安全页面。','Could not enable audio. Allow microphone access and use Chrome or Edge on a secure local page.','無法啟用語音，請允許麥克風權限，並使用 Chrome 或 Edge 的本機安全頁面。'],
 ['摄像头不可用，不影响语音面试。','Camera unavailable. You can continue the voice interview.','攝影機無法使用，不影響語音面試。'],['无法进入面试室，请允许当前标签页使用本地临时存储。','Cannot enter the interview room. Allow session storage for this tab.','無法進入面試室，請允許目前分頁使用本機暫存。'],
 ['已打断，请继续回答。','Interrupted. Please continue your answer.','已打斷，請繼續回答。'],['麦克风已静音；连接仍可能计费，不用时请结束通话。','Microphone muted. The connection may still incur usage; end the call when finished.','麥克風已靜音；連線仍可能計費，不用時請結束通話。'],['麦克风已恢复','Microphone unmuted','麥克風已恢復'],
 ['页面已切到后台，已结束通话以避免继续消耗额度。','The page moved to the background. The call has ended to limit usage.','頁面已切至背景，已結束通話以避免繼續消耗額度。'],
 ['上一场通话已结束。请重新准备，不会自动重新连接。','The previous call has ended. Set up another interview; reconnection is not automatic.','上一場通話已結束。請重新準備，不會自動重新連線。'],
 ['请先完成面试准备，再进入面试室。刷新或返回不会自动重新发起通话。','Complete interview setup first. Refreshing or going back will not start another call automatically.','請先完成面試準備，再進入面試室。重新整理或返回不會自動重新發起通話。'],
 ['页面已进入后台，请返回准备页重新开始。','The page is in the background. Return to setup to start again.','頁面已進入背景，請返回準備頁重新開始。'],['语音服务尚未配置，请返回准备页。','Voice service is not configured. Return to setup.','語音服務尚未設定，請返回準備頁。'],['无法连接本地面试服务，请返回后重试。','Cannot connect to the local interview service. Return to setup and retry.','無法連接本機面試服務，請返回後重試。']
];
export function interviewText(text,locale='zh-CN'){
 const language=interviewLocale(locale);if(language==='zh-CN')return text;
 const row=copy.find(row=>row[0]===text);return row?row[language==='en'?1:2]:text;
}
export function interviewHTML(html,locale='zh-CN'){
 if(interviewLocale(locale)==='zh-CN')return html;
 // Translate only known template copy, longest first; never translate user input.
 for(const row of [...copy].sort((a,b)=>b[0].length-a[0].length))html=html.split(row[0]).join(row[interviewLocale(locale)==='en'?1:2]);
 return html;
}
