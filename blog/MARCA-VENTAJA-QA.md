# Tu marca es tu ventaja — preview editorial

## Mandato y límites

Preview local solicitado por Arturo el 4 de octubre de 2026. Rama
`codex/brand-advantage-blog`, base de Landing `47ae469`. Sin push, PR, publicación
ni indexación en la ronda inicial: la fotografía personal se revisó primero en local.
**Actualización de mandato:** Arturo autorizó cerrar compuertas y publicar este
artículo el 4 de octubre de 2026; pidió fuentes de autoridad contextualizadas en
lenguaje sencillo. Esta autorización sustituye el límite de preview inicial.
La propuesta de productos permanece en el backlog de su rama, sin cambios aquí.

## Dirección y composición antes de montaje

Adaptación de la familia editorial aprobada en `BLOG-EDITORIAL-V2-QA.md` y del
artículo 02 publicado. Assembly-led / CANONICAL_DERIVED_EXTENSION, no nueva
identidad ni modificación del Runtime, Portal, AVOS o BSB. Se reutilizan logo,
fuentes, colores, navegación y reglas aprobadas de portadas integradas.

- Lector: alguien que quiere que su negocio sea recordado y elegido por razones
  distintas del precio. No segmentar exclusivamente por tamaño o nacionalidad.
- Relato autorizado: restaurantes, recuerdo de pareja, joyería fundada por su
  mamá, atención y pedidos por WhatsApp relatados por su hermano; sostener la
  promesa con capacidad operativa. Declaraciones del autor, no estudio causal.
- Voz: ensayo personal, afectuoso y cotidiano; sin cifras decorativas ni promesas
  de posicionamiento. Conservar contrapunto: competir por precio puede ser válido.
- Intención propuesta: «tu marca es tu ventaja». Volumen y dificultad desconocidos.
- Hero: misma escena de joyería en todo tamaño, fotografía completa 3:2, titular
  y fotografía dentro de un marco; dos columnas solo sobre 1120 px.
- Lectura: columna de 62–68 caracteres, márgenes mínimos de 22 px en móvil;
  jerarquía tipográfica, azul en ideas clave, pausas de imagen sin bloques de notas.
- Interludio: recreación del desayuno en el restaurante con Arturo y su pareja,
  usando su selfie como referencia de identidad por petición explícita. No se
  publica la selfie aparte ni se presenta la recreación como foto documental.
- Índice y cierre reutilizan la gramática utilitaria de Don Ventas. Sin 3D ni
  animación nueva. Las fotos no contienen texto editorial horneado.
- Consumidores del release: artículo nuevo, CSS específica y derivados, HUB,
  lectura relacionada en artículo 02, ajustes acotados de CSS compartida para la
  miniatura del HUB, sitemap y llms.txt. Legales, Portal, Runtime y leads sin cambios.

## Fuentes, derechos y estados

- Joyería: escena conceptual generada con herramienta integrada; aprobación de
  dirección en esta conversación. No retrato ni prueba de clientes de Marje.
- Restaurante: recreación con IA inspirada en la foto proporcionada por Arturo;
  la pareja se basa en la selfie aportada, conforme a su corrección explícita.
  Pie: «Inspirada en el restaurante donde tuve mi primer desayuno con el amor de
  mi vida. 🤍» y etiqueta breve «Recreación con IA».
- Pareja: referencia transmitida al generador integrado para el uso solicitado.
  Imagen aprobada para integrar y publicar; la selfie original no se sube a GitHub.
- Marca: SVG existente `donventas-wordmark-b6-reverse.svg`, sin transformación
  interna. Los activos de otras marcas no entran como sistema visual.
- Familias previas: portadas integradas, Schibsted Grotesk/Space Mono, fondo oscuro,
  folios, acentos azules, notas compactas: dirección explícitamente aprobada en el
  sitio. Las fotos del restaurante y joyería son temas del relato, no otra marca
  cuya estética se adopte.

