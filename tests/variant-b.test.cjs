const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('variant B keeps the live journey and binds the facade and video to B assets',()=>{
 const h=fs.readFileSync('variantes/b/index.html','utf8'),d=fs.readFileSync('variantes/b/vuelta-27/index.html','utf8'),j=fs.readFileSync('variantes/b/landing-naturalidad.js','utf8');
 assert.match(h,/name="robots" content="noindex,follow"/);assert.match(d,/name="robots" content="noindex,follow"/);assert.match(h,/\/variantes\/b\/media\/montaje-b09-final\.mp4/);assert.match(h,/id="help-form"/);assert.match(h,/id="waitlist-form"/);assert.match(j,/\/variantes\/b\/vuelta-27\//);assert.match(d,/id="facade-motion-toggle"/);assert.match(d,/\/variantes\/b\/media\/fachada\.mp4/);assert.match(d,/class="vuelta-return"/);assert.ok(!h.includes('/variantes/a/'));
});
