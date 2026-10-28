const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
test('Vuelta 27 has a canonical URL, a specific share image, and clear fictional context', () => {
  const page = read('portafolio/vuelta-27/index.html');
  const image = 'https://www.donventas.mx/assets/portal-launch/bici-story/video-base/assets/naturalidad-p04/fachada-noche-p05.png';
  assert.match(page, /rel="canonical" href="https:\/\/www\.donventas\.mx\/portafolio\/vuelta-27\/"/);
  assert.ok(page.includes(`property="og:image" content="${image}"`));
  assert.ok(page.includes(`name="twitter:image" content="${image}"`));
  assert.match(page, /marca ficticia/);
  assert.ok(fs.statSync(path.join(root, 'assets/portal-launch/bici-story/video-base/assets/naturalidad-p04/fachada-noche-p05.png')).size > 1000);
});
test('public discovery references describe the current homepage and fictional demo', () => {
  const sitemap = read('sitemap.xml'), info = read('llms.txt');
  assert.ok(sitemap.includes('<loc>https://www.donventas.mx/portafolio/vuelta-27/</loc>'));
  assert.match(info, /Vuelta 27[^\n]*marca ficticia/);
  assert.match(info, /Unirme a la waitlist/);
});
