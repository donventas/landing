# Extensión del índice de lectura

## Alcance y aprobación

Baseline de producción: `0a46bc5d5c4ad5c5eca87c76630f36d64399529e` (PR #38, aprobada y fusionada). Artículo público: https://www.donventas.mx/blog/manual-de-marca.html.

Refinamiento de presentación A, assembly-led: extender el componente aprobado, no rediseñar la marca ni reescribir contenido. AVOS/BSB gobierna la reutilización y la separación entre QA y aceptación. Runtime, Portal y fuentes de marca permanecen en modo lectura. Esta extensión se entrega en una PR independiente; su merge requiere aprobación.

## Consumidores

- Inicio, branding, perfil de Arturo y hub del blog.
- Los cuatro artículos: origen de Don Ventas, contenido, ventaja de marca y manual.
- Centro Legal, Aviso de Privacidad, Términos y Condiciones y Política de Cookies.
- Excepciones: diagnóstico mantiene su navegación por pasos; glosario mantiene búsqueda, filtros y retorno al artículo. Las plantillas internas de social cards no son páginas de lectura públicas.

## Contrato

Un solo índice desplegable por página, después de la entrada y antes del contenido. Anclas estáticas; no generación de encabezados ni dependencia de JavaScript para los enlaces. Reutilizar IDs existentes y añadir IDs a encabezados sin cambiar su texto cuando falten. Reemplazar índices anteriores, no duplicarlos. Mantener el atributo de medición del enlace a inversión en branding. Preservar copy, formularios, activos, metadatos, schema, canonical y sitemap.

La mejora con JavaScript calcula el alto real del encabezado fijo, cierra al elegir destino, mueve el foco al encabezado sin un segundo salto, conserva hash e historial y devuelve el foco al resumen con Escape. Cierra al pulsar fuera. Sin JavaScript el índice queda en flujo para no cubrir destinos. Los tres documentos legales empaquetados conservan su limitación previa de requerir JavaScript para montar el documento.

## Validación prevista

Pruebas unitarias, comparación de contenido y SEO contra el baseline; comprobación de los 12 consumidores a 320, 390, 768 y 1440 px; todos los destinos y teclado; menú móvil, anclas directas, no-JS y movimiento reducido. Regresión de consentimiento, glosario y artículo manual. Revisión visual de escritorio/móvil y QA independiente antes del preview. Ninguna prueba local equivale a indexación o posicionamiento.

## Resultados

- `node --test`: 166/166 aprobadas. Inventario editorial del glosario sin cambios.
- Comparación automatizada contra el baseline: texto (sin índices), metadatos y schema, formularios, imágenes y anclas anteriores preservados en las 12 páginas. Los wrappers legales permanecen intactos fuera de sus templates.
- Chrome local: 48 combinaciones de página/ancho (320, 390, 768, 1440 px), sin desbordamientos; 304 destinos verificados con hash, foco de encabezado y posición bajo la barra. Escape devuelve el foco y el clic exterior cierra el índice.
- Las 9 páginas no empaquetadas funcionan con índice nativo sin JavaScript. Probados todos sus destinos; el margen de respaldo evita que el encabezado fijo tape el título. Se mantiene la limitación previa de los 3 documentos empaquetados.
- Enlaces directos en carga nueva, pantallas de 390 × 568 y coexistencia con el menú móvil verificados en inicio, perfil, hub y términos.
- Regresión del artículo: 40 layouts adicionales, 42 saltos del manual, 24 pruebas de consentimiento sin salto al pie, retorno exacto desde tres términos del glosario y aislamiento entre pestañas. Sin excepciones JavaScript ni solicitudes externas durante estas pruebas.
- Laboratorio local móvil (390 px, DPR 2, CPU ×4, latencia 150 ms, 200000 B/s, tres cargas frías): manual LCP 1.580–1.632 s, CLS 0.000447; artículo de control LCP 1.404–1.516 s, CLS 0.000727. No son métricas de campo ni una prueba de concurrencia del servidor.
- Inspección visual de capturas de inicio, branding, hub, artículo y términos, en móvil/escritorio: jerarquía, contraste, columnas y panel desplazable correctos. Recursos compartidos inferiores a 4.5 KB CSS y 4 KB JS sin comprimir.
- QA independiente: un hallazgo de margen sin JavaScript corregido y revalidado a 390/1440 px; sin bloqueos restantes. El hub enlaza directamente a sus H2 existentes para que las imágenes superiores no dejen el título fuera de pantalla.

Evidencias reproducibles: `scripts/qa-section-index.cjs`, `scripts/qa-manual-blog.cjs`; informes y capturas locales en `.qa-manual/` (excluidos de Git y del despliegue). Los scripts QA y este registro están excluidos de Vercel.

La aprobación del artículo no se usa como aprobación automática del release del índice compartido. Entrega en PR/preview separado; producción conserva PR #38 hasta una aprobación posterior.
