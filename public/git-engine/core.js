// Core of the Git course engine: a small, honest model of real Git.
//
// Objects are hashed exactly the way Git hashes them (SHA-1 over
// "<type> <size>\0<body>"), so a blob, a tree and a commit made here get the
// same id real Git would give the same content, author and time. Repositories
// live inside a simulated file system (`world.fs`) so the shell and Git see
// the same files, and remote repositories live on a simulated GitHub
// (`world.servers`) so push, fetch, pull and pull requests behave like the
// real round trip.

const enc = new TextEncoder();

/* ------------------------------------------------------------------ SHA-1 */
function sha1Bytes(bytes){
 const ml=bytes.length, withOne=ml+1, total=Math.ceil((withOne+8)/64)*64;
 const buf=new Uint8Array(total);buf.set(bytes);buf[ml]=0x80;
 const bits=ml*8, view=new DataView(buf.buffer);
 view.setUint32(total-4,bits>>>0);view.setUint32(total-8,Math.floor(bits/0x100000000));
 let h0=0x67452301,h1=0xEFCDAB89,h2=0x98BADCFE,h3=0x10325476,h4=0xC3D2E1F0;
 const w=new Uint32Array(80);
 for(let off=0;off<total;off+=64){
  for(let i=0;i<16;i++)w[i]=view.getUint32(off+i*4);
  for(let i=16;i<80;i++){const x=w[i-3]^w[i-8]^w[i-14]^w[i-16];w[i]=(x<<1)|(x>>>31);}
  let a=h0,b=h1,c=h2,d=h3,e=h4;
  for(let i=0;i<80;i++){
   let f,k;
   if(i<20){f=(b&c)|(~b&d);k=0x5A827999;}else if(i<40){f=b^c^d;k=0x6ED9EBA1;}else if(i<60){f=(b&c)|(b&d)|(c&d);k=0x8F1BBCDC;}else{f=b^c^d;k=0xCA62C1D6;}
   const t=(((a<<5)|(a>>>27))+f+e+k+w[i])>>>0;e=d;d=c;c=(b<<30)|(b>>>2);b=a;a=t;
  }
  h0=(h0+a)>>>0;h1=(h1+b)>>>0;h2=(h2+c)>>>0;h3=(h3+d)>>>0;h4=(h4+e)>>>0;
 }
 return [h0,h1,h2,h3,h4].map(x=>x.toString(16).padStart(8,'0')).join('');
}
const concat=parts=>{const n=parts.reduce((s,p)=>s+p.length,0),out=new Uint8Array(n);let o=0;for(const p of parts){out.set(p,o);o+=p.length;}return out;};
const hexBytes=hex=>Uint8Array.from(hex.match(/../g).map(h=>parseInt(h,16)));
function hashObject(type,body){const b=typeof body==='string'?enc.encode(body):body;return sha1Bytes(concat([enc.encode(`${type} ${b.length}\0`),b]));}
export const sha1Hex=text=>sha1Bytes(enc.encode(text));

/* ------------------------------------------------------------ the world */
/**
 * A fresh simulated computer: a home folder, an empty object store and an
 * empty GitHub. `now` returns seconds since the epoch and `tz` is "+0800".
 */
/** @param {{user?:string,host?:string,home?:string,name?:string,email?:string,now?:number,tz?:string}} [opts] */
export function createWorld({user='alice',host='forma',home='/home/alice',name='Alice Wang',email='alice@example.com',now,tz}={}){
 return {
  v:1,user,host,home,cwd:home,fs:{},dirs:[home],repos:{},objects:{},servers:{},
  global:{'init.defaultbranch':'main'},
  identity:{name,email},
  clock:{fixed:now??null,tz:tz??localTz(),last:0},
 };
}
function localTz(){const m=-new Date().getTimezoneOffset(),s=m<0?'-':'+',a=Math.abs(m);return s+String(Math.floor(a/60)).padStart(2,'0')+String(a%60).padStart(2,'0');}
/** The next commit time: the real clock, never going backwards so history stays ordered. */
export function tick(world,step=1){
 const c=world.clock;let t=c.fixed!=null?c.fixed:Math.floor(Date.now()/1000);
 if(t<=c.last)t=c.last+step;c.last=t;if(c.fixed!=null)c.fixed=t+step;return {time:t,tz:c.tz};
}

