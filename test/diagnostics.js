import {localInkHealth,recognizeInkImage} from './local-ink-client.js';import {InkPad} from './ink.js';
const $=id=>document.getElementById(id),status=$('status'),out=$('result');
async function run(fn){const start=performance.now();status.textContent='正在加载或识别，请稍候…';try{const result=await fn();status.textContent='本机识别完成 · '+((performance.now()-start)/1000).toFixed(2)+' 秒';out.textContent=JSON.stringify(result,null,2)}catch(e){status.textContent='识别失败';out.textContent=e.message}}
$('warm').onclick=()=>run(localInkHealth);
for(const button of document.querySelectorAll('[data-sample]'))button.onclick=()=>run(async()=>{const image=$('probeImage');image.src='local-ink/'+button.dataset.sample+'.png';image.hidden=false;await image.decode();return recognizeInkImage(image)});
const pad=new InkPad($('pad'),{status,stats:$('stats'),placeholder:$('placeholder'),getRevision:()=>0,onText:text=>out.textContent=text});pad.draw();$('recognize').onclick=()=>pad.recognize();$('undo').onclick=()=>pad.undo();$('clear').onclick=()=>{pad.reset(true);out.textContent='等待识别'};
