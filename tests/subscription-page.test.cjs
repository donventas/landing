'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../subscription.js'),'utf8');
function fixture(action='confirm',result={status:200,ok:true,body:{ok:true}}){
 const events={},els={},requests=[];let reloads=0;
 const location={hash:'#'+action+'='+'a'.repeat(64),pathname:'/suscripcion.html',reload(){reloads++;}};
 const element=id=>els[id]||(els[id]={hidden:true,disabled:false,textContent:'',addEventListener(n,fn){this[n]=fn;},focus(){}});
 const context={window:{addEventListener(n,fn){events[n]=fn;}},location,history:{replaceState(){location.hash='';}},document:{getElementById:element},AbortController,setTimeout,clearTimeout,fetch:async(url,options)=>{requests.push({url,options});return {...result,json:async()=>result.body};}};
 vm.runInNewContext(source,context);return{events,els,requests,location,reloads:()=>reloads};
}
test('opening a subscription link only prepares a button and clears the bearer fragment',()=>{
 const f=fixture();assert.equal(f.requests.length,0);assert.equal(f.location.hash,'');assert.equal(f.els['subscription-action'].hidden,false);
});
test('a reused subscription tab reloads for the new action without issuing a POST',()=>{
 const f=fixture();f.location.hash='#unsubscribe='+'b'.repeat(64);f.events.hashchange();assert.equal(f.reloads(),1);assert.equal(f.requests.length,0);
});
test('explicit confirmation posts once and removes the action after success',async()=>{
 const f=fixture();await f.els['subscription-action'].click();assert.equal(f.requests.length,1);assert.equal(JSON.parse(f.requests[0].options.body).action,'confirm');assert.equal(f.els['subscription-action'].hidden,true);
});
test('unsubscribe is a distinct explicit action and expired tokens do not show success',async()=>{
 const f=fixture('unsubscribe',{status:410,ok:false,body:{ok:false}});await f.els['subscription-action'].click();assert.equal(JSON.parse(f.requests[0].options.body).action,'unsubscribe');assert.match(f.els['subscription-status'].textContent,/ya no está disponible/);
});
