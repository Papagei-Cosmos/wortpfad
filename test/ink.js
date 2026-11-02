import {recognizeLocalInk,localInkHealth} from './local-ink-client.js';
import {replaceInkLetter,cleanCandidates} from './ink-correction.js';
export class InkPad {
 constructor(canvas,{status,stats,placeholder,onText,getRevision,getEndpoint,candidates,getInput,onChange}){
  Object.assign(this,{canvas,status,stats,placeholder,onText,getRevision,getEndpoint,candidates,getInput,onChange});this.strokes=[];this.version=0;this.pointer=null;this.ready=false;this.dirty=false;
  canvas.addEventListener('pointerdown',e=>this.down(e));canvas.addEventListener('pointermove',e=>this.move(e));canvas.addEventListener('pointerup',e=>this.up(e));canvas.addEventListener('pointercancel',e=>{if(e.pointerId===this.pointer)this.cancel()});canvas.addEventListener('lostpointercapture',e=>{if(e.pointerId===this.pointer)this.cancel()});
  new ResizeObserver(()=>this.draw()).observe(canvas);this.status.textContent='本机手写 · 首次使用需加载识别资源';
 }
 invalidate(){this.version++;clearTimeout(this.timer);this.request?.abort();if(this.candidates){this.candidates.replaceChildren();this.candidates.hidden=true}}
 changed(){this.dirty=this.strokes.length>0;this.onChange?.()}
 showCandidates(text,alternatives){
  if(!this.candidates)return;const items=cleanCandidates(text,alternatives),version=this.version,revision=this.getRevision();
  const valid=()=>!this.disabled&&this.version===version&&this.getRevision()===revision;
  this.candidates.replaceChildren();this.candidates.hidden=!items.length;
  const label=document.createElement('p');label.className='ink-candidate-label';label.textContent='识别候选 · 点击选择，不会自动判题';this.candidates.append(label);
  const row=document.createElement('div');row.className='ink-candidate-options';
  for(const value of items){const button=document.createElement('button');button.type='button';button.lang='de';button.textContent=value;button.className='ink-candidate'+(value===text?' selected':'');button.onclick=()=>{if(!valid())return;this.invalidate();this.onText(value);this.status.textContent='已选择识别候选，请确认拼写后提交';this.showCandidates(value,items)};row.append(button)}this.candidates.append(row);
  const correction=document.createElement('div');correction.className='ink-letter-correction';const caption=document.createElement('span');caption.textContent='E / Z 混淆？改首字母：';correction.append(caption);
  for(const letter of ['E','e','Z','z']){const b=document.createElement('button');b.type='button';b.textContent=letter;b.setAttribute('aria-label','将首字母或选中文字改为 '+letter);b.onpointerdown=e=>e.preventDefault();b.onclick=()=>{if(!valid())return;const input=this.getInput?.()||{value:text,start:0,end:0};this.invalidate();this.onText(replaceInkLetter(input.value,letter,input.start,input.end));this.status.textContent='已按你的选择修改字母；请确认大小写后提交'};correction.append(b)}this.candidates.append(correction);
  const tip=document.createElement('small');tip.textContent='也可先选中答案框里的字母再替换。动词通常以小写字母开头；候选仅来自识别器，不按正确答案纠正。';this.candidates.append(tip);
 }
 reset(clearText=false){const changed=!!this.strokes.length||clearText;this.invalidate();this.strokes=[];this.pointer=null;this.dirty=false;if(changed)this.onChange?.();this.draw();this.status.textContent='德语手写 · 停笔 1 秒后识别，确认后提交';if(clearText)this.onText('')}
 async health(){const version=this.version;try{await localInkHealth();this.ready=true;this.engine='浏览器本机手写识别';if(version===this.version&&!this.strokes.length)this.status.textContent='本机手写已就绪 · 停笔 1 秒后识别'}catch{this.ready=false;if(version===this.version&&!this.strokes.length)this.status.textContent='本机识别资源暂未就绪，请点立即识别重试或切换拼写键盘'}return this.ready}
 point(e){const rect=this.canvas.getBoundingClientRect();return {x:Math.max(0,Math.min(this.logicalW,(e.clientX-rect.left)*this.logicalW/rect.width)),y:Math.max(0,Math.min(this.logicalH,(e.clientY-rect.top)*this.logicalH/rect.height)),p:e.pressure||.35,t:e.timeStamp}}
 down(e){if(this.disabled||this.acceptsPointer&&!this.acceptsPointer(e)||e.button!==0)return;if(e.pointerType==='pen'&&this.pointer!==null&&this.type==='touch'){const old=this.pointer;this.pointer=null;this.strokes.pop();try{this.canvas.releasePointerCapture?.(old)}catch{}}if(this.pointer!==null)return;if(this.strokes.length>=128){this.status.textContent='笔画较多，请清空后分词书写';return}e.preventDefault();this.invalidate();if(!this.strokes.length){const r=this.canvas.getBoundingClientRect();this.logicalW=r.width;this.logicalH=r.height}this.pointer=e.pointerId;this.canvas.setPointerCapture(e.pointerId);this.strokes.push([this.point(e)]);this.changed();this.type=e.pointerType;this.status.textContent='正在采集笔迹…';this.draw()}
 move(e){if(e.pointerId!==this.pointer)return;e.preventDefault();const stroke=this.strokes.at(-1);for(const p of (e.getCoalescedEvents?.()||[e])){const value=this.point(p),last=stroke.at(-1);if(stroke.length<4096&&Math.hypot(value.x-last.x,value.y-last.y)>.6)stroke.push(value)}this.draw()}
 up(e){if(e.pointerId!==this.pointer)return;this.strokes.at(-1).push(this.point(e));this.pointer=null;this.draw();this.queue()}
 cancel(){this.pointer=null;this.invalidate();this.changed();this.status.textContent='笔迹采集中断；可重写或点击立即识别';this.draw()}
 undo(){if(this.disabled||this.pointer!==null||!this.strokes.length)return;this.invalidate();this.strokes.pop();this.changed();this.draw();this.queue()}
 queue(){this.invalidate();if(!this.strokes.length){this.status.textContent='画板已清空';return}this.status.textContent='停笔计时中…';this.timer=setTimeout(()=>this.recognize(),1000)}
 async recognize(){
  clearTimeout(this.timer);if(this.disabled||this.pointer!==null||!this.strokes.length)return;
  const version=this.version,revision=this.getRevision();this.request?.abort();this.request=new AbortController();this.status.textContent='正在识别德语笔迹…';
  // Resample high-frequency pen events; preserve stroke endpoints and send no
  // account, question, word list, previous answer or expected-answer context.
  const step=Math.max(1,Math.ceil(this.strokes.reduce((n,s)=>n+s.length,0)/6000));
  const strokes=this.strokes.map(s=>s.filter((p,i)=>i===0||i===s.length-1||i%step===0).map(({x,y})=>({x:Math.round(x*10)/10,y:Math.round(y*10)/10})));
  try{const d=await recognizeLocalInk({language:'de-DE',width:Math.ceil(this.logicalW),height:Math.ceil(this.logicalH),strokes},this.request.signal);const r={ok:true};
   if(version!==this.version||revision!==this.getRevision())return;
   if(!r.ok||!d.ok)throw Error(d.error||'识别失败');
   this.ready=true;this.dirty=false;this.onText(d.text);this.showCandidates(d.text,d.alternatives);this.status.textContent=d.text?'可点词改大小写或选择候选；确认后提交':'没有识别出文字，请重写或使用键盘';
  }catch(e){if(e.name==='AbortError'||version!==this.version||revision!==this.getRevision())return;this.status.textContent='识别失败：'+(e.message||'服务未连接')+'；可重试或用键盘输入'}
 }
 draw(){const r=this.canvas.getBoundingClientRect();if(!r.width)return;const dpr=window.devicePixelRatio||1;this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);const ctx=this.canvas.getContext('2d');ctx.scale(dpr,dpr);ctx.strokeStyle='#52684c';ctx.fillStyle='#52684c';ctx.lineCap='round';ctx.lineJoin='round';
  for(const s of this.strokes){for(let i=1;i<s.length;i++){const a=s[i-1],b=s[i];ctx.lineWidth=1.4+b.p*2.6;ctx.beginPath();ctx.moveTo(a.x*r.width/this.logicalW,a.y*r.height/this.logicalH);ctx.lineTo(b.x*r.width/this.logicalW,b.y*r.height/this.logicalH);ctx.stroke()}if(s.length===1){ctx.beginPath();ctx.arc(s[0].x*r.width/this.logicalW,s[0].y*r.height/this.logicalH,1.5,0,7);ctx.fill()}}
  this.placeholder.hidden=!!this.strokes.length;
  this.stats.textContent=`${this.strokes.length} 笔 · ${this.strokes.reduce((a,s)=>a+s.length,0)} 个采样点 · 输入：${this.type||'尚未采集'}${this.strokes.length?' · 压感：'+this.strokes.at(-1).at(-1).p.toFixed(2):''}`;
 }
}
