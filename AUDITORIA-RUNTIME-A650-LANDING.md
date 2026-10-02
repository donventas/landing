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
| `assets/editorial/criterio-manos.webp` | `fotos/editorial-conceptual/candidates/criterio-manos-placa.png` | Placa limpia original, optimizada a WebP |
| `assets/editorial/criterio-manos-etiquetas.webp` | Derivado de la placa limpia anterior | Fotografía funcional con seis etapas del método impresas en perspectiva |
| `assets/editorial/criterio-manos-metodo-01-06.webp` | Derivado de la fotografía etiquetada anterior | Versión final con orden explícito `01–06` |

El símbolo 3D gira una sola vez al entrar, se asienta en la vista frontal, permite repetición
manual y respeta `prefers-reduced-motion`. El logo maestro no fue editado ni rotado.

## Promesa del diagnóstico

Se eliminó la promesa automática de PDF y el plazo fijo. La promesa candidata es:

> Arturo revisa personalmente cada solicitud. Si hay información suficiente y existe encaje,
> contacta por correo o WhatsApp con las oportunidades prioritarias y una propuesta del
> siguiente paso.

La recomendación visible sigue siendo preliminar y determinista. El navegador ya no escribe
directamente en Supabase: envía a `/api/lead`, donde se validan origen, tamaño, campos,
consentimiento, tiempo de llenado, campo trampa, frecuencia e idempotencia antes de registrar.

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
- Pruebas automatizadas iniciales: 18/18 aprobadas. La ronda técnica posterior amplía la suite
  y sus resultados quedan registrados en la sección siguiente.
- Activos nuevos de mayor peso: placa limpia WebP 94.5 KB, fotografía etiquetada WebP 106.3 KB,
  fotografía numerada final WebP 108.3 KB, malla 3D 66.4 KB,
  referencia Arturo 121.8 KB, referencia Tamanova 173.5 KB y retrato 149.1 KB. Las imágenes
  bajo el primer viewport usan carga diferida; el patrón del hero pesa 1.3 KB.
- La única respuesta 404 en el servidor local corresponde a `/_vercel/insights/script.js`,
  una ruta que Vercel sirve en preview y producción. No se detectaron referencias locales rotas.

Estado: **candidato listo para preview, no autorizado para producción**.

### Derivación de la fotografía del método

La versión con etiquetas fue creada mediante edición raster integrada, sin modificar la placa
fuente del Runtime. La instrucción final fue imprimir exactamente `PROBLEMA`, `CLIENTE`,
`MENSAJE`, `EVIDENCIA`, `CANAL` y `SIGUIENTE PASO` sobre los papeles existentes; conservar
encuadre, mano, lápiz, objetos, iluminación y sombras; usar tinta carbón y reservar el azul
`#3B74F2` para `SIGUIENTE PASO`; no añadir logotipos, objetos, marcas de agua ni más texto.

Una segunda edición añadió el orden exacto `01 PROBLEMA`, `02 CLIENTE`, `03 MENSAJE`,
`04 EVIDENCIA`, `05 CANAL` y `06 SIGUIENTE PASO`, manteniendo sin cambios la escena, la
perspectiva y la jerarquía cromática aprobada.

## Ronda técnica de siete puntos — 2026-10-02

Clasificación BSB: `PRESENTATION_REFINEMENT` de la Landing; el símbolo, wordmark, fotografía
aprobada y dirección editorial permanecen protegidos. No se incorpora otra apariencia de marca.

1. **LCP y CLS:** las fuentes Schibsted se precargan desde el mismo dominio y usan carga opcional
   para impedir un intercambio tardío. El wordmark declara la proporción intrínseca real.
2. **CSS de la portada:** `index.html` dejó de cargar los estilos de páginas históricas y usa
   `home.css`, una hoja específica de 30.6 KB frente a los 74.2 KB anteriores.
3. **Imagen responsive:** la fotografía numerada conserva el encuadre completo con `object-fit:
   contain` y variantes WebP de 480 y 960 px; no hay recorte ni regeneración del contenido.
4. **Carga diferida:** el formulario se carga al acercarse a contacto o al interactuar con un CTA.
   La malla 3D se solicita después de `load`, durante tiempo ocioso, mientras permanece el SVG.
5. **Accesibilidad:** el progreso expone `progressbar`, valores mínimo/máximo/actual, se corrigió
   contraste de CTA y notas, y se conservaron foco, reducción de movimiento y contenido HTML.
6. **Entrega:** `vercel.json` añade CSP para la portada, `nosniff`, política de referencia,
   permisos restringidos, bloqueo de marcos y caché larga para fuentes y derivados versionados.
   El sitemap declara la actualización de la home el 2026-10-02.
7. **Antispam de servidor:** `/api/lead` valida y normaliza el payload, rechaza origen cruzado,
   limita tamaño y frecuencia, comprueba tiempo mínimo, usa honeypot e idempotencia. La migración
   `002_lock_lead_ingress.sql` queda como compuerta de release para revocar el `INSERT` anónimo
   después de configurar el secreto de servidor; no se aplica durante el preview.

### Resultado cuantitativo local

| Perfil | Performance | Accesibilidad | Buenas prácticas | SEO | FCP | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Móvil Lighthouse 12.8.2 | 97 | 100 | 96* | 100 | 1.4 s | 2.3 s | 0 | 120 ms |
| Escritorio Lighthouse 12.8.2 | 100 | 100 | 96* | 100 | 0.4 s | 0.5 s | 0 | 0 ms |

\* El único descuento local de buenas prácticas es el 404 de
`/_vercel/insights/script.js`; Vercel sirve esa ruta en preview y producción.

La medición anterior de la misma candidata daba 83/92/96/100 en móvil y LCP de 3.5 s con CLS
de 0.135. La ronda reduce el LCP local a 2.3 s, elimina el desplazamiento visual medido y lleva
accesibilidad a 100. Se verificó ausencia de desbordamiento a 320, 390, 768 y 1440 px, recorrido
1/9–9/9 del diagnóstico, URL vacía válida y error de correo específico conservando respuestas.

Pruebas automatizadas actuales: **27/27 aprobadas**. Estado: candidato técnico listo para un
nuevo preview. Producción continúa bloqueada hasta revisión humana, secreto de servidor,
migración supervisada y autorización explícita de release.
