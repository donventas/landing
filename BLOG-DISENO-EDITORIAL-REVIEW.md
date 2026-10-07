# Diseño editorial — revisión del previo

Fecha: 2026-10-07. Estado vigente: **release aprobado por Arturo; preparado para merge y verificación de producción**. Los registros inferiores conservan los estados históricos de los previos.

## Release autorizado — 7 de octubre de 2026

Se conserva el relato aprobado v3. Ruta pública preparada: `/blog/diseno-editorial.html`. Robots index/follow, canonical, BlogPosting/BreadcrumbList, autor, fechas y OG/Twitter coherentes. Social JPEG 1200×630, 82,565 bytes, derivado sin recorte. Hub, perfil del autor, sitemap y llms enlazan la pieza; analítica de consentimiento incorpora únicamente la ruta cerrada editorial.

Glosario: marketing e identidad visual reutilizan entradas existentes con retorno exacto. Diseño editorial, lenguaje claro, detalle progresivo, jerarquía visual e identidad verbal se explican inmediatamente en el texto aprobado; se conservan esas explicaciones sin agregar nuevas definiciones no revisadas por Arturo. Inventario y orden del glosario recalculados.

Revisión independiente estática: sin bloqueos de contenido; detectó numeración duplicada del hub y atributo de medición faltante, corregidos. Chrome local en 320/390/768/1120/1121/1440: sin desbordamiento, recursos fallidos, errores JS ni solicitudes externas; índice, progreso, notas y ambas ampliaciones preservan texto, foco y posición. La primera prueba de zoom se ejecutó con el aviso de consentimiento superpuesto; repetir tras rechazar explícitamente verificó el recorrido normal sin modificar código del modal. 1,282 palabras de artículo y 1,381 de main.

Carga local sin limitación de CPU/red: HTML DOMContentLoaded ~108–142ms, recursos ~186–217KB; no representa CWV de campo. LCP inicial no disponible en una pasada de 320, por lo que no se declara pase global de LCP. Portada WebP móvil 19,592 bytes / escritorio 50,208 bytes; master excluido de Git y despliegue. No leads enviados ni tráfico comercial fabricado. Merge, despliegue e indexación se registran al verificarse, no se presuponen aquí.

## Revisión vigente: editorial-v3 — relato y páginas carta

Autorización: abrir sección dos desde la experiencia de Arturo al inicio de su carrera, sin la broma de no estar aquí; enlazar ideas entre secciones; demostrar que aplicar identidad no sustituye estructurar el mensaje. Se conserva portada, intención, fuentes y límites. Nuevo texto es experiencia declarada por Arturo, no auditada; evita afirmar que más experiencia cause más errores.

Composición: dos páginas carta (17:22), misma firma B6 exacta, color, tipografía, encabezado, fecha ficticia explícita y folio. No se deforma ni regenera el logo. El antes es profesional pero compacto; el después jerarquiza conclusión, hallazgo, consecuencia y acción. Proporciones y tipografía escalan desde el mismo DOM; la ampliación mueve ese nodo a lienzo 816×1056, sin duplicar contenido. En móvil se apilan; se puede ampliar, recorrer y cerrar mediante teclado o botón. Sin JS el contenido permanece HTML y los controles no funcionales permanecen ocultos.

- Conteo: **1,282 palabras del artículo; 1,382 de main completo**. Se eliminó la enumeración redundante de autores al final; siguen identificados junto a cada referencia en el cuerpo.
- Transiciones: experiencia propia → libro → cliente de seguridad/marketing → distancia comunicativa → recorrido editorial → identidad → IA → revisión antes de enviar.
- La revisión estática independiente confirmó conteos, equivalencia de hechos y ausencia de una generalización causal sobre expertos. Señaló dos aserciones antiguas; actualizadas al texto y formato aprobados. QA visual es del agente principal.
- **181/181 pruebas aprobadas**, `git diff --check` sin errores. Chrome headless en 320/390/768/1120/1121/1440: ambas hojas mantienen 17:22, cero desbordamiento interno y separación positiva del pie. Ampliación 816×1056 con texto idéntico; cierre devuelve DOM/foco al origen. No errores JS, recursos fallidos ni solicitudes externas.
- Capturas de la comparación escritorio y página ampliada revisadas; miniaturas de formato real tienen texto reducido, con botón de 44px para lectura ampliada. La vista ampliada permite desplazamiento dentro del modal, no refluye ni recorta la composición del documento. Se captura además a mayor altura para inspeccionar el folio completo; no confundir ese lienzo con la ventana móvil.
- Imagen sin cambios. Nuevo JS local mínimo para ampliación, sin dependencias ni analítica. Medición local no certifica CWV: la primera pasada registró un paint inicial atípico de12.3s a320, con DOMContentLoaded139ms; no se atribuye automáticamente a la página ni se descarta. Las otras pasadas y recurso siguen registradas en results.json, sin declarar rendimiento de campo.
- Glosario: no se introducen tecnicismos nuevos; definiciones del borrador siguen en el cuerpo. Integración pública del glosario permanece pendiente de release, como en v1/v2.

