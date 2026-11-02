import {validBackup} from './core.js';
// Merge completed vocabulary outcomes only. Keep the active question in this tab.
export function mergeSavedVocabulary(state,saved,known){
 const incoming=validBackup(saved,known);let changed=false;
 for(const [id,record]of Object.entries(incoming)){const old=state.records[id];if(!old||record.last>old.last){state.records[id]=record;changed=true}}
 return changed;
}
// Preserve the unreadable original before a fresh state is written over its key.
export function preserveUnreadable(storage,key,raw,now=Date.now()){
 if(!raw)return null;const recoveryKey=key+'.recovery.'+now;
 storage.setItem(recoveryKey,raw);
 if(storage.getItem(recoveryKey)!==raw)throw Error('无法保留原始记录');
 return recoveryKey;
}

export function latestRecovery(storage,key){
 let latest=-1,raw=null;const prefix=key+'.recovery.';
 for(let i=0;i<storage.length;i++){const k=storage.key(i);if(!k?.startsWith(prefix))continue;const at=Number(k.slice(prefix.length));if(Number.isFinite(at)&&at>latest){const value=storage.getItem(k);if(value){latest=at;raw=value}}}
 return raw;
}
