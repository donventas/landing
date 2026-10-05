// Local-only, deliberately mocked lead endpoint. Never deploy this server.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2'};
http.createServer((req,res)=>{
  const url = new URL(req.url,'http://127.0.0.1');
  if(url.pathname==='/__qa') {
    const width = [320,390,768,1280].includes(Number(url.searchParams.get('width'))) ? Number(url.searchParams.get('width')) : 390;
    res.setHeader('Content-Type','text/html; charset=utf-8');
    return res.end('<!doctype html><html lang="es"><meta name="viewport" content="width=device-width"><title>QA local de analítica</title><style>body{margin:0;background:#ddd}iframe{display:block;border:0;width:'+width+'px;height:844px}p{font:14px system-ui;margin:8px}</style><p>QA local · '+width+' px · API simulada · sin datos enviados a Google</p><iframe title="Sitio en viewport de prueba" src="/blog/tu-marca-es-tu-ventaja.html"></iframe></html>');
  }
  if(url.pathname==='/api/lead' && req.method==='POST') {
    req.resume(); res.setHeader('Content-Type','application/json');
    return res.end(JSON.stringify({ok:true,qa:true}));
  }
  let filename;
  try { filename=path.resolve(root,'.'+decodeURIComponent(url.pathname)); } catch { res.writeHead(400);return res.end(); }
  if(!filename.startsWith(root+path.sep)&&filename!==root || /[\\/]\./.test(filename.slice(root.length))) {res.writeHead(403);return res.end();}
  if(fs.existsSync(filename)&&fs.statSync(filename).isDirectory())filename=path.join(filename,'index.html');
  fs.readFile(filename,(error,body)=>{
    if(error){res.writeHead(404);return res.end();}
    res.setHeader('Content-Type',types[path.extname(filename)]||'application/octet-stream');
    res.setHeader('X-Robots-Tag','noindex');res.end(body);
  });
}).listen(8785,'127.0.0.1',()=>console.log('QA local: http://127.0.0.1:8785/__qa?width=390 (API mocked)'));
