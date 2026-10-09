'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {SupabaseIntakeStore}=require('../lib/article-comments/supabase-store.cjs');
const secret='test-only-intake-'.repeat(3),env={ARTICLE_COMMENTS_INTAKE_KEY:secret,ARTICLE_COMMENTS_INTAKE_MODE:'test',SUPABASE_URL:'https://isolated.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'private-runtime-only'};
function request(body,key=secret){return new Request('https://example.test',{method:'POST',headers:{'x-dv-intake-key':key},body:JSON.stringify(body)});}
async function fixture(run,fetchImpl){const oldDeno=globalThis.Deno,oldFetch=globalThis.fetch;globalThis.Deno={env:{get:k=>env[k]}};globalThis.fetch=fetchImpl;try{await run((await import('../supabase/functions/article-comments-intake/index.ts')).default);}finally{globalThis.Deno=oldDeno;globalThis.fetch=oldFetch;}}
test('intake private key cannot execute arbitrary RPCs or read project data',async()=>{
  let calls=0;await fixture(async api=>{
    for(const operation of ['query','dv_article_purge','dv_article_claim','public.lead','__proto__'])assert.equal((await api.fetch(request({operation,params:{}}))).status,422);
    assert.equal((await api.fetch(request({operation:'receive'},'wrong'))).status,401);
  },()=>{calls++;throw Error();});assert.equal(calls,0);
});
test('intake test mode rejects other email addresses and forces the QA marker',async()=>{
  let params;await fixture(async api=>{
    assert.equal((await api.fetch(request({operation:'receive',params:{p_record:{email:'someone@example.test'}}}))).status,422);
    assert.equal((await api.fetch(request({operation:'receive',params:{p_record:{email:'arturo.villagomez@donventas.mx',is_test:false},p_keys:{},p_opt_in:{}}}))).status,200);
  },async(url,options)=>{assert.match(url,/dv_article_receive$/);params=JSON.parse(options.body);return Response.json({duplicate:false});});assert.equal(params.p_record.is_test,true);
});
test('intake disabled without explicit activation; provider errors are sanitized',async()=>{
  delete env.ARTICLE_COMMENTS_INTAKE_MODE;
  try{await fixture(async api=>{assert.equal((await api.fetch(request({}))).status,503);},()=>{throw Error('no network');});}finally{env.ARTICLE_COMMENTS_INTAKE_MODE='test';}
  await fixture(async api=>{const r=await api.fetch(request({operation:'subscription',params:{p_action:'confirm',p_hash:'a'.repeat(64)}}));assert.equal(r.status,503);assert.doesNotMatch(await r.text(),/private diagnostic/);},async()=>Response.json({message:'private diagnostic'},{status:500}));
});
test('Vercel facade uses only a public gateway JWT and operation-specific secret',async()=>{
  let headers,body;const store=new SupabaseIntakeStore({url:'https://isolated.supabase.co',key:secret,anonJwt:'eyJpublic',fetchImpl:async(url,options)=>{assert.match(url,/functions\/v1\/article-comments-intake$/);headers=options.headers;body=JSON.parse(options.body);return Response.json({result:{duplicate:false}});}});
  await store.receive({}, {},0,{});assert.equal(headers.Authorization,'Bearer eyJpublic');assert.equal(headers['x-dv-intake-key'],secret);assert.equal(body.operation,'receive');
  await assert.rejects(store.rpc('dv_article_purge',{}));
});
