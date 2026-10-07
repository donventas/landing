// Local fixture, blocked third-party traffic, no lead submissions.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createServer}=require('./editorial-qa-server.cjs');
const articles=['por-que-nacio-don-ventas','contenido-que-atrae-clientes','tu-marca-es-tu-ventaja','manual-de-marca'];
const baseline=process.argv.includes('--baseline'),out=path.resolve(__dirname,'../.qa-manual');
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'chrome',headless:true}),report={baseline,samples:[],errors:[]};
 try{
  for(const width of (baseline?[390,1440]:[320,390,768,900,1440])){
   const c=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   await c.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
   const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));
   for(const name of articles){
    await p.goto(origin+'/blog/'+name+'.html');await p.evaluate(()=>document.fonts.ready);
    const reject=p.locator('[data-analytics-choice="rejected"]');if(await reject.isVisible())await reject.click();
    for(const fraction of (baseline?[.5]:[0,.5,1])){
     await p.evaluate(f=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*f,behavior:'instant'}),fraction);
     await p.waitForFunction(f=>Math.abs(parseFloat(document.querySelector('[data-reading-progress]').style.width)-f*100)<.4,fraction);
     await p.waitForFunction(f=>Math.abs(document.querySelector('[data-reading-progress]').getBoundingClientRect().width/innerWidth*100-f*100)<.4,fraction);
     const data=await p.evaluate(()=>{const bar=document.querySelector('.reading-progress'),fill=bar.firstElementChild,b=bar.getBoundingClientRect(),f=fill.getBoundingClientRect(),nav=document.querySelector('.nav').getBoundingClientRect(),hit=document.elementFromPoint(Math.max(1,f.width/2),b.top+b.height/2);return {top:b.top,navBottom:nav.bottom,fill:f.width,viewport:innerWidth,visible:bar.contains(hit),percent:f.width/innerWidth*100,overflow:document.documentElement.scrollWidth-innerWidth};});
     report.samples.push({name,width,fraction,...data});
     if(!baseline){
      assert.ok(Math.abs(data.top-data.navBottom)<=2,name+' offset '+JSON.stringify(data));
      assert.ok(Math.abs(data.percent-fraction*100)<.4,name+' amount '+data.percent);
      assert.ok(data.overflow<=1);if(fraction>0)assert.ok(data.visible,name+' covered at '+width);
      if(fraction===.5){
       await p.locator('[data-section-index] summary').focus();await p.keyboard.press('Enter');await p.waitForTimeout(120);
       assert.ok(await p.locator('.reading-progress').evaluate(bar=>{const b=bar.getBoundingClientRect();return bar.contains(document.elementFromPoint(3,b.top+1));}),'Index hides progress');
       await p.keyboard.press('Escape');
       if([390,1440].includes(width))await p.screenshot({path:path.join(out,'progress-'+name+'-'+width+'.png')});
      }
     }
    }
    // Recalculate the shared header offset when the viewport changes.
    if(!baseline){await p.setViewportSize({width:width===390?1440:390,height:900});await p.waitForTimeout(160);assert.ok(await p.locator('.reading-progress').evaluate(bar=>Math.abs(bar.getBoundingClientRect().top-document.querySelector('.nav').getBoundingClientRect().bottom)<=2));await p.setViewportSize({width,height:900});}
   }await c.close();
  }
  assert.deepEqual(report.errors,[]);report.pass=true;
 }finally{fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'progress-'+(baseline?'before':'after')+'.json'),JSON.stringify(report,null,2));await browser.close();await new Promise(r=>server.close(r));}
 console.log(JSON.stringify({baseline,samples:report.samples.length,covered:report.samples.filter(s=>s.fraction>0&&!s.visible),pass:report.pass}));
})().catch(e=>{console.error(e);process.exitCode=1;});
