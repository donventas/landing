# Compuerta de antispam para producción

La portada candidata ya envía el diagnóstico a `POST /api/lead`. Esa función valida los campos,
rechaza orígenes ajenos, limita el tamaño, detecta el campo trampa, bloquea envíos demasiado
rápidos, aplica un límite por dirección y correo, conserva la llave de idempotencia y solamente
entonces registra el lead en Supabase.

## Orden obligatorio del release

1. Crear en Vercel una variable cifrada `SUPABASE_LEAD_KEY` o
   `SUPABASE_SERVICE_ROLE_KEY` para Production. No colocarla en HTML, JavaScript del navegador,
   Git ni capturas.
2. Desplegar la función `/api/lead` y comprobar un envío supervisado.
3. Ejecutar `supabase/migrations/002_lock_lead_ingress.sql` en el proyecto vigente.
4. Verificar que `/api/lead` sigue registrando y que un `POST` anónimo directo a
   `/rest/v1/lead` recibe rechazo.
5. Conservar el commit anterior como rollback. Si la función falla, revertir primero la
   migración o restaurar temporalmente el permiso de inserción antes de retirar el endpoint.

## Límite conocido

El contador en memoria de la función reduce ráfagas por instancia, pero no sustituye un límite
distribuido. La revocación del `INSERT` anónimo es la protección que impide omitir completamente
la capa de servidor. Un CAPTCHA no se añade por defecto para no aumentar fricción; se reconsidera
si aparece abuso real después del release.
