import {answersFor,checkAnswer} from './core.js';
export const TRAININGS={
 translate:{name:'中译德',de:'ÜBERSETZUNG',label:'看中文，写德语',hint:'根据中文和词性，写出对应德语。名词默认包含冠词。'},
 meaning:{name:'德译中',de:'VERSTÄNDNIS',label:'看德语，选中文',hint:'阅读德语词条和例句，推测词义并选择中文。答对后展开详解。'},
 dictation:{name:'听写',de:'DIKTAT',label:'听发音，写单词',hint:'点击播放，听清后写出德语。名词默认包含冠词。'},
 spelling:{name:'拼写',de:'RECHTSCHREIBUNG',label:'看一遍，再拼写',hint:'先观察单词 3 秒，再凭记忆写下完整拼写。'}
};
export const posLabel=w=>({'名词':'N. 名词','动词':'V. 动词','形容词':'Adj. 形容词','副词':'Adv. 副词','介词':'Präp. 介词','代词':'Pron. 代词','连词':'Konj. 连词','数词':'Num. 数词','礼貌用语':'Redemittel · 礼貌用语'}[w.pos]||(w.pos&&w.pos!=='其他'?w.pos:'词性待细分'));
export function trainingAnswers(w,s){return s.training==='meaning'?[w.id]:answersFor(w,s.article)}
export function trainingCorrect(input,w,s){return s.training==='meaning'?input===w.id:checkAnswer(input,w,s.article)}
export function contextExample(word){
 const leveled=(word.teachingExamples||[]).filter(e=>e.teachingLevel===(word.exampleTargetLevel||word.level)&&e.practiceEligible!==false&&e.de?.trim());
 if(leveled.length)return leveled.find(e=>e.practicePreferred)||leveled[0];
 const examples=(word.examples||[]).filter(e=>e.practiceEligible!==false&&typeof e.de==='string'&&e.de.trim());
 const originals=examples.filter(e=>e.source==='local-anki'&&e.de.length<=150);
 return examples.find(e=>e.practicePreferred)||originals[0]||examples[0]||null;
}
export function meaningChoices(word,all){
 const correctZh=contextExample(word)?.senseZh||word.zh;let others=all.filter(w=>w.id!==word.id&&(!word.lemma||w.lemma!==word.lemma)&&w.practice!==false&&w.zh&&w.zh!==correctZh);const levelPool=others.filter(w=>w.level===word.level);if(levelPool.length>=3)others=levelPool;
 const same=others.filter(w=>w.pos===word.pos),pool=same.length>=3?same:others;
 let seed=[...word.id].reduce((a,c)=>a+c.charCodeAt(0),0);const choices=[{...word,zh:correctZh}],seen=new Set([correctZh]);
 for(let i=0;i<pool.length&&choices.length<4;i++){const w=pool[(seed+i*17)%pool.length];if(!seen.has(w.zh)){choices.push(w);seen.add(w.zh)}}
 for(const w of pool){if(choices.length>=4)break;if(!seen.has(w.zh)){choices.push(w);seen.add(w.zh)}}
 const at=seed%choices.length;return [...choices.slice(at),...choices.slice(0,at)].map(w=>({id:w.id,zh:w.zh}));
}
