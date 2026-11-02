'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('former variant page URLs redirect to the corresponding official page', () => {
  const {redirects} = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  for (const variant of ['a', 'b']) {
    for (const suffix of ['', '/', '/index.html']) {
      const rule = redirects.find(item => item.source === `/variantes/${variant}${suffix}`);
      assert.deepEqual(rule, {source: `/variantes/${variant}${suffix}`, destination: '/', permanent: true});
    }
    for (const suffix of ['', '/', '/index.html']) {
      const source = `/variantes/${variant}/vuelta-27${suffix}`;
      assert.deepEqual(redirects.find(item => item.source === source), {source, destination: '/portafolio/vuelta-27/', permanent: true});
    }
  }
});

test('official landing points both video and fallback to the corrected editorial asset', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const asset = '/assets/portal-launch/bici-story/video-base/delivery/vuelta-27-editorial-b.mp4';
  assert.equal(html.split(asset).length - 1, 2);
  assert.ok(fs.existsSync('.' + asset));
});
