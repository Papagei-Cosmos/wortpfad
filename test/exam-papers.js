// Independent paper drafts/results, nested inside examPractice for existing backups.
import {PAPER_CATALOG} from './exam-paper-catalog.js';
export const PAPER_IDS=Object.keys(PAPER_CATALOG);
export const PAPER_MODES=['reading','listening'];
const specFor=key=>{const parts=key.split(':');return parts.length===2?PAPER_CATALOG[parts[0]]?.modes[parts[1]]:undefined};
const keyPattern={test:key=>!!specFor(key)};
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const time=v=>Number.isFinite(v)&&v>=0;
const totalFor=key=>specFor(key)?.total||0;
function indices(a,key){
 const spec=specFor(key);if(!object(a)||!spec)return false;
 if(!Object.entries(a).every(([k,v])=>{const n=Number(k);return String(n)===k&&Number.isInteger(n)&&n>=1&&n<=spec.total&&Number.isInteger(v)&&v>=0&&v<spec.choiceCounts[n-1]}))return false;
 return spec.exclusiveGroups.every(group=>{const values=group.filter(n=>a[n]!==undefined).map(n=>a[n]);return new Set(values).size===values.length});
}
export const blankPaperState=()=>({drafts:{},results:{}});
export function validPaperState(v){
 const out=blankPaperState();if(!object(v))return out;
 if(object(v.results))for(const [k,r]of Object.entries(v.results))if(keyPattern.test(k)&&object(r)&&time(r.at)&&indices(r.answers,k)&&Object.keys(r.answers).length===totalFor(k))out.results[k]={at:r.at,answers:{...r.answers}};
 if(object(v.drafts))for(const [k,d]of Object.entries(v.drafts)){
  if(!keyPattern.test(k)||!object(d)||!Array.isArray(d.queue)||!d.queue.length||d.queue.length>totalFor(k)||new Set(d.queue).size!==d.queue.length||!d.queue.every(n=>Number.isInteger(n)&&n>=1&&n<=totalFor(k))||!indices(d.answers,k)||Object.keys(d.answers).some(n=>!d.queue.includes(Number(n)))||!Number.isInteger(d.index)||d.index<0||d.index>=d.queue.length||!time(d.updatedAt)||!time(d.startedAt)||!time(d.submittedAt)||!time(d.audioTime)||d.audioTime>PAPER_CATALOG[k.split(':')[0]].maxAudio||d.submittedAt&&d.queue.some(n=>d.answers[n]===undefined))continue;
  out.drafts[k]={queue:[...d.queue],index:d.index,answers:{...d.answers},audioTime:d.audioTime,startedAt:d.startedAt,updatedAt:d.updatedAt,submittedAt:d.submittedAt};
 }
 return out;
}
export function mergePaperState(target,incoming){
 for(const [key,r]of Object.entries(incoming.results))if(!target.results[key]||r.at>target.results[key].at)target.results[key]={at:r.at,answers:{...r.answers}};
 for(const [key,d]of Object.entries(incoming.drafts))if(!target.drafts[key])target.drafts[key]=structuredClone(d);
 return target;
}
export function beginPaper(state,paper,mode,weak=false,now=Date.now()){
 const key=paper.id+':'+mode,result=state.results[key],queue=paper[mode].filter(q=>!weak||result&&result.answers[q.number]!==q.choices.indexOf(q.answer)).map(q=>q.number);
 if(!queue.length)return null;
 state.drafts[key]={queue,index:0,answers:{},audioTime:0,startedAt:now,updatedAt:now,submittedAt:0};return state.drafts[key];
}
export function paperChoiceUsed(d,paper,mode,q,value){
 if(!q.matchGroup)return null;
 const other=paper[mode].find(other=>other.number!==q.number&&other.matchGroup===q.matchGroup&&d.answers[other.number]!==undefined&&other.choices[d.answers[other.number]]===q.choices[value]);return other?.number??null;
}
export function usablePaperDraft(d,paper,mode){return !!d&&d.queue.every(n=>{const q=paper[mode].find(q=>q.number===n);return q&&(d.answers[n]===undefined||d.answers[n]<q.choices.length&&!paperChoiceUsed(d,paper,mode,q,d.answers[n]))});}
export function choosePaper(d,paper,mode,value,now=Date.now()){
 if(!usablePaperDraft(d,paper,mode)||d.submittedAt)return false;const q=paper[mode].find(q=>q.number===d.queue[d.index]);
 if(!Number.isInteger(value)||value<0||value>=q.choices.length||paperChoiceUsed(d,paper,mode,q,value))return false;d.answers[q.number]=value;d.updatedAt=now;return true;
}
export function submitPaper(state,paper,mode,now=Date.now()){
 const key=paper.id+':'+mode,d=state.drafts[key];if(!usablePaperDraft(d,paper,mode)||d.submittedAt||d.queue.some(n=>d.answers[n]===undefined))return false;
 d.submittedAt=now;d.updatedAt=now;if(d.queue.length===paper[mode].length)state.results[key]={at:now,answers:{...d.answers}};return true;
}
export function paperScore(answers,questions){return questions.filter(q=>answers[q.number]===q.choices.indexOf(q.answer)).length;}
