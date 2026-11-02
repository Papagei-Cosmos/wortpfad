const https=url=>{try{const u=new URL(url);return u.protocol==='https:'?u.href:null}catch{return null}};
export function articleCreditHTML(source,esc){
 if(!source)return '';const url=https(source.url),license=https(source.licenseUrl);if(!url||!license)return '';
 const location=source.locator?`第 ${source.locator.number} ${source.locator.unit==='page'?'页':'段'}`:'';
 return `<small class="muted article-credit">原文摘录 · ${esc(source.sourceLevels.join('/'))} 阅读材料 · <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a> · ${esc(source.author)} · ${esc(source.documentTitle)} · ${esc(location)} · <a href="${esc(license)}" target="_blank" rel="noopener noreferrer">${esc(source.license)}</a><br>材料级别由发布方标注，非逐句认证。德语原文未改；中文翻译及填空处理由本项目补充，按同一许可提供，待人工复核。朗读为合成语音。</small>`;
}
