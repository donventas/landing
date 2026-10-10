# Comentarios privados: previo para revisión

Estado al 9 de octubre de 2026: implementación local verificable, no habilitada para recibir mensajes reales. No se publicó, fusionó ni envió correo. Rama `codex/private-article-comments`, creada desde `9fb5cc714776b988002740d33153858f708b88c0`. Los cambios paralelos de portadas permanecen fuera de este trabajo.

## Experiencia y copy

Los siete artículos tienen un componente compartido: **Comenta conmigo este artículo**. Explica que el mensaje llegará de forma privada al equipo y no se publicará. Solicita mensaje y correo; el nombre es opcional. El servidor resuelve el título y URL canónica desde un catálogo, no desde texto proporcionado por el visitante.

La opción de marketing es independiente, voluntaria y desmarcada:

> Ideas para hacer más visible tu negocio. Recíbelas por correo.

Marcarla crea una intención pendiente de confirmación, no una suscripción activa. Enviar un comentario no requiere marcarla ni aceptar analítica. No hay cambios en los kits, textos editoriales ni CRM.

El formulario conserva los campos y la clave de reintento si falla el envío. Tras una recepción confirmada los limpia y enfoca el estado de éxito. No guarda datos personales en almacenamiento del navegador; avisa al salir con un borrador sin enviar. El previo identifica expresamente la simulación y pide datos ficticios.

## Qué funciona y qué es preparación

| Capa | Estado comprobado |
| --- | --- |
| Interfaz compartida | Montada y revisada en siete artículos |
| Recepción local | Validación, persistencia JSON, cuotas y deduplicación operativas en un proceso |
| Entrega local | Cola, reintentos y proveedor simulado; nunca manda correo |
| API alojada | Cerrada por defecto, sin interruptor de activación real |
| PostgreSQL/Supabase | Migración y adaptador de recepción preparados; no ejecutados contra una base |
| Correo y eventos reales | Sobre de correo y verificador de firmas preparados; sin proveedor ni webhook público conectados |
| Suscripción | Intención separada; falta confirmación y baja operativas antes de activar campañas |
| CRM | Sin conexión ni oportunidad automática |

La persistencia JSON es exclusiva del desarrollo local: no sustituye una base transaccional ni sirve como almacenamiento distribuido de Vercel. La migración propone tablas privadas, RLS, RPC de recepción atómica y purga; faltan la integración y pruebas del trabajador de entrega y sus eventos sobre esa base.

## Configuración y seguridad

El destinatario identificado en configuración/documentación autorizada es `arturo.villagomez@donventas.mx`. No se verificó la configuración efectiva del proveedor en producción. La futura configuración central podrá usar `BLOG_COMMENTS_TO`; no se fijará el destinatario en cada artículo. El previo pasa un destino ficticio al simulador.

El sobre exige un remitente del dominio `donventas.mx` y usa el correo del lector exclusivamente como `Reply-To`. La validación sintáctica no demuestra que el dominio o remitente estén verificados: esa comprobación sigue pendiente en el proveedor.

La recepción limita el cuerpo a 24 KB, mensaje a 5,000 caracteres, correo a 254 y nombre a 100. Rechaza campos desconocidos, adjuntos, caracteres de control y entradas de cabecera. Comprueba origen exacto y añade honeypot. Las cuotas locales son 5 solicitudes por IP/15 minutos, 10 por correo/día y 200 globales/día; las claves son HMAC y no almacenan IP cruda. Debe validarse la fuente confiable de IP en el entorno alojado antes de conectar la API.

La clave de idempotencia UUID y el hash de contenido previenen duplicados por reintento. Mensaje, trabajo de entrega e intención opcional se crean juntos. La cola distingue recepción, aceptación del proveedor, entrega y estado desconocido: un 202 no significa correo entregado. Las pruebas de firma y eventos son unitarias, no evidencia de webhooks reales.

