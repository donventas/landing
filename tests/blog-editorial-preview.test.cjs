const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'blog/diseno-editorial.html'),'utf8');
test('editorial release is discoverable and within the approved word cap',()=>{
  assert.match(html,/<meta name="robots" content="index,follow,/);
  assert.match(html,/datePublished/);
  assert.match(html,/application\/ld\+json/);
  assert.match(html,/analytics\.js/);
  assert.doesNotMatch(html,/Previo · no publicado/);
  const article=html.split('data-editorial-body>')[1].split('</article>')[0];
  const words=article.replace(/<[^>]*>/g,' ').replace(/&[^;]+;/g,' ').trim().split(/\s+/).length;
  assert.ok(words<=1400,`${words} words exceeds 1400`);
  const mainWords=html.split('<main ')[1].split('</main>')[0].replace(/^[^>]*>/,'').replace(/<[^>]*>/g,' ').replace(/&[^;]+;/g,' ').trim().split(/\s+/).length;
  assert.ok(mainWords<=1400,`${mainWords} main-content words exceeds 1400`);
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
  assert.match(html,/rel="author"/);
});
test('six indexed chapters, shared progress, local resources and fragment links exist',()=>{
  assert.equal((html.match(/data-section-target/g)||[]).length,6);
  assert.match(html,/data-reading-progress/);
  for(const [,id] of html.matchAll(/href="#([^"]+)"/g))assert.ok(html.includes(`id="${id}"`),id);
  for(const [,url] of html.matchAll(/(?:src|href)="(\/[^"?#]*)(?:[^\"]*)"/g)){
    const file=decodeURIComponent(url).replace(/^\//,'');
    if(file==='_vercel/insights/script.js')continue;
    assert.ok(fs.existsSync(path.join(root,file)),url);
  }
});
test('comparison preserves obligations and is explicitly illustrative',()=>{
  const comparison=html.split('class="editorial-comparison"')[1].split('</figure>')[0];
  for(const text of ['PDF','antes del jueves','viernes','cuatro','dos sin datos de contacto','seis fichas','cotizaciones incorrectas','dificultar el contacto'])assert.ok(comparison.toLowerCase().split(text.toLowerCase()).length>=3,text);
  assert.match(comparison,/ejemplo ficticio/i);
  assert.match(html,/No demuestra pérdida de clientes/);
});
test('character illustration is responsive, uncropped and explicitly fictional',()=>{
  assert.match(html,/article-cover-hero article-cover-illustrated/);
  assert.match(html,/Ilustración con IA · escena ficticia/);
  for(const width of [480,960,1536])assert.ok(fs.existsSync(path.join(root,`assets/editorial/editorial-reporte-v1-${width}.webp`)));
  assert.match(html,/width="1536" height="1024"/);
  assert.match(html,/fetchpriority="high"/);
  assert.match(html,/Ponerle tu logo lo identifica/);
});
test('letter comparison uses the same exact brand source and native single-source zoom',()=>{
  const comparison=html.split('class="editorial-comparison"')[1].split('</figure>')[0];
  assert.equal((comparison.match(/src="\/assets\/brand\/donventas-wordmark-b6.svg"/g)||[]).length,2);
  assert.equal((comparison.match(/07 OCT 2026 · EJEMPLO/g)||[]).length,2);
  assert.match(html,/<dialog id="report-zoom"/);
  const css=fs.readFileSync(path.join(root,'blog/diseno-editorial.css'),'utf8');
  assert.match(css,/aspect-ratio:17\/22/);
  const js=fs.readFileSync(path.join(root,'blog/editorial-report.js'),'utf8');
  assert.match(js,/stage.appendChild\(sheet\)/);
  assert.match(js,/origin.appendChild\(sheet\)/);
  assert.doesNotMatch(js,/cloneNode|innerHTML/);
});
