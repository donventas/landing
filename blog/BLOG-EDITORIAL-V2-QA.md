# Blog editorial v2 — dirección y QA

**Rama:** `codex/editorial-blog-v2`  
**Superficies:** `/blog/` y `/blog/contenido-que-atrae-clientes.html`  
**Clasificación BSB:** A — `PRESENTATION_REFINEMENT` para el hub; revisión editorial aprobada para el artículo.  
**Protección explícita:** el texto de `/blog/por-que-nacio-don-ventas.html` no cambia.

## Familia de portadas editoriales

**Clasificación:** adaptación web nueva dentro de la expresión aprobada de Don Ventas; no sustituye activos canónicos ni redefine el sistema de marca.

| Superficie | Protagonista | Fuente | Comportamiento |
|---|---|---|---|
| Hub `/blog/` | una persona ordena señales dispersas hasta convertirlas en una secuencia | fotografía generada sin texto ni activos protegidos | adaptación 2:3 para la columna de escritorio; imagen completa 3:2 en móvil |
| Carta fundacional | Arturo Villagomez | fotografía real ya aprobada | mismo encuadre editorial, servido en WebP responsivo |
| Artículo de criterio | una emprendedora conecta producto, operación y comunicación | fotografía generada sin logos, resultados ni interfaces reconocibles | columna editorial en escritorio; imagen completa 3:2 en móvil |

Los títulos, folios y pies permanecen en HTML: no se hornean dentro de las imágenes. Las fuentes generadas no simulan clientes, testimonios ni resultados y se usan como escenas conceptuales.

### Presupuesto visual

- Portada de hub: 15.7 KB a 480 px, 40.9 KB a 960 px y 72.5 KB a 1440 px.
- Adaptación vertical del hub: 33.8 KB a 480 px y 59.4 KB a 720 px.
- Artículo de criterio: 16.9 KB a 480 px, 45.8 KB a 960 px y 78.0 KB a 1440 px.
- Retrato fundacional: 10.4 KB a 480 px, 30.3 KB a 768 px y 58.2 KB a 1024 px.
- Cada imagen declara `width`, `height`, `srcset`, `sizes`, `decoding="async"` y una alternativa textual contextual.
- Solo la portada visible se precarga; las fuentes PNG de generación no se publican ni se consumen en runtime.

## Resultado observable

El hub deja de leerse como una cuadrícula de enlaces equivalentes y funciona como una portada de publicación: tesis visible, carta principal, artículo de criterio, nota de autor e índice por situación. El segundo artículo conserva su URL, pero corrige título, fecha y enfoque para partir de experiencia verificable: finanzas, operación, producto y la necesidad de comprender un negocio antes de comunicarlo.

## Fuentes y límites

| Fuente | Uso | Autoridad |
|---|---|---|
| Brand Profile vigente de Don Ventas | propósito, personalidad y lenguaje público | dirección aprobada |
| Customer Taste vigente de Don Ventas | entrada por situación, claridad y respeto al usuario | hipótesis operativa aprobada para piloto |
| Laboratorio editorial BSB | ritmo, folios, contraste, prueba y variación de densidad | dirección interna aprobada |
| Carta fundacional publicada | voz y origen de Arturo | copy protegido, sin cambios |
| Artículo publicado | URL, tema, intención de búsqueda y evidencia técnica | base editorial revisada |

No se incorporaron apariencias, activos ni soluciones de otras marcas. No se añadieron testimonios, resultados comerciales, estadísticas ni garantías.

## Autoría visual y derivación

| Dispositivo | Evidencia de Don Ventas | Propósito | Intensidad |
|---|---|---|---|
| Folio y edición | gramática editorial vigente | orientar y dar continuidad de publicación | quieta |
| Portada tipográfica asimétrica | titular posicional + ritmo editorial | establecer tesis antes del inventario | expresiva |
| Papel cálido para el artículo | pausas cálidas del sistema | separar lectura de criterio del manifiesto oscuro | estándar |
| Índice lineal por situación | audiencia definida por situación | ayudar a elegir sin conocer jerga | utilitaria |
| Azul limitado a ideas y acciones | roles cromáticos vigentes | señalar evidencia, navegación y avance | estándar |

