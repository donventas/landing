'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const vm = require('node:vm'), fs = require('node:fs'), path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'appearance.js'), 'utf8');
function harness({blocked = false, stored = null, query = '?appearance=light&from=article'} = {}) {
  const events = {}, listeners = {}, root = {dataset:{}}, saved = [];
  let focus, url, inserted = 0;
  const element = (dataset = {}) => ({dataset, attrs:{}, events:{}, hidden:true,
    setAttribute(k,v){this.attrs[k]=v;}, addEventListener(k,fn){this.events[k]=fn;},
    focus(options){focus={element:this,options};}});
  const trigger=element(), panel=element(), footer=element(), menu=element();
  const choices=['light','dark','system'].map(value=>element({appearanceChoice:value}));
  const control=element(); control.contains=e=>[control,trigger,panel,...choices].includes(e);
  control.querySelector=s=>s==='.dv-appearance-trigger'?trigger:panel;
  control.querySelectorAll=()=>choices;
  const host={querySelector:()=>inserted?control:null,insertBefore(){inserted++;}};
  const media={matches:false,addEventListener(k,fn){this.changed=fn;}};
  const document={documentElement:root,readyState:'loading',createElement:()=>control,
    querySelector:()=>host, querySelectorAll:s=>s==='[data-dv-appearance-select]'?[footer]:[menu],
    addEventListener(k,fn){events[k]=fn;}};
  vm.runInNewContext(source,{document,URL,URLSearchParams,matchMedia:()=>media,
    location:{search:query,href:'https://preview.example/blog/?appearance=light&from=article#leer'},
    localStorage:{getItem(){if(blocked)throw Error();return stored;},setItem(k,v){if(blocked)throw Error();saved.push([k,v]);}},
    history:{replaceState(a,b,value){url=value.href;}},addEventListener(k,fn){listeners[k]=fn;}});
  events.DOMContentLoaded();
  return {events,listeners,root,trigger,panel,footer,choices,control,menu,media,saved,
    focus:()=>focus,url:()=>url,inserted:()=>inserted};
}
test('header: one disclosure, three explicit choices and effective icon',()=>{
  const h=harness();assert.equal(h.inserted(),1);h.events.DOMContentLoaded();assert.equal(h.inserted(),1);
  assert.match(h.control.innerHTML,/aria-controls="dv-appearance-panel"/);
  assert.equal(h.control.dataset.effective,'light');assert.equal(h.choices[0].attrs['aria-pressed'],'true');
  h.trigger.events.click();assert.equal(h.panel.hidden,false);assert.equal(h.menu.open,false);
  h.choices[1].events.click();assert.equal(h.panel.hidden,true);assert.equal(h.root.dataset.dvPreference,'dark');
  assert.equal(h.footer.value,'dark');assert.equal(h.focus().element,h.trigger);
  assert.equal(h.focus().options.preventScroll,true);
  assert.equal(h.url(),'https://preview.example/blog/?from=article#leer');
  assert.deepEqual(h.saved,[['dv.appearance.v1','dark']]);
});
test('header: Escape returns focus, outside and focus departure do not steal it',()=>{
  const h=harness();h.trigger.events.click();let prevented=false;
  h.control.events.keydown({key:'Escape',preventDefault(){prevented=true;},stopPropagation(){}});
  assert.equal(prevented,true);assert.equal(h.panel.hidden,true);assert.equal(h.focus().element,h.trigger);
  h.trigger.events.click();h.events.pointerdown({target:h.choices[0]});assert.equal(h.panel.hidden,false);
  h.events.pointerdown({target:{}});assert.equal(h.panel.hidden,true);
  h.trigger.events.click();h.control.events.focusout({relatedTarget:h.choices[0]});assert.equal(h.panel.hidden,false);
  h.control.events.focusout({relatedTarget:{}});assert.equal(h.panel.hidden,true);
  h.trigger.events.click();h.menu.open=true;h.menu.events.toggle();assert.equal(h.panel.hidden,true);
});
test('header: System, footer, storage and blocked storage stay coherent',()=>{
  const h=harness({blocked:true});h.trigger.events.click();assert.doesNotThrow(()=>h.choices[2].events.click());
  h.media.matches=true;h.media.changed();assert.equal(h.control.dataset.effective,'dark');
  assert.match(h.trigger.attrs['aria-label'],/Según tu dispositivo/);
  h.footer.value='light';h.footer.events.change();h.media.changed();assert.equal(h.control.dataset.effective,'light');
  h.listeners.storage({key:'dv.appearance.v1',newValue:'dark'});assert.equal(h.choices[1].attrs['aria-pressed'],'true');
  h.listeners.storage({key:'dv.appearance.v1',newValue:null});assert.equal(h.root.dataset.dvPreference,'system');
});
test('header: query wins over stored value; invalid input falls back safely',()=>{
  assert.equal(harness({stored:'dark'}).root.dataset.dvPreference,'light');
  assert.equal(harness({stored:'dark',query:'?appearance=invalid'}).root.dataset.dvPreference,'dark');
  assert.equal(harness({stored:'invalid',query:''}).root.dataset.dvPreference,'system');
});
