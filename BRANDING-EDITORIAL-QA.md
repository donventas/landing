# Branding · pasada editorial

Fecha: 4 de octubre de 2026. Estado: implementación en preview, no autorizada para producción.
Base productiva: `771e360285850884d3c02ef64fcc9db4f468b2e1`.
Repositorio editable: `donventas/landing`; rama `codex/branding-editorial`.

## Dirección y alcance aprobados

Arturo aprobó los siete puntos: hero situacional, escena integrada, entregables y
autonomía claros, precios después del valor, enlaces desde home/blog, imágenes ligeras
y revisión de SEO, accesibilidad, medición y formulario. No se modifica Runtime,
Portal, la identidad canónica ni el relato aprobado de los artículos.

Reutiliza la dirección pública aprobada en la landing/blog y Brand Profile v1.4 /
Customer Taste v0.4 (fuente consultada: Runtime `86c606c`, contexto interno, no se copia).
Audiencia: persona cuyo negocio tiene valor pero necesita explicarlo, reconocerse
entre canales o usar su marca con autonomía. No se segmenta por tamaño de empresa.
La preferencia estética sigue siendo hipótesis, no evidencia de conversión.

## Especificación de composición y fuentes

- Adaptación de la familia editorial ya aprobada: Schibsted, Space Mono, negro frío,
  azul funcional y papel. No se importan referencias ni apariencia de otras marcas.
- Hero: título y escena en un marco; dos columnas solo con espacio suficiente.
  En móvil: misma escena completa, transición al texto, sin recortar persona ni manos.
- Piloto expresivo: hero. Piloto utilitario: alcance/precios y diagnóstico real.
- Lectura: márgenes exteriores mínimos de 20 px, texto en HTML, columnas fluidas;
  énfasis azul para la idea principal, no cada frase. Sin movimiento ornamental/3D.
- Imagen conceptual generada con herramienta integrada (no cliente real, no logo
  generado). Arturo aprobó la escena sobre el hombro y su integración el 4 de octubre.
  Se conserva la fuente de generación
  local; web consume derivados proporcionales sin recorte.
- Casos: selecciones ya aprobadas de Arturo Villagomez y Tamanova/Casa Artú;
  ensambles ilustrativos separados de sus destinos públicos y sin atribuir ventas.
- Logo: SVG B6 existente, intacto. El nuevo OG se compone de forma nativa, no regenera
  el logo. Los derivados se identifican por versión y se comprueban en el navegador.
- Consumidores: branding, navegación de home y cierres relacionados de dos artículos.
  Canonical/URL, backend, permisos, legales y relato de ambos artículos protegidos.

Clasificación: refinamiento de presentación + escena derivada candidata, sin cambio
canónico. BSB exige QA independiente y revisión humana; no equivalen a autoevaluación
ni a pruebas automáticas. No hay Brand Book, impresión, nuevos logos o 3D en este encargo.

## Mensaje, evidencia y límites

Marca: hacer visible el valor. Servicio: mensaje, identidad y herramientas utilizables.
Punto de vista: entender antes de diseñar. Historia de clientes: no se inventa.
Precios: bandas existentes, orientativas por proyecto, MXN, sin IVA; sin descuento,
suscripción ni urgencia artificial. Diagnóstico: revisión personal, seguimiento por
correo o WhatsApp, no PDF automático ni plazo no confirmado.

Intención comercial: entender qué incluye un sistema de marca y decidir si pedir
diagnóstico. No se afirma volumen de keywords, ranking ni eficacia ante motores de IA.
Observación previa: URL indexable y reportada como indexada en Search Console;
la nueva versión se verificará tras un release autorizado, no se solicita rastreo del preview.

## QA y publicación

Implementación de preview: `9a13710`. PR: https://github.com/donventas/landing/pull/24.
Preview: https://landing-git-codex-branding-editorial-don-ventas.vercel.app/branding.html.
Aceptación de la escena: aprobada. Aceptación de la página y publicación: pendientes.
No se enviaron datos de clientes reales ni se generaron leads en producción.
Rollback: revertir el commit de esta PR. No se eliminan fuentes ni activos históricos.

### Verificación completada para revisión

- Suite ampliada: 52 pruebas pasan; conserva las regresiones de sitio opcional,
  rechazo recuperable, origen, consentimiento, antispam y envío a almacenamiento simulado.
- Backend `api/`, motor `diagnostico-v2.js` y SVG canónico sin modificaciones.
- Nuevo CSP para branding permite recursos propios y la medición existente;
  no incorpora grabación, cookies, proveedores de fuente ni acceso adicional a datos.
- Revisión independiente de código: expectativa errónea de ruta en un test corregida;
  la ruta real de ambos artículos es `/branding.html`. Riesgo de correo largo en
  error móvil atendido con ajuste de línea.
- Relatos, fechas y autoría de blogs intactos. Solo se añade un enlace contextual
  al sistema de marca en cada cierre, sin reescritura editorial.

