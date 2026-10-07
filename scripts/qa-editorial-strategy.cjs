// Headless QA against the loopback-only fixture; never sends a real lead.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=fs.mkdtempSync(path.join(os.tmpdir(),'dv-editorial-strategy-'));
const origin='http://127.0.0.1:8788';
const routes=['/','/branding.html','/diagnostico.html','/arturo-villagomez.html','/blog/','/blog/glosario.html','/blog/por-que-nacio-don-ventas.html','/blog/contenido-que-atrae-clientes.html','/blog/tu-marca-es-tu-ventaja.html'];
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const context=await browser.newContext(),page=await context.newPage(),errors=[],requests=[],layouts=[],links=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
 for(const width of [320,390,620,621,768,1120,1121,1440])for(const route of routes){
  await page.setViewportSize({width,height:900});const response=await page.goto(origin+route);assert.equal(response.status(),200,route);
  await page.evaluate(()=>document.fonts.ready);
  const reject=page.locator('[data-analytics-choice="rejected"]');if(await reject.isVisible())await reject.click();
  assert.equal(await page.locator('main h1').count(),1,route);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert.ok(overflow<=1,route+' '+width+' overflow '+overflow);
  layouts.push({route,width,overflow});
  if(width===390){
   const hrefs=await page.locator('a[href]').evaluateAll(as=>as.map(a=>a.href));
   for(const href of hrefs){const u=new URL(href);if(![origin,'https://www.donventas.mx'].includes(u.origin))continue;
    let file=decodeURIComponent(u.pathname).slice(1);if(!file||file.endsWith('/'))file+='index.html';
    const abs=path.join(root,file);assert.ok(fs.existsSync(abs),href);
    if(u.hash){const html=fs.readFileSync(abs,'utf8');assert.ok(html.includes('id="'+decodeURIComponent(u.hash.slice(1))+'"'),href);}
    links.push(href);
   }
  }
  if(['/','/branding.html'].includes(route)&&width<=1120){
   const menu=page.locator('.mobile-explore');await menu.locator('summary').focus();await page.keyboard.press('Enter');assert.equal(await menu.getAttribute('open'),'');
   const box=await menu.locator('.mobile-explore-links').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width+1);
   for(const a of await menu.locator('a').all())assert.ok((await a.boundingBox()).height>=44);
   if(width===390)await page.screenshot({path:path.join(out,(route==='/'?'home':'branding')+'-menu.png')});
   await page.keyboard.press('Escape');assert.equal(await menu.getAttribute('open'),null);
   assert.equal(await menu.locator('summary').evaluate(e=>e===document.activeElement),true);
   await menu.locator('summary').click();await menu.locator('a').filter({hasText:'Cómo trabajamos'}).click();
   assert.equal(await menu.getAttribute('open'),null);assert.equal(await page.evaluate(()=>document.activeElement.id),'metodo');
  }
  if([390,1440].includes(width)){
   for(let y=0;y<await page.evaluate(()=>document.documentElement.scrollHeight);y+=700){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(60);}
   const broken=await page.locator('main img').evaluateAll(imgs=>imgs.filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src));assert.deepEqual(broken,[]);
   await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(250);
   const name=(route==='/'?'home':route.replaceAll('/','-').replace('.html',''))+'-'+width;
   await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});
   await page.screenshot({path:path.join(out,name+'-hero.png')});
  }
 }
 // Native navigation remains usable without JavaScript.
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:900}}),native=await nojs.newPage();
 for(const route of ['/','/branding.html']){await native.goto(origin+route);await native.locator('.mobile-explore summary').click();assert.ok(await native.locator('.mobile-explore a').last().isVisible());}
 await nojs.close();
 // Same glossary term from two articles: return must not leak across tabs.
 for(const from of ['fundacional','entender']){
  const p=await context.newPage();await p.goto(origin+'/blog/glosario.html?from='+from+'&at=campana#campana');
  assert.equal(await p.locator('#campana details').getAttribute('open'),'');
  const expected=from==='fundacional'?'por-que-nacio-don-ventas.html':'contenido-que-atrae-clientes.html';
  assert.match(await p.locator('#campana [data-reading-return]').getAttribute('href'),new RegExp(expected+'#termino-campana'));
  await p.locator('#campana .term-related a').first().click();assert.match(await p.locator('[data-reading-return]').first().getAttribute('href'),new RegExp(expected));
  await p.close();
 }
 await page.goto(origin+'/blog/glosario.html#sistema-de-marca');assert.equal(await page.locator('#sistema-de-marca details').getAttribute('open'),'');
 // Error, reload, retry, success and restart with synthetic inputs only.
 await page.goto(origin+'/diagnostico.html?servicio=web&momento=conectar');
 await page.locator('[data-value="conectar"]').click();await page.locator('.dv-next').click();
 await page.locator('[data-value="estrategia"]').click();await page.locator('.dv-next').click();await page.reload();
 assert.equal(await page.locator('.dv-form-shell').getAttribute('data-analytics-step'),'workingMode');
 assert.equal(await page.locator('[data-value="autonomia"]').count(),0);
 await page.locator('[data-value="acompanamiento"]').click();await page.locator('.dv-next').click();
 await page.locator('[data-field="currentNeed"]').fill('QA ficticio: desarrollar una oferta');await page.locator('.dv-next').click();
 await page.locator('[data-field="existingAssets"]').fill('QA ficticio: equipo y recursos propios');await page.locator('.dv-next').click();
 await page.locator('[data-value="exploring"]').click();await page.locator('.dv-next').click();await page.locator('.dv-next').click();
 await page.locator('[data-field="name"]').fill('QA local');await page.locator('[data-field="business"]').fill('Prueba ficticia');await page.locator('[data-field="email"]').fill('qa@example.test');
 assert.equal(await page.locator('.dv-next').isDisabled(),true);assert.equal(await page.locator('.dv-result').count(),0);
 await page.locator('[data-field="consent"]').check();const bodies=[];
 await page.route('**/api/lead',async r=>{bodies.push(r.request().postDataJSON());await r.fulfill({status:bodies.length===1?503:200,contentType:'application/json',body:JSON.stringify({ok:bodies.length>1,qa:true})});});
 await page.locator('.dv-next').click();await page.locator('.dv-retry').waitFor();await page.reload();await page.locator('.dv-next').click();await page.getByText('Solicitud recibida',{exact:true}).waitFor();
 assert.equal(bodies.length,2);assert.equal(bodies[0].submission_key,bodies[1].submission_key);assert.match(bodies[1].reto,/Estrategia/);
 await page.locator('.dv-restart').click();await page.reload();assert.equal(await page.locator('.dv-form-shell').getAttribute('data-analytics-step'),'moment');
 assert.equal(requests.some(u=>/googletagmanager|google-analytics/.test(u)),false);assert.deepEqual(errors,[]);
 const report={browser:browser.version(),layouts:layouts.length,internalLinksChecked:links.length,nativeMenu:'pass',glossaryReturn:'pass',form:'error/reload/retry/success/restart and consent passed',errors,output:out};
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
