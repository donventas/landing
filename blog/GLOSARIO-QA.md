# Glosario progresivo — piloto editorial

Fecha: 2026-10-04. Base: `b5ef37b50b832b2820e30c85848b897a39baacca`.
Estado del piloto original: publicado mediante PR #30, commit `5b787c7`.
Search Console aceptó la solicitud de indexación del glosario y del artículo 03;
no se afirma incorporación al índice. El registro inferior conserva la evidencia
histórica previa al release. La pasada editorial siguiente queda en preview.

## Decisión y alcance

Arturo aprobó lenguaje más claro, glosario y revisión de términos con cada nuevo
blog. Los enlaces deben apuntar a la entrada, no al inicio del glosario.
Implementación mínima: enlaces HTML nativos; no ventanas emergentes, imágenes,
fuentes ni dependencias nuevas. Un script de retorno de ~1.6 KB se carga solo en
el glosario, añadido por la petición posterior de Arturo. Solo repositorio Landing.

- Workflow 1.2: detectar, simplificar, reutilizar o añadir entrada en la misma PR;
  conservar IDs; revisar contexto; no confundir comprobación mecánica con comprensión.
- Piloto en artículo 03: «operación» se explica como organizar el trabajo;
  «campaña» se sustituye por anuncios y publicaciones. Dos enlaces a marca y promesa.
- 14 términos presentes en el lenguaje del sitio: branding, campaña,
  contenido, conversión, copy, identidad visual, marca, marketing, posicionamiento,
  promesa de marca, propuesta de valor, SEO, experiencia de usuario y página de
  destino. No son consultas de demanda medida.
- «Capacidad humana» y «recursos» quedan acompañados de contexto, sin saturar enlaces.
- Historias, imágenes, permisos, fuentes académicas, fecha de publicación y oferta
  de diagnóstico preservados. El ajuste ocurre el mismo día de publicación.
- Glosario enlazado desde Ideas, sitemap y llms; CollectionPage, no artículo 04.
  No modifica el título/intención del HUB: ese trabajo sigue fuera de este piloto.

## Evidencia y composición

Adaptación de la familia editorial del sitio: tipografía local, azul, subrayado,
jerarquía de encabezados y espacios de lectura. No se importan otras marcas.
Definiciones editoriales, ejemplos explícitamente ilustrativos. AMA como referencia
para marketing/marca y Google para SEO, con contexto sencillo sobre quién publica.
Fuentes abiertas el 4 de octubre de 2026. No resultados comerciales inventados.

## Comprobaciones

- 87 pruebas Node aprobadas en la ampliación; diff sin errores de whitespace.
- Nueva prueba recorre los HTML del blog: todos los enlaces de artículos al glosario
  requieren un ID existente; entradas únicas con definición, ejemplo y distinción.
  Comprueba índice, rutas locales, enlaces de vuelta y metadatos. El detector no
  decide qué palabras nuevas necesita explicar el lector: eso sigue siendo editorial.
- Glosario, artículo 03 e Ideas: anchos CSS simulados en iframe local Chromium de
  320/390/768/1440 px. Sin desbordamiento horizontal en los documentos interiores.
  Revisión visual de portada, definición y párrafo con enlace; no prueba en teléfono físico.
- Enlace «promesa» desde artículo a `glosario.html#promesa-de-marca`: destino enfocado,
  margen superior 130 px, por debajo de navegación fija de ~91 px en escritorio.
- Activación con Enter de «Campaña» y regreso al artículo mediante lectura relacionada.
  Foco visible. Enlaces nativos disponibles sin JS; sin tooltip exclusivo de ratón.
- Fondo oscuro existente, enlaces #8DACFA, cuerpo #C4CBD5 y definiciones #EEF1F6;
  fuente mínima de explicación 15 px, cuerpo 18 px, enlaces de índice mínimo 44 px.
- Formularios, endpoint, seguridad, consentimiento y medición existentes sin cambios;
  no se envió un lead real para un cambio de glosario.

## Carga y límites

HTML del glosario: ~20.6 KB. CSS compartido nuevo: ~3.1 KB sin comprimir.
Los artículos solo incorporan ese CSS y enlaces; mismas imágenes y scripts.
El glosario añade `glosario.js`, ~1.6 KB, sin librerías ni peticiones adicionales
para obtener el origen. No se incorpora una librería de popups o búsqueda.

Observación local, iframe 768 px, sin limitar red/CPU, caché no controlada:

| Página | LCP anterior / piloto | CLS anterior / piloto |
|---|---|---|
| Artículo 03, carga desde arriba | 200 / 576 ms | 0.002 / 0 |
| Ideas, carga desde arriba | 280 / 268 ms | 0 / 0 |

Glosario 320 px: LCP 80 ms, CLS 0. Estas muestras no certifican rendimiento móvil
ni Core Web Vitals de campo; no se midió INP. Pruebas iniciales paralelas con saltos
a fragmentos registraron CLS hasta ~0.243 y LCP ausente; no se descartan esos datos
ni se usan como prueba de regresión causal. La repetición desde arriba dio los
valores de tabla; una evaluación controlada de campo/laboratorio queda pendiente
si se requiere certificar métricas. No se cambia layout histórico por esa variación.

