import * as ort from './vendor/ort/ort.wasm.min.mjs';
import {decodeCTC} from './local-ink-core.js';
ort.env.wasm.numThreads=1;ort.env.wasm.proxy=false;ort.env.wasm.wasmPaths=new URL('./vendor/ort/',import.meta.url).href;
let initialized;const cancelled=new Set(),queued=new Set();let queue=Promise.resolve();
async function modelBytes(){
 const url=new URL('./local-ink/recognizer.onnx?v=6f327246b50388f3',import.meta.url);let cache;try{cache=await caches.open('wortpfad-browser-ink-v1');const found=await cache.match(url);if(found)return found.arrayBuffer()}catch{}
 const response=await fetch(url);if(!response.ok)throw Error('手写模型加载失败');const bytes=await response.arrayBuffer();
 const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');if(digest!=='6f327246b50388f3c176ae304bd95767ea6dc0c9ae92153ef8cbe210b3c14884')throw Error('手写模型校验失败');
 if(cache)try{await cache.put(url,new Response(bytes,{headers:{'Content-Type':'application/octet-stream'}}))}catch{}return bytes;
}
function initialize(){if(!initialized)initialized=(async()=>{const [bytes,res]=await Promise.all([modelBytes(),fetch(new URL('./local-ink/characters.json',import.meta.url))]);if(!res.ok)throw Error('手写字表加载失败');const characters=await res.json(),session=await ort.InferenceSession.create(bytes,{executionProviders:['wasm'],graphOptimizationLevel:'all'});return {session,characters}})().catch(e=>{initialized=null;throw e});return initialized}
self.onmessage=({data})=>{if(data.kind==='cancel'){if(queued.has(data.id))cancelled.add(data.id);return}queued.add(data.id);queue=queue.then(async()=>{
 try{if(cancelled.has(data.id))return;const {session,characters}=await initialize();if(cancelled.has(data.id))return;
  if(data.kind==='health'){self.postMessage({id:data.id,ok:true,engine:'PP-OCRv6 浏览器本机识别',mode:'local'});return}
  if(data.kind!=='recognize'||!(data.tensor instanceof Float32Array)||!Number.isInteger(data.width)||data.width<32||data.width>2048||data.tensor.length!==3*48*data.width)throw Error('笔迹数据异常');
  const input=new ort.Tensor('float32',data.tensor,[1,3,48,data.width]);let output;try{output=await session.run({[session.inputNames[0]]:input});const value=output[session.outputNames[0]],text=decodeCTC(value.data,value.dims,characters);if(!text)throw Error('没有识别出文字，请重写');if(!cancelled.has(data.id))self.postMessage({id:data.id,ok:true,text,alternatives:[text],engine:'PP-OCRv6 浏览器本机识别',mode:'local'});}finally{input.dispose();if(output)for(const value of Object.values(output))value.dispose()}
 }catch(e){if(!cancelled.has(data.id))self.postMessage({id:data.id,ok:false,error:e.message||'本机识别失败'})}finally{queued.delete(data.id);cancelled.delete(data.id)}
 });};
