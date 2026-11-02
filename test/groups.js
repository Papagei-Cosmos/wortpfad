export const TRAINING_IDS=['translate','meaning','dictation','spelling'];
export const groupKey=(deck,training)=>`${deck}:${training}`;
export function localDay(now=new Date()){return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`}
export function goalFor(groups,deck,training){return groups?.goals?.[groupKey(deck,training)]||{size:10,target:1}}
export function groupCount(groups,deck,training,day=localDay()){return groups?.progress?.[groupKey(deck,training)]?.days?.[day]||0}
export function groupQueue(ids,groups,deck,training){const key=groupKey(deck,training),goal=goalFor(groups,deck,training),saved=groups?.progress?.[key]?.cursor||0,start=saved<ids.length?saved:0;return {queue:ids.slice(start,start+goal.size),groupStart:start}}
export function setGoal(groups,deck,training,size,target){
 if(!Number.isInteger(size)||size<1||size>100||!Number.isInteger(target)||target<1||target>20)throw Error('每组请输入 1～100 个词，每日请输入 1～20 组。');
 groups.goals[groupKey(deck,training)]={size,target};
}
export function creditGroup(groups,session,now=Date.now()){
 if(session.mode!=='learn'||session.groupCounted||!Number.isInteger(session.groupStart)||!session.queue.length||!session.resolved||session.index!==session.queue.length-1||session.events.length!==session.queue.length)return false;
 if(session.events.every(e=>e.outcome==='skipped'))return false;
 const key=groupKey(session.deck,session.training),p=groups.progress[key]||{cursor:0,days:{},last:0},day=localDay(new Date(now));
 p.cursor=session.groupEnd??session.groupStart+session.queue.length;p.days[day]=(p.days[day]||0)+1;p.last=now;groups.progress[key]=p;session.groupCounted=true;return true;
}
export function validGroups(value,decks){
 const clean={goals:{},progress:{}};if(!value)return clean;
 for(const deck of decks)for(const training of TRAINING_IDS){
  const key=groupKey(deck,training),g=value.goals?.[key],p=value.progress?.[key];
  if(g){if(!Number.isInteger(g.size)||g.size<1||g.size>100||!Number.isInteger(g.target)||g.target<1||g.target>20)throw Error('分组目标格式无效');clean.goals[key]={size:g.size,target:g.target}}
  if(p){if(!Number.isSafeInteger(p.cursor)||p.cursor<0||!Number.isFinite(p.last)||p.last<0||!p.days||typeof p.days!=='object'||Array.isArray(p.days))throw Error('分组进度格式无效');const days={};for(const [day,count]of Object.entries(p.days)){if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isSafeInteger(count)||count<0)throw Error('分组计数格式无效');days[day]=count}clean.progress[key]={cursor:p.cursor,last:p.last,days}}
 }
 return clean;
}
export function mergeGroups(current,incoming){
 for(const [key,g]of Object.entries(incoming.goals))current.goals[key]??=g;
 for(const [key,p]of Object.entries(incoming.progress)){const old=current.progress[key];if(!old){current.progress[key]=p;continue}const newer=p.last>old.last?p:old,days={...old.days};for(const [day,n]of Object.entries(p.days))days[day]=Math.max(days[day]||0,n);current.progress[key]={...newer,days}}
}
