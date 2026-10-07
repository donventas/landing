// Static raster applications: exact SVG alpha geometry; no generated brand artwork.
// Both clean plates are edited with the built-in image tool. This compositor owns
// the locked inserts, declared material/light treatment and responsive derivatives.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.qa-logos'),W=1536,H=1024;
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const svgFile=n=>path.join(root,'assets/brand',n);
const raw=b=>sharp(b).ensureAlpha().raw().toBuffer({resolveWithObject:true});
function solve(a,b){a=a.map((r,i)=>[...r,b[i]]);for(let i=0;i<b.length;i++){let k=i;for(let j=i+1;j<b.length;j++)if(Math.abs(a[j][i])>Math.abs(a[k][i]))k=j;[a[i],a[k]]=[a[k],a[i]];const v=a[i][i];if(Math.abs(v)<1e-10)throw Error('Singular plane');a[i]=a[i].map(x=>x/v);for(let j=0;j<b.length;j++)if(j!==i){const f=a[j][i];a[j]=a[j].map((x,n)=>x-f*a[i][n]);}}return a.map(r=>r[b.length]);}
function homography(from,to){const a=[],b=[];from.forEach(([x,y],i)=>{const[u,v]=to[i];a.push([x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]);b.push(u,v)});return solve(a,b);}
async function printOn(base,mark,quad,w,h){
 const src=await raw(await sharp(mark).resize({width:840}).png().toBuffer()),dst=await raw(base),sw=src.info.width,sh=src.info.height;
 const m=homography(quad,[[0,0],[sw-1,0],[sw-1,sh-1],[0,sh-1]]),layer=Buffer.alloc(w*h*4);
 const x0=Math.max(0,Math.floor(Math.min(...quad.map(p=>p[0])))),x1=Math.min(w-1,Math.ceil(Math.max(...quad.map(p=>p[0])))),y0=Math.max(0,Math.floor(Math.min(...quad.map(p=>p[1])))),y1=Math.min(h-1,Math.ceil(Math.max(...quad.map(p=>p[1]))));
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  const d=m[6]*x+m[7]*y+1,u=(m[0]*x+m[1]*y+m[2])/d,v=(m[3]*x+m[4]*y+m[5])/d;
  if(u<0||u>=sw-1||v<0||v>=sh-1)continue;
  const ix=Math.floor(u),iy=Math.floor(v),fx=u-ix,fy=v-iy,p=(y*w+x)*4;
  for(let c=0;c<4;c++){let val=0;for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++)val+=src.data[((iy+dy)*sw+ix+dx)*4+c]*(dx?fx:1-fx)*(dy?fy:1-fy);
   if(c<3){const lum=(dst.data[p]+dst.data[p+1]+dst.data[p+2])/3/255;val*=.75+.25*lum;}else val*=.92+(((x*31+y*17)%13)/13)*.06;
   layer[p+c]=Math.round(val);
  }
 }
 return sharp(base).composite([{input:layer,raw:{width:w,height:h,channels:4}}]).png().toBuffer();
}
async function sculpture({width=300,left=606,bottom=514,depth=28,bevel=.22,proofPrefix=''}={}){
 const mark=fs.readFileSync(svgFile('donventas-symbol-b.svg'));
 // Alpha trimmed without altering intrinsic path coordinates or relative spacing.
 const flat=await sharp(mark,{density:720}).trim().resize({width}).png().toBuffer();
 const s=await raw(flat),w=s.info.width,h=s.info.height,side=Buffer.from(s.data),front=Buffer.from(s.data);
 const alpha=(x,y)=>x<0||y<0||x>=w||y>=h?0:s.data[(y*w+x)*4+3]/255;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const p=(y*w+x)*4,a=alpha(x,y);if(!a)continue;
  const nx=alpha(x+3,y)-alpha(x-3,y),ny=alpha(x,y+3)-alpha(x,y-3),edge=(nx+ny)*bevel;
  for(let c=0;c<3;c++){side[p+c]=Math.round(s.data[p+c]*.58+7);front[p+c]=Math.max(0,Math.min(255,Math.round(s.data[p+c]*(1+edge)+Math.max(0,edge)*115)));}
 }
 const top=bottom-h;
 const parts=[];for(let i=depth;i>=1;i--)parts.push({input:side,raw:{width:w,height:h,channels:4},left:left+i,top:top-Math.round(i*.55)});
 parts.push({input:front,raw:{width:w,height:h,channels:4},left,top});
 const layer=await sharp({create:{width:W,height:H,channels:4,background:'#00000000'}}).composite(parts).png().toBuffer();
 await sharp(flat).toFile(path.join(out,proofPrefix+'symbol-source-proof.png'));
 await sharp(layer).trim().png().toFile(path.join(out,proofPrefix+'symbol-sculpture-proof.png'));
 return {layer,height:h,top,source:mark};
}
if(require.main===module)(async()=>{
 const[coverPath,photoPath]=process.argv.slice(2);if(!coverPath||!photoPath)throw Error('Provide two selected built-in clean plates');fs.mkdirSync(out,{recursive:true});
 const cover=fs.readFileSync(coverPath),photoGenerated=fs.readFileSync(photoPath),cm=await sharp(cover).metadata();if(cm.width!==W||cm.height!==H)throw Error('Cover size');
 fs.copyFileSync(coverPath,path.join(out,'logo-vitrina-v2-clean.png'));fs.copyFileSync(photoPath,path.join(out,'logo-metodo-v1-clean.png'));
 const sc=await sculpture(),floorY=251+sc.height;
 const shadow=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024"><defs><filter id="s"><feGaussianBlur stdDeviation="7"/></filter></defs><ellipse cx="762" cy="${floorY+3}" rx="152" ry="10" fill="#312319" opacity=".28" filter="url(#s)"/></svg>`);
 let composite=await sharp(cover).composite([{input:shadow},{input:sc.layer}]).png().toBuffer();
 const mark=fs.readFileSync(svgFile('donventas-wordmark-b6.svg')),shirtQuad=[[167,448],[340,445],[342,552],[164,559]];
 composite=await printOn(composite,mark,shirtQuad,W,H);await sharp(composite).toFile(path.join(out,'logo-vitrina-v2-master.png'));
 // Preserve all original photographed cards, printing, hand and context exactly.
 // Only the lower-left notebook/folder region comes from the imagegen edit.
 const original=fs.readFileSync(path.join(root,'assets/editorial/criterio-metodo-01-06-v2-1448.webp'));
 const pw=1448,ph=1086,originalRaw=await raw(original),generatedRaw=await raw(await sharp(photoGenerated).resize(pw,ph,{fit:'fill'}).png().toBuffer()),mix=Buffer.from(originalRaw.data);
 for(let y=770;y<ph;y++)for(let x=0;x<460;x++){
  // This boundary stays strictly left of CLIENTE/MENSAJE and beneath PROBLEMA.
  const limit=222+(y-770)*.73,opacity=Math.min(1,(y-770)/15,Math.max(0,(limit-x)/16));
  if(opacity<=0)continue;const p=(y*pw+x)*4;for(let c=0;c<3;c++)mix[p+c]=Math.round(originalRaw.data[p+c]*(1-opacity)+generatedRaw.data[p+c]*opacity);
 }
 let photo=await sharp(mix,{raw:{width:pw,height:ph,channels:4}}).png().toBuffer();
 const folderQuad=[[38,900],[228,848],[301,942],[105,1003]];
 photo=await printOn(photo,mark,folderQuad,pw,ph);await sharp(photo).toFile(path.join(out,'logo-metodo-v1-master.png'));
 const files=[];
 for(const[stem,buffer,widths]of[['logo-vitrina-v2',composite,[480,960,1536]],['logo-metodo-v1',photo,[480,960,1448]]])for(const width of widths){const file=`assets/editorial/${stem}-${width}.webp`;await sharp(buffer).resize({width}).webp({quality:82,effort:6}).toFile(path.join(root,file));files.push(file);}
 const social='assets/editorial/logo-vitrina-v2-social.jpg';await sharp(composite).resize(1200,630,{fit:'contain',background:'#eeeae5'}).jpeg({quality:86,mozjpeg:true}).toFile(path.join(root,social));files.push(social);
 const report={mode:'Static editorial raster, not native 3D or a manufactured product',coverCleanSha256:sha(cover),photoCleanSha256:sha(photoGenerated),originalPhotoSha256:sha(original),protectedInserts:[{file:'assets/brand/donventas-symbol-b.svg',sha256:sha(sc.source),treatment:'Exact alpha extrusion 28px, front bevel lighting, floor shadow; no path changes'},{file:'assets/brand/donventas-wordmark-b6.svg',sha256:sha(mark),shirtQuad,folderQuad,treatment:'Projective print with substrate luminance and deterministic micrograin, no independent background'}],files:[]};
 for(const file of files){const b=fs.readFileSync(path.join(root,file)),m=await sharp(b).metadata();report.files.push({file,bytes:b.length,width:m.width,height:m.height,sha256:sha(b)})}
 fs.writeFileSync(path.join(out,'assets-v2.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
module.exports={printOn,sculpture};
