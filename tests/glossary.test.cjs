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

test('editorial indexes stay equivalent and every related term is a stable native deep link', () => {
  const indexes = [...glossary.matchAll(/<nav class="glossary-index"[^>]*>([\s\S]*?)<\/nav>/g)];
  assert.equal(indexes.length, 2);
  const links = html => [...html.matchAll(/href="#([^"]+)"/g)].map(x => x[1]);
  assert.deepEqual(links(indexes[0][1]), [...ids]);
  assert.deepEqual(links(indexes[1][1]), [...ids]);
  assert.match(glossary, /<details class="glossary-mobile-index">\s*<summary>/);
  for (const [, id, content] of entries) {
    const related = content.match(/<p class="term-related">([\s\S]*?)<\/p>/);
    assert.ok(related, id);
    const targets = links(related[1]);
    assert.equal(targets.length, 2);
    assert.equal(new Set(targets).size, 2);
    for (const target of targets) assert.ok(ids.has(target) && target !== id);
  }
});

test('editorial glossary stays lightweight and does not add visual media or fonts', () => {
  assert.ok(Buffer.byteLength(glossary) < 28000);
  assert.ok(Buffer.byteLength(read('blog/glosario.css')) < 11000);
  assert.ok(Buffer.byteLength(read('blog/glosario.js')) < 2000);
  assert.equal((glossary.match(/<img\b/g) || []).length, 1, 'Only the existing wordmark');
  assert.doesNotMatch(glossary, /<video|<canvas|<iframe/);
  const css = read('blog/glosario.css');
  assert.doesNotMatch(css, /@import|url\(/);
  assert.match(css, /position:sticky/);
  assert.match(css, /@media\(max-width:959px\)/);
  assert.match(css, /\.glossary-directory\{position:static/);
});

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
  assert.match(pilot, /glosario\.html\?from=ventaja&amp;at=marca#marca/);
  assert.match(pilot, /glosario\.html\?from=ventaja&amp;at=promesa-de-marca#promesa-de-marca/);
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
  assert.deepEqual(scripts, ['/blog/glosario.js?v=return-1', '/app.js', '/blog/blog.js', '/_vercel/insights/script.js']);
});

const { resolveReading } = require('../blog/glosario.js');
const attribute = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
const sources = [...glossary.matchAll(/<a\b[^>]*data-reading-source="[^"]+"[^>]*>([^<]+)<\/a>/g)].map(([tag, title]) => ({
  key: attribute(tag, 'data-reading-source'), number: attribute(tag, 'data-reading-number'),
  terms: attribute(tag, 'data-reading-terms').split(/\s+/), href: attribute(tag, 'href'), title
}));

test('each glossary origin returns to the exact source term and registry covers all articles', () => {
  assert.ok(sources.length >= 3);
  for (const source of sources) {
    const html = read(source.href.slice(1));
    const links = [...html.matchAll(/<a\b[^>]*class="glossary-link"[^>]*>/g)].map(x => x[0]);
    assert.ok(links.length >= 1);
    const seen = [];
    for (const link of links) {
      const url = new URL(attribute(link, 'href').replaceAll('&amp;', '&'), 'https://www.donventas.mx');
      const at = url.searchParams.get('at');
      assert.equal(url.searchParams.get('from'), source.key);
      assert.equal(url.hash, '#' + at);
      assert.ok(ids.has(at));
      assert.equal(attribute(link, 'id'), 'termino-' + at);
      assert.equal((html.match(new RegExp(`id="termino-${at}"`, 'g')) || []).length, 1);
      const resolved = resolveReading(url.search, sources);
      assert.equal(resolved.href, source.href + '#termino-' + at);
      seen.push(at);
    }
    assert.deepEqual(seen.sort(), [...source.terms].sort());
    assert.equal(seen.length, new Set(seen).size);
  }
  for (const file of blogs.filter(f => !['index.html', 'glosario.html'].includes(f))) {
    if (read('blog/' + file).includes('class="glossary-link"')) {
      assert.ok(sources.some(s => s.href === '/blog/' + file), `Register glossary returns for ${file}`);
    }
  }
});

test('the same term in two articles and multiple tabs retains its own origin', () => {
  const first = resolveReading('?from=fundacional&at=marca', sources);
  const second = resolveReading('?from=ventaja&at=marca', sources);
  assert.notEqual(first.href, second.href);
  assert.equal(first.href, '/blog/por-que-nacio-don-ventas.html#termino-marca');
  assert.equal(second.href, '/blog/tu-marca-es-tu-ventaja.html#termino-marca');
  assert.deepEqual(resolveReading('?from=fundacional&at=marca', sources), first);
  assert.equal((glossary.match(/data-reading-return/g) || []).length, entries.length);
});

test('direct, invalid and adversarial origins never produce an arbitrary return URL', () => {
  for (const query of ['', '?from=ventaja', '?from=unknown&at=marca', '?from=ventaja&at=campana',
    '?from=https://evil.example&at=marca', '?from=//evil.example&at=marca',
    '?from=javascript:alert(1)&at=marca', '?from=ventaja&at=../marca',
    '?from=ventaja&from=fundacional&at=marca', '?from=ventaja&at=marca&at=campana']) {
    assert.equal(resolveReading(query, sources), null, query);
  }
  const script = read('blog/glosario.js');
  assert.doesNotMatch(script, /document\.referrer|localStorage|sessionStorage|document\.cookie|innerHTML|fetch\(/);
  assert.match(glossary, /href="#lecturas" data-reading-return/);
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
