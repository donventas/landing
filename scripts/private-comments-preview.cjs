'use strict';
// Simulation only, loopback only. No network mailer, no cloud database, no credentials.
const http = require('node:http'), fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { createHandler } = require('../lib/article-comments/service.cjs');
const { LocalStore } = require('../lib/article-comments/local-store.cjs');
const { dispatchOne, simulatedMailer } = require('../lib/article-comments/delivery.cjs');
const root = path.resolve(__dirname, '..');
function unpackLegal(html) {
  const match = html.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/);
  // Render the existing document in this strict-CSP fixture without executing its unpacker.
  return match ? JSON.parse(match[1]).replace(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/g, '') : html;
}
function createPreview({ store = new LocalStore(), failFirst = false, secret = crypto.randomBytes(32).toString('hex') } = {}) {
  let failed = false;
  const mailer = simulatedMailer();
  const server = http.createServer(async (req, res) => {
    const origin = 'http://127.0.0.1:' + server.address().port;
    res.setHeader('X-Robots-Tag', 'noindex, nofollow'); res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
    if (req.headers.host !== new URL(origin).host) { res.writeHead(403); return res.end(); }
    const url = new URL(req.url, origin);
    if (url.pathname === '/api/article-message') {
      if (failFirst && !failed && req.method === 'POST') { failed = true; req.resume(); res.writeHead(503, { 'Content-Type': 'application/json' }); return res.end('{"ok":false,"code":"unavailable"}'); }
      return createHandler({ store, origin, secret, mode: 'simulation' })(req, res);
    }
    // No accidental diagnostic or commercial traffic from the isolated preview.
    if (url.pathname.startsWith('/api/')) { req.resume(); res.writeHead(503); return res.end('Disabled in private comment QA'); }
    if (url.pathname.startsWith('/_vercel/')) { res.setHeader('Content-Type', 'application/javascript'); return res.end(''); }
    if (!['GET', 'HEAD'].includes(req.method)) { req.resume(); res.writeHead(405); return res.end(); }
    try {
      const decoded = decodeURIComponent(url.pathname);
      if (decoded.includes('\\') || decoded.includes('\0') || decoded.split('/').some(p => p.startsWith('.'))) throw Error();
      const rel = decoded.replace(/^\//, '') || 'index.html';
      if (/^(lib|api|scripts|supabase|tests)(\/|$)/.test(rel)) throw Error();
      const file = path.resolve(root, rel.endsWith('/') ? rel + 'index.html' : rel);
      if (!file.startsWith(root + path.sep)) throw Error();
      const mime = { '.html':'text/html; charset=utf-8', '.js':'application/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.webp':'image/webp', '.jpg':'image/jpeg', '.png':'image/png', '.woff2':'font/woff2' }[path.extname(file)];
      if (!mime || !fs.statSync(file).isFile()) throw Error();
      res.setHeader('Content-Type', mime); let bytes = fs.readFileSync(file);
      if (rel.startsWith('15_LEGAL/') && path.extname(file) === '.html') bytes = Buffer.from(unpackLegal(bytes.toString('utf8')));
      res.setHeader('Content-Length', bytes.length); res.end(req.method === 'HEAD' ? undefined : bytes);
    } catch { res.writeHead(404); res.end('Not found'); }
  });
  server.requestTimeout = 15000; server.headersTimeout = 10000;
  let draining = false;
  const timer = setInterval(async () => { if (draining) return; draining = true; try { await store.purge(Date.now()); await dispatchOne(store, mailer, { to: 'qa@example.test', from: 'Don Ventas <arturo.villagomez@donventas.mx>' }); } catch { /* No payload logging. */ } finally { draining = false; } }, 2000);
  timer.unref(); server.on('close', () => clearInterval(timer));
  return server;
}
module.exports = { createPreview, unpackLegal };
if (require.main === module) {
  const data = path.join(root, '.private-comments', 'simulation.json');
  const failureTest = process.argv.includes('--fail-first');
  const port = failureTest ? 8796 : 8795;
  fs.mkdirSync(path.dirname(data), { recursive: true });
  const secretFile = path.join(root, '.private-comments', 'simulation.secret');
  if (!fs.existsSync(secretFile)) fs.writeFileSync(secretFile, crypto.randomBytes(32).toString('hex'), { flag: 'wx', mode: 0o600 });
  const server = createPreview({ store: new LocalStore(failureTest ? null : data), failFirst: failureTest, secret: fs.readFileSync(secretFile, 'utf8') });
  server.listen(port, '127.0.0.1', () => console.log('SIMULATION ONLY http://127.0.0.1:'+port+'/blog/contenido-que-atrae-clientes.html#comenta-conmigo'));
}
