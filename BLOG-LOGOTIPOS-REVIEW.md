# Artículo 05 — Logotipos / candidato de desarrollo

## Release autorizado — 7 de octubre de 2026

- Arturo aprueba los ajustes v6, la frase puente, merge, publicación, pruebas de carga/SEO y el intento de indexación.
- Aplicada la frase puente aprobada antes del primer párrafo de «Tu logo no tiene que contarlo todo». Relato restante e imágenes v6 intactos.
- Corregida la numeración repetida del índice del HUB al incorporar el quinto artículo; enlace de llms.txt colocado con los enlaces canónicos.
- Se reutiliza la evidencia editorial y visual anterior. Esta sección supersede los estados pendientes históricos inferiores; merge, despliegue e indexación se registrarán solo después de comprobarlos.

## Revisión v6 — acabado tonal y lectura

- Aprobación del autor: variar el material frontal hacia gris petróleo, con iluminación amplia e irregular compartida por el wordmark, textura mate conservada, borde menos protagonista y azul reconocible. Solo esta aplicación editorial; sin nuevo master de marca. No regenerar fotografía, copy ni portada.
- Composición editable nativa: `scripts/build-logo-finish-v6.cjs`; geometría/alpha del B6 exactos, posición100/110 y ancho440 conservados, campo luminoso continuo (no color por letra), lateral2px y sombra15%. Foto limpia y capa de texto v5 byte-idénticas; portada v5 intacta. No llamada generativa adicional ni prompt nuevo.
- Maestro `.qa-logos/logo-conversacion-v3-master.png`; prueba `v6-wordmark-material-proof.png`; fuentes, hashes y valores de material en `.qa-logos/assets-v6.json`. WebP480/960/1536: 20,674 / 54,668 / 103,910 bytes. Src/srcset del artículo y pruebas actualizados; variantes anteriores conservadas y excluidas de deploy. Sin cambios Runtime/Portal/AVOS, copy narrativo, URLs, formularios o analítica.
- AVOS sin experimento activo; se reutiliza brief, familia, composición y controles BSB vigentes de v5. QA independiente del maestro: variación continua visible, relieve suave, azul reconocible, sin halos ni deformación.
- Revisión editorial principal e independiente: hook, vocabulario, fondo, versiones, complejidad, contexto operativo y cierre mantienen un hilo claro. Recomendación única, NO APLICADA al relato: antes del primer párrafo de «Tu logo no tiene que contarlo todo», añadir «Y no todo se resuelve eligiendo otra versión: también importa cuánto le estamos pidiendo al diseño». Conecta usos/versiones con complejidad sin abrir otro tema. Conservar el remate «Casi una presentación de ventas, pero dentro de un círculo».
- No añadir puente5→6: «Hay decisiones que no se dibujan» ya prepara branding/manual/sistema; más explicación sería redundante. No cambiar extensión, título, fuentes ni conclusión de la vitrina.
- QA v6: 176 pruebas aprobadas; navegador PASS en24 combinaciones/seis anchos,36 anclas,8 retornos y10 consentimientos. Srcset v3 confirmado en consumidores,7 descargas byte-idénticas y304 local; sin errores JS/peticiones externas/desbordamiento. CLS0; LCP local124–1540ms, una corrida sin throttling, no evidencia de campo. Git diff --check sin errores. Revisión principal e independiente de maestro/capturas390/1440: variación tonal visible (más sutil en móvil), contraste y lectura conservados, sin halos/colisiones/recortes; sin bloqueantes técnicos visuales. Portada, copy y fotografía limpia siguen intactos.
- Vista previa verificada: http://127.0.0.1:8792/blog/logotipos-mitos.html?revision=logos-v6 . Sin merge/publicación; recomendación editorial y aceptación creativa final pendientes de aprobación.

## Revisión visual v5 — centrado medido y acabado editorial

