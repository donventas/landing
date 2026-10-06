# GA4 — configuración y evidencia de QA

Fecha: 2026-10-05. Propiedad Don Ventas — sitio público, `557370059`.
Cuenta operadora verificada en la interfaz: `arturo.villagomez@donventas.mx`.
Este registro no autoriza el merge ni la publicación de GTM.

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

Fuentes: [dimensiones de evento](https://support.google.com/analytics/answer/14239696),
[filtro de desarrolladores](https://support.google.com/analytics/answer/13296662),
[preview de GTM](https://support.google.com/tagmanager/answer/6107056).
Google indica 24–48 h para disponibilidad de datos de dimensiones en informes;
un filtro puede tardar 24–36 h en aplicarse. DebugView no sustituye esa validación.
