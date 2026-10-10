'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {shareUrl,message,copyLink}=require('../blog/article-share.js');
const analytics=require('../analytics.js');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
test('share URLs are production-only, bounded, attributed and independent of visitor input',()=>{
 for(const method of ['whatsapp','copy'])for(const placement of ['article','gift']){
  const url=new URL(shareUrl(method,placement));
  assert.equal(url.origin,'https://www.donventas.mx');assert.equal(url.pathname,'/blog/contenido-que-atrae-clientes.html');
  assert.equal(url.hash,'');assert.equal([...url.searchParams].length,4);
  const entry=analytics.campaignFrom(url.search,null,Date.now(),true);
  assert.equal(entry.content,placement+'-share');assert.equal(entry.name,'entender-antes-de-comunicar');
 }
 assert.equal(shareUrl('private@example.com','gift'),null);assert.equal(shareUrl('copy','private text'),null);
 assert.match(message('gift'),/checklist gratuito/);assert.doesNotMatch(message('gift'),/localhost|127\.0\.0\.1|email=|respuesta=/);
});
test('sharing and gift metrics accept no contact, free text or delivery claims',()=>{
 assert.deepEqual(analytics.cleanEvent('article_share_clicked',{method:'whatsapp',placement:'gift',email:'secret',url:'secret'}),{method:'whatsapp',placement:'gift'});
 assert.deepEqual(analytics.cleanEvent('article_share_copied',{method:'copy',placement:'article',text:'secret'}),{method:'copy',placement:'article'});
 assert.equal(analytics.cleanEvent('article_share_copied',{method:'whatsapp',placement:'gift'}),null);
 assert.equal(analytics.cleanEvent('article_share_clicked',{method:'whatsapp',placement:'secret'}),null);
 assert.equal(analytics.cleanEvent('article_share_sent',{}),null);
 for(const name of ['article_gift_received','article_gift_download_clicked'])assert.deepEqual(analytics.cleanEvent(name,{email:'secret',answers:['secret']}),{});
});
test('clipboard succeeds, denies or stalls without leaving the user waiting indefinitely',async()=>{
 let copied;await copyLink({writeText:async text=>{copied=text;}},shareUrl('copy','article'),25);assert.equal(copied,shareUrl('copy','article'));
 await assert.rejects(copyLink(null,'url',25),/unavailable/);
 await assert.rejects(copyLink({writeText:async()=>{throw Error('denied');}},'url',25),/denied/);
 await assert.rejects(copyLink({writeText:()=>new Promise(()=>{})},'url',25),/timeout/);
});
test('pilot preserves approved original art, SEO headline and article narrative',()=>{
 const html=read('blog/contenido-que-atrae-clientes.html');
 assert.match(html,/<title>Antes de crear contenido, entiende qué resuelve el negocio — Don Ventas<\/title>/);
 assert.match(html,/property="og:title" content="¿Publicas mucho y aun así no entienden qué vendes\?"/);
 assert.match(html,/property="og:description" content="Una experiencia sobre comunicar mejor tu negocio\. Al final, un checklist gratuito para ponerlo en práctica\."/);
 assert.match(html,/property="og:image" content="https:\/\/www.donventas.mx\/og-article-entender-el-don-v1.jpg"/);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.ok(html.indexOf('/blog/article-share.js')<html.indexOf('/blog/article-gifts.js'));
 for(const file of fs.readdirSync(path.join(root,'blog')).filter(x=>x.endsWith('.html')&&x!=='contenido-que-atrae-clientes.html'))assert.ok(!read('blog/'+file).includes('/blog/article-share.js'),file);
});
test('quiet share section keeps the reading column and mobile gutters without padding the nested delivery twice',()=>{
 const css=read('blog/article-share.css');
 assert.match(css,/\.article-share-quiet\{width:calc\(100% - 48px\);max-width:740px;margin:28px auto;box-sizing:border-box\}/);
 assert.match(css,/\.article-share-after\{margin:0 0 16px;/);
});
test('pilot shares publicly without changing form, requiring consent or fabricating sends',()=>{
 const src=read('blog/article-share.js');
 assert.doesNotMatch(src,/location\.(search|href)|localStorage|fetch\(|form\.elements|article_share_sent|innerHTML/);
 assert.match(src,/clipboard\.writeText/);assert.match(src,/input\.readOnly = true/);
 assert.match(src,/input\.focus\(\); input\.select\(\)/);
 assert.doesNotMatch(src,/quiet\.hidden = true/);
 assert.match(src,/row\.append\(download\)/);
 assert.match(src,/toggle\.textContent = 'Compartir artículo'/);
 assert.match(src,/aria-expanded/);
 assert.match(src,/e\.key==='Escape'/);
 assert.match(src,/reason === 'receipt'/);
 const metrics=read('analytics.js');
 assert.ok(metrics.indexOf("if (link.hasAttribute('data-article-share')) return")<metrics.indexOf("clickTrack('whatsapp_click')"));
});