/* ------------------------------------------------------------ objects */
export function writeBlob(world,content){
 const id=hashObject('blob',content);if(!world.objects[id])world.objects[id]={t:'blob',c:content};return id;
}
function treeBody(entries){
 return concat(entries.map(([mode,name,id])=>concat([enc.encode(`${mode} ${name}\0`),hexBytes(id)])));
}
/** @param {any[]} entry */
const treeSortKey=([mode,name])=>mode==='40000'?name+'/':name;
/** Builds tree objects from a flat {path: blobId} map and returns the root tree id. */
export function writeTree(world,flat){
 const root={};
 for(const [path,id] of Object.entries(flat)){const parts=path.split('/');let node=root;for(const p of parts.slice(0,-1))node=(node[p]??={__dir:true});node[parts.at(-1)]=id;}
 const build=node=>{
  const entries=Object.entries(node).filter(([k])=>k!=='__dir').map(([name,v])=>typeof v==='string'?['100644',name,v]:['40000',name,build(v)]);
  entries.sort((a,b)=>{const x=treeSortKey(a),y=treeSortKey(b);return x<y?-1:x>y?1:0;});
  const id=hashObject('tree',treeBody(entries));if(!world.objects[id])world.objects[id]={t:'tree',e:entries};return id;
 };
 return build(root);
}
export function flattenTree(world,treeId,prefix='',out={}){
 const t=world.objects[treeId];if(!t)return out;
 for(const [mode,name,id] of t.e){if(mode==='40000')flattenTree(world,id,prefix+name+'/',out);else out[prefix+name]=id;}
 return out;
}
const identLine=p=>`${p.name} <${p.email}> ${p.time} ${p.tz}`;
export function writeCommit(world,{tree,parents=[],author,committer,message}){
 const body=`tree ${tree}\n${parents.map(p=>`parent ${p}\n`).join('')}author ${identLine(author)}\ncommitter ${identLine(committer||author)}\n\n${message}`;
 const id=hashObject('commit',body);if(!world.objects[id])world.objects[id]={t:'commit',tree,parents:[...parents],author:{...author},committer:{...(committer||author)},msg:message};return id;
}
export function writeTag(world,{object,tag,tagger,message}){
 const type=world.objects[object]?.t||'commit';
 const body=`object ${object}\ntype ${type}\ntag ${tag}\ntagger ${identLine(tagger)}\n\n${message}`;
 const id=hashObject('tag',body);if(!world.objects[id])world.objects[id]={t:'tag',obj:object,type,tag,tagger:{...tagger},msg:message};return id;
}
export const commitOf=(world,id)=>world.objects[id]?.t==='commit'?world.objects[id]:null;
export const blobText=(world,id)=>world.objects[id]?.t==='blob'?world.objects[id].c:'';
export const treeFiles=(world,commitId)=>{const c=commitOf(world,commitId);return c?flattenTree(world,c.tree):{};};
/** Follows annotated tags to the object they name. */
export function peel(world,id){let o=world.objects[id];while(o?.t==='tag'){id=o.obj;o=world.objects[id];}return id;}
export const subject=msg=>String(msg||'').split('\n')[0];
export const short=id=>String(id||'').slice(0,7);

/* ------------------------------------------------------------ history */
export function ancestors(world,starts){
 const seen=new Set(),stack=[...starts].filter(Boolean);
 while(stack.length){const id=stack.pop();if(seen.has(id))continue;seen.add(id);const c=commitOf(world,id);if(c)stack.push(...c.parents);}
 return seen;
}
export const isAncestor=(world,older,newer)=>!!older&&!!newer&&ancestors(world,[newer]).has(older);
export function mergeBase(world,a,b){
 if(!a||!b)return null;
 const A=ancestors(world,[a]),common=[...ancestors(world,[b])].filter(x=>A.has(x));
 const best=common.filter(x=>!common.some(y=>y!==x&&isAncestor(world,x,y)));
 best.sort((x,y)=>commitOf(world,y).committer.time-commitOf(world,x).committer.time);
 return best[0]??null;
}
/** Commits reachable from `include` and not from `exclude`, newest first by commit time. */
export function revList(world,include,exclude=[]){
 const ex=ancestors(world,exclude),all=[...ancestors(world,include)].filter(x=>!ex.has(x)&&commitOf(world,x));
 return all;
}
