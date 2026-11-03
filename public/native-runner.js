const messages={
 en:{rate_limited:'Too many runs. Please wait a minute.',runner_timeout:'Execution service timed out. Your program may still be running remotely.',invalid_program:'Enter a complete program to run.',program_too_large:'Code or input is too large.',runner_unavailable:'The execution service is unavailable. Check your connection and try again.',failed:'Program exited with status',signal:'Program stopped:',empty:'Finished with no output.'},
 'zh-CN':{rate_limited:'运行过于频繁，请稍等一分钟。',runner_timeout:'执行服务响应超时，远程程序可能仍在运行。',invalid_program:'请输入完整程序。',program_too_large:'代码或输入过长。',runner_unavailable:'执行服务暂时不可用，请检查网络后重试。',failed:'程序退出状态',signal:'程序已停止：',empty:'运行结束，无输出。'},
 'zh-TW':{rate_limited:'執行過於頻繁，請稍等一分鐘。',runner_timeout:'執行服務回應逾時，遠端程式可能仍在執行。',invalid_program:'請輸入完整程式。',program_too_large:'程式碼或輸入過長。',runner_unavailable:'執行服務暫時無法使用，請檢查網路後重試。',failed:'程式結束狀態',signal:'程式已停止：',empty:'執行結束，沒有輸出。'}
};

export async function runNativeProgram(language,code,stdin='',locale='en',fetcher=fetch,signal){
 const m=messages[locale]||messages.en;
 try{
  const response=await fetcher('/api/run',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({language,code,stdin}),signal:signal?AbortSignal.any([signal,AbortSignal.timeout(30000)]):AbortSignal.timeout(30000)});
  const result=await response.json();
  if(!response.ok)return {error:m[result.error]||m.runner_unavailable};
  const logs=[result.diagnostics,result.stdout,result.stderr].filter(Boolean);
  const error=result.signal?`${m.signal} ${result.signal}`:result.exitCode!=='0'?`${m.failed}: ${result.exitCode}`:undefined;
  return {logs,error};
 }catch(error){return {error:error?.name==='AbortError'?'Stopped waiting; the remote program may still be running.':error?.name==='TimeoutError'?m.runner_timeout:m.runner_unavailable};}
}
