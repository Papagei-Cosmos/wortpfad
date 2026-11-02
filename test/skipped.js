import {goalFor,groupKey} from './groups.js';
export const isSkipped=(skips,id)=>skips?.[id]?.skipped===true;
export function validSkips(value,ids){
 if(value===undefined)return {};
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('已跳过列表格式无效');
 const clean={};for(const [id,r]of Object.entries(value)){
  if(!ids.has(id))continue;
  if(!r||typeof r.skipped!=='boolean'||!Number.isFinite(r.at)||r.at<0||r.pending!==undefined&&typeof r.pending!=='boolean')throw Error('已跳过记录无效');
  clean[id]={skipped:r.skipped,at:r.at,pending:!r.skipped&&r.pending===true};
 }return clean;
}
export function mergeSkips(current,incoming){for(const [id,r]of Object.entries(incoming)){const old=current[id];if(!old||r.at>old.at||r.at===old.at&&old.skipped&&!r.skipped)current[id]={...r}}}
export function setSkipped(skips,id,skipped,now=Date.now()){skips[id]={skipped,at:now,pending:!skipped}}
export function finishRestored(skips,id,now=Date.now()){if(skips[id]&&!skips[id].skipped&&skips[id].pending)skips[id]={skipped:false,at:now,pending:false}}
export function learningQueue(ids,groups,deck,training,skips){
 const size=goalFor(groups,deck,training).size,cursor=groups.progress?.[groupKey(deck,training)]?.cursor||0,start=cursor<ids.length?cursor:0;
 const queue=ids.filter(id=>skips?.[id]?.pending&&!isSkipped(skips,id)).sort((a,b)=>skips[a].at-skips[b].at).slice(0,size);
 let end=start;while(queue.length<size&&end<ids.length){const id=ids[end++];if(!isSkipped(skips,id)&&!queue.includes(id))queue.push(id)}
 return {queue,groupStart:start,groupEnd:end,targetSize:queue.length};
}
export function refillSkipped(session,ids,skips){
 if(session.mode!=='learn')return;
 session.targetSize??=session.queue.length-session.events.filter(e=>e.outcome==='skipped').length+1;
 let end=session.groupEnd??Math.max(0,ids.indexOf(session.queue.at(-1))+1);
 const skipped=session.events.filter(e=>e.outcome==='skipped').length;
 while(session.queue.length-skipped<session.targetSize&&end<ids.length){const id=ids[end++];if(!isSkipped(skips,id)&&!session.queue.includes(id))session.queue.push(id)}
 session.groupEnd=end;
}
