const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'analytics.js'), 'utf8');
const api = require('../analytics.js');

function fixture(host = 'www.donventas.mx', saved = null, deniedStorage = false, pathname = '/', options = {}) {
  const values = new Map(saved ? [[api.key, JSON.stringify(saved)]] : []);
  const sessionValues = options.sessionValues || new Map(), timers = new Map();
  let clock = Date.now(), timerId = 0;
  const scripts = [], cookies = [], listeners = {}, windowListeners = {};
  const button = value => ({ focus() {}, getAttribute() { return value; } });
  const reject = button('rejected'), accept = button('accepted'), prefs = button();
  const panel = { hidden: true, querySelector() { return reject; } }, status = {};
  const wrap = { querySelector(selector) { return selector === '.dv-analytics-panel' ? panel : selector === '[data-analytics-settings]' ? prefs : status; }, querySelectorAll() { return [reject, accept]; } };
  const doc = { readyState: 'complete', visibilityState:'visible', referrer:options.referrer || '', querySelector(selector) { return (options.dom || {})[selector] || null; }, head: { appendChild(node) { scripts.push(node); } }, body: { appendChild() {} },
    createElement(tag) { return tag === 'div' ? wrap : {}; }, addEventListener(name, fn) { listeners[name] = fn; }, dispatchEvent() {} };
  Object.defineProperty(doc, 'cookie', { set(value) { cookies.push(value); }, get() { return ''; } });
  let reloads = 0;
  const win = { document: doc, location: { pathname, hostname: host, protocol: 'https:', origin: 'https://' + host,
    search:options.search || '',
    href: 'https://' + host + pathname + '?email=private@example.com&utm_campaign=secret#private', reload() { reloads++; } },
    localStorage: { getItem(k) { if (deniedStorage) throw Error('denied'); return values.get(k) || null; }, setItem(k,v) { if (deniedStorage) throw Error('denied'); values.set(k,v); } },
    sessionStorage: { getItem(k) { if (deniedStorage) throw Error('denied'); return sessionValues.get(k) || null; }, setItem(k,v) { if (deniedStorage) throw Error('denied'); sessionValues.set(k,v); }, removeItem(k) { sessionValues.delete(k); } },
    innerWidth:390, innerHeight:844, setInterval(fn) { const id=++timerId; timers.set(id,fn);return id; }, clearInterval(id) { timers.delete(id); },
    addEventListener(name, fn) { windowListeners[name] = fn; }, CustomEvent: function (name, options) { this.type = name; this.detail = options.detail; } };
  vm.runInNewContext(source, { window: win, URL, URLSearchParams, Date:{now:()=>clock} });
  const commands = () => (win.dataLayer || []).filter(x => typeof x.length === 'number').map(x => Array.from(x));
  return { win, doc, scripts, cookies, panel, status, accept, reject, prefs, values, sessionValues, timers, listeners, windowListeners, commands, reloads: () => reloads,
    advance(ms) {clock+=ms;Array.from(timers.values()).forEach(fn=>fn());} };
}
test('nothing reaches Google before consent; reject does not install a tag', () => {
  const f = fixture();
  assert.equal(f.win.dataLayer, undefined);
  assert.equal(f.win.DVAnalytics.track('diagnostic_started', { route: 'contenido' }), false);
  f.reject.onclick();
  assert.equal(f.scripts.filter(x => x.src).length, 0);
  assert.equal(f.panel.hidden, true);
  assert.equal(JSON.parse(f.values.get(api.key)).choice, 'rejected');
});
test('accept installs exactly one tag and one sanitized page event; no preconsent backfill', () => {
  const f = fixture();
  f.win.DVAnalytics.track('whatsapp_click');
  f.accept.onclick(); f.accept.onclick();
  assert.equal(f.scripts.filter(x => x.src).length, 1);
  assert.equal(f.scripts.find(x => x.src).referrerPolicy, 'origin');
  const events = f.commands().filter(x => x[0] === 'event');
  assert.equal(events.length, 1);
  assert.equal(events[0][1], 'page_view');
  assert.equal(events[0][2].page_location, 'https://www.donventas.mx/');
  assert.doesNotMatch(JSON.stringify(f.commands()), /private|secret|example\.com/);
  assert.equal(f.commands()[0][0], 'consent');
  assert.equal(f.commands()[0][2].analytics_storage, 'denied');
});
test('event contracts drop form data, recommendations, raw API errors and unknown values', () => {
  assert.deepEqual(api.cleanEvent('diagnostic_completed', {route:'contenido', name:'Private', email:'private@example.com', recommendation:'motor', budget_gap:true}), {route:'contenido'});
  assert.equal(api.cleanEvent('email', {}), null);
  assert.equal(api.cleanEvent('glossary_lookup', {term:'private search text'}), null);
  assert.equal(api.cleanEvent('diagnostic_step_completed', {route:'branding',step:'secret'}), null);
  assert.equal(api.page('/unknown/private@example.com'), null);
  assert.equal(api.cleanEvent('content_selected', {destination:'https://evil.test'}), null);
});
test('previews remain local even after accepting, with inspectable safe events', () => {
  const f = fixture('landing-git-codex-consent-first-analytics-don-ventas.vercel.app');
  f.accept.onclick();
  f.win.DVAnalytics.track('glossary_lookup',{term:'marca',email:'private@example.com'});
  assert.equal(f.scripts.filter(x => x.src).length, 0);
  assert.equal(f.win.dataLayer, undefined);
  assert.equal(f.win.DVAnalytics.records.length, 2);
  assert.doesNotMatch(JSON.stringify(f.win.DVAnalytics.records), /private|email/);
});
test('withdrawal blocks events, expires only known GA cookies and reloads loaded scripts', () => {
  const f = fixture();
  f.values.set('dv-lead-pending', 'preserve'); f.accept.onclick(); f.reject.onclick();
  assert.equal(f.win['ga-disable-G-YD4BFZTY4V'], true);
  assert.equal(f.win.DVAnalytics.track('whatsapp_click'), false);
  assert.equal(f.reloads(), 1);
  assert.equal(f.values.get('dv-lead-pending'), 'preserve');
  assert.ok(f.cookies.every(x => /^_ga(?:_YD4BFZTY4V)?=; Max-Age=0;/.test(x)));
});
test('withdrawal in another tab stops measurement here', () => {
  const f = fixture(); f.accept.onclick(); f.values.delete(api.key);
  f.windowListeners.storage({key:api.key});
  assert.equal(f.win.DVAnalytics.track('whatsapp_click'),false); assert.equal(f.reloads(),1);
});
test('expired, corrupt, future and denied storage do not grant implicit consent', () => {
  for (const saved of [{version:1,choice:'accepted',at:0},{version:1,choice:'accepted',at:Date.now()+100000},{version:2,choice:'accepted',at:Date.now()}]) {
    assert.equal(fixture('www.donventas.mx',saved).win.dataLayer,undefined);
  }
  const f = fixture('www.donventas.mx',null,true); f.reject.onclick();
  assert.match(f.status.textContent,/no permite guardar/);
  assert.equal(f.win.dataLayer,undefined);
});
test('saved consent starts once; step and success counts are deduplicated per page', () => {
  const f = fixture('www.donventas.mx',{version:1,choice:'accepted',at:Date.now()-100});
  for (let i=0;i<2;i++) f.win.DVAnalytics.track('diagnostic_completed',{route:'branding'});
  assert.equal(f.commands().filter(x=>x[0]==='event'&&x[1]==='diagnostic_completed').length,1);
});
test('unknown/legal paths can manage preferences but never send page data', () => {
  const f = fixture('www.donventas.mx',null,false,'/15_LEGAL/Politica%20de%20Cookies.html');
  f.accept.onclick(); assert.equal(f.win.dataLayer,undefined);
});
test('all public reading and diagnostic entry points include the first-party module before app logic', () => {
  for (const name of ['index.html','branding.html','diagnostico.html','blog/index.html','blog/glosario.html','blog/por-que-nacio-don-ventas.html','blog/contenido-que-atrae-clientes.html','blog/tu-marca-es-tu-ventaja.html']) {
    const html = fs.readFileSync(path.join(root,name),'utf8');
    assert.equal((html.match(/src="\/analytics.js"/g)||[]).length,1,name);
    assert.doesNotMatch(html, /googletagmanager\.com\/(?:ns|gtm|gtag)/);
  }
  assert.ok(Buffer.byteLength(source)<24000);
});

