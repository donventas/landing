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
  assert.equal(author.url, 'https://www.donventas.mx/arturo-villagomez.html');
  assert.deepEqual(author.sameAs, ['https://www.arturovillagomez.com/']);
  assert.deepEqual(posting.image.map(value => new URL(value).pathname), [
    '/og-fundacional-1200x1200.jpg',
    '/og-fundacional-1200x900.jpg',
    '/og-fundacional-1200x630.jpg'
  ]);
  assert.match(article, /<img[^>]+src="\/assets\/editorial\/fundador-editorial-768\.webp"[^>]+alt="Arturo Villagomez, fundador de Don Ventas"/);
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
  assert.match(home, /"audienceType": "Profesionales, emprendimientos y empresas de habla hispana"/);
  assert.doesNotMatch(home, /"audienceType": "PyMEs/);
});

test('keeps a reciprocal editorial path between the foundation and the guide', () => {
  assert.match(article, /href="\/blog\/contenido-que-atrae-clientes\.html"[^>]*>Leer la experiencia y el criterio/);
  assert.match(guide, /href="\/blog\/por-que-nacio-don-ventas\.html"[^>]*>Leer por qué nació Don Ventas/);
  assert.doesNotMatch(guide, /diagnóstico en PDF/);
  assert.doesNotMatch(hub, /diagnóstico en PDF/);
});

test('links the hub, sitemap and llms index to the new article', () => {
  assert.match(hub, /href="\/blog\/por-que-nacio-don-ventas\.html"/);
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
    const resolved = clean.startsWith('/')
      ? path.resolve(root, clean.slice(1))
      : path.resolve(path.dirname(articlePath), clean);
    return !fs.existsSync(resolved);
  });
  assert.deepEqual(missing, []);
});

test('presents the hub as an editorial cover and keeps routes situation-first', () => {
  assert.match(hub, /class="blog-masthead publication-cover"/);
  assert.match(hub, /class="publication-visual/);
  assert.match(hub, /hub-el-don-v1-480\.webp 480w, \/assets\/editorial\/hub-el-don-v1-720\.webp 720w/);
  assert.doesNotMatch(hub, /blog-hub-cover-960\.webp/);
  assert.match(hub, /Desde el escritorio de Arturo/);
  assert.match(hub, /class="situation-ledger\b/);
  assert.equal((hub.match(/class="situation-row"/g) || []).length, 5);
  assert.match(hub, /data-blog-entry="situacion-manual"/);
  assert.doesNotMatch(hub, /class="situation-grid"/);
});

test('ships responsive editorial covers without loading oversized source images', () => {
  assert.match(article, /fundador-editorial-480\.webp 480w/);
  assert.match(guide, /class="article-cover-figure/);
  assert.match(guide, /barberia-el-don-v1-480\.webp 480w/);
  assert.match(guide, /width="1440" height="960"/);

  const blogCss = fs.readFileSync(path.join(root, 'blog', 'blog.css'), 'utf8');
  assert.match(blogCss, /@media\(max-width:1120px\)[\s\S]*?\.publication-cover-grid\{grid-template-columns:1fr;[^}]*grid-template-areas:"visual" "title" "index"/);
  assert.match(blogCss, /@media\(max-width:1120px\)[\s\S]*?\.article-cover-figure\{order:-1/);
  assert.match(blogCss, /@media\(max-width:1120px\)[\s\S]*?\.founder-figure\{order:-1/);
  assert.match(blogCss, /@media\(max-width:1120px\)[\s\S]*?\.publication-visual\{[^}]*aspect-ratio:4\/3/);
  assert.match(blogCss, /@media\(max-width:1120px\)[\s\S]*?\.publication-visual img\{object-position:center top/);
  assert.match(blogCss, /@media\(max-width:1120px\)[\s\S]*?\.publication-title\{[^}]*margin-top:clamp\(-260px,-25vw,-110px\)/);
  assert.match(hub, /blog\.css\?v=20261007-reading-progress/);

  const optimized = [
    'assets/editorial/article-wrong-offer-480.webp',
    'assets/editorial/article-wrong-offer-960.webp',
    'assets/editorial/article-wrong-offer-1440.webp',
    'assets/editorial/blog-hub-cover-480.webp',
    'assets/editorial/blog-hub-cover-960.webp',
    'assets/editorial/blog-hub-cover-1440.webp',
    'assets/editorial/blog-hub-cover-portrait-480.webp',
    'assets/editorial/blog-hub-cover-portrait-720.webp',
    'assets/editorial/article-understand-business-480.webp',
    'assets/editorial/article-understand-business-960.webp',
    'assets/editorial/article-understand-business-1440.webp',
    'assets/editorial/fundador-editorial-480.webp',
    'assets/editorial/fundador-editorial-768.webp',
    'assets/editorial/fundador-editorial-1024.webp',
  ];
  for (const file of optimized) {
    assert.ok(fs.statSync(path.join(root, file)).size < 100_000, `${file} should stay below 100 KB`);
  }
});

test('gives the second article an authentic business point of view without invented results', () => {
  assert.match(guide, /Nos preguntaban por un servicio que no vendíamos/);
  assert.match(guide, /más de 20 empresas/);
  assert.match(guide, /Ejemplo ilustrativo de redacción/);
  assert.match(guide, /no es una campaña probada/);
  assert.match(guide, /No puedo prometer que una explicación clara, por sí sola, conseguirá una venta/);
  assert.doesNotMatch(guide, /ventas garantizadas|resultados garantizados|millones de seguidores/i);
});

test('integrates the conceptual cover without cropping or an intervening caption band', () => {
  const css = fs.readFileSync(path.join(root, 'blog', 'blog.css'), 'utf8');
  assert.match(guide, /article-cover-illustrated/);
  assert.match(guide, /class="cover-source">Ilustración con IA · escena ficticia/);
  assert.match(css, /\.article-cover-illustrated \.article-cover-figure img\{[^}]*height:auto;object-fit:contain/);
  assert.match(css, /\.article-cover-illustrated \.article-cover-figure picture::after\{[^}]*pointer-events:none;[^}]*linear-gradient/);
  assert.match(css, /\.article-cover-illustrated \.article-cover-figure figcaption\{[^}]*clip-path:inset\(50%\)/);
  assert.match(css, /@media\(max-width:1120px\)\{\s*\.article-cover-illustrated \.article-cover-grid\{grid-template-columns:1fr\}/);
});

test('uses approved editorial numbering and distinguishes publication from revision', () => {
  assert.match(article, /Artículo 01 · Origen/);
  assert.match(guide, /Artículo 02 · Experiencia y criterio/);
  assert.match(hub, /Artículo 01 · Carta fundacional/);
  assert.match(hub, /Artículo 02 · Experiencia y criterio/);
  for (const html of [article, guide]) {
    const published = html.match(/"datePublished":"([^"]+)"/)[1].slice(0,10);
    const modified = html.match(/"dateModified":"([^"]+)"/)[1].slice(0,10);
    assert.ok(html.includes(`Publicado el <time datetime="${published}">`));
    assert.ok(html.includes(`Actualizado el <time datetime="${modified}">`));
  }
});

test('preserves shared horizontal reading gutters on article layout', () => {
  const css = fs.readFileSync(path.join(root, 'blog', 'blog.css'), 'utf8');
  const rules = [...css.matchAll(/\.article-layout\{([^}]+)\}/g)].map(m => m[1]);
  assert.ok(rules.some(rule => /padding-block:/.test(rule)));
  assert.ok(rules.every(rule => !/(?:^|;)padding:|padding-inline:0/.test(rule)));
});
