# Marcas web · canon 3.0

Fuente de identidad: FinDataMan/don-ventas-runtime, main fijado en
`0c002aa11495eaf98ba83e7a13adc99777da7fd6`.
Gobierno: `logos/pack/bloque-01-canonical-manifest.json`, versión 2.1,
assetSetId `donventas.block-01.logo.canon-3.0`, decisión D-03.

- Firma B6: navegación y tarjetas sociales. SVG existente en este directorio
  cotejado con el export canónico, sin redibujado ni dependencia de fuentes.
- Símbolo B: pie de diagnóstico junto al nombre ya escrito.
- B-S: favicon de reducción. `/favicon.svg` es copia exacta del favicon del
  Runtime fijado; PNG 32/192, Apple 180 e ICO 48 son rasterizaciones mecánicas.
- El Don: sigue siendo mascota editorial sólida, no sustituto del símbolo.
  Los SVG inline del hub y artículos conservan geometría de
  `mascota/exports/el-don-solido-reversa.svg`; blanco corregido a #EEF1F6.
  El viewBox editorial conserva su encuadre y no recorta los trazos.

## Consumidores revisados

Home, branding, diagnóstico, hub, dos artículos y cuatro documentos legales.
Los legales empaquetados deben incluir los favicons tanto en el contenedor
como en el head de la plantilla que sustituye al documento.
Tarjetas: contenido, diagnóstico, branding histórica y fundacional
(1200×630, 1200×900, 1200×1200). La tarjeta editorial actual de branding
ya usaba B6 y no se modificó. Las fotos del hub/artículo 02 no llevan marcas.
No se modificaron imágenes de proyectos de clientes ni sus identidades.

## Reproducción y controles

`scripts/build-canonical-favicons.cjs` requiere Sharp instalado o resuelto
mediante SHARP_MODULE. No dibuja geometría: rasteriza favicon.svg.
`scripts/refresh-canonical-marks.cjs` registra la migración acotada de
referencias; no modifica Runtime. Las tarjetas se exportan desde
`social-cards/` con el navegador al tamaño nativo, después de cargar las
fuentes e imágenes, sin recortar ni estirar. JPG a calidad 88.

`tests/canonical-marks.test.cjs` fija hashes LF de SVG, comprueba todos los
heads, ausencia de marcas retiradas en navegación/plantillas y dimensiones.
Una futura actualización del canon requiere revisar manifiesto y consumidores,
no limitarse a cambiar los hashes para hacer pasar pruebas.

Versión de caché: `canon-3-20261004`. Se mantienen paths antiguos de favicon
actualizados para consumidores sin parámetros; ICO cubre descubrimiento por
defecto. Los caches externos y buscadores pueden tardar en refrescar.

## Evidencia de esta revisión

- 58 pruebas automatizadas, incluidos contratos existentes de leads/SEO.
- Revisión independiente de fuente: SVG contra Runtime, texto legal intacto,
  El Don geométricamente idéntico; sin cambios backend, CSP, robots o sitemap.
- Matriz browser: hub, ambos artículos y diagnóstico en 320/390/768/1440,
  sin desbordamiento horizontal ni encabezados ocultos bajo la navegación.
- QA visual de tarjetas a sus tamaños nativos y navegación móvil/escritorio.
- No se realizó un nuevo envío de lead: ni el flujo ni el endpoint cambiaron;
  las regresiones automatizadas verifican validación/envío con transporte simulado.

Release en rama propia, pendiente de aceptación de preview y autorización
de merge. No implica indexación ni refresco de caché de Google/WhatsApp.
Rollback: revertir el commit del release con sus referencias y rasterizaciones.
