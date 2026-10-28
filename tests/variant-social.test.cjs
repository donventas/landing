const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('each variant shares its own URL and the correct social image',()=>{
 for(const v of ['a','b'])for(const suffix of ['','vuelta-27/']){
  const html=fs.readFileSync(`variantes/${v}/${suffix}index.html`,'utf8');
  assert.ok(html.includes(`property="og:url" content="https://www.donventas.mx/variantes/${v}/${suffix}"`));
  const image=suffix?(v==='a'?'assets/portal-launch/bici-story/og-vuelta-27.jpg':'assets/portal-launch/bici-story/video-base/assets/naturalidad-p04/fachada-noche-p05.png'):(v==='a'?'assets/portal-launch/og-home-vuelta27.jpg':'variantes/b/media/social-landing-b06.jpg');
  assert.ok(html.includes(`property="og:image" content="https://www.donventas.mx/${image}"`));assert.ok(html.includes(`name="twitter:image" content="https://www.donventas.mx/${image}"`));assert.ok(fs.existsSync(image));
 }
});
