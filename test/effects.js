import {burst} from './motion.js';
import {instantHit,instantMilestone} from './instant-feedback.js';
const flower='<svg viewBox="0 0 50 50" aria-hidden="true"><g fill="currentColor">'+[0,72,144,216,288].map(a=>`<ellipse cx="25" cy="14" rx="8" ry="12" transform="rotate(${a} 25 25)"/>`).join('')+'</g><circle cx="25" cy="25" r="7" fill="#ffecad"/></svg>';
export class LearningEffects{
 constructor(){this.layer=document.createElement('div');this.layer.className='learning-effects';this.layer.setAttribute('aria-hidden','true');document.body.append(this.layer)}
 clear(){this.hit?.cancel();this.layer.replaceChildren()}
 pulse(card,combo,complete=false){if(!complete&&!instantMilestone(combo))return;this.hit?.cancel();this.hit=instantHit(card,combo,{complete,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,vibrate:typeof navigator.vibrate==='function'?p=>navigator.vibrate(p):undefined})}
 flower(point){burst(point,this.layer);
  const el=document.createElement('span');el.className='answer-flower';el.innerHTML=flower;el.style.left=`${Math.max(22,Math.min(innerWidth-22,point.x))}px`;el.style.top=`${Math.max(22,Math.min(innerHeight-22,point.y))}px`;this.layer.append(el);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.animate([{opacity:0,transform:'translate(-50%,-50%) scale(.45)'},{opacity:1,transform:'translate(-50%,-70%) scale(1.08)',offset:.2},{opacity:0,transform:`translate(-50%,${reduced?'-70%':'-180%'}) scale(.8)`}],{duration:1000,easing:'ease-out'}).finished.catch(()=>{}).finally(()=>el.remove());
 }
 celebrate(){
  const scene=document.createElement('div');scene.className='group-celebration';this.layer.append(scene);const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const colors=['#e6b44a','#8caf96','#d78e93','#7ca7bc','#c6afd0'];
  for(let i=0;i<(reduced?16:70);i++){
   const piece=document.createElement('i');piece.className=i%4===0?'confetti flower-confetti':'confetti';piece.style.background=colors[i%colors.length];piece.style.left=`${(i*37.7)%100}%`;piece.style.width=`${6+i%5}px`;piece.style.height=`${i%4===0?10:15+i%8}px`;scene.append(piece);
   const drift=(i%2?1:-1)*(20+(i*17)%100),start=-35-(i*29)%260;
   piece.animate([{opacity:0,transform:`translate(0,${reduced?'10vh':start+'px'}) rotate(${i*13}deg)`},{opacity:1,offset:.08},{opacity:.95,transform:`translate(${reduced?0:drift*.5}px,${reduced?22:25+(i*13)%45}vh) rotate(${90+i*17}deg)`,offset:.62},{opacity:0,transform:`translate(${reduced?0:drift}px,${reduced?35:105+(i%7)*8}vh) rotate(${180+i*29}deg)`}],{duration:2000,easing:'cubic-bezier(.16,.45,.67,.98)'});
  }
  setTimeout(()=>scene.remove(),2000);
 }
}
