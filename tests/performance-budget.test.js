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
  const heroLoader = read('hero-mark-loader.js');
  assert.doesNotMatch(pages, /<script defer src="diagnostico-v2\.js/);
  assert.match(pages, /diagnostico-loader\.js/);
  assert.match(loader, /IntersectionObserver/);
  assert.match(loader, /hola@donventas\.mx/);
  assert.match(hero, /requestIdleCallback/);
  assert.match(hero, /Vista estática · SVG canónico/);
  assert.match(hero, /prefers-reduced-motion: reduce/);
  assert.match(pages, /hero-mark-loader\.js/);
  assert.doesNotMatch(pages, /<script defer src="hero-mark-3d\.js/);
  assert.match(heroLoader, /setTimeout[\s\S]*7000/);
  assert.match(heroLoader, /requestIdleCallback/);
  assert.match(heroLoader, /prefers-reduced-motion: reduce/);
  assert.match(heroLoader, /Vista estática · movimiento reducido/);
  assert.match(heroLoader, /Preparando entrada 3D/);
});

test('avoids a serial font stylesheet request and reserves image geometry', () => {
  const styles = read('styles.css');
  const html = read('index.html');
  assert.doesNotMatch(styles, /@import/);
  assert.equal((styles.match(/font-display:swap/g) || []).length, 4);
  assert.match(html, /fundador-800\.webp" width="800" height="800"[^>]*loading="lazy"/);
  assert.match(html, /diagnostico-sistema-don-ventas\.webp"[^>]*width="1672" height="941"/);
});

test('prioritizes only the typography and static image used in the first view', () => {
  const html = read('index.html');
  const editorialStyles = read('b10-editorial.css');
  const head = html.slice(0, html.indexOf('</head>'));
  assert.match(head, /rel="preload" href="assets\/fonts\/schibsted-grotesk-latin-normal\.woff2\?v=20261001-1" as="font" type="font\/woff2" crossorigin/);
  assert.doesNotMatch(head, /rel="preload" href="assets\/fonts\/schibsted-grotesk-latin-italic\.woff2"/);
  assert.match(head, /rel="preload" href="assets\/b10-motion\/donventas-symbol-b-reverse\.svg\?v=20261001-1" as="image" type="image\/svg\+xml" fetchpriority="high"/);
  assert.match(html, /donventas-symbol-b-reverse\.svg\?v=20261001-1" alt="Símbolo B de Don Ventas" fetchpriority="high" decoding="async"/);
  assert.match(editorialStyles, /\.b10-mark-viewport img\{[^}]*height:auto/);
  assert.match(editorialStyles, /\.b10-motion-stage\{[^}]*min-height:510px/);
});

test('loads analytics outside the critical rendering path', () => {
  const pages = ['index.html', 'branding.html', 'diagnostico.html'].map(read);
  const loader = read('analytics-loader.js');
  pages.forEach(html => {
    assert.match(html, /analytics-loader\.js\?v=/);
    assert.doesNotMatch(html, /<script[^>]+src="\/_vercel\/insights\/script\.js"/);
  });
  assert.match(loader, /requestIdleCallback/);
  assert.match(loader, /setTimeout[\s\S]*6000/);
  assert.match(loader, /pointerdown/);
  assert.match(loader, /\/_vercel\/insights\/script\.js/);
  assert.doesNotMatch(loader, /clarity|session.?replay/i);
});

test('uses immutable cache only for versioned assets and revalidates mutable images', () => {
  const config = JSON.parse(read('vercel.json'));
  assert.ok(Array.isArray(config.headers));
  assert.ok(config.headers.length >= 8);
  config.headers.forEach(rule => {
    assert.doesNotMatch(rule.source, /html/i);
    assert.ok(rule.headers.some(header => header.key === 'Cache-Control'));
  });
  const immutable = config.headers.filter(rule => rule.headers.some(header => /immutable/.test(header.value)));
  assert.ok(immutable.length >= 6);
  const mutableImages = config.headers.filter(rule => /webp/.test(rule.source));
  assert.ok(mutableImages.every(rule => rule.headers.some(header => /max-age=86400, stale-while-revalidate=604800/.test(header.value))));
  assert.match(read('styles.css'), /woff2\?v=20261001-1/);
  assert.match(read('hero-mark-3d.js'), /symbol-b-mesh\.json\?v=20261001-1/);
});
