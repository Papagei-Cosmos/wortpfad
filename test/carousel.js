// Two real adjacent slides move together; no opacity swap or cloned controls.
export const SLIDE_DURATION=1000;
export class SlidingCarousel{
 constructor(viewport,{selector,index=0,onChange=()=>{}}){
  this.viewport=viewport;this.items=[...viewport.querySelectorAll(selector)];this.index=index;this.onChange=onChange;this.dead=false;this.serial=0;
  this.settle(index);
 }
 settle(index){
  this.index=index;this.items.forEach((el,i)=>{el.hidden=i!==index;el.inert=i!==index;el.setAttribute('aria-hidden',String(i!==index));for(const p of ['transform','position','inset','width','z-index','will-change'])el.style.removeProperty(p)});
  this.viewport.removeAttribute('data-sliding');this.onChange(index);
 }
 go(target,direction=1){
  const n=this.items.length;if(!n||this.dead)return;target=(target%n+n)%n;
  if(this.busy){this.pending={target,direction};return}
  if(target===this.index)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){this.settle(target);return}
  this.busy=true;const ticket=++this.serial,old=this.items[this.index],next=this.items[target];
  // The outgoing slide keeps normal flow, so the viewport never collapses.
  next.hidden=false;next.inert=false;next.setAttribute('aria-hidden','false');old.inert=true;old.setAttribute('aria-hidden','true');
  Object.assign(next.style,{position:'absolute',inset:'0',width:'100%',zIndex:'1'});
  old.style.willChange=next.style.willChange='transform';this.viewport.dataset.sliding='true';
  const sign=direction<0?-1:1,options={duration:SLIDE_DURATION,easing:'cubic-bezier(.45,0,.2,1)',fill:'both'};
  const outgoing=old.animate([{transform:'translateX(0)'},{transform:`translateX(${sign*100}%)`}],options);
  const incoming=next.animate([{transform:`translateX(${-sign*100}%)`},{transform:'translateX(0)'}],options);
  this.animations=[outgoing,incoming];this.index=target;this.onChange(target);
  Promise.all(this.animations.map(a=>a.finished.catch(()=>{}))).then(()=>{
   if(this.dead||ticket!==this.serial)return;
   // Remove fill effects only after hiding the outgoing frame, in one task.
   old.hidden=true;this.animations.forEach(a=>a.cancel());this.animations=[];this.settle(target);this.busy=false;
   const pending=this.pending;this.pending=null;if(pending)this.go(pending.target,pending.direction);
  });
 }
 destroy(){this.dead=true;this.serial++;this.animations?.forEach(a=>a.cancel());this.pending=null}
}
