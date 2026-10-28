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