- Solicitud: comprobar centro vertical real del emblema, añadir al wordmark el tratamiento material que faltaba y una frase representativa como la referencia. Se reutiliza «DON VENTAS / CLARIDAD — Haz más fácil entender tu valor.» de la imagen entregada por Arturo, sin nueva promesa comercial.
- Hallazgo: v4 usó y150–515 (mezcla de bordes de profundidad), no la abertura frontal y154–544. El conjunto visible del símbolo estaba centrado en y333.5 frente a y349 de la abertura frontal: 15.5 px alto. Bajar 16 px sin cambiar escala, playera ni personajes. Nueva tolerancia: ±1 px de centro del bounding box visible completo frente al centro de la abertura frontal. Medición sobre raster, aproximación de bordes ±2 px; no reconstrucción métrica 3D.
- Interior: misma fotografía limpia, no regeneración. Wordmark nativo B6 con gris azulado solicitado, microtextura satinada, bisel de luz, lateral 3 px y sombra suave; geometría y fuente vectorial intactas. Firma x100/y110 ancho440; folio/frase a x100/y504, ancho485, sin invadir personas/mesa. Texto también disponible en HTML/alt para accesibilidad en miniaturas.
- Composición nativa editable del proyecto: Node/Sharp y tipografía con Chrome/Schibsted/Space Mono locales. No llamada nueva a imagegen: aplica la excepción de activos nativos/editables, no se sustituye ni regenera la fotografía. Se mantienen reglas AVOS/BSB y fuentes consultadas en v4; sin nuevo relato, marca canónica, formatos, Runtime o publicación. Generación de escena v4 conservada con prompt y fuente.
- Consumidores: portada/HUB/preload/srcset/OG/schema y fotografía interior; nuevas familias v5/conversación-v2. Evidencia y variantes anteriores preservadas. QA visual independiente y aprobación final de Arturo separadas.

### Resultado técnico v5

- Emblema visible y253–446; abertura frontal y154–544. Centro 349.5 frente a349; claros superior99 e inferior98 px. Evidencia anotada `.qa-logos/v5-vitrine-center-proof.png`, nunca consumida por el blog. La medición corrige la afirmación aproximada de v4; no cambia la escala.
- Tratamiento refinado después de diagnosticar un halo: los metadatos internos `premultiplied` del resize de Sharp se estaban reutilizando para bytes RGBA no premultiplicados. Se declara raw solo con dimensiones/canales. Se reducen grano y bisel; sin redibujo del SVG ni efectos sobre personas. Una captura tipográfica agotó 30s; corrida completa repetida exitosamente con timeout60s. No se entregan derivados parciales.
- Maestros `.qa-logos/logo-vitrina-v5-master.png` / `logo-conversacion-v2-master.png`; fuentes nativas y tipografía en `scripts/build-logo-scenes-v5.cjs`; transformaciones, pesos y hashes en `.qa-logos/assets-v5.json`. No nuevos prompts generativos; se reutiliza la escena v4 sin alterar.
- Derivados 480/960/1536 de portada: 17,126 / 40,460 / 73,010 bytes; social75,805. Fotografía: 20,784 / 55,002 / 104,446 bytes. Nombres nuevos, anteriores preservados/excluidos de deploy. Src/srcset/preload/HUB/OG/schema coherentes; SVG y foto compartida de método protegidos.
- 176 pruebas aprobadas; navegador PASS en24 combinaciones y seis anchos, 36 anclas, 8 retornos y10 consentimientos. Srcset,7 descargas byte-idénticas y304 local comprobados; no errores JS, no peticiones externas. SinJS probado. CLS0; LCP local148–1,756ms en una corrida sin throttling, no métricas de campo. Git diff --check sin errores.
- Revisión principal e independiente cerrada: firma/frase/conversación sin colisiones a390/1440; microfolio decorativo secundario y frase repetida en caption/alt. Maestro, portada, HUB y aplicación revisados; centrado confirmado, halos y contornos dentados corregidos, relieve suave y frase legible sin invadir personas. Sin bloqueantes técnicos visuales; aceptación creativa final de Arturo pendiente.
- Preview http://127.0.0.1:8792/blog/logotipos-mitos.html?revision=logos-v5 . Sin commit, merge ni publicación. No cambios Runtime/Portal/AVOS; aprobación creativa de Arturo pendiente.

## Revisión visual v4 — histórica, sustituida por v5