QA realizado por el implementador; no se declara revisión independiente en esta ronda.
Aceptación de la voz, definiciones y preview pendiente de Arturo. Merge/producción e
indexación son compuertas separadas; sitemap no prueba que Google haya indexado.
Rollback: revertir la PR, no borrar historias o documentos históricos.

## Ampliación: regreso al artículo correcto

Petición posterior de Arturo: un mismo término puede aparecer en distintos blogs;
debe poder regresarse al origen correcto y enlazar los demás artículos.

- Cada enlace contiene `from` (clave de artículo) y `at` (término de salida), además
  del fragmento de la definición. Solo se aceptan pares registrados en los enlaces
  HTML de lecturas. No hay URLs de retorno libres, cookies, referrer ni storage.
- «Volver al artículo 01/02/03» aparece junto a cada definición y regresa al ID
  `termino-…` del enlace original, no al inicio del artículo. El nombre accesible
  contiene el título completo. Consultar otro término conserva el punto inicial.
- Sin origen válido o con JS deshabilitado: enlace nativo a lecturas para elegir
  manualmente. No se simula recordar un origen. Canonical del glosario sin parámetros.
- Fundacional: campaña, experiencia de usuario, marca, contenido. Artículo 02:
  contenido, página de destino y campaña. Artículo 03: marca y promesa. Solo se
  añaden enlaces; no se reescriben los relatos de los artículos 01 y 02.
- Prueba real local con dos pestañas: «marca» desde artículos 01 y 03 produjo dos
  retornos distintos; ambos llegaron al ID correcto con foco. En el primero se
  consultó también SEO antes del regreso: siguió regresando a «marca» del 01.
- Origen inválido probado en navegador: fallback a lecturas. Tests comprueban
  origen/término inexistentes, parámetros duplicados y URLs externas/javascript.
- Glosario con retorno: simulación 320/390/768/1440 px, sin overflow. Laboratorio
  local sin throttling/caché controlada: LCP 352/112/432/340 ms; CLS 0/~0.0002/0/0.
  No es una certificación CWV, y las limitaciones de la medición inicial permanecen.
- Se comprobó el margen de regreso: término a ~140 px, por debajo del header
  de ~91 px en escritorio. No se afirma prueba en dispositivo físico ni INP.

## Pasada editorial de consulta — base 5b787c7

Dirección aprobada por Arturo después del release anterior. Clasificación:
adaptación de presentación en Landing, no cambio de fundamentos BSB/AVOS.
Sin experimento AVOS activo. Superficie HTML/CSS y navegador local confirmados.
Merge de la nueva pasada pendiente de revisión del preview.

### Composición y límites

- Portada tipográfica dentro de un marco común, título oscuro y nota en papel
  claro. Derivada de `blog/blog.css`: Schibsted local, azul, papel, notas e índices
  editoriales; no referencias visuales de otras marcas ni una foto decorativa.
- La nota «Una marca. No solo un logo» remite al significado ya aprobado.
- Columna de consulta lateral con desplazamiento propio en escritorio; índice
  nativo `details/summary` en móvil. Las dos listas tienen los mismos 14 destinos,
  comprobados por test, y solo una es visible por breakpoint.
- Definición protagonista, ejemplo sobre papel, aclaración secundaria legible,
  dos términos relacionados y una lectura contextual. No se esconden definiciones.
- 42 párrafos protegidos (definiciones, ejemplos, distinciones) idénticos a main.
  IDs, canonical, fuentes, enlaces desde artículos, registro de origen y script
  de retorno preservados. No cambia sitemap ni fechas por estética.
- Consumidores: glosario y CSS compartido por los artículos. Las reglas de los
  enlaces de artículos se mantienen idénticas; el resto se limita al glosario.
  Sin cambios a formularios, servicios, privacidad, medición, Portal o Runtime.

### Verificación de implementación

- 89 tests: los 87 anteriores más paridad de índices/relaciones y presupuesto
  de recursos. Enlaces locales, anclas, origen adversarial y metadatos pasan.
- 320/390/768/959/960/1440 px de contenido simulados en iframe Chromium local:
  sin overflow horizontal. También revisión de escritorio real a ~1264 px.
  El iframe reserva 15 px adicionales para scrollbar; no es teléfono físico.
- Revisión visual: portada en escritorio/tableta/móvil, definición a 320 px,
  índice móvil cerrado y abierto, salto a Campaña, foco y contraste de ejemplos.
- Recorrido real con Enter: Marca → Identidad visual, manteniendo `from/at`;
  regreso al artículo 03 con foco en `termino-marca` a ~140 px del borde superior.
  Entrada directa a Marca queda a ~130 px, por debajo del menú.
- Contraste calculado: azul sobre papel 5.73:1; tinta sobre papel 13.99:1;
  texto secundario sobre fondo oscuro 10.65:1; enlace sobre panel 8.13:1.
- HTML ~23.6 KB; CSS ~7.7 KB; JS original 1,619 bytes. Sin imágenes, fuentes,
  librerías ni peticiones de datos nuevas. El único `img` sigue siendo el wordmark.
