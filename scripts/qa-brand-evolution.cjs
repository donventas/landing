// Local browser QA only. Mock API; no production leads or Google events.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=fs.mkdtempSync(path.join(os.tmpdir(),'dv-evolution-'));
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext();
 const page=await context.newPage();const errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await page.route('**/_vercel/**',r=>r.fulfill({status:200,body:''}));
 const paths=['/','/branding.html','/diagnostico.html','/arturo-villagomez.html','/blog/','/blog/glosario.html'];
 const layouts=[];
 for(const width of [320,390,768,1120,1440])for(const route of paths){
   await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:8785'+route);await page.evaluate(()=>document.fonts.ready);
   const reject=page.locator('[data-analytics-choice="rejected"]');if(await reject.isVisible())await reject.click();
   await page.locator('main h1').waitFor();
   const dimensions=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,h1:document.querySelector('h1').getBoundingClientRect().toJSON()}));
   assert.ok(dimensions.scroll<=width+1,JSON.stringify({route,width,dimensions}));
   layouts.push({route,width,overflow:dimensions.scroll-width});
   if((width===390||width===1440)&&['/','/branding.html'].includes(route)){
     for(let y=0;y<await page.evaluate(()=>document.documentElement.scrollHeight);y+=650){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(120);}
     await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(400);
     const name=(route==='/'?'home':'branding')+'-'+width;
     await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});
     await page.screenshot({path:path.join(out,name+'-hero.png')});
     if(route==='/'){await page.locator('#servicios').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,name+'-services.png')});}
   }
 }
 await page.goto('http://127.0.0.1:8785/diagnostico.html?servicio=web&momento=conectar');
 await page.locator('[data-value="conectar"]').click();await page.locator('.dv-next').click();
 await page.locator('[data-value="estrategia"]').click();await page.locator('.dv-next').click();
 await page.reload();assert.equal(await page.locator('.dv-form-shell').getAttribute('data-analytics-step'),'workingMode');
 await page.locator('[data-value="acompanamiento"]').click();await page.locator('.dv-next').click();
 await page.locator('[data-field="currentNeed"]').fill('QA ficticio: actualizar oferta');await page.locator('.dv-next').click();
 await page.locator('[data-field="existingAssets"]').fill('QA ficticio: equipo y sitio existentes');await page.locator('.dv-next').click();
 await page.locator('[data-value="exploring"]').click();await page.locator('.dv-next').click();await page.locator('.dv-next').click();
 await page.locator('[data-field="name"]').fill('QA local');await page.locator('[data-field="business"]').fill('Prueba ficticia');await page.locator('[data-field="email"]').fill('qa@example.test');await page.locator('[data-field="consent"]').check();
 const bodies=[];await page.route('**/api/lead',async r=>{bodies.push(r.request().postDataJSON());await r.fulfill({status:bodies.length===1?503:200,contentType:'application/json',body:JSON.stringify({ok:bodies.length>1,qa:true})});});
 await page.locator('.dv-next').click();await page.locator('.dv-retry').waitFor();
 await page.reload();await page.locator('.dv-next').click();await page.locator('.dv-result-next').waitFor();
 assert.equal(bodies.length,2);assert.equal(bodies[0].submission_key,bodies[1].submission_key);assert.match(bodies[1].reto,/Estrategia/);assert.match(bodies[1].reto,/acompañamiento/);
 await page.locator('.dv-restart').click();await page.reload();assert.equal(await page.locator('.dv-form-shell').getAttribute('data-analytics-step'),'moment');
 await page.goto('http://127.0.0.1:8785/arturo-villagomez.html');await page.locator('[data-analytics-settings]').click();await page.locator('[data-analytics-choice="accepted"]').click();
 const records=await page.evaluate(()=>window.DVAnalytics.records);assert.ok(records.some(e=>e.event==='page_view'&&e.parameters.content_id==='fundador'));
 assert.equal(requests.some(u=>/googletagmanager|google-analytics/.test(u)),false);
 // Export social cards from their existing code-native templates.
 await page.setViewportSize({width:1200,height:630});
 for(const [template,asset] of [['content','og-content.png'],['diagnostico','og-diagnostico.png']]){
   await page.goto('file:///'+path.join(root,'social-cards',template+'.html').replace(/\\/g,'/'));await page.evaluate(()=>document.fonts.ready);
   await page.screenshot({path:path.join(root,asset)});
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({layouts,form:'success-error-reload-retry-restart passed',founder:'consent-only local measurement',errors},null,2));
 console.log(JSON.stringify({output:out,layouts:layouts.length,errors,form:'passed',analytics:'passed'}));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
