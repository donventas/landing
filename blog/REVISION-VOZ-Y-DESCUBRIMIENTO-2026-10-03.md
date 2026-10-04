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
  Lighthouse/CrUX ni certificación de LCP/INP/CLS: falta comparación de laboratorio
  antes del merge por el cambio de imagen/layout. El presupuesto de bytes no
  sustituye esa medición.
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

Este proceso adapta los criterios de evidencia/narrativa de BSB a Don Ventas; no
declara evolución, sincronización ni instalación transversal en AVOS/BSB.

Pendientes: revisión del preview por Arturo y autorización explícita de merge.
Indexación se comprobará después de una publicación autorizada, no desde el preview.
Sin publicación, el commit productivo continúa siendo `96b2e81`.

Rollback: revertir los commits de esta PR. No hay migraciones, datos nuevos ni
cambios al Portal. Los expedientes editoriales anteriores se conservan como historia.
