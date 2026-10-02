const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const articlePath = path.join(root, 'blog', 'por-que-nacio-don-ventas.html');
const article = fs.readFileSync(articlePath, 'utf8');
const hub = fs.readFileSync(path.join(root, 'blog', 'index.html'), 'utf8');
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const guide = fs.readFileSync(path.join(root, 'blog', 'contenido-que-atrae-clientes.html'), 'utf8');

function jpegDimensions(filename) {
  const data = fs.readFileSync(path.join(root, filename));
  assert.equal(data.readUInt16BE(0), 0xFFD8);
  let offset = 2;
  while (offset < data.length) {
    if (data[offset] !== 0xFF) { offset += 1; continue; }
    const marker = data[offset + 1];
    offset += 2;
    if (marker === 0xD9 || marker === 0xDA) break;
    const length = data.readUInt16BE(offset);
    if ([0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF].includes(marker)) {
      return { width: data.readUInt16BE(offset + 5), height: data.readUInt16BE(offset + 3) };
    }
    offset += length;
  }
  throw new Error(`No JPEG dimensions found for ${filename}`);
}

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
  const posting = graph.find(item => item['@type'] === 'BlogPosting');
  const author = graph.find(item => item['@type'] === 'Person');
  assert.equal(posting.author['@id'], 'https://www.donventas.mx/#quien');
  assert.equal(author.url, 'https://www.arturovillagomez.com/');
  assert.deepEqual(posting.image.map(value => new URL(value).pathname), [
    '/og-fundacional-1200x1200.jpg',
    '/og-fundacional-1200x900.jpg',
    '/og-fundacional-1200x630.jpg'
  ]);
  assert.match(article, /<img[^>]+src="\.\.\/fundador\.jpg"[^>]+alt="Retrato de Arturo Villagomez, fundador de Don Ventas"/);
});

test('ships native social compositions for the three article image ratios', () => {
  assert.deepEqual(jpegDimensions('og-fundacional-1200x630.jpg'), { width: 1200, height: 630 });
  assert.deepEqual(jpegDimensions('og-fundacional-1200x900.jpg'), { width: 1200, height: 900 });
  assert.deepEqual(jpegDimensions('og-fundacional-1200x1200.jpg'), { width: 1200, height: 1200 });
  assert.match(article, /og:image" content="https:\/\/www\.donventas\.mx\/og-fundacional-1200x630\.jpg/);
});

test('integrates the article into the homepage and broadens the public audience', () => {
  assert.match(home, /href="blog\/por-que-nacio-don-ventas\.html">Leer la carta fundacional/);
  assert.match(home, /id="quien"/);
  assert.match(home, /"audienceType": "Negocios, profesionales y personas emprendedoras"/);
  assert.doesNotMatch(home, /"audienceType": "PyMEs/);
});

test('keeps a reciprocal editorial path between the foundation and the guide', () => {
  assert.match(article, /href="contenido-que-atrae-clientes\.html">Leer la guía de contenido/);
  assert.match(guide, /href="por-que-nacio-don-ventas\.html">Leer por qué nació Don Ventas/);
  assert.doesNotMatch(guide, /diagnóstico en PDF/);
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
