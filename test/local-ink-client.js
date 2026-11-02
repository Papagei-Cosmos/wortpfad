import {inkBounds} from './local-ink-core.js';
let worker=null,sequence=0;const pending=new Map();
function boot(){
 if(worker)return worker;worker=new Worker(new URL('./local-ink-worker.js',import.meta.url),{type:'module'});
 worker.onmessage=({data})=>{const task=pending.get(data.id);if(!task)return;pending.delete(data.id);task.cleanup();data.ok?task.resolve(data):task.reject(Error(data.error||'未能识别，请重写或切换拼写键盘'));};
 worker.onerror=()=>{worker?.terminate();worker=null;for(const task of pending.values()){task.cleanup();task.reject(Error('本机识别资源加载失败，请重试或切换拼写键盘'))}pending.clear()};return worker;
}
function request(kind,tensor,signal){
 if(signal?.aborted)return Promise.reject(new DOMException('识别已取消','AbortError'));
 return new Promise((resolve,reject)=>{let w;try{w=boot()}catch{return reject(Error('此浏览器不支持本机识别，请切换拼写键盘或更新浏览器'))}const id=++sequence;
  const abort=()=>{if(!pending.has(id))return;pending.delete(id);cleanup();w.postMessage({kind:'cancel',id});reject(new DOMException('识别已取消','AbortError'))};
  const timeout=setTimeout(()=>{if(!pending.has(id))return;pending.delete(id);cleanup();w.postMessage({kind:'cancel',id});reject(Error('识别资源加载超时，请确认网络后重试'))},180000);
  const cleanup=()=>{clearTimeout(timeout);signal?.removeEventListener('abort',abort)};
  pending.set(id,{resolve,reject,cleanup});signal?.addEventListener('abort',abort,{once:true});w.postMessage({kind,id,...(tensor?{tensor: tensor.data,width:tensor.width}:{})},tensor?[tensor.data.buffer]:[]);
 });
}
export function localInkHealth(){return request('health')}
function canvasTensor(canvas){
 const width=Math.max(32,Math.min(2048,Math.ceil(48*canvas.width/canvas.height))),scaled=document.createElement('canvas');scaled.width=width;scaled.height=48;const ctx=scaled.getContext('2d',{willReadFrequently:true});ctx.fillStyle='white';ctx.fillRect(0,0,width,48);ctx.drawImage(canvas,0,0,width,48);
 const pixels=ctx.getImageData(0,0,width,48).data,n=width*48,data=new Float32Array(n*3);for(let i=0;i<n;i++)for(let channel=0;channel<3;channel++)data[i+channel*n]=pixels[i*4+channel]/127.5-1;return {data,width};
}
export function recognizeLocalInk(data,signal){
 const {left,top,right,bottom}=inkBounds(data),scale=Math.min(2,1600/(right-left+12),800/(bottom-top+12));const canvas=document.createElement('canvas');canvas.width=Math.max(8,Math.ceil((right-left+12)*scale));canvas.height=Math.max(8,Math.ceil((bottom-top+12)*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle=ctx.fillStyle='black';ctx.lineWidth=Math.max(1.8,Math.min(4,data.height/100))*scale;ctx.lineCap=ctx.lineJoin='round';
 for(const stroke of data.strokes){ctx.beginPath();stroke.forEach((p,i)=>{const x=(p.x-left+6)*scale,y=(p.y-top+6)*scale;i?ctx.lineTo(x,y):ctx.moveTo(x,y);if(stroke.length===1){ctx.arc(x,y,ctx.lineWidth/2,0,Math.PI*2);ctx.fill()}});ctx.stroke()}
 return request('recognize',canvasTensor(canvas),signal);
}
// Diagnostics use only a user-selected image; no expected word or vocabulary is supplied.
export function recognizeInkImage(image,signal){if(image.width<1||image.height<1||image.width>4096||image.height>4096)throw Error('图片尺寸不支持');const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0);return request('recognize',canvasTensor(canvas),signal)}
