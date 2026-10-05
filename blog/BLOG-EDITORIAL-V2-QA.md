# Blog editorial v2 — dirección y QA

**Rama:** `codex/editorial-blog-v2`  
**Superficies:** `/`, `/blog/`, `/blog/contenido-que-atrae-clientes.html` y `/blog/por-que-nacio-don-ventas.html`
**Clasificación BSB:** A — `PRESENTATION_REFINEMENT` para el hub; revisión editorial aprobada para el artículo.  
**Protección explícita:** el texto de `/blog/por-que-nacio-don-ventas.html` no cambia; únicamente se integra su portada en el nuevo marco responsivo.

## Familia de portadas editoriales

**Clasificación:** adaptación web nueva dentro de la expresión aprobada de Don Ventas; no sustituye activos canónicos ni redefine el sistema de marca.

| Superficie | Protagonista | Fuente | Comportamiento |
|---|---|---|---|
| Hub `/blog/` | una persona ordena señales dispersas hasta convertirlas en una secuencia | fotografía generada sin texto ni activos protegidos | una sola fuente 2:3; columna vertical en escritorio y adaptación 4:3 con foco superior en el modo apilado |
| Carta fundacional | Arturo Villagomez | fotografía real ya aprobada | mismo encuadre editorial, servido en WebP responsivo |
| Artículo de criterio | una emprendedora conecta producto, operación y comunicación | fotografía generada sin logos, resultados ni interfaces reconocibles | columna editorial en escritorio; imagen completa 3:2 en móvil |

Los títulos, folios y pies permanecen en HTML: no se hornean dentro de las imágenes. Las fuentes generadas no simulan clientes, testimonios ni resultados y se usan como escenas conceptuales.

### Regla de composición responsiva

- Las portadas solo se dividen en texto + fotografía cuando el viewport supera 1120 px y ambas columnas conservan un ancho útil.
- A 1120 px o menos, la fotografía ocupa primero el ancho completo y el texto continúa dentro del mismo marco editorial; nunca queda como un bloque suelto después del CTA.
- El hub conserva la misma fotografía en todos los tamaños. En el modo apilado, un degradado y un solapamiento controlado sustituyen la separación rígida entre imagen y copy.
- La escena principal de la landing usa proporción 4:3 y foco superior en el modo apilado. Esto conserva cabeza, gesto, manos y contexto suficiente sin alterar la imagen fuente.
- El hub usa una adaptación 4:3 de su misma fuente vertical; el artículo de criterio mantiene 3:2. La carta fundacional conserva el retrato real con foco superior.
- Los bordes de fotografía, texto e índice coinciden para que la portada se lea como una sola unidad y no como módulos independientes.
- No se generaron imágenes nuevas para esta corrección; el ajuste es de composición, selección responsiva y punto focal.

### Presupuesto visual

- Fuente única del hub: 33.8 KB a 480 px y 59.4 KB a 720 px. Las variantes horizontales exploratorias ya no se precargan ni se consumen en runtime.
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
| Carta fundacional | alineada | `ALIGNED` en copy; portada integrada | texto protegido y QA visual |
| Sitemap y `llms.txt` | alineados | `ALIGNED` sin cambio de URL | prueba automatizada |

## Criterios de aceptación

- El primer viewport explica que la publicación conecta comunicación y negocio.
- La carta fundacional conserva su texto y su ruta.
- El artículo reconoce de forma expresa que Don Ventas todavía no puede afirmar haber atraído miles de clientes mediante contenido.
- La experiencia del autor se limita a afirmaciones aprobadas: finanzas, operación, producto y más de 20 empresas atendidas en AMEZ CFO.
- Las cuatro situaciones siguen conduciendo a destinos reales.
- La jerarquía se sostiene a 320, 390, 768, 1024 y 1440 px.
- No existe desplazamiento horizontal, texto cortado ni dependencia de `hover`.
- Navegación por teclado, foco visible, encabezados, landmarks y enlaces siguen siendo comprensibles.
- SEO, JSON-LD, canonical, indexación y analítica permanecen activos.
- La rama no se fusiona ni despliega sin aprobación explícita del preview.

## Verificación ejecutada

- Suite automatizada: 39/39 pruebas aprobadas.
- Viewports medidos: 320, 390, 768, 1024 y 1440 px; no hay desbordamiento horizontal en landing, hub ni artículos.
- A 390, 768 y 1024 px, la imagen precede al copy dentro de un marco continuo; a 1440 px, la portada cambia a dos columnas.
- En la landing móvil, la imagen mantiene `object-position: center top` y muestra la cabeza completa del protagonista.
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

### Integración del retrato fundacional — 3 de octubre de 2026

