const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const slug='como-aplicar-identidad-visual',html=read('blog/'+slug+'.html');
test('brand context approved article has canonical, one H1, author and valid schema',()=>{
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.ok(html.includes('https://www.donventas.mx/blog/'+slug+'.html'));
 const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
 assert.equal(schema['@type'],'BlogPosting');assert.equal(schema.author.name,'Arturo Villagomez');
 assert.doesNotMatch(html,/BORRADOR|SOLO DESARROLLO|Prueba local|example\.com|gift-preview\.css|preview\.js/);
 assert.doesNotMatch(html,/name="dv:publication-status" content="draft"/);
 assert.match(html,/name="robots" content="index,/);assert.ok(schema.datePublished);
 assert.ok(html.includes('<time datetime="'+schema.datePublished+'">'));
 for(const src of html.matchAll(/(?:src|href)="(\/[^"?#]+)(?:[?#][^"]*)?"/g)){
   const file=decodeURIComponent(src[1]);assert.ok(fs.existsSync(path.join(root,file.endsWith('/')?file+'index.html':file)),file);
 }
});
test('all section anchors resolve; reading bar and shared gift are mounted',()=>{
 for(const [,id] of html.matchAll(/href="#([^"]+)"/g))assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(html,/data-reading-progress/);assert.match(html,/data-section-index/);assert.match(html,/data-gift-discovery="steps"/);
 assert.match(html,/data-article-comments="como-aplicar-identidad-visual"/);
});
test('brand context is linked from hub, glossary, server catalog and sitemap',()=>{
 for(const file of ['blog/index.html','blog/glosario.html','sitemap.xml','llms.txt','analytics.js'])assert.ok(read(file).includes(slug),file);
 assert.ok(require('../lib/article-comments/catalog.cjs')[slug]);
 const gift=require('../blog/article-gifts.json').articles[slug];assert.equal(gift.questions.length,3);assert.ok(gift.file.endsWith('-v2.pdf'));
 assert.equal(fs.readFileSync(path.join(root,gift.file)).subarray(0,5).toString(),'%PDF-');
});
test('database activation is explicit and migration fails safely on drift',()=>{
 const sql=read('supabase/migrations/007_article_brand_context.sql');
 assert.match(sql,/article_allowlist_drift/);assert.match(sql,/pg_get_functiondef/);assert.match(sql,/como-aplicar-identidad-visual/);
 assert.match(sql,/dv_article_receive_v1\(jsonb,jsonb,jsonb\)/);
 assert.match(read('supabase/migrations/005_article_subscriptions.sql'),/rename to dv_article_receive_v1/);
 assert.doesNotMatch(sql.replace(/--[^\n]*/g,''),/grant|disable row level security|drop table/i);
});
test('share cover is versioned, local JPEG and consistent across OG, Twitter and schema',()=>{
 const meta=name=>html.match(new RegExp('(?:property|name)="'+name+'" content="([^"]+)"'))?.[1];
 const image=meta('og:image');
 assert.equal(image,meta('twitter:image'));
 assert.match(image,/\/portada-social-v2\.jpg$/);
 assert.equal(meta('og:image:type'),'image/jpeg');
 assert.equal(meta('og:title'),meta('twitter:title'));
 assert.equal(meta('og:description'),meta('twitter:description'));
 assert.equal(meta('og:image:alt'),meta('twitter:image:alt'));
 const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
 assert.equal(schema.image.url,image);
 const jpeg=fs.readFileSync(path.join(root,new URL(image).pathname));
 assert.equal(jpeg.readUInt16BE(0),0xffd8);
 let dimensions;
 for(let offset=2;offset<jpeg.length;){
   assert.equal(jpeg[offset],0xff);const marker=jpeg[offset+1],length=jpeg.readUInt16BE(offset+2);
   if([0xc0,0xc1,0xc2].includes(marker)){dimensions=[jpeg.readUInt16BE(offset+7),jpeg.readUInt16BE(offset+5)];break;}
   offset+=length+2;
 }
 assert.deepEqual(dimensions,[1200,800]);
 assert.equal(meta('og:image:width'),String(dimensions[0]));assert.equal(meta('og:image:height'),String(dimensions[1]));
 assert.ok(jpeg.length<250000);
});
test('portrait mockups preserve full artwork and responsive source sizes',()=>{
 const css=read('blog/marca-contexto-mockups.css');
 assert.match(css,/@media\(max-width:900px\)/);
 assert.match(css,/\.mock-stage:has\(\.source-visual\)\{height:auto\}/);
 assert.match(css,/\.source-visual img\{display:block;width:100%;height:auto;object-fit:contain\}/);
 assert.match(html,/\(max-width: 900px\) 400px, 350px/);
});
