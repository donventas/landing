# GA4 — configuración y evidencia de QA

## Actualización preparada: rutas de evolución

Antes de publicar la rama `codex/brand-evolution-routes`, usar el plan de migración
de `ANALYTICS-FUNNEL.md`: ruta `evolucion`, ocho preguntas y recepción por API;
añadir `fundador` al análisis de exploración. Las tablas siguientes son evidencia
histórica del formulario anterior, no validación del formulario nuevo ni del
estado actual de la interfaz Google. Este cambio no publica GTM ni modifica las
exploraciones guardadas. Registrar la fecha efectiva cuando se autorice el release.

Fecha: 2026-10-05. Propiedad Don Ventas — sitio público, `557370059`.
Cuenta operadora verificada en la interfaz: `arturo.villagomez@donventas.mx`.
Este registro no autoriza el merge ni la publicación de GTM.

## Estado vigente de cierre — 2026-10-06

Las secciones siguientes preservan el historial; este resumen distingue lo
cerrado de lo pendiente sin sustituir una comprobación por otra.

| Compuerta | Estado y evidencia |
|---|---|
| Autorización | Arturo autorizó publicar GTM y fusionar PR33 cuando pasen las verificaciones; PR34 de identidad sigue separado. |
| Error y reintento | Cerrado para contenido: 503 → reintento → 200 local, hits de Tag Assistant y recepción DebugView de fallo/completado comprobados el 6 de octubre. API comercial no probada por esta simulación. |
| Importe indebido | Cerrado para la nueva recepción de las 13:45:31: sin `value` ni `currency`. No se corrigió retrospectivamente el dato anterior. |
| Respaldo administrativo | Invitación a `hola@arturovillagomez.com` autorizada y aceptada; ambos usuarios aparecen como administradores con acceso. Ya no figura la alerta de administrador único. |
| Consentimiento | Estado real verificado: analítica concedida después del permiso; tres permisos de anuncios denegados. La alerta territorial publicitaria sigue visible; no se silencia otorgando permisos de Ads. |
| Diagnóstico independiente | Cerrado: después de corregir la CSP, recorrido completo con datos sintéticos y recepción DebugView a las 15:04:42 CDMX del 6 de octubre; `content_id=diagnostico`, URL canónica independiente y `route=contenido`. Sin importe ni contacto en parámetros. |
| Ramas condicionales | Test nuevo cubre las 12 opciones iniciales y pregunta aplicable única, presupuesto único y contacto al final. No equivale a recorrer las 12 variantes en navegador con Google. |
| Exploraciones | Guardados los ocho pares adyacentes de landing, alcance y base de page_view; ocho vistas de diagnóstico (cuatro transiciones por ruta) y origen de clics. Cerrados/indirectos/30 min. Condiciones de los cinco pares nuevos revisadas al reabrir. Permanecen rotuladas BORRADOR sin datos productivos. Usuarios activos en embudos y clics; Total de usuarios en alcance/base, sin mezclarlos. |
| Exclusión de QA | Filtro de desarrolladores Excluir/Activo reconfirmado el 6 de octubre. Hoy, acciones y diagnóstico muestran sin datos en informes procesados; esto no distingue latencia de exclusión efectiva. Compuerta pendiente, no acreditada por DebugView. |
| CSP y rendimiento | Muestras locales finales a 1280 y 390 px con Google activo, sin Tag Assistant superpuesto: cero violaciones CSP y cero bloqueo observado en primeros 10 s. Son pruebas sin limitación de red y con caché; no certifican campo/Lighthouse. La incidencia anterior aislada de `fonts.gstatic.com` no se reprodujo; su causa exacta no se atribuye sin evidencia. Smoke de producción pendiente del release. |
| Publicación | GTM sin publicar; PR33 borrador sin fusionar. |

