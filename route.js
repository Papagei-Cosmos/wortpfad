export const FRONTEND_ORIGIN='https://ci.wwwxqz.com';
export const BACKEND_ORIGIN='https://ci-api.wwwxqz.com';
const serverPages=new Set(['/login','/account','/admin','/setup']);
export function validHash(value){return typeof value==='string'&&/^#[A-Za-z0-9_=/.-]{0,300}$/.test(value)}
export function frameURL(hash){const url=new URL('/',BACKEND_ORIGIN);if(validHash(hash)&&hash.startsWith('#/')&&serverPages.has(hash.slice(1))){url.pathname=hash.slice(1)}else{url.hash=validHash(hash)?hash:'#home'}return url.href}
export function portalHash(path,hash){if(serverPages.has(path))return '#'+path;return path==='/'&&validHash(hash)?hash:'#home'}
