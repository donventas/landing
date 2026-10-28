import {createHmac,createHash,timingSafeEqual} from 'node:crypto';
import {Buffer} from 'node:buffer';
const json=(status,body)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const hash=value=>createHash('sha256').update(value).digest('hex');
const escape=value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const address=value=>typeof value==='string'&&value.length<=254&&/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
export function token(secret,id,action){return createHmac('sha256',secret).update('dv-portal-v1|'+id+'|'+action).digest('hex');}
async function body(req){
 if(!/^application\/json(?:;|$)/i.test(req.headers.get('content-type')||''))throw Error('invalid');
 const reader=req.body?.getReader();if(!reader)throw Error('invalid');let length=0,chunks=[];
 while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>24000){await reader.cancel();throw Error('invalid');}chunks.push(value);}
 return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
function authorized(req,expected,header){const a=Buffer.from(req.headers.get(header)||''),b=Buffer.from(expected||'');return b.length>=32&&a.length===b.length&&timingSafeEqual(a,b);}
function rpcClient(env,fetchImpl){
 const url=env('SUPABASE_URL');const key=JSON.parse(env('SUPABASE_SECRET_KEYS')||'{}').default||env('SUPABASE_SERVICE_ROLE_KEY');
 if(!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url||'')||!key)throw Error('configuration');
 return async(name,params)=>{
  const response=await fetchImpl(url+'/rest/v1/rpc/'+name,{method:'POST',redirect:'error',signal:AbortSignal.timeout(8000),headers:{apikey:key,...(key.startsWith('eyJ')?{Authorization:'Bearer '+key}:{}),'Content-Type':'application/json'},body:JSON.stringify(params)});
  const result=await response.json();if(!response.ok){const error=new Error('database');if(result.code==='P0001'&&['rate_limited','key_reused'].includes(result.message))error.code=result.message;throw error;}return result;
 };
}
export function createIntake(env,fetchImpl=fetch){return async req=>{
 if(req.method!=='POST')return json(405,{code:'method'});
 if(!authorized(req,env('PORTAL_INTAKE_KEY'),'x-dv-intake-key'))return json(401,{code:'unauthorized'});
 const mode=env('PORTAL_INTAKE_MODE'),testEmail=env('PORTAL_TEST_EMAIL')?.trim().toLowerCase();
 if(!['test','live'].includes(mode)||!address(testEmail))return json(503,{code:'configuration'});
 try{
  const input=await body(req),rpc=rpcClient(env,fetchImpl);let result;
  if(input.operation==='receive'){
   const r=input.params?.p_record;if(!r||typeof r.email!=='string'||(mode==='test'&&r.email!==testEmail))return json(422,{code:'invalid'});
   result=await rpc('dv_portal_receive',{p_record:{...r,is_test:mode==='test'},p_keys:input.params.p_keys});
  }else if(input.operation==='subscription'){
   const p=input.params;if(!['confirm','unsubscribe'].includes(p?.p_action)||!/^[a-f0-9]{64}$/.test(p?.p_hash||''))return json(422,{code:'invalid'});
   result=await rpc('dv_portal_action',{p_action:p.p_action,p_hash:p.p_hash,p_test_only:mode==='test'});
  }else return json(422,{code:'invalid'});
  return json(200,{result});
 }catch(e){return json(e.code==='rate_limited'?429:e.code==='key_reused'?409:503,{code:e.code||'unavailable'});}
};}

