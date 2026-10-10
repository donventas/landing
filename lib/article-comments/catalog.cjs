'use strict';
// Server-owned canonical metadata. Never accept article titles or URLs from a visitor.
const titles = {
  'por-que-nacio-don-ventas': 'El valor no siempre habla por sí solo.',
  'contenido-que-atrae-clientes': 'Antes de crear contenido, entiende qué resuelve el negocio.',
  'tu-marca-es-tu-ventaja': 'Tu marca es tu ventaja.',
  'manual-de-marca': 'Manual de marca: el manual que más vale no perder',
  'logotipos-mitos': 'Logotipos: mitos que no dejan brillar a tu marca',
  'diseno-editorial': 'Diseño editorial: dale identidad a lo que entregas',
  'como-aparecer-en-google': '¿Cómo te encuentra quien aún no sabe que existes?'
};
module.exports = Object.freeze(Object.fromEntries(Object.entries(titles).map(([id, title]) =>
  [id, Object.freeze({ id, title, url: 'https://www.donventas.mx/blog/' + id + '.html' })])));
