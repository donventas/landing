const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const form=require('../diagnostico-v2.js'),analytics=require('../analytics.js');
test('moments describe situations, not company sizes or automatic service bundles',()=>{
 const qs=form.visibleQuestions('evolucion',{});
 assert.deepEqual(qs.slice(0,3).map(q=>q.id),['moment','serviceNeeded','workingMode']);
 assert.equal(qs[0].options.length,7);assert.equal(qs[1].options.length,5);
 assert.equal(qs.at(-1).id,'contact');assert.equal(qs.find(q=>q.id==='budgetNote').required,false);
 for(const moment of qs[0].options)for(const service of qs[1].options)for(const mode of qs[2].options){
   const result=form.recommendation('evolucion',{moment:moment.id,serviceNeeded:service.id,workingMode:mode.id});
   assert.equal(result.key,service.id);assert.equal(result.band,'A confirmar según alcance');
   assert.doesNotMatch(result.band,/mil|mes|MXN/);
   if(mode.id==='acompanamiento')assert.match(result.reasons.join(' '),/responsable, frecuencia de revisión y capacidad/);
 }
});
test('founder and new diagnostic steps are measurable without answers or arbitrary values',()=>{
 assert.equal(analytics.page('/arturo-villagomez.html'),'fundador');
 assert.deepEqual(analytics.cleanEvent('diagnostic_step_completed',{route:'evolucion',step:'moment',answer:'secret',email:'secret'}),{route:'evolucion',step:'moment'});
 assert.equal(analytics.cleanEvent('diagnostic_step_completed',{route:'evolucion',step:'secret'}),null);
});
test('four services, six situations and continuity use existing canonical routes',()=>{
 const home=read('index.html');
 for(const id of ['estrategia','identidad','contenido-servicio','web','acompanamiento'])assert.match(home,new RegExp('id="'+id+'"'));
 assert.match(home,/No son etapas obligatorias/);assert.match(home,/No es atención ilimitada/);
 const data=JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
 assert.equal(data.find(x=>x['@type']==='Service').hasOfferCatalog.itemListElement.length,4);
 assert.equal((read('sitemap.xml').match(/<loc>/g)||[]).length,17);
 assert.ok(read('sitemap.xml').includes('https://www.donventas.mx/blog/como-aparecer-en-google.html'));
 assert.ok(read('sitemap.xml').includes('https://www.donventas.mx/blog/diseno-editorial.html'));
 assert.ok(read('sitemap.xml').includes('https://www.donventas.mx/blog/logotipos-mitos.html'));
 assert.match(read('sitemap.xml'), /https:\/\/www.donventas.mx\/blog\/manual-de-marca.html/);
 const legal=JSON.parse(read('15_LEGAL/Terminos y Condiciones.html').match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/)[1]);
 assert.match(legal,/no se incluye como una prestación disponible/);
 assert.doesNotMatch(legal,/así como acceso a un portal donde el cliente da seguimiento/);
});
test('entry context is bounded and an amended saved choice survives reload',()=>{
 const values=new Map(),location={search:'?servicio=web&momento=conectar'},el={getAttribute:()=>null};
 const storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
 const sandbox={module:{exports:{}},location,localStorage:storage,URLSearchParams,URL,Date};
 vm.runInNewContext(read('diagnostico-v2.js'),sandbox);
 const D=sandbox.module.exports.Diagnostic;D.prototype.render=function(){};D.prototype.bindEntryLinks=function(){};
 let d=new D(el);assert.equal(d.state.serviceNeeded,'web');d.state.serviceNeeded='estrategia';d.index=4;d.persist();
 d=new D(el);assert.equal(d.state.serviceNeeded,'estrategia');assert.equal(d.index,4);
 location.search='?servicio=identidad';d=new D(el);assert.equal(d.state.serviceNeeded,'identidad');assert.equal(d.index,0);
 values.clear();location.search='?servicio=private@example.com&momento=secret';d=new D(el);assert.equal(d.state.serviceNeeded,undefined);assert.equal(d.state.moment,undefined);
});
test('v3 contact/context can be recovered without inheriting consent or completed steps',()=>{
 const values=new Map([['dv-diagnostic-v3-contenido',JSON.stringify({state:{name:'QA',email:'qa@example.test',businessAudience:'Test context',consent:true},index:11})]]);
 const sandbox={module:{exports:{}},location:{search:''},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},URLSearchParams,URL,Date};
 vm.runInNewContext(read('diagnostico-v2.js'),sandbox);const D=sandbox.module.exports.Diagnostic;
 D.prototype.render=function(){};D.prototype.bindEntryLinks=function(){};
 const d=new D({getAttribute:()=>null});assert.equal(d.state.name,'QA');assert.equal(d.state.currentNeed,'Test context');assert.equal(d.state.consent,undefined);assert.equal(d.index,0);assert.ok(values.has('dv-diagnostic-v3-contenido'));
});
