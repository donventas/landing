# Artículo 04 — revisión para preview

Fecha de preparación: 7 de octubre de 2026. Rama: `codex/manual-brand-blog`.
Base: `origin/main` en `91822b7`. Este registro no autoriza el release.

## 1. Pieza y propósito

`/blog/manual-de-marca.html`: «Manual de marca: el manual que más vale no perder».
Ayudar a quien quiere compartir las decisiones de su marca, coordinar colaboradores
o preparar una nueva etapa. Pieza de criterio y descubrimiento; no tutorial exhaustivo
ni promesa de resultados. Lectura aproximada: 7 minutos.

## 2. Aporte propio y texto protegido

Se conserva el relato aprobado, su analogía cotidiana, la experiencia declarada
de Arturo construyendo Don Ventas y la distinción entre branding, manual y sistema.
Se incorporan las cuatro correcciones editoriales aprobadas: transición a la
experiencia propia, confirmación de formulario impersonal, transición entre los
tres conceptos y CTA de autonomía/nueva etapa. No se añaden clientes, cifras,
anécdotas ni resultados. Dos láminas HTML adaptan la relación entre personalidad,
claridad, dirección y oferta; se identifican como explicaciones, no capturas.

Ajuste posterior aprobado: «El de tu marca merece estar donde sucede la acción»
en bajada, cierre, Open Graph y títulos auxiliares del cierre. Cambio solo de texto;
se vuelven a comprobar tests, glosario y reflujo320/390/768/1440. No añade recursos
ni modifica layout; no se vuelve a medir rendimiento por este ajuste.
Las dos láminas interiores no convencieron al autor: siguen provisionales y no se
consideran aceptadas para release. Su reemplazo se plantea antes de ejecutarlo.

### Revisión de piezas y navegación — especificación previa

Mandato del 07-oct: reemplazar ambas láminas y mejorar el ritmo/navegación.
Baseline: `aa4085a`. Texto, portada v3, SEO, rutas, glosario y consentimiento
protegidos. Solo Landing editable; Runtime/Portal/AVOS en lectura. Sin release.
AVOS/BSB: refinamiento de presentación (A) y ejemplos derivados (B), no cambio
canónico. Reutiliza el brief editorial aprobado; no abre una nueva narrativa.
No experimento activo. HTML/CSS nativo y Chrome local son superficies confirmadas.

Composición antes de ensamblar:

- Pieza 01, `manual-interior-v2`: apertura editorial de dos páginas, firma/paleta
  a la izquierda y voz a la derecha, con tres notas fuera del espécimen. En móvil
  se apilan, sin miniaturizar ni recortar texto. Fragmentos exactos recompuestos,
  no captura ni reproducción integral del manual. Todo el texto es seleccionable.
- Pieza 02, `manual-aplicaciones-v2`: presentación horizontal, publicación cuadrada
  y fragmento web; distinta jerarquía para argumento, observación y exploración.
  Ejemplos ilustrativos con dirección aprobada, no artefactos históricos ni
  resultados. Firma B6 íntegra; foto de método ya publicada, completa en 4:3.
- Márgenes internos 24–40 px; cuerpos de anotación >=14 px; sin solapes, giros,
  perspectivas o recortes de logos/documentos. Piezas hasta1120px; lectura740px.
- Ritmo: apertura oscura; definición/criterios sobre papel; experiencia oscura;
  coherencia sobre papel; sistema oscuro; prueba sobre papel; cierre oscuro.
  El cambio de campo separa tareas, no cada párrafo. Solo negro/papel y azul.
- Navegación: índice nativo desplegable compacto, accesible en móvil y escritorio,
  fijo durante la lectura, con cierre al elegir sección y Escape. Siete destinos
  estables, foco al encabezado y margen libre bajo ambas barras. Sin scroll-jacking.
- Derivación: folios, contraste de campos y jerarquía de los blogs de Don Ventas;
  reglas de color/voz del Brandbook, no otras marcas o galerías. Movimiento nuevo
  N/A. Marca nueva, PDF, Office, escenas físicas y export raster N/A: entrega web.
