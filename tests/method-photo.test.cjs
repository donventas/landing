const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {createServer} = require('../scripts/editorial-qa-server.cjs');
const root = path.resolve(__dirname, '..');
// Exact approved delivery derivatives, verified against Runtime commit
// afee147450d102f73e55c7a3b0044f459955023f. Tests alone do not authorize deployment.
const assets = [
  [480, 360, 31172, '970f7be14d19261f0e09319aa1839ea44d95c9386f5dc01c5e2189b3fff579a2'],
  [960, 720, 70750, 'a4c09ff8f1646dd9ffee98fa87de803727ff191ae9723a6e12602c704f7bffd5'],
  [1448, 1086, 111620, '52dfcf2f5a28775944ab08dc8998d7974fa616f51f80ff55eab17d8693d6e715']
];
const assetPath = width => `assets/editorial/criterio-metodo-01-06-v2-${width}.webp`;

test('method photograph consumes the exact supplied WebPs and keeps responsive attributes', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const img = html.match(/<img[^>]+criterio-metodo-01-06-v2[^>]+>/)[0];
  assert.match(img, /src="assets\/editorial\/criterio-metodo-01-06-v2-960.webp"/);
  assert.match(img, /width="960" height="720" loading="lazy" decoding="async"/);
  assert.ok(img.includes('sizes="(max-width: 620px) calc(100vw - 32px), (max-width: 820px) calc(100vw - 40px), 56vw"'));
  for (const [width, height, size, hash] of assets) {
    assert.equal(width / height, 4 / 3);
    assert.ok(img.includes(`${assetPath(width)} ${width}w`));
    const bytes = fs.readFileSync(path.join(root, assetPath(width)));
    assert.equal(bytes.length, size);
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), hash);
  }
});

test('method assets download intact with versioned immutable cache policy in local fixture', async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    for (const [width, , , hash] of assets) {
      const url = origin + '/' + assetPath(width);
      const response = await fetch(url);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), 'image/webp');
      assert.equal(response.headers.get('cache-control'), 'public, max-age=31536000, immutable');
      assert.equal(crypto.createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex'), hash);
      const repeat = await fetch(url, {headers: {'If-None-Match': response.headers.get('etag')}});
      assert.equal(repeat.status, 304);
    }
  } finally { await new Promise(resolve => server.close(resolve)); }
});
