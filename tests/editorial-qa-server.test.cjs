const test = require('node:test');
const assert = require('node:assert/strict');
const {createServer} = require('../scripts/editorial-qa-server.cjs');

test('analytics detail link serves the existing legal page in local previews', async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    const script = await (await fetch(origin + '/analytics.js')).text();
    const href = script.match(/href="([^"]+)">Cómo usamos la analítica/)[1];
    const response = await fetch(origin + href);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-robots-tag'), 'noindex');
    assert.match(await response.text(), /<h1>Cookies y almacenamiento local<\/h1>/);
    const home = await fetch(origin + '/');
    assert.match(home.headers.get('content-security-policy'), /default-src 'self'/);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
