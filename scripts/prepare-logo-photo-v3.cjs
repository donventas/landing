// Geometry-only outpainting scaffold. The original photo stays one whole object.
const sharp=require('sharp'),path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{
 const original=await sharp(path.join(root,'assets/editorial/criterio-metodo-01-06-v2-1448.webp')).resize(1024,768).png().toBuffer();
 await sharp({create:{width:1536,height:1024,channels:3,background:'#423E37'}}).composite([{input:original,left:512,top:256}]).png().toFile(path.join(root,'.qa-logos/metodo-v3-outpaint-scaffold.png'));
})();