La automatización de Chrome sufrió interrupciones de interacción y agotamientos
de tiempo durante el cierre. No se registran clics enviados como acciones
completadas sin comprobar su resultado. Se pidió ayuda manual únicamente para
terminar el recorrido conectado, usando datos sintéticos.

## Configuración guardada y verificada

Trece dimensiones, todas de alcance **Evento**, verificadas en la tabla de GA4:

| Nombre visible | Parámetro |
|---|---|
| DV Contenido | content_id |
| DV Destino | destination |
| DV Ruta diagnostico | route |
| DV Paso diagnostico | step |
| DV Termino glosario | term |
| DV Seccion | section |
| DV Orden de seccion | section_order |
| DV Seccion del clic | origin_section |
| DV Orden del clic | origin_order |
| DV Canal de entrada | entry_source |
| DV Medio de entrada | entry_medium |
| DV Campana de entrada | entry_campaign |
| DV Pieza de entrada | entry_content |

Filtro `DV Trafico de pruebas`: tipo desarrolladores, operación Excluir,
estado **Activo**, guardado y verificado el 2026-10-05. Excluye eventos que llevan
debug_mode o debug_event; no excluye por país ni por una IP supuesta.
El filtro Internal Traffic existente se conserva en Prueba. La configuración
activa no acredita todavía su efecto en los informes: puede tardar 24–36 horas.
La exclusión no es retroactiva; no se eliminó historial ni se crearon filtros de país.
La actividad de esta fecha es de implementación: no interpretarla como clientes.

## Prueba local con Google real

`node scripts/analytics-qa-server.cjs --google-debug` sirve exclusivamente en
loopback, puerto 8786. Usar `http://localhost:8786/` y conectar desde Vista previa
del borrador GTM, sin publicarlo. El servidor modifica en memoria únicamente el
control del host y añade `debug_mode=true`, `traffic_type=developer` y aviso QA.
El marcado se aplica tanto a la configuración global como a cada evento local
para no depender de la herencia de parámetros de una etiqueta o del asistente.
El archivo desplegable analytics.js no se modifica. Las sustituciones fallan
cerrado si el código esperado cambia. Consentimiento sigue siendo obligatorio.
El endpoint de leads sigue simulado; nunca usar datos de clientes.
El servidor está excluido del despliegue mediante .vercelignore.

Verificado mediante interfaz de Tag Assistant y GA4 DebugView:

- Etiqueta base GTM activada una vez en el documento inspeccionado.
- Un hit page_view en la primera página inspeccionada, a G-YD4BFZTY4V.
- Payload del hit: URL canónica sin consulta, título neutral, referente vacío,
  Instagram/social/tu-marca-es-tu-ventaja/historia, modo debug y sin anuncios
  personalizados. Sin respuestas ni contacto en ese payload.
- DebugView muestra page_view, diagnostic_viewed, diagnostic_step_viewed y
  visible_time, además de first_visit y session_start automáticos.
- Tag Assistant muestra section_viewed y diagnostic_entry desde Método con
  origin_section=metodo y origin_order=3.
- Navegación interna a branding.html conserva campaña y content_id=marca.
- Retirar permiso recarga la página; inspección del DOM confirma ausencia de
  scripts Google/GTM. Navegación posterior sigue disponible.
- Recorrido completo de marca (9 preguntas, rama de claridad) con respuestas
  sintéticas: correo inválido muestra validación, corregirlo permite continuar;
  WhatsApp y sitio vacíos no bloquean el envío. El endpoint local simulado acepta
  y la interfaz muestra Solicitud recibida. No se creó un lead comercial.
- Tag Assistant muestra diagnostic_validation_error, diagnostic_submit_attempted
  y una finalización diagnostic_completed. En la pestaña Hits enviados del destino
  G-YD4BFZTY4V se verifica el hit de finalización. Su eventModel contiene route,
  content_id y contexto canónico, no nombre, correo ni respuesta libre.
