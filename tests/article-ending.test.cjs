'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const catalog = require('../lib/article-comments/catalog.cjs');
for (const {id} of Object.values(catalog)) {
  test('one contextual action followed by independent conversation: ' + id, () => {
    const html = fs.readFileSync(path.join(__dirname, '../blog', id + '.html'), 'utf8');
    assert.equal((html.match(/class="article-ending"/g) || []).length, 1);
    const ending = html.split('id="siguiente-paso">')[1].split('</noscript></div>')[0];
    assert.equal((ending.match(/class="btn solid/g) || []).length, 1);
    assert.match(ending, /data-next-step="diagnosis"/);
    assert.match(ending, /href="\/diagnostico\.html/);
    assert.ok(ending.indexOf('data-next-step') < ending.indexOf('data-article-comments'));
    assert.doesNotMatch(ending, /<form|href="\/branding\.html|checkout|Comprar/);
    assert.ok(html.indexOf('id="siguiente-paso"') < html.indexOf('<aside class="related-reading'));
    assert.doesNotMatch(html.match(/<div class="nav-cta">[\s\S]*?<\/div>/)[0], /btn solid/);
    assert.equal((html.match(/id="comenta-conmigo"/g) || []).length, 1);
  });
}
test('conversation is collapsed, opt-in is optional and it never reorders the document after load', () => {
  const js = fs.readFileSync(path.join(__dirname, '../blog/article-comments.js'), 'utf8');
  assert.match(js, /<details class="comment-details"><summary>Comentar con Arturo/);
  assert.doesNotMatch(js, /insertBefore|appendChild/);
  assert.doesNotMatch(js, /type="checkbox"[^>]*checked|type="checkbox"[^>]*required/);
  assert.match(js, /Enviar un comentario no te suscribe/);
});
