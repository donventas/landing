'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const fs = require('node:fs/promises'), os = require('node:os'), path = require('node:path'), { Readable } = require('node:stream');
const { createHandler, validate, DAY } = require('../lib/article-comments/service.cjs');
const { LocalStore } = require('../lib/article-comments/local-store.cjs');
const { envelope, dispatchOne, simulatedMailer, verifyEvent } = require('../lib/article-comments/delivery.cjs');
const { SupabaseReceiptStore } = require('../lib/article-comments/supabase-store.cjs');
const catalog = require('../lib/article-comments/catalog.cjs');
const analytics = require('../analytics.js');
const origin = 'http://127.0.0.1:8795', secret = 'a'.repeat(64), timestamp = 1800000000000;
const base = () => ({ article_id: 'manual-de-marca', message: 'Una pregunta de prueba, sin datos reales.', email: 'qa@example.test', name: '', newsletter: false, website: '', submission_key: crypto.randomUUID() });
function request(body, overrides = {}) { return { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body, socket: { remoteAddress: '127.0.0.1' }, ...overrides }; }
function response() { return { headers: {}, setHeader(k,v) { this.headers[k] = v; }, end(value) { this.body = JSON.parse(value); } }; }
function fixture(options = {}) {
  const store = options.store || new LocalStore();
  const handler = createHandler({ store, origin, secret, mode: 'simulation', now: () => timestamp, ...options });
  return { store, async call(body = base(), overrides = {}) { const r = response(); await handler(request(body, overrides), r); return r; } };
}
test('default deployed endpoint fails closed even with production-looking environment values', async () => {
  const h = require('../api/article-message.js'), r = response(); await h(request(base()), r); assert.equal(r.statusCode, 503);
  const get = response(); await h({ method: 'GET' }, get); assert.equal(get.body.enabled, false);
});
test('receipt stores canonical source, optional name and no lead; never sends through global fetch', async () => {
  const f = fixture(), old = global.fetch; global.fetch = () => { throw Error('network forbidden'); };
  try { const r = await f.call(); assert.equal(r.statusCode, 202); assert.equal(r.headers['Cache-Control'], 'no-store');
    const s = await f.store.snapshot(); assert.equal(s.messages.length, 1); assert.equal(s.outbox.length, 1); assert.equal(s.intents.length, 0);
    assert.equal(s.messages[0].article_url, catalog['manual-de-marca'].url); assert.equal(s.messages[0].classification, 'pending_classification');
    assert.doesNotMatch(JSON.stringify(r.body), /qa@|Una pregunta|submission_key/);
    assert.doesNotMatch(JSON.stringify(s.buckets), /127\.0\.0\.1|qa@/);
  } finally { global.fetch = old; }
});
test('newsletter is a separate pending intent, never an active subscription', async () => {
  const f = fixture(); const r = await f.call({ ...base(), newsletter: true }); const s = await f.store.snapshot();
  assert.equal(r.body.subscription, 'pending_confirmation'); assert.equal(s.intents[0].state, 'pending_confirmation');
  assert.match(s.intents[0].copy, /más visible/); assert.equal(s.intents[0].expires_at, timestamp + 30 * DAY);
});
test('rejects missing/foreign Origin and cross-site requests before persistence', async () => {
  for (const headers of [{}, { origin:'https://evil.example' }, { origin, 'sec-fetch-site':'cross-site' }]) {
    const f = fixture(); const r = await f.call(base(), { headers }); assert.equal(r.statusCode,403); assert.equal((await f.store.snapshot()).messages.length,0);
  }
});
test('server rejects invalid types, overlong fields, forged metadata, attachments and header injection', async () => {
  for (const bad of [{ message:'' },{ message:'x'.repeat(5001) },{ message:{} },{ name:'x'.repeat(101) },{ email:'qa@example.test\r\nBcc:evil@example.test' },{ article_id:'../secret' },{ article_url:'https://evil.example' },{ newsletter:'true' },{ attachments:[] },{ email:'x'.repeat(255)+'@a.co' }]) {
    const f=fixture(); const r=await f.call({...base(),...bad}); assert.equal(r.statusCode,422,JSON.stringify(bad)); assert.equal((await f.store.snapshot()).messages.length,0);
  }
});
test('honeypot consumes no message or subscription record', async () => {
  const f=fixture(); assert.equal((await f.call({...base(),website:'spam',newsletter:true})).statusCode,202); assert.equal((await f.store.snapshot()).intents.length,0);
});
test('actual bytes, content type, malformed JSON and method are checked', async () => {
  const f=fixture(); assert.equal((await f.call('x'.repeat(24001))).statusCode,413);
  assert.equal((await f.call('{')).statusCode,400);
  assert.equal((await f.call(base(),{headers:{origin,'content-type':'text/plain'}})).statusCode,415);
  assert.equal((await f.call(base(),{method:'PUT'})).statusCode,405);
  const h=createHandler({store:f.store,origin,secret,mode:'simulation'}), stream=Readable.from([Buffer.alloc(12000),Buffer.alloc(12001)]);
  stream.method='POST';stream.headers={origin,'content-type':'application/json'};stream.socket={remoteAddress:'127.0.0.1'};const r=response();await h(stream,r);assert.equal(r.statusCode,413);
});
test('concurrent retries have one receipt, one intent and one outbox entry; conflicting reuse is rejected', async () => {
  const f=fixture(), body={...base(),newsletter:true}; const results=await Promise.all(Array.from({length:12},()=>f.call(body)));
  assert.ok(results.every(r=>r.statusCode===202)); const s=await f.store.snapshot(); assert.equal(s.messages.length,1);assert.equal(s.intents.length,1);assert.equal(s.outbox.length,1);
  assert.equal((await f.call({...body,message:'Different message'})).statusCode,409);
});
test('separate IP quota survives rotating emails and multiple handler instances', async () => {
  const store=new LocalStore(), a=fixture({store}), b=fixture({store});
  for(let i=0;i<5;i++)assert.equal((await a.call({...base(),email:`qa${i}@example.test`})).statusCode,202);
  const r=await b.call({...base(),email:'another@example.test'});assert.equal(r.statusCode,429);assert.equal(r.headers['Retry-After'],'900');
});
test('separate email quota survives rotating network addresses', async () => {
  const f=fixture();for(let i=0;i<10;i++)assert.equal((await f.call(base(),{socket:{remoteAddress:'192.0.2.'+i}})).statusCode,202);
  assert.equal((await f.call(base(),{socket:{remoteAddress:'192.0.2.99'}})).statusCode,429);
});
test('local file receipts and quotas survive process adapter recreation', async () => {
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'dv-comments-test-')), file=path.join(dir,'simulation.json');
  try {const body=base();await fixture({store:new LocalStore(file)}).call(body);const second=new LocalStore(file);await fixture({store:second}).call(body);assert.equal((await second.snapshot()).messages.length,1);}
  finally {await fs.rm(dir,{recursive:true,force:true});}
});
test('mail envelope uses verified-domain candidate and visitor Reply-To; escapes markup', () => {
  const msg={...validate({...base(),message:'<img src=x onerror=alert(1)>',name:'<b>QA</b>'}),article_title:catalog['manual-de-marca'].title,article_url:catalog['manual-de-marca'].url};
  const e=envelope(msg,{to:'qa@example.test',from:'Don Ventas <arturo.villagomez@donventas.mx>'});
  assert.equal(e.reply_to,'qa@example.test');assert.doesNotMatch(e.html,/<img|<b>/);assert.match(e.html,/&lt;img/);assert.equal(e.to[0],'qa@example.test');
});
test('simulated mail is identified as simulated, no actual delivery claim', async () => {
  const f=fixture();await f.call();await dispatchOne(f.store,simulatedMailer(),{to:'qa@example.test',from:'Don Ventas <arturo.villagomez@donventas.mx>'},timestamp);
  assert.equal((await f.store.snapshot()).outbox[0].state,'simulated');assert.equal(await dispatchOne(f.store,simulatedMailer(),{},timestamp),false);
});
test('mail retries retain key; uncertain outcomes after 24 hours require reconciliation', async () => {
  const f=fixture();await f.call();let keys=[];const bad={async send(_e,k){keys.push(k);throw Error('sensitive provider response');}};
  const config={to:'qa@example.test',from:'Don Ventas <arturo.villagomez@donventas.mx>'};
  await dispatchOne(f.store,bad,config,timestamp);await dispatchOne(f.store,bad,config,timestamp+120000);
  assert.equal(keys.length,2);assert.equal(keys[0],keys[1]);assert.doesNotMatch(JSON.stringify(await f.store.snapshot()),/sensitive provider/);
  await dispatchOne(f.store,bad,config,timestamp+DAY);assert.equal(keys.length,2);assert.equal((await f.store.snapshot()).outbox[0].state,'delivery_unknown');
});
test('signed events reject tampering and replay age; storage deduplicates events and prevents terminal regression', async () => {
  const signing='whsec_'+Buffer.from('test-only-signing-key').toString('base64'), id='evt_test', seconds=Math.floor(timestamp/1000);
  const raw=JSON.stringify({type:'email.delivered',created_at:new Date(timestamp).toISOString(),data:{email_id:'provider_test'}});
  const sig=crypto.createHmac('sha256',Buffer.from(signing.slice(6),'base64')).update(id+'.'+seconds+'.'+raw).digest('base64');
  const headers={'svix-id':id,'svix-timestamp':String(seconds),'svix-signature':'v1,'+sig};const event=verifyEvent(raw,headers,signing,timestamp);
  assert.throws(()=>verifyEvent(raw+' ',headers,signing,timestamp));assert.throws(()=>verifyEvent(raw,headers,signing,timestamp+301000));
  const f=fixture();await f.call();const job=await f.store.claim(timestamp);await f.store.finish(job.id,job.lease,{state:'accepted',provider_id:'provider_test'});
  assert.equal(await f.store.event(event),true);assert.equal(await f.store.event(event),false);
  await f.store.event({...event,id:'bounce',state:'bounced',at:timestamp+2});await f.store.event({...event,id:'late',state:'delivered',at:timestamp+3});assert.equal((await f.store.snapshot()).outbox[0].state,'bounced');
});
test('retention purges expired requests and their dependent records; intent expires sooner', async () => {
  const f=fixture();await f.call({...base(),newsletter:true});await f.store.purge(timestamp+31*DAY);let s=await f.store.snapshot();assert.equal(s.intents.length,0);assert.equal(s.messages.length,1);assert.deepEqual(s.buckets,{});
  await f.store.purge(timestamp+181*DAY);s=await f.store.snapshot();assert.equal(s.messages.length,0);assert.equal(s.outbox.length,0);
});
test('analytics accepts only fixed outcome codes, discards every personal field', () => {
  for(const name of ['article_message_opened','article_message_sent','article_message_failed']) {
    const v=analytics.cleanEvent(name,{email:'qa@example.test',name:'Private',message:'Secret',article_url:'https://evil.example',reason:'contains private text',id:crypto.randomUUID()});assert.doesNotMatch(JSON.stringify(v),/qa@|Private|Secret|evil|contains/);
  }
});
test('all seven articles mount the shared channel without changing canonicals', async () => {
  for(const item of Object.values(catalog)) {const html=await fs.readFile(path.join(__dirname,'../blog',item.id+'.html'),'utf8');assert.equal((html.match(/data-article-comments=/g)||[]).length,1);assert.ok(html.includes('data-article-comments="'+item.id+'"'));assert.ok(html.includes('href="'+item.url+'"'));assert.ok(html.includes('/blog/article-comments.js'));}
});
test('Supabase adapter has no implicit project/key, sanitizes storage errors and uses an atomic RPC', async () => {
  assert.throws(()=>new SupabaseReceiptStore({url:'http://example.test',key:'test',fetchImpl:()=>{}}));let captured;
  const store=new SupabaseReceiptStore({url:'https://isolated.example.test',key:'test-only',fetchImpl:async(url,options)=>{captured={url,options};return {ok:true,json:async()=>({duplicate:false})};}});
  await store.receive({id:'test'},{ip:'hash'},timestamp,{});assert.match(captured.url,/rpc\/dv_article_receive$/);assert.equal(captured.options.redirect,'error');
});
test('existing privacy notice is readable in strict-CSP QA without executing a bundled unpacker', async () => {
  const {unpackLegal}=require('../scripts/private-comments-preview.cjs');
  const raw=await fs.readFile(path.join(__dirname,'../15_LEGAL/Aviso de Privacidad.html'),'utf8');
  const html=unpackLegal(raw);assert.match(html,/Responsable de tus datos/);assert.doesNotMatch(html,/Unpacking\.\.\./);
});
