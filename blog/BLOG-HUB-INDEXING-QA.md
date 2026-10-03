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
| Ruta `/blog` → `/blog/` | PENDING | Verificar respuesta 308 en preview Vercel; el servidor estático local no reproduce redirects de Vercel. |
| Recursos independientes de diagonal final | PASS | CSS, JS, iconos y enlaces del blog usan rutas absolutas desde la raíz. |
| Comprensión y siguiente acción | PASS | Cuatro situaciones en lenguaje directo; cada una tiene un destino real; CTA de diagnóstico visible. |
| Indexabilidad técnica | PASS | `index,follow`, canonical `/blog/`, enlaces rastreables, sitemap y JSON-LD presentes. |
| Responsive 320 / 390 / 768 | PASS local | Sin desbordamiento horizontal; 1 / 1 / 2 columnas en las rutas por situación; acción móvil de diagnóstico visible. |
| Accesibilidad básica | PASS local | Salto a contenido, foco visible, un H1, regiones semánticas, enlaces con propósito comprensible y sin dependencia de hover. |
| Rendimiento | PASS de alcance | No se añadieron imágenes, fuentes ni dependencias; se eliminó un script inline y el JS nuevo es una escucha pequeña de eventos. Medición de preview queda pendiente. |
| Seguridad de rutas del blog | PENDING | CSP y encabezados definidos; comprobarlos en preview y revisar que no bloqueen Analytics. |
| Enlaces y artículos | PENDING | Verificación completa en preview después del despliegue de rama. |
| Publicación e indexación externa | BLOCKED | Requiere aceptación del preview, merge, despliegue y comprobación posterior; Google decide el rastreo y la indexación. |

## Rollback

Revertir el commit de esta rama restaura el hub anterior. No hay migraciones, cambios de datos ni nuevas dependencias. Después de desplegar, el control mínimo es abrir `/blog`, `/blog/`, ambos artículos y el CTA; si falla la navegación o la CSP bloquea recursos esenciales, volver al release productivo anterior.

