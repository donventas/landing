'use strict';
// Mechanical integration only: preserve editorial copy, assets and canonical URLs.
const {pages} = require('./appearance-pages.cjs');
const origin = 'https://www.donventas.mx';
const languages = [['en','English'],['fr','Français'],['pt','Português'],['de','Deutsch'],['it','Italiano'],['bg','Български'],['ja','日本語'],['zh-CN','简体中文'],['ar','العربية']];
function publicURL(file) { return origin + '/' + file.split('/').map(encodeURIComponent).join('/').replace(/index\.html$/, ''); }
function block(file) {
  const url = publicURL(file), sensitive = file === 'suscripcion.html';
  const link = 'https://translate.google.com/website?sl=es&tl=en&u=' + encodeURIComponent(url);
  return '<section class="dv-language-footer" aria-label="Idioma / Language">\n' +
    '<details class="dv-language" id="idioma"><summary aria-label="Idioma / Language" title="Idioma / Language"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h12M9 3v2M5 5c1 5 4 8 9 10M13 5c-1 5-4 8-9 10M14 21l4-10 4 10M15.5 17h5"/></svg><span class="dv-language-label">Idioma / Language</span></summary>\n' +
    '<div class="dv-language-panel"><h2>Lee en tu idioma.<br><span lang="en">Read in your language.</span></h2>' +
    (sensitive ? '<p>En esta página, usa <strong>Traducir</strong> desde el menú de tu navegador. No compartimos tu enlace de suscripción con un traductor externo.</p><p lang="en">Use your browser’s Translate option here. Your subscription link is not shared with an external translator.</p>' :
    '<label for="dv-language-target">Idioma de lectura / Reading language</label><select id="dv-language-target" data-dv-language-target disabled>' + languages.map(([value,name]) => '<option value="'+value+'">'+name+'</option>').join('') + '</select>' +
    '<a class="dv-language-go" data-dv-language-url="'+url+'" href="'+link.replace(/&/g,'&amp;')+'" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Traducir con Google <span lang="en">/ Translate</span> ↗</a>' +
    '<p>Traducción automática externa · abre otra pestaña.<br><span lang="en">External automatic translation · opens a new tab.</span></p>' +
    '<p class="dv-language-note">Las imágenes pueden seguir en español. Para enviar formularios, vuelve al sitio original.<br><span lang="en">Images may remain in Spanish. Return to the original site to submit forms.</span></p>') +
    (sensitive ? '' : '<a class="dv-language-help" href="https://support.google.com/chrome/answer/173424" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">También puedes traducir desde tu navegador ↗<br><span lang="en">You can also use your browser’s Translate option</span></a>') +
    '<button class="dv-language-close" type="button" hidden>Cerrar / Close</button></div></details></section>\n';
}
function integrate(html,file) {
  const packed=html.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/);
  if(packed) return html.replace(packed[0],()=>'<script type="__bundler/template">'+JSON.stringify(integrate(JSON.parse(packed[1]),file)).replace(/<\/script/gi,'<\\/script')+'</script>');
  if(html.includes('class="dv-language-footer"')) return html.replace(/<section class="dv-language-footer"[\s\S]*?<\/section>\n/,()=>block(file));
  if(!html.includes('class="appearance-preference"')) throw Error('Missing shared utility: '+file);
  html=html.replace('</head>','<link rel="stylesheet" href="/translation.css">\n<script defer src="/translation.js"></script>\n</head>');
  html=html.replace('<div class="appearance-preference"',block(file)+'<div class="appearance-preference"');
  html=html.replace(/(<div class="mobile-explore-links">)([\s\S]*?)(<\/div>)/, '$1$2<a href="#idioma" data-dv-language-open>Idioma / Language</a>$3');
  return html;
}
module.exports={languages,publicURL,block,integrate};
if(require.main===module){const fs=require('node:fs'),path=require('node:path');for(const file of Object.keys(pages)){const p=path.join(__dirname,'..',file);fs.writeFileSync(p,integrate(fs.readFileSync(p,'utf8'),file));}}
