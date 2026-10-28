import {FRONTEND_ORIGIN,BACKEND_ORIGIN,frameURL,portalHash} from './route.js';
const frame=document.querySelector('#learning'),box=document.querySelector('#connection'),message=document.querySelector('#connectionText'),retry=document.querySelector('#retry'),direct=document.querySelector('#openDirect');
let timer,connected=false;
function connect(){connected=false;clearTimeout(timer);box.hidden=false;frame.hidden=false;retry.hidden=true;message.textContent='正在连接词间…';frame.src=frameURL(location.hash);direct.href=frame.src;timer=setTimeout(()=>{if(!connected){message.textContent='暂时无法连接词间，请检查网络后重试。你也可以在独立页面打开。';retry.hidden=false}},18000)}
if(location.origin===FRONTEND_ORIGIN||['127.0.0.1','localhost'].includes(location.hostname)){
 connect();retry.onclick=connect;window.addEventListener('hashchange',connect);
 window.addEventListener('message',event=>{if(event.origin!==BACKEND_ORIGIN||event.source!==frame.contentWindow)return;const data=event.data;if(!data||data.type!=='wortpfad:page-ready')return;connected=true;clearTimeout(timer);box.hidden=true;const hash=portalHash(data.path,data.hash);history.replaceState(null,'',hash);direct.href=frameURL(hash)});
}else{
 message.textContent='词间正在连接正式域名。请通过 ci.wwwxqz.com 打开；如果仍无法访问，请稍后重试。';direct.href=FRONTEND_ORIGIN+(location.hash||'/');direct.textContent='打开词间正式网址';
}
