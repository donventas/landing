# Revisión de voz, utilidad y descubrimiento

Base: producción `96b2e81`. Rama: `codex/blog-authenticity-workflow`.
Dirección aprobada por Arturo en conversación: aplicar la recomendación al artículo
de criterio, revisar la carta y anticipar estas cuestiones en futuros blogs.
Estado: implementación para preview; aceptación final de texto/release pendiente.

## Artículo 01 — entender el negocio antes de crear contenido

- **Situación:** una persona recibe visibilidad o consultas, pero su oferta se
  entiende mal; busca qué revisar antes de invertir en más piezas.
- **Función:** criterio y confianza; descubrimiento secundario. No pretende resolver
  todas las causas de pocas ventas ni competir como guía completa de agencias.
- **Aporte:** experiencia declarada por Arturo con consultas de créditos cuando el
  producto ofrecía automatización del análisis financiero. No se identifica agencia
  ni se publican datos de clientes, cantidades de inversión o resultados inventados.
- **Edición:** relato → respuesta práctica → preguntas → demostración → decisión.
  Se retiran repeticiones, no el límite de las promesas. 1220 palabras en el cuerpo
  renderizado incluyendo CTA/lectura relacionada; 6 min orientativos.
- **Preguntas:** adaptación del descubrimiento autorizado para una joyería. Se
  reutiliza el método, no sus respuestas, documentos ni información privada.
