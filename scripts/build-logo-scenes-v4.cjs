// V4: same editable cover scene, floating exact symbol, new editorial photo.
// Gray-blue treatment is a user-requested contextual candidate, not a new master.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const {printOn,sculpture}=require('./build-logo-scenes-v2.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.qa-logos');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const photoPath=process.argv[2];if(!photoPath)throw Error('Provide selected 1536x1024 clean plate');
 const cover=fs.readFileSync(path.join(out,'logo-vitrina-v2-clean.png')),photoClean=fs.readFileSync(photoPath);
 const meta=await sharp(photoClean).metadata();if(meta.width!==1536||meta.height!==1024)throw Error('Unexpected photo size');
 fs.copyFileSync(photoPath,path.join(out,'logo-conversacion-v1-clean.png'));
 const mark=fs.readFileSync(path.join(root,'assets/brand/donventas-wordmark-b6.svg'));
 // Interior glass y150..515. Full front + rear extrusion center at y333.
 const sc=await sculpture({width:210,left:649,bottom:430,depth:16,bevel:.12,proofPrefix:'v4-'});
 const floorShadow=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024"><defs><filter id="s"><feGaussianBlur stdDeviation="13"/></filter></defs><ellipse cx="761" cy="519" rx="76" ry="9" fill="#312319" opacity=".16" filter="url(#s)"/></svg>');
 let hero=await sharp(cover).composite([{input:floorShadow},{input:sc.layer}]).png().toBuffer();
 const shirtQuad=[[208,451],[302,449],[303,508],[207,511]];
 hero=await printOn(hero,mark,shirtQuad,1536,1024);
 await sharp(hero).toFile(path.join(out,'logo-vitrina-v4-master.png'));
 // Uniform scale; unchanged path geometry. Two explicit palette roles only.
 const treatment=mark.toString().replaceAll('#15130F','#3C4655');
 const signature=await sharp(Buffer.from(treatment),{density:288}).trim().resize({width:490}).png().toBuffer();
 await sharp(signature).toFile(path.join(out,'v4-wordmark-color-proof.png'));
 const signatureMeta=await sharp(signature).metadata();
 // Flat editorial identity, NOT wall signage. No shadow, panel or tonal texture
 // that would reduce contrast or suggest installation on the physical wall.
 const photo=await sharp(photoClean).composite([{input:signature,left:105,top:180}]).png().toBuffer();
 await sharp(photo).toFile(path.join(out,'logo-conversacion-v1-master.png'));
 const files=[];
 for(const[stem,b]of[['logo-vitrina-v4',hero],['logo-conversacion-v1',photo]])for(const width of [480,960,1536]){
  const file=`assets/editorial/${stem}-${width}.webp`;await sharp(b).resize({width}).webp({quality:82,effort:6}).toFile(path.join(root,file));files.push(file);
 }
 const social='assets/editorial/logo-vitrina-v4-social.jpg';await sharp(hero).resize(1200,630,{fit:'contain',background:'#eeeae5'}).jpeg({quality:86,mozjpeg:true}).toFile(path.join(root,social));files.push(social);
 const report={classification:'User-requested editorial candidate; no canonical mark change; development only',coverCleanSha256:sha(cover),photoCleanSha256:sha(photoClean),symbol:{sourceSha256:sha(sc.source),width:210,left:649,bottom:430,top:sc.top,depth:16,interiorGlassY:[150,515],mode:'Static levitation, no visible support, detached soft floor shadow'},shirt:{sourceSha256:sha(mark),quad:shirtQuad},editorialSignature:{sourceSha256:sha(mark),treatmentSha256:sha(Buffer.from(treatment)),width:490,height:signatureMeta.height,left:105,top:180,ink:'#3C4655',accent:'#3B74F2',transform:'Exact paths, uniform scale, palette-neutral.600 editorial candidate per owner request; no independent backdrop'},files:[]};
 for(const file of files){const b=fs.readFileSync(path.join(root,file)),m=await sharp(b).metadata();report.files.push({file,bytes:b.length,width:m.width,height:m.height,sha256:sha(b)});}
 fs.writeFileSync(path.join(out,'assets-v4.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
