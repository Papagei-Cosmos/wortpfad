// play() rejection is not enough: media can fail or stall after it has started.
export function playRecorded(player,{isCurrent,onEnd,onLateFailure,timeout=10000}){
 return new Promise((resolve,reject)=>{
  let started=false,finished=false,timer;
  const cleanup=()=>{clearTimeout(timer);player.onplaying=player.onwaiting=player.onstalled=player.onerror=player.onended=player.onpause=null};
  const cancel=()=>{if(finished)return;finished=true;cleanup();if(!started)resolve(false)};
  const fail=error=>{if(finished)return;if(!isCurrent()){cancel();return}finished=true;cleanup();player.pause();if(started)onLateFailure(error);else reject(error)};
  const watch=()=>{if(finished)return;clearTimeout(timer);timer=setTimeout(()=>fail(new Error('录音加载超时')),timeout)};
  player.onplaying=()=>{if(finished)return;if(!isCurrent()){cancel();player.pause();return}started=true;clearTimeout(timer);resolve(true)};
  player.onwaiting=watch;player.onstalled=watch;
  player.onerror=()=>fail(new Error('录音加载失败'));
  player.onended=()=>{if(finished)return;finished=true;cleanup();if(!started)resolve(false);if(isCurrent())onEnd?.()};
  player.onpause=()=>{if(!isCurrent())cancel()};
  watch();try{Promise.resolve(player.play()).then(()=>{if(finished)return;if(!isCurrent()){cancel();player.pause();return}started=true;clearTimeout(timer);resolve(true)},fail)}catch(e){fail(e)}
 });
}
