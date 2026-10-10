const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const hub=read('blog/index.html');
test('blog index shares the approved El Don cover instead of the retired editorial photo',()=>{
 assert.ok(hub.includes('hub-el-don-v1-720.webp'));
 assert.ok(!hub.includes('og-blog-editorial.jpg'));
 const image='https://www.donventas.mx/og-blog-el-don-v1.jpg';
 assert.ok(hub.includes(`property="og:image" content="${image}"`));
 assert.ok(hub.includes(`name="twitter:image" content="${image}"`));
 assert.ok(fs.statSync(path.join(root,'og-blog-el-don-v1.jpg')).size<200000);
});
test('every blog page has matching Open Graph and Twitter images backed by local assets',()=>{
 for(const file of fs.readdirSync(path.join(root,'blog')).filter(f=>f.endsWith('.html'))){
  const html=read('blog/'+file);
  const og=html.match(/property="og:image" content="([^"]+)"/);
  const twitter=html.match(/name="twitter:image" content="([^"]+)"/);
  assert.ok(og,file); assert.ok(twitter,file); assert.equal(og[1],twitter[1],file);
  assert.ok(fs.statSync(path.join(root,new URL(og[1]).pathname)).size>0,file);
 }
});
for(const [slug,family,old] of [
 ['por-que-nacio-don-ventas','fundador-editorial','fundador-el-don-v1'],
 ['contenido-que-atrae-clientes','barberia-el-don-v1','article-wrong-offer'],
 ['tu-marca-es-tu-ventaja','joyeria-el-don-v3','marca-confianza']
])test(`${slug}: HUB, article, preload and social metadata use the approved cover`,()=>{
 const html=read(`blog/${slug}.html`);
 assert.ok(hub.includes(`${family}-480.webp`));
 assert.ok(!html.includes(old));
 const img=[...html.matchAll(/<img\b[^>]+>/g)].map(m=>m[0]).find(s=>s.includes(family));
 assert.ok(img);assert.match(img,/loading="eager"/);assert.match(img,/fetchpriority="high"/);
 const attrs=Object.fromEntries([...img.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
 const preload=html.match(/<link rel="preload" as="image"[^>]+>/)[0];
 assert.ok(preload.includes(`href="${attrs.src}"`));
 assert.ok(preload.includes(`imagesrcset="${attrs.srcset}"`));
 assert.ok(preload.includes(`imagesizes="${attrs.sizes}"`));
 for(const entry of attrs.srcset.split(','))assert.ok(fs.statSync(path.join(root,entry.trim().split(' ')[0])).size<160000);
 const og=html.match(/property="og:image" content="([^"]+)"/)[1];
 assert.equal(html.match(/name="twitter:image" content="([^"]+)"/)[1],og);
 assert.match(og,slug==='por-que-nacio-don-ventas'?/og-fundacional-1200x630\.jpg$/:slug==='tu-marca-es-tu-ventaja'?/og-marca-el-don-v3\.jpg$/:/el-don-v1/);
 const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
 const article=graph.find(x=>x['@type']==='BlogPosting');
 assert.ok(article.image.includes(og));
 for(const u of article.image)assert.ok(fs.statSync(path.join(root,new URL(u).pathname)).size>0);
 assert.equal(article.dateModified,'2026-10-09');
 assert.match(html,/property="article:modified_time" content="2026-10-09"/);
 assert.match(html,/<time datetime="2026-10-09">9 de octubre de 2026<\/time>/);
});
test('professional author portrait is not replaced by the editorial intervention',()=>{
 assert.ok(!read('arturo-villagomez.html').includes('fundador-el-don-v1'));
 assert.doesNotMatch(read('blog/por-que-nacio-don-ventas.html'),/fundador-el-don|og-fundacional-el-don|Retrato de Arturo intervenido con IA/);
 assert.match(read('blog/por-que-nacio-don-ventas.html'),/Arturo Villagomez · Fundador de Don Ventas/);
 assert.match(read('blog/article-rhythm.css'),/\.manifesto-page \.manifesto-heading\{margin-top:0\}/);
});
test('content illustration is responsive, deferred and explicitly fictional',()=>{
 const html=read('blog/contenido-que-atrae-clientes.html');
 const figure=html.match(/<figure class="offer-confusion"[\s\S]*?<\/figure>/)[0];
 assert.match(figure,/loading="lazy"/);
 assert.match(figure,/width="1440" height="960"/);
 assert.match(figure,/escena y diálogo ficticios/);
 assert.match(figure,/aria-label="Ampliar ilustración/);
 for(const width of [480,960,1440]){
  const file=`assets/editorial/oferta-entendida-el-don-v3-${width}.webp`;
  assert.ok(figure.includes(file));
  assert.ok(fs.statSync(path.join(root,file)).size<110000);
 }
});
