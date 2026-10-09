'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {configuration,tokenHash}=require('../lib/article-comments/runtime.cjs');
const {createSubscriptionHandler}=require('../lib/article-comments/subscription.cjs');
const {createHandler}=require('../lib/article-comments/service.cjs');
const origin='https://www.donventas.mx';
function res(){return {headers:{},setHeader(k,v){this.headers[k]=v;},end(value){this.body=JSON.parse(value);}};}
const req=body=>({method:'POST',headers:{origin,'content-type':'application/json'},body,socket:{remoteAddress:'127.0.0.1'}});
test('hosted runtime requires explicit comments secrets and activation, never diagnostic fallback',()=>{
  const env={VERCEL:'1',VERCEL_ENV:'production',ARTICLE_COMMENTS_MODE:'live',SUPABASE_LEAD_KEY:'existing-diagnostic'};
  assert.equal(configuration(env),null);
  Object.assign(env,{ARTICLE_COMMENTS_INTAKE_KEY:'test'.repeat(10),ARTICLE_COMMENTS_ANON_JWT:'eyJtest',ARTICLE_COMMENTS_SUPABASE_URL:'https://isolated.supabase.co',ARTICLE_COMMENTS_HASH_SECRET:'a'.repeat(32)});
  const c=configuration(env);assert.equal(c.origin,origin);
  assert.equal(c.clientAddress({headers:{'x-forwarded-for':'1.2.3.4'}}),null);
  assert.equal(c.clientAddress({headers:{'x-vercel-forwarded-for':'1.2.3.4'}}),'1.2.3.4');
  assert.equal(c.clientAddress({headers:{'x-vercel-forwarded-for':'1.2.3.4, 8.8.8.8'}}),null);
  assert.equal(configuration({...env,VERCEL_ENV:'preview'}),null);
});
test('test intake restricts recipients server-side and preserves the QA marker',async()=>{
  let saved;const handler=createHandler({mode:'test',origin,secret:'x'.repeat(32),testEmail:'owner@example.test',store:{async receive(record){saved=record;}}});
  const b={article_id:'manual-de-marca',email:'visitor@example.test',name:'',message:'test',website:'',newsletter:false,submission_key:crypto.randomUUID()};
  const denied=res();await handler(req(b),denied);assert.equal(denied.statusCode,422);assert.equal(saved,undefined);
  const ok=res();await handler(req({...b,email:'owner@example.test'}),ok);assert.equal(ok.statusCode,202);assert.equal(saved.is_test,true);assert.equal(ok.body.mode,'test');
});
test('subscription requires POST and exact origin; malformed tokens never reach storage',async()=>{
  let calls=0;const handler=createSubscriptionHandler({origin,store:{rpc:async()=>{calls++;return true;}}});
  for(const request of [{method:'GET'},{...req({action:'confirm',token:'a'.repeat(64)}),headers:{origin:'https://evil.test'}},req({action:'confirm',token:'short'}),req({action:'confirm',token:'a'.repeat(64),email:'private'})]){
    const result=res();await handler(request,result);assert.ok(result.statusCode>=400);
  }
  assert.equal(calls,0);
});
test('subscription hashes the bearer token before storage and returns no personal data',async()=>{
  let captured;const handler=createSubscriptionHandler({origin,store:{async rpc(name,body){captured={name,body};return true;}}});
  const token='a'.repeat(64),result=res();await handler(req({action:'unsubscribe',token}),result);
  assert.equal(result.statusCode,200);assert.equal(captured.body.p_hash,tokenHash(token));assert.notEqual(captured.body.p_hash,token);assert.deepEqual(result.body,{ok:true});
});
test('expired link and temporary storage failure are distinct, retry-safe responses',async()=>{
  for(const [reply,status] of [[false,410],['fail',503]]){
    const handler=createSubscriptionHandler({origin,store:{async rpc(){if(reply==='fail')throw Error('private');return reply;}}});
    const result=res();await handler(req({action:'confirm',token:'a'.repeat(64)}),result);assert.equal(result.statusCode,status);assert.deepEqual(result.body,{ok:false});
  }
});
test('subscription page has no analytics or external scripts and never acts automatically',async()=>{
  const fs=require('node:fs/promises');const page=await fs.readFile(__dirname+'/../suscripcion.html','utf8'),js=await fs.readFile(__dirname+'/../subscription.js','utf8');
  assert.doesNotMatch(page,/analytics|googletagmanager|https:\/\/|mailto:/);assert.match(page,/no-referrer/);assert.match(page,/noindex/);
  assert.match(js,/history.replaceState/);assert.match(js,/addEventListener\('click'/);assert.doesNotMatch(js,/localStorage|sessionStorage/);
});
