const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'blog/tu-marca-es-tu-ventaja.html'), 'utf8');

test('approved release has one heading, truthful publication date and indexability', () => {
  assert.match(html, /content="index,follow/);
  assert.doesNotMatch(html, /Vista previa editorial · aún no publicado/);
  assert.equal((html.match(/<h1>/g) || []).length, 1);
  assert.match(html, /"datePublished":"2026-10-04"/);
});
test('all local src and href paths and same-page anchors exist', () => {
  for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (value === '/_vercel/insights/script.js') continue;
    if (value.startsWith('#')) assert.ok(html.includes(`id="${value.slice(1)}"`), value);
    else if (value.startsWith('/')) {
      const local = decodeURIComponent(value.split(/[?#]/)[0]);
      assert.ok(fs.existsSync(path.join(root, local)), value);
    }
  }
});
test('three scenes have truthful labels and dimensioned responsive images', () => {
  assert.match(html, /Ilustración con IA · escena ficticia/);
  assert.match(html, /Recreación con IA/);
  assert.match(html, /Inspirada en el restaurante donde tuve mi primer desayuno con el amor de mi vida/);
  assert.equal((html.match(/width="1440" height="960"/g) || []).length, 3);
  for (const family of ['joyeria-el-don-v3', 'marca-recuerdo-el-don-v2', 'joyeria-cuidado-el-don-v4']) {
    for (const width of [480, 960, 1440]) {
      const file = path.join(root, `assets/editorial/${family}-${width}.webp`);
      const data = fs.readFileSync(file);
      assert.equal(data.toString('ascii', 8, 12), 'WEBP');
      assert.ok(data.length < 160000);
      assert.ok(html.includes(`/assets/editorial/${family}-${width}.webp`));
    }
  }
});

test('care illustration lives in promise section, is deferred and can be enlarged', () => {
  const section=html.match(/<section[^>]+id="promesa"[\s\S]*?<\/section>/)[0];
  const figure=section.match(/<figure class="promise-care"[\s\S]*?<\/figure>/)[0];
  assert.match(figure,/loading="lazy"/);
  assert.match(figure,/decoding="async"/);
  assert.match(figure,/Ilustración con IA · escena ficticia/);
  assert.match(figure,/aria-label="Ampliar ilustración/);
  assert.match(figure,/srcset="[^"]*480w[^"]*960w[^"]*1440w/);
  assert.match(html,/marca-ventaja\.css\?v=20261009-cuidado/);
});
test('reduced motion targets viewport and existing lead flow stays linked', () => {
  const css = fs.readFileSync(path.join(root, 'blog/marca-ventaja.css'), 'utf8');
  assert.match(css, /html:has\(\.advantage-page\)\{scroll-behavior:auto\}/);
  assert.match(html, /href="\/#contacto"/);
  assert.doesNotMatch(html, /<form\b/);
});
test('sources include simple author context and do not claim guaranteed loyalty', () => {
  assert.match(html, /profesor de marketing en Dartmouth/);
  assert.match(html, /profesor en Vanderbilt/);
  assert.match(html, /no significa que una persona satisfecha siempre volverá/);
  assert.equal((html.match(/<details class="editorial-detail">/g) || []).length, 2);
  assert.match(html, /10\.1177\/002224299305700101/);
  assert.match(html, /10\.1177\/002224378001700405/);
});