Para una integración posterior con CRM, utilizar el ID estable del mensaje y una restricción única por fuente/ID. Clasificar como entrada pendiente, no como oportunidad ni suscriptor. No crear otra fuente paralela del mismo mensaje.

## Privacidad y analítica

`15_LEGAL/Comentarios Privados.html` es un suplemento de desarrollo, no una actualización publicada del aviso integral. Antes de activar el canal deben armonizarse finalidades, acceso, encargados y conservación en el aviso vigente.

La purga implementada elimina mensajes sin gestionar a los 180 días de recepción, intenciones sin confirmar a los 30 días y claves de cuota al vencer su ventana. La política propuesta para conversaciones gestionadas es 180 días tras su cierre; requiere un flujo protegido de cierre. También falta verificar conservación y borrado en buzón, proveedor y respaldos: purgar la base no elimina esas copias.

Solo operadores autorizados deben acceder al contenido. La clave de servicio nunca debe llegar al navegador. El previo contiene únicamente datos ficticios en `.private-comments/`, carpeta ignorada por Git y excluida del despliegue, junto con un secreto local de simulación. No son credenciales de correo.

Los eventos `article_message_opened`, `article_message_sent` y `article_message_failed` pasan por el mecanismo de consentimiento existente. Sus parámetros se limitan a identificadores públicos y categorías de error cerradas. No incluyen mensaje, nombre, correo, ID de recepción ni URL arbitraria. No se cuentan como `generate_lead`.

## Evidencia de aceptación

- Suite completa: **219 pruebas aprobadas, 0 fallidas**, incluidas 20 nuevas para este canal.
- Contratos: API cerrada, validación, tamaño real del cuerpo, origen, honeypot, cuotas, 12 reintentos concurrentes, conflicto de clave, persistencia tras reinicio, retención, escape de correo, `Reply-To`, firma, deduplicación de eventos y exclusión de datos personales de analítica.
- Navegador: revisión de los siete artículos a 390 px y del bloque a 320, 390, 768 y 1440 px, sin desbordamiento horizontal. Campos de 16 px y botón de al menos 48 px.
- Teclado: apertura, envío, foco en primer campo inválido y confirmación. Casilla desmarcada inicialmente.
- Éxito con datos ficticios y analítica rechazada: recepción local y entrega simulada; intención de suscripción pendiente.
- Fallo controlado 503: contenido conservado; reintento exitoso sin perder lo escrito.
- Enlaces de privacidad comprobados. El servidor de previo desempaqueta el aviso existente solo en la respuesta local para hacerlo legible bajo su CSP; no modifica el archivo original.
- Captura de revisión: `.qa-comments/private-comments-desktop.jpg` (local, excluida del despliegue).

Los límites de 1,400 palabras se mantienen. Las pruebas editoriales solo excluyen el bloque independiente del formulario al contar el texto del artículo. No se realizó una certificación con lector de pantalla, una auditoría legal ni medición de Core Web Vitals de producción.

## Revisión local

Ejecutar desde esta carpeta:

```powershell
node scripts/private-comments-preview.cjs
```

Abrir `http://127.0.0.1:8795/blog/contenido-que-atrae-clientes.html?revision=private-comments-v1#comenta-conmigo`. El servidor escucha únicamente en loopback; los otros endpoints API están bloqueados y la CSP evita conexiones externas. Para el fallo controlado, usar `--fail-first` en el puerto 8796. No introducir información real.

## Condiciones antes de una activación real

