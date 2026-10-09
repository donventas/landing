# Descubrimiento en Google e IA — previo editorial

## Dirección y alcance, 9 octubre 2026

- Base: `origin/main` d8ac851, rama `codex/discovery-ia-blog`.
- Autorización: desarrollar el artículo y la portada, mostrar en desarrollo. No autoriza release, merge, indexación, venta de kit ni formularios nuevos.
- Pregunta protegida: «¿Cómo te encuentra quien aún no sabe que existes?».
- Audiencia: dueños de negocios competentes que dependen de conocidos/recomendaciones y necesitan entender cómo los puede descubrir alguien nuevo.
- Aporte: distinguir búsqueda por problema de búsqueda por nombre, y mostrar un mismo negocio a través de búsqueda web, local y conversacional. No repetir claridad de oferta (contenido), comprensión de entregas (diseño editorial) ni experiencia/recompra (ventaja).
- Voz: Arturo, ejemplos cotidianos, humor del periódico; no inventar experiencia de clientes ni promesas de ranking.
- Acción: ejercicio de cinco preguntas y diagnóstico existente. Kit Google/Maps/IA: hipótesis comercial futura, fuera de la oferta de este previo.
- Producción mixta: imagen mediante herramienta integrada (personajes de referencia autorizados); HTML/CSS por Codex sobre la familia editorial existente. Resultado visual candidato, pendiente aceptación de Arturo.

## Composición antes del montaje

- Portada `se-busca-v1`: 3:2, periódico físico en calle desenfocada. Cabecera ficticia «La Gaceta del Don», titular «SE BUSCA», foto con Arturo y El Don buscando en un mapa.
- Referencia humana: dirección del usuario sobre prensa tradicional/New York Times. Se transfiere la jerarquía periodística y tipografía blackletter/serif; no nombre, logotipo, noticia real ni afiliación a ese medio.
- Identidad: misma ilustración 3D, monóculos cobalto, avatar y mascota del artículo de diseño editorial. No generar ni sustituir marcas oficiales; navegación usa SVG canónico.
- Protegidos: caras, monóculos, titular y cabecera completos. Solo escala proporcional y codificación; sin recortes del hero. El social contiene la imagen con márgenes, no recorta.
- Hero: texto y fotografía en dos columnas amplias; a menor ancho, imagen completa encima del texto. Pregunta principal única; caption con el texto impreso para acceso equivalente.
- Cuerpo: seis capítulos, alternancia carbón/papel, una comparación nativa de tres rutas, una pausa tipográfica y una lista práctica final. Sin añadir imágenes decorativas.
- Consumidores: maestro local, WebP 480/960/1536 (reproducciones), JPEG social 1200×630 con contain (adaptación declarada), hero desktop/móvil. Expansión mediante enlace al WebP completo.
- Presupuesto de lectura: máximo 1,400 palabras en main, ideal 1,100–1,300. Texto principal 18–19 px; notas ≥14 px. Índice desplegable y progreso compartidos; sin JS nuevo de interacción.
- Aceptación: lectura conectada, no colisiones/recortes/desbordamiento a 320/390/768/1440; índice, regreso del glosario, enlaces, recursos y metadatos verificables; respetar noindex.

## Evidencia y límites

