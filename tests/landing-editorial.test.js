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
  assert.match(html, /src="diagnostico-v2\.js"/);
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

test('uses the traced B6 mark and the reviewed 3D mesh exactly', () => {
  assert.equal(
    sha256('assets/brand/donventas-symbol-b-reverse.svg'),
    'a5d38ac61e4e34887678988c1731e5d4756a862470662b13ce0b7fe339d59d75'
  );
  assert.equal(
    sha256('assets/motion/exports/symbol-b-mesh.json'),
    'b730cd15d01ecc5e923c22db172145e4010cdb337e2c01812ae5b4fd61155e1b'
  );
  assert.match(html, /data-hero-mark/);
  assert.match(html, /src="assets\/motion\/hero-mark-3d\.js"/);
});
