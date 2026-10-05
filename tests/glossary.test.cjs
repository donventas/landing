const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const glossary = read('blog/glosario.html');
const entries = [...glossary.matchAll(/<section class="glossary-entry" id="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)];
const ids = new Set(entries.map(x => x[1]));
const blogs = fs.readdirSync(path.join(root, 'blog')).filter(f => f.endsWith('.html'));

test('glossary entries have stable IDs, readable definitions, examples and distinctions', () => {
  assert.ok(entries.length >= 10);
  assert.equal(ids.size, entries.length);
  const allIds = [...glossary.matchAll(/\bid="([^"]+)"/g)].map(x => x[1]);
  assert.equal(allIds.length, new Set(allIds).size);
  for (const [tag, id, content] of entries) {
    assert.match(id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.match(tag, /tabindex="-1"/);
    for (const role of ['term-definition', 'term-example', 'term-confusion']) {
      assert.match(content, new RegExp(`class="${role}">[^<]*\\S|class="${role}"><strong>`));
    }
    assert.match(content, /<h2\b/);
    assert.ok(glossary.includes(`href="#${id}"`), `Missing index: ${id}`);
  }
});

test('every article glossary link reaches a specific existing entry, including future blogs', () => {
  for (const file of blogs) {
    const html = read(`blog/${file}`);
    for (const [, href] of html.matchAll(/<a\b[^>]*href="([^"]*glosario\.html[^"]*)"/g)) {
      const url = new URL(href, 'https://www.donventas.mx/blog/');
      if (!url.hash && file === 'index.html') continue;
      assert.equal(url.pathname, '/blog/glosario.html');
      assert.ok(ids.has(decodeURIComponent(url.hash.slice(1))), `${file}: ${href}`);
    }
  }
  const pilot = read('blog/tu-marca-es-tu-ventaja.html');
  assert.match(pilot, /glosario\.html#marca/);
  assert.match(pilot, /glosario\.html#promesa-de-marca/);
  assert.doesNotMatch(pilot, /aunque tu campaña diga otra cosa|tu operación tiene que acompañarte/);
});

test('glossary local paths, cross-page anchors and index all resolve without scripts', () => {
  for (const [, href] of glossary.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (href.startsWith('http') || href.startsWith('mailto:') || href === '/_vercel/insights/script.js') continue;
    const url = new URL(href, 'https://www.donventas.mx/blog/glosario.html');
    let file = decodeURIComponent(url.pathname).replace(/^\//, '');
    if (file.endsWith('/') || !file) file += 'index.html';
    assert.ok(fs.existsSync(path.join(root, file)), href);
    if (url.hash) assert.ok(read(file).includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), href);
  }
  assert.doesNotMatch(glossary, /on(?:click|mouseover)=|role="tooltip"|<iframe/);
  const scripts = [...glossary.matchAll(/<script[^>]*src="([^"]+)"/g)].map(x => x[1]);
  assert.deepEqual(scripts, ['/app.js', '/blog/blog.js', '/_vercel/insights/script.js']);
});

test('glossary discoverability and editorial workflow remain explicit', () => {
  assert.equal((glossary.match(/<h1>/g) || []).length, 1);
  assert.match(glossary, /rel="canonical" href="https:\/\/www.donventas.mx\/blog\/glosario.html"/);
  assert.match(glossary, /content="index,follow/);
  assert.match(read('sitemap.xml'), /https:\/\/www.donventas.mx\/blog\/glosario.html/);
  assert.match(read('blog/index.html'), /href="\/blog\/glosario.html"/);
  const workflow = read('blog/WORKFLOW-EDITORIAL.md');
  assert.match(workflow, /glosario progresivo/);
  assert.match(workflow, /misma PR/);
  assert.match(workflow, /IDs son estables/);
  assert.match(read('blog/glosario.css'), /scroll-margin-top:130px/);
  const data = [...glossary.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(data.length, 1);
  assert.equal(JSON.parse(data[0][1])['@type'], 'CollectionPage');
});
