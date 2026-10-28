const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const pages=['index.html','branding.html','arturo-villagomez.html','blog/index.html','blog/por-que-nacio-don-ventas.html','blog/tu-marca-es-tu-ventaja.html','blog/contenido-que-atrae-clientes.html','blog/manual-de-marca.html',...['Centro Legal','Aviso de Privacidad','Terminos y Condiciones','Politica de Cookies'].map(f=>'15_LEGAL/'+f+'.html')];
function unpack(h){const m=h.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/);return m?JSON.parse(m[1]):h;}
for(const file of pages)test('section index: unique native targets and resources — '+file,()=>{
 const h=unpack(read(file)),index=h.match(/<aside class="section-index[\s\S]*?<\/aside>/)?.[0];assert.ok(index);
 assert.equal((h.match(/data-section-index/g)||[]).length,1);
 assert.doesNotMatch(h,/data-article-toc|class="brand-chapters"/);
 const ids=[...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
 const links=[...index.matchAll(/href="#([^"]+)"/g)].map(m=>m[1]);assert.ok(links.length>=2);
 for(const id of links)assert.ok(ids.includes(id),'Missing '+id);
 assert.equal((h.match(/src="\/section-index.js\?v=202610(?:07|29)-1"/g)||[]).length,1);
 assert.equal((h.match(/href="\/section-index.css\?v=202610(?:07|29)-1"/g)||[]).length,1);
 assert.match(index,/<details data-section-index[^>]*>/);
 assert.doesNotMatch(index,/<details[^>]*\sopen[\s>]/);
});
test('tools keep their existing navigation; branding measurement hook retained',()=>{
 for(const f of ['diagnostico.html','blog/glosario.html'])assert.doesNotMatch(read(f),/data-section-index|section-index.js/);
 assert.equal((read('branding.html').match(/data-brand-action="prices-nav"/g)||[]).length,1);
 assert.ok(Buffer.byteLength(read('section-index.css'))<4500);
 assert.ok(Buffer.byteLength(read('section-index.js'))<4000);
});

test('both blog hub indexes include every published article in order and count their entries',()=>{
 const html=read('blog/index.html');
 const edition=html.match(/<div class="publication-index[^\"]*"[\s\S]*?<\/ol>/)[0];
 const navigation=html.match(/<aside class="section-index[\s\S]*?<\/aside>/)[0];
 const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
 const articles=schema['@graph'].find(item=>item['@type']==='CollectionPage').mainEntity.itemListElement;
 const sections=[...html.matchAll(/<section\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)];
 for(const index of [edition,navigation]){
  const links=[...index.matchAll(/href="#([^"]+)"[^>]*><span>(\d+)<\/span>/g)];
  assert.deepEqual(links.map(link=>Number(link[2])),links.map((_,i)=>i+1),'Sequential index numbering');
  articles.forEach((article,i)=>{
   const pathname=new URL(article.url).pathname;
   const section=sections.find(section=>section[2].includes('href="'+pathname+'"'));
   assert.ok(section,'Missing article section '+pathname);
   const heading=section[2].match(/<h2\b[^>]*\bid="([^"]+)"/)[1];
   assert.ok([section[1],heading].includes(links[i]?.[1]),'Missing or misplaced index entry '+pathname);
  });
 }
 const count=Number(navigation.match(/>(\d+) secciones<\/span>/)[1]);
 assert.equal(count,[...navigation.matchAll(/href="#/g)].length,'Static section count matches navigation');
});

test('translated index counts and navigates same-page absolute URLs without reload',()=>{
 const vm=require('node:vm'),current={textContent:''},summary={getBoundingClientRect:()=>({height:56}),focus(){}},historyCalls=[];
 const target={getBoundingClientRect:()=>({top:200}),matches:()=>true,closest:()=>null,getAttribute:()=>null,setAttribute(){},focus(){},addEventListener(){},scrollIntoView(v){this.scrolled=v}};
 const link={href:'https://site.translate.goog/?_x_tr_tl=en#ejemplo',hash:'#ejemplo',textContent:'See it in action',setAttribute(){},removeAttribute(){}};
 const external={href:'https://other.invalid/#ejemplo',hash:'#ejemplo'};
 const handlers={},index={open:true,querySelector:s=>s==='summary'?summary:current,querySelectorAll:()=>[link,external],addEventListener:(n,f)=>{handlers[n]=f}};
 const document={querySelector:s=>s==='[data-section-index]'?index:null,getElementById:id=>id==='ejemplo'?target:null,body:{classList:{add(){}},style:{setProperty(){}}},addEventListener(){}};
 const location={href:'https://site.translate.goog/?_x_tr_tl=en',origin:'https://site.translate.goog',pathname:'/',search:'?_x_tr_tl=en'};
 vm.runInNewContext(read('section-index.js'),{document,location,URL,window:{},history:{pushState:(...v)=>historyCalls.push(v)},matchMedia:()=>({matches:true}),getComputedStyle:()=>({position:'static'}),addEventListener(){},requestAnimationFrame:f=>f(),decodeURIComponent});
 assert.equal(current.textContent,'1 secciones');let prevented=false;handlers.click({target:{closest:()=>link},button:0,preventDefault(){prevented=true}});assert.equal(prevented,true);assert.equal(index.open,false);assert.equal(historyCalls[0][2],'/?_x_tr_tl=en#ejemplo');assert.equal(target.scrolled.behavior,'instant');
});
