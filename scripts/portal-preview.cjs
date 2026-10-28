'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {createHandler}=require('../lib/portal-intake/service.cjs');
const {createSubscriptionHandler}=require('../lib/portal-intake/subscription.cjs');
const {PortalStore}=require('../lib/portal-intake/supabase-store.cjs');
const root=path.resolve(__dirname,'..'),port=Number(process.argv[2]||8021),origin=`http://127.0.0.1:${port}`;
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('invalid_port');
let configuration={mode:'simulation',origin};
if(process.env.PORTAL_LOCAL_TEST==='1'){
 const testEmail=process.env.PORTAL_TEST_EMAIL?.trim().toLowerCase(),secret=process.env.PORTAL_HASH_SECRET;
 if(!testEmail||!secret||secret.length<32)throw Error('explicit_test_configuration_required');
 configuration={mode:'test',origin,testEmail,secret,clientAddress:req=>['127.0.0.1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress)?req.socket.remoteAddress:null,store:new PortalStore({url:process.env.PORTAL_SUPABASE_URL,key:process.env.PORTAL_INTAKE_KEY,anonJwt:process.env.PORTAL_ANON_JWT})};
}
const handler=createHandler(configuration),subscription=createSubscriptionHandler(configuration);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.vtt':'text/vtt','.woff2':'font/woff2','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{
 res.setHeader('X-Robots-Tag','noindex, nofollow');
 const url=new URL(req.url,origin);
 if(url.pathname==='/api/portal-intake')return handler(req,res);
 if(url.pathname==='/api/portal-subscription')return subscription(req,res);
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
 let pathname;try{pathname=decodeURIComponent(url.pathname);}catch{res.writeHead(400);return res.end();}
 if(pathname==='/'||pathname==='/portafolio/vuelta-27/')pathname+='index.html';
 if(!/^\/(?:index\.html|portafolio\/vuelta-27\/index\.html|suscripcion\.html|subscription\.js|styles\.css|blog\/article-comments\.css|assets\/|analytics\.(?:css|js)|appearance(?:-families)?\.(?:css|js)|translation\.(?:css|js)|section-index\.(?:css|js)|favicon)/.test(pathname)){res.writeHead(404);return res.end('Solo se sirven las dos páginas del preview y sus recursos.');}
 const target=path.resolve(root,'.'+pathname),rel=path.relative(root,target);
 if(rel.startsWith('..')||path.isAbsolute(rel)){res.writeHead(403);return res.end();}
 try{const real=fs.realpathSync(target),r=path.relative(root,real);if(r.startsWith('..')||path.isAbsolute(r))throw Error();const stat=fs.statSync(real);if(!stat.isFile())throw Error();res.setHeader('Content-Type',mime[path.extname(real)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.setHeader('Content-Length',stat.size);if(req.method==='HEAD')return res.end();fs.createReadStream(real).pipe(res);}catch{res.writeHead(404);res.end('No encontrado');}
}).listen(port,'127.0.0.1',()=>console.log(`Preview ${configuration.mode}: ${origin}`));
