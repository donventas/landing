'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs');
const {createHandler}=require('../lib/article-comments/service.cjs');
const {LocalStore}=require('../lib/article-comments/local-store.cjs');
const catalog=require('../blog/article-gifts.json');
test('release copy has a final receipt and QA labels remain restricted to non-live environments',()=>{
 const source=fs.readFileSync(__dirname+'/../blog/article-gifts.js','utf8');
 assert.ok(source.includes("delivery.querySelector('h3').textContent='Gracias por compartir tu experiencia. Tu PDF está listo.'"));
 assert.ok(!source.includes('Prueba completada'));
 assert.match(source,/availability\.mode === 'simulation' \? 'Prueba local/);
 assert.match(source,/availability\.mode === 'test' \? 'Prueba privada[^\n]+: 'Respuestas privadas · no se publican en el blog\.'/);
 const forbidden=/prueba local|prueba privada|prueba completada|datos ficticios|versión piloto|modo de prueba|simulación|experimental/i;
 for(const [slug,gift] of Object.entries(catalog.articles)){
  for(const key of ['title','offerTitle','cta','intro','description','responseInvitation'])assert.doesNotMatch(gift[key]||'',forbidden,slug+': '+key);
  const html=fs.readFileSync(__dirname+'/../blog/'+slug+'.html','utf8');
  const visibleCopy=html.replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<[^>]+>/g,' ');
  assert.doesNotMatch(visibleCopy,forbidden,slug);
 }
});
test('each article explains the community value with its own invitation, without changing the three research questions',()=>{
 const invitations=Object.values(catalog.articles).map(gift=>gift.responseInvitation);
 assert.equal(new Set(invitations).size,7);
 for(const gift of Object.values(catalog.articles)){
  assert.ok(gift.responseInvitation.length>60 && gift.responseInvitation.length<300);
  assert.match(gift.responseInvitation,/artículos y recursos/);
  assert.equal(gift.questions.length,3);
 }
});
test('all seven articles use shared discovery with contextual copy and verified PDF thumbnails',()=>{
 for(const [slug,gift] of Object.entries(catalog.articles)){
  const html=fs.readFileSync(require('node:path').join(__dirname,'../blog',slug+'.html'),'utf8');
  assert.match(html,/data-gift-discovery="(?:pilot|steps)"/);
  assert.ok(html.includes('/blog/article-gift-pilot.js'));
  assert.ok(gift.preview && gift.intro && gift.cta);
  if(gift.preview){
   const pdf=fs.readFileSync(require('node:path').join(__dirname,'..',gift.file));
   assert.equal(crypto.createHash('sha256').update(pdf).digest('hex'),gift.previewSourceSha256);
   const preview=fs.readFileSync(require('node:path').join(__dirname,'..',gift.preview));
   assert.equal(preview.subarray(8,12).toString(),'WEBP');assert.ok(preview.length<60000);
  }
 }
});
const origin='http://127.0.0.1:8795';
test('optional survey comment is private, bounded, retriable and never a subscription',async()=>{
 const f=fixture(),body=base();body.survey.comment='  ¿Puedo aplicar esto a una propuesta?  ';
 const r=await f.call(body);assert.equal(r.statusCode,202);assert.ok(r.body.gift);
 await f.call(body);const s=await f.store.snapshot();assert.equal(s.messages.length,1);assert.equal(s.intents.length,0);
 assert.match(s.messages[0].message,/Comentario opcional del lector:\n¿Puedo aplicar esto a una propuesta\?/);
 assert.doesNotMatch(JSON.stringify(r.body),/propuesta/);
});
test('optional survey comment rejects invalid data; maximum content fits existing storage limit',async()=>{
 for(const comment of [null,42,{},'x'.repeat(901),'a\u0000b']){
  const f=fixture(),body=base();body.survey.comment=comment;assert.equal((await f.call(body)).statusCode,422);assert.equal((await f.store.snapshot()).messages.length,0);
 }
 for(const article_id of Object.keys(catalog.articles)){
  const f=fixture(),body=base();body.article_id=article_id;body.survey.answers=['x'.repeat(900),'y'.repeat(900),'z'.repeat(900)];body.survey.comment='c'.repeat(900);
  assert.equal((await f.call(body)).statusCode,202);assert.ok((await f.store.snapshot()).messages[0].message.length<=5000);
 }
});
const base=()=>({article_id:'contenido-que-atrae-clientes',email:'qa@example.test',name:'',newsletter:false,website:'',submission_key:crypto.randomUUID(),survey:{version:catalog.version,answers:['Quería explicar una medida.','No lo medí.','No necesité ayuda.']}});
function fixture(options={}){const store=options.store||new LocalStore();const h=createHandler({store,origin,secret:'a'.repeat(64),mode:'simulation',giftArticles:Object.keys(catalog.articles),...options});return {store,call:async(body=base(),method='POST')=>{const r={setHeader(){},end(v){this.body=JSON.parse(v);}};await h({method,body,headers:{origin,'content-type':'application/json'},socket:{remoteAddress:'127.0.0.1'}},r);return r;}};}
test('gift is returned only after receipt resolves, with no opt-in or email delivery dependency',async()=>{
 let release,record;const f=fixture({store:{receive(r){record=r;return new Promise(resolve=>release=resolve);}}});let finished=false;const pending=f.call().then(r=>{finished=true;return r;});await new Promise(r=>setImmediate(r));assert.equal(finished,false);assert.equal(record.newsletter,false);release({duplicate:false});const r=await pending;assert.equal(r.statusCode,202);assert.equal(r.body.gift.url,catalog.articles['contenido-que-atrae-clientes'].file);assert.equal(r.body.subscription,'not_requested');assert.match(record.message,/Encuesta con regalo/);assert.equal(record.notice_version,catalog.version);
});
test('storage failure, invalid answers, stale version and disabled article never issue gift',async()=>{
 const f=fixture();for(const survey of [{version:catalog.version,answers:['','a','b']},{version:'old',answers:['a','b','c']},{version:catalog.version,answers:['a','b']},{version:catalog.version,answers:['a'.repeat(901),'b','c']},{version:catalog.version,answers:['a','b','c'],file:'evil'}]){const r=await f.call({...base(),survey});assert.equal(r.statusCode,422);assert.equal(r.body.gift,undefined);}
 const off=await fixture({giftArticles:[]}).call();assert.equal(off.statusCode,503);assert.equal(off.body.gift,undefined);
 const failed=await fixture({store:{receive:async()=>{throw Error('private');}}}).call();assert.equal(failed.statusCode,503);assert.equal(failed.body.gift,undefined);
});
test('retries restore gift without duplicate receipt; comments and honeypots do not unlock it',async()=>{
 const f=fixture(),body=base();await f.call(body);const retry=await f.call(body);assert.ok(retry.body.gift);assert.equal((await f.store.snapshot()).messages.length,1);
 assert.equal((await f.call({...base(),website:'bot'})).body.gift,undefined);
 const comment=base();delete comment.survey;comment.message='Un comentario';assert.equal((await f.call(comment)).body.gift,undefined);
});
test('same email gets the gift for each article; server owns URLs and keeps raw answers private',async()=>{
 const f=fixture({now:(()=>{let t=1800000000000;return()=>t+=900001;})()});
 for(const [article_id,gift] of Object.entries(catalog.articles)){const r=await f.call({...base(),article_id});assert.equal(r.statusCode,202);assert.equal(r.body.gift.id,gift.id);assert.equal(r.body.gift.url,gift.file);assert.doesNotMatch(JSON.stringify(r.body),/qa@|Quería/);}
 const s=await f.store.snapshot();assert.equal(s.messages.length,7);assert.equal(s.intents.length,0);
});
test('historical approved pilot remains unchanged alongside the revised resource',()=>{
 const bytes=fs.readFileSync(__dirname+'/../assets/gifts/antes-de-publicar-v2.pdf');assert.equal(bytes.subarray(0,5).toString(),'%PDF-');assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'b2be4eecb2b1649ad04cda3e8d647851cc7a96d86abfca977befd3dbd7ee2380');
});
test('current gifts match the approved checklist/cheatsheet mapping and preserve recovery paths',()=>{
 const pieces=require('../scripts/gifts/quick-reference.json');assert.equal(pieces.length,7);
 assert.equal(pieces.filter(p=>p.type==='checklist').length,4);
 assert.equal(pieces.filter(p=>p.type==='cheatsheet').length,3);
 for(const p of pieces){const gift=catalog.articles[p.article];assert.equal(gift.file,'/assets/gifts/'+p.id+'-'+p.revision+'.pdf');assert.equal(p.items.length,p.type==='checklist'?5:3);assert.ok(gift.previousFiles.length);assert.ok(!gift.previousFiles.includes(gift.file));for(const file of gift.previousFiles)assert.ok(fs.existsSync(__dirname+'/..'+file));}
});
test('optional newsletter records exactly the invitation displayed, still unlocks gift before confirmation',async()=>{
 const {GIFT_OPT_IN}=require('../lib/article-comments/service.cjs');assert.equal(GIFT_OPT_IN,[catalog.newsletter.label,catalog.newsletter.promise,catalog.newsletter.details,catalog.newsletter.confirmation].join(' '));
 const f=fixture();const r=await f.call({...base(),newsletter:true});assert.ok(r.body.gift);assert.equal(r.body.subscription,'pending_confirmation');const s=await f.store.snapshot();assert.equal(s.intents[0].copy,GIFT_OPT_IN);assert.equal(s.intents[0].version,catalog.newsletter.version);assert.equal(s.intents[0].state,'pending_confirmation');
});
test('independent comments keep their own unchanged consent copy',async()=>{
 const {OPT_IN}=require('../lib/article-comments/service.cjs');const body={...base(),newsletter:true,message:'Comentario de prueba'};delete body.survey;
 const f=fixture();await f.call(body);const s=await f.store.snapshot();assert.equal(s.intents[0].copy,OPT_IN);assert.equal(s.intents[0].version,'newsletter-2026-10-v1');
});
test('stale gift survey has an actionable code and records no new consent',async()=>{
 const f=fixture();const body={...base(),newsletter:true};body.survey.version='article-gifts-2026-10-v1';
 const r=await f.call(body);assert.equal(r.statusCode,422);assert.equal(r.body.code,'survey_updated');
 const s=await f.store.snapshot();assert.equal(s.messages.length,0);assert.equal(s.intents.length,0);
});
test('all seven article bindings point to real PDFs and independent research UI',()=>{
 for(const [id,gift] of Object.entries(catalog.articles)){const html=fs.readFileSync(__dirname+'/../blog/'+id+'.html','utf8');assert.ok(html.includes('/blog/article-gifts.js'));assert.equal(fs.readFileSync(__dirname+'/..'+gift.file).subarray(0,5).toString(),'%PDF-');assert.equal(gift.questions.length,3);}
});
