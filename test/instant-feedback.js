export const instantMilestone=combo=>Number.isSafeInteger(combo)&&combo>0&&combo%3===0;
// Keep feedback separate from recall scoring and stop it when the card changes.
export function instantHit(card,combo,{reduced=false,vibrate,complete=false}={}){
 const milestone=instantMilestone(combo);let animation,vibrating=false;
 if(!reduced){
  try{animation=card?.animate(complete?{translate:['0 0','0 5px','-5px -2px','5px 2px','-3px -1px','2px 0','0 0'],scale:[1,.99,1.015,1.009,1.004,1,1]}:milestone?{translate:['0 0','0 3px','-3px -1px','3px 1px','-2px 0','0 0'],scale:[1,.995,1.008,1.004,1,1]}:{scale:[.994,1.006,1]},{duration:complete?480:milestone?320:180,easing:'ease-out'})}catch{}
  if((milestone||complete)&&vibrate)try{vibrating=vibrate(complete?[45,35,65,40,90]:[22,28,38])!==false}catch{}
 }
 return {milestone,cancel(){animation?.cancel();if(vibrating)try{vibrate(0)}catch{}}};
}
