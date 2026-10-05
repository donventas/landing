# Campañas y puntos de interrupción

Decisión de Arturo, 2026-10-05: incorporar atribución y tasas de abandono al PR #33. Preparación en preview, no permiso para merge ni publicación GTM. Propietario de decisiones: Arturo; fuente técnica: Landing. Revisión propuesta semanal, acumulando 28 días cuando el volumen sea bajo; sin objetivos porcentuales inventados antes de una línea base.

## Qué podremos saber y qué no

1. Antes del sitio: impresiones y clics desde Search Console o el canal de campaña. GSC es la fuente de búsqueda orgánica; una publicación en redes necesita sus estadísticas propias. GA4 no observa a quien nunca llega, rechaza o bloquea la medición. Comparar clics del canal con vistas consentidas sirve para investigar diferencias, **no para calcular una tasa exacta de abandono de carga**: difieren usuarios, clics, dispositivos, ventanas, bots y consentimiento.
2. Dentro del sitio: páginas, exposición a secciones, intervalos de pestaña visible, progreso aproximado y clics. No son mapas de calor, grabaciones ni prueba de lectura/comprensión.
3. Diagnóstico: exposición, inicio, pregunta visible, paso validado, intento de envío, error y aceptación por API. El cierre de pestaña no se emite como abandono; se infiere la falta de avance en una ventana definida. No se envían respuestas ni datos de contacto.

Un problema de carga requiere revisar disponibilidad/errores de Vercel y rendimiento, aparte de analítica opcional. La caída revela dónde investigar, no la causa. Contrastar hipótesis con prueba del recorrido y, si hace falta, conversaciones o una pregunta voluntaria; no se añade encuesta en este cambio.

## Métricas principales y denominadores

Usar exploraciones GA4 por **usuarios únicos**, no sumar eventos ni mezclar sesiones con usuarios. Embudo cerrado para cada transición, pasos indirectos permitidos, máximo 30 minutos entre los dos pasos y el mismo filtro de ruta/campaña/dispositivo. Excluir entradas recientes cuyo plazo de observación aún no termina. Una persona que regresa después de la ventana puede convertir más adelante: no etiquetarla como perdida para siempre.

| Métrica | Cálculo | Decisión |
|---|---|---|
| Avance hacia el diagnóstico | Usuarios con `diagnostic_started` tras `diagnostic_viewed` / usuarios con `diagnostic_viewed` | Revisar invitación, esfuerzo percibido o encaje, sin asumir causa |
| Finalización del diagnóstico | Usuarios con `diagnostic_completed` tras `diagnostic_started` / usuarios con `diagnostic_started` | Revisar fricción y fallos de envío |
| Interrupción de cada pregunta | 1 − usuarios con `diagnostic_step_completed` después de `diagnostic_step_viewed` del mismo `step` y `route` / usuarios con esa exposición | Localizar preguntas a revisar |

Para `contact` usar `diagnostic_submit_attempted` en lugar de step_completed; luego separar intento → completed. Las preguntas condicionales no forman un embudo lineal común: analizar cada pregunta con su propia exposición y separar contenido/branding. Mostrar n/N junto a cada porcentaje; si N=0, "sin base", no 0%. No ordenar conclusiones por diferencias pequeñas con muestras escasas. Empezar descriptivamente y no afirmar causalidad o significancia.

Drivers: vista de página → `diagnostic_entry` y → `diagnostic_started`; `section_viewed`; `reading_progress`; tiempo visible. Un lector satisfecho puede salir sin contactar: la conversión comercial no es el único objetivo de un artículo. No usar rebote estándar GA4 como sinónimo de abandono del formulario. No hay atribución de ventas sin datos comerciales del cierre.

Guardrails: usuarios con `diagnostic_submit_failed` / usuarios con `diagnostic_submit_attempted`, y revisión de rendimiento/disponibilidad. Un usuario puede tener fallo y luego éxito: las tasas no son categorías excluyentes. `diagnostic_validation_error` es una señal genérica de error mostrado en contacto, sin nombre de campo ni mensaje; no debe interpretarse automáticamente como abandono.

## Recorrido de la propia landing — no solo del formulario

Extensión solicitada por Arturo: medir pérdida de avance entre secciones aunque la persona nunca abra el diagnóstico. `section_viewed` cubre ahora las nueve secciones, filtrando `content_id=inicio`, y añade `section_order` calculado por código, no copiado de la URL. El orden incluye el hero y no coincide necesariamente con los folios decorativos.

