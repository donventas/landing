const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
test('the demo selector changes samples in place and keeps direct links',()=>{
 const keys=['web','propuesta','tarjeta','coleccion'];let callback,scrolled=false;
 const sections=Object.fromEntries(keys.map(k=>[k,{attrs:{},setAttribute(n,v){this.attrs[n]=v},removeAttribute(n){delete this.attrs[n]}}]));
 const links=keys.map(k=>({hash:'#'+k,attrs:{},setAttribute(n,v){this.attrs[n]=v},removeAttribute(n){delete this.attrs[n]}}));
 const nav={querySelectorAll:()=>links,addEventListener:(type,fn)=>{if(type==='click')callback=fn}};
 const location={hash:'#tarjeta'},history={replaceState(_a,_b,hash){location.hash=hash}};
 const sandbox={document:{documentElement:{dataset:{}},querySelector:()=>nav,getElementById:k=>sections[k]},location,history,window:{scrollY:100,scrollTo(){scrolled=true}},requestAnimationFrame:fn=>fn(),addEventListener(){},decodeURIComponent};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/portal-launch/bici-story/demo-navigation.js'),'utf8'),sandbox);
 assert.equal(sections.tarjeta.attrs['data-vuelta-hidden'],undefined);assert.equal(links[2].attrs['aria-current'],'location');
 let prevented=false;callback({target:{closest:()=>links[1]},button:0,preventDefault(){prevented=true}});
 assert.ok(prevented);assert.equal(location.hash,'#propuesta');assert.equal(sections.propuesta.attrs['data-vuelta-hidden'],undefined);assert.ok('data-vuelta-hidden' in sections.tarjeta.attrs);assert.equal(scrolled,false);
});
