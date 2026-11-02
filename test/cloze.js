import {localDay} from './groups.js';
export const blankClozeState=()=>({version:1,records:{},active:null});
const object=x=>x&&typeof x==='object'&&!Array.isArray(x),dayKey=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s),outcomes=new Set(['first','retry','revealed']);
function validResult(r){return object(r)&&dayKey(r.day)&&outcomes.has(r.outcome)&&Number.isSafeInteger(r.attempts)&&r.attempts>=0&&r.attempts<=1000&&Number.isFinite(r.at)&&r.at>0}
export function validClozeState(input,known){
 if(input==null)return blankClozeState();if(!object(input)||!object(input.records))throw Error('填空记录格式不正确');
 const result=blankClozeState(),entries=Object.entries(input.records);if(entries.length>Math.max(3000,known.size))throw Error('填空记录过多');
 for(const [id,r] of entries){if(!known.has(id))continue;if(!validResult(r))throw Error('填空成绩格式不正确');result.records[id]={day:r.day,outcome:r.outcome,attempts:r.attempts,at:r.at}}
 const a=input.active;
 if(a!=null){
  if(!object(a)||!dayKey(a.day)||!Array.isArray(a.queue)||a.queue.length>10000||a.queue.some(id=>typeof id!=='string'||!/^[a-f0-9]{20}$/.test(id))||new Set(a.queue).size!==a.queue.length||!Number.isSafeInteger(a.index)||a.index<0||a.index>a.queue.length||!Number.isSafeInteger(a.seed)||a.seed<0||a.seed>0xffffffff||!object(a.results)||!object(a.wrong))throw Error('填空进度格式不正确');
  const results={},wrong={};for(const id of a.queue){const r=a.results[id];if(r){if(!validResult(r)||r.day!==a.day||!known.has(r.wordId))throw Error('填空题结果格式不正确');results[id]={wordId:r.wordId,day:r.day,outcome:r.outcome,attempts:r.attempts,at:r.at}}const choices=a.wrong[id];if(choices){if(!Array.isArray(choices)||choices.length>3||choices.some(c=>typeof c!=='string'||c.length>120))throw Error('填空错选记录不正确');wrong[id]=[...new Set(choices)]}}
  result.active={day:a.day,queue:[...a.queue],seed:a.seed,index:a.index,results,wrong};
 }
 return result;
}
export function mergeClozeState(target,incoming){for(const [id,r]of Object.entries(incoming.records))if(!target.records[id]||r.at>target.records[id].at)target.records[id]={...r};if(!target.active&&incoming.active)target.active=incoming.active;return target}
export function dailyWordIds(records,words,skips={},day=localDay()){
 return Object.entries(records).filter(([id,r])=>words.has(id)&&words.get(id).practice&&!skips[id]?.skipped&&Number.isFinite(r.last)&&localDay(new Date(r.last))===day).map(([id])=>id);
}
function hash(text){let v=2166136261;for(const c of String(text)){v^=c.codePointAt(0);v=Math.imul(v,16777619)}return v>>>0}
function shuffle(values,seed){const result=[...values];let n=seed||1;for(let i=result.length-1;i>0;i--){n=(Math.imul(n,1664525)+1013904223)>>>0;const j=n%(i+1);[result[i],result[j]]=[result[j],result[i]]}return result}
const SYNONYMS=[['Bahn','Zug'],['Arzt','Doktor'],['Job','Arbeit','Stelle'],['bekommen','kriegen'],['bezahlen','zahlen'],['gehen','laufen'],['Telefon','Handy']];
const poolCache=new WeakMap();
function levelPool(words,level){let cache=poolCache.get(words);if(!cache){const all=[...words.values()].filter(w=>w.practice),levels=new Map();for(const w of all){if(!levels.has(w.level))levels.set(w.level,[]);levels.get(w.level).push(w)}cache={all,levels};poolCache.set(words,cache)}const same=cache.levels.get(level)||[];return same.length>=4?same:cache.all}
function similar(a,b){if(a.zh===b.zh)return true;if(SYNONYMS.some(g=>g.includes(a.lemma)&&g.includes(b.lemma)))return true;const split=w=>w.zh.split(/[；;／/]/).map(x=>x.replace(/（.*?）/g,'').trim()).filter(x=>x.length>=2);return split(a).some(x=>split(b).includes(x))}
function optionForm(w,item){
 const m=item.morph||{},v=w.conjugation?.variants[0];let text=w.lemma;
 if(m.kind==='verb'&&v)text=v.moods.indicative[m.tense]?.[m.person]?.split(' / ')[0].split(' ')[0]||'';
 else if(m.kind==='participle'&&v)text=v.participles.past;
 else if(m.kind==='noun')text=w.grammar.forms?.[m.form]||w.lemma;
 else if(m.kind==='adjective')text=w.lemma+(m.ending||'');
 if(!text||text==='—'||text.length>70)return null;
 if(item.start===0)text=text[0].toUpperCase()+text.slice(1);
 return text;
}
export function clozeChoices(item,words,todayIds=[],seed=0){
 const target=words.get(item.wordId);if(!target)throw Error('填空词条不存在');
 let all=levelPool(words,target.level).filter(w=>w.id!==target.id&&w.lemma!==target.lemma&&!similar(w,target));if(all.length<3)all=[...words.values()].filter(w=>w.practice&&w.lemma!==target.lemma&&!similar(w,target));const pos=item.morph.kind==='focus-verb'||item.morph.focus?'动词':item.morph.kind==='focus-noun'?'名词':target.pos,same=all.filter(w=>w.pos===pos&&(!item.gaps||w.clozePair)),preferred=same.length>=3?same:all,today=new Set(todayIds);
 const ordered=shuffle(preferred,hash(item.id)^seed).sort((a,b)=>Number(today.has(b.id))-Number(today.has(a.id))),choices=[item.answer],seen=new Set([item.answer.normalize('NFC').toLocaleLowerCase('de')]);
 for(const w of ordered){const text=optionForm(w,item),key=text?.normalize('NFC').toLocaleLowerCase('de');if(text&&!seen.has(key)){seen.add(key);choices.push(text)}if(choices.length===4)break}
 if(choices.length<4)for(const w of shuffle(all,hash(item.id+'fallback')^seed)){const text=w.lemma,key=text.toLocaleLowerCase('de');if(!seen.has(key)){seen.add(key);choices.push(text)}if(choices.length===4)break}
 if(choices.length!==4)throw Error('可用填空选项不足');return shuffle(choices,hash(item.id+'positions')^seed);
}
export function makeClozeRound(items,ids,records,size=10,seed=0,day=localDay(),wrongOnly=false){
 const eligible=new Set(ids),map=new Map();for(const item of items)if(eligible.has(item.wordId)){if(!map.has(item.wordId))map.set(item.wordId,[]);map.get(item.wordId).push(item)}
 let ordered=shuffle([...map.keys()],seed);if(wrongOnly)ordered=ordered.filter(id=>records[id]?.day===day&&records[id].outcome!=='first');
 else ordered.sort((a,b)=>Number(records[a]?.day===day)-Number(records[b]?.day===day));
 const count=Number.isFinite(size)?Math.max(1,Math.min(10000,Math.floor(size))):10000;
 return {day,seed,index:0,queue:ordered.slice(0,count).map(id=>{const options=map.get(id);return options[hash(id+seed)%options.length].id}),results:{},wrong:{}};
}
export function usableRound(round,itemMap,todayIds,day=localDay()){
 if(!round||round.day!==day||!round.queue.length)return false;
 const today=new Set(todayIds),wordIds=new Set();for(const id of round.queue){const item=itemMap.get(id);if(!item||!today.has(item.wordId)||wordIds.has(item.wordId))return false;if(round.results[id]&&(round.results[id].wordId!==item.wordId||round.results[id].day!==day))return false;wordIds.add(item.wordId)}
 return round.queue.slice(0,round.index).every(id=>round.results[id]);
}
