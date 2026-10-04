// Mechanical rasterization of the pinned canonical SVG, including browser fallback.
const fs=require('node:fs'),path=require('node:path');
const sharp=require(process.env.SHARP_MODULE||'sharp'),root=path.resolve(__dirname,'..');
(async()=>{
 for(const [file,size] of [['favicon-32.png',32],['favicon-192.png',192],['apple-touch-icon.png',180]]) await sharp(path.join(root,'favicon.svg'),{density:384}).resize(size,size).png().toFile(path.join(root,file));
 const png=await sharp(path.join(root,'favicon.svg'),{density:384}).resize(48,48).png().toBuffer();
 const h=Buffer.alloc(22);h.writeUInt16LE(1,2);h.writeUInt16LE(1,4);h[6]=48;h[7]=48;h.writeUInt16LE(1,10);h.writeUInt16LE(32,12);h.writeUInt32LE(png.length,14);h.writeUInt32LE(22,18);
 fs.writeFileSync(path.join(root,'favicon.ico'),Buffer.concat([h,png]));
})().catch(e=>{console.error(e);process.exitCode=1;});
