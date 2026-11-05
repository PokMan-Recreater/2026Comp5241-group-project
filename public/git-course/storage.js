export const activeUserKey='forma.active-user.v1';
export function gitStoreKey(storage=globalThis.localStorage){let user='';try{user=storage?.getItem(activeUserKey)||'';}catch{/* Browser storage unavailable. */}return user?'forma.gitcourse.v1.user.'+user:'forma.gitcourse.v1';}
export function gitRunPrefix(storage=globalThis.localStorage){let user='';try{user=storage?.getItem(activeUserKey)||'';}catch{/* Browser storage unavailable. */}return user?'forma.gitcourse.run.user.'+user+'.':'forma.gitcourse.run.';}
export function readGitProgress(storage=globalThis.localStorage){try{return JSON.parse(storage?.getItem(gitStoreKey(storage))||'{}')?.progress||{};}catch{return {};}}
export function writeGitProgress(progress,storage=globalThis.localStorage){try{const key=gitStoreKey(storage),store=JSON.parse(storage?.getItem(key)||'{}');store.progress=progress;storage?.setItem(key,JSON.stringify(store));}catch{/* The main workspace still keeps its local copy. */}}

export function activateGitUser(userId,storage=globalThis.localStorage){
 try{
  storage?.setItem(activeUserKey,userId);
  const key=gitStoreKey(storage),legacy=storage?.getItem('forma.gitcourse.v1'),claimed=storage?.getItem('forma.gitcourse.legacy-owner');
  if(!storage?.getItem(key)&&legacy&&(!claimed||claimed===userId)){
   storage?.setItem(key,legacy);storage?.setItem('forma.gitcourse.legacy-owner',userId);
   for(const oldKey of Object.keys(storage||{}))if(oldKey.startsWith('forma.gitcourse.run.')&&!oldKey.startsWith('forma.gitcourse.run.user.'))storage?.setItem(gitRunPrefix(storage)+oldKey.slice('forma.gitcourse.run.'.length),storage.getItem(oldKey));
  }
 }catch{/* Existing unscoped records are retained if migration cannot complete. */}
}