| Idea | Fuente | Estado / límite |
|---|---|---|
| SEO sigue siendo relevante para la IA de Google | Google Search Central, ai-optimization-guide | Documentación primaria, consultada 9 oct 2026; no generalizar a todas las IA |
| Búsqueda local: relevancia, distancia, prominencia y elegibilidad | Ayuda Perfil de Empresa 7091 y 3038177 | Primaria; negocio exclusivamente online no obtiene automáticamente elegibilidad |
| Clics 8% frente a 15% | Pew Research Center, 22 jul 2025 | Observación de 900 adultos de EE. UU., marzo 2025; no causal ni estimación de México |
| Ampliar presencia a búsquedas/respuestas con IA | Kipp Bodnar, HubSpot, Loop Marketing | Opinión estratégica atribuida, no garantía; curso declarado por Arturo |
| Acceso del buscador de ChatGPT | OpenAI, Searching the web with ChatGPT | Requisito de elegibilidad, no recomendación garantizada |
| Claude y acceso para búsqueda frente a entrenamiento | Anthropic, Help Center 8896518 | Primaria, consultada 9 oct 2026. Ampliación solicitada por Arturo en este turno; sin ranking de adopción ni preferencia de proveedor |
| Responder preguntas y reducir el riesgo del siguiente paso | Marketing Made Simple, Donald Miller y J. J. Peterson | Paráfrasis de lectura recuperada previamente en Readwise; aplicación propia, no resultado medido |
| Consultas sencillas | Planificador revisado en esta tarea | México, Google, todos idiomas, sep 2025–ago 2026; rangos, no cifras exactas ni demanda en ChatGPT |

Se omiten del artículo datos de cuentas, clientes, transcripciones privadas y estadísticas de cursos sin corroboración. No se reutiliza Open to Work como eje (ya presente en diseño editorial). No equiparar competencia de anuncios con dificultad SEO.

## Entrega y verificaciones

- Ruta candidata: `/previews/como-aparecer-en-google.html`.
- Ruta futura planeada: `/blog/como-aparecer-en-google.html`; no está publicada.
- No cambiar HUB, sitemap, llms, entradas publicadas ni CRM. El glosario puede enlazar al previo solo en el worktree para verificar el regreso; se ajustará al release.
- Independencia: auto-revisión no es QA independiente; evidencia independiente pendiente salvo registro posterior explícito.
- Resultado de pruebas, imágenes, mediciones y limitaciones: ver registro de ejecución siguiente.
- Rollback: rama aislada; producción sigue en d8ac851. No se ha autorizado release.

## Registro de ejecución — discovery-v2

- Implementado y servido en `http://127.0.0.1:8794/previews/como-aparecer-en-google.html?revision=discovery-v2`. Servidor loopback `scripts/editorial-qa-server.cjs`; respuestas de leads simuladas, sin enviar formularios. Analítica rechazada en la revisión; el propio sitio anuncia vista previa sin envío a Google.
- 1,235 palabras en main incluyendo metadatos visibles, índice, notas y CTA. No fecha ficticia de publicación; robots `noindex,nofollow` más `X-Robots-Tag: noindex` del fixture.
- 187/187 pruebas automáticas pasan con Node 20.15.1; cuatro nuevas para este previo. Dos pruebas de HTTP local fallaban inicialmente con `connect EACCES` por aislamiento; pasan fuera del aislamiento, sin cambiar su lógica. `git diff --check` sin errores (avisos de normalización CRLF no afectan contenido).
- HTML 17,665 bytes / 6,456 bytes gzip. CSS específico 4,439 bytes. WebP 480: 34,664 B; 960: 94,930 B; 1536: 192,888 B. Social JPEG 129,962 B. Sin nuevo JS de interacción. Son tamaños, no resultados de LCP/INP de campo.
- Imagen generada con herramienta integrada, referencia de personajes local autorizada. Auto-revisión directa del maestro: cabecera, titular y subtítulo correctos; ambos personajes participan; caras completas, monóculos y ropa coherentes. El periódico es una ficción explícita, sin masthead real de terceros.
- Consumidores WebP proporcionales (sin recorte); JPEG social con contain y márgenes neutros. Maestro, inventario y hashes en `.qa-discovery/`; prompt reproducible en `assets/editorial/se-busca-v1-PROMPT.md`.
- QA visual propio en navegador integrado: anchos 320, 390, 768 y escritorio predeterminado (~1267). Geometría 1440 comprobada; captura con esa sobreescritura excedía la superficie física del navegador, por lo que no se presenta como revisión visual completa a 1440. Sin desbordamiento horizontal ni imágenes rotas en los anchos revisados. Hero íntegro; caption en una columna corregido tras observar una herencia flex.
- Índice abre/cierra; enlaces llevan a capítulos y cierran el desplegable. Teclado Enter abre sobre summary, Escape cierra y conserva foco. Progreso observado 20.27% en capítulo 2 y 79.71% en capítulo 6 (depende de pantalla y scroll, no analítica de usuarios).
- Glosario SEO abre la definición y regresa a `#termino-seo`. Comprobación estable a 390 px: término en y=179.6, barra inferior y=142; visible y no cubierto. Registro del previo oculto con CSS explícito; no se cuenta como artículo publicado. Al release habrá que actualizar ruta, visibilidad y frecuencia.
- Console: sin advertencias/errores en la lectura inspeccionada. Capturas locales en `.qa-discovery/desktop-hero.jpg`, `desktop-routes.jpg`, `mobile-320.jpg`, `mobile-390.jpg`, `tablet-768.jpg`.
- Revisión editorial propia: cada transición retoma la idea anterior; se mantiene un único ejemplo de carpintería, la pregunta central y cierre del periódico. Equilibrio de proveedores solicitado por Arturo incorporado en v2: ChatGPT/OpenAI y Claude/Anthropic, con fuentes primarias diferenciadas; no se afirma un ranking de uso.
- No se realizaron pruebas de usuarios, QA independiente, mediciones de campo, test de tráfico o test en dispositivos físicos. Tampoco se verificó aparición en buscadores: el previo deliberadamente no es indexable. Esas ausencias no se etiquetan como PASS.
- Pendiente: revisión creativa/editorial de Arturo; QA independiente antes de release; autorización separada para merge/publicación. Producción, sitemap, HUB, autor, llms y CRM no se modificaron. Preparar registro de analytics, rutas publicadas, fechas y descubribilidad en el release aprobado.

