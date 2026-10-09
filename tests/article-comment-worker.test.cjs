'use strict';
const test=require('node:test'), assert=require('node:assert/strict');
const id='63edcc42-e127-483a-876f-15b6e905ef83';
const env={SUPABASE_SERVICE_ROLE_KEY:'test-only-service-role',SUPABASE_URL:'https://isolatedtest.supabase.co',RESEND_API_KEY:'re_test_only'};
async function fixture(run, fetchImpl) {
  const oldFetch=globalThis.fetch, oldDeno=globalThis.Deno;
  globalThis.Deno={env:{get:key=>env[key]}}; globalThis.fetch=fetchImpl;
  try { await run((await import('../supabase/functions/article-comment-worker/index.ts')).default); }
  finally { globalThis.fetch=oldFetch; globalThis.Deno=oldDeno; }
}
const request=()=>new Request('https://isolatedtest.supabase.co/functions/v1/article-comment-worker',{method:'POST',headers:{Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY}});
const job={id,lease:id,attempts:1,message:{is_test:true,email:'qa@example.test',article_title:'Prueba',article_url:'https://www.donventas.mx/blog/manual-de-marca.html',message:'Prueba sin información privada'}};
test('worker rejects anonymous and ordinary caller credentials without invoking storage or Resend',async()=>{
  await fixture(async worker=>{
    for(const auth of ['', 'Bearer public-key']) {
      const r=await worker.fetch(new Request('https://example.test',{method:'POST',headers:{Authorization:auth}})); assert.equal(r.status,401);
    }
  },()=>{throw Error('network forbidden');});
});
test('worker claims test fixtures only by default and uses the approved subject and recipient',async()=>{
  const calls=[];
  await fixture(async worker=>{
    const r=await worker.fetch(request()); assert.equal(r.status,200); assert.equal((await r.json()).state,'accepted');
  },async(url,options)=>{
    const body=JSON.parse(options.body); calls.push({url,options,body});
    return Response.json(url.endsWith('dv_article_claim')?job:url.endsWith('/emails')?{id}:true);
  });
  assert.equal(calls.length,3); assert.equal(calls[0].body.p_test_only,true);
  assert.equal(calls[1].body.subject,'PRUEBA · Comentarios del blog');
  assert.deepEqual(calls[1].body.to,['arturo.villagomez@donventas.mx']);
  assert.equal(calls[1].options.headers['Idempotency-Key'],'article-comment/'+id);
  assert.equal(calls[2].body.p_patch.state,'accepted');
});
test('dashboard header accepts only the same private server key, not a public key',async()=>{
  await fixture(async worker=>{
    for(const candidate of ['public-key',env.SUPABASE_SERVICE_ROLE_KEY]) {
      const r=await worker.fetch(new Request('https://example.test',{method:'POST',headers:{'x-dv-worker-key':candidate}}));
      assert.equal(r.status,candidate==='public-key'?401:200);
    }
  },async()=>Response.json(null));
});
test('modern Supabase runtime keys work without treating them as JWTs',async()=>{
  env.SUPABASE_SECRET_KEYS=JSON.stringify({default:'sb_secret_test_only'});
  try { await fixture(async worker=>{
    const r=await worker.fetch(new Request('https://example.test',{method:'POST',headers:{'x-dv-worker-key':'sb_secret_test_only'}}));
    assert.equal(r.status,200);
  },async(_url,options)=>{assert.equal(options.headers.apikey,'sb_secret_test_only');assert.equal(options.headers.Authorization,undefined);return Response.json(null);}); }
  finally { delete env.SUPABASE_SECRET_KEYS; }
});
test('worker persists retry on provider failure but does not report receipt as delivered',async()=>{
  const states=[];
  await fixture(async worker=>{const r=await worker.fetch(request());assert.equal(r.status,503);},async(url,options)=>{
    if(url.endsWith('dv_article_claim'))return Response.json(job);
    if(url.endsWith('/emails'))return new Response('',{status:500});
    states.push(JSON.parse(options.body).p_patch.state);return Response.json(true);
  });
  assert.deepEqual(states,['retry']);
});
test('worker does not resend or mark failed after a persistence error following acceptance',async()=>{
  const calls=[];
  await fixture(async worker=>{assert.equal((await worker.fetch(request())).status,503);},async(url)=>{
    calls.push(url);
    if(url.endsWith('dv_article_claim'))return Response.json(job);
    if(url.endsWith('/emails'))return Response.json({id});
    throw Error('storage failure');
  });
  assert.equal(calls.length,3);
});
