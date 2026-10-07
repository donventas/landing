const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const pages=['index.html','branding.html','arturo-villagomez.html','blog/index.html','blog/por-que-nacio-don-ventas.html','blog/tu-marca-es-tu-ventaja.html','blog/contenido-que-atrae-clientes.html','blog/manual-de-marca.html',...['Centro Legal','Aviso de Privacidad','Terminos y Condiciones','Politica de Cookies'].map(f=>'15_LEGAL/'+f+'.html')];
function unpack(h){const m=h.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/);return m?JSON.parse(m[1]):h;}
for(const file of pages)test('section index: unique native targets and resources — '+file,()=>{
 const h=unpack(read(file)),index=h.match(/<aside class="section-index[\s\S]*?<\/aside>/)?.[0];assert.ok(index);
 assert.equal((h.match(/data-section-index/g)||[]).length,1);
 assert.doesNotMatch(h,/data-article-toc|class="brand-chapters"/);
 const ids=[...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
 const links=[...index.matchAll(/href="#([^"]+)"/g)].map(m=>m[1]);assert.ok(links.length>=2);
 for(const id of links)assert.ok(ids.includes(id),'Missing '+id);
 assert.equal((h.match(/src="\/section-index.js\?v=20261007-1"/g)||[]).length,1);
 assert.equal((h.match(/href="\/section-index.css\?v=20261007-1"/g)||[]).length,1);
 assert.match(index,/<details data-section-index[^>]*>/);
 assert.doesNotMatch(index,/<details[^>]*\sopen[\s>]/);
});
test('tools keep their existing navigation; branding measurement hook retained',()=>{
 for(const f of ['diagnostico.html','blog/glosario.html'])assert.doesNotMatch(read(f),/data-section-index|section-index.js/);
 assert.equal((read('branding.html').match(/data-brand-action="prices-nav"/g)||[]).length,1);
 assert.ok(Buffer.byteLength(read('section-index.css'))<4500);
 assert.ok(Buffer.byteLength(read('section-index.js'))<4000);
});