URL vigente: `http://127.0.0.1:8793/previews/diseno-editorial.html?revision=editorial-v3`.
Evidencia: `C:/Users/artur/AppData/Local/Temp/dv-editorial-preview-v3-qa/`.
No merge, despliegue ni indexación. Aceptación de esta revisión visual/editorial pendiente.

## Registro histórico: editorial-v2 — ilustración y reportes

Dirección autorizada: escena compartida de Arturo y El Don intentando entender un reporte; hero de la familia existente; comparación del mismo contenido, ficticia y legible. Es una adaptación del previo aprobado, no una nueva identidad ni autorización de release. La narrativa anterior se conserva; cambia la demostración comparativa, portada y etiquetas auxiliares.

Composición aprobada en conversación: protagonistas y manos completos, documento como foco, humor sutil sin infantilizar; ilustración 3:2 junto al texto en escritorio y debajo de este en móvil. Título fuera del raster, sin superposición oscura. Interior con dos hojas, jerarquía diferenciada y tres marcadores; reproducción del mismo contenido y adaptación a una columna en móvil. No se copió ni expuso el documento privado: se creó un reporte genérico de catálogo con cifras ficticias. Consumidores afectados: solo este previo, su CSS y sus pruebas; sin cambios a estilos compartidos, hub o artículos publicados.

- Imagen producida con herramienta integrada `image_gen`, usando los personajes de dos ilustraciones aprobadas del sitio. Fuente/prompt y derivados: `assets/editorial/editorial-reporte-v1-PROMPT.md`. Sin logos generados ni materiales de otras marcas. Imagen inspeccionada: ambos personajes atienden el mismo reporte, manos y hojas coherentes, monoclos y vestuario conservados.
- Master PNG conservado en `.qa-editorial/`; derivados WebP sin recorte: 480×320 / 19,592 bytes, 960×640 / 50,208 bytes, 1536×1024 / 94,158 bytes. Hashes en `.qa-editorial/assets.json`. La composición interior sigue en HTML/CSS editable, no es una captura ilegible ni un caso de cliente.
- Conteo final: **1,299 palabras del artículo; 1,399 en main completo**, incluidas portada, índice, detalles, leyendas, referencias y CTA.
- `node --test`: **180/180 PASS**, cero fallos. `git diff --check`: sin errores; aviso normal de conversión LF/CRLF en `.gitignore`.
- QA Chrome headless loopback, sin throttling: **320, 390, 768, 1120, 1121, 1440 px**. Imagen cargada y ratio 1.5 con `object-fit:contain` en todos. Sin desbordamiento, errores JS, recursos HTTP fallidos ni solicitudes externas. Índice por teclado, foco, desplegables y progreso verificados.
- Auto-revisión visual: imagen generada completa, hero1440/390, comparación1440/390. Capturas aisladas de comparación ocultan únicamente la navegación fija y controles para no confundir superposiciones del capturador con el documento; la revisión de página completa conserva la interfaz real.
- QA independiente estático: `editorial_v2_review` detectó el exceso inicial de palabras de main; corregido acortando leyenda/badge. Revisión final confirma 1,299/1,399 y equivalencia de cantidades, riesgos, acciones, PDF y plazos. No incluyó render visual independiente ni ejecución de suite (EPERM en ese intérprete); ambas realizadas por el agente principal.
- Laboratorio local final: DOMContentLoaded 111–223 ms; recursos sin documento principal 176,892 bytes móvil, 207,518 bytes escritorio y 251,478 a1120. Incremento previsto por la ilustración respecto al previo tipográfico. Paint inicial observado 156–244 ms en cinco anchos; a320 no hubo entrada LCP disponible en la ventana de muestreo (cero significa no observado, no carga instantánea). CLS observado hasta ~0.0011. Son observaciones locales iniciales, no medición completa ni certificación de Core Web Vitals/INP en producción.

URL vigente: `http://127.0.0.1:8793/previews/diseno-editorial.html?revision=editorial-v2`.
Evidencia: `C:/Users/artur/AppData/Local/Temp/dv-editorial-preview-v2-qa/`.
Estado: integración revisada, **aceptación visual de Arturo pendiente; no merge/publicación/indexación**. Permanecen pendientes las tareas de release descritas abajo. AVOS no tiene experimento activo; no se registró esta revisión como evidencia de uno.

## Registro histórico: editorial-v1

## Alcance autorizado

Ejecutar la estructura aprobada, máximo 1,400 palabras, con voz personal, ejemplos cotidianos, fuentes explicadas sin jerga y lectura visual variada. No autoriza merge, despliegue ni indexación en esta entrega.

