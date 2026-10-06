# Identidad pública de Arturo — 6 de octubre de 2026

## Alcance y autoridad

Solicitud de Arturo: corregir Privacidad y Términos a **Arturo Villagomez Gomez**
y ejecutar la propuesta de identidad, perfil de fundador y conexiones internas.
Rama `codex/founder-identity`, base productiva `ee52a9c`. No incluye PR33 de
analítica, ni modifica su estado o sus compuertas. Preview para revisión; sin
merge, publicación productiva o solicitud de indexación en esta pasada.

## Decisiones y fuentes

- Nombre público: Arturo Villagomez. Nombre completo: Arturo Villagomez Gomez.
  La declaración expresa del titular autoriza la corrección ortográfica legal;
  no se interpretaron ni reescribieron las cláusulas.
- `/arturo-villagomez.html` responde quién es el fundador y autor, su enfoque y
  dónde leerlo. No compite con la landing por la oferta ni sustituye el sitio
  personal. No se creó una nueva biografía de logros o un currículum exhaustivo.
- Texto derivado de la carta fundacional aprobada, definición pública de Don
  Ventas y declaraciones del autor: finanzas, operación, producto y comunicación;
  acompañamiento a más de 20 empresas. No se presenta como auditoría de resultados
  ni se añaden cargos, fechas, empleadores, certificaciones o métricas no validadas.
- Se reutilizan retrato, tipografía, paleta y wordmark de este sitio; no hay
  imágenes generadas nuevas ni referencias de otras marcas. Adaptación editorial
  dentro de la misma familia, con imagen íntegra y contenedor común en móvil.
- Se conserva `https://www.donventas.mx/#quien` como identificador de Person.
  Perfil, landing y autorías lo comparten; URL de perfil propia y `sameAs` al
  sitio personal ya enlazado. La organización no se declara idéntica al fundador.
- Google admite perfiles de autor/persona vinculada al sitio y enlaces de autor
  desde artículos: [ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page),
  [Article](https://developers.google.com/search/docs/appearance/structured-data/article).
  Es marcado para comprensión, no garantía de ranking, indexación o grafía en IA.

## Consumidores y preservación

Perfil, CSS específico, landing, firmas de los tres artículos, HUB, sitemap,
índice auxiliar `llms.txt`, CSP de la nueva ruta, Privacidad y Términos.
Los cuerpos `<article>` de las tres piezas se compararon con `origin/main` y
permanecen iguales. Las publicaciones conservan su fecha original; revisión de
autoría, fechas de actualización y sitemap señalan el 6 de octubre. No se
introdujeron tecnicismos nuevos en los relatos ni se alteraron sus glosarios.
En los documentos legales, comparación exacta con base confirma únicamente
nombre del titular y fecha de revisión cambiados. No es una auditoría legal.

## Verificaciones realizadas

- 100/100 pruebas pasan desde esta base (sin la ampliación de analítica de PR33).
  Cuatro nuevas cubren plantillas legales, identidad semántica, autoría conectada,
  recursos, descubrimiento y CSP. `git diff --check` pasa.
- DOM local: nombre completo corregido dentro del documento legal ya desempaquetado.
- Perfil visto a 1280, 768 y 390 px; geometría adicional a 320 px. Sin overflow
  horizontal observado (ancho útil descuenta scrollbar). Retrato completo y
  recursos cargados. No es prueba en dispositivos físicos.
- Enlace de enfoque abre su sección; perfil → carta → autor regresa al perfil
  del mismo entorno. Enlaces HTML internos relativos evitan salir del preview;
  canonical y JSON-LD conservan el dominio de producción.
- Fuentes y CSS existentes reutilizados. Nuevo HTML: 10,777 bytes / 3,530 gzip;
  CSS: 4,301 bytes / 1,367 gzip. Retrato existente 480 px: 10,440 bytes;
  768 px: 30,328 bytes. Sin biblioteca o JavaScript funcional nuevo; mantiene
  Vercel Insights. Son pesos, no Lighthouse ni Core Web Vitals de campo.
- CSP propia de la nueva ruta con `object-src 'none'`, sin ampliar orígenes;
  no se cambia la CSP de las demás páginas ni se activa Google Analytics.

## Antes y después del release

1. Revisión de texto y preview por Arturo; registrar aprobación del release.
2. Merge y verificación de producción: HTTP, CSP, canonical, enlace desde
   landing/HUB/artículos y nombre legal renderizado. Prueba de resultados
   enriquecidos / Inspección de URL sobre la página pública cuando exista.
3. Solicitar indexación del perfil y recrawl de las páginas modificadas; verificar
   sitemap. No solicitar URLs de preview, anclas ni variantes de nombre duplicadas.
4. En Search Console, comparar consultas por las dos variantes y combinaciones
   con Don Ventas, país/dispositivo y periodo. No hay baseline ni volumen validado
   en esta pasada. Solicitud de rastreo, indexación y posicionamiento son estados
   distintos; no declarar ninguno por aprobar el código.
5. Pendiente en sus superficies propias: enlace recíproco desde web personal y
   perfil profesional verificado. No se modificó ninguno ni se inventó una URL
   de LinkedIn. `sameAs` adicional requiere verificar el perfil correcto.
6. Si PR33 se integra después, registrar la ruta de fundador y su consentimiento
   en el inventario de analítica; este PR no afirma que ya mida eventos GA4.

Rollback: revertir este PR conserva relatos, URLs de artículos y datos comerciales.
AVOS se usó para límites y recuperación de contexto; no se escribió en Runtime,
AVOS, BSB ni Portal. El router no encontró experimento activo.