1. Aprobar el previo, actualizar la rama contra el `main` vigente y revisar conflictos con cambios paralelos. La consulta remota durante esta ronda falló por resolución de red; el punto de partida es el `origin/main` local indicado arriba.
2. Confirmar destinatario efectivo y remitente verificado con configuración central por entorno. No cambiar DNS ni enviar pruebas reales sin autorización adicional.
3. Ejecutar la migración en una base de pruebas autorizada. Validar sintaxis, permisos/RLS, concurrencia, cuotas, purga y recuperación con credenciales separadas.
4. Implementar y conectar el trabajador persistente, proveedor, webhook firmado, estados de entrega y alertas sin datos personales. Validar leases, reintentos y reconciliación de envíos inciertos en ese entorno.
5. Revisar origen/IP confiables, gestión de secretos, límites y protección antispam del despliegue. No confiar en cabeceras controlables por el cliente.
6. Integrar el aviso de privacidad y confirmar accesos, borrado, buzón y respaldos. La revisión debe cubrir tanto comentarios como marketing opcional.
7. Implementar confirmación de suscripción, baja y registro de consentimiento antes de activar campañas. Una intención pendiente no autoriza envíos de marketing.
8. Hacer QA final de accesibilidad y rendimiento con la integración real en pruebas. Solicitar autorización específica para merge/publicación y cualquier envío a un destinatario real.

La API alojada permanece deliberadamente cerrada. Activarla requiere código revisado e integración probada, no solamente añadir una variable de entorno.

## Revisión de jerarquía del cierre · 9 de octubre de 2026

Regla aprobada por Arturo y aplicada en desarrollo: una acción comercial principal por artículo; conversación privada independiente; suscripción opcional dentro del comentario. No hay un segundo formulario de diagnóstico al terminar la lectura. Se conserva el formulario en su destino propio.

Los siete artículos agrupan ahora el CTA contextual y el comentario en `.article-ending`, seguido de las lecturas relacionadas. El orden está en HTML: el script ya no mueve el comentario después de cargar. El CTA mantiene un botón destacado; el comentario usa una invitación breve y un `details` nativo. Las lecturas relacionadas y el diagnóstico de la navegación tienen menor énfasis. Se retiraron las rutas comerciales adicionales del CTA; servicios y sistema de marca siguen disponibles en navegación. La carta fundacional conserva la firma y el relato antes de este cierre.

### Producto o diagnóstico: una decisión por artículo

Actualmente los siete cierres usan `data-next-step="diagnosis"`: el piloto de *Tu oferta en una página* aún no tiene landing ni entrega comercial disponibles. No se añadieron ofertas ficticias, enlaces vacíos, compras, precios ni captación nueva.

Cuando un producto pertinente tenga landing y entrega verificadas, reemplazar el contenido de **ese mismo** `.article-cta` por la invitación al producto, usando `data-next-step="product"`. Mantener un único botón hacia la landing, no añadir otra tarjeta. En ese caso, el diagnóstico pasa a un enlace de texto después del comentario: «¿Prefieres que revisemos qué necesita tu negocio? Solicita un diagnóstico». La landing permite elegir el recurso gratuito o el producto completo sin obligar a descargar primero. Esta variante no está activada ni simulada en los artículos actuales; su disponibilidad y medición requieren una revisión posterior.

### Comprobación de esta revisión

- 227 pruebas pasan: suite anterior más ocho contratos de jerarquía, conversación independiente y orden estático. Se actualizó el contrato antiguo que exigía varias rutas comerciales en el cierre. La suite se ejecutó con Node 24 fuera del aislamiento porque las pruebas locales de archivos temporales y HTTP recibían restricciones de permisos; no se cambiaron las pruebas para ocultarlas.
- Texto de las secciones editoriales y metadatos conservados; no se cambiaron imágenes, fuentes, canonical, fechas, sitemap ni narraciones. No hay nuevas afirmaciones editoriales o términos que añadir al glosario.
- Revisión de los siete cierres a 320, 390, 768 y 1440 px: sin desbordamiento horizontal; un enlace comercial principal por cierre; control de comentarios de 48 px. Se corrigieron los márgenes móviles observados. No es certificación independiente de accesibilidad.
- Apertura/cierre con teclado, foco visible, conservación de borrador y casilla desmarcada comprobados. Envío con datos ficticios completado en modo local; sin correo ni suscripción real. La validación de producto no corresponde todavía.
- CSS compartido de 7,327 bytes y JS de comentarios de 8,615 bytes en esta revisión; ningún recurso ni petición adicional respecto del previo de comentarios. No se ejecutó Lighthouse comparable ni se midieron Core Web Vitals de producción.
- Captura local: `.qa-comments/article-ending-v2.jpg`. Previo: `http://127.0.0.1:8795/blog/contenido-que-atrae-clientes.html?revision=article-ending-v2#siguiente-paso`.

