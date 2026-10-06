const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const page = read('arturo-villagomez.html');
const url = 'https://www.donventas.mx/arturo-villagomez.html';
const personId = 'https://www.donventas.mx/#quien';
const articles = ['por-que-nacio-don-ventas', 'contenido-que-atrae-clientes', 'tu-marca-es-tu-ventaja'];
const graph = html => JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
test('owner full name is corrected inside both rendered legal templates', () => {
  for (const file of ['Aviso de Privacidad', 'Terminos y Condiciones']) {
    const html = read(`15_LEGAL/${file}.html`);
    const template = JSON.parse(html.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/)[1]);
    assert.match(template, /marca operada por Arturo Villagomez Gomez, persona física/);
    assert.doesNotMatch(html, /Villagómez|Gómez/);
    assert.match(template, /Última actualización: 6 de octubre de 2026/);
  }
});
test('profile identifies one person without changing the existing identity id', () => {
  const items = graph(page);
  const profile = items.find(i => i['@type'] === 'ProfilePage');
  const person = items.find(i => i['@type'] === 'Person');
  assert.equal(profile.mainEntity['@id'], personId);
  assert.equal(person['@id'], personId);
  assert.equal(person.name, 'Arturo Villagomez');
  assert.equal(person.alternateName, 'Arturo Villagomez Gomez');
  assert.equal(person.url, url);
  assert.deepEqual(person.sameAs, ['https://www.arturovillagomez.com/']);
  assert.equal(items.find(i => i['@type'] === 'Organization').founder['@id'], personId);
  assert.equal(items.find(i => i['@type'] === 'Organization').sameAs, undefined);
  assert.match(page, /Soy Arturo Villagomez Gomez/);
  assert.equal((page.match(/<h1\b/g) || []).length, 1);
  assert.match(page, new RegExp(`rel="canonical" href="${url.replaceAll('.', '\\.')}"`));
  assert.match(page, /name="robots" content="index,follow/);
});
test('landing and articles bind the same founder, profile and author', () => {
  for (const file of ['index.html', ...articles.map(a => `blog/${a}.html`)]) {
    const html = read(file), items = graph(html);
    const article = items.find(i => i['@type'] === 'BlogPosting');
    const person = items.find(i => i['@type'] === 'Person') || article.author;
    assert.equal(person['@id'], personId, file);
    assert.equal(person.url, url, file);
    assert.equal(person.alternateName, 'Arturo Villagomez Gomez', file);
    if (article) {
      assert.equal(article.author['@id'], personId);
      assert.match(html, /href="\/arturo-villagomez.html" rel="author"/);
    }
  }
  assert.match(read('index.html'), /href="\/arturo-villagomez.html">Arturo Villagomez/);
  assert.match(read('blog/index.html'), /href="\/arturo-villagomez.html" rel="author"/);
});
test('profile is connected, locally complete, script-light and covered by CSP', () => {
  assert.match(read('sitemap.xml'), /<loc>https:\/\/www.donventas.mx\/arturo-villagomez.html<\/loc>/);
  assert.match(read('llms.txt'), /arturo-villagomez.html/);
  for (const name of articles) assert.ok(page.includes(`/blog/${name}.html`));
  for (const [, ref] of page.matchAll(/(?:href|src)="(\/[^"?#]*)/g)) {
    if (ref.startsWith('/_vercel/')) continue;
    assert.ok(fs.existsSync(path.join(root, decodeURIComponent(ref))), ref);
  }
  assert.match(page, /width="1024" height="1024"/);
  assert.match(page, /fetchpriority="high" loading="eager"/);
  assert.doesNotMatch(page, /googletagmanager|analytics\.js|<iframe/);
  const headers = JSON.parse(read('vercel.json')).headers;
  const route = headers.find(h => h.source.includes('arturo-villagomez'));
  assert.ok(route.headers.some(h => h.key === 'Content-Security-Policy' && h.value.includes("object-src 'none'")));
});
