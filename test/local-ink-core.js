export function inkBounds(data){
 if(data?.language!=='de-DE'||!Number.isFinite(data.width)||!Number.isFinite(data.height)||data.width<1||data.height<1||data.width>4096||data.height>4096||!Array.isArray(data.strokes)||data.strokes.length<1||data.strokes.length>128)throw Error('请在画板写下德语后重试');
 let left=data.width,top=data.height,right=0,bottom=0,count=0;
 for(const stroke of data.strokes){if(!Array.isArray(stroke)||!stroke.length||(count+=stroke.length)>8192)throw Error('笔迹过多，请分词书写');for(const p of stroke){if(!Number.isFinite(p?.x)||!Number.isFinite(p?.y)||p.x<0||p.y<0||p.x>data.width||p.y>data.height)throw Error('笔迹坐标异常，请重写');left=Math.min(left,p.x);right=Math.max(right,p.x);top=Math.min(top,p.y);bottom=Math.max(bottom,p.y)}}
 if(right-left<2||bottom-top<3)throw Error('笔迹太少，请写完整后识别');return {left,top,right,bottom};
}
export function decodeCTC(values,dims,characters){
 const [batch,steps,classes]=dims;if(batch!==1||classes!==characters.length||values.length!==steps*classes)throw Error('识别模型与字表不匹配');
 let previous=-1,text='';for(let t=0;t<steps;t++){let best=0;const start=t*classes;for(let c=1;c<classes;c++)if(values[start+c]>values[start+best])best=c;if(best&&best!==previous)text+=characters[best];previous=best;}
 text=text.replace(/[\u0000-\u001f\u007f]/g,'').trim().normalize('NFC');if(text.length>200)throw Error('识别内容过长，请分词书写');return text;
}
