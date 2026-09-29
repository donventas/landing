# Auditoría de seis controles legales · Don Ventas

**Fecha:** 29 de septiembre de 2026  
**Alcance técnico:** `donventas/landing`, `donventas/dv-portal`, formulario de diagnóstico y función de correo `lead-notifications`.  
**Límite:** revisión técnica y operativa; no sustituye una opinión jurídica para las jurisdicciones donde se comercialice.

## Resultado

| Riesgo | Estado observado | Control aplicado |
|---|---|---|
| Registro de menores | El portal permitía iniciar “Nueva marca” sin una declaración de edad. Don Ventas es un servicio B2B de audiencia general, no dirigido a menores. | La ruta pública exige confirmar 18 años antes de iniciar el diagnóstico F0. Si existe conocimiento real de que la persona es menor, no debe continuar la captura. |
| Fuentes de terceros | La landing y el portal llamaban a `fonts.googleapis.com` y `fonts.gstatic.com`. | Schibsted Grotesk y Space Mono se sirven desde `assets/fonts/`, con sus licencias SIL OFL. No se transmite la visita a Google para descargar tipografías. |
| Grabación de sesiones | La landing instalaba Microsoft Clarity después del banner y habilitaba reproducción de sesiones. | Se retiraron el script, el identificador, el banner asociado y el registro de consentimiento. La política de cookies declara que no se graban sesiones. |
| Correo comercial | El acuse del diagnóstico no mostraba domicilio ni un mecanismo visible de baja. | El correo al prospecto incluye domicilio, enlace de baja por correo y encabezado `List-Unsubscribe`. El aviso interno al equipo no es un correo comercial al consumidor. |
| Renovación automática | No existe suscripción recurrente en la superficie activa. El único CTA monetario es un anticipo único mediante Stripe. | Junto al botón de pago se declara: pago único, no es suscripción, no hay renovación automática y Stripe muestra el importe antes de confirmar. Si se agrega recurrencia, será obligatorio sustituir este texto por precio, frecuencia, renovación, cancelación y conversión de prueba aplicables. |
| Agente DMCA | No se encontró una designación verificada ni una página pública que identifique a un agente. | Se creó `DMCA-AGENT-CHECKLIST.md`. El registro sigue pendiente porque requiere confirmar titular, domicilio y teléfono que serán públicos, elegir al agente y autorizar el pago oficial. |

## Evidencia de implementación

- Landing: `styles.css`, `app.js`, `index.html`, `branding.html` y `15_LEGAL/Politica de Cookies.html`.
- Portal: `app/auth.js`, `app/free.js`, `app/portal.css` y `supabase/functions/lead-notifications/index.ts`.
- Fuentes: `assets/fonts/` en ambos repositorios.
- Pruebas: `tests/diagnostico-v2.test.js` y `tests/product-foundation.test.js`.

## Controles que deben mantenerse

1. No volver a añadir grabadores de sesión sin revisión de finalidad, consentimiento, señal al proveedor y enmascaramiento.
2. No activar una campaña comercial hasta contar con una lista de supresión que se consulte antes de cada envío.
3. Revisar el texto contiguo al botón cada vez que cambie Stripe de pago único a cobro recurrente.
4. Revisar anualmente los datos públicos del agente DMCA y renovar la designación antes de tres años.
5. Conservar las licencias OFL junto a las fuentes y no sustituirlas por llamadas remotas durante rediseños.

