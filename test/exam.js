// Pure grammar practice state. Vocabulary/SRS records are intentionally separate.
import {blankPaperState,validPaperState,mergePaperState} from './exam-papers.js';
export const EXAM_LEVELS=['A1','A2','B1','B2','C1'];
const outcomes=new Set(['first','retry','revealed']),idPattern=/^g[abc]-\d{2}-\d{2}$/;
export const blankExamState=()=>({version:1,records:{},active:null,papers:blankPaperState()});
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const timestamp=v=>Number.isFinite(v)&&v>=0;
function result(r){return object(r)&&outcomes.has(r.outcome)&&timestamp(r.at)&&Number.isInteger(r.attempts)&&r.attempts>=0&&r.attempts<=3}
export function validExamState(input){
 const out=blankExamState();if(!object(input)||input.version!==1)return out;out.papers=validPaperState(input.papers);
 if(object(input.records))for(const [id,r]of Object.entries(input.records).slice(0,5000))if(idPattern.test(id)&&result(r))out.records[id]={outcome:r.outcome,at:r.at,attempts:r.attempts};
 const a=input.active;
 if(!object(a)||!EXAM_LEVELS.includes(a.level)||!Number.isInteger(a.chapter)||a.chapter<0||a.chapter>288||!Number.isInteger(a.seed)||a.seed<0||a.seed>0xffffffff||!timestamp(a.startedAt)||!Array.isArray(a.queue)||!a.queue.length||a.queue.length>2000||new Set(a.queue).size!==a.queue.length||!a.queue.every(id=>typeof id==='string'&&idPattern.test(id))||!Number.isInteger(a.index)||a.index<0||a.index>a.queue.length||!object(a.results)||!object(a.wrong))return out;
 const clean={level:a.level,chapter:a.chapter,seed:a.seed,startedAt:a.startedAt,queue:[...a.queue],index:a.index,results:{},wrong:{}};
 for(let i=0;i<a.queue.length;i++){
  const id=a.queue[i],r=a.results[id],w=a.wrong[id];
  if(w!==undefined&&(!Array.isArray(w)||w.length>3||w.some(s=>typeof s!=='string'||s.length>500)||new Set(w).size!==w.length))return out;
  if(w?.length)clean.wrong[id]=[...w];
  if(i<a.index&&!result(r)||i>a.index&&r!==undefined||r!==undefined&&!result(r))return out;
  if(result(r)){if(r.outcome==='first'&&w?.length||r.outcome==='retry'&&!w?.length||r.attempts!==(w?.length||0))return out;clean.results[id]={outcome:r.outcome,at:r.at,attempts:r.attempts}}
 }
 out.active=clean;return out;
}
export function mergeExamState(target,incoming){
 target.papers=mergePaperState(target.papers||blankPaperState(),incoming.papers||blankPaperState());
 for(const [id,r]of Object.entries(incoming.records))if(!target.records[id]||r.at>target.records[id].at)target.records[id]={...r};
 if(!target.active&&incoming.active)target.active=incoming.active;return target;
}
function random(seed){let x=seed>>>0;return()=>{x=(x+0x6D2B79F5)>>>0;let t=Math.imul(x^(x>>>15),1|x);t^=t+Math.imul(t^(t>>>7),61|t);return((t^(t>>>14))>>>0)/4294967296}}
function shuffle(list,rand){const out=[...list];for(let i=out.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
export function examChoices(item,seed){const suffix=Number(item.id.split('-').slice(1).join(''));return shuffle(item.choices,random((seed^Math.imul(suffix,2654435761))>>>0))}
export function examPool(items,level,chapter=0){return items.filter(q=>q.level===level&&(!chapter||q.chapter===chapter))}
export function makeExamRound(items,level,chapter,records,size=10,seed=0,weak=false,now=Date.now()){
 const pool=examPool(items,level,chapter).filter(q=>!weak||records[q.id]&&records[q.id].outcome!=='first');if(!pool.length)return null;
 const rand=random(seed),buckets=new Map();
 // Prefer unseen/weak questions, rotate through chapters for a mixed round.
 for(const q of shuffle(pool,rand)){if(!buckets.has(q.chapter))buckets.set(q.chapter,[]);buckets.get(q.chapter).push(q)}
 const priority=q=>!records[q.id]?0:records[q.id].outcome!=='first'?1:2;
 for(const b of buckets.values())b.sort((a,b)=>priority(a)-priority(b));
 const ordered=[],groups=shuffle([...buckets.values()],rand);
 while(groups.some(g=>g.length))for(const g of groups)if(g.length)ordered.push(g.shift().id);
 return {level,chapter,seed:seed>>>0,startedAt:now,queue:ordered.slice(0,Math.max(1,Math.min(Number(size)||10,2000))),index:0,results:{},wrong:{}};
}
export function usableExamRound(a,itemMap){
 if(!a)return false;const valid=validExamState({version:1,records:{},active:a}).active;if(!valid)return false;
 return a.queue.every(id=>{const q=itemMap.get(id);return q&&q.level===a.level&&(!a.chapter||q.chapter===a.chapter)&&(a.wrong[id]||[]).every(v=>q.choices.includes(v)&&v!==q.answer)});
}
export function answerExam(exam,itemMap,value,now=Date.now()){
 const a=exam.active;if(!usableExamRound(a,itemMap)||a.index>=a.queue.length)return 'ignored';const q=itemMap.get(a.queue[a.index]);
 if(a.results[q.id]||!q.choices.includes(value))return 'ignored';const wrong=a.wrong[q.id]||[];
 if(value!==q.answer){if(wrong.includes(value))return 'ignored';a.wrong[q.id]=[...wrong,value];return 'wrong'}
 const r={outcome:wrong.length?'retry':'first',attempts:wrong.length,at:now};a.results[q.id]=r;exam.records[q.id]={...r};return r.outcome;
}
export function revealExam(exam,itemMap,now=Date.now()){
 const a=exam.active;if(!usableExamRound(a,itemMap)||a.index>=a.queue.length)return false;const id=a.queue[a.index];if(a.results[id])return false;
 const r={outcome:'revealed',attempts:(a.wrong[id]||[]).length,at:now};a.results[id]=r;exam.records[id]={...r};return true;
}
export function nextExam(exam,itemMap){const a=exam.active;if(!usableExamRound(a,itemMap)||a.index>=a.queue.length||!a.results[a.queue[a.index]])return false;a.index++;return true}
