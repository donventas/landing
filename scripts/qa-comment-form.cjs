'use strict';
// Isolated local simulation: synthetic comments, no email or production traffic.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createPreview}=require('./private-comments-preview.cjs');
const {LocalStore}=require('../lib/article-comments/local-store.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const catalog=require('../blog/article-gifts.json');
const out=path.resolve(__dirname,'../.qa-gifts/comments');fs.mkdirSync(out,{recursive:true});
(async()=>{
 // Independent comments remain the fallback wherever gifts are unavailable.
 const store=new LocalStore(),server=createPreview({store,giftArticles:[]});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin='http://127.0.0.1:'+server.address().port;let browser;
 try{
  browser=await chromium.launch({headless:true,channel:'chrome'});
  const context=await browser.newContext({viewport:{width:1440,height:1100}});
  await context.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const [index,slug] of Object.keys(catalog.articles).entries()){
   await store.transaction(s=>{s.buckets={};});
   await page.goto(origin+'/blog/'+slug+'.html');
   const reject=page.getByRole('button',{name:'Rechazar',exact:true});if(await reject.isVisible())await reject.click();
   const block=page.locator('.comment-compose');await block.locator('summary').click();
   const send=block.locator('button[type=submit]');await page.waitForFunction(()=>!document.querySelector('.comment-compose button[type=submit]').disabled);
   const opt=block.locator('[name=newsletter]');assert.equal(await opt.isChecked(),false);assert.equal(await opt.getAttribute('required'),null);
   await opt.focus();await page.keyboard.press('Space');assert.equal(await opt.isChecked(),true);
   await block.locator('.gift-subscribe-label strong').click();assert.equal(await opt.isChecked(),false);
   assert.equal((await store.snapshot()).messages.length,index);
   for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:1100});
    assert.equal(await block.evaluate(el=>el.scrollWidth>el.clientWidth+1),false,slug+' '+width);
    if(width===390||width===1440){
     // Avoid sticky navigation crossing tall element screenshots.
     await block.locator('h2').click();
     const chrome=await page.addStyleTag({content:'.nav,.skip-link,.section-index,.reading-progress{visibility:hidden!important}'});
     await block.screenshot({path:path.join(out,slug+'-'+width+'.png')});
     await chrome.evaluate(el=>el.remove());
    }
   }
   await send.click();assert.equal(await page.locator('#comment-message').getAttribute('aria-invalid'),'true');
   for(const field of ['message','email']){
    assert.equal(await page.locator('#comment-'+field).evaluate(el=>getComputedStyle(el).borderTopColor),'rgb(255, 179, 179)');
   }
   await page.locator('#comment-message').fill('Comentario sintético para verificar la interfaz.');
   await page.locator('#comment-email').fill('qa@example.test');await send.click();
   await page.waitForFunction(()=>document.querySelector('.comment-compose .comment-status').textContent.includes('Prueba completada'));
   assert.equal((await store.snapshot()).messages.length,index+1);
   assert.equal((await store.snapshot()).intents.length,0);
   assert.equal(await page.locator('#comment-message').inputValue(),'');
   assert.equal(await opt.isChecked(),false);
   console.log('PASS '+slug+' responsive, keyboard, validation, private receipt without opt-in');
  }
  assert.deepEqual(errors,[]);console.log('PASS 7 comment forms; simulated mail only');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
