// Browser QA against local fixture only. No real submissions or external analytics.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.qa-manual');
const {createServer}=require('./editorial-qa-server.cjs');
const report={layouts:[],images:[],returns:[],consent:[],performance:[],errors:[],external:[],notes:[]};
const article='/blog/manual-de-marca.html';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'chrome',headless:true});
 async function context(options={}){
  const c=await browser.newContext({reducedMotion:'reduce',...options});
  await c.route('**/*',r=>{
   if(new URL(r.request().url()).origin===origin)return r.continue();
   report.external.push(r.request().url());return r.abort();
  });
  c.on('page',p=>p.on('pageerror',e=>report.errors.push(e.message)));
  return c;
 }
 async function dismiss(p){const b=p.locator('[data-analytics-choice="rejected"]');if(await b.isVisible())await b.click();}
 try{
  for(const width of [390,1440])for(const route of [article,'/','/branding.html'])for(const choice of ['accepted','rejected'])for(const y of [0,1500]){
   const c=await context({viewport:{width,height:900}}),p=await c.newPage();
   await p.goto(origin+route);await p.evaluate(()=>document.fonts.ready);
   await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);await p.waitForTimeout(60);
   const before=await p.evaluate(()=>scrollY);
   await p.locator('[data-analytics-choice="'+choice+'"]').click();await p.waitForTimeout(100);
   const after=await p.evaluate(()=>scrollY);
   assert.ok(Math.abs(after-before)<=1,`Consent scroll ${route} ${width} ${choice}: ${before} -> ${after}`);
   assert.equal(await p.evaluate(()=>document.activeElement.tagName),'MAIN');
   const prefs=p.locator('[data-analytics-settings]');await prefs.scrollIntoViewIfNeeded();await prefs.focus();
   const footerY=await p.evaluate(()=>scrollY);await p.keyboard.press('Enter');
   await p.locator('[data-analytics-choice="rejected"]').focus();await p.keyboard.press('Enter');
   assert.equal(await prefs.evaluate(e=>e===document.activeElement),true);
   assert.ok(Math.abs(await p.evaluate(()=>scrollY)-footerY)<=1);
   report.consent.push({width,route,choice,before,after,openerRestored:true});await c.close();
  }
  for(const width of [320,390,768,900,901,1120,1121,1440]){
   const c=await context({viewport:{width,height:900}}),p=await c.newPage();
   for(const route of [article,'/blog/','/blog/glosario.html','/blog/tu-marca-es-tu-ventaja.html','/arturo-villagomez.html']){
    const response=await p.goto(origin+route);assert.equal(response.status(),200);
    assert.equal(response.headers()['x-robots-tag'],'noindex');
    await p.evaluate(()=>document.fonts.ready);await dismiss(p);
    const overflow=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert.ok(overflow<=1,route+' '+width+' overflow '+overflow);
    assert.equal(await p.locator('main h1').count(),1);
    report.layouts.push({route,width,overflow});
    if(route===article){
     const hero=p.locator('.article-cover-figure img');await hero.evaluate(i=>i.decode());
     const info=await hero.evaluate(i=>({src:i.currentSrc.split('/').pop(),fit:getComputedStyle(i).objectFit,w:i.clientWidth,h:i.clientHeight}));
     assert.equal(info.fit,'contain');assert.ok(Math.abs(info.w/info.h-1.5)<.02);report.images.push({width,dpr:1,...info});
     const noteSizes=await p.locator('.cover-source,.manual-plate figcaption,.editorial-detail summary').evaluateAll(es=>es.map(e=>parseFloat(getComputedStyle(e).fontSize)));
     assert.ok(noteSizes.every(n=>n>=14));
     if([390,1440].includes(width)){
      await p.evaluate(()=>{document.activeElement.blur();scrollTo(0,0)});
      await p.waitForTimeout(100);
      await p.screenshot({path:path.join(out,'article-hero-'+width+'.png')});
      for(const [i,plate] of (await p.locator('.manual-plate').all()).entries())await plate.screenshot({path:path.join(out,'plate-'+(i+1)+'-'+width+'.png')});
      const summary=p.locator('.manual-readings summary');await summary.focus();await p.keyboard.press('Enter');
      assert.equal(await p.locator('.manual-readings').getAttribute('open'),'');
      assert.notEqual(await summary.evaluate(e=>getComputedStyle(e).outlineStyle),'none');
      await p.locator('.manual-readings').screenshot({path:path.join(out,'references-'+width+'.png')});
      await p.keyboard.press('Enter');
      await p.evaluate(()=>{document.activeElement.blur();scrollTo(0,0)});
      await p.screenshot({path:path.join(out,'article-full-'+width+'.png'),fullPage:true});
     }
    }
    if(width===390&&route!=='/blog/glosario.html'){
     for(let y=0;y<await p.evaluate(()=>document.documentElement.scrollHeight);y+=850)await p.evaluate(y=>scrollTo(0,y),y);
     await p.waitForTimeout(180);
     assert.deepEqual(await p.locator('main img').evaluateAll(es=>es.filter(e=>e.complete&&!e.naturalWidth).map(e=>e.src)),[]);
    }
    if([390,1440].includes(width)&&route==='/blog/'){
     await p.locator('#manual img').scrollIntoViewIfNeeded();
     await p.locator('#manual img').evaluate(i=>i.decode());
     await p.locator('#manual').screenshot({path:path.join(out,'hub-manual-'+width+'.png')});
    }
   }await c.close();
  }
  // Both mobile densities, no duplicate hero preloads, and no unexpected layout movement.
  for(const dpr of [1,2]){
   const c=await context({viewport:{width:390,height:844},deviceScaleFactor:dpr}),p=await c.newPage();
   await p.addInitScript(()=>{window.shifts=[];new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.shifts.push(e.value)}).observe({type:'layout-shift',buffered:true})});
   await p.goto(origin+article);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(250);
   const info=await p.evaluate(()=>({src:document.querySelector('.article-cover-figure img').currentSrc.split('/').pop(),downloads:performance.getEntriesByType('resource').filter(x=>x.name.includes('manual-busqueda')).map(x=>x.name),cls:window.shifts.reduce((a,b)=>a+b,0)}));
   assert.equal(info.downloads.length,1);assert.equal(info.src,'manual-busqueda-v3-'+(dpr===1?480:960)+'.webp');assert.ok(info.cls<=.01);
   report.images.push({width:390,dpr,...info});await c.close();
  }
  // Keyboard lookup and exact return, preserving each tab's origin.
  const c=await context({viewport:{width:390,height:844}}),p=await c.newPage();
  for(const term of ['manual-de-marca','branding','sistema-de-marca']){
   await p.goto(origin+article);await dismiss(p);await p.locator('#termino-'+term).focus();await p.keyboard.press('Enter');
   await p.waitForURL('**/glosario.html?from=manual**');
   assert.equal(await p.locator('#'+term+' details').getAttribute('open'),'');
   const back=p.locator('#'+term+' [data-reading-return]');assert.equal(await back.getAttribute('href'),article+'#termino-'+term);
   await back.focus();await p.keyboard.press('Enter');await p.waitForURL('**/manual-de-marca.html#termino-'+term);
   report.returns.push(term);
  }
  const a=await c.newPage(),b=await c.newPage();
  await a.goto(origin+'/blog/glosario.html?from=manual&at=branding#branding');
  await b.goto(origin+'/blog/glosario.html?from=ventaja&at=marca#marca');
  assert.equal(await a.locator('#branding [data-reading-return]').getAttribute('href'),article+'#termino-branding');
  assert.equal(await b.locator('#marca [data-reading-return]').getAttribute('href'),'/blog/tu-marca-es-tu-ventaja.html#termino-marca');
  await p.goto(origin+article);await dismiss(p);
  await p.locator('.article-cta .btn').click();await p.waitForURL('**/diagnostico.html?momento=integrar**');
  assert.equal(new URL(p.url()).searchParams.get('servicio'),'identidad');
  // Reflow equivalent at 200% desktop zoom: 1440 CSS viewport becomes 720.
  await p.setViewportSize({width:720,height:450});await p.goto(origin+article);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1);
  report.notes.push('200% zoom reflow simulated at 720 CSS px; no real lead submitted.');
  await c.close();
  const nojs=await context({javaScriptEnabled:false,viewport:{width:390,height:844}}),n=await nojs.newPage();
  await n.goto(origin+article);await n.locator('#termino-manual-de-marca').click();
  await n.locator('#manual-de-marca summary').click();assert.ok(await n.locator('#manual-de-marca .term-definition').isVisible());
  await n.locator('#manual-de-marca [data-reading-return]').click();assert.ok(n.url().endsWith('#lecturas'));
  await nojs.close();
  // Matched cold laboratory loads: both local pages, same browser/network/CPU, 3 runs each.
  for(const route of [article,'/blog/tu-marca-es-tu-ventaja.html'])for(let run=1;run<=3;run++){
   const c=await context({viewport:{width:390,height:844},deviceScaleFactor:2}),p=await c.newPage();
   const cdp=await c.newCDPSession(p);
   await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
   await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750});
   await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
   await p.addInitScript(()=>{window.lab={lcp:0,cls:0};new PerformanceObserver(l=>{for(const e of l.getEntries())window.lab.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.lab.cls+=e.value}).observe({type:'layout-shift',buffered:true})});
   await p.goto(origin+route);await p.waitForTimeout(1800);
   report.performance.push({route,run,...await p.evaluate(()=>window.lab)});await c.close();
  }
  const response=await fetch(origin+'/assets/editorial/manual-busqueda-v3-960.webp');
  assert.equal(response.status,200);const bytes=Buffer.from(await response.arrayBuffer());
  assert.ok(bytes.equals(fs.readFileSync(path.join(root,'assets/editorial/manual-busqueda-v3-960.webp'))));
  report.cache={policy:response.headers.get('cache-control'),etag:response.headers.get('etag'),bytes:bytes.length};
  assert.equal((await fetch(origin+'/assets/editorial/manual-busqueda-v3-960.webp',{headers:{'If-None-Match':report.cache.etag}})).status,304);
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);
  report.pass=true;
 }finally{fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(report,null,2));await browser.close();await new Promise(r=>server.close(r));}
 console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
