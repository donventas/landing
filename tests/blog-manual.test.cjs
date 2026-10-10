const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const html=read('blog/manual-de-marca.html');
test('manual keeps approved editorial direction, book attribution and bounded promises',()=>{
 for(const text of ['Perder el archivo tiene solución. Perder esos acuerdos es más complicado.','con John Zeratsky','con Amy Wallace','no una recomendación de los autores','¿cómo convertir una intención de marca en algo que otra persona pueda aplicar?','ningún manual puede sustituir eso','El de tu marca merece estar donde sucede la acción.'])assert.ok(html.toLowerCase().includes(text.toLowerCase()),text);
 assert.doesNotMatch(html,/donde pasan las cosas/i);
 // The approved sentence stays in the dek and closing, while social copy can mention the gift.
 assert.match(html,/<p class="article-dek">El del televisor puede seguir en el cajón\. El de tu marca merece estar donde sucede la acción\.<\/p>/);
 assert.match(html,/<p class="opening-line"><strong>El de tu marca merece estar donde sucede la acción\.<\/strong><\/p>/);
 for(const url of ['https://www.simonandschuster.com/books/Click/Jake-Knapp/9781668072110','https://www.amy-wallace.com/creativity-inc'])assert.equal(html.split('href="'+url+'"').length-1,2);
 assert.doesNotMatch(html,/readwise\.io|OneDrive|07_FUNDACION|1048473431/);
 assert.match(html,/momento=integrar&amp;servicio=identidad/);
 assert.equal((html.match(/class="manual-plate"/g)||[]).length,2);
 assert.match(html,/no es una captura del manual/);
 assert.match(html,/no es una campaña ni un resultado medido/);
});
test('manual illustrations are bounded and uncropped, with selectable HTML diagram labels',()=>{
 const css=read('blog/manual-de-marca.css');
 assert.ok(Buffer.byteLength(css)<13000);
 assert.match(html,/width="1536" height="1024"/);
 assert.match(html,/Ilustración con IA · escena ficticia/);
 assert.match(css,/\.article-cover-figure picture::after\{display:none\}/);
 for(const width of [480,960,1536])assert.ok(fs.statSync(path.join(root,`assets/editorial/manual-busqueda-v3-${width}.webp`)).size<110000);
 assert.ok(fs.statSync(path.join(root,'assets/editorial/manual-busqueda-v3-social.jpg')).size<100000);
 assert.doesNotMatch(html,/<iframe|<canvas|<video/);
 const scripts=[...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(x=>x[1]);
  assert.deepEqual(scripts,['/analytics.js','/app.js','/blog/blog.js','/blog/article-comments.js','/blog/article-gift-pilot.js','/blog/article-gifts.js','/section-index.js?v=20261007-1','/_vercel/insights/script.js']);
 assert.ok(Buffer.byteLength(read('blog/article-gifts.js'))<15000);
 assert.ok(Buffer.byteLength(read('section-index.js'))<4000);
 assert.match(html,/<details data-section-index data-manual-index>/);
 assert.equal((html.match(/class="manual-page-proof /g)||[]).length,2);
 for(const name of ['presentation','social','web'])assert.match(html,new RegExp('class="application-'+name+'"'));
 assert.match(html,/Fragmentos del Brandbook de Don Ventas recompuestos/);
 assert.match(html,/Ejemplos ilustrativos con recursos de Don Ventas/);
});
test('manual is discoverable in hub, related reading, author profile and auxiliary index',()=>{
 for(const f of ['blog/index.html','blog/tu-marca-es-tu-ventaja.html','arturo-villagomez.html','llms.txt','sitemap.xml'])assert.ok(read(f).includes('/blog/manual-de-marca.html'),f);
});
test('manual only extends the existing closed analytics vocabulary',()=>{
 const api=require('../analytics.js');
 assert.equal(api.page('/blog/manual-de-marca.html'),'manual');
 assert.deepEqual(api.cleanEvent('reading_return',{destination:'manual',email:'private@example.com'}),{destination:'manual'});
 for(const term of ['manual-de-marca','sistema-de-marca'])assert.deepEqual(api.cleanEvent('glossary_lookup',{term}),{term});
 assert.equal(api.cleanEvent('glossary_lookup',{term:'private@example.com'}),null);
 assert.equal(api.page('/blog/unregistered.html'),null);
});
