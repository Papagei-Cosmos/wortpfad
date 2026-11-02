import {THEME_CATALOG} from './theme-catalog.js';
export const THEMES=THEME_CATALOG;
export function themeDecks(words){
 const usable=new Set(words.filter(w=>w.practice).map(w=>w.id));const main=[],levels=[];
 for(const t of THEMES){
  const id='theme-'+t.id,ids=t.ids.filter(id=>usable.has(id));
  main.push({id,name:`主题 · ${t.title}`,themeId:t.id,themeLevel:null,ids});
  for(const [level,members]of Object.entries(t.levelIds)){
   const ids=members.filter(id=>usable.has(id));if(ids.length)levels.push({id:id+'-'+level.toLowerCase(),name:`主题 · ${t.title} · ${level}`,level,themeId:t.id,themeLevel:level,ids});
  }
 }
 return [...main,...levels];
}