## Refinamiento aprobado — discovery-v3, 9 octubre 2026

- Mandato: aplicar lenguaje conversacional, presentar fuentes, conectar secciones y añadir comparación visual; Arturo pide separar resúmenes de Google de consultas directas a asistentes. No hay autorización de publicación.
- Contexto reutilizado: misma pregunta central, público, secuencia, portada y familia editorial aprobados. AVOS confirma `NO_ACTIVE_EXPERIMENT`; no se modifica canon ni se atribuye esta revisión a un experimento.
- Evidencia: Pew reabierto y cotejado. 8% y 15% corresponden a clics en enlaces tradicionales con/sin resumen; 1% corresponde a enlaces del resumen dentro de visitas con resumen. No son tasas de conversión, comparación entre proveedores, ni medición de conversaciones en Gemini/ChatGPT/Claude. La idea de que una consulta específica pueda acercar al cliente a comprar queda como hipótesis explícita, separada de hacer clic y comprar.
- Se da contexto a Pew y Kipp/HubSpot. El libro se parafrasea sin «compromiso»; la aplicación al escritorio es nuestra, no un caso documentado del libro. Gemini se distingue de la función de resumen de Google y se enlaza su documentación de fuentes 14143489.
- Glosario: conservar SEO y marketing, reutilizar sus definiciones completas existentes; primer uso útil enlazado y registro seguro del previo ampliado. No crear nuevas siglas AEO/GEO para forzar entradas. «Prominencia», «posición orgánica», «contactos pertinentes» e «indexada» se reemplazan por explicaciones sencillas. Search Console y Perfil de Empresa se explican como herramientas, no como términos nuevos. Loop Marketing es el título enlazado de una referencia, no un concepto que el lector deba aprender.
- Frecuencias recalculadas con `scripts/glossary-frequency.cjs`: sin cambios, ya que el previo no es artículo publicado. Registro de lectura permanece oculto, no se altera HUB, autor, sitemap o llms.
- Composición aprobada: comparación de dos páginas de la misma carpintería ficticia, con igual imagen, marca tipográfica, paleta, dimensiones y calidad de diseño; solo cambian los datos que ayudan a decidir. No se presenta como prueba A/B ni resultado de ventas. Texto HTML seleccionable, sin controles falsamente operativos; elementos de llamada a la acción son muestras, no botones activos.
- Recurso nuevo: fotografía conceptual generada con herramienta integrada; maestro 1536 × 1024, derivado proporcional 640 × 427 de 41,560 bytes. Un mismo URL se reutiliza en ambos paneles y se carga de forma diferida. Prompt en `assets/editorial/escritorio-discovery-v1-PROMPT.md`; maestro en `.qa-discovery/`. Se conserva portada sin regenerar. La habilidad imagegen rige la fotografía; la comparación de interfaz se compone nativamente para preservar legibilidad móvil.
- QA técnico: 189 pruebas automáticas pasan fuera del aislamiento (los dos fixtures HTTP locales necesitan acceso loopback); `git diff --check` sin errores. Añadidas dos pruebas de alcance de Pew y paridad de la comparación. SEO y marketing tienen pruebas de retorno explícito.
- QA visual propio: escritorio de 1102 px y simulados 320, 390, 768 px, sin desbordamiento. Imagen cargada al alcanzar la comparación; dos columnas en tablet/escritorio, una en móvil. Caption calculado 14 px; contenido comparativo 16 px. Se distingue etiqueta ficticia y no se recortan las fotos dentro de los paneles.
- No se midieron nuevos LCP/INP/CLS de laboratorio ni de campo; los tamaños de recursos no se presentan como certificación de rendimiento. Sin scripts de interacción adicionales ni tráfico de prueba comercial. QA independiente y aceptación final de Arturo siguen pendientes.
- Cierre v3: 1,345 palabras en main. Regreso real desde SEO y marketing verificado a sus anclas del previo; nota de Pew abierta/cerrada con Enter. Console sin errores/advertencias en la inspección. Viewport restaurado; tab del previo conservado para revisión. Evidencia local: `.qa-discovery/pew-v3-final.jpg` y `.qa-discovery/comparison-v3-desktop.jpg`. Seis pruebas específicas vuelven a pasar tras el último enlace documental de Gemini.

