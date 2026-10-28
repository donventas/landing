'use strict';
// Read-only dependency inventory. A match is not approval to publish a resource.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function inventory(root, entries) {
  root = fs.realpathSync(root);
  const files = new Map(), excluded = [], unresolved = [], external = new Set();
  const portable = p => p.split(path.sep).join('/');
  function visit(relative, from = null) {
    const absolute = path.resolve(root, relative);
    const rel = portable(path.relative(root, absolute));
    if (files.has(rel)) return;
    if (rel.startsWith('../') || path.isAbsolute(rel)) {
      excluded.push({ from, reference: relative, reason: 'outside_pilot_use_canonical_site_asset' });
      return;
    }
    if (/\.md$/i.test(rel) || /(?:^|\/)(?:pruebas-m03|escena-taller)\.html$/i.test(rel)) {
      excluded.push({ from, reference: rel, reason: 'internal_review_not_public' });
      return;
    }
    if (!fs.existsSync(absolute)) {
      unresolved.push({ from, reference: rel, reason: 'missing' });
      return;
    }
    const real = fs.realpathSync(absolute);
    const actual = path.relative(root, real);
    if (actual.startsWith('..') || path.isAbsolute(actual) || !fs.statSync(real).isFile()) {
      unresolved.push({ from, reference: rel, reason: 'not_contained_regular_file' });
      return;
    }
    const bytes = fs.readFileSync(real);
    files.set(rel, { path: rel, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
    const extension = path.extname(real).toLowerCase();
    if (!['.html', '.css', '.js'].includes(extension)) return;
    const text = bytes.toString('utf8');
    const refs = [];
    if (extension === '.html') {
      for (const m of text.matchAll(/\b(?:src|href|poster)\s*=\s*["']([^"']+)["']/gi)) refs.push(m[1]);
      for (const m of text.matchAll(/\bsrcset\s*=\s*["']([^"']+)["']/gi)) {
        refs.push(...m[1].split(',').map(s => s.trim().split(/\s+/)[0]));
      }
    }
    for (const m of text.matchAll(/url\(\s*["']?([^)'"\s]+)["']?\s*\)|@import\s+["']([^"']+)["']/gi)) refs.push(m[1] || m[2]);
    if (extension === '.js') {
      for (const m of text.matchAll(/["'`]([^"'`\n]+\.(?:html|css|js|png|webp|jpg|svg|mp4|vtt)(?:[?#][^"'`\n]*)?)["'`]/gi)) refs.push(m[1]);
    }
    for (const reference of new Set(refs)) {
      if (!reference || reference.startsWith('#') || /^(?:data:|mailto:|tel:|javascript:)/i.test(reference)) continue;
      if (/^(?:https?:)?\/\//i.test(reference)) { external.add(reference); continue; }
      if (reference.includes('${')) { unresolved.push({ from: rel, reference, reason: 'dynamic_reference_review_required' }); continue; }
      if (reference.startsWith('/')) { excluded.push({ from: rel, reference, reason: 'site_root_dependency' }); continue; }
      const clean = decodeURIComponent(reference.split(/[?#]/)[0]);
      if (!clean) continue;
      visit(path.join(path.dirname(rel), clean), rel);
    }
  }
  entries.forEach(entry => visit(entry));
  return { version: 1, publicationApproved: false, entries, files: [...files.values()].sort((a,b) => a.path.localeCompare(b.path)),
    excluded, unresolved, external: [...external].sort(), totalBytes: [...files.values()].reduce((n,f) => n + f.bytes, 0) };
}
if (require.main === module) {
  if (!process.argv[2]) throw Error('source_directory_required');
  process.stdout.write(JSON.stringify(inventory(process.argv[2], ['index-naturalidad.html','bici-story/aplicaciones-naturalidad.html']), null, 2) + '\n');
}
module.exports = { inventory };
