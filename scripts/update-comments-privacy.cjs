'use strict';
// One-time scoped update of the legacy bundled legal page; preserve its assets.
const fs=require('node:fs'),path=require('node:path');
const file=path.join(__dirname,'../15_LEGAL/Aviso de Privacidad.html');
const source=fs.readFileSync(file,'utf8');
const pattern=/(<script type="__bundler\/template">)([\s\S]*?)(<\/script>)/;
const match=source.match(pattern);
if(!match) throw Error('Legal template missing');
let html=JSON.parse(match[2]);
if(html.includes('comments-privacy-complement')) process.exit(0);
const anchor='  <h2 id="legal-04"';
if(!html.includes(anchor)) throw Error('Legal anchor changed');
html=html.replace(anchor,`  <section id="comments-privacy-complement" aria-labelledby="comments-privacy-title">
    <h3 id="comments-privacy-title">Comentarios privados del blog y suscripción voluntaria</h3>
    <p>Usamos tu mensaje, correo, nombre opcional y artículo de origen para atenderte en privado. Enviar un comentario no te suscribe. Si marcas la casilla opcional, te pedimos confirmar por correo que quieres recibir artículos y novedades; puedes darte de baja de forma independiente.</p>
    <p>Este canal utiliza Vercel, Supabase y Resend. La base elimina mensajes vencidos a los 180 días desde recepción y solicitudes sin confirmar a los 30 días mediante limpieza diaria. Consulta los plazos, proveedores, copias de correo y mecanismos de baja en el <a href="/15_LEGAL/Comentarios%20Privados.html">aviso complementario de comentarios y suscripción</a>, actualizado el 9 de octubre de 2026.</p>
  </section>
\n`+anchor);
fs.writeFileSync(file,source.replace(pattern,()=>match[1]+JSON.stringify(html).replace(/<\/script>/g,'<\\/script>')+match[3]));
