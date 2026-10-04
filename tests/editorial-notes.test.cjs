const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('blog/contenido-que-atrae-clientes.html'),css=read('blog/blog.css');
test('essential disclosure stays visible while methodological detail is optional',()=>{
 assert.match(html,/<p class="cover-source">Ilustración con IA · escena ficticia\.<\/p>/);
 const details=[...html.matchAll(/<details class="editorial-detail"[^>]*>([\s\S]*?)<\/details>/g)];
 assert.equal(details.length,2);
 assert.match(details[0][1],/<summary>Sobre la encuesta y sus límites<\/summary>/);
 assert.match(details[0][1],/980 participantes/);
 assert.match(details[0][1],/no evidencia causal ni una muestra representativa de México/);
 assert.match(details[1][1],/<summary>Ejemplo ilustrativo de redacción · no es una campaña probada<\/summary>/);
 assert.match(details[1][1],/No es una comparación de resultados/);
 assert.doesNotMatch(html,/<details class="editorial-detail"[^>]*\bopen\b/);
});
test('citation and population remain next to the statistic, without requiring disclosure',()=>{
 const narrative=html.split('<details class="editorial-detail" id="nota-encuesta">')[0];
 assert.match(narrative,/href="https:\/\/contentmarketinginstitute.com\/b2b-research\/b2b-content-marketing-trends-research-2025"/);
 assert.match(narrative,/principalmente en Norteamérica entre empresas que venden a otras empresas/);
 assert.match(narrative,/<strong>40% de los participantes<\/strong>/);
});
test('note typography wins over article paragraph rules and native controls need no script',()=>{
 assert.match(css,/\.article-section>p\.article-source,[^{]+\{[^}]*font-size:14px/);
 assert.match(css,/\.editorial-detail summary\{[^}]*min-height:44px/);
 assert.match(css,/\.editorial-detail-body p\{[^}]*font-size:14px/);
 assert.match(css,/\.article-cover-illustrated \.cover-source\{font-size:14px/);
 assert.match(css,/:focus-visible\{outline:2px solid/);
 assert.doesNotMatch(html,/<script[^>]+(?:notes|disclosure)/);
});
test('the editorial workflow governs future notes without imposing notes on every story',()=>{
 const workflow=read('blog/WORKFLOW-EDITORIAL.md');
 assert.match(workflow,/transparencia sin interrumpir el relato/);
 assert.match(workflow,/No añadir notas a la carta fundacional/);
 assert.match(workflow,/no deben\s+sobrescribir las notas/);
});