Quedan prohibidos la cuadrícula genérica de tarjetas equivalentes, el movimiento decorativo, la importación de shells de otras marcas y cualquier cambio al contenido intrínseco de la carta fundacional.

## Copy y búsqueda

- Se conserva la URL existente por continuidad técnica y se adopta el título `Antes de crear contenido, entiende qué resuelve el negocio`.
- La fecha pública pasa al 3 de octubre de 2026 porque el artículo se reconstruye sustancialmente.
- El tiempo público se ajusta a 5 minutos a partir de 687 palabras de cuerpo editorial.
- Se mantienen `index,follow`, canonical, `BlogPosting`, breadcrumb y palabras clave existentes.
- Se actualizan descripción social y resumen para reflejar el contenido real.
- La reescritura usa términos comprensibles y explica la relación entre reacciones, comprensión, confianza y conversación.
- La referencia de Google Search Central permanece como apoyo técnico y mantiene el límite de no garantizar indexación.

## Consumidores y convergencia

| Consumidor | Estado antes | Estado objetivo | Verificación |
|---|---|---|---|
| `/blog/` | alineado con release anterior | `FROZEN_PENDING_REVIEW` hasta aprobación del preview | responsive, enlaces, SEO, Lighthouse |
| Artículo de criterio | alineado con release anterior | `FROZEN_PENDING_REVIEW` hasta aprobación del copy | lectura, metadatos, estructura, enlaces |
| Carta fundacional | alineada | `ALIGNED` sin modificación | hash del archivo sin cambios |
| Sitemap y `llms.txt` | alineados | `ALIGNED` sin cambio de URL | prueba automatizada |

## Criterios de aceptación

- El primer viewport explica que la publicación conecta comunicación y negocio.
- La carta fundacional conserva su texto y su ruta.
- El artículo reconoce de forma expresa que Don Ventas todavía no puede afirmar haber atraído miles de clientes mediante contenido.
- La experiencia del autor se limita a afirmaciones aprobadas: finanzas, operación, producto y más de 20 empresas atendidas en AMEZ CFO.
- Las cuatro situaciones siguen conduciendo a destinos reales.
- La jerarquía se sostiene a 320, 390, 768 px y escritorio.
- No existe desplazamiento horizontal, texto cortado ni dependencia de `hover`.
- Navegación por teclado, foco visible, encabezados, landmarks y enlaces siguen siendo comprensibles.
- SEO, JSON-LD, canonical, indexación y analítica permanecen activos.
- La rama no se fusiona ni despliega sin aprobación explícita del preview.

## Verificación ejecutada

- Suite automatizada: 39/39 pruebas aprobadas.
- Viewports medidos: 320, 390 y 768 px; `scrollWidth` coincide con `innerWidth` en hub y artículo.
- Una sola etiqueta `h1`, canonical e `index,follow` presentes en ambas superficies.
- Capturas de escritorio y móvil revisadas sin texto cortado ni colisiones.
- El único 404 observado en servidor local corresponde a `/_vercel/insights/script.js`, disponible únicamente en el despliegue de Vercel y no a un activo del sitio.

### Medición local de las portadas

Condición simulada: Edge headless, servidor local, viewports 320/390/768/1440 px. Es evidencia de regresión, no sustituye Lighthouse sobre el preview ni datos de campo.

| Señal | Resultado observado |
|---|---|
| Desbordamiento horizontal | 0 px en las tres superficies y cuatro anchos |
| LCP aproximado | 0.128–2.324 s; peor ejecución por debajo de 2.5 s |
| CLS | 0–0.0025; por debajo de 0.1 |
| Imagen elegida en móvil | 480 px para hub, artículo de criterio y retrato |
| Imagen elegida a 768 px | 960 px para escenas; 768 px para retrato |
| Errores de consola propios | ninguno |

La precarga se limita a la imagen de portada correspondiente al viewport mediante `media`; no se descargan simultáneamente las adaptaciones horizontal y vertical.

## Rollback

Revertir el commit de esta rama restaura el hub y el artículo anteriores. No hay cambios de datos, infraestructura, formulario, sitemap, legales ni dependencias.
