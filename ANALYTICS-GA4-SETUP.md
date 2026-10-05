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
estado **Prueba**. En este estado identifica, pero NO excluye definitivamente.
El filtro Internal Traffic existente se conserva. Antes del lanzamiento se debe
validar y activar la exclusión de QA o configurar filtros explícitos en informes.
La actividad de esta fecha es de implementación: no interpretarla como clientes.

## Prueba local con Google real

`node scripts/analytics-qa-server.cjs --google-debug` sirve exclusivamente en
loopback, puerto 8786. Usar `http://localhost:8786/` y conectar desde Vista previa
del borrador GTM, sin publicarlo. El servidor modifica en memoria únicamente el
control del host y añade `debug_mode=true`, `traffic_type=developer` y aviso QA.
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

Validación del repositorio: 122 pruebas automatizadas pasan; tres nuevas verifican
que el servidor QA sea local, opt-in, marque depuración y falle cerrado ante un
cambio del contrato. No alteran el script de producción. `git diff --check` pasa.

Límites: esta comprobación de DOM no es una captura de red completa, ni acredita
el borrado físico de cookies. No se inspeccionaron cookies ni almacenamiento del
navegador mediante herramientas. La prueba no certifica CSP/rendimiento en
Vercel, recepción comercial de un lead, ni todas las ramas del formulario con
Google real. Esas compuertas siguen abiertas.

## Análisis preparado

Exploración privada `DV Recorrido landing - BORRADOR sin datos productivos`:
[abrir en GA4](https://analytics.google.com/analytics/web/?authuser=1#/analysis/a410707546p557370059/edit/FvgmjU3lSEGrL1jcQxrbZQ).
Filas DV Seccion; columnas Categoría de dispositivo; valor Total de usuarios;
filtros DV Contenido=inicio y Nombre del evento=section_viewed. Es una estructura
inicial de recuentos de alcance, todavía sin denominador ni tasas. No hay tasas productivas, baseline ni
comparación móvil/escritorio interpretable todavía. No confundir ceros de la
plantilla con falta de demanda. Terminar y validar los embudos adyacentes, origen
de CTA, denominadores y exclusiones antes de compartir como informe operativo.

## Pendiente antes de publicar

1. Finalizar exploraciones de no avance y diagnóstico; contrastar configuraciones
   con las definiciones de ANALYTICS-FUNNEL.md. No inferir salida de la última
   exposición ni forzar un embudo único de nueve secciones.
2. Validar filtros de QA y proteger informes de actividad de implementación.
3. Completar error de servidor/reintento y las otras ramas del diagnóstico con
   Google real. La rama de marca con validación local y éxito simulado ya se
   comprobó; no equivale a recepción del lead en producción.
4. Validar CSP y rendimiento del release con la etiqueta real activada.
5. Marcar diagnostic_completed como evento clave solo tras validar recepción.
6. Obtener aprobación de publicación; coordinar GTM y merge, sin publicar uno
   como sustituto de las verificaciones pendientes.

Fuentes: [dimensiones de evento](https://support.google.com/analytics/answer/14239696),
[filtro de desarrolladores](https://support.google.com/analytics/answer/13296662),
[preview de GTM](https://support.google.com/tagmanager/answer/6107056).
Google indica 24–48 h para disponibilidad de datos de dimensiones en informes;
un filtro puede tardar 24–36 h en aplicarse. DebugView no sustituye esa validación.
