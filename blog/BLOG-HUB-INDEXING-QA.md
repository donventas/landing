# Blog hub — dirección, indexación y QA

**Fecha:** 2026-10-03  
**Rama:** `codex/blog-hub-indexing`  
**Base productiva:** `main` en `de5f903`  
**Superficie:** `/blog`, `/blog/` y los dos artículos publicados  
**Clasificación:** W2 por pertenecer a un sitio público con flujo de leads; las rutas del blog no reciben datos directamente.

## Resultado buscado

Una persona debe poder entrar por `/blog` o `/blog/`, reconocer una situación propia, llegar a una lectura o ruta útil y continuar al diagnóstico sin conocer terminología de marketing. El hub y los artículos deben seguir siendo indexables y no depender de una diagonal final para cargar estilos, scripts o enlaces.

## Decisiones aplicadas

- `/blog` redirige permanentemente a la URL canónica `/blog/`.
- Los recursos y enlaces internos del blog usan rutas desde la raíz.
- El hub mantiene indexación, canonical, sitemap y datos estructurados.
- La entrada se organiza por cuatro situaciones, no por tamaño o tipo de empresa.
- Cada situación conduce a un destino real; se eliminan los territorios vacíos con “Próximamente”.
- El encabezado móvil conserva como acción principal el diagnóstico.
- Se registra únicamente qué ruta editorial se seleccionó, sin respuestas ni datos personales.
- Las rutas del blog reciben una CSP propia y los encabezados generales existentes.

## Matriz de aseguramiento

| Control | Estado | Evidencia / límite |
|---|---|---|
| Ruta `/blog` → `/blog/` | PASS funcional | El preview protegido termina en `/blog/` al entrar por `/blog`; el código exacto se verificará en producción porque la respuesta externa del preview se antepone con SSO. |
| Recursos independientes de diagonal final | PASS | CSS, JS, iconos y enlaces del blog usan rutas absolutas desde la raíz. |
| Comprensión y siguiente acción | PASS | Cuatro situaciones en lenguaje directo; cada una tiene un destino real; CTA de diagnóstico visible. |
| Indexabilidad técnica | PASS | `index,follow`, canonical `/blog/`, enlaces rastreables, sitemap y JSON-LD presentes. |
| Responsive 320 / 390 / 768 | PASS local | Sin desbordamiento horizontal; 1 / 1 / 2 columnas en las rutas por situación; acción móvil de diagnóstico visible. |
| Accesibilidad básica | PASS | Salto a contenido, foco visible, un H1, regiones semánticas, enlaces con propósito comprensible y sin dependencia de hover. `html-validate` sin hallazgos y Lighthouse local 100. |
| Rendimiento | PASS de laboratorio | Lighthouse local: Performance 96, FCP 1.8 s, LCP 2.6 s, TBT 0 ms y CLS 0. No equivale a datos de campo p75. |
| Seguridad de rutas del blog | PASS de implementación / PENDING de header | CSP y encabezados definidos; el preview carga CSS y JS propios sin romper la experiencia. La lectura externa exacta queda detrás del SSO del preview y se repetirá en producción. |
| Enlaces y artículos | PASS preview | La selección de una situación abre el artículo correcto; ambos artículos cargan estilos y canonical; el CTA llega a `#contacto` con el diagnóstico presente. |
| Publicación e indexación externa | BLOCKED | Requiere aceptación del preview, merge, despliegue y comprobación posterior; Google decide el rastreo y la indexación. |

## Rollback

Revertir el commit de esta rama restaura el hub anterior. No hay migraciones, cambios de datos ni nuevas dependencias. Después de desplegar, el control mínimo es abrir `/blog`, `/blog/`, ambos artículos y el CTA; si falla la navegación o la CSP bloquea recursos esenciales, volver al release productivo anterior.