const campaignQuery = '?utm_source=instagram&utm_medium=social&utm_campaign=tu-marca-es-tu-ventaja&utm_content=historia';
test('campaigns use a closed vocabulary and reject duplicate, unknown or Ads parameters', () => {
  assert.deepEqual(api.campaignFrom(campaignQuery,null,Date.now(),true),{source:'instagram',medium:'social',name:'tu-marca-es-tu-ventaja',content:'historia'});
  for(const query of [campaignQuery+'&utm_source=facebook',campaignQuery.replace('social','email'),campaignQuery.replace('historia','private@example.com'),campaignQuery+'&gclid=private',campaignQuery.replace('tu-marca-es-tu-ventaja','private-customer')]) {
    assert.equal(api.campaignFrom(query,null,Date.now(),false),null);
  }
});
test('campaign attribution is never persisted before consent and carries only registered fields', () => {
  const f=fixture('www.donventas.mx',null,false,'/',{search:campaignQuery+'&email=private@example.com&utm_term=secret'});
  assert.equal(f.sessionValues.size,0); assert.equal(f.timers.size,0);
  f.accept.onclick();
  const payload=f.commands().find(x=>x[0]==='event')[2];
  assert.equal(payload.entry_campaign,'tu-marca-es-tu-ventaja');
  assert.equal(payload.page_location,'https://www.donventas.mx/');
  assert.doesNotMatch(JSON.stringify(f.commands()),/private|secret/);
  assert.equal(f.sessionValues.size,1);
  f.reject.onclick();assert.equal(f.sessionValues.size,0);assert.equal(f.timers.size,0);
});
test('consented campaign survives internal navigation; external/invalid/expired entry clears it', () => {
  const first=fixture('www.donventas.mx',null,false,'/',{search:campaignQuery});first.accept.onclick();
  const accepted={version:1,choice:'accepted',at:Date.now()-1};
  const next=fixture('www.donventas.mx',accepted,false,'/branding.html',{sessionValues:first.sessionValues,referrer:'https://www.donventas.mx/'});
  assert.equal(next.commands().find(x=>x[0]==='event')[2].entry_source,'instagram');
  const saved=next.sessionValues.get(api.campaignKey);
  for(const options of [{referrer:'https://external.test/private'},{search:'?utm_campaign=unknown'}]) {
    const f=fixture('www.donventas.mx',accepted,false,'/',{...options,sessionValues:new Map([[api.campaignKey,saved]])});
    assert.equal(f.commands().find(x=>x[0]==='event')[2].entry_campaign,undefined);
    assert.equal(f.sessionValues.size,0);
  }
  for(const at of [Date.now()-1800001,Date.now()+60000]) {
    const value=JSON.parse(saved);value.at=at;
    assert.equal(api.campaignFrom('',{getItem:()=>JSON.stringify(value)},Date.now(),false),null);
  }
});
test('visible time excludes background, preconsent and suspension; withdrawal stops sampler', () => {
  const f=fixture('preview.test'); f.advance(10000);assert.equal(f.win.DVAnalytics.records.length,0);
  f.accept.onclick();for(let i=0;i<9;i++)f.advance(1000);
  assert.equal(f.win.DVAnalytics.records.filter(x=>x.event==='visible_time').length,0);
  f.doc.visibilityState='hidden';f.listeners.visibilitychange();for(let i=0;i<30;i++)f.advance(1000);
  f.doc.visibilityState='visible';f.listeners.visibilitychange();f.advance(60000);
  assert.equal(f.win.DVAnalytics.records.filter(x=>x.event==='visible_time').length,0);
  f.advance(1000);f.advance(1000);
  assert.equal(f.win.DVAnalytics.records.filter(x=>x.event==='visible_time').length,1);
  f.reject.onclick();f.advance(10000);assert.equal(f.win.DVAnalytics.records.length,0);
});
test('step/section exposure needs visibility and dwell; reading jumps do not manufacture skipped bands', () => {
  let top=900;
  const heading={getBoundingClientRect:()=>({top,bottom:top+40,left:0,right:300,width:300,height:40})};
  const form={querySelector:()=>heading,getAttribute:k=>k==='data-route-name'?'branding':'desired'};
  const article={getBoundingClientRect:()=>({top:-760,bottom:1240,height:2000})};
  const f=fixture('preview.test',null,false,'/blog/tu-marca-es-tu-ventaja.html',{dom:{'main h1':heading,'.dv-form-shell[data-analytics-step]':form,'article.article-copy, article.manifesto-story':article}});
  f.accept.onclick();f.advance(1000);f.advance(1000);
  assert.equal(f.win.DVAnalytics.records.filter(x=>/viewed/.test(x.event)).length,0);
  top=100;f.advance(1000);f.advance(1000);f.advance(1000);
  const events=f.win.DVAnalytics.records;
  assert.equal(events.filter(x=>x.event==='diagnostic_step_viewed').length,1);
  assert.equal(events.filter(x=>x.event==='section_viewed').length,1);
  assert.deepEqual(Array.from(events.filter(x=>x.event==='reading_progress'),x=>x.parameters.percent),[75]);
});
test('funnel payloads exclude invalid step ids, error messages and arbitrary timings', () => {
  assert.deepEqual(api.cleanEvent('diagnostic_validation_error',{route:'branding',message:'private',field:'email'}),{route:'branding',step:'contact'});
  assert.equal(api.cleanEvent('visible_time',{seconds:12345}),null);
  assert.equal(api.cleanEvent('reading_progress',{percent:99}),null);
  assert.equal(api.cleanEvent('section_viewed',{section:'private'}),null);
  assert.equal(api.cleanEvent('diagnostic_step_viewed',{route:'branding',step:'private'}),null);
});
test('branding diagnostic anchors are diagnosed as entry, not generic service clicks', () => {
  const f=fixture('preview.test',null,false,'/branding.html');f.accept.onclick();
  const link={href:'https://preview.test/branding.html#diagnostico',hasAttribute:()=>false};
  f.listeners.click({target:{closest:()=>link}});
  assert.equal(f.win.DVAnalytics.records.at(-1).event,'diagnostic_entry');
});

