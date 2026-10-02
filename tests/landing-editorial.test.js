const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

function sha256(relativePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex');
}

test('keeps the indexable SEO contract and one visible page topic', () => {
  assert.equal((html.match(/<h1\b/gi) || []).length, 1);
  assert.match(html, /<title>Contenido, sitios y marcas que ayudan a vender — Don Ventas<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]+">/);
  assert.match(html, /<meta name="robots" content="index,follow,/);
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.donventas\.mx\/">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/www\.donventas\.mx\/og-content\.png\?/);
});

test('publishes valid structured data without early public pricing', () => {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1);
  const graph = JSON.parse(scripts[0][1])['@graph'];
  assert.equal(graph.some(item => item['@type'] === 'FAQPage'), true);
  assert.equal(graph.some(item => item['@type'] === 'Service'), true);
  assert.doesNotMatch(html, /\$\s?\d|\d+\s*mil\s+MXN/i);
  assert.doesNotMatch(html, /3[–-]5 días|diagnóstico en PDF|PDF breve/i);
});

test('keeps the working diagnostic, privacy and analytics surfaces', () => {
  assert.match(html, /data-dv-diagnostic/);
  assert.doesNotMatch(html, /<script[^>]+src="diagnostico-v2\.js"/);
  assert.match(fs.readFileSync(path.join(root, 'app.js'), 'utf8'), /script\.src='diagnostico-v2\.js'/);
  assert.match(html, /src="\/_vercel\/insights\/script\.js"/);
  assert.match(html, /15_LEGAL\/Aviso de Privacidad\.html/);
  assert.match(html, /15_LEGAL\/Terminos y Condiciones\.html/);
  assert.match(html, /15_LEGAL\/Politica de Cookies\.html/);
  assert.doesNotMatch(html, /clarity\.ms|hotjar|session.?replay/i);
});

test('all local landing references resolve to files or directories', () => {
  const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
  const local = references.filter(value =>
    !/^(?:https?:|mailto:|tel:|#|data:|\/\/)/i.test(value) && value !== '/_vercel/insights/script.js'
  );
  const missing = local.filter(value => {
    const clean = decodeURIComponent(value.split(/[?#]/)[0]);
    return !fs.existsSync(path.join(root, clean));
  });
  assert.deepEqual(missing, []);
});

test('images have alternative text and external new tabs are isolated', () => {
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map(match => match[0]);
  assert.equal(images.length > 0, true);
  assert.deepEqual(images.filter(tag => !/\balt="[^"]*"/i.test(tag)), []);
  const newTabs = [...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/gi)].map(match => match[0]);
  assert.equal(newTabs.length, 2);
  assert.deepEqual(newTabs.filter(tag => !/\brel="[^"]*noopener[^"]*"/i.test(tag)), []);
});

test('keeps the canonical wordmark without loading the 3D emblem in the hero', () => {
  assert.equal(
    sha256('assets/brand/donventas-wordmark-b6-reverse.svg'),
    'c3a0810940289164ff5a40b3ac2524de10d43d12c98743ad41c4089aedb8a90a'
  );
  assert.match(html, /donventas-wordmark-b6-reverse\.svg/);
  assert.doesNotMatch(html, /data-hero-mark|hero-mark-3d\.js/);
});

test('leads with a capable customer situation before the mobile copy', () => {
  const homeCss = fs.readFileSync(path.join(root, 'home.css'), 'utf8');
  assert.match(html, /Para cuando tienes algo valioso que todavía pocos entienden/);
  assert.match(html, /hero-situacion-capacidad-v1-640\.webp/);
  assert.match(html, /hero-situacion-capacidad-v1-960\.webp 960w/);
  assert.match(html, /Ya conoce su negocio\. Necesita que otros entiendan su valor\./);
  assert.doesNotMatch(html, /class="hero-signature"/);
  assert.match(homeCss, /@media\(max-width:620px\)[\s\S]*?\.situation-stage\{order:-1\}/);
});

test('uses the lean home stylesheet and responsive uncropped method image', () => {
  assert.match(html, /href="home\.css"/);
  assert.doesNotMatch(html, /href="styles\.css"/);
  assert.match(html, /criterio-manos-metodo-01-06-480\.webp 480w/);
  assert.match(html, /criterio-manos-metodo-01-06-960\.webp 960w/);
  assert.match(html, /width="960" height="720"/);
});

test('exposes accessible diagnostic progress semantics', () => {
  const diagnostic = fs.readFileSync(path.join(root, 'diagnostico-v2.js'), 'utf8');
  assert.match(diagnostic, /role="progressbar"/);
  assert.match(diagnostic, /aria-valuenow/);
});

test('declares security headers and cache policies for deployment', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  const serialized = JSON.stringify(config);
  assert.match(serialized, /Content-Security-Policy/);
  assert.match(serialized, /X-Content-Type-Options/);
  assert.match(serialized, /Referrer-Policy/);
  assert.match(serialized, /Permissions-Policy/);
  assert.match(serialized, /max-age=31536000, immutable/);
});
