const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const bytes = file => fs.statSync(path.join(root, file)).size;

test('serves responsive WebP portfolio images without changing the original assets', () => {
  const html = read('index.html');
  const manifest = JSON.parse(read(path.join('assets', 'b10-performance-manifest.json')));
  assert.equal(manifest.sets.length, 13);
  assert.doesNotMatch(html.slice(html.indexOf('id="prueba"'), html.indexOf('id="quien"')), /\.png/);
  assert.equal((html.match(/<img[^>]+srcset="portafolio\/snaps\//g) || []).length, 6);
  assert.equal((html.match(/data-srcset="portafolio\/snaps\//g) || []).length, 4);
  assert.match(html, /width="1280" height="800"/);
  manifest.sets.forEach(set => {
    assert.equal(fs.existsSync(path.join(root, set.source.path)), true);
    set.derivatives.forEach(asset => assert.equal(bytes(asset.path), asset.bytes));
  });
});

test('keeps responsive image payloads inside the release budget', () => {
  const manifest = JSON.parse(read(path.join('assets', 'b10-performance-manifest.json')));
  const portfolio = manifest.sets.slice(0, 6);
  const total640 = portfolio.reduce((sum, set) => sum + set.derivatives.find(asset => asset.width === 640).bytes, 0);
  const total1280 = portfolio.reduce((sum, set) => sum + set.derivatives.find(asset => asset.width === 1280).bytes, 0);
  assert.ok(total640 <= 180000, `640px portfolio is ${total640} bytes`);
  assert.ok(total1280 <= 550000, `1280px portfolio is ${total1280} bytes`);
  assert.ok(Math.max(...portfolio.flatMap(set => set.derivatives.map(asset => asset.bytes))) <= 200000);
  assert.ok(bytes('fundador-800.webp') <= 50000);
});

test('keeps the branding route inside its responsive image budget', () => {
  const html = read('branding.html');
  const manifest = JSON.parse(read(path.join('assets', 'b10-performance-manifest.json')));
  const branding = manifest.sets.filter(set => /\/(?:dv-v22|sicaru-dv-v2)-/.test(set.source.path));
  const total640 = branding.reduce((sum, set) => sum + set.derivatives.find(asset => asset.width === 640).bytes, 0);
  const total1280 = branding.reduce((sum, set) => sum + set.derivatives.find(asset => asset.width === 1280).bytes, 0);
  assert.equal(branding.length, 6);
  assert.doesNotMatch(html.slice(html.indexOf('id="casos"'), html.indexOf('id="preguntas"')), /\.png/);
  assert.equal((html.match(/<img[^>]+srcset="portafolio\/snaps\//g) || []).length, 6);
  assert.ok(total640 <= 120000, `640px branding portfolio is ${total640} bytes`);
  assert.ok(total1280 <= 320000, `1280px branding portfolio is ${total1280} bytes`);
});

test('loads secondary behavior progressively and keeps accessible fallbacks', () => {
  const pages = ['index.html', 'branding.html', 'diagnostico.html'].map(read).join('\n');
  const loader = read('diagnostico-loader.js');
  const hero = read('hero-mark-3d.js');
  assert.doesNotMatch(pages, /<script defer src="diagnostico-v2\.js/);
  assert.match(pages, /diagnostico-loader\.js/);
  assert.match(loader, /IntersectionObserver/);
  assert.match(loader, /hola@donventas\.mx/);
  assert.match(hero, /requestIdleCallback/);
  assert.match(hero, /Vista estática · SVG canónico/);
  assert.match(hero, /prefers-reduced-motion: reduce/);
});

test('avoids a serial font stylesheet request and reserves image geometry', () => {
  const styles = read('styles.css');
  const html = read('index.html');
  assert.doesNotMatch(styles, /@import/);
  assert.equal((styles.match(/font-display:swap/g) || []).length, 4);
  assert.match(html, /fundador-800\.webp" width="800" height="800"[^>]*loading="lazy"/);
  assert.match(html, /diagnostico-sistema-don-ventas\.webp"[^>]*width="1672" height="941"/);
});
