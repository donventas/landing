const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'branding.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'branding-editorial.css'), 'utf8');
const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];

test('branding keeps one topic, canonical, indexability and existing lead route', () => {
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /rel="canonical" href="https:\/\/www\.donventas\.mx\/branding.html"/);
  assert.match(html, /name="robots" content="index,follow/);
  assert.match(html, /data-dv-diagnostic data-route="evolucion" data-service="identidad"/);
  assert.match(html, /src="app.js"/);
  assert.match(html, /src="\/_vercel\/insights\/script.js"/);
  for (const legal of ['Aviso de Privacidad', 'Terminos y Condiciones', 'Politica de Cookies']) assert.ok(html.includes(`15_LEGAL/${legal}.html`));
});

test('branding gives context and proof before ranges; no unconfirmed delivery promise', () => {
  const body = html.slice(html.indexOf('<body'));
  assert.ok(body.indexOf('id="casos"') < body.indexOf('18–30 mil'));
  assert.ok(body.indexOf('id="sistema"') < body.indexOf('id="inversion"'));
  assert.equal((body.match(/Por proyecto · no incluye IVA/g) || []).length, 3);
  assert.doesNotMatch(body, /3[–-]5 días|diagnóstico en PDF|garantiza|mipymes/i);
  const offers = graph.find(n => n['@type'] === 'Service').offers;
  assert.deepEqual(offers.map(o => [o.priceSpecification.minPrice, o.priceSpecification.maxPrice]), [[18000,30000],[31000,60000],[61000,120000]]);
  for (const offer of offers) { assert.equal(offer.priceSpecification.priceCurrency, 'MXN'); assert.equal(offer.priceSpecification.valueAddedTaxIncluded, false); }
});

test('branding FAQ schema exactly matches visible questions and answers', () => {
  const visible = [...html.matchAll(/<details><summary>(.*?)<\/summary><p>(.*?)<\/p><\/details>/g)];
  const schema = graph.find(n => n['@type'] === 'FAQPage').mainEntity;
  assert.deepEqual(visible.map(m=>[m[1],m[2]]), schema.map(n=>[n.name,n.acceptedAnswer.text]));
});

test('branding uses one complete approved scene, responsive derivatives and explicit concept label', () => {
  assert.match(html, /branding-owner-v2-480.webp 480w/);
  assert.match(html, /branding-owner-v2-1120.webp 1120w/);
  assert.doesNotMatch(html, /branding-owner-v1|<picture|hero-mark-3d/);
  assert.match(html, /Escena conceptual generada con IA/);
  assert.match(css, /\.brand-cover-scene img\{[^}]*height:auto[^}]*object-fit:contain/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  for (const size of [480,768,1120]) assert.ok(fs.statSync(path.join(root, `assets/editorial/branding-owner-v2-${size}.webp`)).size < 150000);
});

test('branding references, anchors, metadata images and srcsets resolve', () => {
  const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]);
  for (const match of html.matchAll(/srcset="([^"]+)"/g)) refs.push(...match[1].split(',').map(v=>v.trim().split(' ')[0]));
  for (const match of html.matchAll(/content="https:\/\/www.donventas.mx\/([^" ]+\.(?:png|webp))"/g)) refs.push(match[1]);
  for (const ref of refs) {
    if (ref.startsWith('#')) { assert.ok(html.includes(`id="${ref.slice(1)}"`), ref); continue; }
    if (/^(https?:|mailto:|\/)/.test(ref)) continue;
    assert.ok(fs.existsSync(path.join(root, decodeURIComponent(ref.split(/[?#]/)[0]))), ref);
  }
  for (const tag of html.matchAll(/<img\b[^>]*>/g)) { assert.match(tag[0], /alt="[^"]+"/); assert.match(tag[0], /width="\d+" height="\d+"/); }
});

test('branding is discoverable and click measurement is bounded to non-personal enums', () => {
  const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(home, /href="branding.html">Marca<\/a>/);
  for (const file of ['contenido-que-atrae-clientes.html','por-que-nacio-don-ventas.html']) assert.match(fs.readFileSync(path.join(root,'blog',file),'utf8'), /href="\/branding.html" data-blog-entry="sistema-de-marca"/);
  const js = fs.readFileSync(path.join(root,'branding-editorial.js'),'utf8');
  assert.match(js, /allowed/);
  assert.doesNotMatch(js, /\.value|email|phone|localStorage|sessionStorage/);
});
