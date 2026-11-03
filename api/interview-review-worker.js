import {timingSafeEqual} from 'node:crypto';
import {supabaseConfig} from '../scripts/supabase-support.mjs';
import {processInterviewReview} from '../scripts/interview-cloud-review.mjs';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');const secret=process.env.CRON_SECRET,actual=String(req.headers.authorization||''),expected='Bearer '+secret;
 if(!secret||Buffer.byteLength(actual)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(actual),Buffer.from(expected)))return res.status(401).json({error:'unauthorized'});
 if(req.method!=='GET')return res.status(405).json({error:'method_not_allowed'});
 const config=supabaseConfig();if(!config)return res.status(503).json({error:'database_not_configured'});
 try{await processInterviewReview(config);return res.status(200).json({ok:true});}catch{return res.status(502).json({error:'review_unavailable'});}
}
