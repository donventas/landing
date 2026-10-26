# Traducción de páginas públicas — release autorizado

## Mandato y fuente

Arturo aprobó facilitar la lectura con Google Translate en las páginas públicas,
con QA móvil y claro/oscuro, y pidió preview antes de publicar. Base publicada:
`083d00e4e8473dd506d589a0e7814a0364f67663`. Rama `codex/public-translation-access`.
Arturo aprobó commit, merge y publicación del selector, incluido búlgaro, el
26 de octubre de 2026, después de revisar el preview. La autorización no equivale
a despliegue: PR, SHA y comprobación de producción se registrarán en el release.
Portal, Runtime y alianza Creactiva
fuera de este delta; las 21 páginas son las del inventario público compartido.

BSB: snapshot verificado `aebf69bddc11cdadacd0bf076fc507c3123426fe`, ruta web /
execute / approved-baseline. Se reutiliza el paquete y fuentes aprobadas de
`appearance-header-control.md`, con sus tokens y controles de foco. No se afirma
frescura del snapshot frente al repositorio AVOS live. Cambio de utilidad,
ensamblaje de HTML y JS local, sin activos gráficos nuevos ni reescritura editorial.

## Comportamiento

- V2 aprobada por Arturo: botón vectorial de idioma inmediatamente antes del
  selector de apariencia en las 15 cabeceras compartidas. ES en escritorio;
  icono de globo con nombre accesible en móvil. Sin un flotante adicional.
- Diálogo nativo: panel compacto en escritorio y hoja inferior en móvil,
  superficies claro/oscuro, foco inicial, Tab circular, Escape, cierre exterior
  y retorno al activador. Un único panel, compartido con el acceso del pie.
- Las seis páginas sin cabecera compartida mantienen el disclosure nativo del pie.
- Acceso Idioma / Language en Explorar donde existe y en el pie de las 21 rutas.
- Disclosure nativo, nueve idiomas (incluido búlgaro / Български, código bg) y enlace externo explícito a Google. No se
  carga Google por abrir la página o elegir idioma. Inglés funciona sin JS.
- URL pública predeterminada por página; no refleja URL actual, parámetros,
  fragmentos, valores del formulario ni origen del preview. No cookies o eventos.
- En suscripción no hay enlace a un traductor externo: se explica la traducción
  del navegador, conservando el token dentro del flujo original.
- Nombres de marca en los wordmarks existentes protegidos con translate=no;
  no se excluyen párrafos completos. No se garantiza traducción perfecta de nombres
  en la prosa. Imágenes no traducidas; aviso explícito junto al enlace.
- Para formularios se indica volver al sitio original. Sin cambios a CSP,
  consentimiento, transportes, canonical, hreflang ni sitemap.

## Preferencia aclarada y límite no resuelto

Arturo aclaró que quiere que la barra **de Google Translate** arranque contraída
en su botón flotante; no pidió un segundo flotante de Don Ventas. El experimento
de flotante propio fue retirado. Se comprobó en navegador que contraer la barra
no cambia la URL y que al recargar Google vuelve a expandirla. No se encontró una
opción documentada que permita configurar ese estado desde el sitio. No se oculta
la barra, se altera su iframe ni se simula el clic con scripts. Esta preferencia
permanece pendiente; el preview no equivale a que se haya resuelto.

## Evidencia y alcance de QA

- Alcance editorial: solo utilidad compartida; historias, imágenes, términos,
  metadatos, canonical y fechas protegidos e intactos por comparación con la base.
  No se vuelve a medir posicionamiento ni se solicita indexación por este cambio.
- V2: 359/359 pruebas completas (28 de traducción), incluida inicialización
  loading/interactive/complete y rama del diálogo. Dictamen técnico incremental:
  APTO para preview; no es aprobación de publicación ni revisión visual independiente.
- V2 navegador: 21 rutas × dos apariencias a 390 px, todas abren sin overflow.
  Cuatro familias × claro/oscuro × 320/1440 px; selección de francés con URL limpia,
  Escape y retorno al botón correctos. Redimensionamiento del diálogo comprobado.
  Evidencia `language-v2-*` y `browser-qa-v2.json` en translation-evidence.
- Las cifras siguientes pertenecen a la primera iteración, no se suman a V2.
- 357/357 pruebas completas, incluidas 26 de traducción. Contratos de recursos
  actualizados de forma explícita; pruebas de privacidad sin relajación.
- Revisión técnica independiente: APTO para presentar preview con el límite
  anterior explícito, no aprobación de publicación. 26/26 pruebas independientes.
- Matriz local: 21 rutas × claro/oscuro a 390 px; sin overflow. Un estado inicial
  transitorio de apertura en el perfil se repitió: apertura y Escape correctos.
- Otras 16 comprobaciones: inicio, servicio, artículo y centro legal a 320/1440 px
  en claro/oscuro, sin overflow. Capturas móviles claras/oscuras y acceso real
  desde Explorar; apertura de selector francés verificada con URL limpia.
- Traducción real de branding público al inglés verificada: Google cambió lang=en
  y el titular. La URL de Google es producción ya publicada, no contenido de este
  preview local. Google no puede traducir localhost. No se enviaron formularios.
- Servidor aislado: sin analítica ni transportes reales; decodifica HTML legal.
  La carga del empaquetador original requerirá validación en preview alojado antes
  de un release. No se afirma validación en dispositivo físico o todos los idiomas.
- Evidencia visual y matriz fuera del repositorio público: directorio hermano
  `translation-evidence`. No copia de documentos privados.

Ayuda de Google: https://support.google.com/translate/answer/2534559 y
https://support.google.com/chrome/answer/173424 . La disponibilidad del servicio
depende de Google y puede variar por región. No implica versiones SEO multilingües.

Rollback: retirar exclusivamente translation.js/css y la integración mecánica
identificada en translation-pages.cjs. No restaurar versiones antiguas del sitio.
