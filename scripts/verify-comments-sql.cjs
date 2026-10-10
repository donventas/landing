'use strict';
// Isolated PostgreSQL/WASM validation, not a connection to Supabase. Install
// @electric-sql/pglite under .qa-comments/sql-runtime first; no production keys.
const { PGlite } = require('../.qa-comments/sql-runtime/node_modules/@electric-sql/pglite');
const fs = require('node:fs/promises'), assert = require('node:assert/strict'), crypto = require('node:crypto');
(async () => {
  const db = new PGlite();
  try {
    await db.exec('create role anon; create role authenticated; create role service_role;');
    for (const f of ['003_private_article_messages.sql','004_article_delivery_queue.sql','005_article_subscriptions.sql']) await db.exec(await fs.readFile(__dirname+'/../supabase/migrations/'+f,'utf8'));
    const id=crypto.randomUUID(), key=crypto.randomUUID(), provider=crypto.randomUUID();
    const record={id,submission_key:key,payload_hash:'a'.repeat(64),article_id:'manual-de-marca',article_title:'Prueba ficticia',article_url:'https://www.donventas.mx/blog/manual-de-marca.html',message:'Prueba aislada',email:'qa@example.test',name:'',notice_version:'test',newsletter:false};
    const receive=()=>db.query('select public.dv_article_receive($1,$2,$3) as result',[JSON.stringify(record),JSON.stringify({ip:'b'.repeat(64),email:'c'.repeat(64)}),'{}']);
    assert.equal((await receive()).rows[0].result.duplicate,false);
    assert.equal((await receive()).rows[0].result.duplicate,true);
    await db.exec('set role anon;');
    await assert.rejects(db.query('select public.dv_article_claim()'), /permission denied/);
    await assert.rejects(db.query('select * from dv_comments.message'), /permission denied/);
    await db.exec('reset role; set role service_role;');
    const job=(await db.query('select public.dv_article_claim() as job')).rows[0].job;
    assert.equal(job.id,id);
    assert.equal((await db.query('select public.dv_article_claim() as job')).rows[0].job,null);
    const event={id:'test-event',provider_id:provider,state:'delivered',at:Date.now()};
    assert.equal((await db.query('select public.dv_article_event($1) as ok',[JSON.stringify(event)])).rows[0].ok,true);
    assert.equal((await db.query('select public.dv_article_finish($1,$2,$3) as ok',[id,crypto.randomUUID(),JSON.stringify({state:'accepted',provider_id:provider})])).rows[0].ok,false);
    assert.equal((await db.query('select public.dv_article_finish($1,$2,$3) as ok',[id,job.lease,JSON.stringify({state:'accepted',provider_id:provider})])).rows[0].ok,true);
    await db.exec('reset role;');
    assert.equal((await db.query('select state from dv_comments.outbox')).rows[0].state,'delivered');
    await db.query('select public.dv_article_event($1)',[JSON.stringify({...event,id:'late-delay',state:'delayed',at:event.at+1})]);
    assert.equal((await db.query('select state from dv_comments.outbox')).rows[0].state,'delivered');
    const subscriptionRecord={...record,id:crypto.randomUUID(),submission_key:crypto.randomUUID(),newsletter:true,is_test:true};
    await db.query('select public.dv_article_receive($1,$2,$3)',[JSON.stringify(subscriptionRecord),JSON.stringify({ip:'d'.repeat(64),email:'c'.repeat(64)}),JSON.stringify({copy:'Optional',version:'test'})]);
    const n=(await db.query('select public.dv_newsletter_claim(true) as job')).rows[0].job;
    assert.equal(n.email,'qa@example.test');assert.equal(n.is_test,true);
    const tokenA='e'.repeat(64), tokenB='f'.repeat(64);
    assert.equal((await db.query('select public.dv_newsletter_prepare($1,$2,$3,$4) as ok',[n.id,n.lease,tokenA,tokenB])).rows[0].ok,true);
    assert.equal((await db.query('select state from dv_comments.subscriber')).rows[0].state,'pending');
    assert.equal((await db.query("select public.dv_newsletter_action('confirm',$1) as ok",['0'.repeat(64)])).rows[0].ok,false);
    for(let i=0;i<2;i++)assert.equal((await db.query("select public.dv_newsletter_action('confirm',$1) as ok",[tokenA])).rows[0].ok,true);
    assert.equal((await db.query('select state from dv_comments.subscriber')).rows[0].state,'active');
    assert.equal((await db.query("select public.dv_newsletter_action('unsubscribe',$1) as ok",[tokenB])).rows[0].ok,true);
    assert.equal((await db.query("select public.dv_newsletter_action('confirm',$1) as ok",[tokenA])).rows[0].ok,false);
    const np=crypto.randomUUID();
    await db.query('select public.dv_article_event($1)',[JSON.stringify({id:'newsletter-bounce',provider_id:np,state:'bounced',at:Date.now()})]);
    await db.query('select public.dv_newsletter_finish($1,$2,$3)',[n.id,n.lease,JSON.stringify({state:'accepted',provider_id:np})]);
    assert.equal((await db.query('select state from dv_comments.subscriber')).rows[0].state,'suppressed');
    await db.exec('set role anon;');
    await assert.rejects(db.query("select public.dv_newsletter_action('confirm',$1)",[tokenA]),/permission denied/);
    await assert.rejects(db.query('select * from dv_comments.subscriber'),/permission denied/);
    await db.exec('reset role;');
    console.log('SQL verified: private roles, dedupe, leases, early delivery events, double opt-in, withdrawal, no reactivation and bounce suppression. Local fixtures only.');
  } finally { await db.close(); }
})().catch(error => { console.error('SQL validation failed (local fixtures only):', error.message); process.exitCode=1; });
