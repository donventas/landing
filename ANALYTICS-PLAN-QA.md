# Analítica opcional — preparación, no activación productiva

Fecha: 2026-10-05. Base: `ee52a9c`. Rama: `codex/consent-first-analytics`.

## Alcance y decisiones

- GA4 `G-YD4BFZTY4V`, GTM `GTM-M6J49828`. Son identificadores públicos, no secretos.
- Antes de aceptar no se carga Google. Rechazar permite leer, consultar el glosario y enviar el diagnóstico. No se reconstruye actividad anterior al permiso.
- Preferencia local durante 180 días. Retirada desde el pie: bloquea eventos, elimina únicamente cookies GA conocidas y recarga si había Google activo. Conserva respuestas y pendientes del diagnóstico.
- Solo `https://www.donventas.mx` puede iniciar Google. Todos los previews son simulaciones locales de eventos; no prueban la recepción en GA4.
- Sin grabación de sesiones, señales de Google, personalización publicitaria ni medición mejorada. Vercel agregado existente permanece independiente.
- La configuración preparada solicita cookies GA de 60 días sin renovar y retención de usuarios/eventos de 2 meses. Los agregados tienen reglas de conservación distintas.

## Contrato de eventos

| Evento | Qué significa | Campos específicos permitidos |
|---|---|---|
| page_view | Vista después de aceptar | ninguno |
| content_selected | Clic hacia otra lectura o índice | destination |
| service_selected | Clic hacia marca o servicios | destination |
| diagnostic_entry | Clic hacia diagnóstico | destination |
| glossary_lookup / glossary_open | Consulta / apertura de término | term |
| reading_return | Retorno contextual al artículo | destination |
| diagnostic_started | Primera interacción, no mera aparición | route |
| diagnostic_step_completed | Paso validado y avanzado | route, step |
| diagnostic_completed | API aceptó el envío; no equivale a venta | route |
| diagnostic_submit_failed | API rechazó o falló el envío | route |
| whatsapp_click | Clic al canal; no acredita conversación ni venta | ninguno |

Todo valor es enumerado. Se añade `content_id` y URL canónica sin consulta ni fragmento. No se envían respuestas, montos, nombre, contacto, URL aportada, ID de lead, textos de enlace ni errores crudos. Inicio, pasos y finalización se deduplican por documento/ruta/paso; no son una contabilidad de ventas. Un mismo visitante puede contarse distinto entre dispositivos. La muestra excluye a quien rechaza y puede tener sesgo.

## Atribución: límite explícito y siguiente paso propuesto

Esta versión elimina referentes y parámetros de campaña. Sirve para recorridos internos, **no permite dar por validada la atribución de campañas**. No presentar tráfico directo como prueba de ausencia de campañas.

Recomendación: registro cerrado de enlaces con `utm_source`, `utm_medium`, `utm_campaign` y `utm_content`; validar valores contra ese registro, mapearlos a los campos de campaña GA y seguir eliminando la URL cruda. No admitir valores libres que puedan contener datos personales. No etiquetar enlaces internos con UTM. Capturar exclusivamente con consentimiento, explicar pérdida de atribución cuando se rechaza y probar navegación entre páginas. Para Ads se revisará por separado el etiquetado automático, sin mezclar indiscriminadamente GCLID y UTM. Ventas posteriores por WhatsApp requieren otro proceso comercial, no se deducen del clic.

## Comprobación y compuertas

- Pruebas automatizadas de contratos, consentimiento, retirada, almacenamiento denegado, deduplicación y previews sin Google.
- Navegador local: aceptar, rechazar, reabrir preferencias y artículo → término → retorno contextual funcionan. Vistas de 320/390/768 px revisadas mediante iframe local; escritorio en navegador. No son pruebas en dispositivos físicos.
- Diagnóstico recorrido completo en navegador con sitio web y WhatsApp vacíos: éxito del endpoint local simulado y evento `diagnostic_completed` visible. 106 pruebas automatizadas pasan; no equivalen a recepción de GA4 ni de un lead real.
- API de la prueba local está simulada: nunca atribuir su respuesta a Supabase ni a recepción comercial real.
- Peso inicial añadido medido: JS 10,820 bytes / gzip 3,856; CSS 1,596 / gzip 680. No equivale a Lighthouse ni a Core Web Vitals de campo. Google solo se descarga después de aceptar; medir también esa fase antes del release.

Pendientes antes de activar:

1. Revisar preview con Arturo; no fusionar ni publicar GTM sin autorización de este release.
2. Tag Assistant con borrador GTM: comprobar consentimiento antes de inicialización, procesamiento de los comandos/eventos por la etiqueta y exactamente un page_view. No afirmar que basta con tener el código.
3. Comprobar solicitudes de red/payloads, cookies y retirada con la etiqueta real. Confirmar en GA4 DebugView; borrar/filtrar la actividad de prueba según configuración revisada.
4. Registrar dimensiones de evento `content_id`, `destination`, `term`, `route`, `step` y evento clave `diagnostic_completed` después de validar recepción. No marcar WhatsApp como venta.
5. Verificar CSP del despliegue y rendimiento con Google activo; sin ampliar a dominios publicitarios ni habilitar unsafe-eval.
6. Tras aprobación, coordinar publicación de GTM y merge del sitio; prueba supervisada del envío real y revisión de informes. Un panel sin datos todavía no acredita que esté roto ni que funcione.

## Fuentes técnicas

- [Configuración GA4](https://developers.google.com/analytics/devguides/collection/ga4/reference/config)
- [Consentimiento](https://developers.google.com/tag-platform/security/guides/consent)
- [Data layer](https://developers.google.com/tag-platform/tag-manager/datalayer)
- [CSP](https://developers.google.com/tag-platform/security/guides/csp)
- [Campañas y fuentes](https://support.google.com/analytics/answer/11242870)

La implementación técnica no constituye una certificación legal. No altera contratos, datos ni permisos del Portal.
