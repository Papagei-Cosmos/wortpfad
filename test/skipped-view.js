import {isSkipped} from './skipped.js';
import {genderOf} from './review.js';
import {enter,revealContent} from './motion.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export class SkippedView{
 constructor({root,state,words,onRestore,learningHTML,playButton}){Object.assign(this,{root,state,words,onRestore,learningHTML,playButton})}
 open(){this.root.querySelector('input').value='';this.render();this.root.showModal()}
 render(){
  const term=this.root.querySelector('input').value.trim().toLocaleLowerCase();
  const entries=Object.entries(this.state.skips).filter(([id])=>isSkipped(this.state.skips,id)&&this.words.has(id)).sort((a,b)=>b[1].at-a[1].at).map(([id])=>this.words.get(id));
  const matching=entries.filter(w=>!term||(w.lemma+' '+w.zh).toLocaleLowerCase().includes(term));
  this.root.querySelector('#skippedTotal').textContent=`${entries.length} 词 · 跳过不计入已学，不安排新复习。重新加入后优先进入新一组。`;
  const list=this.root.querySelector('#skippedList');list.innerHTML=matching.length?matching.map(w=>`<article class="skipped-word"><div class="skipped-word-row"><div><strong lang="de" class="gender-${genderOf(w)}">${esc(w.article?w.article+' ':'')}${esc(w.lemma)}</strong><p>${esc(w.zh)}</p></div><div>${this.playButton(`${w.article?w.article+' ':''}${w.lemma}`,w.audio,'播放单词')}<button class="secondary" data-restore-word="${w.id}">重新加入</button></div></div><details class="skipped-detail"><summary>查看详解</summary><div class="learning-panel" data-skipped-detail="${w.id}"></div></details></article>`).join(''):`<div class="empty-collection"><h3>${entries.length?'没有匹配的词':'还没有跳过的词'}</h3><p>${entries.length?'试试其他关键词。':'学习时点击“跳过”，之后可在这里重新加入。'}</p></div>`;
  list.querySelectorAll('[data-restore-word]').forEach(b=>b.onclick=()=>{const word=this.words.get(b.dataset.restoreWord);this.onRestore(word.id);this.render();this.root.querySelector('#skipRestoreStatus').textContent=`${word.article?word.article+' ':''}${word.lemma} 已重新加入，将优先安排到新一组。`});
  list.querySelectorAll('details').forEach(d=>d.querySelector('summary').addEventListener('click',()=>{const content=d.querySelector('[data-skipped-detail]');if(!content.childElementCount)content.innerHTML=this.learningHTML(this.words.get(content.dataset.skippedDetail))}));
 }
}
