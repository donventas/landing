# Bloque 10 — expediente del release

## Trazabilidad

- Fuente de desarrollo: `FinDataMan/don-ventas-runtime`.
- PR fuente: `#52`.
- Commit fuente: `9f531f5`.
- Repositorio de publicación: `donventas/landing`.
- Base de trabajo: `b47c2a1` de `main`.
- Rama de release: `codex/b10-editorial-release`.

## Traslado selectivo

Se trasladaron la composición editorial, el hero, las tres rutas comerciales, el método, las dos huellas públicas verificables y el cierre consultivo. La última iteración recupera además la escena editorial aprobada del método en el mockup canónico del Bloque 10, en lugar de repetir una segunda imagen del símbolo. No se copiaron carpetas completas del Runtime y no se modificó el Portal.

Se conservaron el `head` técnico, canonical, robots, sitemap, datos estructurados, páginas legales, fuentes locales, analítica de Vercel y el envío vigente a Supabase. La nueva experiencia del diagnóstico reutiliza esa infraestructura y agrega validación contextual, campo trampa, tiempo mínimo de llenado, estados de envío y revisión humana.

La oferta temprana explica valor, casos y método sin mostrar montos. Los rangos aparecen después, en una sección de inversión orientativa, o dentro del diagnóstico después de preguntar por el problema y el cambio deseado. La moneda MXN se identifica junto a cada cifra.

El formulario de contenido queda en cinco pasos y el de sistema de marca en seis. Cada pregunta ofrece como máximo cinco opciones; la ruta de contenido se infiere del problema, el cambio deseado y el punto de entrada, en vez de pedir al visitante que elija un paquete. Se retiraron la pregunta repetida sobre el efecto, la selección explícita de ruta, la pregunta de tiempo y otros campos que no cambian la recomendación inicial.

## Promesa operativa

La confirmación del formulario es inmediata. Don Ventas revisa el caso y responde en un máximo de dos días hábiles. Si la persona deja WhatsApp, Arturo puede compartir personalmente un diagnóstico breve e iniciar la conversación por ese canal; en caso contrario, se usa correo. El PDF de una página se reserva para oportunidades en las que ayude a definir o formalizar el siguiente paso y no se promete automáticamente a todo envío.

Antes de enviar, el formulario presenta un resumen compacto y editable del problema, el cambio buscado, la ruta preliminar y la inversión considerada. La analítica registra cada paso visto, cada paso completado y el punto de abandono para simplificar el flujo con evidencia sin instalar grabación de sesiones.

## Símbolo 3D

Arturo autorizó expresamente la excepción de movimiento para este hero. El símbolo ejecuta la entrada editorial aprobada en el Bloque 10: arco de 72 grados durante 2.3 segundos, un solo ciclo y reposo frontal. El usuario puede reproducir la entrada; no existe rotación ambiental infinita. WebGL se carga de forma diferida y conserva el SVG aprobado como fallback. La preferencia de movimiento reducido usa siempre el fallback estático.

El GLB, la malla, el SVG y la imagen de respaldo se verifican por hash en `assets/b10-motion/manifest.json`. Su inclusión no constituye admisión del GLB como activo canónico.

## Ronda de rendimiento aprobada

La composición no cambió: se conservaron los originales y se generaron derivados WebP de 640 y 1280 px con trazabilidad en `assets/b10-performance-manifest.json`. El peso potencial de las seis imágenes del portafolio pasó de 8.71 MiB a 152 KiB en la selección de 640 px o 512 KiB en la de 1280 px, una reducción de 94–98% según pantalla y densidad. La fotografía del fundador pasó de 146 KiB a 43 KiB y ahora carga de forma diferida.

La misma política se aplicó a la ruta de sistema de marca: sus seis imágenes de casos pasaron de 8.94 MiB a 100 KiB en 640 px o 294 KiB en 1280 px, una reducción aproximada de 97–99%. Los originales permanecen intactos y disponibles para regenerar otros tamaños.

El navegador elige la imagen apropiada mediante `srcset`; la galería conserva el intercambio de escenas y el lightbox. También se reservaron las dimensiones de las imágenes para evitar saltos de diseño. Las tipografías continúan autoalojadas, pero sus declaraciones quedaron en la hoja principal para eliminar una petición CSS en serie.

La lógica del diagnóstico se descarga al aproximarse al formulario o al mostrar intención de abrirlo, con una alternativa accesible por correo si falla. El símbolo conserva el SVG canónico visible desde el primer instante y solicita la malla 3D en tiempo ocioso; movimiento reducido sigue usando la versión estática.

### Segunda ronda: primera vista

