// Only explicit user edits, never inferred from the current question or vocabulary.
export function replaceInkLetter(text,letter,start=0,end=0){
 if(!['E','e','Z','z'].includes(letter))return text;
 if(end>start)return text.slice(0,start)+letter+text.slice(end);
 const at=text.search(/\S/u);return at<0?letter:text.slice(0,at)+letter+text.slice(at+1);
}
export function cleanCandidates(text,alternatives=[]){
 return [...new Set([text,...(Array.isArray(alternatives)?alternatives:[])].filter(v=>typeof v==='string'&&v.trim()&&v.length<=200))].slice(0,10);
}

export function inkWords(text){return [...text.matchAll(/\p{L}[\p{L}\p{M}]*/gu)].map(m=>({text:m[0],start:m.index}))}
export function toggleInkInitial(text,start){
 const word=inkWords(text).find(w=>w.start===start);if(!word)return text;
 const letter=String.fromCodePoint(word.text.codePointAt(0));
 const upper=letter==='ß'?'ẞ':letter.toLocaleUpperCase('de-DE');
 const replacement=letter===upper?letter.toLocaleLowerCase('de-DE'):upper;
 return text.slice(0,start)+replacement+text.slice(start+letter.length);
}
