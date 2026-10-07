// V6 changes only the material field inside the exact B6 silhouette.
// Photo, native copy layer, position, size and cover remain as in v5.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.qa-logos'),W=1536,H=1024;
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const mark=fs.readFileSync(path.join(root,'assets/brand/donventas-wordmark-b6.svg'));
 const s=await sharp(mark,{density:288}).trim().resize({width:440}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const w=s.info.width,h=s.info.height,raw={width:w,height:h,channels:4},front=Buffer.from(s.data),side=Buffer.from(s.data);
 const alpha=(x,y)=>x<0||y<0||x>=w||y>=h?0:s.data[(y*w+x)*4+3]/255;
 // One continuous lighting field across the whole wordmark, never per letter.
 const tones={shadow:[45,67,76],light:[119,143,146]};
 const ranges={min:1,max:0};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4;if(!s.data[i+3])continue;
  const u=x/w,v=y/h;
  const broad=Math.exp(-((u-.64)**2/.08+(v-.8)**2/.2));
  const topWash=Math.exp(-((u-.15)**2/.13+(v-.08)**2/.1));
  const cloud=.07*Math.sin(u*10+v*4)+.035*Math.cos(u*23-v*11);
  const hash=Math.sin(x*127.1+y*311.7)*43758.5453;
  const grain=(hash-Math.floor(hash)-.5)*.035;
  const t=Math.max(0,Math.min(1,.14+.74*broad+.26*topWash+cloud+grain));
  const edge=(alpha(x+2,y)-alpha(x-2,y)+alpha(x,y+2)-alpha(x,y-2))*.024;
  const accent=s.data[i+2]>s.data[i]*1.7;
  if(!accent){ranges.min=Math.min(ranges.min,t);ranges.max=Math.max(ranges.max,t);}
  for(let c=0;c<3;c++){
   const face=accent?s.data[i+c]*(.99+.035*broad+grain*.35):tones.shadow[c]+(tones.light[c]-tones.shadow[c])*t;
   front[i+c]=Math.round(Math.max(0,Math.min(255,face+edge*65)));
   side[i+c]=Math.round(face*.88);
  }
 }
 const layers=[];
 const silhouette=Buffer.from(s.data);for(let i=0;i<silhouette.length;i+=4){silhouette[i]=28;silhouette[i+1]=43;silhouette[i+2]=49;silhouette[i+3]=Math.round(silhouette[i+3]*.15);}
 const shadow=await sharp({create:{width:W,height:H,channels:4,background:'#0000'}}).composite([{input:silhouette,raw,left:103,top:114}]).blur(3).png().toBuffer();
 layers.push({input:shadow});for(let d=2;d>0;d--)layers.push({input:side,raw,left:100+d,top:110+d});layers.push({input:front,raw,left:100,top:110});
 const material=await sharp({create:{width:W,height:H,channels:4,background:'#0000'}}).composite(layers).png().toBuffer();
 await sharp(material).trim().toFile(path.join(out,'v6-wordmark-material-proof.png'));
 const photoClean=fs.readFileSync(path.join(out,'logo-conversacion-v1-clean.png')),copy=fs.readFileSync(path.join(out,'v5-copy-proof.png'));
 const photo=await sharp(photoClean).composite([{input:material},{input:copy}]).png().toBuffer();
 await sharp(photo).toFile(path.join(out,'logo-conversacion-v3-master.png'));
 const files=[];for(const width of [480,960,1536]){const file=`assets/editorial/logo-conversacion-v3-${width}.webp`;await sharp(photo).resize({width}).webp({quality:82,effort:6}).toFile(path.join(root,file));const b=fs.readFileSync(path.join(root,file)),m=await sharp(b).metadata();files.push({file,bytes:b.length,width:m.width,height:m.height,sha256:sha(b)});}
 const report={classification:'Owner-approved contextual material refinement; development only',canonicalMarkSha256:sha(mark),photoCleanSha256:sha(photoClean),copyLayerSha256:sha(copy),protected:'Exact paths, alpha, photo, copy, placement, dimensions and v5 cover',finish:{tones,ranges,reliefPx:2,shadowOpacity:.15,continuousField:true},files};
 fs.writeFileSync(path.join(out,'assets-v6.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
