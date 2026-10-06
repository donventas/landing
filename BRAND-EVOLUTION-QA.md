# Alineación web · evolución de marca

Implementación del 6 de octubre de 2026. Arturo autorizó el release condicionado
a pasar las comprobaciones de carga. Este registro no sustituye esa autorización.
Base de código: `0b8701a748621b9de2be6a2e9ea623d6400b5660`.
Decisión fuente: Customer Taste v0.4 local aprobado, SHA256
`C97EEB35CACA78E0117BEBBDB425F61B55D3F1C69E62C40B0488B731D01A136F`.
Solo se trasladan decisiones públicas; no se copia el documento interno.

## Contrato de implementación y composición

- Dirección: “Tu negocio evoluciona. Tu marca también debería hacerlo.”
- Se conservan portadas, símbolos, tipografía y familia editorial aprobados.
- Hero integrado con imagen en móvil; escritorio conserva dos columnas cuando caben.
- Seis momentos son entradas de exploración, no seis páginas ni segmentos por tamaño.
- Cuatro servicios concretos; construir/activar/evolucionar no son un paquete obligatorio.
- Acompañamiento opcional: alcance, responsable, frecuencia, capacidad y participación
  del cliente acordados. Recursos utilizables con autonomía.
- No se inventan tarifas de acompañamiento, SLA, resultados o funcionalidades del Portal.
- BSB se usa como control interno de composición y revisión, no como promesa comercial.
- Sin cambios en Runtime, AVOS, Portal, políticas de consentimiento o derechos de autor.

## Aplicación por superficie

| URL | Implementación | Validación |
|---|---|---|
| `/` | Hero, definición, seis momentos, estrategia/identidad/contenido/web, continuidad y contacto neutral | Un H1, cuatro servicios con anclas, nueve secciones de medición conservadas, responsive |
| `/branding.html` | Mantiene oferta/pruebas/rangos por proyecto; continuidad opcional, breadcrumb, diagnóstico de identidad | Schema y enlaces; no suscripción obligatoria |
| `/diagnostico.html` | Ocho preguntas, momento/servicio/modalidad explícitos, presupuesto opcional | Recarga, edición de preselección, error/reintento, reinicio y validación completa |
| `/arturo-villagomez.html` | Definición alineada y medición consentida de la ruta del fundador | CSP, contenido `fundador`, sin datos de contacto en eventos |
| `/blog/` | Servicios en navegación; web llega a su sección, CTA no presupone contenido | Enlaces y cuatro portadas conservados |
| Tres artículos | Navegación coherente y CTA contextual en contenido y marca | No se reescriben relatos, fuentes, fechas ni portadas |
| `/blog/glosario.html` | Breadcrumb estructurado y navegación a servicios | 14 términos, IDs, acordeones y retorno conservados |
| Términos | Descripción de servicios y Portal futuro coherentes | Comprobación del template empaquetado; no es certificación legal |
| Sitemap/llms/social | Mismas 13 URLs y canonicals, descripciones alineadas, tarjetas sociales actualizadas | No migración de dominio ni páginas duplicadas por país |

## Intención de búsqueda: hipótesis, no demanda acreditada

Inicio agrupa estrategia de marca, identidad, contenido y sitios web. Branding
profundiza sistemas de marca, actualización y autonomía. Cada artículo y el
glosario conserva su intención informativa y conecta con una oferta concreta.
No se asignan volúmenes, posiciones ni demanda a estas candidatas. No se crean
páginas por keyword ni se atribuyen consultas reales a una herramienta sin evidencia.
Tras el release, revisar Search Console por página, consulta y país antes de
expandir arquitectura; no sumar métricas solapadas ni prometer citas en IA.

## Compuertas y evidencia

- Base: 131 tests pasaban antes de editar. Candidato: 136 tests pasan.
- Chrome headless local, CSP de producción, seis rutas × cinco anchos:
  320, 390, 768, 1120 y 1440 px. Sin overflow horizontal ni errores JavaScript.
- Formulario: contexto de enlace → cambio de servicio → recarga conserva elección;
  envío sintético 503 → recarga → 200 conserva la clave de idempotencia;
  reinicio vuelve al primer paso. API simulada, ningún lead comercial creado.
- Analytics: consentimiento opcional; perfil emite `fundador` en modo local;
  no peticiones a Google desde el preview. Sin respuestas, nombres o correos en eventos.
