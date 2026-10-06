# Alineación web · evolución de marca

Implementación para revisión, 6 de octubre de 2026. No autoriza producción.
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
