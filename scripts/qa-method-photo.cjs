// Local browser regression only: no deploy, production requests or real analytics.
const {chromium} = require('playwright');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const assert = require('node:assert/strict');
const {createServer} = require('./editorial-qa-server.cjs');
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'dv-method-photo-'));
const matrix = [[320,1,480],[390,1,480],[390,2,960],[768,1,960],[820,1,960],[821,1,480],[1440,1,960],[1440,2,1448],[1920,1,1448]];
(async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({channel:'chrome',headless:true});
  const results = [], errors = [], external = [], legal = [];
  try {
    for (const [width,dpr,expected] of matrix) {
      const context = await browser.newContext({viewport:{width,height:900},deviceScaleFactor:dpr,reducedMotion:'reduce'});
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', req => { if(new URL(req.url()).origin !== origin) external.push(req.url()); });
      let release;
      const gate = new Promise(resolve => {release = resolve;});
      await context.route('**/criterio-metodo-01-06-v2-*.webp', async route => {await gate; await route.continue();});
      await page.addInitScript(() => {
        window.photoShifts = [];
        new PerformanceObserver(list => {
          for(const entry of list.getEntries()) if(!entry.hadRecentInput) {
            window.photoShifts.push({value:entry.value,photo:entry.sources?.some(s=>s.node?.closest?.('.method-photo'))});
          }
        }).observe({type:'layout-shift',buffered:true});
      });
      await page.goto(origin, {waitUntil:'domcontentloaded'});
      await page.evaluate(() => document.fonts.ready);
      await page.locator('[data-analytics-choice="rejected"]').click();
      const img = page.locator('.method-photo img');
      await img.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      const before = await img.boundingBox();
      const heightBefore = await page.evaluate(() => document.documentElement.scrollHeight);
      release();
      await img.evaluate(image => image.decode());
      await page.waitForTimeout(150);
      const after = await img.boundingBox();
      const info = await img.evaluate(image => ({src:image.currentSrc,width:image.naturalWidth,height:image.naturalHeight,loading:image.loading,decoding:image.decoding,fit:getComputedStyle(image).objectFit}));
      assert.ok(info.src.endsWith(`v2-${expected}.webp`),JSON.stringify({width,dpr,info}));
      // naturalWidth/Height are density-corrected and integer-rounded for srcset.
      // Exact file dimensions are verified separately from browser CSS pixels.
      assert.ok(Math.abs(info.width/info.height-4/3)<0.01);
      assert.equal(info.loading,'lazy'); assert.equal(info.decoding,'async'); assert.equal(info.fit,'contain');
      assert.ok(Math.abs(after.width/after.height-4/3)<0.01);
      for(const key of ['x','y','width','height']) assert.ok(Math.abs(before[key]-after[key])<=1,`shift ${width}/${dpr} ${key}`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollHeight),heightBefore);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth-innerWidth);
      assert.ok(overflow<=1);
      const shifts = await page.evaluate(() => window.photoShifts);
      assert.equal(shifts.filter(s=>s.photo).length,0);
      results.push({width,dpr,selected:info.src.split('/').pop(),decodedWidth:info.width,decodedHeight:info.height,box:after,imageLayoutShift:0,observedPageLayoutShift:shifts.reduce((a,b)=>a+b.value,0),overflow});
      if([390,1440].includes(width)&&dpr===1) {
        // Avoid a focused skip link or sticky header obscuring an element capture.
        await page.evaluate(() => { document.activeElement?.blur(); });
        await page.locator('.method-photo').screenshot({path:path.join(out,`method-${width}.png`)});
        await page.locator('#metodo').evaluate(section => scrollTo(0,section.offsetTop-100));
        await page.waitForTimeout(150);
        await page.screenshot({path:path.join(out,`viewport-${width}.png`)});
      }
      await context.close();
    }
    // No request routing in this context: Playwright routing disables HTTP cache.
    const cached = await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
    const page = await cached.newPage();
    const cacheEvents = [];
    const session = await cached.newCDPSession(page);
    await session.send('Network.enable');
    const ids = new Map();
    session.on('Network.requestWillBeSent', event => ids.set(event.requestId,event.request.url));
    session.on('Network.requestServedFromCache', event => {if((ids.get(event.requestId)||'').includes('criterio-metodo-01-06-v2-'))cacheEvents.push(ids.get(event.requestId));});
    await page.goto(origin);
    await page.locator('[data-analytics-choice="rejected"]').click();
    await page.locator('.method-photo img').scrollIntoViewIfNeeded();
    await page.locator('.method-photo img').evaluate(image=>image.decode());
    await page.goto(origin+'/blog/');
    await page.goto(origin);
    await page.locator('.method-photo img').scrollIntoViewIfNeeded();
    await page.locator('.method-photo img').evaluate(image=>image.decode());
    const cachedAsset = await page.locator('.method-photo img').evaluate(image=>({url:image.currentSrc,transfer:performance.getEntriesByName(image.currentSrc).map(r=>r.transferSize)}));
    assert.ok(cacheEvents.length>0 || cachedAsset.transfer.includes(0),'browser must reuse the versioned asset');
    await cached.close();
    for(const width of [320,390,1440]) {
      const context = await browser.newContext({viewport:{width,height:900}});
      const page = await context.newPage();
      await page.goto(origin);
      await page.getByRole('link',{name:'Cómo usamos la analítica'}).click();
      await page.waitForLoadState();
      await page.evaluate(()=>document.fonts.ready);
      assert.ok(page.url().endsWith('/15_LEGAL/Politica%20de%20Cookies.html'));
      assert.ok(await page.getByRole('heading',{name:'Cookies y almacenamiento local',exact:true}).isVisible());
      assert.ok((await page.locator('main').innerText()).length>3000);
      assert.ok(await page.locator('[data-analytics-settings]').isVisible());
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
      assert.ok(overflow<=1);
      await page.screenshot({path:path.join(out,`analytics-detail-${width}.png`)});
      legal.push({width,status:'PASS',overflow});
      await context.close();
    }
    const nojs = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});
    const native = await nojs.newPage();
    const response = await native.goto(origin+'/15_LEGAL/Politica%20de%20Cookies.html');
    assert.equal(response.status(),200);assert.ok(await native.locator('h1').isVisible());
    await nojs.close();
    assert.deepEqual(errors,[]); assert.deepEqual(external,[]);
    const report={status:'PASS',scope:'Local Chromium integration; not Vercel CDN or field performance verification',results,cache:{events:cacheEvents,asset:cachedAsset},legal,noJsLegal:'PASS',errors,external,sourceReleaseCommit:'afee147450d102f73e55c7a3b0044f459955023f'};
    fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify({out,...report},null,2));
  } finally {await browser.close(); await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);console.error('QA artifacts:',out);process.exitCode=1;});
