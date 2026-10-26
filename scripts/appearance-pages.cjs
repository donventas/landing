'use strict';
// Explicit scope: no microsite co-branding, social-card templates, Portal or Runtime.
const pages = {
  'index.html': 'home', 'branding.html': 'service',
  'diagnostico.html': 'diagnostic', 'arturo-villagomez.html': 'founder',
  'blog/index.html': 'blog', 'blog/glosario.html': 'glossary',
  'blog/manual-de-marca.html': 'manual',
  'blog/por-que-nacio-don-ventas.html': 'manifesto',
  'blog/contenido-que-atrae-clientes.html': 'article',
  'blog/tu-marca-es-tu-ventaja.html': 'article',
  'blog/logotipos-mitos.html': 'article', 'blog/diseno-editorial.html': 'article',
  'blog/como-aparecer-en-google.html': 'article',
  'blog/como-aplicar-identidad-visual.html': 'context', 'blog/como-crear-una-marca.html': 'context',
  '15_LEGAL/Centro Legal.html': 'legal', '15_LEGAL/Aviso de Privacidad.html': 'legal',
  '15_LEGAL/Terminos y Condiciones.html': 'legal', '15_LEGAL/Politica de Cookies.html': 'legal',
  '15_LEGAL/Comentarios Privados.html': 'utility', 'suscripcion.html': 'utility'
};
const control = '<div class="appearance-preference" id="apariencia"><label for="site-appearance">Apariencia del sitio</label><select id="site-appearance" data-dv-appearance-select disabled><option value="system">Según tu dispositivo</option><option value="light">Clara</option><option value="dark">Oscura</option></select></div>';
function decode(html) {
  const match = html.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/);
  return match ? JSON.parse(match[1]) : html;
}
function integrate(html, family) {
  const packed = html.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/);
  if (packed) return html.replace(packed[0], () => '<script type="__bundler/template">' + JSON.stringify(integrate(JSON.parse(packed[1]), family)).replace(/<\/script/gi, '<\\/script') + '</script>');
  if (html.includes('data-dv-page=')) throw new Error('Already integrated');
  return html.replace(/<html\b/, '<html data-dv-page="' + family + '"')
    .replace('</head>', '<script src="/appearance.js"></script>\n<link rel="stylesheet" href="/appearance.css">\n<link rel="stylesheet" href="/appearance-families.css">\n' + (['home','service','diagnostic'].includes(family) ? '<script defer src="/diagnostic-focus.js"></script>\n' : '') + '</head>')
    .replace('</body>', control + '\n</body>');
}
module.exports = { pages, decode, integrate, control };
if (require.main === module) {
  const fs = require('node:fs'), path = require('node:path');
  for (const [file, family] of Object.entries(pages)) {
    const target = path.join(__dirname, '..', file);
    fs.writeFileSync(target, integrate(fs.readFileSync(target, 'utf8'), family));
  }
}
