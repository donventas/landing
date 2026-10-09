# Comentarios privados — estado de integración

Actualización: 2026-10-09. Rama `codex/private-article-comments`, PR #49 (borrador).
No hay merge a main ni activación pública. No confundir código preparado con operación verificada.

## Webhook y recepción real — 9 de octubre, 19:10 UTC

- Arturo autorizó específicamente retirar JWT solo de `article-delivery-events`.
  Guardado OFF; intake y worker sin cambios de JWT, ambos rechazaron POST sin auth (401).
- Prueba remota del receptor: sin firma 401; evento `qa.signature_probe` con firma
  válida 204, ignorado sin escribir un estado de entrega ficticio.
- La revisión automática bloqueó Enable antes de la prueba firmada. Después de esa
  prueba Arturo autorizó expresamente activar webhook y verificar. Resend quedó Enabled.
- Detectado y corregido `Buffer is not defined` en las dos funciones Edge que lo usan:
  import explícito desde node:buffer. Ambas desplegadas. Regresiones sin global Buffer
  añadidas; **255 pruebas completas pasaron** fuera del sandbox y diff sin errores.
- Primer envío real desde el formulario de preview falló antes del almacenamiento.
  Conservó campos; al reintentar sin modificarlos mostró “Recibimos tu mensaje”.
- Una ejecución manual autenticada del worker procesó 1 mensaje QA: 200/accepted.
  Resend emitió `email.delivered`, evento `msg_3KTDjqDvADHCWwY625a0udZEHOB`, Success.
  SQL confirmó mensaje `aa37ebf1-21f6-4b46-8710-b09f660554d3`, is_test=true,
  outbox delivered, attempts=1. No se usó como lead comercial ni se envió campaña.
- El evento inicial de horas antes sigue accepted; no se inventó una entrega retrospectiva.
- Añadidas cabeceras no-store/noindex/no-referrer y CSP de mismo origen para suscripción;
  requieren nuevo preview y QA HTTP. No confundir este cambio con prueba de alta/baja.
- Continúan pendientes: cron/Vault (006 NO aplicada), confirmación y baja end-to-end,
  aviso de privacidad definitivo, QA final y release público. El worker fue invocado
  manualmente: **no afirmar que los envíos automáticos estén operando todavía**.

## Recuperación de acceso — 9 de octubre, 18:45 UTC

- La pestaña recuperada por Arturo permite navegar internamente por Supabase. La
  pestaña antigua sigue en error; no confundirla con un fallo global del proyecto.
- Suite completa: **253 pruebas pasaron fuera del sandbox**. Verificador SQL aislado
  también pasó. Commit 4641168 subido al PR #49; `site-tests` y Vercel Preview pasaron.
- Worker `article-comment-worker` actualizado desde el archivo versionado; despliegue
  confirmado por la interfaz. Continúa en modo test por defecto.
- `article-delivery-events` desplegada. Su gateway JWT permanece ON, pendiente de
  autorización específica para permitir transporte externo autenticado por firma Svix.
  No se modificó el JWT de intake ni worker.
- ARTICLE_RESEND_WEBHOOK_SECRET guardado en Supabase, confirmado por nombre/digest.
  El webhook en Resend sigue deshabilitado. No hubo nuevos envíos ni pruebas end-to-end.
- Preview de rama disponible; aún no validado funcionalmente con el formulario real.
  Continúan pendientes cron/Vault, origen y modo de confirmación, aviso de privacidad,
  QA de confirmación/baja y publicación. Los apartados anteriores de validación y
  limitación abajo son evidencia histórica, no el estado más reciente de estos puntos.

## Confirmado en esta ejecución

- 005 aplicada en Supabase tras autorización específica: dos tablas privadas, confirmación,
  baja y conciliación de eventos; funciones anteriores internas, leads intactos.
- `article-comments-intake` desplegada; verificación JWT del gateway permanece ON.
  Requiere además un secreto dedicado. Solo permite recepción y confirmación/baja;
  no permite lecturas ni seleccionar funciones arbitrarias de la base de datos.
- No se creó una nueva clave secreta general de Supabase. Su creación fue bloqueada
  por alcance excesivo; se eligió la fachada limitada en su lugar.
- Secretos de Supabase guardados: ARTICLE_COMMENTS_WORKER_KEY,
  ARTICLE_NEWSLETTER_TOKEN_SECRET, ARTICLE_COMMENTS_INTAKE_KEY,
  ARTICLE_COMMENTS_INTAKE_MODE=test. No valores en archivos ni chat.
