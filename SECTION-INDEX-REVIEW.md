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

## Corrección posterior: barra de progreso — 7 de octubre

Base: `0e2d40676f834466523110fc74a05fa8f037afa9` (PR #39 ya fusionada por autorización). Los cuatro artículos tenían HTML y cálculo de progreso; tres conservaban offsets fijos de 65/69 px y z-index 95, detrás del encabezado (83/91 px y z-index 100). Solo el manual tenía la corrección. Reproducción en Chrome local: los tres anteriores quedaban ocultos a 390 y 1440 px.

Se reutiliza la altura real compartida `--section-nav` y la capa 102 del manual. Se conserva el cálculo de avance; no se añaden eventos, scripts de producción ni recursos gráficos. Los seis consumidores de blog.css actualizan su versión de caché. No cambia contenido, SEO, imágenes, formularios ni analítica; el hub y glosario no reciben una barra de lectura artificial.

QA productor: 167/167 pruebas unitarias; 60 muestras (4 artículos × 5 anchos × inicio/mitad/final), barra visible, avance 0/50/100 %, sin desbordamientos y por encima del índice desplegado. Resize de móvil a escritorio y viceversa comprobado. Capturas móviles/escritorio revisadas. Evidencia local `.qa-manual/progress-before.json`, `progress-after.json` y capturas; script reproducible `scripts/qa-reading-progress.cjs`, excluido del despliegue. No se repitió la medición de rendimiento de campo ni se solicita como condición para este cambio de posición fija sin nuevos recursos; sin QA independiente nuevo. Corrección en preview, no autorizada aún para producción.

## Ritmo visual de la familia — 7 de octubre

Base vigente: `24598ce367bb6239c51486b52e42136a852fa58e` (PR #40, ya publicada).
Rama de trabajo: `codex/blog-visual-rhythm`. Arturo aprobó aplicar el diagnóstico
visual de los cuatro artículos; esta ronda no autoriza merge ni producción.

### Composición y consumidores

Refinamiento de presentación / assembly-led. Se reutiliza la familia aprobada,
sin nuevas imágenes, marcas, mensajes, fuentes, scripts de producción ni motion.
La especificación acordada es variar el ritmo según la función narrativa, no
alternar colores mecánicamente ni convertir todos los artículos en una plantilla.
EA: implementación HTML/CSS local, render confirmado en Chrome; VAP no requerido
porque las imágenes y láminas existentes no cambian. AVOS/BSB se consulta en modo
lectura; no hay cambios de canon ni otras marcas en el conjunto de referencias.

- Ventaja: relato íntimo; capítulo familiar claro, cita con jerarquía propia,
  tres relaciones promesa/recursos en HTML semántico, lecturas agrupadas y CTA menor.
- Contenido: experiencia, preguntas, comparación y revisión como momentos distintos;
  preguntas sobre papel, contraste entre función/utilidad, checklist diferenciado.
- Carta fundacional: conserva campos crema/azul y asimetría. Se amplían titulares
  estrechos, el aprendizaje recupera ancho de lectura y el cierre usa columnas parejas.
- Manual: conserva las dos láminas, el orden y los cambios de fondo. Solo espaciado
  móvil de aplicaciones/anotaciones y jerarquía más contenida del CTA.
- Cuatro adaptaciones responsive, no reproducciones proporcionales. Columnas
  reordenadas en flujo nativo en móvil; sin recorte de imágenes ni contenido oculto.
- Ancho de lectura de 740 px en ensayo/guía; márgenes móviles de 24 px. Fondos y
  colores vienen de la familia publicada. Un CSS nuevo, versionado y opt-in,
  evita propagar cambios al hub, glosario, páginas legales o servicios.

### Relato y descubrimiento protegidos

No se introducen experiencias, claims, datos, hipótesis comerciales ni tecnicismos.
Comparación DOM contra el baseline: todos los caracteres de `main` (salvo espacios),
enlaces e imágenes preservados. El párrafo de promesas se divide en `dt/dd` sin
reescribir sus palabras. Title, descriptions, canonical, fechas, OG y JSON-LD
idénticos; URLs, sitemap, inventario del glosario y analítica sin cambios. No se
reabre la demanda ni se simula frescura por una modificación de presentación.

### Evidencia de QA

- Suite completa: 170/170 pruebas aprobadas y `git diff --check` limpio.
- Regresión de progreso: 60 muestras (inicio/mitad/final, cuatro artículos y cinco
  anchos), barra visible, porcentaje correcto, índice abierto y resize sin fallos.
- `scripts/qa-article-rhythm.cjs`: 36 combinaciones de artículo/ancho
  (320/390/599/601/768/799/801/900/1440), contenido/SEO idénticos al baseline,
  imágenes completas, notas operativas y cero desbordamientos de documento.
- Capturas nuevas `rhythm-v2-*` y reporte `rhythm-v2-report.json` en `.qa-manual/`,
  excluidos de Git y del despliegue. Revisión individual y de colección en
  390/1440; son viewports simulados de Chrome, no teléfonos físicos.
- QA técnica independiente: 16 combinaciones adicionales, 23 destinos del índice
  con foco y título visible a 390 px, y contraste de bloques claros comprobado.
- QA visual independiente: cuatro panoramas de escritorio, familia/promesa a
  tamaño real en 390/1440, preguntas y manual móvil, cierre y comparación de la
  carta. Sin bloqueos; la transparencia previa del encabezado se conserva.
- CSS adicional: 7340 bytes sin comprimir / 1807 gzip; ninguna imagen ni JS nuevos.
- Laboratorio local pareado, una carga fría por artículo/versión, viewport390,
  CPU×4, latencia150 ms y 200000 B/s; HTML/CSS interceptados simétricamente para
  comparar versiones. LCP baseline→candidato (segundos): carta1.372→1.152,
  contenido1.152→1.068, ventaja1.116→1.188, manual1.348→1.236. CLS idéntico
  por pareja, entre0.000393 y0.000965. No son métricas de campo, benchmark de
  producción ni evidencia de mejora estadística; no se midió INP de campo.
- Los scripts de QA y este registro no se despliegan. Sin formularios enviados,
  eventos a terceros, cambios en Runtime/Portal ni solicitud de indexación.

Aceptación estética del nuevo preview y autorización de release pendientes de
Arturo. Reversión: revertir el commit de esta rama restaura el baseline sin borrar
el relato ni los assets. Pasar pruebas no demuestra retención ni conversiones.
