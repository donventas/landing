const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
test('recent scenes use the reviewed monocle revision, with no stale image consumers',()=>{
 const files=['blog/index.html','blog/tu-marca-es-tu-ventaja.html','blog/contenido-que-atrae-clientes.html'];
 for(const file of files){const html=fs.readFileSync(path.join(root,file),'utf8');assert.doesNotMatch(html,/joyeria-el-don-v1|oferta-entendida-el-don-v1|joyeria-cuidado-el-don-v[12]|og-marca-el-don-v1/);}
 for(const family of ['joyeria-el-don-v2','oferta-entendida-el-don-v2','joyeria-cuidado-el-don-v3'])for(const width of [480,960,1440]){const data=fs.readFileSync(path.join(root,`assets/editorial/${family}-${width}.webp`));assert.equal(data.toString('ascii',8,12),'WEBP');assert.ok(data.length<160000);}
});
