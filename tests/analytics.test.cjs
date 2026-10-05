const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'analytics.js'), 'utf8');
const api = require('../analytics.js');

function fixture(host = 'www.donventas.mx', saved = null, deniedStorage = false, pathname = '/') {
  const values = new Map(saved ? [[api.key, JSON.stringify(saved)]] : []);
  const scripts = [], cookies = [], listeners = {}, windowListeners = {};
  const button = value => ({ focus() {}, getAttribute() { return value; } });
  const reject = button('rejected'), accept = button('accepted'), prefs = button();
  const panel = { hidden: true, querySelector() { return reject; } }, status = {};
  const wrap = { querySelector(selector) { return selector === '.dv-analytics-panel' ? panel : selector === '[data-analytics-settings]' ? prefs : status; }, querySelectorAll() { return [reject, accept]; } };
  const doc = { readyState: 'complete', head: { appendChild(node) { scripts.push(node); } }, body: { appendChild() {} },
    createElement(tag) { return tag === 'div' ? wrap : {}; }, addEventListener(name, fn) { listeners[name] = fn; }, dispatchEvent() {} };
  Object.defineProperty(doc, 'cookie', { set(value) { cookies.push(value); }, get() { return ''; } });
  let reloads = 0;
  const win = { document: doc, location: { pathname, hostname: host, protocol: 'https:', origin: 'https://' + host,
    href: 'https://' + host + pathname + '?email=private@example.com&utm_campaign=secret#private', reload() { reloads++; } },
    localStorage: { getItem(k) { if (deniedStorage) throw Error('denied'); return values.get(k) || null; }, setItem(k,v) { if (deniedStorage) throw Error('denied'); values.set(k,v); } },
    addEventListener(name, fn) { windowListeners[name] = fn; }, CustomEvent: function (name, options) { this.type = name; this.detail = options.detail; } };
  vm.runInNewContext(source, { window: win, URL });
  const commands = () => (win.dataLayer || []).filter(x => typeof x.length === 'number').map(x => Array.from(x));
  return { win, doc, scripts, cookies, panel, status, accept, reject, prefs, values, listeners, windowListeners, commands, reloads: () => reloads };
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
  assert.ok(Buffer.byteLength(source)<15000);
});
