export const normalize=text=>String(text).normalize('NFC').trim();
export function answersFor(word,article=false){if(article&&word.articleAnswers)return word.articleAnswers.map(normalize);return (word.answers||[word.lemma]).map(a=>normalize(article&&word.article?`${word.article} ${a}`:a))}
export function checkAnswer(text,word,article=false){return answersFor(word,article).includes(normalize(text))}
export function diffAnswer(input,target){
 const a=Array.from(normalize(input)),b=Array.from(normalize(target));
 const d=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
 for(let i=0;i<=a.length;i++)d[i][0]=i;for(let j=0;j<=b.length;j++)d[0][j]=j;
 for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
 const out=[];let i=a.length,j=b.length;
 while(i||j){if(i&&j&&d[i][j]===d[i-1][j-1]+(a[i-1]===b[j-1]?0:1)){out.unshift({type:a[i-1]===b[j-1]?'same':'replace',from:a[--i],to:b[--j]})}else if(i&&d[i][j]===d[i-1][j]+1){out.unshift({type:'delete',from:a[--i],to:''})}else{out.unshift({type:'insert',from:'',to:b[--j]})}}
 return out;
}
export function schedule(previous={},outcome,now=Date.now()){
 const streak=outcome==='first'?(previous.streak||0)+1:0;
 const days=outcome==='first'?[1,3,7,14,30,60][Math.min(streak-1,5)]:outcome==='retry'?1:0;
 return {...previous,streak,due:now+(days?days*86400000:600000),last:now,lastOutcome:outcome,wrong:outcome!=='first',seen:(previous.seen||0)+1};
}
export function validBackup(data,ids){
 if(!data||data.version!==1||typeof data.records!=='object'||!data.records||Array.isArray(data.records))throw new Error('不是有效的 Wortpfad 学习备份');
 const records={};for(const [id,r]of Object.entries(data.records)){
  if(!ids.has(id))continue;
  if(!r||!['first','retry','revealed'].includes(r.lastOutcome)||!Number.isFinite(r.due)||r.due<0||!Number.isFinite(r.last)||r.last<0||!Number.isInteger(r.streak)||r.streak<0||r.streak>100000||!Number.isInteger(r.seen)||r.seen<1||typeof r.wrong!=='boolean')throw new Error('备份包含无效的学习记录');
  records[id]={due:r.due,last:r.last,streak:r.streak,seen:r.seen,wrong:r.wrong,lastOutcome:r.lastOutcome};
 }
 return records;
}
