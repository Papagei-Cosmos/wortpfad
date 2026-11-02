import {contextExample} from './training.js';
const TABS=[['detail','详解'],['phrases','词组'],['family','派生'],['conjugation','变位']];
const MOODS=[['indicative','直陈式'],['subjunctive1','第一虚拟式'],['subjunctive2','第二虚拟式'],['imperative','命令式'],['participles','分词']];
const PEOPLE=['ich','du','er/sie/es','wir','ihr','sie/Sie'];let serial=0;
const TITLES={present:['现在时','Präsens'],past:['过去时','Präteritum'],perfect:['现在完成时','Perfekt'],pluperfect:['过去完成时','Plusquamperfekt'],future1:['将来时','Futur I'],future2:['将来完成时','Futur II']};

function tenseTitle(mood,key){
 if(mood==='subjunctive2')return {present:['现在／非现实式','Konjunktiv II · Präteritum'],past:['过去／非现实式','Konjunktiv II · Plusquamperfekt'],future1:['würde 替代式','würde + Infinitiv'],future2:['würde 完成式','würde + Infinitiv Perfekt']}[key];
 const [zh,de]=TITLES[key];return [mood==='subjunctive1'?zh.replace('时','式'):zh,(mood==='subjunctive1'?'Konjunktiv I · ':'Indikativ · ')+de];
}
function pairTable(columns,mood,esc){
 return `<table class="conjugation-pair"><thead><tr><th scope="col" class="conj-person"><span class="sr-only">人称</span></th>${columns.map(([key])=>{const [zh,de]=tenseTitle(mood,key);return `<th scope="col"><span>${esc(zh)}</span><small>${esc(de)}</small></th>`}).join('')}</tr></thead><tbody>${PEOPLE.map((p,i)=>`<tr><th scope="row" lang="de">${p}</th>${columns.map(([,forms])=>`<td lang="de">${esc(forms[i]||'—')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
function moodHTML(variant,mood,esc){
 if(mood==='participles')return `<dl class="participle-list">${[['present','现在分词 · Partizip I'],['past','第二分词 · Partizip II'],['infinitive','不定式 · Infinitiv'],['zuInfinitive','带 zu 不定式'],['perfectInfinitive','完成不定式']].map(([key,label])=>`<div><dt>${label}</dt><dd lang="de">${esc(variant.participles?.[key]||'—')}</dd></div>`).join('')}</dl>`;
 if(mood==='imperative')return `<table class="imperative-table"><thead><tr><th>人称</th><th>命令式 · Imperativ</th></tr></thead><tbody>${['du','ihr','Sie'].map((p,i)=>`<tr><th scope="row" lang="de">${p}</th><td lang="de">${esc(variant.imperative?.[i]||'—')}</td></tr>`).join('')}</tbody></table>`;
 const columns=Object.entries(variant.moods?.[mood]||{});let out='';for(let i=0;i<columns.length;i+=2)out+=pairTable(columns.slice(i,i+2),mood,esc);return out||'<div class="detail-empty">本项变位资料待补齐。</div>';
}
function conjugationHTML(w,uid,esc){
 const c=w.conjugation;if(!c)return w.pos?.includes('动词')?'<div class="detail-empty">这个动词的变位资料待补齐。</div>':'<div class="nonverb-conjugation" aria-label="非动词，变位表留空"></div>';
 return `${c.note?`<p class="conjugation-note">${esc(c.note)}</p>`:''}${c.variants.length>1?`<div class="conjugation-variants" role="group" aria-label="动词用法">${c.variants.map((v,i)=>`<button type="button" data-conjugation-variant="${i}" aria-pressed="${i===0}">${esc(v.label)}</button>`).join('')}</div>`:''}${c.variants.map((v,i)=>`<div data-verb-variant="${i}" ${i?'hidden':''}><div class="conjugation-moods" role="tablist" aria-label="变位语气">${MOODS.map(([key,label])=>`<button type="button" role="tab" id="${uid}-mood-${i}-${key}" aria-controls="${uid}-forms-${i}-${key}" aria-selected="${key===(c.defaultMood||'indicative')}" tabindex="${key===(c.defaultMood||'indicative')?0:-1}" data-conjugation-mood="${key}">${label}</button>`).join('')}</div>${MOODS.map(([key])=>`<div role="tabpanel" class="conjugation-sheet" id="${uid}-forms-${i}-${key}" aria-labelledby="${uid}-mood-${i}-${key}" data-mood-panel="${key}" ${key===(c.defaultMood||'indicative')?'':'hidden'}>${moodHTML(v,key,esc)}</div>`).join('')}</div>`).join('')}<details class="source-detail conjugation-source"><summary>变位来源</summary><p>主动语态；词典资料${c.transformed?'及明确的反身／短语变换':''}，待人工核对。</p><a href="${esc(c.source.url)}" target="_blank" rel="noopener">Wiktionary · ${esc(c.source.lemma)}</a><p>CC BY-SA 4.0 · ${c.source.revision?'版本 '+esc(c.source.revision):'保留下载记录'}。未收录被动语态。</p></details>`;
}

export function wordDetailsHTML(w,{esc,genderOf,playButton,grammarHTML,exampleHTML,sourceHTML}){
 const uid='word-details-'+(++serial),family=w.derivations||[],fixed=w.fixedPhrases||[],context=w.collocations||[];
 const main=contextExample(w),remaining=w.examples.filter(e=>e.de!==main?.de);
 const detail=`${w.grammar?.type==='verb'?(w.grammar.usage?`<p class="word-usage">${esc(w.grammar.usage)}</p>`:''):grammarHTML(w)}<section class="content-section"><div class="section-label">${main?.teachingLevel?esc(main.teachingLevel)+' 分级例句':'例句'}</div>${main?exampleHTML(main):'<p class="content-zh">例句待补齐。</p>'}${remaining.length?`<details class="grammar-detail"><summary>其余 ${remaining.length} 条例句（保留原牌组）</summary>${remaining.map(exampleHTML).join('')}</details>`:''}</section>${sourceHTML(w)}`;
 const phrases=fixed.length?`<div class="phrase-list">${fixed.map(p=>`<article class="lexical-item"><p class="content-de" lang="de">${esc(p.de)}${p.kind==='government'?'':playButton(p.de,p.audio,'播放词组')}</p><p class="content-zh">${esc(p.zh)}</p>${p.note?`<small>${esc(p.note)}</small>`:''}</article>`).join('')}</div>`:'';
 const contexts=context.length?`<${fixed.length?'details':'section'} class="${fixed.length?'grammar-detail context-phrases':'context-phrases'}">${fixed.length?'<summary>更多搭配与语境用法</summary>':''}${context.map(c=>`<article class="lexical-item"><p class="content-de" lang="de">${esc(c.de)}${playButton(c.de,c.audio,'播放搭配')}</p><p class="content-zh">${esc(c.zh)}</p>${c.kind==='context-usage'?'<small>语境用法</small>':''}<details class="grammar-detail"><summary>${c.kind==='context-usage'?'原句语境':'搭配例句'}</summary><p lang="de">${esc(c.example)} ${playButton(c.example,c.exampleAudio,'播放搭配例句')}</p><p>${esc(c.exampleZh)}</p></details></article>`).join('')}</${fixed.length?'details':'section'}>`:'';
 const families=family.length?`<div class="family-list">${family.map(d=>`<article class="lexical-item"><p class="content-de gender-${d.article==='der'?'masculine':d.article==='die'?'feminine':d.article==='das'?'neuter':'other'}" lang="de">${esc(d.article?d.article+' ':'')}${esc(d.lemma)}${playButton((d.article&&d.article!=='der/die'?d.article+' ':'')+d.lemma,d.audio,'播放派生词')}</p><p class="content-zh">${esc(d.pos)} · ${esc(d.zh)}</p></article>`).join('')}</div>`:'<div class="detail-empty">这个词暂未收录派生或同词族形式。</div>';
 const panels={detail,phrases:phrases+contexts||'<div class="detail-empty">这个词暂未收录固定词组。</div>',family:families,conjugation:conjugationHTML(w,uid,esc)};
 return `<div class="word-details" data-word-details="${esc(w.id)}"><span class="eyebrow">单词详解</span><div class="word-detail-tabs" role="tablist" aria-label="单词学习内容">${TABS.map(([key,label])=>`<button type="button" role="tab" id="${uid}-tab-${key}" aria-controls="${uid}-${key}" aria-selected="${key==='detail'}" tabindex="${key==='detail'?0:-1}" data-details-tab="${key}">${label}</button>`).join('')}</div><div class="word-heading"><h2 lang="de" class="gender-${genderOf(w)}">${w.article?'<span class="article">'+esc(w.article)+'</span> ':''}${esc(w.lemma)}</h2>${playButton((w.article?w.article+' ':'')+w.lemma,w.audio,'播放单词')}</div><p class="word-zh">${esc(w.zh)}</p><span class="tag">${esc(w.pos)} · ${esc(w.level)}</span>${TABS.map(([key])=>`<div role="tabpanel" id="${uid}-${key}" aria-labelledby="${uid}-tab-${key}" data-details-panel="${key}" ${key==='detail'?'':'hidden'}>${panels[key]}</div>`).join('')}</div>`;
}

export function installWordDetails(root=document){
 const activate=(button,attr,panelAttr,scope)=>{
  const key=button.dataset[attr];scope.querySelectorAll(`[data-${attr.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}]`).forEach(b=>{const selected=b===button;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1});
  scope.querySelectorAll(`[data-${panelAttr.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}]`).forEach(p=>{p.hidden=p.dataset[panelAttr]!==key;if(!p.hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches)p.animate([{opacity:0,transform:'translateY(4px)'},{opacity:1,transform:'none'}],{duration:180,easing:'ease-out'})});
 };
 root.addEventListener('click',e=>{
  const tab=e.target.closest('[data-details-tab]');if(tab){activate(tab,'detailsTab','detailsPanel',tab.closest('[data-word-details]'));return}
  const mood=e.target.closest('[data-conjugation-mood]');if(mood){activate(mood,'conjugationMood','moodPanel',mood.closest('[data-verb-variant]'));return}
  const variant=e.target.closest('[data-conjugation-variant]');if(variant){const scope=variant.closest('[data-details-panel]');scope.querySelectorAll('[data-conjugation-variant]').forEach(b=>b.setAttribute('aria-pressed',String(b===variant)));scope.querySelectorAll('[data-verb-variant]').forEach(p=>p.hidden=p.dataset.verbVariant!==variant.dataset.conjugationVariant)}
 });
 root.addEventListener('keydown',e=>{
  const tab=e.target.closest('[role=tab][data-details-tab],[role=tab][data-conjugation-mood]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  e.preventDefault();const tabs=[...tab.parentElement.querySelectorAll('[role=tab]')],at=tabs.indexOf(tab),next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(at+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].click();tabs[next].focus({preventScroll:true});
 });
}
