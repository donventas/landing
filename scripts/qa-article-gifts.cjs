'use strict';
// Local only: synthetic answers, isolated real HTTP handler + persisted receipt, no email.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {createPreview}=require('./private-comments-preview.cjs');
const {LocalStore}=require('../lib/article-comments/local-store.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const all=process.argv.includes('--all'),catalog=require('../blog/article-gifts.json');
const articles=all?Object.keys(catalog.articles):['contenido-que-atrae-clientes'];
const output=path.resolve(__dirname,'../.qa-gifts');fs.mkdirSync(output,{recursive:true});
(async()=>{
 const store=new LocalStore(),server=createPreview({store,failFirst:true,giftArticles:articles});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 let browser;const evidence=[];
 try{
  browser=await chromium.launch({headless:true,channel:'chrome'});
  const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
  await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.giftQA={cls:0,lcp:0};new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.giftQA.cls+=e.value;}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())window.giftQA.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});});
  for(const [index,article] of articles.entries()){
   // Keep production quotas unchanged; a fresh isolated store per article.
   if(index)await store.transaction(s=>{s.buckets={};});
   await page.goto(origin+'/blog/'+article+'.html');
   const reject=page.getByRole('button',{name:'Rechazar',exact:true});if(await reject.isVisible())await reject.click();
   const section=page.locator('.article-gift');await section.waitFor();
   const initial=await page.evaluate(()=>({performance:window.giftQA,pdfRequested:performance.getEntriesByType('resource').some(e=>e.name.endsWith('.pdf'))}));assert.equal(initial.pdfRequested,false);
   await section.locator('summary').first().focus();await page.keyboard.press('Enter');
   const wizard=await section.locator('[data-gift-next]').count();
   for(let i=0;i<3;i++){
    await page.locator('#gift-answer-'+i).fill(['Quería explicar una medida.','No he medido el resultado.','No necesité ajustes.'][i]);
    if(wizard)await section.locator('[data-gift-next]').click();
   }
   const optIn=section.locator('[name=newsletter]');
   assert.equal(await optIn.isChecked(),false);assert.equal(await optIn.getAttribute('required'),null);
   assert.equal(await section.locator('[data-newsletter-label]').textContent(),catalog.newsletter.label);
   for(const part of ['promise','details','confirmation'])assert.equal(await section.locator('#gift-newsletter-'+part).textContent(),catalog.newsletter[part]);
   if(index===0){
    await optIn.focus();await page.keyboard.press('Space');assert.equal(await optIn.isChecked(),true);
    await section.locator('[data-newsletter-label]').click();assert.equal(await optIn.isChecked(),false);
    assert.equal((await store.snapshot()).messages.length,0);
    for(const width of [320,390,768,1440]){
     await page.setViewportSize({width,height:1000});
     assert.equal(await section.evaluate(el=>el.scrollWidth>el.clientWidth+1),false);
     await section.locator('.gift-subscribe').screenshot({path:path.join(output,'opt-in-'+width+'.png')});
    }
   }
   await page.locator('#gift-email').fill('qa@example.test');
   if(index===0)for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});await section.screenshot({path:path.join(output,'pilot-form-'+width+'.png')});}
   assert.equal(await section.locator('[name=newsletter]').isChecked(),false);
   const submit=section.locator('button[type=submit]');await submit.click();
   if(index===0){
    await section.locator('.comment-status.is-error').waitFor();assert.equal(await section.locator('.gift-delivery').isVisible(),false);assert.equal((await store.snapshot()).messages.length,0);assert.equal(await page.locator('#gift-answer-0').inputValue(),'Quería explicar una medida.');
    // Simulate a stale open tab: explicit update, preserve answers, reset opt-in.
    await optIn.check();
    const stale=async route=>route.fulfill({status:422,contentType:'application/json',body:JSON.stringify({ok:false,code:'survey_updated',field:'survey'})});
    await page.route('**/api/article-message',stale);await submit.click();
    await section.locator('.gift-refresh').waitFor({state:'visible'});
    await page.unroute('**/api/article-message',stale);await section.locator('.gift-refresh').click();
    await section.locator('.gift-refresh').waitFor({state:'hidden'});assert.equal(await optIn.isChecked(),false);
    assert.equal(await page.locator('#gift-answer-0').inputValue(),'Quería explicar una medida.');
    assert.equal((await store.snapshot()).messages.length,0);await submit.click();
   }
   await section.locator('.gift-delivery').waitFor({state:'visible'});
   assert.equal(await section.locator('.gift-delivery').evaluate(el=>document.activeElement===el),true);
   assert.equal((await store.snapshot()).messages.length,index+1);assert.equal((await store.snapshot()).intents.length,0);
   const [download]=await Promise.all([page.waitForEvent('download'),section.locator('[data-gift-download]').click()]);
   const target=path.join(output,download.suggestedFilename());await download.saveAs(target);
   const bytes=fs.readFileSync(target);assert.equal(bytes.subarray(0,5).toString(),'%PDF-');
   const expected=fs.readFileSync(path.join(__dirname,'..',catalog.articles[article].file));assert.ok(bytes.equals(expected));
   await section.locator('.gift-remember').click();await page.reload();await page.locator('.gift-delivery').waitFor({state:'visible'});
   assert.equal((await store.snapshot()).messages.length,index+1);
   // A reader who saved an earlier edition must receive the current PDF without another survey.
   for(const previous of catalog.articles[article].previousFiles || []){
    await page.evaluate(({id,file})=>localStorage.setItem('dv-gift:'+id,file),{id:catalog.articles[article].id,file:previous});
    await page.reload();await page.locator('.gift-delivery').waitFor({state:'visible'});
    assert.equal(await page.locator('[data-gift-download]').getAttribute('href'),catalog.articles[article].file);
    assert.equal((await store.snapshot()).messages.length,index+1);
   }
   for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:1000});await section.scrollIntoViewIfNeeded();
    const overflow=await section.evaluate(el=>el.scrollWidth>el.clientWidth+1);assert.equal(overflow,false,article+' '+width);
    await section.screenshot({path:path.join(output,article+'-'+width+'.png')});
   }
   evidence.push({article,download:download.suggestedFilename(),bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),receipt:true,newsletter:false,recoveryWithoutResubmission:true,previousEditionRecovery:true,keyboardToggleAndSuccessFocus:true,initial,widths:[320,390,768,1440]});
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,all?'all.json':'pilot.json'),JSON.stringify({surface:'loopback; synthetic receipts; no cloud/email',evidence,errors},null,2));console.log(JSON.stringify(evidence,null,2));
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