- Autorrevisión del implementador, no QA independiente ni prueba con clientes.
  Mantener aprobación visual y publicación separadas de pruebas mecánicas.

### Rendimiento observado y límites

Muestras locales en iframe, sin throttling de CPU/red y sin controlar caché;
no constituyen certificación de Core Web Vitals ni medición de INP.
Desde arriba: 768 px LCP 76 ms, 959 px 88 ms, 960 px 64 ms, 1440 px 56 ms;
CLS 0 en estas cargas. Entrada directa a Marca, 320 px: 56 ms / CLS 0.
Comparación desde arriba con referencia de `5b787c7` servida por el mismo servidor:
320 px LCP 52 → 52 ms; 1440 px 60 → 56 ms; CLS 0 en ambas versiones.
Son muestras individuales exploratorias, no evidencia de mejora estadística.
Al abrir el índice mediante automatización, el observador del iframe reportó
CLS ~0.546; se conserva esta observación de interacción separada de la carga.
La expansión desplaza contenido intencionadamente; esta captura automatizada
no permite certificar la exclusión por entrada reciente ni el CLS de campo.

Rollback: revertir únicamente la PR editorial; no eliminar el glosario, los IDs
ni las solicitudes de indexación ya realizadas. No repetir solicitudes por un
cambio exclusivamente visual ni prometer mejores posiciones por el rediseño.

## Revisión aprobada: consulta desplegable

Sustituye la composición de consulta anterior, no el contenido de las definiciones.
Arturo aprobó lista desplegable, frecuencia por artículos, búsqueda y orden
alfabético opcional. Continúa en PR #31; no autoriza su merge a producción.

- Portada compacta sin nota lateral; lista única de 14 `details/summary`, cerrados
  al explorar. Se pueden mantener varios abiertos. Secuencia: significado,
  ejemplo, aclaración «No confundir con», conceptos relacionados, lectura y regreso.
- 42 párrafos de definición/ejemplo/aclaración preservados. Se retiran solo los
  pequeños encabezados decorativos previos y se simplifica la introducción.
- Corpus: HTML del blog con BlogPosting, exclusivamente cuerpos `article`, con
  soporte de artículos anidados. Excluye nav, aside, scripts, estilos, metadatos
  y glosario. Aliases explícitos, normalización de acentos y límites de palabra.
- Reporte reproducible: `node scripts/glossary-frequency.cjs`. Conteo por artículo,
  no repeticiones. Coincidencias léxicas, no demanda medida ni clasificación
  semántica perfecta. Contenido: 3; Campaña/Marca/Marketing/Promesa: 2;
  Branding/Experiencia de usuario/Página de destino: 1; los demás: 0.
  Empates alfabéticos; orden inicial ya presente en HTML, sin salto por reordenar
  en carga. Tests exigen actualizar atributos y orden si cambia el corpus.
- Búsqueda por nombre y alias (no por todo el texto); acentos/mayúsculas indiferentes.
  Estado sin coincidencias con acción para ver todos. Contador anunciado por status.
- Llegada por hash abre el término; relaciones conservan `from/at`. Si el destino
  estaba filtrado se limpia la búsqueda. Hash malformado se ignora sin lanzar error.
  No cookies, storage, fetch, retorno arbitrario ni contenido inyectado como HTML.
- Pruebas reales locales: buscar landing, abrir Página de destino y seguir SEO
  (limpia filtro y deja ambos abiertos); cero coincidencias/restablecer; orden
  alfabético; Marca → Identidad visual → retorno exacto al artículo 03.
  Origen fundacional devuelve otro enlace; apertura/cierre con Enter comprobados.
- Copia local sin scripts: controles de búsqueda/orden ocultos, apertura nativa
  con Enter y definición disponible. No se afirma emulación global de JS desactivado:
  se verificó una copia sin elementos script. Sin JS, el hash llega a la barra y
  el lector la abre manualmente; no se finge recordar el origen.
- 91 pruebas Node. QA del implementador, no revisión independiente. Anchos de
  contenido 320/390/768/1440 px en iframe local, sin overflow; no teléfono físico.
- HTML ~25.6 KB, CSS ~6.2 KB, JS ~4.5 KB sin comprimir. Aumento acotado del script
  existente para búsqueda, orden y apertura; sin librerías, imágenes o fuentes nuevas.
  Pruebas fijan presupuestos HTML 28 KB, CSS 11 KB y JS 6 KB.
- Muestras exploratorias locales sin red/CPU limitadas ni caché controlada:
  LCP 320 px 624 ms (antes del último acortamiento de portada); 390 px con hash al
  índice 68 ms; 768 px 56 ms; 1440 px 68 ms; CLS 0 en esas cargas. No se certifican
  CWV/INP ni se comparan estas muestras como mejora causal.
- SEO, IDs, canonical, sitemap, enlaces entrantes, privacidad, formularios y
  medición conservados. Publicación e indexación de esta revisión pendientes;
  no se repitió solicitud de indexación de la versión ya publicada.
