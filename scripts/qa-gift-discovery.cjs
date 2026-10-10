'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createPreview}=require('./private-comments-preview.cjs');
const {LocalStore}=require('../lib/article-comments/local-store.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const catalog=require('../blog/article-gifts.json');
const output=path.resolve(__dirname,'../.qa-gifts/discovery');fs.mkdirSync(output,{recursive:true});
(async()=>{
 const store=new LocalStore(),server=createPreview({store,giftArticles:Object.keys(catalog.articles)});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin='http://127.0.0.1:'+server.address().port;let browser;
 try{
  browser=await chromium.launch({headless:true,channel:'chrome'});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.addInitScript(()=>{window.nativeValidationCalls=0;for(const type of [HTMLFormElement,HTMLInputElement,HTMLTextAreaElement]){const original=type.prototype.reportValidity;type.prototype.reportValidity=function(){window.nativeValidationCalls++;return original.call(this);};}});
  await context.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url=origin+'/blog/contenido-que-atrae-clientes.html';
  for(const width of [320,390,600,768,1440]){
   await page.setViewportSize({width,height:1000});await page.goto(url);await page.locator('.gift-reading-note').waitFor();
   const reject=page.getByRole('button',{name:'Rechazar',exact:true});if(await reject.isVisible())await reject.click();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'overflow '+width);
   assert.equal(await page.locator('.gift-index-link').count(),1);assert.equal(await page.locator('[data-section-index] ol a').count(),5);
   await page.locator('.gift-reading-note a').focus();await page.keyboard.press('Enter');
   await page.waitForFunction(()=>document.activeElement.id==='gift-title');assert.equal(new URL(page.url()).hash,'#regalo-del-articulo');
   assert.equal(await page.locator('.article-gift>.comment-details').getAttribute('open'),null);
   try{await page.waitForFunction(()=>{const y=document.querySelector('.article-gift').getBoundingClientRect().top;return y>=0&&y<500;});}
   catch(e){console.error('anchor geometry',width,await page.evaluate(()=>({y:document.querySelector('.article-gift').getBoundingClientRect().top,scroll:scrollY,height:innerHeight,errors:document.querySelectorAll('.gift-field-error').length})));throw e;}
   await page.locator('[data-section-index] summary').click();await page.locator('.gift-index-link').focus();await page.keyboard.press('Enter');
   assert.equal(await page.locator('[data-section-index]').getAttribute('open'),null);
   await page.waitForFunction(()=>document.activeElement.id==='gift-title');
   const img=page.locator('.gift-preview img');await img.scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('.gift-preview img').naturalWidth===612);
   assert.equal(await page.locator('.comment-compose').isVisible(),false);
   assert.equal(await page.locator('.gift-commercial').count(),0);
   assert.equal(await page.locator('[data-next-step="diagnosis"]').isVisible(),false);
   assert.match(await page.locator('.gift-service-link a').getAttribute('href'),/^\/diagnostico\.html/);
   const opener=page.locator('.gift-primary-action');assert.match(await opener.textContent(),/Quiero mi checklist/);
   assert.equal(await opener.evaluate(el=>getComputedStyle(el).paddingTop),'14px');
   assert.equal(await page.locator('.gift-offer-terms').isVisible(),true);
   for(const [name,selector] of [['intro','.gift-reading-note'],['offer','.article-ending']]){
    const chrome=await page.addStyleTag({content:'.nav,.skip-link,.section-index,.reading-progress{visibility:hidden!important}'});
    await page.locator(selector).screenshot({path:path.join(output,name+'-'+width+'.png')});await chrome.evaluate(el=>el.remove());
   }
   assert.equal(await page.locator('#gift-newsletter').isChecked(),false);
   await opener.focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#gift-comment').isVisible(),false);
   assert.equal(await page.locator('#gift-comment').getAttribute('required'),null);
   assert.equal(await page.locator('#gift-comment').getAttribute('maxlength'),'900');
   assert.equal(await page.locator('.gift-question:visible').count(),1);
   await page.locator('[data-gift-next]').click();assert.equal(await page.locator('#gift-answer-0').isVisible(),true);
   await page.locator('#gift-answer-0').fill('   ');await page.locator('[data-gift-next]').click();
   assert.equal(await page.locator('#gift-answer-0').getAttribute('aria-invalid'),'true');
   assert.equal(await page.locator('#gift-answer-0-error').isVisible(),true);
   assert.match(await page.locator('#gift-answer-0').getAttribute('aria-describedby'),/gift-answer-0-error/);
   await page.locator('#gift-answer-0').fill('');
   await page.locator('.gift-form').evaluate(el=>el.requestSubmit());
   assert.equal(await page.locator('#gift-answer-0').evaluate(el=>document.activeElement===el),true);
   const firstChrome=await page.addStyleTag({content:'.nav,.skip-link,.section-index,.reading-progress{visibility:hidden!important}'});
   await page.locator('.gift-form').screenshot({path:path.join(output,'first-step-'+width+'.png')});await firstChrome.evaluate(el=>el.remove());
   for(let i=0;i<3;i++){
    await page.locator('#gift-answer-'+i).fill('Respuesta '+i+' de QA local.');
    assert.equal(await page.locator('#gift-answer-'+i+'-error').isVisible(),false);
    await page.locator('[data-gift-next]').click();
   }
   assert.equal(await page.locator('.gift-answer-edit').count(),3);
   await page.locator('.gift-answer-edit').first().click();
   assert.equal(await page.locator('#gift-answer-0').inputValue(),'Respuesta 0 de QA local.');
   for(let i=0;i<3;i++)await page.locator('[data-gift-next]').click();
   await page.locator('[data-gift-back]').click();assert.equal(await page.locator('#gift-answer-2').inputValue(),'Respuesta 2 de QA local.');
   await page.locator('[data-gift-next]').click();
   assert.equal(await page.locator('#gift-email').isVisible(),true);
   assert.equal(await page.locator('#gift-comment').isVisible(),false);
   assert.equal(await page.locator('.gift-extra-comment summary span').evaluate(el=>getComputedStyle(el).transform),'none');
   await page.locator('#gift-email').fill('correo-invalido');await page.locator('.gift-form button[type=submit]').click();
   assert.equal(await page.locator('#gift-email').evaluate(el=>document.activeElement===el),true);
   assert.equal(await page.locator('#gift-email-error').isVisible(),true);
   assert.equal((await store.snapshot()).messages.length,0);await page.locator('#gift-email').fill('');
   const chrome=await page.addStyleTag({content:'.nav,.skip-link,.section-index,.reading-progress{visibility:hidden!important}'});
   await page.locator('.gift-form').screenshot({path:path.join(output,'final-step-'+width+'.png')});await chrome.evaluate(el=>el.remove());
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'wizard overflow '+width);
   assert.equal(await page.evaluate(()=>window.nativeValidationCalls),0);
  }
  await page.locator('.gift-extra-comment summary').click();
  await page.locator('#gift-comment').fill('Pregunta opcional de QA, sin datos reales.');await page.locator('#gift-email').fill('qa@example.test');
  await page.locator('.gift-form button[type=submit]').click();await page.locator('.gift-delivery').waitFor({state:'visible'});
  const receipt=await store.snapshot();assert.equal(receipt.messages.length,1);assert.match(receipt.messages[0].message,/Pregunta opcional de QA/);assert.equal(receipt.intents.length,0);
  assert.equal(await page.locator('#gift-comment').inputValue(),'');
  await page.locator('.gift-primary-action').click();assert.equal(await page.locator('#gift-answer-0').isVisible(),true);
  assert.equal(await page.locator('.gift-answer-edit').count(),0);
  for(const slug of Object.keys(catalog.articles).filter(s=>s!=='contenido-que-atrae-clientes')){
   await page.goto(origin+'/blog/'+slug+'.html');await page.locator('.article-gift').waitFor();
   const gift=catalog.articles[slug];
   for(const selector of ['.gift-reading-note','.gift-index-link','.gift-offer'])assert.equal(await page.locator(selector).count(),1,slug);
   assert.equal(await page.locator('.comment-compose').isVisible(),false);
   assert.equal(await page.locator('#gift-title').textContent(),gift.offerTitle||gift.title);
   assert.match(await page.locator('.gift-primary-action').textContent(),new RegExp(gift.cta));
   assert.equal(await page.locator('[data-gift-note-description]').textContent(),gift.intro);
   assert.equal(await page.locator('.gift-preview img').getAttribute('src'),gift.preview);
   for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:1000});await page.locator('.gift-preview img').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelector('.gift-preview img').naturalWidth===612);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,slug+' overflow '+width);
    const chrome=await page.addStyleTag({content:'.nav,.skip-link,.section-index,.reading-progress{visibility:hidden!important}'});
    await page.locator('.article-ending').screenshot({path:path.join(output,slug+'-offer-'+width+'.png')});
    await page.locator('.gift-reading-note').screenshot({path:path.join(output,slug+'-intro-'+width+'.png')});await chrome.evaluate(el=>el.remove());
   }
   await page.locator('.gift-primary-action').click();await page.locator('[data-gift-next]').click();
   assert.equal(await page.locator('#gift-answer-0-error').isVisible(),true);
   for(let i=0;i<3;i++)assert.equal(await page.locator('.gift-question-text').nth(i).textContent(),gift.questions[i]);
   assert.equal(await page.evaluate(()=>window.nativeValidationCalls),0);
  }
  // Late gift availability must not hide a comment already being written.
  const drafting=await context.newPage();let held;
  await drafting.route('**/api/article-message',r=>{if(!held){held=r;return;}return r.continue();});
  await drafting.goto(url);await drafting.locator('.comment-compose summary').click();
  await drafting.locator('#comment-message').fill('Borrador local que debe conservarse.');
  await held.fulfill({contentType:'application/json',body:JSON.stringify({enabled:true,mode:'simulation',gift_articles:Object.keys(catalog.articles)})});
  await drafting.locator('.gift-primary-action').waitFor();assert.equal(await drafting.locator('.comment-compose').isVisible(),true);
  assert.equal(await drafting.locator('#comment-message').inputValue(),'Borrador local que debe conservarse.');await drafting.close();
  await page.route('**/api/article-message',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({enabled:true,mode:'simulation',gift_articles:[]})}));
  await page.goto(url);await page.waitForLoadState('networkidle');
  for(const selector of ['.gift-reading-note','.gift-index-link','.gift-offer','.article-gift'])assert.equal(await page.locator(selector).count(),0,'disabled '+selector);
  assert.equal(await page.locator('.comment-compose').count(),1);
  assert.equal(await page.locator('.comment-compose').isVisible(),true);
  const noJS=await browser.newContext({javaScriptEnabled:false});const fallback=await noJS.newPage();await fallback.goto(url);
  assert.equal(await fallback.locator('h1').count(),1);assert.equal(await fallback.locator('.gift-reading-note').count(),0);await noJS.close();
  assert.deepEqual(errors,[]);console.log('PASS inline errors, zero native validation popups, 7 contextual gifts, responsive/keyboard, disabled/no-JS fallback');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
