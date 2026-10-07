const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8');
test('article progress follows the measured header and stays above the shared index',()=>{
 const css=read('blog/blog.css');
 assert.match(css,/\.reading-progress\{position:fixed;top:var\(--section-nav,69px\);[^}]*z-index:102/);
 assert.match(css,/\.reading-progress\{top:var\(--section-nav,65px\)\}/);
 for(const name of ['por-que-nacio-don-ventas','contenido-que-atrae-clientes','tu-marca-es-tu-ventaja','manual-de-marca']){
  const h=read('blog/'+name+'.html');assert.equal((h.match(/data-reading-progress/g)||[]).length,1);
  assert.ok(h.includes('/blog/blog.css?v=20261007-reading-progress'));assert.ok(h.includes('src="/blog/blog.js"'));assert.ok(h.includes('data-section-index'));
 }
 for(const name of ['index','glosario']){const h=read('blog/'+name+'.html');assert.ok(h.includes('/blog/blog.css?v=20261007-reading-progress'));assert.doesNotMatch(h,/data-reading-progress/);}
});
