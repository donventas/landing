// Local-only review. Blocks third-party requests; never submits a form.
const {chromium}=require('playwright');
const sharp=require('sharp');
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const assert=require('node:assert/strict');
const {createServer}=require('./editorial-qa-server.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.qa-manual');
const baseline='24598ce367bb6239c51486b52e42136a852fa58e';
const names=['por-que-nacio-don-ventas','contenido-que-atrae-clientes','tu-marca-es-tu-ventaja','manual-de-marca'];
const cache=new Map();
function before(file){if(!cache.has(file))cache.set(file,cp.execFileSync('git',['-c','safe.directory='+root.replace(/\\/g,'/'),'show',baseline+':'+file],{cwd:root}));return cache.get(file);}
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const report={baseline,viewports:[],lab:[],errors:[]};fs.mkdirSync(out,{recursive:true});
 async function context(width,mode='candidate'){
  const c=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  await c.route('**/*',r=>{
   const u=new URL(r.request().url());
   if(u.origin!==origin||r.request().method()!=='GET')return r.abort();
   const file=u.pathname.slice(1);
   if(/\.(html|css)$/.test(file))return r.fulfill({status:200,contentType:file.endsWith('.css')?'text/css':'text/html; charset=utf-8',body:mode==='baseline'?before(file):fs.readFileSync(path.join(root,file))});
   return r.continue();
  });return c;
 }
 try{
  for(const width of [320,390,599,601,768,799,801,900,1440]){
   const c=await context(width),p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));
   for(const name of names){
    await p.goto(origin+'/blog/'+name+'.html');await p.evaluate(()=>document.fonts.ready);
    const reject=p.locator('[data-analytics-choice="rejected"]');if(await reject.isVisible())await reject.click();
    // Compare actual DOM text and metadata to the pre-change release.
    const fidelity=await p.evaluate(html=>{
     const old=new DOMParser().parseFromString(html,'text/html');
     const clean=s=>s.replace(/\s/g,'');
     const text=d=>clean(d.querySelector('main').textContent);
     const attrs=d=>[...d.querySelectorAll('main a,main img')].map(e=>[e.tagName,e.getAttribute('href'),e.getAttribute('src'),e.getAttribute('srcset'),e.getAttribute('width'),e.getAttribute('height'),e.getAttribute('alt')]);
     return {text:text(document)===text(old),assetsLinks:JSON.stringify(attrs(document))===JSON.stringify(attrs(old)),head:[...document.querySelectorAll('title,meta,link[rel="canonical"],script[type="application/ld+json"]')].map(e=>e.outerHTML).join('')===[...old.querySelectorAll('title,meta,link[rel="canonical"],script[type="application/ld+json"]')].map(e=>e.outerHTML).join('')};
    },before('blog/'+name+'.html').toString());
    assert.ok(Object.values(fidelity).every(Boolean),JSON.stringify({name,fidelity}));
    await p.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=700){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,20));}scrollTo({top:0,behavior:'instant'});});
    await p.waitForTimeout(80);
    const dimensions=await p.evaluate(()=>({height:document.documentElement.scrollHeight,overflow:document.documentElement.scrollWidth-innerWidth,images:[...document.querySelectorAll('main img')].every(e=>e.complete&&e.naturalWidth>0),ctaHeight:Math.round(document.querySelector('.article-cta').getBoundingClientRect().height)}));
    assert.ok(dimensions.overflow<=1,JSON.stringify({name,width,...dimensions}));assert.ok(dimensions.images,name+' images');
    // Open and close source notes: no content clips or off-screen expansion.
    for(const details of await p.locator('.editorial-detail').all()){
     await details.locator('summary').focus();await p.keyboard.press('Enter');assert.ok(await details.evaluate(e=>e.open));
     assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.keyboard.press('Enter');
    }
    if([390,1440].includes(width)){
     await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
     await sharp(await p.screenshot({fullPage:true})).resize({width:width===390?195:360}).toFile(path.join(out,`rhythm-v2-full-${name}-${width}.png`));
     const ids=name==='tu-marca-es-tu-ventaja'?['familia','promesa','historia']:name==='contenido-que-atrae-clientes'?['entender','ejemplos','diferencia']:name==='por-que-nacio-don-ventas'?['origen','aprendizaje','compartir']:['nuestra-marca','coherencia','a-la-mano'];
     for(const id of ids){
      await p.locator('#'+id).evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-150,behavior:'instant'}));await p.waitForTimeout(50);
      await p.screenshot({path:path.join(out,`rhythm-v2-${name}-${id}-${width}.png`)});
     }
    }
    report.viewports.push({name,width,...dimensions,...fidelity});
   }
   // Shared HUB is intentionally unaffected.
   await p.goto(origin+'/blog/');assert.equal(await p.locator('.reading-rhythm').count(),0);
   await c.close();
  }
  // Paired cold-load laboratory samples: same route interception, network and CPU.
  for(const name of names)for(const mode of ['baseline','candidate']){
   const c=await context(390,mode),p=await c.newPage();
   await p.addInitScript(()=>{
    window.__lab={lcp:0,cls:0};
    new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lab.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
    new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__lab.cls+=e.value;}).observe({type:'layout-shift',buffered:true});
   });
   const client=await c.newCDPSession(p);
   await client.send('Network.enable');await client.send('Network.setCacheDisabled',{cacheDisabled:true});
   await client.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750});
   await client.send('Emulation.setCPUThrottlingRate',{rate:4});
   await p.goto(origin+'/blog/'+name+'.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(2000);
   report.lab.push({name,mode,...await p.evaluate(()=>({...window.__lab,domBytes:new TextEncoder().encode(document.documentElement.outerHTML).length,resourceBytes:performance.getEntriesByType('resource').reduce((n,e)=>n+e.encodedBodySize,0)}))});
   await c.close();
  }
  assert.deepEqual(report.errors,[]);report.pass=true;
 }finally{
  fs.writeFileSync(path.join(out,'rhythm-v2-report.json'),JSON.stringify(report,null,2));
  await browser.close();await new Promise(r=>server.close(r));
 }
 console.log(JSON.stringify({pass:report.pass,viewports:report.viewports.length,lab:report.lab},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