- Mandato: mantener escala v3 de símbolo/playera; elevar el símbolo al centro vertical interior de la vitrina con efecto de suspensión. Reducir y difuminar la sombra en el piso, sin pedestal ni soporte visible. Escena ficticia estática, no modelo 3D ni animación.
- Sustituir la escena interior de método por una conversación conceptual luminosa; personas a la derecha, pared mate clara con espacio negativo a la izquierda. Firma editorial B6 en gris azulado y chevron azul, sin fondo gráfico, sin texto adicional ni impresión en objetos. Referencia del autor: distribución y tratamiento, no copiar identidades.
- Tratamiento cromático solicitado: candidato editorial específico, no nuevo master canónico. Geometría exacta del SVG B6; tono neutral.600 #3C4655 y acento blue.500 #3B74F2 del sistema de color v2.0. Canon en tinta/reversa permanece intacto. Aceptación final del tratamiento y release pendientes.
- Ruta BSB: web + motion-3d (raster estático), protected-mark + generated-branded-image + scene; adaptación de familia aprobada. Se reutiliza brief editorial y evidencias anteriores; no cambios de narrativa/SEO/analítica. AVOS sin experimento activo; Runtime solo lectura. Fuentes y consumidores vigentes verificados antes de componer.
- Geometría: portada 1536×1024; área de vidrio aproximadamente y150–515, cara frontal centrada ópticamente alrededor de y335 con profundidad16. Playera v3 preservada. Interior 1536×1024, firma a izquierda dentro de x90–610 / y170–520, sujetos fuera de la zona, sin recorte en variantes. Probar composición a 320/390 y escritorio antes de entregar.
- Consumidores: artículo/preload/srcset, HUB, OG/Twitter/schema, lámina interior. Maestro y versiones previas se conservan; derivados nuevos y exclusión de supersedidos. Herramientas confirmadas: imagegen integrado para escena sin marca, compositor nativo Node/Sharp para fuentes exactas y navegador local para QA; no despliegue.

### Resultado v4

- 176 pruebas automatizadas aprobadas; QA navegador PASS: 24 combinaciones, 36 anclas por teclado, 8 retornos de glosario, 10 casos de consentimiento; sin errores JS, sin peticiones externas en fixture y sin JavaScript probado. Anchos 320/390/768/1120/1121/1440; srcset y 7 descargas verificados, bytes idénticos y 304 local. Política de caché de producción no comprobada.
- Portada WebP 480/960/1536: 17,130 / 40,348 / 72,974 bytes; social JPG 75,714 bytes. Foto: 17,400 / 46,462 / 91,126 bytes. Foto compartida del método y SVG canónicos sin cambios. No nuevas dependencias de página.
- CLS 0 en seis anchos; LCP local 148–1,384 ms, una corrida sin throttling. No prueba de rendimiento de campo. Git diff --check sin errores; sin referencias activas a portada v3 o foto de método v2 en consumidores del artículo.
- Revisión principal e independiente de maestros y seis capturas portada/HUB/aplicación a 390/1440 px: sin bloqueantes. Símbolo suspendido y centrado, playera discreta, firma cromática legible y conversación visible; sin recortes accidentales, colisiones ni halos. Aprobación creativa final de Arturo pendiente.
- Preview: http://127.0.0.1:8792/blog/logotipos-mitos.html?revision=logos-v4 . Sin commit/merge/publicación. No se modificó Runtime/Portal/AVOS.

### Prompt de escena v4 — imagegen integrado, no CLI

```text
Use case: photorealistic-natural. Asset type: conceptual editorial photograph for a Don Ventas blog about adapting logos to real contexts. Create a NEW wide 1536x1024 photograph. In a bright, quiet contemporary consultation studio, two adult professionals in natural business-casual clothing have an engaged conversation at a pale oak round table, entirely in the RIGHT 60 percent of the frame. Woman with short dark wavy hair in navy and man with cropped dark hair in muted blue shirt, listening and explaining with relaxed credible hands, not looking at camera. Ordinary people, not celebrities, not an actual client case. Left 40 percent is naturally open pale ivory matte plaster wall, nearly uniform in brightness, low texture, no objects, no joints, no shadows crossing it, no window mullions. Reserve a generous completely clear rectangle x90..610 y170..520 for an editorial brand signature to be inserted later. Keep people and table clear of that rectangle. A small ceramic cup and closed unmarked notebook may be on table; very restrained background, one leafy plant at extreme right. Natural soft diffused daylight, high-end candid architectural/lifestyle photography, subtle material detail, believable anatomy, honest proportions. Scene must feel like a continuous real room, not a white panel or split-screen. No logos, text, posters, signage, drawings, decorative typography, watermarks, no huge blank banner, no black backdrop. Horizontal 3:2 full scene with clear balanced hierarchy. Do not add copy. This is a fictional conceptual scene.
```

