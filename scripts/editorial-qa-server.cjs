// Loopback-only rendering/performance fixture. No real leads or Google events.
// --baseline serves the pre-alignment revision for matched comparisons after commits.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const baselineRef='c13f0dc04f87680ae72501f5fadc2bd8434247aa';
function createServer(baseline=false){
 const cache=new Map();
 function bytes(file){
  if(baseline&&/\.(html|css|js|json|txt|xml)$/.test(file)){
   if(!cache.has(file))cache.set(file,cp.execFileSync('git',['-c','safe.directory='+root.replace(/\\/g,'/'),'show',baselineRef+':'+file],{cwd:root,maxBuffer:10*1024*1024}));
   return cache.get(file);
  }return fs.readFileSync(path.join(root,file));
 }
 const config=JSON.parse(bytes('vercel.json'));
 return http.createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');res.setHeader('X-Robots-Tag','noindex');
  if(url.pathname==='/api/lead'){res.writeHead(200,{'Content-Type':'application/json'});req.resume();return res.end('{"ok":true,"qa":true}');}
  if(url.pathname.startsWith('/_vercel/')){res.writeHead(200,{'Content-Type':'application/javascript'});return res.end();}
  try{
   const abs=path.resolve(root,'.'+decodeURIComponent(url.pathname));
   if(!abs.startsWith(root+path.sep)&&abs!==root)throw Error('outside');
   let file=path.relative(root,abs).replace(/\\/g,'/');
   if(!file||file.endsWith('/')||fs.statSync(abs).isDirectory())file+=(file&&!file.endsWith('/')?'/':'')+'index.html';
   if(file.split('/').some(part=>part.startsWith('.')))throw Error('private');
   const ext=path.extname(file);let body=bytes(file);
   // Mirror declared deployment headers. An existing HTML file without a
   // route-specific CSP (e.g. the cookies policy) must not become a false 404.
   for(const rule of config.headers){
    const pattern=rule.source.split('(.*)').map(part=>part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*');
    if(new RegExp('^'+pattern+'$').test(url.pathname)){
     for(const header of rule.headers)res.setHeader(header.key,header.value);
    }
   }
   res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain'})[ext]||'application/octet-stream');
   res.setHeader('Vary','Accept-Encoding');
   if(/gzip/.test(req.headers['accept-encoding']||'')){body=zlib.gzipSync(body);res.setHeader('Content-Encoding','gzip');}
   const etag='"'+crypto.createHash('sha256').update(body).digest('hex')+'"';res.setHeader('ETag',etag);
   if(req.headers['if-none-match']===etag){res.writeHead(304);return res.end();}
   if(req.method==='HEAD')return res.end();
   res.end(body);
  }catch{res.writeHead(404);res.end('Not found in local QA fixture');}
 });
}
module.exports={createServer};
if(require.main===module){const baseline=process.argv.includes('--baseline'),port=Number(process.env.PORT)||(baseline?8789:8788);createServer(baseline).listen(port,'127.0.0.1',()=>console.log('Local QA '+(baseline?baselineRef:'candidate')+': http://127.0.0.1:'+port));}
