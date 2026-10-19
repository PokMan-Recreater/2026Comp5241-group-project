export const actions = [
  {id:'investigate',cost:1,group:'discovery',icon:'chat'},
  {id:'identity',cost:2,group:'features',icon:'shield'},
  {id:'duplicate',cost:2,group:'features',icon:'ticket'},
  {id:'queue',cost:3,group:'features',icon:'layers'},
  {id:'waitlist',cost:2,group:'features',icon:'refresh'},
  {id:'visual',cost:2,group:'features',icon:'spark'},
  {id:'loadTest',cost:1,group:'testing',icon:'activity'}
];
export function spent(selected) { return actions.filter(a=>selected.includes(a.id)).reduce((s,a)=>s+a.cost,0); }
export function simulate(selected) {
  if(spent(selected)>8) throw new Error('Budget exceeded');
  const has=x=>selected.includes(x);
  const outside=has('identity')?0:30;
  const duplicates=has('duplicate')?0:24;
  const empty=has('waitlist')?0:20;
  const timeouts=has('queue')?0:(has('visual')?110:90);
  const filled=200-empty;
  return {valid:Math.max(0,filled-outside-duplicates),filled,complaints:outside+duplicates+empty+Math.round(timeouts/3),timeouts,outside,duplicates,empty,
    messages:[has('identity')?'hasIdentity':'noIdentity',has('duplicate')?'hasDuplicate':'noDuplicate',has('queue')?'hasQueue':'noQueue',has('waitlist')?'hasWaitlist':'noWaitlist',...(has('visual')?['hasVisual']:[])]};
}
export function recommendation(profile) {
 const foundation=['development','requirements','architecture','ai-coding','testing-release','product-decisions','career'];
 if(profile.goal==='career'&&profile.background==='experienced')return ['architecture','ai-coding','testing-release','product-decisions','career','requirements','development'];
 if(profile.background==='someCoding')return ['requirements','architecture','ai-coding','testing-release','product-decisions','development','career'];
 return foundation;
}
export function suggestedDepth(profile) { return profile.background==='experienced' ? 'advanced':'beginner'; }
export function parseRoster(csv) {
  const rows=[]; let row=[], field='', quoted=false;
  for(let i=0;i<=csv.length;i++) {
    const c=csv[i]??'\n';
    if(c==='"') { if(quoted&&csv[i+1]==='"'){field+='"';i++;}else quoted=!quoted; }
    else if((c===','||c==='\n'||c==='\r')&&!quoted) { row.push(field.trim());field='';if(c!==','){if(row.some(Boolean))rows.push(row);row=[];if(c==='\r'&&csv[i+1]==='\n')i++;} }
    else field+=c;
  }
  const result=[]; const seen=new Set();
  for(const [name,email] of rows){ const address=(email||'').toLowerCase();if(!name||!/^\S+@[^\s@]+\.[^\s@]+$/.test(address)||seen.has(address))continue;seen.add(address);result.push({name,email:address}); }
  return result;
}
export function csvCell(v) { return '"'+String(/^[=+@\-\t\r]/.test(String(v))?'\''+v:v).replaceAll('"','""')+'"'; }
