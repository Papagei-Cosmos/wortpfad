// Group completion keeps the original local synth. Answer/click cues use saved user-selected files.
const FILES={correct:'audio/feedback/success.wav',error:'audio/feedback/error-random82.wav',click:'audio/feedback/click-random90.wav'};
function voiceBus(context,destination,level=.7){
 const gain=context.createGain(),compressor=context.createDynamicsCompressor();gain.gain.value=level;compressor.threshold.value=-12;compressor.knee.value=12;compressor.ratio.value=4;compressor.attack.value=.003;compressor.release.value=.1;gain.connect(compressor);compressor.connect(destination);
 const nodes=[];return {input:gain,nodes,stop(){for(const n of nodes)try{n.stop()}catch{}gain.disconnect();compressor.disconnect()}};
}
function tone(context,bus,hz,at,duration,level=.14,type='triangle',pan=0){
 const osc=context.createOscillator(),amp=context.createGain(),filter=context.createBiquadFilter();osc.type=type;osc.frequency.setValueAtTime(hz*1.014,at);osc.frequency.exponentialRampToValueAtTime(hz,at+.018);filter.type='lowpass';filter.frequency.setValueAtTime(6500,at);filter.frequency.exponentialRampToValueAtTime(1700,at+duration);
 amp.gain.setValueAtTime(.0001,at);amp.gain.exponentialRampToValueAtTime(level,at+.003);amp.gain.exponentialRampToValueAtTime(.0001,at+duration);osc.connect(filter);filter.connect(amp);
 if(context.createStereoPanner){const p=context.createStereoPanner();p.pan.value=pan;amp.connect(p);p.connect(bus.input)}else amp.connect(bus.input);
 osc.start(at);osc.stop(at+duration+.015);bus.nodes.push(osc);
}
function kick(context,bus,at,level=.18,length=.15){
 const osc=context.createOscillator(),amp=context.createGain();osc.frequency.setValueAtTime(165,at);osc.frequency.exponentialRampToValueAtTime(48,at+.075);amp.gain.setValueAtTime(.0001,at);amp.gain.exponentialRampToValueAtTime(level,at+.003);amp.gain.exponentialRampToValueAtTime(.0001,at+length);osc.connect(amp);amp.connect(bus.input);osc.start(at);osc.stop(at+length+.01);bus.nodes.push(osc);
}
function click(context,bus,at,level=.06,length=.035,frequency=5800){
 const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*length),context.sampleRate),samples=buffer.getChannelData(0);let seed=721;
 for(let i=0;i<samples.length;i++){seed=(seed*1664525+1013904223)>>>0;samples[i]=(seed/2147483648-1)*(1-i/samples.length)}
 const source=context.createBufferSource(),filter=context.createBiquadFilter(),amp=context.createGain();source.buffer=buffer;filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=.65;amp.gain.setValueAtTime(level,at);amp.gain.exponentialRampToValueAtTime(.0001,at+length);source.connect(filter);filter.connect(amp);amp.connect(bus.input);source.start(at);bus.nodes.push(source);
}
export function successChime(context,destination=context.destination,when=context.currentTime,{combo=1}={}){
 const bus=voiceBus(context,destination,.82),notes=[523.25,587.33,659.25,783.99,880,1046.5],root=notes[(Math.max(1,combo)-1)%notes.length];
 // A tight impact, a plucked fifth/octave and a light stereo echo.
 kick(context,bus,when,.14,.085);click(context,bus,when,.12,.024,6200);
 tone(context,bus,root,when,.13,.24,'triangle',-.12);tone(context,bus,root*1.5,when+.025,.14,.115,'sine',.2);tone(context,bus,root*2,when+.052,.18,.11,'sine',-.15);
 tone(context,bus,root*2,when+.13,.18,.038,'sine',.55);tone(context,bus,root*3,when+.18,.15,.02,'sine',-.55);return bus;
}
export function errorThud(context,destination=context.destination,when=context.currentTime){
 const bus=voiceBus(context,destination,.7);kick(context,bus,when,.22,.16);click(context,bus,when,.14,.045,820);tone(context,bus,196,when,.11,.11,'triangle',-.1);tone(context,bus,146.83,when+.055,.12,.07,'sine',.1);return bus;
}
export function groupChime(context,destination=context.destination,when=context.currentTime){
 const bus=voiceBus(context,destination,.78);
 for(const t of [0,.2,.4])kick(context,bus,when+t,.22,.14);
 for(const t of [.1,.3,.5,.7])click(context,bus,when+t,.09,.036,5900);
 for(const [i,hz]of [523.25,659.25,783.99,1046.5,1318.51].entries())tone(context,bus,hz,when+.04+i*.075,.23,.16,'triangle',i%2?.3:-.3);
 for(const [i,hz]of [523.25,659.25,783.99,1046.5].entries()){
  tone(context,bus,hz,when+.5,.55,.085,'triangle',(i-1.5)*.25);tone(context,bus,hz*2,when+.64,.55,.025,'sine',(1.5-i)*.3);
 }
 tone(context,bus,130.81,when+.4,.5,.18,'sine');click(context,bus,when+.5,.09,.11,8500);return bus;
}
export class SoundFeedback{
 constructor(){this.enabled=true;this.context=null;this.ticket=0;this.volume=.7;this.buffers=new Map();this.raw=new Map();this.uiSources=new Set();this.clickTicket=0;for(const [kind,path]of Object.entries(FILES))this.raw.set(kind,fetch(path).then(r=>{if(!r.ok)throw Error(path);return r.arrayBuffer()}).then(data=>({data}),error=>({error})));}
 unlock(){try{const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return Promise.resolve(false);this.context||=new Context();return this.context.resume().then(()=>this.context.state==='running').catch(()=>false)}catch{return Promise.resolve(false)}}
 async buffer(kind){if(!this.buffers.has(kind))this.buffers.set(kind,(async()=>{const value=await this.raw.get(kind);if(value.error)throw value.error;return this.context.decodeAudioData(value.data.slice(0))})());return this.buffers.get(kind)}
 async click(){
  if(!this.enabled||!this.volume)return false;const ticket=++this.clickTicket;await this.unlock();if(this.context?.state!=='running')return false;
  try{const buffer=await this.buffer('click');if(ticket!==this.clickTicket||!this.enabled||!this.volume)return false;
   for(const old of this.uiSources)old.stop();const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=buffer;gain.gain.value=this.volume*.5;source.connect(gain);gain.connect(this.context.destination);this.uiSources.add(source);source.onended=()=>{this.uiSources.delete(source);source.disconnect();gain.disconnect()};source.start();return true;
  }catch{this.onStatus?.('跳过音效读取失败，请刷新页面重试。');return false}
 }
 async play(kind,complete=false,combo=1){
  if(kind==='click')return this.click();
  if(!this.enabled||!this.volume)return false;const ticket=++this.ticket;await this.unlock();if(!this.enabled||this.context?.state!=='running'||ticket!==this.ticket)return false;
  try{const buffer=FILES[kind]?await this.buffer(kind):null;if(ticket!==this.ticket||!this.enabled||!this.volume)return false;
   this.active?.stop();const level=this.context.createGain();level.gain.value=this.volume;level.connect(this.context.destination);const parts=[];
   if(buffer){const source=this.context.createBufferSource();source.buffer=buffer;source.connect(level);source.start();parts.push({stop(){try{source.stop()}catch{}source.disconnect()}})}
   if(complete)parts.push(groupChime(this.context,level,this.context.currentTime+(buffer?buffer.duration+.05:0)));
   const active={stop(){parts.forEach(p=>p.stop());level.disconnect()}};this.active=active;
   setTimeout(()=>{if(this.active===active){active.stop();this.active=null}},((buffer?.duration||0)+(complete?1.3:.05))*1000);return true;
  }catch{this.onStatus?.('指定音效读取失败，请刷新页面重试。');return false}
 }
 correct(complete=false,combo=1){return this.play('correct',complete,combo)}
 error(){return this.play('error')}
 complete(){return this.play('complete',true)}
 stop(){this.ticket++;this.active?.stop();this.active=null}
 setEnabled(value){this.enabled=!!value;if(!this.enabled){this.stop();this.stopClicks()}}
 stopClicks(){this.clickTicket++;for(const source of this.uiSources)try{source.stop()}catch{}this.uiSources.clear()}
 setVolume(value){this.volume=Math.max(0,Math.min(1,Number(value)||0));this.stop();this.stopClicks()}
}