- Tras retirar y volver a aceptar el permiso, el contexto de campaña anterior ya
  no se incluye: la persistencia entre páginas comprobada antes no implica
  conservar atribución después de retirarla.
- GA4 DebugView confirma diagnostic_completed en el flujo del dispositivo de
  prueba, además del intento y de los eventos de pasos; no es solo dataLayer.

Validación del repositorio: 124 pruebas automatizadas pasan; cinco verifican
que el servidor QA sea local, opt-in, marque depuración y falle cerrado ante un
cambio del contrato. No alteran el script de producción. `git diff --check` pasa.

Límites: esta comprobación de DOM no es una captura de red completa, ni acredita
el borrado físico de cookies. No se inspeccionaron cookies ni almacenamiento del
navegador mediante herramientas. La prueba no certifica CSP/rendimiento en
Vercel, recepción comercial de un lead, ni todas las ramas del formulario con
Google real. Esas compuertas siguen abiertas donde se señala abajo.

## Cierre parcial adicional — 2026-10-05

- Evento clave `diagnostic_completed` creado y verificado en su tabla, con
  recuento una vez por evento y **sin valor monetario predeterminado**. Se usa el
  evento del código existente, no una regla que convierta cualquier page_view.
  La recepción de la finalización de marca ya estaba comprobada; no es una venta.
- Servidor QA: `--fail-first` devuelve 503 solo en el primer envío y permite un
  reintento 200. La ruta de contenido se recorrió completa dos veces con datos
  sintéticos, sin WhatsApp ni sitio. En ambos recorridos la interfaz mostró
  `DV-503`, conservó las respuestas y luego `Solicitud recibida` al reintentar.
  No se enviaron leads al backend comercial.
- Las pruebas automatizadas verifican que el rechazo no produce finalización.
  **La recepción de error/reintento en GA4 no está confirmada**: Tag Assistant
  queda `Not Connected` en la pestaña controlada y su reapertura no restableció
  una sesión utilizable. DebugView mostraba otra sesión con page_view y
  visible_time, no evidencia del recorrido que acabábamos de hacer. No usar esa
  otra sesión para certificarlo. Tras reforzar debug por evento se repitió el
  flujo, pero siguió sin confirmación en GA4.
- `--csp` aplica exactamente la CSP de vercel.json para la ruta; si no existe,
  rechaza el HTML. No se relajó la política productiva. `--health` añade solo en
  localhost un panel de métricas y violaciones; está excluido de Vercel. No lee
  cookies, almacenamiento ni valores del formulario. No muestra querystrings.
- En escritorio local de 1280 px se observaron cero violaciones CSP. Una carga
  mostró LCP 232 ms, suma de shifts 0.047, DCL 188 ms; tras consentimiento cargó
  gtm.js, gtag/destination y recursos g/collect. Otra carga con consentimiento
  guardado mostró LCP 272 ms, suma de shifts 0.0115, DCL 222 ms, pero solo scripts
  Google y bootstrap de depuración sin recepción comprobada. Son observaciones
  locales sin limitación de red/CPU, no Lighthouse, INP, p75 ni datos móviles.
  El tiempo bloqueante acumulado de una sesión larga no es TBT; el panel ahora
  separa una ventana inicial de 10 segundos y explicita estos límites.
- No se fusionó PR33, no se publicó el contenedor ni se cambió producción.

## Análisis preparado

