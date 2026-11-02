// Browsers cannot reject an indistinguishable capacitive stylus as hardware pen.
// Auto locks after a real PointerEvent pen is detected; touch mode stays available.
export function installPenGuard(doc=document,storage=localStorage){
 let mode='auto',seenPen=false;try{mode=storage.getItem('wortpfad.penMode')||'auto'}catch{}if(!['auto','pen','touch'].includes(mode))mode='auto';
 const active=()=>doc.body.dataset.page==='study'&&doc.body.dataset.inputMode==='handwriting';
 const locked=()=>active()&&(mode==='pen'||mode==='auto'&&seenPen);
 const toggle=doc.createElement('button');toggle.id='penModeToggle';toggle.type='button';toggle.className='text-button';toggle.dataset.allowTouch='true';
 const render=()=>{doc.body.dataset.penOnly=String(locked());toggle.textContent=mode==='touch'?'触控书写':mode==='pen'||seenPen&&mode==='auto'?'仅手写笔 · 防误触':'防误触：自动';toggle.title='自动：检测到手写笔后屏蔽手指；仅手写笔：只接收笔和鼠标；触控：允许手指书写';toggle.setAttribute('aria-label',toggle.textContent+'，点击切换输入防误触模式')};
 doc.querySelector('#writingControls .input-tabs')?.append(toggle);
 toggle.onclick=()=>{mode=mode==='auto'?'pen':mode==='pen'?'touch':'auto';seenPen=false;try{storage.setItem('wortpfad.penMode',mode)}catch{}render()};
 const exempt=t=>!!t?.closest?.('[data-allow-touch],dialog[open]');
 const block=e=>{if(e.cancelable)e.preventDefault();e.stopImmediatePropagation()};
 let blockedTouchAt=-Infinity;
 for(const type of ['pointerdown','pointermove','pointerup','pointercancel'])doc.addEventListener(type,e=>{
  if(!active())return;
  if(e.pointerType==='pen'){if(mode==='auto'){seenPen=true;render()}if(type==='pointerdown')doc.getSelection()?.removeAllRanges();return}
  if(e.pointerType==='touch'&&locked()&&!exempt(e.target)){blockedTouchAt=Date.now();block(e)}
 },{capture:true,passive:false});
 doc.addEventListener('touchstart',e=>{if(locked()&&!exempt(e.target)&&[...e.changedTouches].some(t=>t.touchType==='direct')){blockedTouchAt=Date.now();block(e)}},{capture:true,passive:false});
 doc.addEventListener('click',e=>{if(locked()&&!exempt(e.target)&&(e.pointerType==='touch'||e.sourceCapabilities?.firesTouchEvents||!e.pointerType&&e.detail>0&&Date.now()-blockedTouchAt<800))block(e)},true);
 for(const type of ['selectstart','contextmenu','dragstart'])doc.addEventListener(type,e=>{if(active()&&!e.target?.closest?.('input,textarea,[contenteditable=true]'))block(e)},true);
 const observer=new MutationObserver(render);observer.observe(doc.body,{attributes:true,attributeFilter:['data-page','data-input-mode']});render();
 return {accepts:e=>!locked()||e.pointerType!=='touch',locked};
}