- Revisión independiente BSB: detectó y permitió corregir reaplicación del contexto
  y persistencia de la clave de reintento. Migración de exploraciones documentada
  en `ANALYTICS-FUNNEL.md`; no afirmar que la interfaz GA4 ya fue actualizada.
- Marcas protegidas conservan hashes; ninguna imagen de contenido nueva. Las tarjetas
  OG son exportaciones de las plantillas HTML existentes, no nuevos recursos de la página.
- Inspección visual: hero y servicios móvil/escritorio; branding móvil conserva imagen
  integrada y márgenes. Aceptación final corresponde a Arturo.

## Antes del release y después

### Cierre de rendimiento previo al merge

Lighthouse 12.8.2, Chrome headless, móvil simulado (412 × 823, DPR 1.75,
RTT 150 ms, 1638.4 kbps, CPU ×4), almacenamiento nuevo. Archivos del candidato
servidos por HTTP local con gzip y sin caché, conservando la CSP. El preview de
Vercel exige autenticación: no se midió su pantalla de login como si fuera el sitio.
Son pruebas de velocidad de carga, no pruebas de concurrencia ni Core Web Vitals
de usuarios reales. El endpoint local de Vercel Insights devuelve 404; la CDN y
los servicios externos necesitan una comprobación posterior en producción.

| Ruta | Performance móvil | LCP | CLS | TBT |
|---|---:|---:|---:|---:|
| Inicio, dos corridas | 99 / 99 | 2.182 / 2.178 s | 0.000280 | 0 ms |
| Branding, dos corridas finales | 98 / 98 | 2.406 / 2.409 s | 0 | 0 ms |
| Diagnóstico, final | 99 | 1.729 s | 0.000007 | 0 ms |
| Arturo, final | 98 | 2.105 s | 0.000105 | 0 ms |
| Blog, dos corridas finales | 99 / 99 | 2.184 / 2.178 s | 0.000173 | 0 ms |
| Glosario, final | 98 | 2.259 s | 0.000334 | 0 ms |
| Artículo de contenido, final | 99 | 2.029 s | 0.000173 | 41 ms |

Inicio escritorio: 100/100, LCP 0.544 s, CLS 0.000463, TBT 0 ms.
La referencia anterior tiene el mismo árbol que main `0b8701a`: inicio móvil
99/100 y LCP 2.181 s; branding 97/100 y 2.557 s. No hubo regresión de inicio.

Se corrigieron dos costes comprobados antes del merge: descubrimiento tardío de
Space Mono en branding (2.55 → 2.41 s), y `@import` de fuentes redundante dentro
de `styles.css` cuando el HTML ya las declaraba (blog 2.70 → 2.18 s; glosario
2.56 → 2.26 s). Diagnóstico y perfil ahora declaran fuentes en HTML, sin depender
del import. Se versionó la URL de estilos. No se eliminaron fuentes ni imágenes,
no se ocultó el aviso de consentimiento ni se desactivaron scripts para medir.
Una prueba de preload de imagen no mejoró branding y se descartó; el preload
adicional de mono en blog/glosario tampoco se conservó.

Regresión tras el ajuste: cinco páginas × cinco anchos, sin overflow horizontal
ni errores JavaScript; revisión de portada móvil. Los tests cubren descubrimiento
de fuentes y ausencia de importación duplicada. Informes JSON locales de esta
sesión: `dv-release-*.json`; resultados finales distinguidos arriba, sin ocultar
las mediciones previas que motivaron el ajuste.

GTM público consultado: `GTM-M6J49828` sirve la etiqueta `G-YD4BFZTY4V`.
Esto no acredita por sí solo recepción de eventos en GA4 ni actualización de sus
exploraciones. Esa configuración sigue separada de esta publicación web.

1. Revisar preview y aceptar copy, formulario y aclaración de Términos. Los rangos
   de branding existentes se conservan; acompañamiento se cotiza según alcance.
2. Verificar GTM vigente y preparar exploración nueva `route=evolucion`, manteniendo
   separado el histórico. No modificar retrospectivamente sus datos.
3. Solo con autorización de release: merge y smoke de producción; registrar hora del corte.
4. Comprobar canónicas, sitemap y rastreo en producción; solicitar nueva indexación
   de las páginas cambiadas pertinentes. Solicitud no equivale a indexación.
5. Revisar cobertura y búsquedas cuando exista nueva evidencia. No afirmar eficacia
   comercial por aprobar la estética ni usar pruebas locales como Core Web Vitals de campo.

La alineación de documentos internos pendientes se mantiene fuera de este PR del
sitio público. No se publican documentos de marca internos como adjuntos de QA.