Rama aislada `codex/editorial-deliverables`, base `origin/main` en `0da88d9566a2299971ad064f1b7479b4d8b282d0`. No se modificó el trabajo pendiente de otros artículos.

Previo: `http://127.0.0.1:8793/previews/diseno-editorial.html?revision=editorial-v1`.

## Contenido y composición

- Título: «Diseño editorial: dale identidad a lo que entregas».
- 1,237 palabras dentro del artículo, contando notas, referencias, ejemplo, lectura relacionada y CTA. Todo el contenido de `main`, incluida portada e índice, suma 1,354. Conteo por nodos de texto separados por espacios, incluso detalles cerrados. Lectura estimada: 6 minutos.
- Seis capítulos; alternancia tinta/papel, índice nativo desplegable y barra de progreso compartidos con la familia editorial.
- Portada tipográfica y comparación antes/después nativas en HTML/CSS, no imágenes de texto. No se incorporaron nuevas fotografías ni documentos de clientes.
- La comparación es ficticia, conserva fechas, formato y requisitos; no representa un caso real ni prueba resultados comerciales.
- Experiencias personales tomadas del relato de Arturo; no se afirma haber validado la grabación. Sin proveedor, cliente, hallazgos de seguridad ni datos del archivo privado.
- Reutilización del sistema existente conforme al workflow editorial local y al encuadre AVOS. No se declara una nueva certificación BSB ni una revisión independiente.

## Referencias y límites

Las cuatro lecturas aprobadas se parafrasean: 60 Minute CFO, Rework, Start With Why y Open to Work. Se distingue la aplicación editorial del autor de las ideas de los libros; no hay citas literales inventadas.

Fuentes profesionales enlazadas junto a la idea:

- International Plain Language Federation: https://www.iplfederation.org/plain-language/
- Nielsen Norman Group: https://www.nngroup.com/articles/layer-cake-pattern-scanning/
- Mailchimp: https://styleguide.mailchimp.com/voice-and-tone/
- Ohio State: https://news.osu.edu/the-use-of-jargon-kills-peoples-interest-in-science-politics/
- Publicación científica: https://journals.sagepub.com/doi/abs/10.1177/0261927X20902177

El estudio de jerga trata comunicación científica, no conversión de consultoría; la investigación de escaneo es web, no una prueba sobre PDFs; Mailchimp es una práctica documentada, no evidencia causal de ventas. Estos límites también aparecen en el previo.

## Verificación ejecutada

- `node --test`: 179 pruebas, 179 aprobadas, cero fallos (incluidas tres nuevas para este previo).
- `scripts/editorial-preview-check.cjs`: Chrome headless instalado, ventanas 320, 390, 768 y 1440 px; sin desbordamiento horizontal.
- Índice: apertura por Enter, cierre por Escape, salto a capítulo con foco en encabezado y cierre del desplegable.
- Detalles de fuentes y estudio abren; progreso llega al 100% al final.
- Cero errores JavaScript, respuestas de recursos >=400 o solicitudes externas durante el recorrido de esta página. Se bloquearon peticiones externas preventivamente; no hubo formularios ni tráfico a Google.
- Revisión visual propia de portada escritorio/móvil, artículo completo de escritorio y comparación. Captura de comparación móvil incluye superposición de las barras fijas por el recorte del navegador; el flujo general no desborda.
- Medición local sin throttling: DOMContentLoaded 113–243 ms en la última pasada; recursos transferidos 156,411 bytes, sin incluir el documento principal. No es una auditoría Lighthouse ni medición de Core Web Vitals de producción.
- `git diff --check`: sin errores; los nuevos archivos están sin commit.

Evidencia local fuera del sitio: `C:/Users/artur/AppData/Local/Temp/dv-editorial-preview-qa/` (`results.json`, `hero-390.png`, `hero-1440.png`, capturas completas y comparación). El script usa `PLAYWRIGHT_MODULE` y `QA_BROWSER` para señalar dependencias locales, sin instalarlas ni alterar el entorno global.

## Antes de una publicación posterior

Requiere aprobación visual/editorial del usuario. Mover a ruta pública, integrar hub/sitemap/llms y registro/glosario donde corresponda, fecha real, BlogPosting/BreadcrumbList, imagen social y metadatos completos; aplicar política CSP y analítica conforme a contratos existentes, pruebas del servidor de producción y verificación de despliegue. Evaluar revisión independiente en ese gate; no realizada aquí. Solo entonces solicitar indexación si se autoriza.

Actualmente `noindex,nofollow` más `X-Robots-Tag: noindex` en loopback. La canonical expresa la ruta futura, no afirma que exista o esté indexada. No se enlazó desde el sitio público ni se modificó el sitemap.
