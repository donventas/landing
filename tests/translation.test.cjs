'use strict';
const test=require('node:test'), assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {pages,decode}=require('../scripts/appearance-pages.cjs');
const {publicURL,integrate,languages}=require('../scripts/translation-pages.cjs');
for(const file of Object.keys(pages)) test('translation: safe additive integration — '+file,()=>{
  const base=cp.execFileSync('git',['show','083d00e4e8473dd506d589a0e7814a0364f67663:'+file],{cwd:root,encoding:'utf8',maxBuffer:12e6});
  const actual=read(file), html=decode(actual);
  if(file!=='index.html')assert.equal(actual.replace(/\r/g,''),integrate(base,file).replace(/\r/g,''));
  // The new homepage installs the same translation component directly; the
  // legacy additive transformer targets the former homepage's utility markup.
  if(file!=='index.html')assert.equal(integrate(actual,file),actual);
  assert.equal((html.match(/id="idioma"/g)||[]).length,1);
  for(const asset of ['translation.js','translation.css'])assert.equal((html.match(new RegExp('/'+asset.replace('.','\\.'),'g'))||[]).length,1);
  assert.doesNotMatch(html,/<html[^>]*(?:notranslate|translate="no")/);
  if(file==='suscripcion.html') {assert.doesNotMatch(html,/translate\.google\.com\/website/);return;}
  assert.match(html,/referrerpolicy="no-referrer"/);
  const href=html.match(/data-dv-language-url="[^"]+" href="([^"]+)"/)[1].replace(/&amp;/g,'&');
  const target=new URL(href);assert.equal(target.origin,'https://translate.google.com');
  assert.equal(target.searchParams.get('u'),publicURL(file));
  const url=new URL(target.searchParams.get('u'));assert.equal(url.search,'');assert.equal(url.hash,'');assert.equal(url.origin,'https://www.donventas.mx');
});
test('translation: no third-party boot scripts, analytics, credentials or URL reflection',()=>{
  const source=read('translation.js');
  assert.doesNotMatch(source,/fetch\(|XMLHttpRequest|localStorage|dataLayer|sendBeacon|location\.(?:href|search)|document\.cookie/);
  assert.ok(Buffer.byteLength(source)+Buffer.byteLength(read('translation.css'))<15000);
  assert.match(source,/\.search = ''/);assert.match(source,/\.hash = ''/);
  assert.match(read('.vercelignore'),/scripts\/translation-pages.cjs/);
});
test('translation: compact legacy article headers keep the diagnostic action inside the viewport',()=>{
 const css=read('translation.css');
 assert.match(css,/\.nav:has\(\.dv-language-trigger\)>\.in\{width:100%;max-width:none;box-sizing:border-box;margin-inline:0;padding-inline:12px;gap:8px\}/);
 assert.match(css,/\.nav-cta>\.btn:not\(\[href="https:\/\/app\.donventas\.mx"\]\)\{padding-inline:8px;font-size:10px;letter-spacing:\.07em\}/);
});
function harness({host='127.0.0.1',ready='complete',hash='',url='https://www.donventas.mx/branding.html?token=private#private',sensitive=false,header=false}={}){
 const element=()=>({dataset:{},listeners:{},attrs:{},hidden:false,open:false,addEventListener(k,fn){this.listeners[k]=fn;},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this[k];},classList:{added:[],add(v){this.added.push(v);}},style:{values:{},setProperty(k,v){this.values[k]=v;}},focus(){this.focused=true;},scrollIntoView(options){this.scrolled=options;},closest(){return null;}});
 const details=element(),summary=element(),panel=element(),select=element(),link=element(),close=element(),entry=element(),menu=element(),appearance=element(),mark=element();
 select.value='en';select.disabled=true;link.dataset.dvLanguageUrl=url;
 details.querySelector=s=>({summary,'.dv-language-panel':panel,'[data-dv-language-target]':sensitive?null:select,'[data-dv-language-url]':sensitive?null:link,'.dv-language-close':close}[s]);
 details.contains=target=>[details,summary,panel,select,link,close].includes(target);
 const nav={getBoundingClientRect:()=>({top:0,bottom:76})},bar={getBoundingClientRect:()=>({top:76,bottom:122})};
 const created=[];appearance.parentNode={insertBefore(el,before){el.before=before;}};
 const docEvents={},windowEvents={},document={readyState:ready,body:{appendChild(){}},createElement(tag){const el=element();el.tag=tag;el.appendChild=child=>{el.child=child;};el.showModal=()=>{el.open=true;};el.close=()=>{el.open=false;el.listeners.close?.();};el.getBoundingClientRect=()=>({bottom:64,left:900});created.push(el);return el;},querySelector:()=>header?appearance:null,getElementById:()=>details,addEventListener(k,fn){docEvents[k]=fn;},querySelectorAll:s=>({'[data-dv-language-open]':[entry],'.mobile-explore[open]':[menu],'.mobile-explore':[menu],'.dv-appearance-trigger':[appearance],'.editorial-nav,.nav,.section-index':[nav,bar],'.wordmark,.brand-wordmark':[mark]}[s]||[])};
 vm.runInNewContext(read('translation.js'),{document,URL,HTMLDialogElement:function(){},innerWidth:1280,location:{hostname:host,hash},getComputedStyle:()=>({position:'sticky'}),addEventListener(k,fn){windowEvents[k]=fn;},requestAnimationFrame:fn=>fn()});
 if(ready!=='complete')docEvents.DOMContentLoaded();
 return{details,summary,select,link,close,entry,menu,appearance,mark,docEvents,windowEvents,created};
}
test('translation: header modal reuses panel, restores focus and supports deferred initialization',()=>{
 for(const ready of ['loading','interactive','complete']) {
  const h=harness({header:true,ready}),[trigger,dialog]=h.created;
  assert.equal(trigger.before,h.appearance);assert.equal(trigger.attrs['aria-haspopup'],'dialog');
  trigger.listeners.click();assert.equal(dialog.open,true);assert.equal(h.select.focused,true);assert.equal(trigger.attrs['aria-expanded'],'true');
  dialog.listeners.cancel({preventDefault(){}});assert.equal(dialog.open,false);assert.equal(trigger.focused,true);
  h.summary.listeners.click({preventDefault(){}});assert.equal(dialog.open,true);
  h.close.listeners.click();assert.equal(dialog.open,false);assert.equal(h.summary.focused,true);
  trigger.listeners.click();dialog.listeners.click({target:dialog});assert.equal(dialog.open,false);
  h.windowEvents.load?.();assert.equal(h.created.length,2);
 }
});
test('translation: direct language anchor reveals and focuses selector without forwarding the fragment',()=>{
 for(const ready of ['complete','loading']){const h=harness({hash:'#idioma',ready});assert.equal(h.details.open,true);assert.equal(h.summary.focused,true);assert.equal(h.details.scrolled.behavior,'instant');h.details.open=false;if(h.windowEvents.load)h.windowEvents.load();h.windowEvents.hashchange();assert.equal(h.details.open,true);}
 assert.equal(harness({hash:'#otra-seccion'}).details.open,false);
});
test('translation: all nine destinations including Bulgarian stay clean and no URL query is forwarded',()=>{
 assert.equal(languages.length,9);assert.deepEqual(languages.find(([value])=>value==='bg'),['bg','Български']);
 const h=harness();assert.equal(h.select.disabled,false);
 for(const [value]of languages){h.select.value=value;h.select.listeners.change();const url=new URL(h.link.href);assert.equal(url.searchParams.get('tl'),value);assert.equal(url.searchParams.get('u'),'https://www.donventas.mx/branding.html');}
 const previous=h.link.href;h.select.value='javascript:bad';h.select.listeners.change();assert.equal(h.link.href,previous);
});
test('translation: invalid origin and subscription fail closed',()=>{
 for(const url of ['https://app.donventas.mx/','https://evil.test/','https://www.donventas.mx/suscripcion.html','https://user:pass@www.donventas.mx/']){const h=harness({url});assert.equal(h.select.disabled,true);assert.equal(h.link.href,undefined);}
 assert.doesNotThrow(()=>harness({sensitive:true}));
});
test('translation: no duplicate Google floating control or toolbar overrides',()=>{
 const h=harness();assert.ok(!h.details.classList.added.includes('is-floating'));
 assert.doesNotMatch(read('translation.css')+read('translation.js'),/gt-nvframe|is-floating/);
 assert.equal(h.mark.attrs.translate,'no');
});
test('translation: keyboard, outside click, menu and footer work in normal and bundled initialization',()=>{
 for(const ready of ['complete','loading']){const h=harness({ready});h.menu.open=true;h.entry.listeners.click({preventDefault(){}});assert.equal(h.details.open,true);assert.equal(h.menu.open,false);
 h.details.listeners.keydown({key:'Escape',preventDefault(){},stopPropagation(){}});assert.equal(h.details.open,false);assert.equal(h.summary.focused,true);
 h.details.open=true;h.docEvents.pointerdown({target:{closest:()=>null}});assert.equal(h.details.open,false);
 h.details.open=true;h.menu.open=true;h.menu.listeners.toggle();assert.equal(h.details.open,false);
 h.details.open=true;h.appearance.listeners.click();assert.equal(h.details.open,false);
 h.details.open=true;h.close.listeners.click();assert.equal(h.details.open,false);
 }
});