- La carta conserva el mismo retrato en todos los anchos. Hasta 1120 px, foto y encabezado forman una portada continua mediante fundido y superposición; en escritorio mantienen dos columnas.
- El retrato se muestra completo con `object-fit: contain`, sin recortar la cabeza. Se eliminan la separación móvil y el espacio superior vacío del marco anterior.
- Texto del artículo, SEO, analítica y rutas sin cambios. No se añaden imágenes ni JavaScript; se ajustan los tamaños de selección y precarga de la imagen existente.
- QA local con viewports simulados de 320, 390, 768, 1024, 1120, 1121 y 1440 px: imagen cargada y 0 px de desbordamiento horizontal. Capturas de móvil y escritorio revisadas.
- Suite: 39/39 pruebas aprobadas; `git diff --check` sin errores. Esta ronda no vuelve a medir LCP/CLS; las cifras anteriores corresponden a su ejecución original.

## Rollback

## Portadas de las cuatro lecturas — 5 de octubre de 2026

Rama `codex/hub-editorial-covers`, base productiva `d8d69490`. Esta entrada
documenta una ronda nueva; las métricas y decisiones históricas anteriores no
se presentan como mediciones de esta versión.

- Dirección aprobada: carta fundacional destacada; artículos 02 y 03 con la
  misma estructura; glosario como recurso, nunca como artículo 04. Los cuatro
  enlaces integran imagen, título, resumen y acción en un solo marco.
- Se reutilizan retrato y escenas aprobadas. No hay generación, recorte ni
  cambio de escena por viewport. La nota de Arturo se conserva entre lecturas;
  se elimina el resumen lateral redundante de la carta en el índice, no del relato.
- Notas visibles: ilustraciones ficticias de barbería/joyería y avatares con IA.
  Términos nuevos: ninguno; no cambian entradas ni vínculos del glosario.
- Textos, fechas, SEO, autoría y portadas de los artículos individuales intactos.
  Se conserva el título informativo del HUB publicado mediante PR 28, JSON-LD
  con tres artículos, canonical, robots, medición y rutas comerciales. Solo se
  actualiza `lastmod` del HUB al día de esta modificación.
- CSS nuevo exclusivo del índice: 2.884 bytes, 1.096 bytes gzip en medición local.
  Sin JavaScript ni dependencias nuevos. Las cuatro imágenes usan lazy loading,
  dimensiones y srcset. Variantes de 480 px: 10.440 / 22.744 / 33.294 / 18.606
  bytes (fundador / barbería / joyería / glosario). La carga completa aumenta;
  no se afirma que añadir imágenes tenga coste cero. No se precargan las tarjetas.

### Verificación de esta ronda

- 96/96 pruebas automatizadas; `git diff --check` sin errores. Nuevas pruebas
  para cuatro portadas, enlaces únicos, nombres accesibles, inventario,
  fragmentos, carga diferida, tamaños, notas y aislamiento del CSS.
- Navegador integrado, iframe de prueba a 320/390/768/900/901/1440 px: sin
  desbordamiento horizontal en ninguno. Una columna hasta 900 px, dos desde
  901 px. Revisión visual de escenas completas en móvil/tablet/escritorio.
  Son anchos simulados, no teléfonos físicos ni una matriz multinavegador.
- Enter abre artículo 02; clic en imágenes de carta, artículo 03 y glosario
  abre el destino correcto. Tab pasa de carta a artículo 02, con contorno de
  3 px y separación de 5 px. No hay enlaces/botones anidados. Contrastes del
  texto secundario y acciones de los bloques nuevos: mínimo 6,16:1.
- Comparación directa local de escritorio a 1280 px, viewport nativo, sin
  throttling, servidor no-store, misma instrumentación: base LCP 216 ms / CLS 0;
  propuesta LCP 224 ms / CLS 0. Una muestra por versión, no Lighthouse ni datos
  de campo, sin conclusión sobre INP o p75. Recursos observados al inicio:
  439.327 vs 452.651 bytes; las imágenes lejanas siguen sin descargarse.
- Los valores CLS de la simulación en iframe incluyen un cambio de margen del
  body sin estilos a body con estilos en ambas versiones (~0,22). Se descartan
  como medida del sitio publicado; ese efecto no apareció en la prueba nativa.
- No se envían leads reales: formularios, servidor, datos, privacidad y legales
  no cambian. No se repite indexación ni se promete ranking. Auto-revisión;
  sin QA independiente ni aprobación visual del release todavía.
- Estado: preview para revisión. Sin merge ni despliegue a producción autorizado
  en esta ronda. Revertir el commit restaura los bloques anteriores.

## Rollback histórico

Revertir el commit de esta rama restaura el hub y el artículo anteriores. No hay cambios de datos, infraestructura, formulario, sitemap, legales ni dependencias.
