import {goalFor,groupCount} from './groups.js';
import {changePage} from './motion.js';
import {isSkipped} from './skipped.js';
import {THEMES,themeDecks} from './themes.js';
import {SlidingCarousel} from './carousel.js';
export {THEMES,themeDecks};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LEVELS=['A1','A2','B1','B2','C1'];
const TRAININGS=[
 ['translate','Aa','ÜBERSETZUNG','中译德','看中文和词性，写下德语。','推荐入门','navy'],
 ['meaning','文','VERSTÄNDNIS','德译中','结合德语例句，推测中文含义。','词义理解','amber'],
 ['dictation','♬','DIKTAT','听写','听清德语发音，再写下单词。','听力训练','red'],
 ['spelling','Ab','RECHTSCHREIBUNG','拼写','看一遍，遮住，再亲手拼写。','拼写巩固','cream']
];
function dots(total,index,hero=false){
 const start=Math.max(0,Math.min(index-2,total-5)),count=Math.min(5,total);
 return Array.from({length:count},(_,j)=>{const i=start+j,title=hero?(i===0?'继续学习':THEMES[i-1].title):THEMES[i].title;
  return `<button data-${hero?'hero-slide':'slide'}="${i}" aria-label="切换至${esc(title)}" aria-current="${i===index}"></button>`}).join('');
}
export class Home{
 constructor(options){
  Object.assign(this,options);this.slide=0;this.heroSlide=0;this.media=matchMedia('(prefers-reduced-motion: reduce)');this.heroPaused=this.paused=this.media.matches;this.render();
  this.timer=setInterval(()=>{
   if(this.root.hidden||document.hidden||this.media.matches)return;
   if(!this.paused&&!this.root.querySelector('.theme-carousel')?.matches(':hover,:focus-within'))this.setSlide(this.slide+1);
   if(!this.heroPaused&&!this.root.querySelector('.feature-carousel')?.matches(':hover,:focus-within'))this.setHero(this.heroSlide+1);
  },6500);
  this.media.addEventListener('change',e=>{if(e.matches){this.heroPaused=this.paused=true;this.updatePauseButtons()}});
 }
 selected(){return this.decks.get(this.state.settings.selectedDeck)||this.decks.get('seed')}
 choose(id){if(!this.decks.has(id))return;changePage(()=>{this.state.settings.selectedDeck=id;this.onSave();this.render()})}
 bookOptions(deck){
  const all=[...this.decks.values()],option=d=>`<option value="${esc(d.id)}" ${(d.id===deck.id||d.themeId&&d.themeId===deck.themeId&&!d.themeLevel)?'selected':''}>${esc(d.name)}</option>`;
  return `<optgroup label="等级词书">${all.filter(d=>!d.themeId).map(option).join('')}</optgroup><optgroup label="主题词书">${all.filter(d=>d.themeId&&!d.themeLevel).map(option).join('')}</optgroup>`;
 }
 bookLevels(deck){
  const levels=deck.themeId?['全部',...LEVELS]:LEVELS;
  return levels.map(level=>{
   const id=deck.themeId?'theme-'+deck.themeId+(level==='全部'?'':'-'+level.toLowerCase()):level.toLowerCase();
   const available=this.decks.has(id),selected=deck.themeId?(deck.themeLevel||'全部')===level:(deck.level||'A1')===level;
   return `<button class="level-tab ${selected?'selected':''}" data-level="${level}" data-book-level="${id}" ${available?'':'disabled'}>${level}${available?'':'<small>暂无</small>'}</button>`;
  }).join('');
 }
 render(){
  this.heroCarousel?.destroy();this.themeCarousel?.destroy();this.heroSlide=0;
  const deck=this.selected(),records=deck.ids.map(id=>this.state.records[id]).filter(Boolean),activeRecords=deck.ids.filter(id=>!isSkipped(this.state.skips,id)).map(id=>this.state.records[id]).filter(Boolean);
  const due=activeRecords.filter(r=>r.due<=Date.now()).length,wrong=activeRecords.filter(r=>r.wrong).length,s=this.state.session;
  const hasResume=!!(s&&!s.groupCounted&&s.queue.length&&s.index<s.queue.length&&(s.events.length||s.input||s.attempts));
  const activeDeck=hasResume?this.decks.get(s.deck):deck,activeTraining=hasResume?s.training||'translate':'translate';
  const completed=hasResume?s.events.filter(e=>e.outcome!=='skipped').length:0,total=hasResume?s.queue.length-s.events.filter(e=>e.outcome==='skipped').length:Math.min(goalFor(this.state.groups,deck.id,'translate').size,deck.ids.filter(id=>!isSkipped(this.state.skips,id)).length);
  const q=s=>this.root.querySelector(s),all=s=>[...this.root.querySelectorAll(s)];
  this.root.innerHTML=`
  <section class="home-heading"><div><h1>今天，学会一点德语。</h1><p>选择一本词书，把每次练习变成看得见的积累。</p></div></section>
  <section class="home-stats" aria-label="当前词书学习统计"><div><strong>${deck.ids.length}</strong><span>可学词条</span></div><div><strong>${records.length}</strong><span>已学习</span></div><button data-review="due"><strong>${due}</strong><span>到期复习</span></button><button data-review="wrong"><strong>${wrong}</strong><span>错词复习</span></button></section>
  <section class="home-feature-row">
   <section class="feature-carousel" aria-label="学习推荐轮播" aria-roledescription="轮播图" tabindex="0">
    <div class="feature-slides">
     <article class="feature-slide resume-slide"><div class="feature-banner"><span>${hasResume?'继续上次练习':'每天一点，慢慢记住'}</span><h2>把熟悉的词，再记牢一点。</h2><b aria-hidden="true">Aa</b></div><div class="feature-body"><p>${esc(activeDeck.name)} / ${esc(this.trainingNames[activeTraining])}${hasResume?' · 进行中':''}</p><p class="muted">结合例句，继续理解德语单词。</p><div class="feature-bottom"><button id="resumePractice" class="feature-action">${hasResume?'继续学习':'开始学习'} <span>→</span></button><div class="feature-progress"><small>本组已完成 ${completed} / ${total}</small><div class="book-progress"><i style="width:${Math.min(100,completed/Math.max(total,1)*100)}%"></i></div></div></div></div></article>
     ${THEMES.map(t=>`<article class="feature-slide feature-theme-${t.id}" hidden><div class="feature-banner"><span>主题词书 · ${t.de}</span><h2>${t.title}</h2><b aria-hidden="true">${t.icon}</b></div><div class="feature-body"><p>${t.line}</p><p class="muted">${t.description}</p><div class="feature-bottom"><button class="feature-action" data-theme="${t.id}">选择这本词书 <span>→</span></button><small>${t.ids.length} 词 · 可按等级筛选</small></div></div></article>`).join('')}
    </div>
    <div class="feature-controls"><div class="feature-dots">${dots(THEMES.length+1,0,true)}</div><span id="heroPosition" class="carousel-position">1 / ${THEMES.length+1}</span><div><button id="heroPause" aria-label="${this.heroPaused?'播放':'暂停'}学习推荐自动轮播">${this.heroPaused?'▶':'Ⅱ'}</button><button id="heroPrev" aria-label="上一张学习推荐">←</button><button id="heroNext" aria-label="下一张学习推荐">→</button></div></div>
   </section>
   <section class="book-section" id="homeBookSection"><div class="section-heading"><h2><span>WÖRTERBÜCHER</span> 我的词书</h2></div>
    <div class="book-kind-tabs" role="group" aria-label="词书分类"><button data-book-kind="level" aria-pressed="${!deck.themeId}">等级词书</button><button data-book-kind="theme" aria-pressed="${!!deck.themeId}">主题词书 <small>19</small></button></div>
    <div class="level-tabs" aria-label="词书等级筛选">${this.bookLevels(deck)}</div>
    <div class="selected-book"><div class="book-copy"><label for="homeBook" class="sr-only">选择词书</label><select id="homeBook">${this.bookOptions(deck)}</select><p>${deck.ids.length} 个可练习词条 · ${deck.themeId?(deck.themeLevel||'全部等级')+' / ':''}中文提示、例句与词形</p><div class="book-progress"><i style="width:${records.length/Math.max(deck.ids.length,1)*100}%"></i></div><small>已学习 ${records.length} / ${deck.ids.length}</small></div><button id="previewBook" class="book-preview">词汇预览 <span>↗</span></button></div>
   </section>
  </section>
  <section class="modes-section"><div class="section-heading"><h2><span>ÜBUNGSMODUS</span> 选择训练方式</h2><span class="section-caption">键盘输入，也可以亲手写</span></div><div class="training-grid">${TRAININGS.map(([id,icon,de,name,desc,badge,color])=>{const goal=goalFor(this.state.groups,deck.id,id);return `<article class="training-card ${color}"><button class="training-main" data-training="${id}" aria-label="${name}，新学组 ${groupCount(this.state.groups,deck.id,id)} / ${goal.target}"><span class="training-card-top"><i>${icon}</i><small>${badge}</small></span><span class="training-de">${de}</span><strong>${name}</strong><span class="training-desc">${desc}</span></button><div class="training-start"><button class="group-start" data-start-group="${id}">新学组 <span data-group-count="${id}">${groupCount(this.state.groups,deck.id,id)}/${goal.target}</span></button><button class="goal-edit" data-goal="${id}">修改目标</button></div><small class="group-size">每组 ${goal.size} 词</small></article>`}).join('')}</div></section>
  <section class="daily-section"><div class="section-heading"><h2>在日常里，遇见德语</h2></div><div class="daily-grid">
   <section class="theme-carousel" aria-roledescription="轮播图" aria-label="主题词书" tabindex="0"><div id="themeSlides">${THEMES.map((t,i)=>`<article class="theme-slide ${t.color}" ${i===this.slide?'':'hidden'} aria-label="${i+1} / ${THEMES.length} ${t.title}"><div class="theme-copy"><span class="theme-kicker">主题词书 · ${t.de}</span><h2>${t.title}</h2><p class="theme-line">${t.line}</p><p class="theme-description">${t.description}</p><button class="theme-cta" data-theme="${t.id}">选择这本词书 <span>↗</span></button></div></article>`).join('')}</div><div class="carousel-controls"><div class="carousel-dots">${dots(THEMES.length,this.slide)}</div><span id="themePosition" class="carousel-position">${this.slide+1} / ${THEMES.length}</span><div class="carousel-arrows"><button id="carouselPause" aria-label="${this.paused?'播放':'暂停'}自动轮播">${this.paused?'▶':'Ⅱ'}</button><button id="carouselPrev" aria-label="上一张主题词书">←</button><button id="carouselNext" aria-label="下一张主题词书">→</button></div></div></section>
   <section class="today-entry"><h2>今日所学</h2><p>按词性回顾今天遇见的词。</p><small>名词 · 动词 · 形容词 · 其他</small><button id="homeToday" class="book-preview">回看今日词汇 <span>→</span></button></section>
  </div></section>
  <section class="future-section"><div class="section-heading"><h2><span>ÜBEN IM KONTEXT</span> 在语境中练习</h2><span class="section-caption">下一步，把单词放进句子</span></div><div class="future-grid"><button type="button" class="context-entry" id="homeCloze"><span class="eyebrow">LÜCKENTEXT</span><strong>语境填空</strong><p>用今天学过的单词补全句子，练习语境与词形。</p><small>开始今日填空 →</small></button><button type="button" class="exam-entry" id="homeExam"><span class="eyebrow">PRÜFUNGSTRAINING</span><strong>考题练习</strong><p>按 A1–C1 选择语法、阅读与听力专项。</p><small>A1–C1 语法练习已开放 →</small></button></div></section><p class="home-bottom-note">免费词汇练习 · 主题与等级词书共享单词记录 · A1–C1 语法练习已开放</p>
  <dialog id="bookPreviewDialog"><div class="dialog-heading"><h2>词汇预览</h2><button class="icon-button" id="closeBookPreview" aria-label="关闭词汇预览">×</button></div><p>${esc(deck.name)} · ${deck.ids.length} 个词条</p><input id="bookSearch" placeholder="搜索德语或中文…" aria-label="搜索词书"><div id="bookPreviewList"></div></dialog>`;
  this.heroCarousel=new SlidingCarousel(q('.feature-slides'),{selector:'.feature-slide',onChange:i=>{this.heroSlide=i;q('.feature-dots').innerHTML=dots(THEMES.length+1,i,true);q('#heroPosition').textContent=`${i+1} / ${THEMES.length+1}`}});
  this.themeCarousel=new SlidingCarousel(q('#themeSlides'),{selector:'.theme-slide',index:this.slide,onChange:i=>{this.slide=i;q('.carousel-dots').innerHTML=dots(THEMES.length,i);q('#themePosition').textContent=`${i+1} / ${THEMES.length}`}});
  q('.feature-dots').onclick=e=>{const b=e.target.closest('[data-hero-slide]');if(b)this.setHero(Number(b.dataset.heroSlide))};q('.carousel-dots').onclick=e=>{const b=e.target.closest('[data-slide]');if(b)this.setSlide(Number(b.dataset.slide))};
  all('[data-training],[data-start-group]').forEach(b=>b.onclick=()=>this.onStart(deck.id,b.dataset.training||b.dataset.startGroup));all('[data-goal]').forEach(b=>b.onclick=()=>this.onGoal(deck.id,b.dataset.goal));all('[data-review]').forEach(b=>b.onclick=()=>this.onReview(deck.id,b.dataset.review));
  all('[data-theme]').forEach(b=>b.onclick=()=>{this.choose('theme-'+b.dataset.theme);q('#homeBookSection').scrollIntoView({behavior:this.media.matches?'instant':'smooth',block:'center'})});
  all('[data-book-kind]').forEach(b=>b.onclick=()=>{if(b.dataset.bookKind==='theme'&&!deck.themeId)this.choose('theme-weather');if(b.dataset.bookKind==='level'&&deck.themeId)this.choose('a1')});all('[data-book-level]:not(:disabled)').forEach(b=>b.onclick=()=>this.choose(b.dataset.bookLevel));q('#homeBook').onchange=e=>this.choose(e.target.value);
  const resume=()=>hasResume?this.onResume():this.onStart(deck.id,'translate');q('#resumePractice').onclick=resume;document.querySelector('#headerResume').onclick=resume;q('#homeToday').onclick=this.onToday;q('#homeCloze').onclick=this.onCloze;q('#homeExam').onclick=this.onExam;
  q('#heroPrev').onclick=()=>this.setHero(this.heroSlide-1,-1);q('#heroNext').onclick=()=>this.setHero(this.heroSlide+1);q('#carouselPrev').onclick=()=>this.setSlide(this.slide-1,-1);q('#carouselNext').onclick=()=>this.setSlide(this.slide+1);
  q('#heroPause').onclick=()=>{this.heroPaused=!this.heroPaused;this.updatePauseButtons()};q('#carouselPause').onclick=()=>{this.paused=!this.paused;this.updatePauseButtons()};
  for(const [element,set]of [[q('.feature-carousel'),(i,d)=>this.setHero(this.heroSlide+i,d)],[q('.theme-carousel'),(i,d)=>this.setSlide(this.slide+i,d)]]){
   let touch;element.onkeydown=e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)&&e.target.tagName!=='SELECT'){e.preventDefault();set(e.key==='ArrowRight'?1:-1,e.key==='ArrowRight'?1:-1)}};
   element.onpointerdown=e=>{if(e.pointerType==='touch')touch=e.clientX};element.onpointerup=e=>{if(e.pointerType==='touch'&&Number.isFinite(touch)&&Math.abs(e.clientX-touch)>45){const d=e.clientX>touch?1:-1;set(d,d)}touch=null};element.onpointercancel=()=>touch=null;
  }
  const showList=()=>{const term=q('#bookSearch').value.trim().toLocaleLowerCase(),matches=deck.ids.map(id=>this.words.get(id)).filter(w=>!term||(w.lemma+' '+w.zh).toLocaleLowerCase().includes(term));q('#bookPreviewList').innerHTML=`<p class="muted">显示 ${Math.min(80,matches.length)} / ${matches.length} 条${matches.length>80?'，可搜索缩小范围':''}</p>${matches.slice(0,80).map(w=>`<div class="preview-word"><span lang="de" class="gender-${this.genderOf(w)}">${esc(w.article?w.article+' ':'')}${esc(w.lemma)}${isSkipped(this.state.skips,w.id)?' <small class="skip-badge">已跳过</small>':''}</span><span>${esc(w.zh)}</span></div>`).join('')}`};
  q('#previewBook').onclick=()=>{q('#bookSearch').value='';showList();q('#bookPreviewDialog').showModal()};q('#closeBookPreview').onclick=()=>q('#bookPreviewDialog').close();q('#bookSearch').oninput=showList;
 }
 updatePauseButtons(){for(const [id,paused,label]of [['heroPause',this.heroPaused,'学习推荐自动轮播'],['carouselPause',this.paused,'自动轮播']]){const b=this.root.querySelector('#'+id);if(b){b.textContent=paused?'▶':'Ⅱ';b.setAttribute('aria-label',(paused?'播放':'暂停')+label)}}}
 setHero(index,direction=1){this.heroSlide=(index%(THEMES.length+1)+THEMES.length+1)%(THEMES.length+1);this.heroCarousel?.go(this.heroSlide,direction)}
 setSlide(index,direction=1){this.slide=(index%THEMES.length+THEMES.length)%THEMES.length;this.themeCarousel?.go(this.slide,direction)}
}
