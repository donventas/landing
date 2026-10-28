'use strict';
const {Fault}=require('./service.cjs');
class PortalStore {
 constructor({url,key,anonJwt,fetchImpl=globalThis.fetch}) {
  if(!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url)||typeof key!=='string'||key.length<32||!anonJwt?.startsWith('eyJ')||typeof fetchImpl!=='function')throw Error('configuration');
  Object.assign(this,{url,key,anonJwt,fetch:fetchImpl});
 }
 async call(operation,params){
  if(!['receive','subscription'].includes(operation))throw new Fault(503,'unavailable');
  const response=await this.fetch(this.url+'/functions/v1/portal-intake',{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),headers:{Authorization:'Bearer '+this.anonJwt,'x-dv-intake-key':this.key,'Content-Type':'application/json'},body:JSON.stringify({operation,params})});
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw new Fault(response.status===429?429:response.status===409?409:503,response.status===429?'rate_limited':response.status===409?'key_reused':'unavailable');
  return body.result;
 }
 async receive(record,keys){const result=await this.call('receive',{p_record:record,p_keys:keys});if(result?.accepted!==true||typeof result.duplicate!=='boolean')throw new Fault(503,'unavailable');return result;}
 action(action,hash){return this.call('subscription',{p_action:action,p_hash:hash});}
}
module.exports={PortalStore};
