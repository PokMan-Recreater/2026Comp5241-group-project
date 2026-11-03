import {sameOrigin,allowRequest} from '../scripts/interview-support.mjs';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
 if(!sameOrigin(req))return res.status(403).json({error:'origin_not_allowed'});
 if(!process.env.GROQ_API_KEY)return res.status(503).json({error:'speech_not_configured'});
 if(!allowRequest(req,'transcribe',10))return res.status(429).json({error:'rate_limited'});
 const mime=String(req.headers['content-type']||'').split(';')[0];
 const extensions={'audio/webm':'webm','audio/mp4':'m4a','audio/ogg':'ogg','audio/wav':'wav'};
 if(!extensions[mime])return res.status(415).json({error:'unsupported_audio'});
 try{
  const parts=[];let size=0;
  if(Buffer.isBuffer(req.body)){parts.push(req.body);size=req.body.length;}
  else for await(const chunk of req){const part=Buffer.from(chunk);size+=part.length;if(size>3000000)return res.status(413).json({error:'audio_too_large'});parts.push(part);}
  if(size<100||size>3000000)return res.status(400).json({error:'invalid_audio'});
  const form=new FormData();form.set('file',new Blob([Buffer.concat(parts)],{type:mime}),'answer.'+extensions[mime]);form.set('model','whisper-large-v3-turbo');
  form.set('response_format','json');
  const language=new URL(req.url,'http://localhost').searchParams.get('language');if(['en','zh'].includes(language))form.set('language',language);
  const result=await fetch('https://api.groq.com/openai/v1/audio/transcriptions',{method:'POST',headers:{Authorization:`Bearer ${process.env.GROQ_API_KEY}`},body:form,signal:AbortSignal.timeout(45000)});
  if(!result.ok)return res.status(result.status===429?429:502).json({error:result.status===429?'rate_limited':'transcription_unavailable'});
  const data=await result.json();if(typeof data.text!=='string'||!data.text.trim())return res.status(422).json({error:'no_speech'});
  return res.status(200).json({text:data.text.slice(0,4000)});
 }catch{return res.status(502).json({error:'transcription_unavailable'});}
}
// Preserve the binary audio request rather than applying Vercel's JSON parser.
export const config={api:{bodyParser:false}};
