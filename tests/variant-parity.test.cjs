const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const page=x=>read(`variantes/${x}/index.html`),demo=x=>read(`variantes/${x}/vuelta-27/index.html`);
test('A and B offer the same subtitle languages with P06 timing',()=>{
 const tracks=html=>[...html.matchAll(/<track\b[^>]*src="([^"]+)"[^>]*srclang="([^"]+)"/g)].map(m=>[m[2],m[1]]);
 const a=tracks(page('a')),b=tracks(page('b'));assert.deepEqual(a.map(x=>x[0]),b.map(x=>x[0]));assert.equal(a.length,10);
 const times=s=>[...s.matchAll(/\d\d:\d\d:\d\d\.\d{3} --> \d\d:\d\d:\d\d\.\d{3}/g)].map(m=>m[0]);
 const expected=times(read(a[0][1].slice(1)));assert.ok(expected.length>0);for(const [,src] of a)assert.deepEqual(times(read(src.slice(1))),expected,src);
});
test('A includes the same collection message and embedded language control',()=>{
 for(const x of ['a','b']){const s=demo(x);assert.match(s,/Una marca también se reconoce desde afuera/);assert.match(s,/La identidad toma forma en el espacio, los objetos y cada encuentro/);assert.match(s,/shop-language-trigger/);}
 assert.match(read('variantes/a/landing-naturalidad.js'),/variantes\/a\/vuelta-27/);assert.match(read('variantes/a/landing-naturalidad.js'),/activeLanguage/);
});
test('A and B maintain equivalent form controls',()=>{
 const forms=s=>[...s.matchAll(/<form\b[\s\S]*?<\/form>/g)].map(x=>[...x[0].matchAll(/<(input|select|textarea|button)\b([^>]*)>/g)].map(m=>m[0]));
 assert.deepEqual(forms(page('a')),forms(page('b')));assert.deepEqual(forms(demo('a')),forms(demo('b')));
});