## Ajuste de padding y continuidad — discovery-v4, 9 octubre 2026

- Corrección solicitada: el override de hasta 760 px quitaba el padding horizontal del caption de portada. Se elimina y se conserva un inset adaptable de 16–24 px, con espacio vertical 18/22 px. Cache key CSS v4; prueba de regresión añadida.
- Continuidad solicitada: el cliente que necesita un escritorio introduce las tres rutas; las rutas combinables llevan a la pregunta sobre el sitio; la metáfora del letrero enlaza con las señales prácticas; encontrar el negocio lleva a elegirlo; el ejercicio final retoma buscar sin nombre. Sin cambiar el argumento aprobado, fuentes, comparativa, hipótesis ni cierre. Main: 1,397 palabras, incluidos índice, notas y llamadas a la acción.
- 190/190 pruebas pasan fuera del aislamiento por los fixtures HTTP; diff check sin errores. Frecuencia del glosario comprobada sin cambios. No se introducen tecnicismos nuevos ni nuevas imágenes/scripts. No hay merge ni publicación.
- QA de geometría en navegador: 320/390/700/768 px sin overflow horizontal; caption con 16/16/17.5/19.2 px por lado respectivamente. Inspección visual del caption a 390 y 700 px, captura `.qa-discovery/caption-v4-700.jpg`. Viewport restaurado. No nueva medición de LCP/INP/CLS ni aceptación independiente.
- Investigación complementaria solicitada, sin incorporar cifras nuevas al cuerpo: [Iannelli y Ai, From Prompt to Purchase](https://arxiv.org/html/2606.10907v1), preprint de Scrunch AI no revisado por pares. Informa usuarios con algún clic de salida (20.7% ChatGPT; 9.5% Gemini), no porcentaje de consultas; dos mercados anglófonos y tamaño de panel no divulgado. Comparaciones entre asistentes confundidas por composición de usuarios; Claude con datos insuficientes. No comparar con Pew ni extrapolar a México. Su observación sobre búsquedas posteriores de marca es una señal de complementariedad, no prueba de ventas o causalidad.
- Contrapunto: [Kaiser y Schulze, Marketing Science](https://pubsonline.informs.org/doi/10.1287/mksc.2025.0489) analiza referencias y compras en comercio electrónico, no el denominador de consultas sin clic. No convertir una tasa de compra tras llegar al sitio en tasa de clic desde el asistente. No hay base aquí para afirmar mayor tasa universal de clic o compra desde IA.
- Se descartan para una cifra destacada: Momentic/Semrush por alternar usuario y visita en el denominador; Focus Digital por presentar benchmarks modelados, no un panel primario de consultas directamente observado. Se mantiene separada la respuesta de investigación al usuario de los datos aprobados del artículo.

## Perspectiva futura aprobada — discovery-v5, 9 octubre 2026

- Arturo aprueba la propuesta e indica no descartar competitividad y relevancia futuras. Se incorpora al cierre como posibilidad estratégica: preparar presencia en buscadores y asistentes puede ayudar conforme cambien hábitos, no garantiza resultados ni anticipa porcentajes de adopción.
- El puente entre secciones 2 y 3 explicita el recorrido aprobado: conocer el nombre en IA y buscarlo después en Google. Se presenta como posibilidad, no como una tasa universal ni prueba causal. No se añaden los porcentajes preliminares al cuerpo.
- Se compactan frases introductorias y presentación de HubSpot conservando experiencia declarada, atribución y explicación de la empresa. Sin tecnicismos nuevos, cambios de diseño, scripts o imágenes. Se conserva el límite de 1,400 palabras y pasan 190/190 pruebas.
- Verificación visual del nuevo cierre en navegador integrado, captura `.qa-discovery/closing-v5.jpg`. Se reutiliza QA adaptable v4 por ser cambio de texto, sin nueva medición de rendimiento ni revisión independiente. Continúa como previo no publicado; aprobación de contenido no se interpreta como autorización de release.

## Release autorizado — 9 octubre 2026

- Arturo autoriza expresamente commit, merge, producción y solicitud de indexación. Se promueve el HTML aprobado a `/blog/como-aparecer-en-google.html`, sin reescribir el relato. Robots index/follow, canonical, fechas reales visibles/OG/BlogPosting, BreadcrumbList, autor y publisher coherentes.
- Integración: séptimo artículo del HUB y su ItemList/índice, perfil de autor, sitemap, llms.txt y vocabulario cerrado de analítica. Sin permisos nuevos de rastreadores ni cambios de consentimiento, filtros GA4 o formularios.
- Glosario: regreso a URL publicada, registro visible, frecuencias y orden recalculados; se elimina soporte temporal de `/previews/` del validador. SEO y marketing siguen siendo los únicos términos enlazados. Prueba de navegador de SEO devuelve a `#termino-seo` de la URL final local.
- Assets finales existentes, sin regeneración. Se excluyen de despliegue maestros, QA, prompts y script de derivados. No se publican capturas de herramientas ni información de clientes.
- Suite de release: 192/192, diff check sin errores. Se actualizan inventarios explícitos de siete artículos/17 URLs; las validaciones de publicación se ejecutan automáticamente también sobre la nueva página. QA adaptable de v4/v5 se reutiliza; inspección local de metadatos/fecha, glosario y HUB añadida. No QA independiente ni nuevas métricas de campo; no se presentan como verificadas.
- Estado en este registro: preparado para commit/PR. El SHA final, despliegue y resultado de Search Console se documentan en la PR tras verificarlos, sin confundir solicitud con indexación efectiva.