### QA visual y funcional

- Browser del usuario, preview autenticado: 320, 390, 768, 1000, 1001, 1280 y
  1440 px simulados, sin desbordamiento horizontal. Márgenes exteriores desde
  20 px. La misma imagen usa `contain` y proporción completa en todos los anchos.
- Se inspeccionaron hero, aplicaciones, precios, FAQ y contacto. No se recorta
  cabeza ni manos. En tableta se limita el ancho de la foto dentro del marco común
  para no extender innecesariamente su altura; el texto continúa en ese marco.
- Teclado: Tab revela «Saltar al contenido», foco visible de 2 px; Enter activa el
  salto. FAQ abre/cierra. La navegación de home a Marca funciona; sin desbordamiento
  a 1121 px (justo sobre su breakpoint). CTA móvil presente.
- Ambos artículos: enlaces contextuales presentes y sin overflow a 320/390/768/1440.
  No se cambió su historia ni fechas.
- Formulario local: recorrido completo de marca (claridad → qué vendemos → redes →
  uso propio → autonomía → respuesta abierta → explorando → alcance por definir →
  contacto). La pregunta de inversión aparece al final, con MXN/IVA. Sitio y WhatsApp
  vacíos aceptados; consentimiento requerido. Se usaron datos ficticios `qa@example.com`.
- El servidor estático local devuelve 501 al POST: se comprobó el mensaje DV-501,
  recomendación preliminar separada de recepción, conservación y botón de reintento.
  No se interpreta como fallo del backend productivo. El reintento vuelve a intentarlo
  sin obligar a recapturar. Estado de error medido sin overflow a 320 px.
- Éxito y validaciones del backend probados por suite con almacenamiento simulado;
  NO se afirma un nuevo envío real a Supabase/correo. Motor y API sin cambios.

### Carga y accesibilidad de laboratorio

Lighthouse 12.8.2, Chrome headless aislado, perfiles móvil predeterminado (red/CPU
simuladas) y desktop. Fecha 4 de octubre de 2026. Mismo checkout y assets.

| Entorno | Rendimiento | Accesibilidad | SEO | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|
| HTTP local sin compresión, móvil | 96 | 100 | 100 | 2.7 s | 0 | 0 ms |
| HTTP local con proxy gzip, móvil | 99 | 100 | 100 | 2.1 s | 0 | 0 ms |
| HTTP local sin compresión, escritorio | 100 | 100 | 100 | 0.6 s | 0.001 | 0 ms |

El proxy gzip comprimió únicamente tipos textuales de los mismos archivos; no
cambió ni simuló imágenes, API o analítica. Esto evalúa compresión, no latencia real
de Vercel. Mejores prácticas 96 por el 404 de `/_vercel/insights/script.js`, que solo
existe en Vercel; no se eliminó ni suplantó la medición para subir la puntuación.
Los informes locales están en TEMP (`dv-branding-mobile-final-lh.json`,
`dv-branding-gzip-mobile-lh.json`, `dv-branding-desktop-lh.json`).

La auditoría externa del preview redirigió a login de Vercel: esos resultados se
descartan, no describen el sitio. La revisión visual del preview sí se realizó en
la sesión autenticada existente; no se extrajeron cookies ni se quitó protección.
Las puntuaciones de accesibilidad corresponden al documento inicial; no certifican
todos los estados dinámicos. TBT no sustituye INP; no hay medición nueva de CrUX/p75.

### Compuertas que requieren el siguiente paso

- Arturo revisa el preview y autoriza explícitamente el merge de este release.
- Tras autorización, verificar producción, cabeceras/OG/canonical y medición sobre
  URL pública (incluido flujo real solo con datos de QA y revisión operativa acordada).
- Search Console: la URL ya figuraba indexada en la revisión anterior. Volver a
  comprobar y solicitar actualización tras publicar, no indexar el preview.
- Commit publicado: ninguno de este release; `main` no fue modificado.

### Activos y trazabilidad

- Fuente aprobada: `exec-1e5912ee-6906-4e04-8474-faaef5e0de1d.png`, conservada
  localmente, SHA256 `37909d5058e7d05d2f9f68b3a951f634e99c174de60c8931811f64c316eb8971`.
- Derivados proporcionales, Sharp WebP calidad 80/esfuerzo 6, sin recortar:
  `branding-owner-v2-480.webp` 42,444 B; `-768.webp` 86,380 B; `-1120.webp` 138,836 B.
- Tres derivados v1 rechazados creados en esta tarea se retiraron; fuentes conservadas.
- Casos: derivados 480/960 de los activos aprobados del portafolio. Sin inventar pruebas.
- OG: `social-cards/branding-editorial.html`, composición HTML nativa renderizada
  a 1200×630; SVG canónico y fuentes propias. PNG 46,432 B. No utiliza un logo generado.
- Prompt de edición aprobado: ver `assets/editorial/branding-owner-v2-source.md`.
