// Local-only fixture, external traffic aborted. Simulated viewports, not field CWV.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {createServer}=require('./editorial-qa-server.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.qa-logos'),article='/blog/logotipos-mitos.html';
const report={layouts:[],images:[],navigation:[],consent:[],returns:[],downloads:[],performance:[],errors:[],blockedExternal:[]};
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'chrome',headless:true});
 async function context(options={}){const c=await browser.newContext({reducedMotion:'reduce',...options});await c.route('**/*',r=>{if(new URL(r.request().url()).origin===origin)return r.continue();report.blockedExternal.push(r.request().url());return r.abort();});return c;}
 async function dismiss(p){const b=p.locator('[data-analytics-choice="rejected"]');if(await b.isVisible())await b.click();}
 try{
  for(const width of [320,390,768,1120,1121,1440]){
   const c=await context({viewport:{width,height:900}}),p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));
   await p.addInitScript(()=>{window.qaVitals={cls:0,lcp:0};new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.qaVitals.cls+=e.value;}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())window.qaVitals.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});});
   const response=await p.goto(origin+article);assert.equal(response.status(),200);assert.equal(response.headers()['x-robots-tag'],'noindex');await p.evaluate(()=>document.fonts.ready);await p.locator('.article-cover-figure img').evaluate(i=>i.decode());await p.waitForTimeout(500);
   report.performance.push({width,conditions:'Chrome headless, local gzip, no CPU/network throttle; one run',...await p.evaluate(()=>window.qaVitals)});
   const before=await p.evaluate(()=>scrollY);await dismiss(p);assert.ok(Math.abs(await p.evaluate(()=>scrollY)-before)<=1);report.consent.push({width,choice:'rejected',noJump:true});
   for(const img of await p.locator('main img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());}
   await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
   await p.waitForTimeout(200);assert.deepEqual(await p.locator('main img').evaluateAll(es=>es.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)),[]);
   const overflow=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert.ok(overflow<=1,'overflow '+width);assert.equal(await p.locator('h1').count(),1);report.layouts.push({route:article,width,overflow});
   const hero=await p.locator('.article-cover-figure img').evaluate(i=>({currentSrc:i.currentSrc.split('/').pop(),fit:getComputedStyle(i).objectFit,width:i.clientWidth,height:i.clientHeight}));assert.equal(hero.fit,'contain');assert.ok(Math.abs(hero.width/hero.height-1.5)<.02);report.images.push({viewport:width,dpr:1,...hero});
   const photo=await p.locator('.use-photo-background').evaluate(i=>({currentSrc:i.currentSrc.split('/').pop(),fit:getComputedStyle(i).objectFit,width:i.clientWidth,height:i.clientHeight}));assert.equal(photo.fit,'contain');assert.ok(Math.abs(photo.width/photo.height-3/2)<.02);assert.match(photo.currentSrc,/^logo-conversacion-v3-/);report.images.push({asset:'conversation-photo',viewport:width,dpr:1,...photo});assert.equal(await p.locator('.photo-safe-zone').count(),0);
   const notes=await p.locator('.logo-plate figcaption,.logo-plate p,.specimen-number').evaluateAll(es=>es.map(e=>parseFloat(getComputedStyle(e).fontSize)));assert.ok(notes.every(s=>s>=14));
   assert.ok(await p.locator('[data-reading-progress]').evaluate(e=>e.getBoundingClientRect().width)>width*.7);
   for(const id of ['que-es-logo','fondo','versiones','detalle','contexto','fuera-del-archivo']){
    await p.locator('[data-section-index]>summary').focus();await p.keyboard.press('Enter');await p.locator('[data-section-index] a[href="#'+id+'"]').focus();await p.keyboard.press('Enter');await p.waitForTimeout(80);
    assert.equal(await p.locator('[data-section-index]').getAttribute('open'),null);assert.equal(await p.evaluate(()=>document.activeElement.tagName),'H2');
    const geom=await p.evaluate(id=>({heading:document.querySelector('#'+id+' h2').getBoundingClientRect().top,index:document.querySelector('.section-index').getBoundingClientRect().bottom}),id);assert.ok(geom.heading>=geom.index,id+' under index at '+width);report.navigation.push({width,id,...geom});
   }
   if([390,1440].includes(width)){
    await p.evaluate(()=>{document.activeElement.blur();scrollTo(0,0)});await p.waitForTimeout(100);await p.screenshot({path:path.join(out,'hero-'+width+'.png')});
    const hide=await p.addStyleTag({content:'.nav,.section-index,.reading-progress,.skip-link{visibility:hidden!important}'});
    for(const [i,plate]of(await p.locator('.logo-plate').all()).entries())await plate.screenshot({path:path.join(out,'plate-'+(i+1)+'-'+width+'.png')});
    await hide.evaluate(e=>e.remove());await p.screenshot({path:path.join(out,'full-'+width+'.png'),fullPage:true});
    for(const id of ['logo','branding','manual-de-marca','sistema-de-marca']){
     await p.goto(origin+article);await p.locator('#termino-'+id).click();await p.waitForTimeout(70);const term=p.locator('#'+id);assert.equal(await term.locator('details').getAttribute('open'),'');const back=term.locator('[data-reading-return]');assert.equal(await back.getAttribute('href'),article+'#termino-'+id);await back.click();assert.equal(new URL(p.url()).hash,'#termino-'+id);report.returns.push({width,id,pass:true});
    }
   }
   for(const route of ['/blog/','/blog/glosario.html','/blog/manual-de-marca.html']){
    await p.goto(origin+route);await p.evaluate(()=>document.fonts.ready);const overflow=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert.ok(overflow<=1);report.layouts.push({route,width,overflow});
    if(route==='/blog/'&&[390,1440].includes(width)){await p.locator('#logos img').scrollIntoViewIfNeeded();await p.locator('#logos img').evaluate(i=>i.decode());await p.locator('#logos').screenshot({path:path.join(out,'hub-'+width+'.png')});}
   }await c.close();
  }
  for(const width of [390,1440])for(const y of [0,1400]){const c=await context({viewport:{width,height:900}}),p=await c.newPage();await p.goto(origin+article);await p.evaluate(()=>document.fonts.ready);await p.evaluate(y=>scrollTo(0,y),y);const before=await p.evaluate(()=>scrollY);await p.locator('[data-analytics-choice="accepted"]').click();assert.ok(Math.abs(await p.evaluate(()=>scrollY)-before)<=1);report.consent.push({width,choice:'accepted',before,noJump:true});await c.close();}
  const retina=await context({viewport:{width:390,height:844},deviceScaleFactor:2}),rp=await retina.newPage();await rp.goto(origin+article);await rp.locator('.article-cover-figure img').evaluate(i=>i.decode());report.images.push({viewport:390,dpr:2,currentSrc:await rp.locator('.article-cover-figure img').evaluate(i=>i.currentSrc.split('/').pop())});await retina.close();
  const nojs=await context({viewport:{width:390,height:844},javaScriptEnabled:false}),np=await nojs.newPage();await np.goto(origin+article);assert.equal(await np.locator('h1').count(),1);await np.locator('[data-section-index]>summary').click();assert.equal(await np.locator('[data-section-index] nav').isVisible(),true);await np.locator('a[href="#contexto"]').click();assert.equal(new URL(np.url()).hash,'#contexto');report.noJS='PASS: body, images, native index and anchors';await nojs.close();
  for(const file of ['logo-vitrina-v5-480.webp','logo-vitrina-v5-960.webp','logo-vitrina-v5-1536.webp','logo-vitrina-v5-social.jpg','logo-conversacion-v3-480.webp','logo-conversacion-v3-960.webp','logo-conversacion-v3-1536.webp']){const res=await fetch(origin+'/assets/editorial/'+file);const b=Buffer.from(await res.arrayBuffer()),local=fs.readFileSync(path.join(root,'assets/editorial',file));assert.ok(b.equals(local));const cached=await fetch(origin+'/assets/editorial/'+file,{headers:{'If-None-Match':res.headers.get('etag')}});assert.equal(cached.status,304);report.downloads.push({file,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex'),cacheStatus:cached.status,cacheControl:res.headers.get('cache-control')});}
  assert.deepEqual(report.errors,[]);report.status='PASS';
 }finally{fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(report,null,2));await browser.close();await new Promise(r=>server.close(r));}
 console.log(JSON.stringify({status:report.status,layouts:report.layouts.length,navigation:report.navigation.length,returns:report.returns.length,consent:report.consent.length,images:report.images,performance:report.performance,errors:report.errors},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
