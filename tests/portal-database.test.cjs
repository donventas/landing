'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
// Explicit external test dependency; no install/build change to the public site.
const modulePath=process.env.PORTAL_TEST_PGLITE;
test('purpose-specific PostgreSQL migration and lifecycle',{skip:!modulePath},async t=>{
 const {PGlite}=require(modulePath),db=new PGlite();t.after(()=>db.close());
 await db.exec('create role anon; create role authenticated; create role service_role;');
 try{await db.exec(fs.readFileSync(path.join(__dirname,'../supabase/migrations/009_portal_intake.sql'),'utf8'));}catch(e){console.error({position:e.position,internalPosition:e.internalPosition,where:e.where,internalQuery:e.internalQuery});throw e;}
 await db.exec(fs.readFileSync(path.join(__dirname,'../supabase/migrations/010_portal_delivery_webhook.sql'),'utf8'));
 await db.exec(fs.readFileSync(path.join(__dirname,'../supabase/migrations/013_portal_claim_mode_isolation.sql'),'utf8'));
 const record=(overrides={})=>({kind:'waitlist',email:'owner@example.test',name:'',message:'',interest:'',submission_key:crypto.randomUUID(),consent:true,purpose:'portal_launch_offers',source:'homepage',source_url:'https://www.donventas.mx/',notice_version:'portal-preview-2026-10-27-v1',is_test:true,...overrides});
 const keys=(r,ip='ip')=>({ip:crypto.createHash('sha256').update(ip).digest('hex'),email:crypto.createHash('sha256').update(r.email).digest('hex'),payload:crypto.createHash('sha256').update(JSON.stringify(r)).digest('hex')});
 const rpc=async(name,params,cast)=>{const placeholders=params.map((_,i)=>'$'+(i+1)+(cast?.[i]?'::'+cast[i]:''));return(await db.query('select public.'+name+'('+placeholders.join(',')+') as result',params)).rows[0].result;};
 const receive=(r,ip)=>rpc('dv_portal_receive',[r,keys(r,ip)],['jsonb','jsonb']);
 const r=record();
 await t.test('receipt is durable; identical retry does not enqueue twice',async()=>{
  assert.deepEqual(await receive(r),{accepted:true,duplicate:false});assert.deepEqual(await receive(r),{accepted:true,duplicate:true});
  assert.equal((await db.query('select count(*)::integer n from dv_portal.outbox')).rows[0].n,1);
  await assert.rejects(receive({...r,interest:'brand'}),/key_reused/);
 });
 await t.test('confirmation requires explicit action and withdrawal cannot be reversed by old token',async()=>{
  const job=await rpc('dv_portal_claim',[true]);assert.equal(job.kind,'confirmation');
  assert.equal((await db.query('select state from dv_portal.subscriber')).rows[0].state,'pending');
  assert.equal(await rpc('dv_portal_prepare',[job.id,job.lease,'a'.repeat(64),'b'.repeat(64)]),true);
  assert.equal(await rpc('dv_portal_prepare',[job.id,job.lease,null,'b'.repeat(64)]),false);
  assert.equal(await rpc('dv_portal_prepare',[job.id,job.lease,'c'.repeat(64),'b'.repeat(64)]),false);
  assert.equal(await rpc('dv_portal_finish',[job.id,job.lease,'12345678-1234-4234-8234-123456789012',null]),true);
  assert.equal((await db.query('select state from dv_portal.outbox')).rows[0].state,'accepted');
  assert.equal(await rpc('dv_portal_delivery',['12345678-1234-4234-8234-123456789012','delivered']),true);
  assert.equal(await rpc('dv_portal_webhook_delivery',['12345678-1234-4234-8234-123456789012','delivered',true]),true);
  assert.equal(await rpc('dv_portal_webhook_delivery',['unknown','delivered',true]),false);
  assert.equal(await rpc('dv_portal_webhook_delivery',['12345678-1234-4234-8234-123456789012','delivered',null]),false);
  assert.deepEqual(await rpc('dv_portal_action',['confirm','a'.repeat(64),true]),{ok:true});
  assert.deepEqual(await rpc('dv_portal_action',['unsubscribe','b'.repeat(64),true]),{ok:true});
  assert.deepEqual(await rpc('dv_portal_action',['unsubscribe','b'.repeat(64),true]),{ok:true});
  assert.deepEqual(await rpc('dv_portal_action',['confirm','a'.repeat(64),true]),{ok:false});
 });
 await t.test('private contact does not create or change subscriber',async()=>{
  const c=record({kind:'contact',email:'help@example.test',name:'QA',message:'Prueba local de solicitud privada.',purpose:'help_request',consent:false});await receive(c,'contact');
  assert.equal((await db.query('select count(*)::integer n from dv_portal.subscriber')).rows[0].n,1);
  const job=await rpc('dv_portal_claim',[true]);assert.equal(job.kind,'contact');
  assert.equal(await rpc('dv_portal_finish',[job.id,crypto.randomUUID(),null,'provider']),false);
  assert.equal(await rpc('dv_portal_finish',[job.id,job.lease,null,'provider']),true);
 });
 await t.test('independent IP quota rolls back excess request and queue entry',async()=>{
  for(let i=0;i<5;i++)await receive(record({email:'quota'+i+'@example.test'}),'quota-ip');
  await assert.rejects(receive(record({email:'quota6@example.test'}),'quota-ip'),/rate_limited/);
  assert.equal((await db.query("select count(*)::integer n from dv_portal.request where email='quota6@example.test'")).rows[0].n,0);
 });
 await t.test('separate test/live identity, no access for browser roles',async()=>{
  await receive(record({is_test:false}),'live-ip');
  await db.exec("update dv_portal.outbox set provider_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',state='accepted' where not is_test");
  assert.equal(await rpc('dv_portal_webhook_delivery',['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','delivered',true]),false);
  assert.equal((await db.query("select state from dv_portal.outbox where not is_test")).rows[0].state,'accepted');
  assert.equal((await db.query("select count(*)::integer n from dv_portal.subscriber where email='owner@example.test'")).rows[0].n,2);
  for(const role of ['anon','authenticated']){
   await db.exec('set role '+role);
   await assert.rejects(db.query('select * from dv_portal.subscriber'),/permission denied/);
   await assert.rejects(db.query("select public.dv_portal_action('confirm',repeat('a',64),false)"),/permission denied/);
   await db.exec('reset role');
  }
 });
 await t.test('missing purpose or consent rejected in the database',async()=>{
  const missing=record();delete missing.purpose;await assert.rejects(receive(missing,'bad'),/invalid/);
  await assert.rejects(receive(record({consent:false}),'bad'),/invalid/);
 });
 await t.test('test claim cannot expire live jobs or an active fifth-attempt lease',async()=>{
  await db.exec("update dv_portal.outbox set attempts=5, state='sending',lease=gen_random_uuid(),lease_until=now()+interval '2 minutes',first_attempt_at=now() where not is_test");
  const before=(await db.query('select id,state,lease from dv_portal.outbox where not is_test')).rows;
  await rpc('dv_portal_claim',[true]);
  assert.deepEqual((await db.query('select id,state,lease from dv_portal.outbox where not is_test')).rows,before);
  await db.exec("update dv_portal.outbox set attempts=5,state='sending',lease=gen_random_uuid(),lease_until=now()+interval '2 minutes',first_attempt_at=now() where is_test and state in ('pending','retry')");
  await rpc('dv_portal_claim',[true]);
  assert.equal((await db.query("select count(*)::integer n from dv_portal.outbox where is_test and attempts=5 and state='delivery_unknown'")).rows[0].n,0);
  await db.exec("update dv_portal.outbox set lease_until=now()-interval '1 second' where is_test and attempts=5 and state='sending'");
  await rpc('dv_portal_claim',[true]);
  assert.ok((await db.query("select count(*)::integer n from dv_portal.outbox where is_test and state='delivery_unknown'")).rows[0].n>0);
 });
 await t.test('candidate dispatcher requires isolated secrets and ignores live queue',async()=>{
  await db.exec(`create schema vault; create table vault.decrypted_secrets(name text,decrypted_secret text);
   create schema net; create function net.http_post(url text, headers jsonb, body jsonb, timeout_milliseconds integer) returns bigint language sql as $$select 42::bigint$$;`);
  await db.exec(fs.readFileSync(path.join(__dirname,'../supabase/migrations/011_portal_scheduler_candidate.sql'),'utf8'));
  await db.exec("update dv_portal.outbox set state='cancelled' where is_test; update dv_portal.outbox set state='pending',next_at=now() where not is_test");
  assert.equal((await db.query('select dv_portal.dispatch_test_due() as id')).rows[0].id,null);
  await db.exec("update dv_portal.outbox set state='pending',next_at=now() where is_test and id=(select id from dv_portal.outbox where is_test limit 1)");
  assert.equal((await db.query('select dv_portal.dispatch_test_due() as id')).rows[0].id,null);
  await db.query('insert into vault.decrypted_secrets values ($1,$2),($3,$4)',['portal_worker_anon_jwt','test-gateway','portal_worker_test_key','k'.repeat(32)]);
  assert.equal(String((await db.query('select dv_portal.dispatch_test_due() as id')).rows[0].id),'42');
  for(const role of ['anon','authenticated','service_role'])assert.equal((await db.query("select has_function_privilege($1,'dv_portal.dispatch_test_due()','execute') as ok",[role])).rows[0].ok,false);
  await db.exec(fs.readFileSync(path.join(__dirname,'../supabase/migrations/012_portal_live_dispatch_candidate.sql'),'utf8'));
  assert.equal((await db.query('select dv_portal.dispatch_live_due() as id')).rows[0].id,null);
  await db.query('insert into vault.decrypted_secrets values ($1,$2),($3,$4)',['portal_live_anon_jwt','live-gateway','portal_live_worker_key','l'.repeat(32)]);
  assert.equal(String((await db.query('select dv_portal.dispatch_live_due() as id')).rows[0].id),'42');
  await db.exec("update dv_portal.outbox set state='cancelled' where not is_test");
  assert.equal((await db.query('select dv_portal.dispatch_live_due() as id')).rows[0].id,null);
  for(const role of ['anon','authenticated','service_role'])assert.equal((await db.query("select has_function_privilege($1,'dv_portal.dispatch_live_due()','execute') as ok",[role])).rows[0].ok,false);
 });
 await t.test('live claim cannot consume or expire test jobs',async()=>{
  await db.exec("update dv_portal.outbox set state='pending',next_at=now(),attempts=0 where is_test and id=(select id from dv_portal.outbox where is_test limit 1)");
  const before=(await db.query('select id,state,attempts from dv_portal.outbox where is_test order by id')).rows;
  assert.equal(await rpc('dv_portal_claim',[false]),null);
  assert.deepEqual((await db.query('select id,state,attempts from dv_portal.outbox where is_test order by id')).rows,before);
 });
});
