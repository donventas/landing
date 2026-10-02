# Auditoría editorial de Landing — Runtime `a650b7e6`

## Alcance y fuentes

- Sitio auditado: `https://www.donventas.mx/`.
- Repositorio editable: `donventas/landing`.
- Base de Landing: `b47c2a1` (`origin/main` al iniciar la intervención).
- Dirección de marca y operación: `FinDataMan/don-ventas-runtime`, `main` exacto en
  `a650b7e6c4931a64dd5674e779ba90296efe9e43`.
- Bloques consultados: 4, 6, 7, 8, 9, 10 y 11.
- Clasificación BSB: refinamiento de presentación y extensión derivada aprobada para el
  símbolo 3D; no se modifica el canon de marca.

## Hallazgos de producción

1. El hero explicaba la oferta y el CTA con claridad, pero la página pasaba demasiado pronto
   a tres tarjetas con precios. Esto reducía el recorrido de valor a una comparación de catálogo.
2. La mayoría de las secciones usaba el mismo peso visual: tarjetas oscuras, bordes y bloques
   equivalentes. La lectura era correcta, pero el ritmo editorial y la jerarquía eran débiles.
3. La prueba llegaba tarde y se distribuía entre seis casos. Algunos eran sistemas o ejercicios
   conceptuales; no debían leerse como resultados comerciales públicos.
4. El diagnóstico prometía un PDF y un plazo fijo de 3–5 días hábiles, aunque la operación
   aprobada depende de revisión humana y conversación personal.
5. SEO técnico, indexación, fuentes locales, documentos legales, Supabase, validación del
   formulario y Vercel Web Analytics ya funcionaban y debían conservarse.

## Dirección implementada

- Secuencia editorial: fricción → criterio → rutas de oferta → prueba → educación → acción.
- Hero de dos columnas con oferta explícita, siguiente paso y símbolo 3D como apoyo, no como
  sustituto del contenido HTML.
- Alternancia de superficies oscuras y papel para variar el ritmo sin romper el sistema B6.
- Tres rutas comerciales sin precio temprano. El presupuesto aparece al final del diagnóstico,
  en MXN y con la indicación de que no incluye IVA.
- Dos pruebas verificables y prioritarias: Arturo Villagomez y Tamanova / Casa Artú. No se
  atribuyen métricas ni resultados comerciales no documentados.
- Un artículo focal en lugar de una cuadrícula homogénea de contenidos.
- Cierre consultivo conectado al motor de diagnóstico existente.

## Trazabilidad de activos derivados

| Activo en Landing | Fuente en Runtime `a650b7e6` | Uso |
|---|---|---|
| `assets/brand/donventas-wordmark-b6-reverse.svg` | `logos/pack/donventas-wordmark-b6-reverse.svg` | Marca canónica en navegación y pie |
| `assets/brand/donventas-symbol-b-reverse.svg` | `logos/pack/donventas-symbol-b-reverse.svg` | Fallback estático del hero |
| `assets/motion/exports/symbol-b-mesh.json` | `landing/motion/exports/symbol-b-mesh.json` | Malla derivada para WebGL |
| `assets/motion/hero-mark-3d.js` | `landing/motion/hero-mark-3d.js` | Entrada editorial, replay y fallback |
| `assets/patterns/relieve-rastro-oscuro.svg` | `patterns/relieve-rastro-oscuro.svg` | Un patrón en el campo visual del hero |
| `assets/editorial/criterio-manos.webp` | `fotos/editorial-conceptual/candidates/criterio-manos-placa.png` | Fotografía editorial optimizada a WebP |

El símbolo 3D gira una sola vez al entrar, se asienta en la vista frontal, permite repetición
manual y respeta `prefers-reduced-motion`. El logo maestro no fue editado ni rotado.

## Promesa del diagnóstico

Se eliminó la promesa automática de PDF y el plazo fijo. La promesa candidata es:

> Arturo revisa personalmente cada solicitud. Si hay información suficiente y existe encaje,
> contacta por correo o WhatsApp con las oportunidades prioritarias y una propuesta del
> siguiente paso.

La recomendación visible sigue siendo preliminar y determinista. El envío continúa usando la
tabla `lead` de Supabase, consentimiento, antispam existente, estados de éxito/error y analítica.

## Compuertas antes de producción

- Validación visual en escritorio, 768, 390 y 320 px.
- Ausencia de desbordamiento horizontal y lectura completa del hero en móvil.
- Teclado, foco visible, movimiento reducido y fallback sin WebGL.
- Formulario: ramificación, sitio opcional, validación por campo, conservación de datos,
  éxito simulado y error recuperable.
- SEO: un H1, canonical, robots, metadatos sociales, JSON-LD válido, `llms.txt`, enlaces y
  archivos indexables.
- Rendimiento: peso de activos, carga diferida, fotografía optimizada y 3D no bloqueante.
- Revisión humana del preview y aprobación explícita antes de fusionar o desplegar a producción.

## Resultado de QA local

- Responsive validado visualmente a 1280, 768, 390 y 320 px; sin desbordamiento horizontal.
- En 390 y 320 px, el símbolo 3D permanece dentro del hero y alcanza a verse en la misma
  escena que la propuesta y el CTA.
- El 3D carga la malla, permite repetición manual y vuelve al frente; el fallback SVG y las
  reglas de movimiento reducido permanecen activos.
- El flujo de contenido recorrió las ramas esperadas hasta contacto. La validación identificó
  correo y URL inválidos por campo, conservó los demás datos y habilitó continuar con URL vacía.
- Pruebas automatizadas: 18/18 aprobadas. Incluyen sitio opcional, forma real del `POST` a
  Supabase con respuesta 201 simulada, error 403 recuperable, SEO, JSON-LD, enlaces locales,
  texto alternativo, privacidad, analítica y hashes de los activos 3D.
- Activos nuevos de mayor peso: fotografía editorial WebP 94.5 KB, malla 3D 66.4 KB,
  referencia Arturo 121.8 KB, referencia Tamanova 173.5 KB y retrato 149.1 KB. Las imágenes
  bajo el primer viewport usan carga diferida; el patrón del hero pesa 1.3 KB.
- La única respuesta 404 en el servidor local corresponde a `/_vercel/insights/script.js`,
  una ruta que Vercel sirve en preview y producción. No se detectaron referencias locales rotas.

Estado: **candidato listo para preview, no autorizado para producción**.
