const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');

test('editorial hub has one consistent informational title, distinct from commercial pages', () => {
  const html = read('blog/index.html');
  const title = 'Ideas sobre contenido, marca y sitios web — Don Ventas';
  assert.equal(html.match(/<title>(.*?)<\/title>/)[1], title);
  assert.equal(html.match(/property="og:title" content="([^"]+)"/)[1], title);
  assert.equal(html.match(/name="twitter:title" content="([^"]+)"/)[1], title);
  const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  assert.equal(graph.find(item => item['@type'] === 'CollectionPage').name, title);
  for (const page of ['index.html', 'branding.html']) {
    assert.notEqual(read(page).match(/<title>(.*?)<\/title>/)[1], title);
  }
  assert.match(html, /rel="canonical" href="https:\/\/www\.donventas\.mx\/blog\/"/);
  assert.match(html, /name="robots" content="index,follow/);
});

test('hub metadata keeps all published articles, their order and visible links', () => {
  const html = read('blog/index.html');
  const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  const list = graph.find(item => item['@type'] === 'CollectionPage').mainEntity;
  const articles = [
    ['por-que-nacio-don-ventas.html', 'El valor no siempre habla por sí solo'],
    ['contenido-que-atrae-clientes.html', 'Antes de crear contenido, entiende qué resuelve el negocio'],
    ['tu-marca-es-tu-ventaja.html', 'Tu marca es tu ventaja'],
    ['manual-de-marca.html', 'Manual de marca: el manual que más vale no perder'],
    ['logotipos-mitos.html', 'Logotipos: mitos que no dejan brillar a tu marca'],
  ];
  assert.equal(list.numberOfItems, articles.length);
  assert.deepEqual(list.itemListElement, articles.map(([file, name], index) => ({
    '@type': 'ListItem', position: index + 1,
    url: `https://www.donventas.mx/blog/${file}`, name,
  })));
  const body = html.slice(html.indexOf('<body'));
  for (const [file] of articles) {
    assert.ok(body.includes(`href="/blog/${file}"`), `Missing visible article link: ${file}`);
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'blog', file)));
  }
  assert.ok(body.includes('href="/blog/glosario.html"'), 'Missing glossary link');
  assert.ok(body.includes('href="/branding.html"'), 'Missing branding route');
  assert.ok(body.includes('href="/#contacto"'), 'Missing diagnosis route');
});
