const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const form=require('../diagnostico-v2.js');
test('new QA fixtures stay local-only and out of deployments',()=>{
 const server=read('scripts/editorial-qa-server.cjs');
 assert.match(server,/listen\(port,'127\.0\.0\.1'/);
 assert.match(server,/X-Robots-Tag','noindex'/);
 for(const file of ['scripts/editorial-qa-server.cjs','scripts/qa-editorial-strategy.cjs'])assert.ok(read('.vercelignore').includes(file));
});
function draft(state,search='',index=7){
 const values=new Map(state?[['dv-diagnostic-v4-evolucion',JSON.stringify({state,index})]]:[]);
 const sandbox={module:{exports:{}},location:{search},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},URLSearchParams,URL,Date};
 vm.runInNewContext(read('diagnostico-v2.js'),sandbox);const D=sandbox.module.exports.Diagnostic;
 D.prototype.render=function(){};D.prototype.bindEntryLinks=function(){};
 return new D({getAttribute:()=>null});
}
test('autonomy applies to both working modes without adding steps or collecting more data',()=>{
 const qs=form.visibleQuestions('evolucion',{});assert.equal(qs.length,8);
 assert.deepEqual(qs[2].options.map(o=>o.id),['proyecto','acompanamiento','orientacion']);
 assert.match(qs[2].hint,/En ambos casos/);assert.match(qs[4].title,/quién usaría/);
});
test('legacy autonomy drafts return to the choice; new legacy URLs do not choose a subscription',()=>{
 const d=draft({workingMode:'autonomia',currentNeed:'QA context',existingAssets:'QA assets'});
 assert.equal(d.index,2);assert.equal(d.state.workingMode,'orientacion');assert.equal(d.state.currentNeed,'QA context');assert.equal(d.state.existingAssets,'QA assets');
 assert.equal(draft(null,'?modalidad=autonomia').state.workingMode,'orientacion');
});
test('an in-flight legacy submission retains its choice and key even with a new entry URL',()=>{
 const d=draft({workingMode:'autonomia',serviceNeeded:'web',submissionKey:'qa-existing-key'},'?servicio=identidad&modalidad=autonomia');
 assert.equal(d.state.submissionKey,'qa-existing-key');assert.equal(d.state.serviceNeeded,'web');assert.equal(d.state.workingMode,'autonomia');assert.equal(d.index,7);
 const q=form.visibleQuestions('evolucion',d.state)[2];assert.equal(d.hasAnswer(q),true);
 assert.match(read('diagnostico-v2.js'),/id:'autonomia',label:'Preparar recursos para mi equipo u otros proveedores'/);
});
test('native mobile menus retain service, proof, reading and diagnostic paths',()=>{
 assert.match(read('index.html'),/class="hero-lede">[^\n]*entender, encontrar y elegir/);
 for(const file of ['index.html','branding.html']){
  const menu=read(file).match(/<details class="mobile-explore">([\s\S]*?)<\/details>/)[1];
  for(const label of ['Servicios','Cómo trabajamos','Ideas','Solicita tu diagnóstico'])assert.ok(menu.includes(label));
 }
 assert.match(read('index.html'),/href="#trabajo-web"/);assert.match(read('index.html'),/id="trabajo-web"/);
 assert.match(read('branding.html'),/href="\/blog\/glosario.html#sistema-de-marca"/);
 assert.match(read('blog/glosario.html'),/id="sistema-de-marca"/);
});
