# Bloque 10 — expediente del release

## Trazabilidad

- Fuente de desarrollo: `FinDataMan/don-ventas-runtime`.
- PR fuente: `#52`.
- Commit fuente: `9f531f5`.
- Repositorio de publicación: `donventas/landing`.
- Base de trabajo: `b47c2a1` de `main`.
- Rama de release: `codex/b10-editorial-release`.

## Traslado selectivo

Se trasladaron la composición editorial, el hero, las tres rutas comerciales, el método, las dos huellas públicas verificables y el cierre consultivo. No se copiaron carpetas completas del Runtime y no se modificó el Portal.

Se conservaron el `head` técnico, canonical, robots, sitemap, datos estructurados, páginas legales, fuentes locales, analítica de Vercel y el envío vigente a Supabase. La nueva experiencia del diagnóstico reutiliza esa infraestructura y agrega validación contextual, campo trampa, tiempo mínimo de llenado, estados de envío y revisión humana.

La oferta temprana explica valor, casos y método sin mostrar montos. Los rangos aparecen después, en una sección de inversión orientativa, o dentro del diagnóstico después de preguntar por el problema y el cambio deseado.

## Promesa operativa

La confirmación del formulario es inmediata. Don Ventas revisa el caso y confirma encaje en un máximo de dos días hábiles. El diagnóstico en PDF se ofrece únicamente a casos calificados y se entrega en tres a cinco días hábiles; no se promete automáticamente a todo envío.

## Símbolo 3D

El símbolo se publica en vista frontal estática. WebGL se carga de forma diferida y conserva el SVG aprobado como fallback. La preferencia de movimiento reducido usa siempre el fallback estático. No existe rotación, por lo que este release no requiere ni presume una excepción a la regla canónica.

El GLB, la malla, el SVG y la imagen de respaldo se verifican por hash en `assets/b10-motion/manifest.json`. Su inclusión no constituye admisión del GLB como activo canónico.

## QA exigido antes de producción

- Suite automatizada del formulario y activos.
- Revisión visual en escritorio y anchos de 320, 390 y 768 px.
- Accesibilidad básica, orden de encabezados, navegación por teclado y movimiento reducido.
- Enlaces externos, imágenes completas, canonical, robots, sitemap y JSON-LD.
- Envío real marcado como QA contra la infraestructura vigente.
- Preview de Vercel aprobado expresamente por Arturo antes del merge.

## Estado de las compuertas del preview

- `19/19` pruebas automatizadas aprobadas.
- Sin desbordamiento horizontal en 320, 390, 768 y 1280 px; el cierre y el formulario conservan sus márgenes.
- Las dos imágenes principales del portafolio cargan completas con `object-fit: contain`.
- Los enlaces públicos de Arturo Villagomez y Casa Artú respondieron con HTTP 200.
- El hero cargó la vista WebGL estática en 36 ms durante la medición local; la malla transferida pesa 66,405 bytes y el SVG de respaldo 624 bytes. El GLB trazable pesa 27,236 bytes y no se descarga para renderizar la primera vista.
- El QA independiente retiró del HTML los cuatro proyectos no públicos, corrigió la pregunta de tiempo duplicada en branding, unificó periodo e IVA, actualizó `llms.txt`, renovó `lastmod` y despejó el encabezado a 768 px.
- **Bloqueo vigente:** el POST sintético a Supabase fue rechazado con `42501` por RLS. La interfaz conserva las respuestas y muestra el estado de error, pero el release no puede fusionarse hasta restaurar/verificar una entrada segura y repetir el envío real con éxito.
- **Protección pendiente:** el campo trampa y el tiempo mínimo mejoran el filtrado del navegador, pero no sustituyen controles del servidor. Antes de producción se debe decidir entre una función de recepción con límite de frecuencia y verificación antispam, o una protección equivalente que evite el POST directo a Supabase.

## Diferidos conscientes

- Animación o rotación del símbolo: requiere aprobación explícita y una revisión separada.
- Marje: se incorporará al portafolio cuando exista una huella pública verificable.
- Resultados comerciales de casos: solo se publicarán con evidencia atribuible y autorización.
- Aviso de privacidad heredado: el consentimiento junto al formulario ya describe diagnóstico y contacto; el bundle legal debe regenerarse desde una fuente editable y recibir revisión jurídica para ampliar de branding a contenido y sitio.

## Reversión

Si una compuerta falla después de desplegar, se debe revertir el commit de merge del PR del Landing. No se debe modificar el Portal ni sustituir la infraestructura de leads como mecanismo de reversión.
