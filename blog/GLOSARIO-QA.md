# Glosario progresivo — piloto editorial

Fecha: 2026-10-04. Base: `b5ef37b50b832b2820e30c85848b897a39baacca`.
Estado: implementación para preview; no autorizado ni publicado en producción.

## Decisión y alcance

Arturo aprobó lenguaje más claro, glosario y revisión de términos con cada nuevo
blog. Los enlaces deben apuntar a la entrada, no al inicio del glosario.
Implementación mínima: enlaces HTML nativos; no ventanas emergentes, scripts,
imágenes, fuentes ni dependencias nuevas. Solo repositorio Landing.

- Workflow 1.2: detectar, simplificar, reutilizar o añadir entrada en la misma PR;
  conservar IDs; revisar contexto; no confundir comprobación mecánica con comprensión.
- Piloto en artículo 03: «operación» se explica como organizar el trabajo;
  «campaña» se sustituye por anuncios y publicaciones. Dos enlaces a marca y promesa.
- 12 términos iniciales presentes en el lenguaje del sitio: branding, campaña,
  contenido, conversión, copy, identidad visual, marca, marketing, posicionamiento,
  promesa de marca, propuesta de valor y SEO. No son consultas de demanda medida.
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

- 84 pruebas Node aprobadas; diff sin errores de whitespace.
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

HTML nuevo: 15,976 bytes. CSS compartido nuevo: ~2.4 KB sin comprimir.
Artículo solo incorpora ese CSS, enlaces y edición breve; mismas imágenes y scripts.
No se incorpora una librería de popups o búsqueda.

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