| Orden de lectura | section | Bloque |
|---|---|---|
| 1 | hero | Oferta inicial |
| 2 | problema | Fricciones del negocio |
| 3 | metodo | Primero entendemos, luego producimos |
| 4 | servicios | Rutas de oferta |
| 5 | casos | Trabajo y portafolio |
| 6 | ideas | Artículos |
| 7 | quien | Quién está detrás |
| 8 | preguntas | Preguntas frecuentes |
| 9 | contacto | Entrada al diagnóstico |

Definir dos vistas complementarias en GA4, pendientes de configurar y validar:

- **Alcance por sección:** usuarios con exposición al bloque / usuarios medidos de la landing. Mostrar n/N y segmentar por dispositivo y campaña. No equivale al porcentaje de todas las visitas del servidor.
- **No avance entre bloques A y B:** 1 − usuarios de la cohorte A que después alcanzan B dentro de 30 minutos / usuarios de A con ventana completa. Usar pares de secciones adyacentes como embudos cerrados; un solo embudo de nueve pasos excluiría a quienes saltan legítimamente secciones. La pérdida de avance es un proxy, no una salida confirmada.

Ejemplo hipotético, no datos del sitio: 100 personas medidas ven Método y 60 de ellas alcanzan Servicios en la ventana; 40% no avanzó a ese bloque. Antes de concluir que Método falla, revisar qué hicieron esas 40: CTA al diagnóstico, apertura de otra página, regreso o ausencia de más actividad medida. No sumar porcentajes de categorías que pueden solaparse.

Los clics a diagnóstico, servicios y contenidos desde la landing incorporan `origin_section` y, cuando corresponde, `origin_order`. Header/footer/other se separan. Así se puede distinguir una salida hacia una acción útil de una aparente interrupción. No se envían textos de enlaces ni URLs de contacto. Que exista un clic no garantiza que cargue su destino: verificar el evento de llegada o inicio correspondiente.

No registrar `pagehide`/pestaña oculta como abandono definitivo. No rellenar bloques anteriores al entrar por un ancla. Retroceder no produce una segunda exposición de un bloque ya registrado: el último evento de exposición **no necesariamente es el lugar de salida**. No presentar el máximo orden alcanzado como última sección leída. Consentimiento tardío, bloqueo de medición o una visita posterior alteran la cobertura; mantener esas limitaciones visibles.

Registrar `section_order`, `origin_section` y `origin_order` como dimensiones de evento para este análisis. Empezar con alcance/no avance como KPI de recorrido y finalización como resultado; el objetivo no es obligar a leer toda la landing, sino comprender la oferta y permitir un siguiente paso útil. No hay umbral universal aprobado: formar una base y revisar móvil/escritorio por separado antes de cambiar narrativa, longitud o posición del CTA.

## Eventos nuevos

| Evento | Regla |
|---|---|
| section_viewed | Al menos la mitad del encabezado (o de su área de viewport si es más grande) permanece visible al menos 1 segundo entre muestreos. Muestreo cada segundo; una vez por sección/documento. No prueba lectura. |
| visible_time | Hitos de 10/30/60/120 s acumulados con pestaña visible desde el permiso; no tiempo previo, oculto ni suspensión. No prueba atención. |
| reading_progress | Banda 25/50/75/90% alcanzada dentro del artículo, tras 5 s visibles. Solo banda observada; saltar al final no fabrica hitos intermedios. Incluye ambos tipos de plantilla de artículo. |
| diagnostic_viewed | Encabezado de pregunta visible durante el intervalo, o interacción real con una pregunta. |
| diagnostic_step_viewed | Mismo criterio; `route` y `step` de vocabularios cerrados. No basta con montar un formulario fuera de pantalla. |
| diagnostic_submit_attempted | Se inicia el envío tras validar contacto. No implica recepción. |
| diagnostic_validation_error | Error local de contacto mostrado al salir del campo; sin valor ni mensaje. |

Los inicios, exposiciones y finalizaciones se deduplican por documento y ruta/paso. Los intentos y fallos pueden repetirse, con protección de 1 s contra ráfagas. No llamar a esos recuentos "solicitudes únicas" ni "ventas". La exposición medida tras consentimiento tardío puede empezar a mitad del recorrido.

## Registro de enlaces de campaña

Cuatro UTM obligatorios; valores exactos, minúsculas. El código valida el vocabulario en `analytics.js`. Los siguientes códigos son habilitados para enlaces futuros; no significan que existan campañas activas ni autorizan inversión publicitaria.