test('campaign expiry during a long-open page and blocked storage remain privacy-safe', () => {
  const f=fixture('preview.test',null,false,'/',{search:campaignQuery});f.accept.onclick();
  f.doc.visibilityState='hidden';f.advance(1800001);
  f.win.DVAnalytics.track('whatsapp_click');
  assert.equal(f.win.DVAnalytics.records.at(-1).parameters.entry_campaign,undefined);
  assert.equal(f.sessionValues.size,0);
  const blocked=fixture('preview.test',null,true,'/',{search:campaignQuery});
  blocked.accept.onclick();assert.equal(blocked.sessionValues.size,0);
  assert.equal(blocked.win.DVAnalytics.records[0].parameters.entry_campaign,'tu-marca-es-tu-ventaja');
  blocked.reject.onclick();assert.equal(blocked.win.DVAnalytics.track('whatsapp_click'),false);
});

test('diagnostic success is emitted only after acceptance; failures have no success event', async () => {
  const events=[], win={DVAnalytics:{track:(name)=>events.push(name)}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'diagnostico-v2.js'),'utf8'),{window:win});
  const instance=Object.create(win.DVDiagnostic.Diagnostic.prototype);
  let resolve;
  Object.assign(instance,{route:'contenido',el:{querySelectorAll:()=>[]},sendLead:()=>new Promise(r=>{resolve=r;}),resultMarkup:()=>'',bindResultActions:()=>{}});
  instance.submitLead('Private',{key:'test',gap:false});
  assert.deepEqual(events,['diagnostic_submit_attempted']);
  resolve();await new Promise(r=>setImmediate(r));
  assert.deepEqual(events,['diagnostic_submit_attempted','diagnostic_completed']);
  events.length=0;
  instance.sendLead=()=>Promise.reject(new Error('Private error'));
  instance.submitLead('Private',{key:'test',gap:false});await new Promise(r=>setImmediate(r));
  assert.deepEqual(events,['diagnostic_submit_attempted','diagnostic_submit_failed']);
  instance.sendLead=()=>Promise.resolve();
  instance.submitLead('Private',{key:'test',gap:false});await new Promise(r=>setImmediate(r));
  assert.deepEqual(events,['diagnostic_submit_attempted','diagnostic_submit_failed','diagnostic_submit_attempted','diagnostic_completed']);
});