- Consumidores: artículo y sus dos piezas, escritorio/móvil son adaptaciones
  responsivas de un solo DOM. HUB/OG/hero sin cambios; probar sus regresiones.
  Revisión individual y colección, teclado/sinJS/zoom, carga y consentimiento.
  Revisión independiente requerida por BSB; aceptación creativa final de Arturo
  y autorización de producción permanecen separadas.

Fuente read-only: Runtime commit `19a55a24a93716d4f5407653a0968b70b32f41e5`,
Brandbook secciones voz/logo/color; sin cambios locales en ese archivo al leerlo.
SHA256 HTML `b5ae89f4ba3e7c766d629d7ee457469f23e7dfcd07faa761ffc2575259fed289`.
Firma B6 reversa existente, byte-idéntica a Runtime:
`c3a0810940289164ff5a40b3ac2524de10d43d12c98743ad41c4089aedb8a90a`.
No se exporta el libro, sus enlaces internos, clientes o expedientes privados.
Usos autorizados: solo los fragmentos propios y aplicaciones ilustrativas aprobadas.

## 3. Fuentes, permisos y límites

- *Click: How to Make What People Want*, Jake Knapp con John Zeratsky.
  [Ficha editorial](https://www.simonandschuster.com/books/Click/Jake-Knapp/9781668072110).
- *Creativity, Inc.: Overcoming the Unseen Forces That Stand in the Way of True
  Inspiration*, Ed Catmull con Amy Wallace.
  [Ficha de la coautora](https://www.amy-wallace.com/creativity-inc).

Los pasajes del lector se comprobaron durante la revisión de referencias aprobada;
se parafrasean sin fingir citas literales ni número de página. Los enlaces públicos
verifican la obra y autoría; la aplicación a Don Ventas es del autor del artículo.
No se publican exportaciones ni enlaces privados del lector o documentos internos.

Contrapuntos conservados: coherencia no es repetición; un manual no sustituye la
experiencia; el alcance depende del uso; actualizar no obliga a empezar de cero.

## 4. Intención de búsqueda

Principal: qué es y para qué sirve un manual de marca. Secundaria: relación con
branding y sistema de marca. Dato facilitado por Arturo: Keyword Planner, México,
Google, todos los idiomas, septiembre 2025–agosto 2026; «manual de marca» en el
rango 1 mil–10 mil búsquedas mensuales. No equivale a visitas obtenibles ni a
dificultad orgánica. No se suman variantes como demanda independiente. La página
comercial de branding y las URLs anteriores se conservan.

## 5. Comprensión y lenguaje

Definición temprana, ejemplos de tareas reales y cinco preguntas de revisión.
Se distinguen explicación, ejemplo y experiencia propia. No se infantiliza al lector.
El humor está en perder el manual, no en incapacidad del cliente.
Glosario: se añade «Manual de marca», se reutilizan «Branding» y «Sistema de marca»
y se prueba retorno al punto exacto de lectura. Logo, paleta y jerarquía se entienden
en su contexto; no se multiplican enlaces decorativos. Frecuencias recalculadas
por presencia léxica en cuatro artículos, no por demanda de búsqueda.

## 6. Consumidores y alcance técnico

Artículo y CSS aislado; portada responsive y OG; índice de Ideas y su ItemList;
glosario; perfil de autor; lectura relacionada en «Tu marca es tu ventaja»;
sitemap y llms.txt. Se registra únicamente el identificador `manual` y dos términos
en el vocabulario cerrado de analítica existente. No se cambia consentimiento,
GTM, formularios, API, servicios, robots ni páginas legales.

Corrección adicional solicitada durante el preview: aceptar/rechazar la analítica
enviaba el foco al botón de preferencias del pie y provocaba scroll hasta el final.
La primera elección devuelve ahora el foco a `main` con `preventScroll`, eliminando
su tabindex temporal al salir. Reabrir preferencias sigue devolviendo el foco al
control que las abrió, también sin desplazar la lectura. No cambia qué se mide
ni cuándo se permite medir.

Metadatos: un H1, autor enlazado, canonical de producción, BlogPosting y
BreadcrumbList coherentes. No se declara indexación o rich result comprobado.
La fecha editorial es de preparación del candidato; revalidarla al autorizar
release si se publica en un día distinto.

## 7. QA del baseline anterior (conservado como historial)

- `node --test`: **153/153**; `git diff --check`: sin errores.
- Chrome headless, laboratorio local con CSP del repositorio y noindex de fixture.
- 40 combinaciones: 5 páginas × 320/390/768/900/901/1120/1121/1440 px; sin
  overflow horizontal, un H1, imágenes disponibles y enlaces locales comprobados.
- Revisión visual propia de portada desktop/móvil, láminas, referencias y tarjeta.
- Teclado: notas y tres enlaces de glosario con regreso al término. Dos pestañas
  conservan orígenes independientes. Sin JS: definición nativa y retorno a lecturas.
- Reflow de zoom 200% simulado a 720 CSS px; no es prueba con un teléfono físico.
- Aviso de analítica: 24 casos de navegador (inicio, branding y artículo;390/1440px;
  aceptar/rechazar; scroll0/1500px) conservan exactamente la posición. Preferencias
  reabiertas con teclado regresan a su control de origen.
- No hay scripts nuevos en la página. Cero errores JS o solicitudes externas en QA.
  CTA abre el diagnóstico con integrar/identidad; no se envían leads reales.
- WebP: 480 px **20,338 B**; 960 px **52,326 B**; 1536 px **101,646 B**.
  OG JPEG: 1200×630, **84,168 B**; escena completa contenida, sin recortar personajes
  ni manual. HTML del artículo: aproximadamente 25 KB sin comprimir.
- Móvil390 DPR1 carga 480; DPR2 carga960; una sola descarga de portada por visita.
  Proporción3:2, dimensiones explícitas y object-fit:contain. Láminas no añaden descargas.
- Descarga íntegra por bytes, ETag/304 y política existente de caché604800 s
  verificados en fixture. CDN real pendiente de preview.
- Última tanda de tres cargas frías,390×844 DPR2, CPU4×, latencia150ms,
  descarga200,000B/s, Chrome CDP. Artículo: LCP **1.332–1.444s** y
  CLS **0.000447**. Comparador existente «Tu marca es tu ventaja»: LCP
  **1.400–1.416s**, CLS **0.000727**. Datos de laboratorio, no p75 de campo,
  no certificación Core Web Vitals ni prueba de concurrencia. INP de campo no medido.
- Los screenshots y JSON reproducibles quedan locales en `.qa-manual/`, ignorados
  por Git y despliegue. El runner y este documento también se excluyen de Vercel.

Referencias técnicas revalidadas:
[Article de Google](https://developers.google.com/search/docs/appearance/structured-data/article)
y [Web Vitals](https://web.dev/articles/vitals). Disponibilidad y pruebas locales
no prueban indexación, resultados enriquecidos, rankings o resultados comerciales.

### QA de piezas y navegación v2 — 07-oct-2026

Esta tanda sustituye los resultados de layout/carga de arriba para el candidato
actual. 153/153 tests; inventario del glosario consistente; diff sin errores.
Chrome headless local: 40 combinaciones de cinco páginas y ocho anchos, sin
desbordamiento; 42 saltos de índice con teclado en320/390/700/701/768/1440,
foco H2 y encabezados descubiertos, Escape y cierre exterior correctos.
Sin JavaScript, el índice nativo pasa a flujo normal y mantiene enlaces operativos.
24 pruebas de consentimiento conservan scroll y devolución del foco; tres regresos
de glosario, dos pestañas y CTA sin envío real. Cero errores JS/peticiones externas.

Ambas piezas revisadas individualmente en390/1440 sin la interfaz fija tapando la
captura; además, viewport con interfaz intacta y recorrido completo para la colección.
La apertura se conserva; bandas papel/negro separan explicación, ejemplo, sistema
y prueba. Textos del cuerpo fuera de figuras permanecen intactos.
Revisión independiente: agente `manual_visual_qa`, fuente + Chrome320/390/1440
y cuatro capturas limpias. Corrigió y volvió a comprobar foco al saltar y contraste
del foco en los cuatro campos claros (`#1B49A0`). Sin hallazgos bloqueantes restantes.
Aceptación estética de Arturo pendiente; esto no la sustituye.

HTML27,672B, CSS10,414B y JS acotado2,112B sin comprimir. El JS solo mejora el índice;
sin dependencias, rastreo o almacenamiento nuevos. Firma reutilizada y foto de método
existente en carga diferida; portada y sus pesos sin cambios. DPR1/DPR2 de portada
siguen480/960, una descarga, foto del método completa4:3. ETag/304 y bytes de portada
verificados en fixture. Runtime leído sin escribir ni exportar el manual completo.

Tres cargas frías con las condiciones anteriores: LCP1.520–1.700s,
CLS0.000447; control1.380–1.416s/CLS0.000727. Es un incremento de coste de carga
respecto al baseline, no se declara mejora de velocidad. Laboratorio local,
sin evidencia nueva de INP/p75, tráfico concurrente ni CDN real. Preview local8791
responde200 y contiene las dos piezas/índice actualizados. Preview remoto sujeto
a protección de acceso; producción y su caché no se han tocado.

## 8. Estado y compuertas

Texto: aprobado previamente. Ejecución: preparada en rama aislada. QA: autorrevisión
técnica/editorial y revisión independiente acotada de piezas/navegación v2. Imagenv1 rechazada por
postura desconectada; imagenv2 rechazada por deformación de caja; **imagenv3 candidata**
con búsqueda detrás del mueble. Aceptación visual de Arturo: pendiente.
Merge, producción e indexación: NO ejecutados. Reversión mediante el commit de la PR.
Runtime/Portal/AVOS no modificados. Revalidar metadatos de fecha en el release.

## Portada: procedencia y reproducción

Motor: herramienta integrada `image_gen` (skill imagegen), sin CLI/API adicional.
Concepto y cambio de pose autorizados por Arturo. Se emplean las bases existentes
de Arturov4 y El Don moderno; no se rediseñan los personajes ni se altera su canon.
La versión seleccionada se codifica con `scripts/build-manual-assets.cjs`.

SHA256 de referencias consultadas en modo lectura:

- Arturov4: `a4ca255110161144beac9e386702d230a2617a8ea7445082084a40bd1f470cdb`.
- El Don moderno: `ab6f89ea33847a3a3be2904462f4b4c6b1130c273237fc5ee8df49b3641bf029`.
- PNGv3 seleccionado: `6ef7768cd3b8a40cf8f84e9047353beb42a3e65a04a16c7b88e6eed5a3085bb1`.

Archivos finales: `assets/editorial/manual-busqueda-v3-{480,960,1536}.webp`
y `assets/editorial/manual-busqueda-v3-social.jpg`. El PNG maestro queda local.

### Prompt final de corrección (sobre la portada original)

Edit the attached ORIGINAL illustration, not the previous edit. Change ONLY the human Arturo's pose so he is actively searching for missing instructions BEHIND THE WOODEN TABLE, not in the cardboard box. Keep his recognizable face, curly hair, blue monocle with dangling stem on same side, charcoal clothes, black shoes, body proportions. Put down the panel he was holding. He kneels on the left side of the small table and bends his torso sideways/backward to PEEK DOWN BEHIND THE FURNITURE, looking at the floor behind it; one hand rests lightly on the wooden tabletop, other hand supports his balance on the floor left/behind the table. Face in natural three-quarter profile, eyes clearly directed into the gap behind the table, curious mildly puzzled searching expression, NOT smiling at camera. Natural human posture, furniture physically unchanged. CRITICAL LOCKED REGIONS: cardboard box including ALL its flaps and rectangular geometry, instruction booklet under its FRONT flap, and El Don modern mascot searching INSIDE box on right must be UNCHANGED from this original. Arturo must NOT touch, lift, bend or extend the box or its flaps; his entire action stays LEFT OF the box and relates only to the wooden furniture. Two distinct search locations: Arturo looks BEHIND THE TABLE, El Don looks INSIDE THE BOX. Keep original room/background, 3:2 landscape framing, lighting, materials, wooden panels and tools. No extra props, text, logos or speech bubbles. Do not distort box or furniture to accommodate pose. Preserve booklet as comic reveal visible to viewer but unnoticed by characters.
