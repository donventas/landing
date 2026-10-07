// Approved editorial adaptation, using exact SVG inserts and one whole photo.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const {printOn,sculpture}=require('./build-logo-scenes-v2.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.qa-logos'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const photoPath=process.argv[2];if(!photoPath)throw Error('Provide selected 1536x1024 outpaint');
 const cover=fs.readFileSync(path.join(out,'logo-vitrina-v2-clean.png')),newPhoto=fs.readFileSync(photoPath),meta=await sharp(newPhoto).metadata();
 if(meta.width!==1536||meta.height!==1024)throw Error('Unexpected outpaint geometry');
 fs.copyFileSync(photoPath,path.join(out,'logo-metodo-v2-clean.png'));
 const sc=await sculpture({width:210,left:649,bottom:514,depth:16,bevel:.12,proofPrefix:'v3-'});
 const shadow=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024"><defs><filter id="s"><feGaussianBlur stdDeviation="6"/></filter></defs><ellipse cx="760" cy="517" rx="107" ry="8" fill="#312319" opacity=".25" filter="url(#s)"/></svg>');
 const mark=fs.readFileSync(path.join(root,'assets/brand/donventas-wordmark-b6.svg'));
 let hero=await sharp(cover).composite([{input:shadow},{input:sc.layer}]).png().toBuffer();
 const shirtQuad=[[208,451],[302,449],[303,508],[207,511]];
 hero=await printOn(hero,mark,shirtQuad,1536,1024);await sharp(hero).toFile(path.join(out,'logo-vitrina-v3-master.png'));
 // Reinsert the exact original photo as a single uniformly scaled unit.
 // Feather only outermost 28px of its top/left background, away from all text.
 const original=fs.readFileSync(path.join(root,'assets/editorial/criterio-metodo-01-06-v2-1448.webp'));
 const src=await sharp(original).resize(1024,768).ensureAlpha().raw().toBuffer();
 const dst=await sharp(newPhoto).ensureAlpha().raw().toBuffer();
 for(let y=0;y<768;y++)for(let x=0;x<1024;x++){
  const a=Math.min(1,x/28,y/28),i=(y*1024+x)*4,j=((y+256)*1536+x+512)*4;
  for(let c=0;c<3;c++)dst[j+c]=Math.round(src[i+c]*a+dst[j+c]*(1-a));
 }
 let photo=await sharp(dst,{raw:{width:1536,height:1024,channels:4}}).png().toBuffer();
 // Front-facing editorial signature, not an applied object or a watermark.
 // Complete original SVG; light/material texture does not change its alpha.
 const ink=await sharp(mark,{density:288}).resize({width:390}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let y=0;y<ink.info.height;y++)for(let x=0;x<ink.info.width;x++){
  const i=(y*ink.info.width+x)*4,n=((x*29+y*43)%23)/23,light=.97+.03*n;
  for(let c=0;c<3;c++)ink.data[i+c]=Math.round(ink.data[i+c]*light);
 }
 const art=await sharp(ink.data,{raw:ink.info}).png().toBuffer();
 const silhouette=await sharp(art).blur(1.5).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let i=0;i<silhouette.data.length;i+=4){silhouette.data[i]=21;silhouette.data[i+1]=19;silhouette.data[i+2]=15;silhouette.data[i+3]=Math.round(silhouette.data[i+3]*.13);}
 photo=await sharp(photo).composite([{input:silhouette.data,raw:silhouette.info,left:146,top:82},{input:art,left:145,top:80}]).png().toBuffer();
 await sharp(photo).toFile(path.join(out,'logo-metodo-v2-master.png'));
 const files=[];
 for(const[stem,b]of[['logo-vitrina-v3',hero],['logo-metodo-v2',photo]])for(const width of [480,960,1536]){
  const file=`assets/editorial/${stem}-${width}.webp`;await sharp(b).resize({width}).webp({quality:82,effort:6}).toFile(path.join(root,file));files.push(file);
 }
 const social='assets/editorial/logo-vitrina-v3-social.jpg';await sharp(hero).resize(1200,630,{fit:'contain',background:'#eeeae5'}).jpeg({quality:86,mozjpeg:true}).toFile(path.join(root,social));files.push(social);
 const report={classification:'Approved editorial adaptation; development only',coverCleanSha256:sha(cover),photoCleanSha256:sha(newPhoto),originalPhotoSha256:sha(original),photoUnit:{left:512,top:256,width:1024,height:768,fit:'uniform',edgeFeather:28},symbol:{sourceSha256:sha(sc.source),width:210,left:649,bottom:514,depth:16},shirt:{sourceSha256:sha(mark),quad:shirtQuad},editorialSignature:{sourceSha256:sha(mark),width:390,left:145,top:80,transform:'Uniform scale; 0.97–1 light modulation, preserved alpha, 13% subtle shadow, no separate backdrop'},files:[]};
 for(const file of files){const b=fs.readFileSync(path.join(root,file)),m=await sharp(b).metadata();report.files.push({file,bytes:b.length,width:m.width,height:m.height,sha256:sha(b)});}
 fs.writeFileSync(path.join(out,'assets-v3.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
