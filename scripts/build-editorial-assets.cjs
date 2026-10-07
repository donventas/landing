// Mechanical, uncropped size/encoding derivatives of the selected AI illustration.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require('sharp');
const root=path.resolve(__dirname,'..');
(async()=>{
 const source=process.argv[2];if(!source||!fs.existsSync(source))throw Error('Pass generated hero master');
 const meta=await sharp(source).metadata();if(meta.width!==1536||meta.height!==1024)throw Error('Expected 1536 × 1024');
 const qa=path.join(root,'.qa-editorial');fs.mkdirSync(qa,{recursive:true});
 fs.copyFileSync(source,path.join(qa,'editorial-reporte-v1-master.png'));
 const files=[];
 for(const width of [480,960,1536]){
  const name=`assets/editorial/editorial-reporte-v1-${width}.webp`;
  await sharp(source).resize({width}).webp({quality:82,effort:6}).toFile(path.join(root,name));
  const bytes=fs.readFileSync(path.join(root,name));const info=await sharp(bytes).metadata();
  files.push({file:name,bytes:bytes.length,width:info.width,height:info.height,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
 }
 const social='assets/editorial/editorial-reporte-v1-social.jpg';
 await sharp(source).resize(1200,630,{fit:'contain',background:'#eee9e1'}).jpeg({quality:86,mozjpeg:true}).toFile(path.join(root,social));
 const socialBytes=fs.readFileSync(path.join(root,social));
 files.push({file:social,bytes:socialBytes.length,width:1200,height:630,sha256:crypto.createHash('sha256').update(socialBytes).digest('hex')});
 const report={masterSha256:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),method:'Uncropped proportional WebP encoding; social JPEG with contain fit and neutral margins',files};
 fs.writeFileSync(path.join(qa,'assets.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
