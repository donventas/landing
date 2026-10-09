// Public transport, signed Resend payload only. No provider body or email in logs/storage.
import { createHmac, timingSafeEqual } from 'node:crypto';
const respond=(status:number)=>new Response(null,{status,headers:{'Cache-Control':'no-store'}});
export default { async fetch(req:Request):Promise<Response> {
  if(req.method!=='POST')return respond(405);
  const secret=Deno.env.get('ARTICLE_RESEND_WEBHOOK_SECRET') || '';
  const url=Deno.env.get('SUPABASE_URL') || '';
  let key='';
  try {key=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}').default || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';}catch{return respond(503);}
  if(!secret.startsWith('whsec_') || !key || !/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url))return respond(503);
  if(Number(req.headers.get('content-length'))>65536)return respond(413);
  const reader=req.body?.getReader();if(!reader)return respond(400);
  const chunks:Uint8Array[]=[];let size=0;
  try {
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>65536){await reader.cancel();return respond(413);}chunks.push(value);}
    const raw=Buffer.concat(chunks);
    const id=req.headers.get('svix-id') || '', timestamp=req.headers.get('svix-timestamp') || '';
    if(!id || id.length>200 || !/^\d+$/.test(timestamp) || Math.abs(Date.now()/1000-Number(timestamp))>300)return respond(401);
    const signature=createHmac('sha256',Buffer.from(secret.slice(6),'base64')).update(id+'.'+timestamp+'.').update(raw).digest();
    if(!(req.headers.get('svix-signature') || '').split(' ').some(s=>{const [v,b]=s.split(',');const actual=Buffer.from(b || '','base64');return v==='v1' && actual.length===signature.length && timingSafeEqual(actual,signature);}))return respond(401);
    const event=JSON.parse(raw.toString('utf8'));
    const states:Record<string,string>={'email.delivered':'delivered','email.bounced':'bounced','email.failed':'failed','email.complained':'complained','email.delivery_delayed':'delayed'};
    const state=states[event.type];if(!state)return respond(204);
    const at=Date.parse(event.created_at),provider=event.data?.email_id;
    if(!Number.isFinite(at) || typeof provider!=='string' || !/^[0-9a-f-]{36}$/.test(provider))return respond(400);
    const stored=await fetch(url+'/rest/v1/rpc/dv_article_event',{method:'POST',redirect:'error',signal:AbortSignal.timeout(8000),
      headers:{apikey:key,...(key.startsWith('eyJ')?{Authorization:'Bearer '+key}:{}),'Content-Type':'application/json'},
      body:JSON.stringify({p_event:{id,provider_id:provider,state,at}})});
    return respond(stored.ok?204:503);
  } catch{return respond(503);}
} };
