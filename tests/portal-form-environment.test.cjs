'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../assets/portal-launch/forms.js'),'utf8');
async function render(config){
 const notices=[{hidden:false,textContent:''},{hidden:false,textContent:''}];
 const document={getElementById:()=>null,querySelector:()=>null,querySelectorAll(s){return s==='[data-form-environment]'?notices:[];}};
 const fetch=()=>config instanceof Error?Promise.reject(config):Promise.resolve({json:async()=>config});
 vm.runInNewContext(source,{document,window:{addEventListener(){}},location:{hash:''},fetch,crypto:{randomUUID:()=>''}});
 await new Promise(resolve=>setImmediate(resolve));return notices;
}
test('form notices distinguish live, simulation and unavailable endpoints',async()=>{
 for(const node of await render({enabled:true,mode:'live'}))assert.equal(node.hidden,true);
 for(const node of await render({enabled:true,mode:'simulation'})){assert.equal(node.hidden,false);assert.match(node.textContent,/simulan/);}
 for(const node of await render({enabled:false,mode:'unavailable'})){assert.equal(node.hidden,false);assert.match(node.textContent,/no está disponible/);}
 for(const node of await render(new Error('network'))){assert.equal(node.hidden,false);assert.match(node.textContent,/no está disponible/);}
});
test('direct service inquiry opens from the hero and loads versioned assets',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 assert.match(html,/href="#consulta-encargo">Cuéntanos qué necesitas/);
 assert.match(html,/<details class="launch-help-form" id="consulta-encargo">/);
 const service=html.match(/<article><span class="path-label">02 \/ CON INTERVENCIÓN EXPERTA[\s\S]*?<\/article>/)[0];
 assert.match(service,/<details class="launch-help-form" id="consulta-encargo">/);
 assert.doesNotMatch(service,/Qué preparar para conversar/);
 assert.match(source,/hash==='#consulta-encargo'/);
 assert.match(html,/forms\.js\?v=20261029-traduccion5/);
 assert.match(html,/integration\.css\?v=20261028-encargo4/);
 assert.equal((service.match(/name="needs"/g)||[]).length,6);
 assert.doesNotMatch(service,/id="help-type"/);
 const pattern=service.match(/name="whatsapp"[^>]*pattern="([^"]+)"/)[1];
 const phone=new RegExp(`^(?:${pattern})$`,'v');
 assert.equal(phone.test('+52 55 1234 5678'),true);
 assert.equal(phone.test('telefono incorrecto'),false);
 assert.match(html,/href="\/diagnostico\.html">Completa el diagnóstico/);
});