- Cinco variables en Vercel, todas restringidas a Preview / codex/private-article-comments:
  ARTICLE_COMMENTS_MODE=test, ARTICLE_COMMENTS_SUPABASE_URL,
  ARTICLE_COMMENTS_INTAKE_KEY, ARTICLE_COMMENTS_ANON_JWT,
  ARTICLE_COMMENTS_HASH_SECRET. Producción no modificada.
- Webhook Resend `d2ab7720-be0f-40fc-80cd-5ae4f4a7d93c` creado, **Disabled**:
  delivered, bounced, complained, delivery_delayed, failed. Sin aperturas/clics.
- Main incorporado en la rama; conserva portadas nuevas y favicon de PRs #47 y #48.

## Validación

- Suite de 249 pruebas pasó fuera del sandbox tras incorporar main, antes de añadir
  cuatro pruebas de la fachada. Las cuatro pruebas nuevas pasaron individualmente.
- Ejecución posterior dentro del sandbox: 253 pruebas, 250 pases y tres fallos
  (persistencia temporal y dos conexiones localhost EACCES). No afirmar pase completo
  de 253 hasta repetir con permisos adecuados o comprobar CI del commit final.
- PostgreSQL/WASM aislado pasó 003/004/005: permisos, dedupe, leases, evento temprano,
  doble confirmación idempotente, baja sin reactivación y supresión por rebote.
- No hubo un nuevo correo real, confirmación de suscripción real ni QA end-to-end.

## Limitación al detener la configuración remota

Supabase dejó de cargar al intentar abrir el código del worker (ERR_CONNECTION_RESET).
La repetición de navegación tampoco pudo recuperarlo. La revisión automática de
permisos de terminal expiró dos veces. No se omitieron controles para publicar.

## Pendiente antes de liberar

1. Actualizar `article-comment-worker` desde el archivo versionado (remoto aún versión
   previa de prueba de comentarios); mantiene solo tests hasta activar explícitamente.
2. Desplegar `article-delivery-events` y guardar ARTICLE_RESEND_WEBHOOK_SECRET.
   Es un webhook público de transporte con firma Svix obligatoria, límite de 64 KiB,
   ventana temporal y dedupe; configurar su gateway para permitir Resend solo después
   de revisar esta protección. No modificar JWT de intake ni worker.
3. Guardar ARTICLE_NEWSLETTER_MODE=enabled y ARTICLE_COMMENTS_PUBLIC_ORIGIN con
   el preview exacto. Token secret ya existe, no rotarlo durante reintentos.
4. Crear entradas Vault específicas, revisar/aplicar 006 y comprobar ejecución real
   del cron y backoff. No basta la existencia del job. Retención aún no programada.
5. Redeploy del preview para incorporar variables; probar formulario con datos ficticios
   y el único destinatario autorizado, ambos caminos de newsletter, validaciones,
   timeout/dedupe, firma inválida, eventos tempranos y baja. Sin leads comerciales.
6. Activar el webhook solo con receptor probado. Comprobar que la DB pasa de accepted
   a delivered; el correo de la prueba anterior sigue accepted sin webhook retrospectivo.
7. Cerrar aviso complementario: 180 días desde recepción en DB, 30 días solicitudes
   pendientes, consentimientos activos separados, registros de baja/supresión y plazos
   de buzón/proveedores. El aviso actual sigue siendo borrador y no está listo para live.
8. QA visual móvil/teclado, no PII en analítica, cabeceras no-store/noindex/no-referrer
   en suscripción, pruebas completas, revisión de diff y actualización del PR.
9. Publicar solo con configuración de producción revisada y release aprobado. Cambiar
   modos test/live de forma coordinada; preparar rollback a disabled. Confirmar HTTP,
   entrega y cola en la versión publicada, sin nuevas campañas.

## Contrato de privacidad y operación

La respuesta al visitante confirma almacenamiento, no entrega ni lectura del correo.
La casilla no activa marketing: solo una confirmación explícita produce estado active.
El código no envía campañas ni sincroniza audiencias. Cada futura campaña deberá
consultar estado active y excluir is_test, bajas y suprimidos al momento del envío.
El token viaja en fragmento, se elimina del historial visible y se envía por POST;
la página no carga analítica ni recursos externos. Abrir el correo no activa ni cancela.

Las versiones anteriores de funciones permanecen internas para facilitar revisión,
pero 005 no tiene rollback automático. No repetirla: ya está aplicada. 006 NO aplicada.
