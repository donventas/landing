// Candidate: signed provider events only. Never log payloads or email addresses.
import {createHmac,timingSafeEqual} from 'node:crypto';
import {Buffer} from 'node:buffer';
const respond=(status:number)=>new Response(null,{status,headers:{'Cache-Control':'no-store'}});
export default {async fetch(req:Request):Promise<Response>{
 if(req.method!=='POST')return respond(405);
 const secret=Deno.env.get('PORTAL_RESEND_WEBHOOK_SECRET')||'',mode=Deno.env.get('PORTAL_DELIVERY_MODE')||'',url=Deno.env.get('SUPABASE_URL')||'';
 let key='';try{key=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';}catch{return respond(503);}
 if(!secret.startsWith('whsec_')||!['test','live'].includes(mode)||!key||!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url))return respond(503);
 if(Number(req.headers.get('content-length'))>65536)return respond(413);
 const reader=req.body?.getReader();if(!reader)return respond(400);
 try{
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>65536){await reader.cancel();return respond(413);}chunks.push(value);}
  const raw=Buffer.concat(chunks),id=req.headers.get('svix-id')||'',timestamp=req.headers.get('svix-timestamp')||'';
  if(!id||id.length>200||!/^\d+$/.test(timestamp)||Math.abs(Date.now()/1000-Number(timestamp))>300)return respond(401);
  const expected=createHmac('sha256',Buffer.from(secret.slice(6),'base64')).update(id+'.'+timestamp+'.').update(raw).digest();
  if(!(req.headers.get('svix-signature')||'').split(' ').some(part=>{const [version,value]=part.split(',');const actual=Buffer.from(value||'','base64');return version==='v1'&&actual.length===expected.length&&timingSafeEqual(actual,expected);} ))return respond(401);
  const event=JSON.parse(raw.toString('utf8'));
  if(event.data?.tags?.integration!=='dv_portal')return respond(204);
  const states:Record<string,string>={'email.delivered':'delivered','email.bounced':'bounced','email.complained':'complained'};
  const state=states[event.type];if(!state)return respond(204);
  const provider=event.data?.email_id;
  if(typeof provider!=='string'||!/^[0-9a-f-]{36}$/.test(provider))return respond(400);
  const stored=await fetch(url+'/rest/v1/rpc/dv_portal_webhook_delivery',{method:'POST',redirect:'error',signal:AbortSignal.timeout(8000),headers:{apikey:key,...(key.startsWith('eyJ')?{Authorization:'Bearer '+key}:{}),'Content-Type':'application/json'},body:JSON.stringify({p_provider_id:provider,p_event:state,p_test_only:mode==='test'})});
  if(!stored.ok)return respond(503);
  // Unknown own IDs may be a race with the outbox write: ask Resend to retry.
  return respond(await stored.json()===true?204:503);
 }catch{return respond(503);}
}};
