'use strict';
// One-time, deterministic integration of the approved pilot. Source is never edited.
const fs = require('node:fs');
const path = require('node:path');
const { inventory } = require('./inventory-portal-pilot.cjs');
const source = process.argv[2];
if (!source) throw Error('Pass the approved pilot directory');
const root = path.resolve(__dirname, '..');
const dest = path.join(root, 'assets/portal-launch');
const files = inventory(source, ['index-naturalidad.html', 'bici-story/aplicaciones-naturalidad.html']);
const skip = /(?:^|\/)(?:controles-naturalidad\.(?:css|js)|index-naturalidad.html|aplicaciones-naturalidad.html)$/;
for (const item of files.files) {
  if (skip.test(item.path)) continue;
  const target = path.join(dest, item.path);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (!/\.(css|js)$/.test(item.path)) { fs.copyFileSync(path.join(source, item.path), target); continue; }
  let text = fs.readFileSync(path.join(source, item.path), 'utf8');
  text = text.replace(/@font-face\{[^}]+\}/g, '').replaceAll('Schibsted,', '"Schibsted Grotesk",').replaceAll('SpaceMono,', '"Space Mono",').replaceAll('[data-theme=', '[data-dv-appearance=');
  if (item.path === 'landing-naturalidad.js') {
    text = text.replace(/ const root=document.documentElement,[\s\S]*? const frame=/, ' const root=document.documentElement;\n const frame=');
    text = text.replace(/ const form=document.getElementById\('waitlist-form'\)[\s\S]*?\n\}\)\(\);/, '\n})();');
    text = text.replaceAll('bici-story/aplicaciones-naturalidad.html', '/portafolio/vuelta-27/');
    text = text.replace(",toggle=document.getElementById('motion-toggle')", '');
    text = text.replace(';let manualReduce=false;', ';');
    text = text.replace('manualReduce||preference.matches', 'preference.matches');
    text = text.replace(/toggle\.setAttribute\('aria-pressed',String\(off\)\);toggle\.textContent=[^;]+;/, '');
    text = text.replace("toggle.addEventListener('click',()=>{manualReduce=!manualReduce;motion();});", '');
  }
  if (item.path === 'bici-story/aplicaciones-naturalidad.js') text = `(() => { function openTarget(){if(location.hash==='#consulta')document.getElementById('consulta').open=true;} addEventListener('hashchange',openTarget);openTarget();})();`;
  fs.writeFileSync(target, text);
}
const base = fs.readFileSync(path.join(root, 'branding.html'), 'utf8');
const language = base.match(/<details[^>]*id="idioma"[\s\S]*?<\/details>/)[0];
function header(demo) {
 const links = demo ? [['web','Web'],['propuesta','Propuesta'],['tarjeta','Tarjeta'],['coleccion','Fachada y merch']] : [['ejemplo','Verlo en acción'],['acompanamiento','Cómo te ayudamos'],['portal','El Portal']];
 const nav = links.map(([id,label]) => `<a href="#${id}">${label}</a>`).join('');
 return `<header class="editorial-nav" aria-label="Navegación principal"><div class="nav-shell"><a class="wordmark" href="/" aria-label="Don Ventas, inicio"><img src="/assets/brand/donventas-wordmark-b6-reverse.svg" width="210" height="130" alt="Don Ventas" translate="no"></a><nav aria-label="Secciones">${nav}</nav><div class="nav-actions"><details class="mobile-explore"><summary>Explorar</summary><div class="mobile-explore-links">${nav}<a href="/branding.html">Marca</a><a href="/blog/">Ideas</a><a href="#idioma" data-dv-language-open>Idioma / Language</a></div></details><a class="launch-contact" href="/${demo?'#ayuda':'#lista'}">${demo?'Hablemos':'Conoce el Portal'}</a></div></div></header>`;
}
function sectionIndex(demo) {
 const links=demo?[['web','Web'],['propuesta','Propuesta'],['tarjeta','Tarjeta'],['coleccion','Fachada y merch']]:[['ejemplo','Verlo en acción'],['acompanamiento','Cómo te ayudamos'],['portal','El Portal']];
 return `<aside class="section-index" aria-label="Índice de la página"><details data-section-index><summary><span>En esta página</span><span class="section-index-current">${links[0][1]}</span></summary><nav aria-label="Secciones de la página"><ol>${links.map(([id,label])=>`<li><a href="#${id}">${label}</a></li>`).join('')}</ol></nav></details></aside>`;
}
function page(entry, demo) {
 let text = fs.readFileSync(path.join(source,entry),'utf8');
 const directory=path.posix.dirname(entry);
 text=text.replace(/\b(src|href|poster|srcset)="([^"]+)"/g,(all,attr,value)=>{
  if (/^(?:https?:|mailto:|\/|#)/.test(value)) return all;
  if (/logos\/pack/.test(value)) return `${attr}="/assets/brand/${path.posix.basename(value)}"`;
  if (/index-naturalidad\.html/.test(value)) return `${attr}="/"`;
  if (/aplicaciones-naturalidad\.html/.test(value)) return `${attr}="/portafolio/vuelta-27/${value.includes('?')?'?'+value.split('?')[1]:value.includes('#')?'#'+value.split('#')[1]:''}"`;
  return `${attr}="/assets/portal-launch/${path.posix.normalize(path.posix.join(directory,value))}"`;
 });
 text=text.replace(/<html[^>]*>/,`<html lang="es" data-dv-page="${demo?'portfolio':'home'}" data-dv-appearance="dark">`);
 text=text.replace(/<body>/,`<body class="has-section-index ${demo?'launch-demo':'launch-home'}">`);
 text=text.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/,'');
 if(demo)text=text.replace('</head>',`<meta http-equiv="Content-Security-Policy" content="form-action 'none'; connect-src 'none'; base-uri 'self'"></head>`).replace('<form id="bike-form"','<form method="post" id="bike-form"');
 text=text.replace(/<script[^>]*controles-naturalidad.js[^>]*><\/script>/g,'').replace(/<link[^>]*controles-naturalidad.css[^>]*>/g,'');
 text=text.replace(/<div class="pilot-bar">[\s\S]*?<\/div>/,'');
 text=text.replace(/<header class="(?:navigation shell|review-nav)"[\s\S]*?<\/header>/,header(demo));
 text=text.replace(/<aside class="dv-mobile-index"[\s\S]*?<\/aside>/,sectionIndex(demo));
 text=text.replace('</head>',`<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/fonts/fonts.css"><script src="/appearance.js"></script><link rel="stylesheet" href="/appearance.css"><link rel="stylesheet" href="/section-index.css"><link rel="stylesheet" href="/translation.css"><link rel="stylesheet" href="/assets/portal-launch/integration.css"><script src="/translation.js" defer></script><script src="/section-index.js" defer></script>${demo?'':'<script src="/assets/portal-launch/forms.js" defer></script>'}</head>`);
 const url='https://www.donventas.mx/'+(demo?'portafolio/vuelta-27/':'');
 text=text.replace('</body>',language.replaceAll('https://www.donventas.mx/branding.html',url).replaceAll('https%3A%2F%2Fwww.donventas.mx%2Fbranding.html',encodeURIComponent(url))+'<p class="launch-preview-note">Preview de integración · no publicado. La traducción externa muestra la URL de producción, no este preview.</p></body>');
 text=text.replace(/<a[^>]*href="[^"]*(?:pruebas-m03|escena-taller)\.html"[^>]*>[\s\S]*?<\/a>/g,'');
 text=text.replace(/<details class="review-details">[\s\S]*?<\/details>/, '<p class="review-note">Estudio conceptual de Don Ventas. Vuelta 27 es una marca ficticia: no es un cliente ni un negocio en operación. Las imágenes y las aplicaciones son demostraciones digitales; no acreditan fabricación ni funciones operativas del Portal.</p>');
 if (!demo) {
  text=text.replace(/<div class="waitlist-entry">[\s\S]*?<\/form><\/div>/,fs.readFileSync(path.join(root,'scripts/portal-partials/waitlist.html'),'utf8'));
  text=text.replace('<div class="help-heading">','<span id="servicios"></span><div class="help-heading">');
  text=text.replace('Este piloto no envía solicitudes; el canal de contacto se validará antes de publicar.','Puedes contarnos tu situación en el formulario siguiente. No necesitas suscribirte al Portal.');
  text=text.replace('</div></section>\n<section id="lista"', '</div>'+fs.readFileSync(path.join(root,'scripts/portal-partials/contact.html'),'utf8')+'</section>\n<section id="lista"');
 }
 text=text.replace('<title>Tu marca, en la vida real · Don Ventas · Piloto</title>','<title>Haz que tu marca se entienda · Don Ventas</title>');
 const target=path.join(root,demo?'portafolio/vuelta-27/index.html':'index.html');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,text);
}
page('index-naturalidad.html',false);page('bici-story/aplicaciones-naturalidad.html',true);
console.log(JSON.stringify({pages:['/','/portafolio/vuelta-27/'],dependencyCount:files.files.length,sourceUntouched:true,production:false}));