Compositor reproducible: `scripts/build-logo-scenes-v4.cjs`; maestros `.qa-logos/logo-vitrina-v4-master.png` y `.qa-logos/logo-conversacion-v1-master.png`; integridad y transformaciones `.qa-logos/assets-v4.json`. Fotografía sin marca generada y firma exacta insertada separadamente. Tratamiento plano deliberado: sin sombra/ruido que reduzca contraste ni confunda la firma editorial con un letrero físico.

## Revisión visual v3 — histórica, sustituida por v4

- Portada: símbolo ~30% menor (cara frontal 210 px frente a 300 px), centrado y apoyado en la vitrina; espesor y reflejos más discretos. Firma de playera ~45% menor, centrada en la parte alta del pecho como detalle de prenda premium, no estampado protagonista. Personajes y gestos protegidos.
- Interior: el usuario aclara que busca composición editorial sobre fotografía, como sus referencias, no aplicación sobre papelería. Retirar la carpeta v2. Reencuadrar hacia la derecha la fotografía original completa y generar extensión ambiental a izquierda/arriba; insertar la firma exacta en espacio negativo, eligiendo tinta/reversa por contraste, con tratamiento leve de luz/textura, sin recuadro, sin simular impresión en un objeto y sin titular adicional. Resultado: firma en tinta sobre pared clara, como la segunda referencia del usuario.
- Formato interior autorizado por recomposición: 3:2. Fotografía original escalada uniformemente como unidad; conservar las tarjetas y la mano con el texto 06 parcialmente oculto. No transformar la fotografía de método compartida. Adaptación solo para esta lámina.
- Clasificación: adaptación editorial aprobada, no nuevo canon. Se reutilizan brief, fuentes, controles BSB/ADR-039/042, ejercicio D y evidencias del incremento anterior dentro del mismo alcance. Referencias del usuario: distribución/jerarquía y tratamiento; no copiar personas, claims ni redibujar su marca desde una captura.
- Superficies confirmadas: imagegen integrado y compositor Node/Sharp; consumo HTML y QA Chrome local. No animación, nueva estrategia, acceso a clientes, Runtime, Portal, merge ni publicación.
- Consumidores afectados: portada, tarjeta HUB, imagen social, metadatos/preload, fotografía interior y caption explicativo. Maestro/versiones anteriores preservados. Repetir geometría, lectura móvil, source-to-srcset, carga, QA visual independiente y revisión del autor.

### Prompt de outpainting v3 — herramienta integrada, no CLI

```text
Use case: precise-object-edit / outpainting. Input is a 1536x1024 geometry scaffold: an existing worktable photograph occupies the lower-right rectangle x512..1535 y256..1023, and solid brown placeholders occupy the top and left. Replace ONLY the solid brown placeholder areas with a seamless photorealistic extension of the same scene. Keep the embedded photograph's location, scale, camera angle and composition fixed; do not center or enlarge it. Extend the worn charcoal tabletop and softly lit neutral workshop wall naturally, completing the cropped mug and notebook edges where necessary. Leave the left third uncluttered, with a quiet broad charcoal/neutral field around x50..430 y330..630 suitable for a light editorial logo added later. No bounded rectangular panel, no dark graphic overlay, no new folder, no new props, no lettering, no logo or watermark. Preserve the hand, pencil, plants, cards and their existing printing as photographed, including the thumb covering part of the last label; do not redraw or correct those parts. Match original warm daylight, perspective, grain and shadows so the result is one coherent wide photograph, not a collage. Output exactly 1536x1024, retain the full lower-right scene without cropping.
```

Portada v3 reutiliza la escena limpia v2 y recompone los SVG, sin regenerar personajes. Escena interior: `scripts/prepare-logo-photo-v3.cjs` conserva toda la fotografía original como una unidad; `scripts/build-logo-scenes-v3.cjs` restaura sus píxeles a escala y compone la firma. Permanece evidencia en `.qa-logos/assets-v3.json` y ambos maestros PNG. El crecimiento del derivado fotográfico máximo (1536 px, ~138 KB) corresponde al campo texturado más amplio; presupuesto explícito 150 KB para ese derivado lazy-load, 90 KB para 480/960 y 100 KB para portada. No nuevas fuentes ni scripts en página.

### Resultado v3 — 7 de octubre de 2026

