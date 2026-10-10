const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'blog/index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'blog/hub-covers.css'), 'utf8');
const cards = [...html.matchAll(/<a class="hub-story\b[^>]*>[\s\S]*?<\/a>/g)].map(m => m[0]);

test('all seven stories and the glossary have a single image-and-title destination', () => {
  const expected = [
    ['por-que-nacio-don-ventas.html', 'fundador-editorial', 'carta-fundacional'],
    ['contenido-que-atrae-clientes.html', 'barberia-el-don-v1', 'guia-contenido'],
    ['tu-marca-es-tu-ventaja.html', 'joyeria-el-don-v3', 'marca-ventaja'],
    ['manual-de-marca.html', 'manual-busqueda-v3', 'manual-marca'],
    ['logotipos-mitos.html', 'logo-vitrina-v5', 'logos-mitos'],
    ['diseno-editorial.html', 'editorial-reporte-v1', 'diseno-editorial'],
    ['como-aparecer-en-google.html', 'se-busca-v1', 'descubrimiento'],
    ['glosario.html', 'glossary-hosts-v1', 'glosario'],
  ];
  assert.equal(cards.length, expected.length);
  cards.forEach((card, i) => {
    const [file, image, event] = expected[i];
    assert.ok(card.includes(`href="/blog/${file}"`));
    assert.ok(card.includes(`data-blog-entry="${event}"`));
    assert.ok(card.includes(`/assets/editorial/${image}-480.webp`));
    assert.match(card, /<figure class="hub-story-media">/);
    assert.match(card, /<div class="hub-story-copy">/);
    const label = card.match(/aria-labelledby="([^"]+)"/)[1];
    assert.match(card,new RegExp(`<h2 id="${label}"(?:\\s[^>]*)?>`));
    assert.equal((card.match(/<a\b/g) || []).length, 1);
    assert.doesNotMatch(card, /<(?:button|input|select)\b/);
    assert.match(card, /class="hub-story-action"/);
  });
  assert.match(cards[1], /Ilustración con IA · escena ficticia/);
  assert.doesNotMatch(cards[0], /Retrato intervenido con IA/);
  assert.match(cards[2], /Ilustración con IA · escena ficticia/);
  assert.match(cards[3], /Ilustración con IA · escena ficticia/);
  assert.match(cards[4], /Ilustración con IA · escena ficticia/);
  assert.match(cards[5], /Ilustración con IA · escena ficticia/);
  assert.match(cards[6], /Ilustración con IA · escena ficticia/);
  assert.match(cards[7], /Arturo y El Don · Ilustración con IA/);
  assert.match(html, /Artículo 04/);
  assert.match(html, /Recurso de consulta · Glosario/);
});

test('covers are lazy, dimensioned, responsive and use bounded existing WebP assets', () => {
  for (const card of cards) {
    const img = card.match(/<img\b[^>]+>/)[0];
    for (const attr of ['alt', 'width', 'height', 'srcset', 'sizes']) {
      assert.match(img, new RegExp(`\\b${attr}="[^"]+"`));
    }
    assert.match(img, /loading="lazy"/);
    assert.match(img, /decoding="async"/);
    assert.doesNotMatch(img, /fetchpriority="high"/);
    for (const candidate of img.match(/srcset="([^"]+)"/)[1].split(',')) {
      const file = candidate.trim().split(/\s+/)[0];
      assert.ok(file.endsWith('.webp'));
      assert.ok(fs.statSync(path.join(root, file)).size < 180000, `Oversized card variant: ${file}`);
    }
  }
  assert.match(css, /\.hub-story-media img\{[^}]*height:auto;object-fit:contain/);
  assert.match(css, /@media\(max-width:900px\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  for (const file of fs.readdirSync(path.join(root, 'blog')).filter(f => f.endsWith('.html') && f !== 'index.html')) {
    assert.ok(!fs.readFileSync(path.join(root, 'blog', file), 'utf8').includes('hub-covers.css'));
  }
});

test('hub local links, fragments and images remain resolvable', () => {
  for (const [, ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:)/.test(ref) || ref.startsWith('/_vercel/')) continue;
    const [raw, fragment] = ref.split('#');
    let target = raw ? path.join(root, decodeURIComponent(raw.split('?')[0])) : path.join(root, 'blog/index.html');
    assert.ok(fs.existsSync(target), ref);
    if (fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    if (fragment) assert.ok(fs.readFileSync(target, 'utf8').includes(`id="${fragment}"`), ref);
  }
});