## Ejecución y verificación

AVOS: fuente local autorizada `AVOS-main-integrity`; ruta web/execute, consumo de
marca aprobada. Estado de experimento `NO_ACTIVE_EXPERIMENT`. Guía BSB de
composición y contratos aplicables leídos; se reutiliza brief aprobado sin
reabrir descubrimiento. No se declara instalación de capacidades ni validación
comercial. HTML/CSS y navegador: superficies confirmadas para montaje local.

Expresivo: hero e interludio. Utilitario: índice, lectura, notas y CTA. Fotos
dimensionadas, variantes WebP, carga diferida excepto portada. Sin recortes de
caras, sin dependencias nuevas. Recursos se verificarán tras render real.

QA de preview terminado: 4 pruebas automatizadas pasan (estado no publicado,
recursos y anclas, imágenes y etiquetas, movimiento reducido y enlace a leads).
Revisión independiente estática sin bloqueos; observación de reduced-motion
corregida aplicando la excepción a `html`, no solo a `body`.

Inspección visual en navegador: escritorio y marcos de 320/390/768 px. Los marcos
tienen scrollbar de 15 px: anchos útiles medidos 305/375/753, respectivamente;
scrollWidth idéntico al ancho útil, sin overflow. Marco de 1440: ancho útil 1425,
scrollWidth 1425, dos columnas de 647.5 px. Márgenes de lectura móviles de 24 px.
Misma imagen de portada en todos los tamaños y ambas escenas completas. Enlace
directo al recuerdo tiene scroll-margin para no ocultar las caras bajo la nav.
No es prueba en dispositivos físicos ni auditoría Lighthouse/Core Web Vitals.

Versiones WebP de 960 px: joyería 91,694 bytes; restaurante neutro 85,350 bytes. La
portada carga prioritaria; restaurante lazy. Sin prueba de envío: no cambió el
formulario, se conserva enlace a /#contacto. Sin analítica en el preview local.

En la ronda de preview, aprobación de página e imagen personal, derivado social,
datos estructurados, fecha real de publicación, enlaces del HUB, sitemap y PR
eran compuertas posteriores. El noindex de preview se debe retirar SOLO en el
release aprobado; la canonical es la ruta de publicación propuesta, no evidencia
de que exista ya en producción.

## Producción de la escena de restaurante

Herramienta integrada image_gen, edición identity-preserve/compositing. Fuente
generada: exec-8ca7e7e7-64d9-4573-b65d-1df6522f914d.png. Referencias: escena previa,
selfie de la pareja y foto del restaurante aportadas por Arturo. Se normalizó la
codificación de la selfie tras error CRC; sin retoque creativo previo al generador.
Prompt final: sustituir a ambos personajes ficticios por la pareja de la selfie;
preservar caras, tez, cabello rizado y lentes (metálicos redondos ella, negros
rectangulares él), blusa roja/blanca y camiseta negra; desayuno juntos mirándose,
sin posar a cámara. Conservar restaurante familiar mexicano, paredes claras y
turquesa, decoración popular, cojines bordados, sillas coloridas, mesa de madera,
luz natural y encuadre horizontal 3:2. Objetos orientados a comensales, manos
plausibles, cabezas completas, fotografía editorial natural sin texto. Recreación
ilustrativa del recuerdo, no foto documental. Derivados finales dentro del repo:
`assets/editorial/marca-recuerdo-{480,960,1440}.webp`. La selfie no se incluye.

### Ajuste de vestuario aprobado e integrado