- 176 pruebas automatizadas aprobadas. QA navegador: 24 combinaciones página/ancho, 36 anclas por teclado, 8 retornos de glosario y 10 casos de consentimiento sin salto; cero errores JavaScript, cero peticiones externas en fixture y prueba sin JavaScript aprobada.
- Anchos 320, 390, 768, 1120, 1121 y 1440 px: sin desbordamiento ni recorte; portada y fotografía 3:2. Srcset comprobado a DPR1 y portada móvil DPR2. Siete descargas con identidad de bytes y respuesta condicional 304 local. Caché de producción pendiente de despliegue autorizado.
- Portada WebP 480/960/1536: 17,022 / 40,490 / 72,668 bytes; social JPG 75,729 bytes. Fotografía WebP 480/960/1536: 30,190 / 77,312 / 138,310 bytes. Original compartido de método sin cambios, confirmado por hash.
- Última corrida local: CLS 0 en los seis anchos; LCP 156–628 ms sin limitación de CPU/red. No son métricas de campo ni certificación de producción; existe variabilidad de arranque documentada en v2.
- Revisión principal e independiente completada en maestros y seis capturas de portada/HUB/aplicación a 390 y 1440 px: sin defectos bloqueantes. Escultura proporcionada, firma de playera discreta, logo editorial legible y contexto fotográfico preservado; sin panel, carpeta, halos, colisiones ni recortes accidentales. Copy coherente con la composición. Aceptación creativa final de Arturo pendiente.
- Sin referencias activas a portada v2, fotografía v1, carpeta o photo-safe-zone en artículo/HUB/CSS; activos anteriores preservados y excluidos de despliegue. Git diff --check sin errores.
- Vista previa: http://127.0.0.1:8792/blog/logotipos-mitos.html?revision=logos-v3 . Sin commit, merge, publicación ni cambios en Runtime/Portal.

## Revisión visual v2 autorizada — histórica, sustituida por v3

- Cambio creativo aprobado: escultura del símbolo en la vitrina y firma B6 sobre playera; ejemplo fotográfico integrado a una superficie física, sin recuadro negro HTML. Texto principal, navegación y sistema de marca permanecen protegidos.
- Producción: raster con apariencia tridimensional, no modelo interactivo ni prueba de fabricación. Imagegen integrado prepara escenas limpias; compositor determinista Node/Sharp inserta las fuentes SVG exactas. Sin redibujo generativo de marca. Runtime/AVOS solo lectura.
- Se reutilizan el brief ANC y los controles visuales del incremento anterior. Se añaden ADR-039/042 y ejercicio D de Design/Motion/3D: profundidad para comunicar pieza de museo; impresión para comunicar uso cotidiano. Motion y nueva exploración de referencias no aplican a esta adaptación aprobada.
- Geometría previa: portada 1536×1024; vitrina central intacta, símbolo B completo con cara frontal en su proporción natural y espesor hacia arriba/derecha; playera clara del avatar, B6 centrado en pecho sin invadir cuello o costuras. Oclusión de marca 0; personajes, manos y objetos críticos sin recorte.
- Fotografía 4:3: conservar mano, seis tarjetas y contexto. Probar carpeta de papel clara en primer plano libre de tarjetas; B6 impreso con perspectiva de la superficie, grano y luz del papel, sin fondo independiente del logo. La carpeta es una aplicación ilustrativa propia, no un producto disponible.
- Fuentes protegidas: `assets/brand/donventas-symbol-b.svg`, `donventas-wordmark-b6.svg`; hashes ya comprobados por test. Referencias de escena: clean plate v1 y fotografía `criterio-metodo-01-06-v2-1448.webp`. No reemplazar esta fotografía compartida: crear derivado exclusivo para el blog.
- Consumidores: portada del artículo, tarjeta del HUB, OG/Twitter/schema/preload y lámina de aplicaciones. WebP responsive versionados y JPG social; revisar piezas completas, miniaturas y móviles. QA independiente y aceptación visual final siguen siendo compuertas separadas. No autorización de release.

### Resultado v2

