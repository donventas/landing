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

## QA exigido antes de producción

- Suite automatizada del formulario y activos.
- Revisión visual en escritorio y anchos de 320, 390 y 768 px.
- Accesibilidad básica, orden de encabezados, navegación por teclado y movimiento reducido.
- Enlaces externos, imágenes completas, canonical, robots, sitemap y JSON-LD.
- Envío real marcado como QA contra la infraestructura vigente.
- Preview de Vercel aprobado expresamente por Arturo antes del merge.

## Estado de las compuertas del preview

- `21/21` pruebas automatizadas aprobadas, incluidas la entrada 3D, el límite de opciones, la reducción de pasos y la ruta determinista de sistema de marca.
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
