'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const {pages,decode,integrate}=require('../scripts/appearance-pages.cjs');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const base='c487c25184ec05feed526e36572d274acb9d4eb0';
for(const [file,family] of Object.entries(pages))test('appearance: preserved source and one control — '+file,()=>{
 const original=cp.execFileSync('git',['show',base+':'+file],{cwd:root,encoding:'utf8',maxBuffer:12e6});
 assert.equal(read(file).replace(/\r/g,''),integrate(original,family).replace(/\r/g,''));
 const html=decode(read(file));assert.equal((html.match(/id="site-appearance"/g)||[]).length,1);
 assert.match(html,new RegExp('data-dv-page="'+family+'"'));assert.match(html,/\/appearance-families.css/);
});
test('appearance: source coverage, bounded additive assets and preview-only scripts excluded',()=>{
 assert.equal(Object.keys(pages).length,21);
 for(const file of ['appearance.js','diagnostic-focus.js'])assert.ok(Buffer.byteLength(read(file))<4000);
 assert.ok(Buffer.byteLength(read('appearance.css'))+Buffer.byteLength(read('appearance-families.css'))<45000);
 for(const file of ['appearance.css','appearance-families.css'])assert.doesNotMatch(read(file),/filter:\s*(?:invert|hue-rotate)|url\(https?:/);
 assert.match(read('.vercelignore'),/scripts\/appearance-review-server.cjs/);
 assert.ok(!pages['alianzas/creactiva/index.html']);
});
function themeHarness(readyState='loading',blocked=false){
 const events={},listeners={},root={dataset:{}},select={dataset:{},disabled:true,value:'',addEventListener:(n,fn)=>listeners[n]=fn};
 let saved=null;
 const context={document:{documentElement:root,readyState,querySelectorAll:()=>[select],addEventListener:(n,fn)=>events[n]=fn},URL,URLSearchParams,location:{search:'?appearance=light',href:'https://review.example/blog/#seccion'},localStorage:{getItem(){if(blocked)throw Error();return null;},setItem(k,v){if(blocked)throw Error();saved=[k,v];}},matchMedia:()=>({matches:true,addEventListener(){}}),addEventListener(){},history:{replaceState(){}}};
 vm.runInNewContext(read('appearance.js'),context);
 return {events,listeners,root,select,saved:()=>saved};
}
test('appearance: normal and late bundled legal initialization installs working selector',()=>{
 for(const ready of ['loading','complete']){const h=themeHarness(ready);if(ready==='loading')h.events.DOMContentLoaded();assert.equal(h.root.dataset.dvAppearance,'light');assert.equal(h.select.disabled,false);h.select.value='dark';h.listeners.change();assert.equal(h.root.dataset.dvAppearance,'dark');assert.deepEqual(h.saved(),['dv.appearance.v1','dark']);}
});
test('appearance: blocked storage never blocks controls',()=>{const h=themeHarness('complete',true);h.select.value='dark';assert.doesNotThrow(()=>h.listeners.change());assert.equal(h.root.dataset.dvAppearance,'dark');});
test('preview: no body or transport in any review response; production is untouched',()=>{
 const {reviewResponse}=require('../lib/preview-safety.cjs');
 for(const endpoint of ['lead','article-message','article-subscription'])for(const method of ['GET','POST']){
  const req={method,get body(){throw Error('must not read payload');}},res={setHeader(){},end(v){this.body=JSON.parse(v);}};
  assert.equal(reviewResponse(req,res,endpoint,{VERCEL_ENV:'preview'}),true);
  assert.equal(res.statusCode,endpoint==='article-message'&&method==='GET'?200:503);assert.equal(res.body.preview,true);
  if(endpoint==='article-message'&&method==='GET')assert.deepEqual(res.body.gift_articles,Object.keys(require('../blog/article-gifts.json').articles));
 }
 assert.equal(reviewResponse({}, {setHeader(){throw Error();}},'lead',{VERCEL_ENV:'production'}),false);
 for(const name of ['lead','article-message','article-subscription'])assert.match(read('api/'+name+'.js'),/reviewResponse/);
});