- Implementado: símbolo B como escultura estática con profundidad; firma B6 impresa sobre la playera y sobre la carpeta. La segunda aplicación usa perspectiva y luminancia del papel, no fondo superpuesto. Se elimina `photo-safe-zone` del HTML/CSS. La foto ocupa una fila propia para preservar contexto a tamaño real.
- Portada: `assets/editorial/logo-vitrina-v2-{480,960,1536}.webp` (17,572 / 41,960 / 75,474 bytes); social 77,629 bytes. Foto: `assets/editorial/logo-metodo-v1-{480,960,1448}.webp` (22,994 / 53,722 / 90,706 bytes). Todos los consumidores activos usan v2; exploración v1 conservada y excluida de despliegue.
- **176 pruebas automatizadas aprobadas**. Hash de la fotografía compartida sin cambios. `git diff --check` sin errores. No referencias al recuadro o a portada v1 dentro del blog.
- QA navegador repetido: 24 combinaciones, 36 anclas, 8 retornos de glosario y 10 casos de consentimiento aprobados. Fotografía 4:3 y portada 3:2 sin recorte, srcset comprobado en seis anchos; siete descargas con bytes verificados y 304 local. Cero errores JS y cero peticiones externas en el fixture.
- QA independiente completado sobre 5 maestros/pruebas y 6 capturas de portada/HUB/aplicación a 390 y 1440 px: sin defectos bloqueantes. Logo pequeño pero reconocible en carpeta móvil; explicación accesible fuera del raster. No colisiones ni recortes accidentales.
- Última corrida local: CLS 0 en los seis anchos, LCP 136–376 ms. Una corrida previa v2 registró 19,060 ms en la primera navegación a 320 px y 136–156 ms en las otras cinco. Se conserva la limitación de variabilidad de arranque: estos datos no certifican rendimiento en producción.
- Preview actualizado: http://127.0.0.1:8792/blog/logotipos-mitos.html?revision=logos-v2 . Sin commit, merge, despliegue ni cambios en Runtime/Portal. Aceptación visual de Arturo y aprobación de release pendientes.

## Mandato y baseline

### Prompts de edición v2 — imagegen integrado (no CLI)

**Vitrina limpia:**

```text
Use case: precise-object-edit. Edit target: supplied 1536x1024 3D editorial illustration. Change ONLY the inside of the central glass display vitrine: remove the upright dark rectangular plaque and its small thin rectangular riser entirely, revealing the cream horizontal display floor and unobstructed gallery wall through the transparent glass. Leave the vitrine EMPTY for a sculpture to be composited later. Preserve exactly the framing, glass edges, perspective, full figures, character identities and faces, their gestures, clothing, blank white T-shirt and hanger, barrier rope, pedestal, lights, colors and tactile rendering style. No other changes. No new sculpture, logos, text or decorations. Glass reflections should stay subtle. Output landscape 1536x1024.
```

**Carpeta en la mesa:**

```text
Use case: precise-object-edit. Edit target: supplied editorial worktable photograph. Create a 4:3 photorealistic variant. Change ONLY the small cropped dark notebook in the lower-left foreground: replace it with a slightly larger closed unbranded warm ivory paperboard work folder in the same foreground area, with a subtle fold/spine and natural paper grain. Its visible cover must offer a clear blank patch for a small exact logo to be composited later. No printed design, no text, no logos on this folder. Keep it lying on the table with credible perspective, thickness, lighting and contact shadow. Do NOT overlap or cover any of the six original white cards or the stack labelled 01 PROBLEMA. Keep the hand, thumb occlusion, pencil, all existing photographed cards and their intrinsic printing, coffee, plants, tray, books, table surface, light and original composition unchanged. Do not make the thumb-covered text more visible or resize any card text. No black panel, no floating graphics, no large empty rectangular overlay. The folder is a real physical object in the image, modestly sized, not the whole image foreground. Preserve all other pixels as closely as possible.
```

El script `scripts/build-logo-scenes-v2.cjs` inserta los SVG originales, registra las transformaciones y produce ambas familias responsivas. La fotografía se recompone con los píxeles del original fuera de la zona de carpeta; no se consumen tarjetas o texto recreados por el generador. Fuentes, quads de aplicación, tamaños y SHA-256: `.qa-logos/assets-v2.json`. Maestros reversibles: `.qa-logos/logo-vitrina-v2-master.png` y `.qa-logos/logo-metodo-v1-master.png`. Los v1 se conservan para comparación, sin consumidores activos.

