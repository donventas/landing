// Narrow server-to-server facade. Its caller cannot read tables or choose an RPC.
// Keep gateway JWT verification enabled; additionally require this dedicated secret.
import { timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';
const reply=(status:number,body:object)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export default {async fetch(req:Request):Promise<Response>{
  if(req.method!=='POST')return reply(405,{code:'method'});
  const expected=Deno.env.get('ARTICLE_COMMENTS_INTAKE_KEY') || '',actual=req.headers.get('x-dv-intake-key') || '';
  if(expected.length<32)return reply(503,{code:'configuration'});
  const a=Buffer.from(actual),b=Buffer.from(expected);
  if(a.length!==b.length || !timingSafeEqual(a,b))return reply(401,{code:'unauthorized'});
  const mode=Deno.env.get('ARTICLE_COMMENTS_INTAKE_MODE');
  if(!['test','live'].includes(mode || ''))return reply(503,{code:'disabled'});
  if(Number(req.headers.get('content-length'))>32000)return reply(413,{code:'too_large'});
  const reader=req.body?.getReader();if(!reader)return reply(400,{code:'invalid'});
  try{
    let size=0;const chunks:Uint8Array[]=[];
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>32000){await reader.cancel();return reply(413,{code:'too_large'});}chunks.push(value);}
    let body;try{body=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return reply(400,{code:'invalid'});}
    let name='',params;
    if(body.operation==='receive'){
      const record=body.params?.p_record;
      if(!record || typeof record.email!=='string')return reply(422,{code:'invalid'});
      if(mode==='test' && record.email.toLowerCase()!=='arturo.villagomez@donventas.mx')return reply(422,{code:'invalid'});
      record.is_test=mode==='test';
      name='dv_article_receive';params={p_record:record,p_keys:body.params.p_keys,p_opt_in:body.params.p_opt_in};
    }else if(body.operation==='subscription'){
      const p=body.params;
      if(!['confirm','unsubscribe'].includes(p?.p_action) || typeof p.p_hash!=='string' || !/^[a-f0-9]{64}$/.test(p.p_hash))return reply(422,{code:'invalid'});
      name='dv_newsletter_action';params={p_action:p.p_action,p_hash:p.p_hash};
    }else{return reply(422,{code:'invalid'});}
    const url=Deno.env.get('SUPABASE_URL') || '';
    const key=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}').default || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if(!key || !/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url))return reply(503,{code:'configuration'});
    const r=await fetch(url+'/rest/v1/rpc/'+name,{method:'POST',redirect:'error',signal:AbortSignal.timeout(8000),headers:{apikey:key,...(key.startsWith('eyJ')?{Authorization:'Bearer '+key}:{}),'Content-Type':'application/json'},body:JSON.stringify(params)});
    const result=await r.json();
    if(!r.ok){const reason=result.code==='P0001'?result.message:'';return reply(reason==='rate_limited'?429:reason==='key_reused'?409:503,{code:reason==='rate_limited'?'rate_limited':reason==='key_reused'?'key_reused':'unavailable'});}
    return reply(200,{result});
  }catch{return reply(503,{code:'unavailable'});}
}};
