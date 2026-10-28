'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const secret='whsec_'+Buffer.from('a'.repeat(32)).toString('base64');
const env={PORTAL_RESEND_WEBHOOK_SECRET:secret,PORTAL_DELIVERY_MODE:'test',SUPABASE_URL:'https://testproject.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-only'};
const event={type:'email.delivered',data:{email_id:'12345678-1234-4234-8234-123456789012',tags:{integration:'dv_portal'},to:['private@example.test']}};
function request(value=event,{bad=false,age=0}={}){const body=JSON.stringify(value),id='msg_test',ts=String(Math.floor(Date.now()/1000)-age);const sig=crypto.createHmac('sha256',Buffer.from(secret.slice(6),'base64')).update(id+'.'+ts+'.').update(body).digest('base64');return new Request('https://test.example/',{method:'POST',body,headers:{'svix-id':id,'svix-timestamp':ts,'svix-signature':'v1,'+(bad?'invalid':sig)}});}
test('Portal webhook authenticates, scopes events to test records, retries races and ignores unrelated emails',async()=>{
 const previousDeno=globalThis.Deno,previousFetch=globalThis.fetch;let calls=[];
 globalThis.Deno={env:{get:k=>env[k]}};
 globalThis.fetch=async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return Response.json(calls.length!==2);};
 try{
  const worker=(await import('../supabase/functions/portal-delivery-events/index.ts')).default;
  assert.equal((await worker.fetch(request(event,{bad:true}))).status,401);
  assert.equal((await worker.fetch(request(event,{age:301}))).status,401);
  assert.equal((await worker.fetch(request({...event,data:{...event.data,tags:{integration:'other'}}}))).status,204);
  assert.equal(calls.length,0);
  assert.equal((await worker.fetch(request())).status,204);
  assert.deepEqual(calls[0].body,{p_provider_id:event.data.email_id,p_event:'delivered',p_test_only:true});
  assert.equal(JSON.stringify(calls).includes('private@example.test'),false);
  assert.equal((await worker.fetch(request())).status,503);
 }finally{globalThis.Deno=previousDeno;globalThis.fetch=previousFetch;}
});