export function createWorker(env,fetchImpl=fetch){return async req=>{
 if(req.method!=='POST')return json(405,{code:'method'});
 if(!authorized(req,env('PORTAL_WORKER_KEY'),'x-dv-worker-key'))return json(401,{code:'unauthorized'});
 const mode=env('PORTAL_DELIVERY_MODE'),testEmail=env('PORTAL_TEST_EMAIL')?.trim().toLowerCase(),to=env('PORTAL_CONTACT_TO'),from=env('PORTAL_MAIL_FROM'),origin=env('PORTAL_PUBLIC_ORIGIN'),secret=env('PORTAL_TOKEN_SECRET'),resend=env('RESEND_API_KEY');
 // Separate activation. Fail before claiming anything if configuration is incomplete.
 const allowedOrigin=origin==='https://www.donventas.mx'||/^http:\/\/127\.0\.0\.1:\d+$/.test(origin||'')&&mode==='test';
 if(!['test','live'].includes(mode)||!address(testEmail)||!address(to)||!/^Don Ventas <[a-z0-9._+-]+@donventas\.mx>$/.test(from||'')||!allowedOrigin||!secret||secret.length<32||!resend)return json(503,{code:'configuration'});
 const provider=async(path,options={})=>{
  const r=await fetchImpl('https://api.resend.com'+path,{...options,redirect:'error',signal:AbortSignal.timeout(10000),headers:{Authorization:'Bearer '+resend,'Content-Type':'application/json',...options.headers}});
  if(!r.ok){const error=new Error('provider');error.status=r.status;throw error;}return r.json();
 };
 try{
  const rpc=rpcClient(env,fetchImpl);let sent=0,observed=0,reconciliationPending=0;const reconciliationHTTP={};
  // Small batch, no PII or tokens in results/logs. Provider evidence, not assumptions.
  for(const item of await rpc('dv_portal_delivery_pending',{p_test_only:mode==='test'})){
   try{const result=await provider('/emails/'+encodeURIComponent(item.provider_id));
    if(['delivered','bounced','complained'].includes(result.last_event)){
     await rpc('dv_portal_delivery',{p_provider_id:item.provider_id,p_event:result.last_event});observed++;
    }
   }catch(e){reconciliationPending++;const code=Number.isInteger(e.status)?String(e.status):'transport';reconciliationHTTP[code]=(reconciliationHTTP[code]||0)+1;}
  }
  const job=await rpc('dv_portal_claim',{p_test_only:mode==='test'});
  if(!job)return json(200,{sent,observed,reconciliationPending,reconciliationHTTP});
  let providerId=null,error=null;
  try{
   if(!address(job.email)||(mode==='test'&&(!job.is_test||job.email!==testEmail||to!==testEmail)))throw Error('recipient');
   let payload;
   if(job.kind==='confirmation'){
    const confirm=token(secret,job.id,'confirm'),unsubscribe=token(secret,job.id,'unsubscribe');
    const ready=await rpc('dv_portal_prepare',{p_id:job.id,p_lease:job.lease,p_confirm_hash:hash(confirm),p_unsubscribe_hash:hash(unsubscribe)});
    if(!ready)throw Error('cancelled');
    const confirmURL=origin+'/suscripcion.html#portal-confirm='+confirm,unsubscribeURL=origin+'/suscripcion.html#portal-unsubscribe='+unsubscribe;
    payload={from,to:[job.email],subject:(job.is_test?'[Prueba] ':'')+'Confirma tu lugar · Portal Don Ventas',text:'Confirma que quieres recibir el aviso de lanzamiento y ofertas del Portal Don Ventas. Esta lista es independiente del blog.\n\nConfirmar: '+confirmURL+'\n\nCancelar o darte de baja: '+unsubscribeURL+'\n\nSi no lo solicitaste, no confirmes. El enlace de confirmación vence en 30 días.'};
   }else if(job.kind==='contact'){
    payload={from,to:[to],reply_to:job.email,subject:(job.is_test?'[Prueba] ':'')+'Solicitud privada · Don Ventas',html:'<h1>Solicitud de ayuda</h1><p>Origen: portada de Don Ventas. No implica una suscripción.</p><p>'+escape(job.name)+'</p><p>'+escape(job.message).replace(/\n/g,'<br>')+'</p>',text:'Solicitud privada desde la portada. No implica una suscripción.\n\n'+job.name+'\n\n'+job.message};
   }else throw Error('configuration');
   payload.tags=[{name:'integration',value:'dv_portal'}];
   const accepted=await provider('/emails',{method:'POST',headers:{'Idempotency-Key':'portal/'+job.id},body:JSON.stringify(payload)});
   if(!/^[a-f0-9-]{36}$/.test(accepted.id||''))throw Error('provider');providerId=accepted.id;sent++;
  }catch(e){error=['recipient','configuration','cancelled'].includes(e.message)?e.message:'provider';}
  const finished=await rpc('dv_portal_finish',{p_id:job.id,p_lease:job.lease,p_provider_id:providerId,p_error:error});
  if(!finished)return json(503,{code:'finish_unconfirmed'});
  return json(error?503:200,{sent,observed,reconciliationPending,reconciliationHTTP,...(error?{code:error}:{})});
 }catch{return json(503,{code:'unavailable'});}
};}