- Arturo aprobó el encuadre, hook, solución operativa e imágenes; solicita desarrollo y generación para revisión, no merge ni producción.
- Landing: `codex/logo-editorial-research`, base `14d58c3`; cambios previos de BACKLOG.md preservados. Runtime, Portal y AVOS en lectura.
- Público: quien prepara, aplica o revisa una identidad; función principal: dar criterio. No ridiculizar al cliente ni exigir rediseño.
- Voz: Customer Taste v0.4 y Brand Profile v1.4 locales. Experiencia declarada de Arturo, fuentes públicas y ejemplos ficticios se distinguen. No anécdotas, diálogos, volúmenes o resultados inventados.
- AVOS: sin experimento activo. BSB ANC v0.1, composición y ADR-039; adaptación editorial y aplicaciones ilustrativas, no modificación del canon.
- Superficies: HTML/CSS, generación integrada y navegador local comprobados. QA independiente y aceptación de Arturo separadas.

## Composición previa

1. Portada 3:2: Arturo con playera y El Don custodiando vitrina; escena ficticia, dos personajes activos. Área frontal libre para insertar firma original, sin perspectiva que cambie geometría. Ilustración generada sin logo, inserción determinista del SVG aprobado. No recortar caras, manos o vitrina. Derivados 480/960/1536; social1200x630 por contain, no recorte.
2. Anatomía: HTML seleccionable, tres especímenes B6, B, B-S con etiquetas; no inventar combinación símbolo+nombre. Familia real versus definición genérica explicitadas. Apilar en móvil sin miniaturizar etiquetas.
3. Aplicaciones: versión clara, reversa y zona protegida sobre fotografía propia ya publicada. Ejemplos ilustrativos, no capturas de un manual ni producción comercial comprobada. Colores y geometría de fuentes intactos.
- Anclas de familia: tinta/papel/azul, Schibsted/Space Mono, folios y notas legibles >=14px. Lectura740px, piezas1120px; campos claros/oscuros por función, no por párrafo.
- Navegación: índice desplegable y progreso existentes, teclado y sinJS; no nuevas dependencias JS. Todos los consumidores de portada reproducen escena completa; social es adaptación con bandas.

## Fuentes y límites

- Adobe, Types of logos and how to use them: terminología; no taxonomía universal española. https://www.adobe.com/learn/express/web/logo-design?learnIn=1&locale=en
- IBM, 8-Bar: variantes positivas/reversas y combinaciones aprobadas; no permiso universal para recolorear. https://www.ibm.com/design/language/ibm-logos/8-bar/
- NASA, Symbols of NASA: disco azul integral como contrapunto. https://www.nasa.gov/history/symbols-of-nasa/
- Henderson y Cote (1998), Guidelines for Selecting or Modifying Logos: resumen consultado; limitar uso a matiz sobre elaboración moderada y reconocimiento, no inferir receta o causalidad universal. https://journals.sagepub.com/doi/10.1177/002224299806200202
- Foros usados solo en investigación de dudas, no como prueba de prevalencia. No reproducir logos ajenos ni material privado.
- Keywords candidatas específicas sin volumen validado. Datos históricos de otras consultas no se transfieren al artículo.
- Publicación y fecha final deben revisarse al autorizar release. No solicitar indexación de preview.

## Prompt de portada — herramienta integrada, no CLI

```text
Use case: illustration-story. Asset type: editorial blog cover, landscape 1536x1024. Generate a NEW scene, not an edit of the references. Reference 1 is Arturo's identity: curly dark hair, subtle facial hair, charcoal shirt and trousers, bright blue monocle. Reference 2 is El Don's identity: ivory spherical head, black horizontal brow and dot eye, blue circular monocle, navy suit white shirt. Preserve their recognizable character designs and polished tactile 3D animated-editorial style, not photoreal humans. Scene: a small contemporary museum/gallery, warm off-white walls and floor. At center a glass display vitrine on a charcoal pedestal, containing an upright plain dark navy rectangular plaque like a treasured exhibit. The front plane of plaque faces camera squarely, flat and unobstructed, roughly centered x=768 y=400, width about300px height220px. Plaque entirely BLANK, no logo, no letters, no drawing: an exact canonical logo will be composited later. Clear view of plaque, no reflections across its center. El Don stands on right of vitrine with one palm gently raised in a humorous protective 'wait!' gesture, looking toward Arturo. Arturo stands on left, actively looking at El Don, eyebrow raised amused/questioning, holding a plain light T-shirt on a hanger forward as if asking to use the exhibit on a real object. Both participating naturally in the same interaction, no looking at viewer. A short blue velvet barrier in front of pedestal reinforces the precious-museum joke but never obscures faces, shirt or plaque. Complete characters with feet, full vitrine and shirt inside frame, meaningful scale with faces clearly readable on a blog thumbnail. Soft warm directional gallery light, coherent contact shadows. Keep uncluttered: only these two characters, the vitrine, one hanger/shirt and barrier. NO text, labels, logos, pseudo-lettering, watermarks anywhere. Neutral cream, charcoal, navy, blue accents. Image is an imaginary humorous illustration, not a real event. Geometry of vitrine rectangular and credible, hands anatomically coherent. Horizontal wide 3:2 composition.
```

