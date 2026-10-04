// Bounded consumer migration; canonical geometry is never reconstructed.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),version='canon-3-20261004';
const pages=['index.html','branding.html','diagnostico.html','blog/index.html','blog/por-que-nacio-don-ventas.html','blog/contenido-que-atrae-clientes.html',...fs.readdirSync(path.join(root,'15_LEGAL')).filter(x=>x.endsWith('.html')).map(x=>'15_LEGAL/'+x)];
const icons='<link rel="icon" type="image/svg+xml" href="/favicon.svg?v='+version+'">\n<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v='+version+'">\n<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v='+version+'">';
function headIcons(html){return html.replace(/<link\b[^>]*rel="(?:icon|apple-touch-icon)"[^>]*>\s*/g,'').replace('</head>',icons+'\n</head>');}
for(const file of pages){
 const filename=path.join(root,file);let html=fs.readFileSync(filename,'utf8');
 html=html.replace(/(<script[^>]+__bundler.template[^>]*>)([\s\S]*?)(<\/script>)/,(_,a,b,c)=>a+JSON.stringify(headIcons(JSON.parse(b)))+c);
 html=headIcons(html);
 html=html.replace(/<a class="brand"[^>]*>[\s\S]*?<\/a>/g,'<a class="brand" href="/" aria-label="Don Ventas, inicio"><img class="brand-wordmark" src="/assets/brand/donventas-wordmark-b6-reverse.svg" width="210" height="130" alt="Don Ventas"></a>');
 html=html.replace(/<svg[^>]*><path d="M22 16 L22 84 L58 50 Z"[\s\S]*?<\/svg>/g,'<img class="brand-symbol" src="/assets/brand/donventas-symbol-b-reverse.svg" width="26" height="26" alt="" aria-hidden="true">');
 html=html.replace(/<svg class="(?:eldon|feature-watermark|manifesto-mark)"[\s\S]*?<\/svg>/g,svg=>svg.replaceAll('#F2F5F9','#EEF1F6'));
 html=html.replace(/href="(\/?styles\.css)(?:\?[^"]*)?"/g,'href="$1?v='+version+'"');
 html=html.replace(/(og-content\.png|og-diagnostico\.png|og-fundacional-1200x(?:630|900|1200)\.jpg)(?:\?[^"\s]*)?/g,'$1?v='+version);
 fs.writeFileSync(filename,html);
}
for(const file of ['content.html','branding.html','diagnostico.html','fundacional.html','fundacional-4x3.html','fundacional-1x1.html']){
 const filename=path.join(root,'social-cards',file);
 fs.writeFileSync(filename,fs.readFileSync(filename,'utf8').replaceAll('../brand/donventas-horizontal-curvas-reverse.svg','../assets/brand/donventas-wordmark-b6-reverse.svg').replaceAll('CARTA 00 · 2026','ARTÍCULO 01 · 2026'));
}
