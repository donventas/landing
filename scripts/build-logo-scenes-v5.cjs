// Native composition refinement: same clean plates, locked vector geometry.
// No generative edit of people, scenery, typography or the protected mark.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const {chromium}=require('playwright'),{printOn,sculpture}=require('./build-logo-scenes-v2.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.qa-logos'),W=1536,H=1024;
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
async function materialWordmark(mark){
 const svg=Buffer.from(mark.toString().replaceAll('#15130F','#3C4655'));
 const s=await sharp(svg,{density:288}).trim().resize({width:440}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const w=s.info.width,h=s.info.height,front=Buffer.from(s.data),side=Buffer.from(s.data);
 const alpha=(x,y)=>x<0||y<0||x>=w||y>=h?0:s.data[(y*w+x)*4+3]/255;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4;if(!s.data[i+3])continue;
  const edge=(alpha(x+2,y)-alpha(x-2,y)+alpha(x,y+2)-alpha(x,y-2))*.025;
  const hash=Math.sin(x*127.1+y*311.7)*43758.5453;
  const grain=(hash-Math.floor(hash)-.5)*.035;
  const light=1.25-.15*y/h+.075*Math.sin((x+y*.55)/83)+grain;
  const accent=s.data[i+2]>s.data[i]*1.7;
  for(let c=0;c<3;c++){
   const v=s.data[i+c];
   front[i+c]=Math.round(Math.max(0,Math.min(255,v*(accent?1+grain*.35:light)+edge*65)));
   side[i+c]=Math.round(v*.78);
  }
 }
 // Sharp resize info carries an internal premultiplied flag; the exported byte
 // buffer is straight RGBA. Passing that flag back causes pale edge fringes.
 const raw={width:w,height:h,channels:4};
 const layers=[];for(let d=3;d>0;d--)layers.push({input:side,raw,left:100+d,top:110+d});
 const silhouette=Buffer.from(s.data);for(let i=0;i<silhouette.length;i+=4){silhouette[i]=22;silhouette[i+1]=30;silhouette[i+2]=37;silhouette[i+3]=Math.round(silhouette[i+3]*.23);}
 const sh=await sharp({create:{width:W,height:H,channels:4,background:'#0000'}}).composite([{input:silhouette,raw,left:104,top:115}]).blur(3).png().toBuffer();
 layers.unshift({input:sh});layers.push({input:front,raw,left:100,top:110});
 const layer=await sharp({create:{width:W,height:H,channels:4,background:'#0000'}}).composite(layers).png().toBuffer();
 await sharp(layer).trim().toFile(path.join(out,'v5-wordmark-material-proof.png'));
 return{layer,width:w,height:h};
}
async function copyLayer(){
 const f=n=>fs.readFileSync(path.join(root,'assets/fonts',n)).toString('base64');
 const html=`<!doctype html><html lang="es"><meta charset="utf-8"><style>
 @font-face{font-family:Schibsted;src:url(data:font/woff2;base64,${f('schibsted-grotesk-latin-normal.woff2')});font-weight:400 900}
 @font-face{font-family:Space;src:url(data:font/woff2;base64,${f('space-mono-latin-700.woff2')});font-weight:700}
 *{box-sizing:border-box}html,body{margin:0;width:1536px;height:1024px;background:transparent}.copy{position:absolute;left:100px;top:504px;width:485px;color:#0E1117}.folio{font:700 21px/1.4 Space;letter-spacing:1px;margin-bottom:28px}h2{font:800 72px/1.07 Schibsted;letter-spacing:-2.8px;margin:0}.line{display:block;white-space:nowrap}.blue{color:#1B49A0}
 </style><div class="copy"><div class="folio">DON VENTAS / CLARIDAD</div><h2><span class="line">Haz más fácil</span><span class="line blue">entender</span><span class="line blue">tu valor.</span></h2></div></html>`;
 const b=await chromium.launch({channel:'chrome',headless:true});try{
 const p=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});await p.setContent(html);await p.evaluate(()=>document.fonts.ready);
 const bounds=await p.locator('.copy').evaluate(e=>({x:e.offsetLeft,y:e.offsetTop,w:e.offsetWidth,h:e.offsetHeight,maxLineWidth:Math.max(...[...e.querySelectorAll('.line')].map(l=>{const r=document.createRange();r.selectNodeContents(l);return r.getBoundingClientRect().width;}))}));
 if(bounds.maxLineWidth>485||bounds.y+bounds.h>880)throw Error('Copy exceeds reserved space');
 const layer=await p.screenshot({omitBackground:true,timeout:60000});await sharp(layer).toFile(path.join(out,'v5-copy-proof.png'));return{layer,bounds};
 }finally{await b.close();}
}
(async()=>{
 const cover=fs.readFileSync(path.join(out,'logo-vitrina-v2-clean.png'));
 const photoClean=fs.readFileSync(path.join(out,'logo-conversacion-v1-clean.png'));
 const mark=fs.readFileSync(path.join(root,'assets/brand/donventas-wordmark-b6.svg'));
 const sc=await sculpture({width:210,left:649,bottom:446,depth:16,bevel:.12,proofPrefix:'v5-'});
 const shadow=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024"><defs><filter id="s"><feGaussianBlur stdDeviation="13"/></filter></defs><ellipse cx="761" cy="519" rx="76" ry="9" fill="#312319" opacity=".16" filter="url(#s)"/></svg>');
 let hero=await sharp(cover).composite([{input:shadow},{input:sc.layer}]).png().toBuffer();
 const shirtQuad=[[208,451],[302,449],[303,508],[207,511]];hero=await printOn(hero,mark,shirtQuad,W,H);
 await sharp(hero).toFile(path.join(out,'logo-vitrina-v5-master.png'));
 const wordmark=await materialWordmark(mark),copy=await copyLayer();
 const photo=await sharp(photoClean).composite([{input:wordmark.layer},{input:copy.layer}]).png().toBuffer();
 await sharp(photo).toFile(path.join(out,'logo-conversacion-v2-master.png'));
 // Annotated geometry proof only, never a consumer asset. Front aperture is
 // measured at center x=765, between upper/front and bottom/front glass edges.
 const bounds=await sharp(sc.layer).trim().metadata();
 const measured={frontApertureTop:154,frontApertureBottom:544,apertureCenter:349,fullSymbolTop:sc.top-9,fullSymbolBottom:446,symbolCenter:(sc.top-9+446)/2,previousSymbolCenter:(sc.top-9+446)/2-16};
 const proof=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024"><path d="M540 154H995 M540 544H995" stroke="#F326B5" stroke-width="3"/><path d="M540 349H995" stroke="#04A786" stroke-width="3" stroke-dasharray="10 8"/><path d="M637 ${measured.fullSymbolTop}H888 M637 446H888" stroke="#136BF3" stroke-width="2"/></svg>`);
 await sharp(hero).composite([{input:proof}]).toFile(path.join(out,'v5-vitrine-center-proof.png'));
 const files=[];
 for(const[stem,b]of[['logo-vitrina-v5',hero],['logo-conversacion-v2',photo]])for(const width of [480,960,1536]){const file=`assets/editorial/${stem}-${width}.webp`;await sharp(b).resize({width}).webp({quality:82,effort:6}).toFile(path.join(root,file));files.push(file);}
 const social='assets/editorial/logo-vitrina-v5-social.jpg';await sharp(hero).resize(1200,630,{fit:'contain',background:'#eeeae5'}).jpeg({quality:86,mozjpeg:true}).toFile(path.join(root,social));files.push(social);
 const report={classification:'Native composition adaptation per owner request; development only',coverCleanSha256:sha(cover),photoCleanSha256:sha(photoClean),markSha256:sha(mark),measured,shirtQuad,editorialSignature:{x:100,y:110,width:wordmark.width,height:wordmark.height,finish:'Satin gray-blue, preserved alpha/path geometry, micrograin, edge light, 3px relief, soft contact shadow'},copy:{text:'DON VENTAS / CLARIDAD — Haz más fácil entender tu valor.',source:'Owner supplied reference',...copy.bounds},files:[]};
 for(const file of files){const b=fs.readFileSync(path.join(root,file)),m=await sharp(b).metadata();report.files.push({file,bytes:b.length,width:m.width,height:m.height,sha256:sha(b)});}
 fs.writeFileSync(path.join(out,'assets-v5.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
