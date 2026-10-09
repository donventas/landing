// Export the three image-tool corrections; do not overwrite approved historical assets.
const fs=require('node:fs'),path=require('node:path');
const sharp=require(process.env.SHARP_MODULE||'sharp');
const root=path.resolve(__dirname,'..');
const stems=['joyeria-el-don-v3','joyeria-cuidado-el-don-v4','oferta-entendida-el-don-v3'];
async function main(){
 const inputs=process.argv.slice(2);
 if(inputs.length!==3)throw Error('Provide the three corrected masters in cover, care, offer order');
 for(let i=0;i<3;i++){
  for(const width of [480,960,1440])await sharp(inputs[i]).resize({width}).webp({quality:82,effort:6}).toFile(path.join(root,`assets/editorial/${stems[i]}-${width}.webp`));
 }
 await sharp(inputs[0]).resize(1200,630,{fit:'contain',background:'#10151d'}).jpeg({quality:86,mozjpeg:true}).toFile(path.join(root,'og-marca-el-don-v3.jpg'));
 console.log('Exported 9 responsive assets and the matching social cover.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
