// Mechanical derivatives only: no retouching, cropping or compositing.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const root=path.resolve(__dirname,'..');
async function build(){
 const source=process.argv[2];
 if(!source||!fs.existsSync(source))throw Error('Pass the selected image-generation master');
 const meta=await sharp(source).metadata();
 if(meta.width!==1536||meta.height!==1024)throw Error('Expected 1536 × 1024 master');
 const qa=path.join(root,'.qa-discovery');fs.mkdirSync(qa,{recursive:true});
 fs.copyFileSync(source,path.join(qa,'se-busca-v1-master.png'));
 const files=[];
 const record=async file=>{const bytes=fs.readFileSync(path.join(root,file)),info=await sharp(bytes).metadata();files.push({file,width:info.width,height:info.height,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});};
 for(const width of [480,960,1536]){const file=`assets/editorial/se-busca-v1-${width}.webp`;await sharp(source).resize({width}).webp({quality:82,effort:6}).toFile(path.join(root,file));await record(file);}
 const social='assets/editorial/se-busca-v1-social.jpg';
 await sharp(source).resize(1200,630,{fit:'contain',background:'#e9e5dd'}).jpeg({quality:86,mozjpeg:true}).toFile(path.join(root,social));await record(social);
 const report={method:'Uncropped proportional WebP; social contain with neutral margins',masterSha256:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),files};
 fs.writeFileSync(path.join(qa,'assets.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}
build().catch(e=>{console.error(e);process.exitCode=1});
