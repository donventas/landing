'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { inventory } = require('../scripts/inventory-portal-pilot.cjs');
test('dependency inventory follows assets, deduplicates and excludes private review documents', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dv-inventory-test-'));
  t.after(() => {
    const resolved = fs.realpathSync(root);
    assert.equal(path.dirname(resolved), fs.realpathSync(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith('dv-inventory-test-'));
    fs.rmSync(resolved, { recursive: true });
  });
  fs.writeFileSync(path.join(root, 'index.html'), '<link href="style.css"><img src="photo.svg"><img src="photo.svg"><a href="EDITORIAL.md">internal</a><a href="pruebas-m03.html">proof</a><img src="../private.svg"><a href="#top">top</a>');
  fs.writeFileSync(path.join(root, 'style.css'), 'body{background:url(photo.svg)}');
  fs.writeFileSync(path.join(root, 'photo.svg'), '<svg/>');
  const result = inventory(root, ['index.html']);
  assert.deepEqual(result.files.map(f => f.path), ['index.html','photo.svg','style.css']);
  assert.equal(result.publicationApproved, false);
  assert.equal(result.excluded.filter(f => f.reason === 'internal_review_not_public').length, 2);
  assert.equal(result.excluded.filter(f => f.reason === 'outside_pilot_use_canonical_site_asset').length, 1);
  assert.ok(result.files.every(f => /^[a-f0-9]{64}$/.test(f.sha256)));
});