Estado: pendiente de revisión visual de Arturo. Sin commit, merge, publicación, activación de correo o modificación de Runtime/Portal. Conserva las condiciones de activación del canal documentadas arriba.

## Integración real solicitada · Resend · 9 de octubre de 2026

Arturo aprobó el cierre de los artículos y pidió completar primero el formulario real. Confirmó Resend y abrió la cuenta `donventas` para revisión. Inspección de solo lectura:

- Resend muestra `donventas.mx` como **Verified**. Hay dos pruebas del diagnóstico marcadas **Delivered**, enviadas hace 12 días al buzón de Arturo. Esto no demuestra que el formulario de comentarios esté conectado ni que el diagnóstico funcione actualmente de punta a punta.
- Vercel `don-ventas/landing` muestra `SUPABASE_LEAD_KEY` en Production y en una rama Preview; no aparece una variable de Resend. No se revelaron valores.
- Supabase `hlabhmegjnrjygsywnqa` contiene la función `lead-notifications` y los nombres de secretos `RESEND_API_KEY`, `LEAD_WEBHOOK_SECRET`, `LEAD_ALERT_EMAIL`, `LEAD_EMAIL_FROM`. No se extrajeron, copiaron ni modificaron secretos. La existencia de la función no confirma su implementación funcional; el editor mostró una plantilla genérica, no un contrato reutilizable de correo validado.

Se añadió un transporte REST de Resend inyectable, con destino fijo, timeout, rechazo de redirecciones, clave de idempotencia estable y errores sin contenido privado. Se corrigió el adaptador de Supabase para no enviar una secret key moderna como JWT y se separó el fallo de persistencia posterior a la aceptación del proveedor del fallo de envío. Cinco pruebas nuevas cubren estas condiciones; las 25 pruebas específicas pasan con red simulada, sin credenciales reales ni correos enviados.

La API pública continúa cerrada por diseño. El transporte no está conectado al endpoint ni basta para activarlo. Pendientes: trabajador persistente/RPC de cola, receptor de eventos, confirmación y baja de suscripción, configuración del entorno, migración validada en pruebas, aviso final y QA de entrega. Se recomienda mantener el secreto de Resend en Supabase y usar un trabajador independiente de `lead-notifications`, sujeto a revisión y autorización de despliegue/acceso. No se cambió DNS, no se ejecutó SQL remoto y no se tocó el diagnóstico.

### Confirmación del destinatario y preparación del trabajador

Arturo confirmó el destino `arturo.villagomez@donventas.mx` y autorizó un correo con el asunto exacto `PRUEBA · Comentarios del blog`. Esa confirmación no se trata como autorización para abrir tablas al público ni para modificar el diagnóstico.

Se preparó `004_article_delivery_queue.sql`: reservas de trabajo exclusivas, máximo cinco intentos, margen de 23 horas frente a la idempotencia de 24 horas del proveedor, conciliación de eventos tempranos y protección contra degradar una entrega confirmada a retrasada. Las operaciones permanecen restringidas a `service_role`.

Se validaron 003 y 004 en PostgreSQL/WASM local con PGlite, instalado exclusivamente en `.qa-comments/sql-runtime` (excluido del repositorio y despliegue). Se probaron migraciones, permisos, deduplicación, reservas, eventos previos a la respuesta del proveedor y conservación del estado entregado. PGlite no sustituye una prueba de concurrencia distribuida en Supabase.

