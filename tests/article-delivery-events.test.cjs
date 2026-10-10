'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const secret='whsec_'+Buffer.from('test-only-signing-key').toString('base64');
const env={ARTICLE_RESEND_WEBHOOK_SECRET:secret,SUPABASE_URL:'https://isolated.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-only'};
const provider='63edcc42-e127-483a-876f-15b6e905ef83';
function request(body,changes={}){
  const raw=JSON.stringify(body),ts=String(Math.floor(Date.now()/1000)),id='event_test';
  const signature=crypto.createHmac('sha256',Buffer.from(secret.slice(6),'base64')).update(id+'.'+ts+'.'+raw).digest('base64');
  return new Request('https://example.test',{method:'POST',body:raw,headers:{'svix-id':id,'svix-timestamp':ts,'svix-signature':'v1,'+signature,...changes}});
}
async function fixture(run,fetchImpl){
  const oldDeno=globalThis.Deno,oldFetch=globalThis.fetch;globalThis.Deno={env:{get:k=>env[k]}};globalThis.fetch=fetchImpl;
  try{await run((await import('../supabase/functions/article-delivery-events/index.ts')).default);}finally{globalThis.Deno=oldDeno;globalThis.fetch=oldFetch;}
}
const event=()=>({type:'email.delivered',created_at:new Date().toISOString(),data:{email_id:provider,to:['private@example.test'],subject:'private'}});

test('webhook does not require a Node Buffer global in the Edge runtime',async()=>{
  const req=request(event());
  // Node 22's Response.json itself needs the global Buffer. Construct the
  // mocked transport response before removing it; only the Edge handler is
  // under test, not Node's implementation of the Fetch API.
  const persisted=Response.json(true);
  await fixture(async handler=>{
    const previous=globalThis.Buffer;
    try {
      globalThis.Buffer=undefined;
      assert.equal((await handler.fetch(req)).status,204);
    } finally {globalThis.Buffer=previous;}
  },async()=>persisted);
});
test('signed delivery events store only the minimal event and accept duplicate RPC outcomes',async()=>{
  let b;await fixture(async handler=>{assert.equal((await handler.fetch(request(event()))).status,204);},async(_url,options)=>{b=JSON.parse(options.body);return Response.json(false);});
  assert.deepEqual(Object.keys(b.p_event).sort(),['at','id','provider_id','state']);assert.doesNotMatch(JSON.stringify(b),/private/);
});
test('bad signature, stale replay, oversized body and non-POST do not reach storage',async()=>{
  await fixture(async handler=>{
    assert.equal((await handler.fetch(request(event(),{'svix-signature':'v1,bad'}))).status,401);
    assert.equal((await handler.fetch(request(event(),{'svix-timestamp':'1'}))).status,401);
    assert.equal((await handler.fetch(request(event(),{'content-length':'65537'}))).status,413);
    assert.equal((await handler.fetch(new Request('https://example.test'))).status,405);
  },()=>{throw Error('must not call');});
});
test('unknown signed events are ignored; unavailable persistence requests provider retry',async()=>{
  await fixture(async handler=>{
    assert.equal((await handler.fetch(request({...event(),type:'email.opened'}))).status,204);
    assert.equal((await handler.fetch(request(event()))).status,503);
  },async()=>new Response(null,{status:500}));
});
