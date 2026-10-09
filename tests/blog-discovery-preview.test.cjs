const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const html=read('blog/como-aparecer-en-google.html');
test('discovery release preserves the approved question, bounded length and discovery routes',()=>{
 assert.match(html,/<meta name="robots" content="index,follow,/);
 assert.doesNotMatch(html,/Previo · no publicado|noindex/);
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
 assert.match(html,/<h1>¿Cómo te encuentra quien <em>aún no sabe que existes\?<\/em><\/h1>/);
 const editorialHtml=html.replace(/<div id="comenta-conmigo"[\s\S]*?<\/div>/,'');
 const words=editorialHtml.split('<main ')[1].split('</main>')[0].replace(/^[^>]*>/,'').replace(/<[^>]*>/g,' ').replace(/&[^;]+;/g,' ').trim().split(/\s+/).length;
 assert.ok(words<=1400,`${words} words`);assert.ok(words>900);
 assert.match(html,/"datePublished":"2026-10-09"/);
 assert.doesNotMatch(html,/<form|comprar el kit/i);
 for(const file of ['sitemap.xml','llms.txt','blog/index.html','arturo-villagomez.html','analytics.js'])assert.match(read(file),/como-aparecer-en-google\.html/);
});
test('six chapters, shared reading progress, responsive hero and internal links resolve',()=>{
 assert.equal((html.match(/data-section-target/g)||[]).length,6);assert.match(html,/data-reading-progress/);
 for(const [,id] of html.matchAll(/href="#([^"]+)"/g))assert.ok(html.includes(`id="${id}"`),id);
 for(const [,href] of html.matchAll(/(?:href|src)="(\/[^"?#]*)(?:[^\"]*)"/g))assert.ok(fs.existsSync(path.join(root,decodeURIComponent(href))),href);
 for(const width of [480,960,1536])assert.ok(fs.existsSync(path.join(root,`assets/editorial/se-busca-v1-${width}.webp`)));
 assert.match(html,/width="1536" height="1024"/);assert.match(html,/fetchpriority="high"/);
 assert.match(html,/periódico y escena ficticios/);assert.match(html,/Consultas ilustrativas/);
});
test('public claims keep attribution and material limitations beside the claims',()=>{
 for(const phrase of ['900 adultos','Estados Unidos','marzo de 2025','no demuestra por sí sola causalidad','no cumple solo por tener una dirección','no garantiza que te mencionen o recomienden','no representa todas las búsquedas','Miller y J. J. Peterson','Claude, de Anthropic','búsqueda y entrenamiento'])assert.ok(html.includes(phrase),phrase);
 const data=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
 assert.equal(data['@type'],'BlogPosting');assert.equal(data.author.name,'Arturo Villagomez');
 assert.equal(data.image.width,1200);assert.equal(data.image.height,630);
});
test('published glossary return is explicit and cannot redirect outside the blog',()=>{
 const {resolveReading}=require('../blog/glosario.js');
 const source={key:'descubrimiento',number:'07',terms:['seo','marketing'],href:'/blog/como-aparecer-en-google.html',title:'Descubrimiento'};
 for(const term of source.terms){
 assert.equal(resolveReading(`?from=descubrimiento&at=${term}`,[source]).href,source.href+`#termino-${term}`);
 assert.match(html,new RegExp(`id="termino-${term}"`));
 assert.ok(read('blog/glosario.html').includes(`id="${term}"`));
 }
 assert.match(read('blog/glosario.html'),/data-reading-source="descubrimiento"[^>]*data-reading-terms="seo marketing"/);
 for(const href of ['https://example.com/a.html','//example.com/a.html','/previews/../a.html','/api/a.html'])assert.equal(resolveReading('?from=descubrimiento&at=seo',[{...source,href}]),null);
});
test('Pew scope does not equate Google summaries with assistant conversations or sales',()=>{
 for(const phrase of ['8 de cada 100 visitas','15 de cada 100','1 de cada 100 visitas con resumen','no midió conversaciones directas con asistentes ni ventas','no clics en Google frente a clics en Gemini','Es una hipótesis razonable','estar más decidido, hacer clic y comprar son cosas distintas'])assert.ok(html.includes(phrase),phrase);
 assert.doesNotMatch(html,/pedirle un compromiso|contactos pertinentes|prominencia/);
});
test('illustrative comparison isolates information while retaining the same image and brand',()=>{
 assert.equal((html.match(/src="\/assets\/editorial\/escritorio-discovery-v1-640.webp"/g)||[]).length,2);
 assert.equal((html.match(/class="sample-brand">TALLER \/ ENCINO/g)||[]).length,2);
 assert.match(html,/negocio ficticio y fotografía generada con IA/);
 assert.match(html,/No es una comparación de ventas/);
 assert.doesNotMatch(html,/<button[^>]*class="sample-button"/);
});
test('cover caption retains horizontal inset at small viewports',()=>{
 const css=read('blog/descubrimiento.css');
 assert.match(css,/padding:18px clamp\(16px,2\.5vw,24px\) 22px/);
 assert.doesNotMatch(css,/figcaption\{padding-inline:0/);
});