test('landing inventory covers every top-level section in actual DOM order', () => {
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const headings=Array.from(html.matchAll(/<section\b[^>]*\baria-labelledby="([^"]+)"/g),m=>m[1]);
  assert.deepEqual(api.landingSections.map(s=>s.heading),headings);
  assert.equal(new Set(api.landingSections.map(s=>s.key)).size,9);
});

test('landing exposure emits all nine names/orders once, without manufacturing skipped sections', () => {
  let current='metodo';
  const dom={};
  for(const section of api.landingSections)dom['#'+section.heading]={getBoundingClientRect:()=>({top:current===section.key?100:900,bottom:current===section.key?140:940,left:0,right:300,width:300,height:40})};
  const f=fixture('preview.test',null,false,'/',{dom});f.accept.onclick();f.advance(1000);f.advance(1000);
  let events=f.win.DVAnalytics.records.filter(x=>x.event==='section_viewed');
  assert.deepEqual(Array.from(events,x=>[x.parameters.section,x.parameters.section_order]),[['metodo',3]]);
  for(const section of api.landingSections){current=section.key;f.advance(1000);f.advance(1000);}
  current='metodo';f.advance(1000);f.advance(1000);
  events=f.win.DVAnalytics.records.filter(x=>x.event==='section_viewed');
  assert.equal(events.length,9);
  for(const [index,section] of api.landingSections.entries())assert.equal(events.find(x=>x.parameters.section===section.key).parameters.section_order,index+1);
  assert.equal(f.win.DVAnalytics.track('section_viewed',{section:'inversion'}),false);
});