Arturo aprobó la escena con prendas neutras y pidió subir la imagen. Se integra
en el preview local existente, sin interpretar esa autorización como merge del
artículo completo. Nueva fuente del generador integrado:
`exec-dc1d3d5c-3098-43e6-b791-3daa11957338.png`.
Prompt de edición: cambiar únicamente vestuario a blusa lisa marfil de lino y
camisa casual de lino color piedra con mangas recogidas; quitar correa diagonal.
Conservar identidades, proporciones, lentes, cabello, expresiones, postura, manos,
collar, restaurante, luz, comida, utensilios y encuadre 3:2, sin texto añadido.
WebP 480/960/1440: 32,786 / 85,350 / 137,814 bytes. Query `neutral-2` en src/srcset
para invalidar la imagen anterior en caché. No cambia composición ni copy.

### Revisión inicial de preparación para producción (histórica)

Suite completa ejecutada: **76 de 77 pasan**. El control de publicación del nuevo
artículo falla porque falta `og:url`; la inspección confirma además pendientes:
OG/Twitter e imagen social, BlogPosting, fechas veraces, enlace desde HUB,
inclusión en sitemap/índice auxiliar, analítica y retirar noindex al publicar.
El control permanece intacto: no se relaja para aprobar un borrador.
Las cuatro pruebas específicas del preview pasan. No hay PR ni preview remoto
de este artículo todavía. Falta medición de laboratorio y QA final sobre ese
preview, incluida seguridad/headers efectivos. **No listo para merge**; el
relato y el diseño no requieren reescritura general para resolver estos puntos.

### Cierre de compuertas para el release autorizado

- Metadata OG/Twitter, JPG 1200×630 de 138,109 bytes sin cortar rostros,
  BlogPosting/BreadcrumbList, autor, fecha 2026-10-04 y canonical coherentes.
- Index/follow en fuente productiva; previews Vercel deben devolver noindex por
  header. Se comprobará separadamente en despliegue.
- HUB ItemList pasa de 2 a 3 y añade tarjeta del artículo 03; artículo 02 añade
  siguiente lectura sin reescribir su relato. Sitemap y llms.txt incorporan URL.
- Analítica existente de Vercel y eventos de blog conectados; sin PII nueva.
- Dos notas desplegables contextualizan investigadores y su aportación. Keller:
  Journal of Marketing 57(1), 1993, DOI 10.1177/002224299305700101; Oliver:
  Journal of Marketing Research 17(4), 1980, DOI 10.1177/002224378001700405.
  Afiliación/área verificadas en páginas institucionales Dartmouth y Vanderbilt.
  Resúmenes editoriales de las fuentes primarias y copia del paper Keller
  consultados; navegación directa a DOI intermitente. No se afirma revisión
  íntegra del paper Oliver. Sin cifras ni extrapolación causal al relato familiar.
- 78/78 pruebas pasan (incluida prueba de contexto y límites de fuentes); revisión estática independiente sin bloqueos. Nota previa
  76/77 queda como registro histórico, no resultado final. QA remoto pendiente.
- Muestreo local adicional en Chromium mediante marcos de ancho útil exacto:
  320/768/1440, sin overflow. LCP observado 128/120/124 ms, CLS 0. Sin throttling,
  recursos locales y posibles cachés; NO representa rendimiento de red móvil ni
  percentiles de usuarios. HUB revisado visualmente a 390 px. No hay INP de campo.
- **Bloqueo inicial de publicación (resuelto por confirmación):** el control automático rechazó la operación de
  commit/push/PR por contener una recreación identificable derivada de la selfie.
  No se ejecutó ese bloque de comandos. Arturo confirmó expresamente subir la
  imagen derivada identificable al repositorio `donventas/landing` y publicarla
  dentro del artículo en www.donventas.mx. La selfie original queda fuera del repo.
  Se reanuda el release autorizado; comprobaciones remotas y commit se registrarán
  en la PR y en la entrega final. Indexabilidad no equivale a indexación confirmada.

Rollback: revertir el commit de este release retira los nuevos activos y revierte
los cambios de HUB, artículo 02, blog.css, sitemap y llms.txt. Brand Book, PDF, 3D, generación de logos, montaje de marcas
en escenas y fabricación no aplican: se monta un artículo web en familia existente.
