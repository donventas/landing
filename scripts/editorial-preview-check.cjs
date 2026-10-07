// Read-only loopback QA. External requests are blocked; no forms are submitted.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const out=process.env.QA_OUTPUT||path.join(require('node:os').tmpdir(),'dv-editorial-preview-v3-qa');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.QA_BROWSER?{executablePath:process.env.QA_BROWSER}:{})});
 const errors=[],badResponses=[],external=[],results=[];
 try{
  for(const width of [320,390,768,1120,1121,1440]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
   await page.addInitScript(()=>{window.__editorialPerf={lcpMs:0,cls:0};new PerformanceObserver(list=>{for(const e of list.getEntries())window.__editorialPerf.lcpMs=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__editorialPerf.cls+=e.value;}).observe({type:'layout-shift',buffered:true});});
   page.on('pageerror',e=>errors.push(e.message));
   page.on('response',r=>{if(r.status()>=400)badResponses.push(r.url()+': '+r.status());});
   await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname==='127.0.0.1')return route.continue();external.push(u.origin);return route.abort();});
   const response=await page.goto('http://127.0.0.1:8793/blog/diseno-editorial.html?revision=release');
   assert.equal(response.status(),200);await page.evaluate(()=>document.fonts.ready);
   await page.locator('[data-analytics-choice="rejected"]').click();
   await page.waitForTimeout(150);
   await page.locator('.article-cover-figure img').evaluate(img=>img.decode());
   const cover=await page.locator('.article-cover-figure img').evaluate(img=>({loaded:img.naturalWidth>0,ratio:img.getBoundingClientRect().width/img.getBoundingClientRect().height,fit:getComputedStyle(img).objectFit,source:img.currentSrc}));
   assert.ok(cover.loaded);assert.ok(Math.abs(cover.ratio-1.5)<.01);assert.equal(cover.fit,'contain');
   const data=await page.evaluate(()=>{function words(selector){const w=document.createTreeWalker(document.querySelector(selector),NodeFilter.SHOW_TEXT);let n,parts=[];while(n=w.nextNode())parts.push(n.textContent);return parts.join(' ').trim().split(/\s+/).length;}return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,articleWords:words('[data-editorial-body]'),mainWords:words('main'),domMs:performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd,resources:performance.getEntriesByType('resource').reduce((n,r)=>n+r.transferSize,0)}});
   data.cover=cover;assert.ok(data.scrollWidth<=width,JSON.stringify(data));assert.ok(data.articleWords<=1400);assert.ok(data.mainWords<=1400);
   await page.waitForTimeout(200);data.initialPaint=await page.evaluate(()=>window.__editorialPerf);
   data.sheets=[];
   for(const id of ['report-before','report-after']){
    const report=page.locator('#'+id);
    const measure=()=>report.evaluate(e=>{const r=e.getBoundingClientRect(),f=e.querySelector('.report-footer').getBoundingClientRect(),c=e.querySelector('.report-content').getBoundingClientRect();return {width:r.width,height:r.height,ratio:r.width/r.height,overflow:e.scrollHeight-e.clientHeight,footerGap:f.top-c.bottom,text:e.textContent}});
    const mini=await measure();assert.ok(Math.abs(mini.ratio-17/22)<.002);assert.ok(mini.overflow<=1);assert.ok(mini.footerGap>=0);
    const opener=page.locator('[data-report-open="'+id+'"]');await opener.scrollIntoViewIfNeeded();const readingY=await page.evaluate(()=>scrollY);await opener.click();
    assert.ok(await page.locator('#report-zoom').evaluate(e=>e.open));
    const full=await measure();assert.equal(full.width,816);assert.ok(Math.abs(full.ratio-17/22)<.002);assert.equal(full.text,mini.text);assert.ok(full.footerGap>=0);
    if(width===1440){await page.screenshot({path:path.join(out,id+'-dialog.png')});await page.setViewportSize({width,height:1300});await report.screenshot({path:path.join(out,id+'-expanded.png')});await page.setViewportSize({width,height:900});}
    if(id==='report-before')await page.keyboard.press('Escape');else await page.locator('#report-zoom button').click();await page.waitForFunction(id=>document.getElementById(id).parentElement.className==='report-viewport',id);assert.ok(!(await page.locator('#report-zoom').evaluate(e=>e.open)));
    assert.equal(await report.evaluate(e=>e.parentElement.className),'report-viewport');
    assert.equal(await opener.evaluate(e=>document.activeElement===e),true);
    assert.ok(Math.abs((await page.evaluate(()=>scrollY))-readingY)<=2,'zoom should preserve reading position');
    data.sheets.push({id,mini:{...mini,text:undefined},full:{...full,text:undefined}});
   }
   const summary=page.locator('[data-section-index]>summary');await summary.focus();await page.keyboard.press('Enter');
   assert.equal(await page.locator('[data-section-index]').getAttribute('open'),'');
   await page.keyboard.press('Escape');assert.equal(await page.locator('[data-section-index]').getAttribute('open'),null);
   await summary.click();await page.locator('[data-section-index] a[href="#orden"]').click();
   await page.waitForTimeout(150);assert.equal(await page.locator('[data-section-index]').getAttribute('open'),null);
   assert.equal(await page.evaluate(()=>document.activeElement.closest('section')?.id),'orden');
   await page.locator('#entender summary').click();assert.ok(await page.locator('#entender details').evaluate(e=>e.open));
   await page.locator('#referencias summary').click();assert.ok(await page.locator('#referencias').evaluate(e=>e.open));
   await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await page.waitForTimeout(200);
   data.progress=await page.locator('[data-reading-progress]').evaluate(e=>({width:e.getBoundingClientRect().width,parent:e.parentElement.getBoundingClientRect().width}));
   assert.ok(data.progress.width/data.progress.parent>.98);
   await page.evaluate(()=>{document.querySelectorAll('details').forEach(e=>e.open=false);scrollTo(0,0)});await page.waitForTimeout(150);
   if(width===390||width===1440){await page.screenshot({path:path.join(out,`hero-${width}.png`)});await page.screenshot({path:path.join(out,`editorial-${width}.png`),fullPage:true});await page.locator('.editorial-comparison').scrollIntoViewIfNeeded();await page.evaluate(()=>{document.activeElement.blur();document.querySelectorAll('.nav,.section-index,.skip-link,.reading-progress').forEach(e=>e.style.visibility='hidden');});await page.locator('.editorial-comparison').screenshot({path:path.join(out,`comparison-${width}.png`)});}
   results.push(data);await page.close();
  }
  assert.deepEqual(errors,[]);assert.deepEqual(badResponses,[]);assert.deepEqual(external,[]);
  const report={results,errors,badResponses,external,screenshots:out};fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
