const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const articlePath = path.join(root, 'blog', 'por-que-nacio-don-ventas.html');
const article = fs.readFileSync(articlePath, 'utf8');
const hub = fs.readFileSync(path.join(root, 'blog', 'index.html'), 'utf8');

test('publishes one indexable foundational article topic', () => {
  assert.equal((article.match(/<h1\b/gi) || []).length, 1);
  assert.match(article, /<title>Por qué nació Don Ventas: hacer visible el valor de un negocio<\/title>/);
  assert.match(article, /<link rel="canonical" href="https:\/\/www\.donventas\.mx\/blog\/por-que-nacio-don-ventas\.html">/);
  assert.match(article, /<meta name="robots" content="index,follow,/);
});

test('keeps personal claims bounded and the public promise explicit', () => {
  assert.match(article, /más de 20 empresas/);
  assert.match(article, /No prometemos/);
  assert.match(article, /millones de seguidores/);
  assert.doesNotMatch(article, /aument(?:é|amos).*%|ventas garantizadas|resultados garantizados/i);
});

test('provides article metadata, structured data and an accessible portrait', () => {
  const scripts = [...article.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1);
  const graph = JSON.parse(scripts[0][1])['@graph'];
  assert.equal(graph.some(item => item['@type'] === 'BlogPosting'), true);
  assert.match(article, /<img[^>]+src="\.\.\/fundador\.jpg"[^>]+alt="Retrato de Arturo Villagomez, fundador de Don Ventas"/);
});

test('links the hub, sitemap and llms index to the new article', () => {
  assert.match(hub, /href="por-que-nacio-don-ventas\.html"/);
  assert.match(fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8'), /blog\/por-que-nacio-don-ventas\.html/);
  assert.match(fs.readFileSync(path.join(root, 'llms.txt'), 'utf8'), /blog\/por-que-nacio-don-ventas\.html/);
});

test('all local references in the article resolve', () => {
  const references = [...article.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
  const local = references.filter(value =>
    !/^(?:https?:|mailto:|tel:|#|data:|\/\/)/i.test(value) && value !== '/_vercel/insights/script.js'
  );
  const missing = local.filter(value => {
    const clean = decodeURIComponent(value.split(/[?#]/)[0]);
    return !fs.existsSync(path.resolve(path.dirname(articlePath), clean));
  });
  assert.deepEqual(missing, []);
});
