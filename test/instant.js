import {localDay} from './groups.js';
import {isSkipped} from './skipped.js';
export const blankInstantState=()=>({version:1,goal:'30',records:{},active:null,updated:0});
const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
const day=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s);
export function instantGoal(value){const s=String(value).trim();if(!/^\d+$/.test(s)||!/[1-9]/.test(s))throw Error('请输入大于 0 的整数。');return s.replace(/^0+/,'')}
export function validInstantState(value,known,decks){
 const clean=blankInstantState();if(value==null)return clean;
 if(!object(value)||!object(value.records))throw Error('瞬时记忆记录格式无效');
 clean.goal=instantGoal(value.goal??30);clean.updated=Number.isFinite(value.updated)?value.updated:0;
 for(const [id,r]of Object.entries(value.records)){
  if(!known.has(id))continue;
  if(!object(r)||!Number.isFinite(r.first)||r.first<=0||!Number.isFinite(r.last)||r.last<r.first||!day(r.dueDay)||!Number.isSafeInteger(r.streak)||r.streak<0||typeof r.recognized!=='boolean')throw Error('瞬时记忆单词记录无效');
  clean.records[id]={first:r.first,last:r.last,dueDay:r.dueDay,streak:r.streak,recognized:r.recognized};
 }
 const a=value.active;
 if(a!=null){
  const ids=x=>Array.isArray(x)&&x.every(id=>typeof id==='string'&&known.has(id))&&new Set(x).size===x.length;
  if(!object(a)||!decks.has(a.deck)||!['new','review'].includes(a.mode)||!day(a.day)||!ids(a.ids)||!ids(a.queue)||a.queue.some(id=>!a.ids.includes(id))||!['recall','answer'].includes(a.phase)||![null,true,false].includes(a.choice)||!Number.isInteger(a.recited)||a.recited<0||a.recited>2||!Number.isSafeInteger(a.visits)||a.visits<0||!Number.isFinite(a.updated))throw Error('瞬时记忆练习进度无效');
  if(a.phase==='recall'&&(a.choice!==null||a.recited!==0)||a.phase==='answer'&&a.choice===null)throw Error('瞬时记忆作答状态无效');
  clean.active={deck:a.deck,mode:a.mode,day:a.day,ids:[...a.ids],queue:[...a.queue],phase:a.phase,choice:a.choice,recited:a.recited,visits:a.visits,updated:a.updated};
 }
 return clean;
}
export function mergeInstantState(target,incoming,{active=false}={}){
 let changed=false;for(const [id,r]of Object.entries(incoming.records)){const old=target.records[id];if(!old||r.last>old.last){target.records[id]={...r,first:Math.min(r.first,old?.first??r.first)};changed=true}}
 if(incoming.updated>target.updated){target.goal=incoming.goal;target.updated=incoming.updated;changed=true}
 if(active&&incoming.active&&(!target.active||incoming.active.updated>target.active.updated)){target.active=incoming.active;changed=true}return changed;
}
export function instantCounts(practice,deck,words,skips={},today=localDay()){
 const ids=deck.ids.filter(id=>words.get(id)?.practice&&words.get(id)?.zh&&!isSkipped(skips,id));
 const learnedToday=Object.values(practice.records).filter(r=>localDay(new Date(r.first))===today).length;
 const remaining=BigInt(practice.goal)>BigInt(learnedToday)?BigInt(practice.goal)-BigInt(learnedToday):0n;
 const unseen=ids.filter(id=>!practice.records[id]);
 return {learnedToday,unseen:unseen.length,newIds:unseen.slice(0,Number(remaining)),dueIds:ids.filter(id=>practice.records[id]?.dueDay<=today)};
}
export function startInstant(practice,deck,words,skips,mode='new',now=Date.now()){
 const today=localDay(new Date(now)),counts=instantCounts(practice,deck,words,skips,today),ids=mode==='review'?counts.dueIds:counts.newIds;
 practice.active={deck:deck.id,mode,day:today,ids:[...ids],queue:[...ids],phase:'recall',choice:null,recited:0,visits:0,updated:now};return practice.active;
}
export function chooseInstant(practice,known,now=Date.now()){
 const a=practice.active;if(!a?.queue.length||a.phase!=='recall')return false;
 a.phase='answer';a.choice=!!known;a.recited=0;a.updated=now;return true;
}
export function reciteInstant(practice,now=Date.now()){
 const a=practice.active;if(a?.phase!=='answer'||a.choice!==false||a.recited>=2)return false;a.recited++;a.updated=now;return true;
}
function afterDays(now,days){const d=new Date(now);d.setDate(d.getDate()+days);return localDay(d)}
export function advanceInstant(practice,now=Date.now()){
 const a=practice.active;if(!a?.queue.length||a.phase!=='answer'||a.choice===false&&a.recited<2)return false;
 const id=a.queue.shift(),old=practice.records[id],today=localDay(new Date(now));
 const streak=a.choice?(old&&localDay(new Date(old.last))===today?Math.max(1,old.streak):Math.min(6,(old?.streak||0)+1)):0;
 practice.records[id]={first:old?.first||now,last:now,dueDay:afterDays(now,a.choice?[1,3,7,14,30,60][Math.max(0,streak-1)]:1),streak,recognized:a.choice};
 // Keep only one queued copy per word; repeat unknown words after up to three others.
 if(!a.choice)a.queue.splice(Math.min(3,a.queue.length),0,id);
 a.visits++;a.phase='recall';a.choice=null;a.recited=0;a.updated=now;return true;
}
export function pruneInstant(practice,skips,now=Date.now()){
 const a=practice.active;if(!a)return false;const current=a.queue[0],ids=a.ids.filter(id=>!isSkipped(skips,id));if(ids.length===a.ids.length)return false;
 a.ids=ids;a.queue=a.queue.filter(id=>!isSkipped(skips,id));if(current!==a.queue[0]){a.phase='recall';a.choice=null;a.recited=0}a.updated=now;return true;
}
export function instantTodayRecords(state){
 const records={...state.records};for(const [id,r]of Object.entries(state.instantPractice?.records||{}))if(!records[id]||r.last>records[id].last)records[id]={last:r.last,lastOutcome:r.recognized?'instant-known':'instant-repeat'};return records;
}