- **Ejemplo:** redacción ilustrativa etiquetada, nunca campaña probada.
- **Cifra:** CMI/MarketingProfs, estudio 2025 realizado en 2024; 40% sobre adecuación
  del contenido a la audiencia, 980 participantes B2B principalmente de Norteamérica.
  Fuente abierta y metodología consultada; dato autodeclarado, no causal ni mexicano.
  [Fuente primaria](https://contentmarketinginstitute.com/b2b-research/b2b-content-marketing-trends-research-2025).
- **Contrapunto:** consultas equivocadas pueden depender del mensaje, segmentación,
  sitio y seguimiento. No se presenta la agencia como causa única ni se afirma
  que dos meses permitan juzgar toda la estrategia.
- **Intención propuesta:** explicar lo que resuelve un negocio; consultas candidatas
  «cómo explicar lo que hace mi negocio» y «mi contenido atrae personas que no son
  mis clientes». No hay volumen, dificultad ni ranking verificados para esas frases.

## Artículo 00 — El valor no siempre habla por sí solo

- **Situación:** alguien tiene experiencia o una solución valiosa que le cuesta
  hacer entender. Quiere conocer a la persona detrás de la oferta.
- **Función:** origen, identidad y confianza; búsqueda de marca secundaria.
- **Conservar:** historia familiar, trayectoria, lanzamientos, aprendizaje, propósito,
  promesa acotada, título editorial y retrato aprobado. No añadir estadísticas,
  tutoriales o keywords por obligación. La historia ya aporta experiencia propia.
- **Precisar:** enlace visible del autor al perfil que ya figura en JSON-LD;
  siguiente lectura describe la nueva experiencia, no la antigua guía genérica.
- **Cuestionar sin reescribir:** el relato ofrece una interpretación de los
  lanzamientos, no una demostración causal ni una garantía comercial. La frase
  «No prometemos» y el encuadre personal acotan esa lectura. No convertirlo en
  caso de éxito ni retirar matices en futuras adaptaciones.
- **Resultado:** no se toca el cuerpo narrativo aprobado; solo autoría, navegación
  y módulo de lectura relacionada. No reabrirlo para justificar esta revisión.
- **Búsqueda:** conservar título técnico «Por qué nació Don Ventas…» y URL, sin
  competir con la intención instructiva del artículo 01. Demanda no medida.

## Revisión editorial del productor, no prueba con clientes

| Criterio | Carta | Artículo de criterio |
|---|---|---|
| Comprensión | Explica origen, oferta y límites | Responde qué revisar cuando la oferta se malinterpreta |
| Identificación | Situación de valor poco visible, no tamaño de empresa | Confusión concreta y preguntas cotidianas |
| Credibilidad | Historia declarada y autor identificado; sin resultados prometidos | Testimonio separado del estudio y del ejemplo |
| Diferenciación | Conexión familiar, finanzas y construcción de productos | Conecta mensaje, utilidad, capacidad y operación |
| Respeto | Reconoce el valor del oficio | No culpa al cliente ni promete sustituir su conocimiento |

Estas son lecturas editoriales, no puntuaciones de afinidad ni evidencia de ventas.
La identificación, comprensión y confianza de lectores reales permanecen sin medir.

## Consumidores y QA de esta ronda

- Artículo 01, lectura relacionada en carta, resumen/tiempo en HUB y `llms.txt`.
- Metadatos del artículo 01 y autoría visible/schema coherentes. URLs y publicación
  original conservadas. Modificación del artículo 01 fechada en esta revisión;
  sitemap ya declara 2026-10-03, por lo que no cambia artificialmente de día.
- Detectados y corregidos `/#oferta` y `/#prueba`, anclas inexistentes en la landing
  actual. Los tres documentos del blog ahora enlazan a `/#servicios` y `/#trabajo`.
- Precarga del artículo 01 alineada con el breakpoint de 1120 px y mismo srcset
  del img; retirada fuente redundante que podía elegir un candidato diferente.
- Suite local: **43/43 PASS**, incluidos metadatos/schema, autoría, anclas, archivos
  y variantes de imagen de todos los artículos. La comprobación descubre también
  nuevos HTML de artículo en `blog/`; no certifica el contenido por sí misma.
- Browser local: HUB y ambos artículos a 320/390/768/1440 px simulados, sin desborde
  horizontal ni imágenes rotas; un h1 por página. Capturas de portada y demostración
  revisadas. Índice lleva al ejemplo; acceso por Tab al salto de contenido con foco
  visible. No auditoría completa con lector de pantalla ni prueba física.
- Adición posterior solicitada: portada conceptual de confusión de oferta,
  WebP de 23/64/95 KB, versión social JPEG y CSS acotado a esta portada.
  Fuente, prompt y encuadre registrados en `PORTADA-CONFUSION-DE-OFERTA.md`.
  Sin fuentes, JS ni dependencias de producción nuevas. No nueva medición
  certificación de LCP/INP/CLS de campo. La comparación de laboratorio que quedó
  pendiente por el cambio de imagen/layout se documenta en el cierre inferior.
  El presupuesto de bytes no sustituye esa medición.
- `robots.txt` público responde 200 y permite rastreo general y OAI-SearchBot.
  No se cambian permisos de entrenamiento. No se ha comprobado acceso desde IPs
  reales de bots, cobertura en Search Console ni citas en motores de IA.
- Formulario/endpoint/analítica intactos. Suite de leads existente pasa con mocks;
  no se envía un contacto artificial por cambiar texto editorial.

## Workflow y compuertas

`AGENTS.md`, README y aviso en CLAUDE activan `WORKFLOW-EDITORIAL.md` antes de cada
blog. La plantilla de PR exige registro de revisión; GitHub Actions ejecuta la
suite sin secretos y con permiso de lectura. No se cambia protección de ramas:
un check fallido no es un bloqueo obligatorio del servidor salvo que el repositorio
lo configure así. La instrucción operativa sigue siendo no fusionar con fallos.

Portabilidad de CI: usar `node --test` (autodescubrimiento en Node 20/22) y
normalizar solo CRLF→LF antes del hash del SVG canónico. Se verificó que el hash
Linux corresponde exactamente al SVG local normalizado; el logo no se modifica.

Este proceso adapta los criterios de evidencia/narrativa de BSB a Don Ventas; no
declara evolución, sincronización ni instalación transversal en AVOS/BSB.

## Cierre de compuertas — 4 de octubre de 2026

Arturo aprobó el preview `828ba5b` y autorizó producción. Añadió revisión de
indexación, fechas y números: carta = Artículo 01; criterio = Artículo 02.
La secuencia es editorial, no cronológica. El primer merge a producción de la
carta fue `b210135` (2 de octubre); la URL de criterio salió con `85266a3`
(28 de septiembre). Se corrige la publicación de esta última, antes desplazada
al 3 de octubre, y se muestra actualización del 4 de octubre en ambos artículos,
HUB, schema y sitemap. No se refecha una URL antigua como si fuera nueva.

Lighthouse 12.8.2, Chrome headless aislado, servidores locales sin compresión,
móvil 412×823/DPR1.75, red simulada 1.6 Mbps/RTT150 ms, CPU ×4:

| Versión | Rendimiento | LCP | CLS | TBT |
|---|---:|---:|---:|---:|
| Base productiva `96b2e81` | 88 | 2.856 s | 0 | 210 ms |
| Candidata `828ba5b` | 94 | 2.859 s | 0.00017 | 0 ms |

Una ejecución válida por versión en puertos aislados 49173/49174. Diferencia de
LCP de 3 ms: no evidencia de regresión material en esta comparación puntual.
No es prueba estadística ni validación de Core Web Vitals de campo. LCP continúa
por encima del objetivo de 2.5 s en este entorno local; se difiere optimizar el
CSS compartido que bloquea renderizado. TBT no equivale a INP. Los intentos base
en 8773/8774 devolvieron 404 por colisión con otros previews y se excluyeron.
El preview remoto requiere acceso Vercel, por eso no se auditó como página pública
ni se transfirió la sesión. JSON locales conservados en `blog-release-performance`
fuera del repositorio, sin cookies ni secretos.

Search Console, antes del merge: la URL de criterio indica «La URL está en Google»
y «La página está indexada». Tras el despliegue se comprobará la versión pública
y se solicitará nuevo rastreo; solicitud y actualización del índice son estados
distintos. El resultado y el SHA publicado se registran en el cierre de la PR 23.

### Corrección de márgenes solicitada antes de publicar

La captura reveló `padding: ... 0` en `.article-layout`, que anulaba el gutter
compartido. Se limita a `padding-block`, conservando los 20 px laterales mínimos.
La landing tenía 12/16 px en móvil: se eleva a 20 px. También se corrige el título
del diagnóstico y una palabra larga del Centro Legal que desbordaban a 320 px,
sin cambiar el contenido legal ni las preguntas/endpoint. Los recursos CSS
modificados llevan versión nueva cuando hizo falta invalidar caché.

Auditoría de las diez páginas HTML públicas a 320/390/768 px; tras recargar los
recursos corregidos, las cuatro superficies inicialmente afectadas dan 0 px de
desborde y al menos 20 px de margen en párrafos. Carta, HUB, branding y los otros
tres legales ya conservaban márgenes. QA de productor con viewports simulados,
no prueba física ni garantía de todos los navegadores. La prueba de regresión
impide volver a anular el padding horizontal del artículo.

Repetición Lighthouse de la versión final (fechas y márgenes incluidos): 94/100,
LCP 2.858 s, CLS 0.00017, TBT 0 ms. Suite final local: 46/46 PASS.

Rollback: revertir los commits de esta PR. No hay migraciones, datos nuevos ni
cambios al Portal. Los expedientes editoriales anteriores se conservan como historia.