La tipografía normal que compone la mayor parte del encabezado principal, junto con el SVG estático del símbolo, se solicita de forma prioritaria. La cursiva conserva `font-display: swap` y deja de competir con la hoja de estilos durante la primera descarga. La escena del símbolo mantiene una altura reservada antes de pintar para evitar desplazamientos sin forzar la geometría del SVG.

El render 3D completo sale también de la ruta crítica: se descarga tras siete segundos posteriores a `load`, o antes si la persona interactúa con la escena; la preferencia de movimiento reducido evita esa descarga. La analítica de Vercel se carga después de seis segundos o en la primera interacción global. Así se conserva la medición y la entrada autorizada sin hacerlas competir con la primera vista; no se incorporó grabación de sesiones.

Los scripts, hojas, fuentes, SVG y malla solicitados con versión reciben caché de un año con `immutable`. Los derivados WebP y la fotografía optimizada del fundador, que todavía usan nombres mutables, reciben un día de caché y una semana de revalidación en segundo plano. Los documentos HTML conservan la política normal de revalidación, de modo que una publicación pueda actualizar el contenido sin servir una página anterior.

No se separó una segunda hoja de estilos crítica en esta ronda. Las dos hojas de la portada suman cerca de 69 KiB sin compresión y dividirlas ahora duplicaría reglas y aumentaría el riesgo de divergencia visual. La decisión se volverá a evaluar únicamente si las mediciones del nuevo preview muestran que el CSS sigue bloqueando el objetivo interno de LCP.

En tres cargas frías locales a 390 px, con CPU limitada a 4× y red móvil simulada en 1.6 Mbps/150 ms, se obtuvieron LCP de 2.228, 1.736 y 1.720 s; CLS de 0 en las tres; y TBT aproximado de 11, 83 y 82 ms. Las medianas quedaron en **1.736 s de LCP, 0 de CLS y 82 ms de TBT**, dentro de los objetivos internos de 2.2 s, 0.05 y 150 ms. La prueba verificó además que ni el render 3D ni la analítica se descargan durante esa ventana. El render sí se activa al interactuar con la escena y permanece completamente estático con movimiento reducido.

## QA exigido antes de producción

- Suite automatizada del formulario y activos.
- Revisión visual en escritorio y anchos de 320, 390 y 768 px.
- Accesibilidad básica, orden de encabezados, navegación por teclado y movimiento reducido.
- Enlaces externos, imágenes completas, canonical, robots, sitemap y JSON-LD.
- Envío real marcado como QA contra la infraestructura vigente.
- Preview de Vercel aprobado expresamente por Arturo antes del merge.

## Estado de las compuertas del preview

- `30/30` pruebas automatizadas aprobadas, incluidas la entrada 3D, el límite de opciones, la reducción de pasos, la ruta determinista de sistema de marca y los presupuestos de rendimiento de ambas rutas.
- Sin desbordamiento horizontal en 320, 390, 768 y 1280 px; el cierre y el formulario conservan sus márgenes.
- Las dos imágenes principales del portafolio cargan completas con `object-fit: contain`.
- Los enlaces públicos de Arturo Villagomez y Casa Artú respondieron con HTTP 200.
- La entrada animada cargó en 222 ms en la revisión local a 390 px, completó el ciclo y volvió al reposo frontal; el control de reproducción volvió a quedar habilitado. La malla transferida pesa 66,405 bytes y el SVG de respaldo 624 bytes. El GLB trazable pesa 27,236 bytes y no se descarga para renderizar la primera vista.
- El QA independiente retiró del HTML los cuatro proyectos no públicos, corrigió la pregunta de tiempo duplicada en branding, unificó periodo e IVA, actualizó `llms.txt`, renovó `lastmod` y despejó el encabezado a 768 px.
- **Bloqueo vigente:** el POST sintético a Supabase fue rechazado con `42501` por RLS. La interfaz conserva las respuestas y muestra el estado de error, pero el release no puede fusionarse hasta restaurar/verificar una entrada segura y repetir el envío real con éxito.
- **Protección pendiente:** el campo trampa y el tiempo mínimo mejoran el filtrado del navegador, pero no sustituyen controles del servidor. Antes de producción se debe decidir entre una función de recepción con límite de frecuencia y verificación antispam, o una protección equivalente que evite el POST directo a Supabase.

## Diferidos conscientes

- Marje: se incorporará al portafolio cuando exista una huella pública verificable.
- Resultados comerciales de casos: solo se publicarán con evidencia atribuible y autorización.
- Aviso de privacidad heredado: el consentimiento junto al formulario ya describe diagnóstico y contacto; el bundle legal debe regenerarse desde una fuente editable y recibir revisión jurídica para ampliar de branding a contenido y sitio.

## Reversión

Si una compuerta falla después de desplegar, se debe revertir el commit de merge del PR del Landing. No se debe modificar el Portal ni sustituir la infraestructura de leads como mecanismo de reversión.