Exploración privada `DV Recorrido landing - BORRADOR sin datos productivos`:
[abrir en GA4](https://analytics.google.com/analytics/web/?authuser=1#/analysis/a410707546p557370059/edit/FvgmjU3lSEGrL1jcQxrbZQ).
Filas DV Seccion; columnas Categoría de dispositivo; valor Total de usuarios;
filtros DV Contenido=inicio y Nombre del evento=section_viewed. Es una estructura
inicial de recuentos de alcance, todavía sin denominador ni tasas. No hay tasas productivas, baseline ni
comparación móvil/escritorio interpretable todavía. No confundir ceros de la
plantilla con falta de demanda. Terminar y validar los embudos adyacentes, origen
de CTA, denominadores y exclusiones antes de compartir como informe operativo.
La pestaña adicional `PENDIENTE propagacion - no interpretar` es una plantilla
vacía: DV Seccion/section todavía no aparece en el selector de condiciones del
embudo. No se crearon dimensiones duplicadas para intentar sortear la espera.

## Pendiente antes de publicar

### Actualización de comprobaciones — 2026-10-06

- Autorización recibida: fusionar **cuando pasen las comprobaciones**. No es
  una dispensa de las compuertas pendientes. PR33 sigue abierto y en borrador.
- Head comprobado `b9409974f6feeedf9b98738efdef88798dcc606f`: site-tests,
  Vercel y comentarios de preview en verde; sin conflictos de fusión. Nueva
  ejecución local: 124/124 pruebas pasan y `git diff --check` sin incidencias.
- La propagación de dimensiones dejó de ser el bloqueo del editor: `DV Seccion`
  ya se puede elegir en las condiciones. La pestaña antes vacía ahora se llama
  `BORRADOR Metodo a Servicios 30 min`. Guarda un embudo cerrado de dos pasos,
  transición indirecta con límite de 30 minutos, filtros `DV Contenido=inicio`
  y `Nombre del evento=section_viewed`, y desglose por categoría de dispositivo.
  Los otros pares, el diagnóstico y la validación de exclusión siguen pendientes.
  La exploración conserva un periodo histórico de implementación: sus usuarios
  y porcentajes **no son evidencia comercial** ni un informe operativo terminado.
- QA local con CSP productiva, consentimiento guardado y viewport de 390 px:
  LCP observado 560 ms, suma de shifts 0.03, DCL 179 ms, bloqueo en ventana inicial
  de 10 s de 15 ms, cero violaciones CSP. Cargaron gtm.js, bootstrap de depuración
  y gtag/destination. Es navegador local sin limitación de CPU/red: no Lighthouse,
  INP, p75, dispositivo físico ni prueba de recepción de esos eventos en GA4.
- Tag Assistant logró mostrar conexión y etiqueta base activada una vez, pero
  la pestaña local controlada mostró `Not Connected`. No se atribuyó la conexión
  de otra ventana a esa pestaña ni se dio por verificado error/reintento.
- Arturo autorizó usar Chrome para completar la prueba. La primera apertura
  de GTM mostró una cuenta distinta sin el contenedor autorizado. Tras su aviso
  de estar listo, la revisión automática bloqueó la inspección por esa identidad
  previa. Se pidió confirmar el cambio en **Chrome** a la cuenta corporativa y
  la presencia del contenedor. No se cambió de cuenta por cuenta propia, no se
  inspeccionó la sesión ajena y no se eludió el bloqueo.
- No se ha publicado GTM ni fusionado PR33 en esta pasada. La autorización de
  merge queda vigente, condicionada al cierre verificable de las compuertas.

### Prueba en Chrome — 2026-10-06, 10:38–10:44 CDMX

- Arturo seleccionó en Chrome la cuenta corporativa. La interfaz confirmó
  `arturo.villagomez@donventas.mx`, contenedor `GTM-M6J49828` y la etiqueta base
  todavía en borrador. No se publicó el contenedor.
- La primera ventana no respondió al consentimiento y Tag Assistant agotó su
  conexión. Una pestaña normal sí aceptó el permiso; al volver a iniciar Vista
  previa desde GTM, la ventana controlada y Tag Assistant mostraron conexión.
  No se atribuyeron los eventos de la pestaña auxiliar al recorrido conectado.
- En esa misma ventana se completó la ruta de contenido con datos sintéticos,
  WhatsApp y sitio vacíos. El servidor local `--google-debug --fail-first --csp
  --health` devolvió primero 503: interfaz `DV-503`, sin finalización. Al pulsar
  Intentar de nuevo mostró Solicitud recibida. El backend comercial no participó.
- Tag Assistant, destino `G-YD4BFZTY4V`, pestaña **Hits enviados**: dos
  `diagnostic_submit_attempted`, un `diagnostic_submit_failed` y un
  `diagnostic_completed`. Una sola etiqueta base activada y un hit de vista de
  página en el documento conectado. Esto confirma envío, no procesamiento en
  informes ni exclusión del tráfico de prueba.
- Capa de datos inspeccionada para fallo y finalización: `route=contenido`,
  `content_id=inicio`, URL canónica sin consulta, título neutral, referente vacío,
  `debug_mode=true`, `traffic_type=developer`. Sin nombre, correo, WhatsApp,
  respuestas libres, monto ni mensaje crudo del servidor en esos eventos.
- Panel local con la CSP del release y GTM real: viewport 958 px, LCP observado
  464 ms, suma de shifts 0.014, bloqueo en ventana inicial de 10 s de 368 ms.
  Registró una violación `img-src: https://fonts.gstatic.com`; origen del intento
  no resuelto. No se amplió la CSP. No presentar esta sesión como libre de
  violaciones ni extrapolar estas medidas locales al rendimiento productivo.
- Analytics abierto en Chrome mostró Empezar a medir, no la propiedad. Se pidió
  al usuario seleccionar la cuenta corporativa y la propiedad existente; no se
  creó otra ni se cambió de cuenta automáticamente. **La recepción de esta
  secuencia en DebugView sigue pendiente**, aunque sus hits ya están comprobados.
- Nueva ejecución local: 124/124 pruebas pasan. Continúan pendientes las
  exploraciones, exclusión efectiva, demás ramas y comprobación de rendimiento
  del release. No se fusionó PR33 ni se modificó PR34 de identidad.

### Recepción y alertas de Google — 2026-10-06, 10:54–11:05 CDMX

- Acceso confirmado en Chrome a la propiedad Don Ventas — sitio público con la
  cuenta corporativa, mediante el enlace del selector de productos de GTM.
- **DebugView confirma recepción**: dos `diagnostic_submit_attempted`, un
  `diagnostic_submit_failed` (10:41:41) y un `diagnostic_completed` (10:42:47).
  Se inspeccionó `route=contenido` y `traffic_type=developer` del fallo.
  Horas y secuencia corresponden al recorrido conectado anterior. El agregado
  de 30 minutos incluye dos page_view de las pestañas de prueba; no se declara
  una sola vista global ni se atribuye todo el agregado a un documento.
- Se encontró una discrepancia con el registro anterior: el evento completado
  tenía `value=1` y `currency=USD`. La configuración efectiva de GA4 estaba en
  **Definir un valor predeterminado**, 1 USD. Se seleccionó **No asignar ningún
  valor predeterminado**, se guardó y se verificó de nuevo tras cargar la página
  y reabrir el ajuste. No se modificaron otros eventos clave. La afirmación previa
  de ausencia de importe no acreditaba el estado efectivo; queda rectificada por
  esta evidencia. No se borró ni corrigió retrospectivamente el evento de QA.
  Falta comprobar un nuevo hit de finalización después de propagarse el cambio.
- La etiqueta Google presenta un aviso: consentimiento del 0 % en territorios,
  cuyo texto se refiere a medición/personalización de anuncios. GTM presenta ese
  mismo aviso y uno adicional: falta un segundo administrador.
- Tag Assistant del borrador, evento 4 Actualización del consentimiento:
  `analytics_storage` pasa de Denegado a Concedido; `ad_storage`, `ad_user_data`
  y `ad_personalization` permanecen Denegado. Se conserva esta separación
  intencional: el sitio solicita analítica opcional, no permisos publicitarios.
  No se fuerza granted, activa Ads o comparte datos de usuarios para silenciar
  el diagnóstico. El aviso de Google **sigue visible**; la evidencia comprueba el
  estado de esta prueba, no explica todo el histórico de señales del diagnóstico.
- Administrador de respaldo: se solicitó autorización expresa para
  `hola@arturovillagomez.com`; no se otorgó el rol antes de recibir respuesta.
- No se publicaron GTM ni PR33. Permanecen las compuertas de informes, exclusión
  efectiva de QA, demás ramas y rendimiento/CSP del release. La advertencia de
  imagen `fonts.gstatic.com` de la sesión anterior no se ha resuelto ni autorizado.

Fuentes del diagnóstico: [Google, alertas de etiquetas](https://support.google.com/tagmanager/answer/14681508),
[Google, comprobación de consentimiento](https://support.google.com/tagmanager/answer/14522438).

1. Finalizar exploraciones de no avance y diagnóstico; contrastar configuraciones
   con las definiciones de ANALYTICS-FUNNEL.md. No inferir salida de la última
   exposición ni forzar un embudo único de nueve secciones.
2. Validar el efecto del filtro de QA ya activo y usar un periodo comercial
   posterior a las pruebas; no interpretar el histórico de implementación.
3. Completar error de servidor/reintento y las otras ramas del diagnóstico con
   Google real. La rama de marca con validación local y éxito simulado ya se
   comprobó; no equivale a recepción del lead en producción.
4. Validar CSP y rendimiento del release con la etiqueta real activada.
5. Evento clave configurado; contrastar sus recuentos con solicitudes aceptadas
   después del lanzamiento, sin equipararlas a ventas.
6. Obtener aprobación de publicación; coordinar GTM y merge, sin publicar uno
   como sustituto de las verificaciones pendientes.

### Verificación posterior al diagnóstico manual — 2026-10-06

- Arturo informó haber terminado el diagnóstico. En DebugView de la propiedad
  `557370059` se observó una finalización a las **13:45:31 CDMX**, después de un
  intento de envío a las 13:45:30. El agregado de los últimos 30 minutos mostraba
  una finalización, un intento y un error de validación; no se atribuye todo ese
  agregado a una sola pestaña ni se confunde validación con fallo del servidor.
- Parámetros inspeccionados del evento: `route=contenido`, `content_id=inicio`,
  `page_location=https://www.donventas.mx/`, `traffic_type=developer`. La lista
  completa de parámetros no contiene `value` ni `currency`: queda comprobada
  una nueva recepción sin el importe predeterminado de 1 USD detectado antes.
- La página atribuida es la landing. Aunque el contexto de la conversación
  mostraba `/diagnostico.html`, esta evidencia **no acredita la recepción desde
  esa página independiente** ni permite asegurar que sea exactamente la misma
  pestaña que terminó Arturo. No se pidió repetir ni recargar su formulario.
- El endpoint del servidor de QA continúa simulado: no es un lead comercial.
- Nueva ejecución local: **125/125 pruebas pasan**, incluida la prueba nueva de
  diagnóstico CSP que elimina consulta y fragmento de la fuente del bloqueo y
  deduplica las incidencias. No se amplió la CSP productiva ni se da por resuelta
  la incidencia anterior de `fonts.gstatic.com` por el mero hecho de tener este
  instrumento.
- GTM y PR33 no se publicaron en esta verificación. Siguen pendientes las
  compuertas de exploraciones, exclusión efectiva de QA, cobertura restante y
  rendimiento/CSP del release.

Fuentes: [dimensiones de evento](https://support.google.com/analytics/answer/14239696),
[filtro de desarrolladores](https://support.google.com/analytics/answer/13296662),
[preview de GTM](https://support.google.com/tagmanager/answer/6107056).
Google indica 24–48 h para disponibilidad de datos de dimensiones en informes;
un filtro puede tardar 24–36 h en aplicarse. DebugView no sustituye esa validación.

### Cierre técnico en navegador integrado autorizado — 2026-10-06

- Se preservó sin recargar la pestaña previa de Arturo. El recorrido independiente
  se ejecutó en una pestaña nueva, usando únicamente contacto sintético y API local
  simulada. Recibido en DebugView a las 15:04:42 CDMX: `diagnostic_completed`,
  `content_id=diagnostico`, `route=contenido`, URL canónica sin query y
  `traffic_type=developer`. Lista inspeccionada sin nombre, correo, respuesta libre,
  `value` ni `currency`. No equivale a una venta ni a entrega comercial en producción.
- Nueva ejecución: **127/127 pruebas pasan**. PR33 en `edc8e64` tenía site-tests y
  Vercel correctos, mergeable, todavía borrador. PR34 no forma parte de este cierre.
- Muestreo de carga local, consentimiento concedido y Google real activo:

  | Viewport | LCP observado | Suma CLS observada | DOMContentLoaded | Bloqueo primeros 10 s |
  |---|---:|---:|---:|---:|
  | 1280 px | 184 ms | 0 | 147 ms | 0 ms |
  | 390 × 844 px | 112 ms | 0.0002 | 89 ms | 0 ms |

  Ambas muestras registraron recursos GTM/Google y solicitudes `g/collect`, con
  lista de violaciones CSP vacía. Caché local, sin throttling: no comparar estos
  tiempos con p75 de usuarios reales, INP, Lighthouse o móviles físicos. Se descarta
  una muestra anterior tomada durante un cambio de viewport y con panel de Tag
  Assistant: no representa un recorrido estable. No se relajó CSP para depuración.
- Se detuvo la sesión de Tag Assistant antes de las muestras finales. Se revisó
  la etiqueta Google: `send_page_view=false`, señales de Google y personalización
  de anuncios desactivadas, permiso adicional `analytics_storage` requerido.
- [Recorrido landing](https://analytics.google.com/analytics/web/?authuser=1#/analysis/a410707546p557370059/edit/FvgmjU3lSEGrL1jcQxrbZQ):
  alcance, base de usuarios con page_view e inicio, ocho pares adyacentes. Se
  revisaron tras reabrir los valores servicios/casos/ideas/quien/preguntas/contacto.
  La base no es todas las visitas del servidor ni el número de sesiones.
- [Diagnóstico y acciones](https://analytics.google.com/analytics/web/?authuser=1#/analysis/a410707546p557370059/edit/G1neRna4QlyVsXD8nW393w):
  para contenido y branding, exposición→inicio, inicio→solicitud aceptada,
  contacto→intento y tentativa→aceptación. Contacto restringe solo el primer paso a
  `diagnostic_step_viewed` con `step=contact`; no filtra el segundo evento por step.
  Tabla adicional por sección de origen y nombre de evento, usuarios activos,
  limitada a diagnostic_entry/service_selected/content_selected. No suma usuarios
  entre acciones ni interpreta el clic como una carga de destino confirmada.
- Filtros de ruta se seleccionaron explícitamente desde las opciones, no solo
  escribiéndolos. Se comprobó la persistencia del contacto de marca y su filtro
  branding al reabrir. Fecha de diagnóstico queda en Hoy (6 octubre), sin datos;
  landing conserva los últimos 28 días hasta el 5 de octubre. Unificar periodos
  antes de comparar. El histórico previo es QA, no una tasa comercial.
- **Pendiente externo:** acreditar efecto del filtro de QA con datos procesados
  y una ventana ya madura. La ausencia actual no basta y no se desactivó el filtro
  ni se generó tráfico no marcado para fabricar una comparación. No se publicaron
  GTM ni PR33. Después de esta compuerta: checks del HEAD, publicación coordinada,
  smoke en producción y fecha de inicio de la línea base comercial.
