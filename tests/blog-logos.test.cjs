const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),h=read('blog/logotipos-mitos.html');
test('logos preserves approved framing, bounded claims and operational solution',()=>{
 for(const text of ['Logotipos:','no dejan brillar a tu marca','contexto del negocio y su operación','No necesita reunirlos todos','No hace falta producir todas las variantes imaginables','no obliga a cambiarlo','Hay decisiones que no se dibujan','El Don es nuestra mascota editorial','resumen del estudio'])assert.ok(h.includes(text),text);
 assert.doesNotMatch(h,/Pafi|QuickFinance|Marje|Boldia|Readwise|OneDrive|garantiza ventas/);
 assert.match(h,/momento=alinear&amp;servicio=identidad/);
 assert.equal((h.match(/class="logo-plate"/g)||[]).length,2);
 for(const source of ['www.ibm.com/design/language/ibm-logos/8-bar/','www.nasa.gov/history/symbols-of-nasa/','journals.sagepub.com/doi/10.1177/002224299806200202'])assert.ok(h.includes(source));
});
test('logos uses exact SVGs and bounded, uncropped responsive cover',()=>{
 assert.match(h,/width="1536" height="1024"/);assert.match(h,/Ilustración con IA · escena ficticia/);
 for(const width of [480,960,1536])assert.ok(fs.statSync(path.join(root,`assets/editorial/logo-vitrina-v5-${width}.webp`)).size<100000);
 assert.ok(Buffer.byteLength(read('blog/logotipos-mitos.css'))<5000);
 const crypto=require('node:crypto');
 for(const [file,expected]of Object.entries({'donventas-wordmark-b6.svg':'2fe771cc4378955e9d93a52738361d7503ac66aa8ff4565fa3cdef17eb7e96b0','donventas-symbol-b.svg':'9340d84c2d72d18b8126b90419c3b7f90a6527137a99e3388c8abcf917ac07e9','donventas-symbol-bs.svg':'1a5685e3f90f1705b501e6b6a38099ae8060fdd1af54de3091159cd1b13babf6'}))assert.equal(crypto.createHash('sha256').update(read('assets/brand/'+file).replace(/\r\n/g,'\n')).digest('hex'),expected);
 assert.doesNotMatch(h,/<iframe|<canvas|<video/);
 assert.equal((h.match(/data-section-index/g)||[]).length,1);assert.equal((h.match(/data-reading-progress/g)||[]).length,1);
 const ids=[...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
});
test('logos only extends closed measurement vocabulary, never accepts arbitrary values',()=>{
 const api=require('../analytics.js');assert.equal(api.page('/blog/logotipos-mitos.html'),'logos');assert.deepEqual(api.cleanEvent('glossary_lookup',{term:'logo',email:'private@example.com'}),{term:'logo'});assert.deepEqual(api.cleanEvent('reading_return',{destination:'logos'}),{destination:'logos'});assert.equal(api.cleanEvent('glossary_lookup',{term:'unknown'}),null);
});
test('editorial color composition replaces method photo without touching its shared source',()=>{
 assert.doesNotMatch(h,/photo-safe-zone|logo-vitrina-v1/);
 assert.match(h,/logo-conversacion-v3-480.webp 480w, \/assets\/editorial\/logo-conversacion-v3-960.webp 960w, \/assets\/editorial\/logo-conversacion-v3-1536.webp 1536w/);
 assert.match(h,/width="1536" height="1024"/);
 for(const width of [480,960,1536])assert.ok(fs.statSync(path.join(root,`assets/editorial/logo-conversacion-v3-${width}.webp`)).size<(width===1536?150000:90000));
 const crypto=require('node:crypto');
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'assets/editorial/criterio-metodo-01-06-v2-1448.webp'))).digest('hex'),'52dfcf2f5a28775944ab08dc8998d7974fa616f51f80ff55eab17d8693d6e715');
 assert.match(h,/Fotografía con IA/);
});
