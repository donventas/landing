'use strict';
// Static, loopback-only review. No credentials, database, deliveries or payload logging.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {decode}=require('./appearance-pages.cjs');
const root=path.resolve(__dirname,'..');
function createServer(){const server=http.createServer((req,res)=>{
 const origin='http://127.0.0.1:'+server.address().port;
 res.setHeader('X-Robots-Tag','noindex, nofollow');res.setHeader('Cache-Control','no-store');
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; form-action 'self'; frame-ancestors 'none'");
 if(req.headers.host!==new URL(origin).host){res.writeHead(403);return res.end();}
 const url=new URL(req.url,origin);
 if(url.pathname==='/api/appearance-review'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(require('../api/appearance-review.js').render());}
 if(url.pathname.startsWith('/api/')){req.resume();res.setHeader('Content-Type','application/json');if(url.pathname==='/api/article-message'&&req.method==='GET')return res.end('{"enabled":true,"mode":"simulation","gifts_enabled":false}');res.writeHead(503);return res.end('{"ok":false,"code":"unavailable","preview":true}');}
 if(!['GET','HEAD'].includes(req.method)){req.resume();res.writeHead(405);return res.end();}
 if(url.pathname==='/analytics.js'||url.pathname.startsWith('/_vercel/')){res.setHeader('Content-Type','application/javascript');return res.end('/* no analytics in review */');}
 try{let rel=decodeURIComponent(url.pathname).replace(/^\//,'')||'index.html';
 if(rel.includes('\\')||rel.split('/').some(p=>p.startsWith('.'))||/^(api|lib|scripts|tests|supabase|docs|artifacts)\//i.test(rel))throw Error();
 let file=path.resolve(root,rel);if(!file.startsWith(root+path.sep))throw Error();if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.pdf':'application/pdf','.ico':'image/x-icon'}[path.extname(file)];if(!mime)throw Error();
 let bytes=fs.readFileSync(file);if(file.endsWith('.html'))bytes=Buffer.from(decode(bytes.toString()).replace(/<script(?![^>]*\b(?:src=|type="application\/ld\+json"))[^>]*>[\s\S]*?<\/script>/g,''));
 res.setHeader('Content-Type',mime);res.end(req.method==='HEAD'?undefined:bytes);
 }catch{res.writeHead(404);res.end('Not found');}
 });return server;}
module.exports={createServer};
if(require.main===module)createServer().listen(8797,'127.0.0.1',()=>console.log('Isolated review: http://127.0.0.1:8797'));