El candidato `supabase/functions/article-comment-worker/index.ts` utiliza el secreto existente de Resend sin exportarlo, fija destinatario y remitente, exige autenticación privada y selecciona únicamente registros `is_test` por defecto. Cuatro contratos adicionales prueban autorización, contenido de la prueba, reintentos y fallo de persistencia posterior a aceptación. No hay contactos de marketing ni campañas creadas.

Hay un borrador del trabajador en el editor de Supabase, **sin pulsar Deploy function**. El único entorno inspeccionado es main/PRODUCCIÓN: antes de crear allí las tablas privadas y desplegar el trabajador se solicita autorización específica para ese cambio de infraestructura. Captura local: `.qa-comments/worker-deploy-pending.jpg`. No se envió aún el correo autorizado; no se aplicaron migraciones remotas. El formulario sigue inactivo hasta completar conexión, suscripciones, privacidad y verificación real de entrega.

### Despliegue privado autorizado y prueba real · 9 de octubre de 2026

Arturo respondió **«Autorizo»** a la creación de las tablas privadas y al despliegue del trabajador en el proyecto actual. Este apartado actualiza el estado anterior, sin convertirlo en autorización para activar marketing o el formulario público.

- Se confirmó que `dv_comments` y la función receptora no existían. Se aplicaron 003 y 004 juntas en una transacción: Supabase confirmó éxito.
- Se desplegó `article-comment-worker`, independiente de `lead-notifications`. Se conservó **Verify JWT with legacy secret = ON**. El trabajador también exige una credencial privada del servidor; admite el secreto `default` moderno o la credencial de servicio heredada. La selección sigue limitada a `is_test` mientras no se configure explícitamente el modo live.
- Las primeras dos invocaciones con la credencial heredada fueron rechazadas con 401 antes de procesar la cola. La prueba efectiva funcionó usando **Add secret key** del probador de Supabase y la compatibilidad con `SUPABASE_SECRET_KEYS`. No se desactivaron controles para resolverlo. No se da por demostrada la causa exacta de la discrepancia de la credencial heredada.
- Se registró una sola prueba explícitamente ficticia mediante la RPC de recepción y se marcó `is_test=true`. No se envió un diagnóstico ni se generó tráfico comercial.
- Trabajador: respuesta **200**, `processed: 1`, `state: accepted`. Supabase: **1 registro**, **1 intento**, **0 intenciones de suscripción**. RLS habilitado y SELECT denegado a `anon` y `authenticated` en las cinco tablas.
- Resend confirmó **Delivered**, asunto `PRUEBA · Comentarios del blog`, de `Don Ventas <comentarios@donventas.mx>` a `arturo.villagomez@donventas.mx`. Identificador del proveedor: `01a12190-e60a-7d8f-92ca-7e2de55f653c`; coincide con la cola. La confirmación significa aceptación por el servidor destinatario, no lectura ni clasificación en bandeja principal.
- Evidencia local: `.qa-comments/resend-comment-delivered.jpg`. Registro del proveedor: https://resend.com/emails/01a12190-e60a-7d8f-92ca-7e2de55f653c . Se limpiaron los campos de credenciales del probador; no se guardaron claves en archivos ni se imprimieron en la conversación.

Límites pendientes: el endpoint público continúa deshabilitado. No se ha configurado un trabajador periódico, receptor de webhooks, confirmación/baja de suscripción ni conexión final de Vercel. Por ello el estado en la base permanece **accepted** y la entrega está comprobada directamente en Resend, no por un webhook propio. Tampoco hay merge/publicación del formulario o prueba completa navegador → recepción → correo. No se modificó el diagnóstico, DNS ni campañas. El único dato nuevo es el registro técnico identificado como prueba; se conserva como evidencia con la retención definida.