test('a heading edge flashing through the viewport is not a section exposure', () => {
  let top=843;
  const heading={getBoundingClientRect:()=>({top,bottom:top+40,left:0,right:300,width:300,height:40})};
  const f=fixture('preview.test',null,false,'/',{dom:{'#hero-title':heading}});f.accept.onclick();f.advance(1000);f.advance(1000);
  assert.equal(f.win.DVAnalytics.records.filter(x=>x.event==='section_viewed').length,0);
  top=100;f.advance(1000);f.advance(1000);
  assert.equal(f.win.DVAnalytics.records.filter(x=>x.event==='section_viewed').length,1);
});

test('landing CTA retains the source section but no label or arbitrary DOM data', () => {
  const f=fixture('preview.test');f.accept.onclick();
  const link={href:'https://preview.test/#contacto',hasAttribute:()=>false,closest:selector=>selector==='main > section'?{getAttribute:()=> 'method-title'}:null};
  f.listeners.click({target:{closest:()=>link}});
  const event=f.win.DVAnalytics.records.at(-1);
  assert.equal(event.event,'diagnostic_entry');assert.equal(event.parameters.origin_section,'metodo');assert.equal(event.parameters.origin_order,3);
  assert.equal(api.cleanEvent('diagnostic_entry',{destination:'diagnostico',origin_section:'private@example.com'}).origin_section,undefined);
});
