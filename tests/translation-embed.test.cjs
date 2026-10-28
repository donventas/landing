const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
for(const [file,base] of [['assets/portal-launch/landing-b-oficial.js','/portafolio/vuelta-27/'],['variantes/b/landing-naturalidad.js','/variantes/b/vuelta-27/']]){
 const source=fs.readFileSync(path.join(root,file),'utf8');const block=source.match(/const translatedHost=[\s\S]*?if\(translated\)frame\.src=demoURL\('web'\);/);
 test(file+' preserves a supported Google language in each sample',()=>{
  assert.ok(block);for(const language of ['en','fr','pt','de','it','bg','ja','zh-CN','ar']){
   const context={URL,URLSearchParams,frame:{},location:{hostname:'www-donventas-mx.translate.goog',origin:'https://www-donventas-mx.translate.goog',search:'?_x_tr_sl=es&_x_tr_tl='+encodeURIComponent(language)+'&secret=ignored'}};
   vm.runInNewContext(block[0]+';globalThis.testURL=demoURL',context);
   for(const key of ['web','propuesta','tarjeta']){const u=new URL(context.testURL(key));assert.equal(u.pathname,base);assert.equal(u.searchParams.get('embed'),key);assert.equal(u.searchParams.get('_x_tr_tl'),language);assert.equal(u.searchParams.has('secret'),false)}
   const link=new URL(context.testURL('tarjeta',false));assert.equal(link.hash,'#tarjeta');assert.equal(link.searchParams.get('_x_tr_tl'),language);
  }
 });
 test(file+' does not trust Google parameters on the original site',()=>{const context={URL,URLSearchParams,frame:{},location:{hostname:'www.donventas.mx',origin:'https://www.donventas.mx',search:'?_x_tr_sl=es&_x_tr_tl=en'}};vm.runInNewContext(block[0]+';globalThis.testURL=demoURL',context);assert.equal(new URL(context.testURL('web')).search,'?embed=web');assert.equal(context.frame.src,undefined)});
}
test('demo security directives remain in Vercel headers',()=>{const config=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));for(const route of ['/portafolio/vuelta-27/:path*','/variantes/b/vuelta-27/:path*']){const policy=config.headers.find(x=>x.source===route).headers.find(x=>x.key==='Content-Security-Policy').value;for(const directive of ["frame-ancestors 'self'","form-action 'none'","connect-src 'none'","base-uri 'self'"])assert.ok(policy.includes(directive));}});