- `utm_source` / `utm_medium`: instagram/social, facebook/social, linkedin/social, newsletter/email, whatsapp/messaging.
- `utm_campaign`: tu-marca-es-tu-ventaja, entender-antes-de-comunicar, origen-don-ventas, diagnostico-contenido, diagnostico-marca.
- `utm_content`: bio, publicacion, historia, video, correo, enlace.

Ejemplo para compartir desde una historia de Instagram:

`https://www.donventas.mx/blog/tu-marca-es-tu-ventaja.html?utm_source=instagram&utm_medium=social&utm_campaign=tu-marca-es-tu-ventaja&utm_content=historia`

No añadir UTM a enlaces internos: cambiarían artificialmente el origen. No escribir nombres de clientes, correos o texto libre en UTM. Nuevos códigos requieren actualizar registro, código y pruebas. Parámetros duplicados, desconocidos o pares canal/medio inconsistentes se descartan. GCLID/DCLID/GBRAID/WBRAID no se procesan en este release; antes de Ads hace falta integración y QA específicos. `messaging` puede quedar sin agrupar en GA: analizar mediante `entry_medium` o crear una agrupación explícita, sin llamarlo orgánico por defecto.

Dimensiones `entry_source`, `entry_medium`, `entry_campaign`, `entry_content`: última entrada etiquetada válida conservada en esa pestaña, con vencimiento de 30 minutos sin eventos medidos. Sin UTM reconocido ni contexto vigente no se envían; ausencia significa "sin atribución disponible", no una certeza de tráfico directo. La campaña también se mapea a campos nativos GA4; verificar informes reales antes de equiparar ambos modelos. No se reconstruye actividad previa al consentimiento.

## Configuración de GA4 pendiente de validación real

Registrar dimensiones de evento: content_id, destination, term, route, step, section, section_order, origin_section, origin_order, entry_source, entry_medium, entry_campaign, entry_content. Registrar seconds y percent como métricas personalizadas, o usar condiciones de evento sin agregarlas como tiempo total. Marcar únicamente diagnostic_completed como evento clave de solicitud aceptada (no venta).

Crear las transiciones descritas como exploraciones y segmentarlas por campaña, página de entrada y categoría de dispositivo. Separar el diagnóstico de marca y contenido. No crear un único embudo de todas las preguntas opcionales. La UI/informes todavía no están configurados ni validados: el preview simula eventos. Tag Assistant y DebugView deben demostrar recepción, atribución persistida entre páginas y ausencia de duplicados/PII antes de activar producción.

QA debe cubrir permiso previo/tardío, rechazo y retirada, UTM válido/inválido/duplicado, paso interno, vencimiento, almacenamiento bloqueado, pestaña oculta, salto de lectura, preguntas condicionales, recuperación de errores, éxito y exclusión de pruebas. No atribuir una simulación a datos de clientes.

## Evidencia de esta pasada

- 119 pruebas automatizadas pasan (23 específicas de analítica); incluyen atribución interna, expiración, parámetros rechazados, pestaña oculta, suspensión, exposición de pasos, salto de lectura y éxito solo después de respuesta del servidor simulado. La ampliación de landing comprueba inventario y orden contra el HTML real, las nueve exposiciones deduplicadas, entrada por un ancla sin fabricar pasos anteriores, visibilidad mínima y origen de los CTA sin texto libre.
- Navegador local: evento page_view con campaña Instagram/historia, sección hero y tiempo visible comprobados en visor de eventos; CTA de branding registra diagnostic_entry y la pregunta condicional se muestra después de avanzar. No se envió a Google ni se creó un lead real.
- JS de analítica: 20,569 bytes, gzip 6,563. CSS: 1,596 bytes, gzip 680. Incremento inicial combinado aproximado: 7.2 KB gzip, sin biblioteca adicional. El muestreo se instala solo tras aceptar y se detiene al retirar. Esto no certifica Core Web Vitals ni el coste de Google después del permiso.
- No hubo cambios de artículos, imágenes, backend de leads, Portal, Runtime ni AVOS. Configuración GA4 de dimensiones/embudos y recepción real continúan como compuertas explícitas; no hay tasas reales de abandono que reportar todavía.

## Referencias oficiales

- [Embudo de generación de contactos](https://support.google.com/analytics/answer/12944921)
- [Exploraciones de embudo y alcance por usuario](https://support.google.com/analytics/answer/9327974)
- [Campos de campaña GA4](https://developers.google.com/analytics/devguides/collection/ga4/reference/config)

Estas referencias sustentan el método, no afirman que la implementación ya reciba datos ni que conozcamos las causas de abandono de Don Ventas.
