// Local-only, deliberately mocked lead endpoint. Never deploy this server.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
// Explicit local-only opt-in. Public previews and the deployed analytics.js stay dry.
const googleDebug = process.argv.includes('--google-debug');
const failFirst = process.argv.includes('--fail-first');
const health = process.argv.includes('--health');
const csp = process.argv.includes('--csp');
let leadAttempts = 0;
const port = googleDebug ? 8786 : 8785;
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2'};
http.createServer((req,res)=>{
  const url = new URL(req.url,'http://127.0.0.1');
  // The dry-run viewer must never claim that Google is disabled in live debug.
  if (googleDebug && (url.pathname === '/__qa' || url.pathname === '/__qa-events.js')) {
    res.writeHead(404); return res.end('Use the page directly for Google debug; the dry-run viewer is disabled.');
  }
  if(url.pathname==='/__qa') {
    const width = [320,390,768,1280].includes(Number(url.searchParams.get('width'))) ? Number(url.searchParams.get('width')) : 390;
    const campaign = url.searchParams.get('campaign') === '1' ? '?utm_source=instagram&amp;utm_medium=social&amp;utm_campaign=tu-marca-es-tu-ventaja&amp;utm_content=historia' : '';
    const page = url.searchParams.get('page') === 'landing' ? '/' : '/blog/tu-marca-es-tu-ventaja.html';
    res.setHeader('Content-Type','text/html; charset=utf-8');
    return res.end('<!doctype html><html lang="es"><meta name="viewport" content="width=device-width"><title>QA local de analítica</title><style>body{margin:0;background:#ddd}iframe{display:block;border:0;width:'+width+'px;height:844px}p{font:14px system-ui;margin:8px}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style><p>QA local · '+width+' px · API simulada · sin datos enviados a Google</p><script src="/__qa-events.js" defer></script><iframe title="Sitio en viewport de prueba" src="'+page+campaign+'"></iframe><h2>Eventos simulados (máximo 30)</h2><pre id="events">Esperando consentimiento</pre></html>');
  }
  if(url.pathname==='/__qa-events.js') {
    res.setHeader('Content-Type','text/javascript');
    return res.end("const frame=document.querySelector('iframe');function bind(){const d=frame.contentDocument;function show(){document.querySelector('#events').textContent=JSON.stringify(frame.contentWindow.DVAnalytics?.records||[],null,2);}d.addEventListener('dv:analytics-preview',show);show();}frame.addEventListener('load',bind);if(frame.contentDocument?.readyState==='complete')bind();");
  }
  if(url.pathname==='/api/lead' && req.method==='POST') {
    req.resume(); res.setHeader('Content-Type','application/json');
    leadAttempts++;
    if (failFirst && leadAttempts === 1) {
      res.writeHead(503); return res.end(JSON.stringify({ok:false,code:'qa_temporary_failure'}));
    }
    return res.end(JSON.stringify({ok:true,qa:true}));
  }
  let filename;
  try { filename=path.resolve(root,'.'+decodeURIComponent(url.pathname)); } catch { res.writeHead(400);return res.end(); }
  if(!filename.startsWith(root+path.sep)&&filename!==root || /[\\/]\./.test(filename.slice(root.length))) {res.writeHead(403);return res.end();}
  if(fs.existsSync(filename)&&fs.statSync(filename).isDirectory())filename=path.join(filename,'index.html');
  fs.readFile(filename,(error,body)=>{
    if(error){res.writeHead(404);return res.end();}
    if (health && path.extname(filename) === '.html') {
      body = Buffer.from(body.toString('utf8').replace('<head>', '<head><script src="/scripts/analytics-qa-health.js"></script>'));
    }
    if (csp && path.extname(filename) === '.html') {
      const config = JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
      const route = url.pathname.startsWith('/blog/') ? '/blog/(.*)' : url.pathname;
      const rule = config.headers.find(item=>item.source===route);
      const policy = rule && rule.headers.find(item=>item.key==='Content-Security-Policy');
      if (!policy) {res.writeHead(500);return res.end('No matching production CSP: refusing unprotected QA.');}
      res.setHeader('Content-Security-Policy', policy.value);
    }
    if (googleDebug && url.pathname === '/analytics.js') {
      const original = body.toString('utf8');
      const replacements = [
        ["production = root.location.hostname === 'www.donventas.mx' && root.location.protocol === 'https:'", "production = root.location.hostname === 'localhost' && root.location.port === '8786'"],
        ["allow_google_signals: false, allow_ad_personalization_signals: false,", "debug_mode: true, traffic_type: 'developer', allow_google_signals: false, allow_ad_personalization_signals: false,"],
        ["clean.send_to = ID;", "clean.send_to = ID; clean.debug_mode = true; clean.traffic_type = 'developer';"],
        ["if (preview) status.textContent = 'Vista previa · no se envían datos a Google.';", "status.textContent = 'QA LOCAL: Google real solo después del permiso; eventos de depuración, no clientes.';"]
      ];
      let transformed = original;
      for (const [from,to] of replacements) {
        if (transformed.split(from).length !== 2) {res.writeHead(500);return res.end('QA substitution mismatch; refusing to enable Google.');}
        transformed = transformed.replace(from,to);
      }
      body = Buffer.from(transformed);
    }
    res.setHeader('Content-Type',types[path.extname(filename)]||'application/octet-stream');
    res.setHeader('X-Robots-Tag','noindex');res.end(body);
  });
}).listen(port,'127.0.0.1',()=>console.log(googleDebug
  ? 'QA GOOGLE DEBUG: http://localhost:8786/ (Google real after consent; API mocked; connect GTM draft with Tag Assistant)'
  : 'QA local: http://127.0.0.1:8785/__qa?width=390 (API mocked)'));
