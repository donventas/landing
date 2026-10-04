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
