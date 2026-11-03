import {randomBytes} from 'node:crypto';
import {open} from 'node:fs/promises';
import {supabaseConfig,cloudRequest} from './supabase-support.mjs';
import {accountIdentity} from '../api/account.js';
process.loadEnvFile('.env.local');
const config=supabaseConfig();if(!config)throw Error('Database is not configured');
const output=process.argv[2];if(!output)throw Error('Provide an output CSV path');
// Exclusive file creation prevents overwriting an existing credential handover.
const file=await open(output,'wx',0o600);
let created=0,existing=0;
try{
 await file.write('账号,角色,初始密码\n');
 const users=[];
 for(let page=1;;page++){
  const data=await cloudRequest(config,`/auth/v1/admin/users?page=${page}&per_page=100`,{admin:true});
  users.push(...data.users);if(data.users.length<100)break;
 }
 const accounts=[...Array.from({length:3},(_,i)=>({username:`teacher${String(i+1).padStart(2,'0')}`,role:'teacher'})),...Array.from({length:40},(_,i)=>({username:`student${String(i+1).padStart(2,'0')}`,role:'student'})),{username:'admin',role:'admin'}];
 for(const {username,role} of accounts){
  if(users.some(u=>u.email===accountIdentity(username))){existing++;continue;}
  const password=randomBytes(15).toString('base64url');
  await cloudRequest(config,'/auth/v1/admin/users',{method:'POST',admin:true,body:{email:accountIdentity(username),password,email_confirm:true,user_metadata:{username},app_metadata:{role}}});
  await file.write(`${username},${role},${password}\n`);await file.sync();created++;
 }
 console.log(JSON.stringify({created,existing,credentialFile:output}));
}finally{await file.close();}
