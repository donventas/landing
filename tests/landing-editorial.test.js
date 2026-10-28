const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

function sha256(relativePath) {
  // Git checks out text SVGs with CRLF on Windows and LF in Linux CI.
  // Normalize line endings only; all logo content remains protected by the hash.
  const svg = fs.readFileSync(path.join(root, relativePath), 'utf8').replace(/\r\n/g, '\n');
  return crypto.createHash('sha256').update(svg).digest('hex');
}

test('keeps the indexable SEO contract and one visible page topic', () => {
  assert.equal((html.match(/<h1\b/gi) || []).length, 1);
  assert.match(html, /<title>Haz que tu marca se entienda · Don Ventas<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]+">/);
  assert.match(html, /<meta name="robots" content="index,follow,/);
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.donventas\.mx\/">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/www\.donventas\.mx\/variantes\/b\/media\/social-landing-b06\.jpg"/);
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
  assert.match(html, /href="\/diagnostico\.html"/);
  assert.doesNotMatch(html, /<script[^>]+src="diagnostico-v2\.js"/);
  assert.match(fs.readFileSync(path.join(root, 'app.js'), 'utf8'), /script\.src='diagnostico-v2\.js'/);
  assert.match(html, /src="\/analytics\.js"/);
  assert.match(html, /15_LEGAL\/Aviso%20de%20Privacidad\.html/);
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
  assert.ok(newTabs.length >= 2); // Translation and browser help remain available.
  assert.deepEqual(newTabs.filter(tag => !/\brel="[^"]*noopener[^"]*"/i.test(tag)), []);
});

test('keeps the canonical wordmark without loading the 3D emblem in the hero', () => {
  assert.equal(
    sha256('assets/brand/donventas-wordmark-b6-reverse.svg'),
    '94f2f1d53617e8611ca759b97ee3b7e390d60bb1587dbc2f5e0312ebce29edde'
  );
  assert.match(html, /donventas-wordmark-b6-reverse\.svg/);
  assert.doesNotMatch(html, /data-hero-mark|hero-mark-3d\.js/);
});

test('new hero states the offer and labels the fictional case', () => {
  assert.match(html, /Haz que se <br><span>entienda\.<\/span>/);
  assert.match(html, /Tu negocio tiene mucho que ofrecer/);
  assert.match(html, /alt="Un experto revisa una bicicleta en el taller conceptual de Vuelta 27\."/);
  assert.match(html, /Vuelta 27 es un taller ficticio/);
});

test('uses the launch stylesheet and includes the example image with dimensions', () => {
  assert.match(html, /href="\/assets\/portal-launch\/landing\.css"/);
  assert.doesNotMatch(html, /href="styles\.css"/);
  assert.match(html, /taller\.webp" width="1942" height="809"/);
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
