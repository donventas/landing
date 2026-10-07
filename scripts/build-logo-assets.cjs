// Exact canonical asset insertion and mechanical encoding; no generative logo edits.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.qa-logos');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const source=process.argv[2];if(!source)throw Error('Pass selected clean plate PNG');
 fs.mkdirSync(out,{recursive:true});
 const plate=fs.readFileSync(source),meta=await sharp(plate).metadata();
 if(meta.width!==1536||meta.height!==1024)throw Error('Expected 1536x1024 clean plate');
 fs.copyFileSync(source,path.join(out,'logo-vitrina-v1-clean.png'));
 const mark=fs.readFileSync(path.join(root,'assets/brand/donventas-wordmark-b6-reverse.svg'));
 // Plaque observed at x618..913, y265..506. Uniform scale and translation only.
 const insert=await sharp(mark,{density:144}).resize({width:231}).png().toBuffer();
 const composite=await sharp(plate).composite([{input:insert,left:650,top:312}]).png().toBuffer();
 fs.writeFileSync(path.join(out,'logo-vitrina-v1-master.png'),composite);
 const files=[];
 for(const width of [480,960,1536]){
  const file=`assets/editorial/logo-vitrina-v1-${width}.webp`;
  await sharp(composite).resize({width}).webp({quality:82,effort:6}).toFile(path.join(root,file));files.push(file);
 }
 const social='assets/editorial/logo-vitrina-v1-social.jpg';
 await sharp(composite).resize(1200,630,{fit:'contain',background:'#eeeae5'}).jpeg({quality:86,mozjpeg:true}).toFile(path.join(root,social));files.push(social);
 const report={cleanPlateSha256:sha(plate),insertSource:'assets/brand/donventas-wordmark-b6-reverse.svg',insertSha256:sha(mark),placement:{left:650,top:312,width:231},masterSha256:sha(composite),files:[]};
 for(const file of files){const b=fs.readFileSync(path.join(root,file)),m=await sharp(b).metadata();report.files.push({file,bytes:b.length,width:m.width,height:m.height,sha256:sha(b)});}
 fs.writeFileSync(path.join(out,'assets.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})();
