'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const envValues={PORTAL_INTAKE_KEY:'i'.repeat(32),PORTAL_WORKER_KEY:'w'.repeat(32),PORTAL_INTAKE_MODE:'test',PORTAL_DELIVERY_MODE:'test',PORTAL_TEST_EMAIL:'owner@example.test',PORTAL_CONTACT_TO:'owner@example.test',PORTAL_MAIL_FROM:'Don Ventas <comentarios@donventas.mx>',PORTAL_PUBLIC_ORIGIN:'http://127.0.0.1:8022',PORTAL_TOKEN_SECRET:'t'.repeat(32),RESEND_API_KEY:'fake-test-key',SUPABASE_URL:'https://testproject.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'fake-service'};
const req=(value,worker=false)=>new Request('https://edge.example.test',{method:'POST',headers:{'content-type':'application/json',[worker?'x-dv-worker-key':'x-dv-intake-key']:(worker?'w':'i').repeat(32)},body:JSON.stringify(value)});
test('edge intake locks test recipient, purpose RPC and mode',async()=>{
 const {createIntake}=await import('../supabase/functions/_shared/portal.mjs');let calls=[];
 const f=createIntake(k=>envValues[k],async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return Response.json({accepted:true,duplicate:false});});
 assert.equal((await f(req({operation:'receive',params:{p_record:{email:'other@example.test'}}}))).status,422);
 assert.equal((await f(req({operation:'choose_rpc',params:{}}))).status,422);
 assert.equal(calls.length,0);
 assert.equal((await f(req({operation:'receive',params:{p_record:{email:'owner@example.test',is_test:false},p_keys:{}}}))).status,200);
 assert.equal(calls[0].body.p_record.is_test,true);assert.match(calls[0].url,/dv_portal_receive$/);
});
test('worker HTML escapes input, uses Reply-To and records accepted, not delivered',async()=>{
 const {createWorker}=await import('../supabase/functions/_shared/portal.mjs');let email,finish;
 const mock=async(url,options)=>{
  if(url.endsWith('dv_portal_delivery_pending'))return Response.json([{provider_id:'missing'}]);
  if(url==='https://api.resend.com/emails/missing')return Response.json({}, {status:404});
  if(url.endsWith('dv_portal_claim'))return Response.json({id:'job',lease:'lease',kind:'contact',is_test:true,email:'owner@example.test',name:'<script>bad</script>',message:'Private QA'});
  if(url==='https://api.resend.com/emails'){email={payload:JSON.parse(options.body),headers:options.headers};return Response.json({id:'12345678-1234-4234-8234-123456789012'});}
  if(url.endsWith('dv_portal_finish')){finish=JSON.parse(options.body);return Response.json(true);}throw Error('unexpected');
 };
 const result=await createWorker(k=>envValues[k],mock)(req({},true));assert.equal(result.status,200);
 const summary=await result.json();assert.equal(summary.reconciliationPending,1);assert.deepEqual(summary.reconciliationHTTP,{'404':1});
 assert.equal(email.payload.reply_to,'owner@example.test');assert.notEqual(email.payload.from,'owner@example.test');assert.equal(email.payload.html.includes('<script>'),false);
 assert.deepEqual(email.payload.tags,[{name:'integration',value:'dv_portal'}]);
 assert.equal(email.headers['Idempotency-Key'],'portal/job');assert.ok(finish.p_provider_id);assert.equal(finish.p_error,null);
});
test('worker refuses any uncontrolled test recipient',async()=>{
 const {createWorker}=await import('../supabase/functions/_shared/portal.mjs');let sent=false;
 const mock=async url=>{
  if(url.endsWith('dv_portal_delivery_pending'))return Response.json([]);
  if(url.endsWith('dv_portal_claim'))return Response.json({id:'job',lease:'lease',kind:'confirmation',is_test:true,email:'other@example.test'});
  if(url.endsWith('dv_portal_finish'))return Response.json(true);
  sent=true;throw Error('unexpected');
 };
 assert.equal((await createWorker(k=>envValues[k],mock)(req({},true))).status,503);assert.equal(sent,false);
});
test('tokens bind purpose, job and action; missing secrets fail before claim',async()=>{
 const {token,createWorker}=await import('../supabase/functions/_shared/portal.mjs');
 assert.notEqual(token('s','a','confirm'),token('s','a','unsubscribe'));assert.notEqual(token('s','a','confirm'),token('s','b','confirm'));
 let called=false;assert.equal((await createWorker(k=>k==='RESEND_API_KEY'?'':envValues[k],async()=>{called=true;})(req({},true))).status,503);assert.equal(called,false);
});
