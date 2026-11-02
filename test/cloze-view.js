import {applyClozeRecordingLinks} from './recording-links.js';
import {dailyWordIds,clozeChoices,makeClozeRound,usableRound} from './cloze.js';
import {localDay} from './groups.js';
import {shakeChoice,revealContent,enter} from './motion.js';
import {articleCreditHTML} from './example-sources.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export class ClozeView{
 constructor(options){Object.assign(this,options);this.size=10;this.ticket=0;this.items=null;this.root.addEventListener('keydown',e=>this.key(e))}
 cancel(){this.ticket++}
 ids(){return dailyWordIds(this.state.records,this.words,this.state.skips)}
 get active(){return this.state.contextPractice.active}
 async open(){
  const ticket=++this.ticket;this.root.innerHTML='<div class="cloze-loading" role="status">正在整理今天学过的词……</div>';
  try{
   if(!this.items){const res=await fetch('data/cloze-leveled-bank.json');if(!res.ok)throw Error('题库暂时无法读取');const bank=await res.json();if(!Array.isArray(bank.items))throw Error('题库格式不正确');this.items=bank.items;applyClozeRecordingLinks(this.items);this.itemMap=new Map(this.items.map(i=>[i.id,i]))}
   if(ticket!==this.ticket||this.root.hidden)return;
   if(this.active&&!usableRound(this.active,this.itemMap,this.ids())){this.state.contextPractice.active=null;this.onSave()}
   this.render();
  }catch(error){if(ticket!==this.ticket)return;this.root.innerHTML=`<div class="cloze-empty"><h1>暂时没有载入题目</h1><p>${esc(error.message)}</p><button id="clozeReload" class="primary">重新载入</button><button id="clozeHome" class="text-button">返回首页</button></div>`;this.root.querySelector('#clozeReload').onclick=()=>this.open();this.root.querySelector('#clozeHome').onclick=this.onHome}
 }
 begin(wrongOnly=false){
  const random=new Uint32Array(1);crypto.getRandomValues(random);let ids=this.ids();if(wrongOnly&&this.active){const weak=new Set(Object.values(this.active.results).filter(r=>r.outcome!=='first').map(r=>r.wordId));ids=ids.filter(id=>weak.has(id))}this.onStop();this.state.contextPractice.active=makeClozeRound(this.items,ids,this.state.contextPractice.records,this.size,random[0],localDay());this.onSave();this.render();window.scrollTo(0,0);
 }
 header(){return `<div class="cloze-top"><button id="clozeHome" class="text-button">← 返回首页</button><span>语境填空</span><button id="clozeToday" class="text-button">今日所学</button></div>`}
 render(){
  const ids=this.ids(),todaySet=new Set(ids),day=localDay(),available=new Set(this.items.filter(i=>todaySet.has(i.wordId)).map(i=>i.wordId)),records=this.state.contextPractice.records,practiced=ids.filter(id=>records[id]?.day===day).length;
  if(this.active&&!usableRound(this.active,this.itemMap,ids,day)){this.onStop();this.state.contextPractice.active=null;this.onSave()}
  let body='';
  if(!ids.length)body=`<section class="cloze-empty"><span class="eyebrow">LÜCKENTEXT</span><h1>把今天学过的词，放进句子里。</h1><p>今天还没有已学单词。先学几个词，回来练习它们的用法。</p><button id="clozeLearn" class="primary">去学单词 →</button></section>`;
  else if(!this.active)body=`<section class="cloze-intro"><span class="eyebrow">LÜCKENTEXT · 今日词汇应用</span><h1>今天记住的词，会用了吗？</h1><p>根据今天已学的 ${ids.length} 个词，从句子中选出合适的表达。</p><div class="cloze-overview"><span><b>${available.size}</b> 可练习词</span><span><b>${practiced}</b> 今日已练</span></div><label class="cloze-size-label" for="clozeSize">每组题数<select id="clozeSize">${[10,20,10000].map(n=>`<option value="${n}" ${n===this.size?'selected':''}>${n===10000?'全部今日词':n+' 题'}</option>`).join('')}</select></label><button id="clozeStart" class="primary" ${available.size?'':'disabled'}>开始填空 →</button><p class="cloze-caption">德语句子配中文情境，点选即作答。答后可以朗读和查看词条详解。</p></section>`;
  else if(this.active.index>=this.active.queue.length)body=this.summary();
  else body=this.question();
  this.root.innerHTML=this.header()+body;this.bindCommon();
  if(this.root.querySelector('#clozeStart'))this.root.querySelector('#clozeStart').onclick=()=>this.begin();
  if(this.root.querySelector('#clozeSize'))this.root.querySelector('#clozeSize').onchange=e=>this.size=Number(e.target.value);
  if(this.root.querySelector('#clozeLearn'))this.root.querySelector('#clozeLearn').onclick=this.onLearn;
  if(this.root.querySelector('#clozeAnother'))this.root.querySelector('#clozeAnother').onclick=()=>this.begin();
  if(this.root.querySelector('#clozeHomeBottom'))this.root.querySelector('#clozeHomeBottom').onclick=this.onHome;
  if(this.root.querySelector('#clozeRetry'))this.root.querySelector('#clozeRetry').onclick=()=>this.begin(true);
  if(this.root.querySelector('#clozeReset'))this.root.querySelector('#clozeReset').onclick=()=>{this.onStop();this.state.contextPractice.active=null;this.onSave();this.render()};
  this.root.querySelectorAll('[data-cloze-choice]').forEach(b=>b.onclick=e=>this.answer(b.dataset.clozeChoice,b,e));
  if(this.root.querySelector('#clozeReveal'))this.root.querySelector('#clozeReveal').onclick=()=>this.reveal();
  if(this.root.querySelector('#clozeNext'))this.root.querySelector('#clozeNext').onclick=()=>this.next();
  if(this.active&&this.active.index<this.active.queue.length)(this.root.querySelector('#clozeNext')||this.root.querySelector('[data-cloze-choice]'))?.focus({preventScroll:true});
 }
 bindCommon(){this.root.querySelector('#clozeHome').onclick=this.onHome;this.root.querySelector('#clozeToday').onclick=this.onToday}
 question(){
  const a=this.active,item=this.itemMap.get(a.queue[a.index]),result=a.results[item.id],options=clozeChoices(item,this.words,this.ids(),a.seed),wrong=a.wrong[item.id]||[];
  let sentence='',cursor=0;for(const gap of item.gaps||[{start:item.start,end:item.end,text:item.answer}]){sentence+=esc(item.sentence.slice(cursor,gap.start))+`<span class="cloze-gap ${result?'filled':''}" aria-label="${result?'答案':'空白'}">${result?esc(gap.text):'　　'}</span>`;cursor=gap.end}sentence+=esc(item.sentence.slice(cursor));
  return `<div class="cloze-session"><div class="cloze-progress-label"><span>${a.index+1} / ${a.queue.length}</span><button id="clozeReset" class="text-button">重新组题</button></div><div class="cloze-progress"><i style="width:${(a.index+(result?1:0))/a.queue.length*100}%"></i></div><section class="cloze-question"><span class="eyebrow">补全句子</span><h1 lang="de" id="clozeSentence">${sentence}</h1><p class="cloze-context">${esc(item.translation)}</p><div class="cloze-options" role="group" aria-label="选择填空答案">${options.map((option,i)=>`<button type="button" class="meaning-option ${result?(option===item.answer?'correct':''):wrong.includes(option)?'incorrect':''}" data-cloze-choice="${esc(option)}" ${result?'disabled':''}><span>${'ABCD'[i]}</span><b lang="de">${esc(option)}</b></button>`).join('')}</div><span id="clozeStatus" class="sr-only" role="status">${result?result.outcome==='revealed'?'已显示答案':'回答正确':''}</span><div class="cloze-answer-actions">${result?'<button id="clozeNext" class="primary">'+(a.index+1<a.queue.length?'下一题 →':'查看本轮结果 →')+'</button>':'<button id="clozeReveal" class="text-button">暂时不会，查看答案</button>'}</div></section>${result?`<section class="cloze-explanation" id="clozeExplanation"><div class="cloze-result-label">${result.outcome==='first'?'首次答对':result.outcome==='retry'?'重试答对':'已查看答案'}</div><p class="cloze-complete" lang="de">${esc(item.sentence)}${this.playButton(item.sentence,item.audio,'朗读完整句子')}</p><p>${esc(item.explanation)}</p>${item.sourceArticle?articleCreditHTML(item.sourceArticle,esc):`<small>${esc(item.source.label)}</small>`}<details class="cloze-word-detail"><summary>查看词条详解</summary><div class="learning-panel">${this.learningHTML(this.words.get(item.wordId))}</div></details></section>`:''}</div>`;
 }
 ensureToday(){if(this.active?.day===localDay()&&usableRound(this.active,this.itemMap,this.ids()))return true;this.onStop();this.state.contextPractice.active=null;this.onSave();this.render();return false}
 answer(value,button,event){
  if(!this.ensureToday())return;const a=this.active,item=this.itemMap.get(a.queue[a.index]);if(!item||a.results[item.id])return;
  const choices=clozeChoices(item,this.words,this.ids(),a.seed);if(!choices.includes(value))return;
  if(value!==item.answer){const wrong=a.wrong[item.id]||[];if(wrong.includes(value))return;a.wrong[item.id]=[...wrong,value];this.onSave();button.classList.add('incorrect');this.root.querySelector('#clozeStatus').textContent='这个选项不合适，再试一次。';this.onWrong();shakeChoice(button);return}
  const attempts=(a.wrong[item.id]||[]).length,box=button.getBoundingClientRect(),point=event?.detail?{x:event.clientX,y:event.clientY}:{x:box.x+box.width/2,y:box.y+box.height/2};this.resolve(attempts?'retry':'first');this.onCorrect(point);revealContent(this.root.querySelector('#clozeExplanation'));
 }
 resolve(outcome){const a=this.active,item=this.itemMap.get(a.queue[a.index]),r={wordId:item.wordId,day:a.day,outcome,attempts:(a.wrong[item.id]||[]).length,at:Date.now()};a.results[item.id]=r;this.state.contextPractice.records[item.wordId]={day:r.day,outcome:r.outcome,attempts:r.attempts,at:r.at};this.onSave();this.render()}
 reveal(){if(!this.ensureToday())return;const a=this.active,id=a.queue[a.index];if(a.results[id])return;this.onStop();this.resolve('revealed');revealContent(this.root.querySelector('#clozeExplanation'))}
 next(){if(!this.ensureToday())return;const a=this.active;if(!a.results[a.queue[a.index]])return;this.onStop();a.index++;this.onSave();this.render();enter(this.root.querySelector('.cloze-session')||this.root.querySelector('.cloze-summary'));window.scrollTo(0,0);if(a.index===a.queue.length)this.onComplete()}
 summary(){
  const a=this.active,results=Object.values(a.results),count=type=>results.filter(r=>r.outcome===type).length,wrong=results.filter(r=>r.outcome!=='first');
  return `<section class="cloze-summary"><span class="eyebrow">本轮语境填空</span><h1>把记住的词，再用一遍。</h1><div class="cloze-summary-counts">${[['first','首次答对'],['retry','重试答对'],['revealed','查看答案']].map(([k,label])=>`<div><b>${count(k)}</b><span>${label}</span></div>`).join('')}</div><div class="cloze-review-list">${a.queue.map(id=>{const item=this.itemMap.get(id),r=a.results[id],w=this.words.get(item.wordId);return `<div><span lang="de">${esc(w.lemma)}</span><small>${{first:'首次答对',retry:'重试答对',revealed:'查看答案'}[r.outcome]}</small></div>`}).join('')}</div><div class="cloze-summary-actions"><button id="clozeHomeBottom" class="secondary">返回首页</button><button id="clozeAnother" class="primary">再来一组 →</button></div>${wrong.length?`<button id="clozeRetry" class="text-button">复练本轮薄弱词（${wrong.length}）</button>`:''}</section>`;
 }
 key(e){if(this.root.hidden||e.defaultPrevented||e.target.closest('input,select,textarea,[contenteditable=true],summary,[data-word-details]'))return;
  if(/^[1-4]$/.test(e.key)){const b=this.root.querySelectorAll('[data-cloze-choice]:not(:disabled)')[Number(e.key)-1];if(b){e.preventDefault();b.click()}}
  else if(e.key==='Enter'&&!e.target.closest('button,a')){const next=this.root.querySelector('#clozeNext');if(next){e.preventDefault();next.click()}}
 }
}
