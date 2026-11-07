// Motion 14.6.0 (MIT). Presentation transitions never decide grading or review dates.
// A failed animation download must never leave the learning surface inert.
const reduced=()=>!window.Motion?.animate||matchMedia('(prefers-reduced-motion: reduce)').matches;
const animate=(...args)=>window.Motion.animate(...args);
const active=new WeakMap();let route=0,pageControls=[];
const finish=(control,done)=>Promise.race([Promise.resolve(control),new Promise(r=>setTimeout(r,1200))]).then(done,done);
const reset=el=>{for(const p of ['opacity','transform','filter'])el.style.removeProperty(p)};
function content(){return document.querySelector(document.body.dataset.page==='instant'?'#instantPage':document.body.dataset.page==='study'?'.learning-layout':document.body.dataset.page==='today'?'#todayPage':document.body.dataset.page==='cloze'?'#clozePage':document.body.dataset.page==='exam'?'#examPage':'#homePage')}
export function changePage(update){
 const ticket=++route,main=document.querySelector('main');for(const {el,control}of pageControls){control.stop();reset(el)}pageControls=[];
 if(reduced()){main.inert=false;main.removeAttribute('aria-busy');update();return}
 main.inert=true;main.setAttribute('aria-busy','true');const old=content();
 if(old&&!old.hidden)pageControls.push({el:old,control:animate(old,{opacity:0,x:-12},{duration:.1,ease:'easeIn'})});
 setTimeout(()=>{if(ticket!==route)return;for(const {el,control}of pageControls){control.stop();reset(el)}pageControls=[];
  try{update();const next=content();if(next&&!next.hidden){const control=animate(next,{opacity:[0,1],x:[18,0],scale:[.993,1]},{type:'spring',stiffness:420,damping:36,mass:.8});pageControls.push({el:next,control});finish(control,()=>{if(ticket===route)reset(next)})}}
  finally{setTimeout(()=>{if(ticket===route){main.inert=false;main.removeAttribute('aria-busy')}},300)}
 },105);
}
function grow(element,from,to,{reveal=false}={}){
 if(reduced()||element.hidden)return;active.get(element)?.stop();const token={};active.set(element,token);
 const style=getComputedStyle(element),oldOverflow=element.style.overflow;element.style.overflow='clip';
 const control=animate(element,{height:[from,to],...(reveal?{opacity:[0,1],y:[7,0],paddingTop:[0,parseFloat(style.paddingTop)],paddingBottom:[0,parseFloat(style.paddingBottom)]}:{})},{duration:.34,ease:[.16,1,.3,1]});
 token.stop=()=>control.stop();finish(control,()=>{if(active.get(element)!==token)return;active.delete(element);for(const p of ['height','opacity','transform','padding-top','padding-bottom'])element.style.removeProperty(p);element.style.overflow=oldOverflow});
}
export function revealContent(element){if(!element.hidden)grow(element,0,element.getBoundingClientRect().height,{reveal:true})}
export function settleHeight(element,from){const to=element.getBoundingClientRect().height;if(from&&Math.abs(from-to)>2)grow(element,from,to)}
export function enter(element){if(!reduced()){const c=animate(element,{opacity:[0,1],y:[7,0]},{duration:.22,ease:[.16,1,.3,1]});finish(c,()=>reset(element))}}
export function burst(point,layer){
 if(reduced())return;for(let i=0;i<7;i++){const dot=document.createElement('i');dot.className='answer-spark';dot.style.left=point.x+'px';dot.style.top=point.y+'px';dot.style.setProperty('--spark-color',['#a7bce9','#e2b6cf','#a7cdbb'][i%3]);layer.append(dot);const angle=i/7*Math.PI*2,c=animate(dot,{x:[0,Math.cos(angle)*42],y:[0,Math.sin(angle)*42-8],scale:[.2,1,.35],opacity:[0,1,0]},{duration:.68,delay:i*.015,ease:'easeOut'});finish(c,()=>dot.remove())}
}
// Use individual translate so the button press scale can finish independently.
const shakes=new WeakMap();
export function shakeChoice(element){
 if(!element||reduced())return;
 shakes.get(element)?.cancel();
 const control=element.animate({translate:['0px','-7px','6px','-4px','3px','0px']},{duration:360,easing:'ease-in-out'});
 shakes.set(element,control);
 const clear=()=>{if(shakes.get(element)===control)shakes.delete(element)};
 control.finished.then(clear,clear);
}
export function installDialogs(){
 const observe=dialog=>{if(dialog.dataset.motionReady)return;dialog.dataset.motionReady='true';const close=dialog.close.bind(dialog);let closing=false;
  dialog.close=value=>{if(!dialog.open||reduced()){closing=false;close(value);return}if(closing)return;closing=true;dialog.dataset.closing='true';animate(dialog,{opacity:0,y:9,scale:.985},{duration:.15,ease:'easeIn'});setTimeout(()=>{close(value);closing=false;delete dialog.dataset.closing;reset(dialog)},155)};
  dialog.addEventListener('cancel',e=>{if(!reduced()){e.preventDefault();dialog.close()}});
  new MutationObserver(()=>{if(dialog.open&&!closing&&!reduced()){const c=animate(dialog,{opacity:[0,1],y:[14,0],scale:[.98,1]},{type:'spring',stiffness:480,damping:36});finish(c,()=>{if(!closing)reset(dialog)})}}).observe(dialog,{attributes:true,attributeFilter:['open']});
 };
 document.querySelectorAll('dialog').forEach(observe);new MutationObserver(()=>document.querySelectorAll('dialog').forEach(observe)).observe(document.body,{childList:true,subtree:true});
 const details=new WeakMap();
 document.addEventListener('click',event=>{
  const summary=event.target.closest('summary');if(summary){const detail=summary.parentElement;if(reduced())return;event.preventDefault();const old=details.get(detail);old?.control.stop();const from=detail.getBoundingClientRect().height,opening=old?!old.opening:!detail.open;detail.open=true;detail.style.height='';const to=opening?detail.getBoundingClientRect().height:summary.getBoundingClientRect().height+2;detail.style.overflow='clip';
   const token={opening,control:animate(detail,{height:[from,to]},{duration:.25,ease:[.16,1,.3,1]})};details.set(detail,token);finish(token.control,()=>{if(details.get(detail)!==token)return;details.delete(detail);detail.open=opening;detail.style.removeProperty('height');detail.style.removeProperty('overflow')});
  }
 });
 const held=new Map();const release=id=>{const el=held.get(id);held.delete(id);if(el?.isConnected&&!reduced()){const c=animate(el,{scale:1},{type:'spring',stiffness:650,damping:28});finish(c,()=>el.style.removeProperty('transform'))}};
 document.addEventListener('pointerdown',e=>{const el=e.target.closest('button');if(!el||el.disabled||reduced())return;held.set(e.pointerId,el);animate(el,{scale:.965},{duration:.08});if(el.matches('.meaning-option,.primary,.secondary,.training-main')){const rect=el.getBoundingClientRect(),ripple=document.createElement('span');ripple.className='press-ripple';ripple.style.left=(e.clientX-rect.left)+'px';ripple.style.top=(e.clientY-rect.top)+'px';el.append(ripple);const c=animate(ripple,{scale:[0,1.5],opacity:[.25,0]},{duration:.45});finish(c,()=>ripple.remove())}},{capture:true});
 document.addEventListener('pointerup',e=>release(e.pointerId),{capture:true});document.addEventListener('pointercancel',e=>release(e.pointerId),{capture:true});
}
