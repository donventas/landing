'use strict';
// Receipt adapter prepared for an isolated Supabase project. Not wired to the API.
// The release must supply a dedicated project explicitly; no production defaults.
const { Fault } = require('./service.cjs');
class SupabaseReceiptStore {
  constructor({ url, key, fetchImpl }) {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash || !key || typeof fetchImpl !== 'function') throw Error('explicit_storage_configuration_required');
    this.url = parsed.origin; this.key = key; this.fetch = fetchImpl;
  }
  async rpc(name, body) {
    const response = await this.fetch(this.url + '/rest/v1/rpc/' + name, { method: 'POST', redirect: 'error',
      headers: { apikey: this.key, ...(this.key.startsWith('eyJ') ? { Authorization: 'Bearer ' + this.key } : {}), 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: AbortSignal.timeout(8000) });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (error.code === 'P0001' && error.message === 'rate_limited') throw new Fault(429, 'rate_limited');
      if (error.code === 'P0001' && error.message === 'key_reused') throw new Fault(409, 'key_reused');
      throw new Fault(503, 'unavailable');
    }
    return response.json();
  }
  async receive(record, keys, _time, optIn) {
    const result = await this.rpc('dv_article_receive', { p_record: record, p_keys: keys, p_opt_in: optIn });
    if (typeof result?.duplicate !== 'boolean') throw new Fault(503, 'unavailable'); return result;
  }
  claim() { return this.rpc('dv_article_claim', {}); }
  finish(id, lease, patch) { return this.rpc('dv_article_finish', { p_id: id, p_lease: lease, p_patch: patch }); }
  event(event) { return this.rpc('dv_article_event', { p_event: event }); }
  purge() { return this.rpc('dv_article_purge', {}); }
}
module.exports = { SupabaseReceiptStore };

// Production intake: only two operations, no Supabase service-role key in Vercel.
class SupabaseIntakeStore {
  constructor({url,key,anonJwt,fetchImpl}) {
    if(!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url) || !key || key.length<32 || !anonJwt?.startsWith('eyJ') || typeof fetchImpl!=='function')throw Error('explicit_intake_configuration_required');
    Object.assign(this,{url,key,anonJwt,fetch:fetchImpl});
  }
  async rpc(name,params){
    const operation=({'dv_article_receive':'receive','dv_newsletter_action':'subscription'})[name];
    if(!operation)throw new Fault(503,'unavailable');
    const r=await this.fetch(this.url+'/functions/v1/article-comments-intake',{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),headers:{Authorization:'Bearer '+this.anonJwt,'x-dv-intake-key':this.key,'Content-Type':'application/json'},body:JSON.stringify({operation,params})});
    const body=await r.json().catch(()=>({}));
    if(!r.ok)throw new Fault(r.status===429?429:r.status===409?409:503,r.status===429?'rate_limited':r.status===409?'key_reused':'unavailable');
    return body.result;
  }
  async receive(record,keys,_time,optIn){const result=await this.rpc('dv_article_receive',{p_record:record,p_keys:keys,p_opt_in:optIn});if(typeof result?.duplicate!=='boolean')throw new Fault(503,'unavailable');return result;}
}
module.exports.SupabaseIntakeStore=SupabaseIntakeStore;
