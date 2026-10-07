const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const articles=['tu-marca-es-tu-ventaja','contenido-que-atrae-clientes','por-que-nacio-don-ventas','manual-de-marca'];
test('rhythm adaptation is limited to the four approved articles',()=>{
 for(const name of articles){const html=read('blog/'+name+'.html');assert.match(html,/body class="[^"]*reading-rhythm/);assert.match(html,/article-rhythm\.css\?v=20261007-1/);}
 for(const file of ['index.html','branding.html','blog/index.html','blog/glosario.html'])assert.doesNotMatch(read(file),/article-rhythm\.css|class="[^"]*reading-rhythm/);
});
test('promise resources are native text and both reading links stay grouped',()=>{
 const advantage=read('blog/tu-marca-es-tu-ventaja.html');assert.match(advantage,/<dl class="promise-resources"/);assert.equal((advantage.match(/<dt>/g)||[]).length,3);assert.equal((advantage.match(/<dd>/g)||[]).length,3);
 for(const name of articles.slice(0,2)){const html=read('blog/'+name+'.html');assert.match(html,/class="reading-next" role="group" aria-label="Lecturas relacionadas"/);assert.equal((html.match(/class="related-reading related-reading-compact"/g)||[]).length,2);}
});
test('paper chapters and narrow layouts have explicit readable colors and reflow',()=>{
 const css=read('blog/article-rhythm.css');assert.match(css,/paper-chapter p\{color:#374356/);assert.match(css,/paper-chapter :is\(h2,h3,blockquote,strong\)\{color:#0E1117/);assert.match(css,/@media\(max-width:600px\)/);assert.match(css,/promise-resources>div\{grid-template-columns:1fr/);assert.doesNotMatch(css,/url\(|animation:|position:fixed/);
});
