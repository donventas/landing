// Read-only public deployment QA: no leads, no consent acceptance, no analytics.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.qa-logos');
const origin='https://www.donventas.mx',route='/blog/logotipos-mitos.html',url=origin+route;
const report={time:new Date().toISOString(),url,http:[],assets:[],layouts:[],performance:[],errors:[],blocked:[]};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  for(const file of [route,'/blog/','/blog/glosario.html','/blog/manual-de-marca.html','/arturo-villagomez.html','/sitemap.xml','/robots.txt','/llms.txt']){
   const start=performance.now(),res=await fetch(origin+file),body=await res.text();
   assert.equal(res.status,200,file);assert.doesNotMatch(res.headers.get('x-robots-tag')||'',/noindex/i);
   if(file==='/sitemap.xml')assert.ok(body.includes(url));
   if(file==='/robots.txt')assert.ok(body.includes('Sitemap: '+origin+'/sitemap.xml'));
   if(file===route)assert.ok(body.includes('Y no todo se resuelve eligiendo otra versión'));
   report.http.push({file,status:res.status,bytes:Buffer.byteLength(body),elapsedMs:Math.round(performance.now()-start),headers:Object.fromEntries(['content-type','content-encoding','cache-control','x-vercel-cache','x-robots-tag','content-security-policy','etag'].map(k=>[k,res.headers.get(k)]))});
  }
  for(const file of ['logo-vitrina-v5-480.webp','logo-vitrina-v5-960.webp','logo-vitrina-v5-1536.webp','logo-vitrina-v5-social.jpg','logo-conversacion-v3-480.webp','logo-conversacion-v3-960.webp','logo-conversacion-v3-1536.webp']){
   const res=await fetch(origin+'/assets/editorial/'+file),b=Buffer.from(await res.arrayBuffer());assert.equal(res.status,200);assert.equal(hash(b),hash(fs.readFileSync(path.join(root,'assets/editorial',file))));
   const cached=await fetch(origin+'/assets/editorial/'+file,{headers:{'If-None-Match':res.headers.get('etag')}});
   report.assets.push({file,bytes:b.length,sha256:hash(b),cacheControl:res.headers.get('cache-control'),revalidation:cached.status});
  }
  const plans=[... [320,390,768,1440].map(width=>({width,throttle:false})),...Array.from({length:3},(_,i)=>({width:390,throttle:true,run:i+1}))];
  for(const plan of plans){
   const c=await browser.newContext({viewport:{width:plan.width,height:844},deviceScaleFactor:1,reducedMotion:'reduce'});
   await c.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin!==origin||u.pathname.startsWith('/_vercel/')){report.blocked.push(u.href);return r.abort();}return r.continue();});
   const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));p.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
   await p.addInitScript(()=>{window.qaVitals={cls:0,lcp:null,events:[]};new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.qaVitals.cls+=e.value;}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())window.qaVitals.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(e.interactionId)window.qaVitals.events.push({name:e.name,duration:e.duration});}).observe({type:'event',buffered:true,durationThreshold:16});});
   const cd=await c.newCDPSession(p);await cd.send('Network.enable');await cd.send('Network.setCacheDisabled',{cacheDisabled:true});
   if(plan.throttle){await cd.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1600000/8,uploadThroughput:750000/8});await cd.send('Emulation.setCPUThrottlingRate',{rate:4});}
   await p.goto(url,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.locator('.article-cover-figure img').evaluate(i=>i.decode());await p.waitForTimeout(1500);
   const vitals=await p.evaluate(()=>({...window.qaVitals,ttfb:performance.getEntriesByType('navigation')[0].responseStart,resources:performance.getEntriesByType('resource').map(e=>({name:e.name,encodedBodySize:e.encodedBodySize,transferSize:e.transferSize}))}));
   assert.ok(vitals.lcp>0,'LCP must be observed, not interpreted from zero');
   report.performance.push({...plan,conditions:plan.throttle?'Chrome lab: cold browser cache, 1.6 Mbps down/750 Kbps up,150ms RTT,4x CPU,DPR1':'Chrome lab: cold browser cache,unthrottled,DPR1',...vitals});
   const rejected=p.locator('[data-analytics-choice="rejected"]');if(await rejected.isVisible())await rejected.click();
   assert.equal(await p.locator('h1').count(),1);assert.equal(await p.locator('link[rel=canonical]').getAttribute('href'),url);
   assert.doesNotMatch(await p.locator('meta[name=robots]').getAttribute('content'),/noindex/);
   const schema=await p.locator('script[type="application/ld+json"]').evaluateAll(es=>es.map(e=>JSON.parse(e.textContent)));assert.ok(schema[0]['@graph'].some(x=>x['@type']==='BlogPosting'));assert.ok(schema[0]['@graph'].some(x=>x['@type']==='BreadcrumbList'));
   if(!plan.throttle){
    report.seo={title:await p.title(),description:await p.locator('meta[name=description]').getAttribute('content'),canonical:url,schema};
    for(const img of await p.locator('main img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());}
    assert.equal(await p.locator('main img').evaluateAll(es=>es.filter(i=>!i.complete||!i.naturalWidth||!i.alt).length),0);
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1);
    await p.locator('[data-section-index]>summary').click();await p.locator('[data-section-index] a[href="#contexto"]').click();assert.equal(new URL(p.url()).hash,'#contexto');
    await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:path.join(out,'production-'+plan.width+'.png')});report.layouts.push({width:plan.width,images:'PASS',overflow:false,index:'PASS'});
    if(plan.width===1440){
     const links=await p.locator('a[href]').evaluateAll(es=>[...new Set(es.map(e=>e.href))]);report.links=[];
     for(const link of links){const u=new URL(link);if(u.origin!==origin)continue;u.hash='';const res=await fetch(u);report.links.push({url:u.href,status:res.status});assert.ok(res.status<400,u.href);}
    }
   }
   await c.close();
  }
  assert.deepEqual(report.errors,[]);report.status='PASS';
 }finally{await browser.close();fs.writeFileSync(path.join(out,'production-report.json'),JSON.stringify(report,null,2));}
 console.log(JSON.stringify({status:report.status,http:report.http.map(x=>({file:x.file,status:x.status,bytes:x.bytes})),assets:report.assets,layouts:report.layouts,performance:report.performance.map(({resources,...x})=>x),errors:report.errors},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