## Verificación

### Resultado local v1 — histórico, sustituido por v2 — 7 de octubre de 2026

- Vista previa: http://127.0.0.1:8792/blog/logotipos-mitos.html (servidor local con `X-Robots-Tag: noindex`). No hubo commit, push, merge, despliegue ni solicitud de indexación.
- Artículo de aproximadamente 1,670 palabras / 8 minutos; portada, dos láminas HTML/SVG, índice desplegable, progreso, glosario y lectura relacionada. Metadatos, canonical y BlogPosting/BreadcrumbList verificados estructuralmente; no constituye validación de Google.
- Suite automatizada: **175 pruebas aprobadas**. `git diff --check` sin errores.
- Chrome headless: **24 combinaciones de página/ancho**, 36 enlaces del índice con teclado/foco, 8 regresos desde glosario y 10 casos de consentimiento aprobados. Anchos 320, 390, 768, 1120, 1121 y 1440 px; sin desbordamiento horizontal ni errores JavaScript. Prueba sin JavaScript aprobada.
- Portada sin recorte, proporción 3:2: selección 480 px en móvil DPR1, 960 px en móvil DPR2 y en escritorio de dos columnas, 1536 px en la columna ancha de 1120 px. Descargas idénticas a archivos locales y respuestas condicionales 304 verificadas en fixture local. La política de caché de producción queda por verificar después de un despliegue autorizado.
- WebP 480: 16,182 bytes; 960: 38,240; 1536: 70,708. Social JPG 1200×630: 73,383 bytes. Las dos láminas interiores usan SVG canónicos y texto seleccionable, no mapas de bits adicionales.
- Firma B6, símbolos B/B-S: hashes normalizados a LF iguales a los originales. La portada se generó sin marca y recibió la firma reversa mediante composición determinista, sin cambiar su geometría. El script `scripts/build-logo-assets.cjs` documenta el proceso; `.qa-logos/assets.json` conserva tamaños y hashes.
- Revisión visual principal e independiente: personajes activos y coherentes, tipografía legible, geometría de marca conservada y tarjetas responsive. Se corrigieron artefactos del procedimiento de captura (repintado de progreso al volver al inicio y skip-link en tomas aisladas), sin modificar el comportamiento compartido del sitio.
- **Rendimiento: evidencia de laboratorio local, no certificación de producción.** Tras precargar fuentes, CLS observado 0 en los seis anchos. LCP de cinco anchos: 144–188 ms; primera navegación a 320 px: 10,980 ms. Tres repeticiones independientes a 320 px: 7,588 / 144 / 128 ms, CLS 0 y ninguna descarga individual mayor de 500 ms. La variabilidad de la primera navegación no está explicada; no se descarta ni se presenta como aprobado un umbral LCP de producción. Se debe repetir en una vista previa desplegada/autorizada con condiciones controladas antes del release. No se generó tráfico comercial ni se enviaron formularios a producción.

### Archivos de entrega

- Artículo: `blog/logotipos-mitos.html` y `blog/logotipos-mitos.css`.
- Portada: `assets/editorial/logo-vitrina-v1-{480,960,1536}.webp` y `logo-vitrina-v1-social.jpg`.
- Integraciones: índice del blog, glosario, artículo de manual de marca (solo enlace relacionado), perfil de autor, sitemap y llms.txt. Analytics solo amplía vocabularios cerrados de página/término; consentimiento y filtros no se modifican.
- Evidencia local ignorada por Git: `.qa-logos/browser-report.json`, capturas de escritorio/móvil, maestro compuesto y hashes. Este documento y los scripts de QA/generación están excluidos del despliegue.
- Backlog previo preservado: criterios de un buen logo y por qué el logo no es el primer paso del branding.

### Pendiente de autorización

Aprobación visual/editorial de Arturo, fecha real de publicación, comprobación de rendimiento en entorno desplegado y autorización explícita de merge/publicación. Runtime y Portal permanecen sin modificaciones.
