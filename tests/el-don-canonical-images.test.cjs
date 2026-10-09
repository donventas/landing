const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
// Visual rule confirmed by Arturo: El Don has NO eye inside his monocle.
// Arturo's human avatar DOES retain the eye. Pixel identity needs visual review.
test('recent scenes use the reviewed monocle revision, with no stale image consumers',()=>{
 const files=['blog/index.html','blog/tu-marca-es-tu-ventaja.html','blog/contenido-que-atrae-clientes.html'];
 for(const file of files){const html=fs.readFileSync(path.join(root,file),'utf8');assert.doesNotMatch(html,/joyeria-el-don-v[12]|oferta-entendida-el-don-v[12]|joyeria-cuidado-el-don-v[123]|og-marca-el-don-v[12]/);}
 for(const family of ['joyeria-el-don-v3','oferta-entendida-el-don-v3','joyeria-cuidado-el-don-v4'])for(const width of [480,960,1440]){const data=fs.readFileSync(path.join(root,`assets/editorial/${family}-${width}.webp`));assert.equal(data.toString('ascii',8,12),'WEBP');assert.ok(data.length<160000);}
});
