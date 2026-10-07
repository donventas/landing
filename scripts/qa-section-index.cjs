// Local-only browser QA. Requests to third parties are blocked; no submissions.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {createServer}=require('./editorial-qa-server.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.qa-manual');
const pages=['index.html','branding.html','arturo-villagomez.html','blog/index.html','blog/por-que-nacio-don-ventas.html','blog/tu-marca-es-tu-ventaja.html','blog/contenido-que-atrae-clientes.html','blog/manual-de-marca.html',...['Centro Legal','Aviso de Privacidad','Terminos y Condiciones','Politica de Cookies'].map(f=>'15_LEGAL/'+f+'.html')];
const report={layouts:[],anchors:[],preservation:[],fallback:[],errors:[],notes:[]};
const baseline='0a46bc5d5c4ad5c5eca87c76630f36d64399529e';
function unpack(h){const m=h.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/);return m?JSON.parse(m[1]):h;}
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'chrome',headless:true});
 async function context(opts={}){const c=await browser.newContext({reducedMotion:'reduce',...opts});await c.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());c.on('page',p=>p.on('pageerror',e=>report.errors.push(e.message)));return c;}
 try{
  const pc=await context(),pp=await pc.newPage();await pp.goto(origin+'/');
  for(const file of pages){
   const before=unpack(execFileSync('git',['-c','safe.directory='+root.replaceAll('\\','/'),'show',baseline+':'+file],{cwd:root,encoding:'utf8',maxBuffer:10e6}));
   const after=unpack(fs.readFileSync(path.join(root,file),'utf8'));
   const data=await pp.evaluate(([before,after])=>{
    function inspect(h){const d=new DOMParser().parseFromString(h,'text/html');
     const seo=[...d.querySelectorAll('title,meta,link[rel="canonical"],script[type="application/ld+json"]')].map(e=>e.outerHTML);
     const forms=[...d.querySelectorAll('form')].map(e=>e.outerHTML);
     const assets=[...d.querySelectorAll('img,source')].map(e=>e.outerHTML);
     const ids=[...d.querySelectorAll('[id]')].map(e=>e.id);
     d.querySelectorAll('.section-index,.manual-index,.article-toc,.brand-chapters,script,style').forEach(e=>e.remove());
     return {seo,forms,assets,ids,text:d.body.textContent.replace(/\s+/g,' ').trim()};}
    return [inspect(before),inspect(after)];
   },[before,after]);
   for(const key of ['seo','forms','assets','text'])assert.deepEqual(data[1][key],data[0][key],file+' changed '+key);
   assert.ok(data[0].ids.every(id=>data[1].ids.includes(id)),file+' lost old anchor');
   report.preservation.push({file,copy:true,seo:true,forms:true,assets:true,oldAnchors:true});
  }await pc.close();
  for(const width of [320,390,768,1440]){
   const c=await context({viewport:{width,height:900}}),p=await c.newPage();
   for(const file of pages){
    await p.goto(origin+'/'+file);await p.locator('[data-section-index]').waitFor();await p.waitForFunction(()=>document.body.classList.contains('section-index-enhanced'));await p.evaluate(()=>document.fonts.ready);
    const reject=p.locator('[data-analytics-choice="rejected"]');if(await reject.isVisible())await reject.click();
    const overflow=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert.ok(overflow<=1,file+' overflow '+width+' '+overflow);
    const ids=await p.locator('[data-section-index] a').evaluateAll(es=>es.map(e=>e.hash.slice(1)));
    for(const id of ids){
     const summary=p.locator('[data-section-index] summary');await summary.focus();await p.keyboard.press('Enter');
     const a=p.locator('[data-section-index] a[href="#'+id+'"]');await a.focus();await p.keyboard.press('Enter');await p.waitForFunction(id=>{const s=document.getElementById(id),h=s.matches('h1,h2,h3')?s:s.querySelector('h2,h3');return document.activeElement===h;},id);await p.waitForTimeout(80);
     const info=await p.evaluate(id=>{const target=document.getElementById(id),title=target.matches('h1,h2,h3')?target:target.querySelector('h2,h3'),bar=document.querySelector('.section-index');return {hash:decodeURIComponent(location.hash),open:document.querySelector('[data-section-index]').open,focused:document.activeElement===title,top:title?.getBoundingClientRect().top,bottom:title?.getBoundingClientRect().bottom,barBottom:bar.getBoundingClientRect().bottom,active:document.querySelectorAll('[data-section-index] [aria-current]').length};},id);
     assert.equal(info.hash,'#'+id,file);assert.equal(info.open,false);assert.ok(info.focused,file+' focus '+id);assert.ok(info.top>=info.barBottom-2&&info.top<900,file+' obscured '+id+' '+width+' '+JSON.stringify(info));assert.ok(info.active<=1);
     report.anchors.push({file,width,id,...info});
    }
    await p.locator('[data-section-index] summary').focus();await p.keyboard.press('Enter');await p.keyboard.press('Escape');assert.equal(await p.locator('[data-section-index]').getAttribute('open'),null);assert.equal(await p.locator('[data-section-index] summary').evaluate(e=>e===document.activeElement),true);
    await p.keyboard.press('Enter');await p.locator('h1').dispatchEvent('click');assert.equal(await p.locator('[data-section-index]').getAttribute('open'),null);
    if([390,1440].includes(width)){
     await p.locator('[data-section-index] summary').scrollIntoViewIfNeeded();await p.locator('[data-section-index] summary').click();
     await p.screenshot({path:path.join(out,'index-'+file.replace(/[^a-z0-9]/gi,'-')+'-'+width+'.png')});
    }
    report.layouts.push({file,width,overflow,escape:true,outside:true});console.log('PASS',width,file);
   }await c.close();
  }
  for(const file of pages.filter(f=>!f.startsWith('15_LEGAL/')||f.includes('Cookies'))){
   const c=await context({viewport:{width:390,height:900},javaScriptEnabled:false}),p=await c.newPage();await p.goto(origin+'/'+file);
   const index=p.locator('.section-index');assert.equal(await index.evaluate(e=>getComputedStyle(e).position),'relative');await index.locator('summary').click();
   const hashes=await index.locator('a').evaluateAll(es=>es.map(e=>e.hash));
   for(const hash of hashes){await index.locator('a[href="'+hash+'"]').click();assert.ok(p.url().endsWith(hash));
    const visible=await p.evaluate(hash=>{const target=document.getElementById(hash.slice(1)),title=target.matches('h1,h2,h3')?target:target.querySelector('h2,h3'),header=document.querySelector('.nav,.editorial-nav');return title.getBoundingClientRect().top>=(header?header.getBoundingClientRect().bottom:0)-2;},hash);assert.ok(visible,'No-JS heading under header '+file+' '+hash);}
   assert.equal(await index.locator('nav').evaluate(e=>getComputedStyle(e).position),'static');report.fallback.push(file);await c.close();
  }
  // New native anchors survive a fresh load; long menus remain usable on short screens.
  for(const [file,hash] of [['index.html','#ideas-title'],['arturo-villagomez.html','#trabajo-title'],['blog/index.html','#carta-title'],['15_LEGAL/Terminos y Condiciones.html','#legal-06']]){
   const c=await context({viewport:{width:390,height:568}}),p=await c.newPage();await p.goto(origin+'/'+file+hash);await p.waitForFunction(()=>document.body.classList.contains('section-index-enhanced'));await p.waitForTimeout(150);
   const reject=p.locator('[data-analytics-choice="rejected"]');if(await reject.isVisible())await reject.click();
   const top=await p.locator(hash).evaluate(e=>e.getBoundingClientRect().top),bottom=await p.locator('.section-index').evaluate(e=>e.getBoundingClientRect().bottom);assert.ok(top>=bottom-2&&top<568,'Fresh hash '+file);
   const summary=p.locator('[data-section-index] summary');await summary.click();const last=p.locator('[data-section-index] a').last();await last.focus();
   assert.ok(await last.evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight),'Short screen '+file);await p.keyboard.press('Escape');
   const menu=p.locator('.mobile-explore');if(await menu.count()){
    await summary.click();await menu.locator('summary').click();assert.equal(await p.locator('[data-section-index]').getAttribute('open'),null);
    await menu.locator('summary').click();await summary.click();assert.equal(await menu.getAttribute('open'),null);
   }
   report.notes.push('Fresh hash, short screen and applicable mobile menu: '+file);await c.close();
  }
  assert.deepEqual(report.errors,[]);report.status='PASS';
 }catch(e){report.status='FAIL';report.failure=e.stack;throw e;}
 finally{fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'section-index-report.json'),JSON.stringify(report,null,2));await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
