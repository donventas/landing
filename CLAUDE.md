# Don Ventas — Landing (repo `donventas/landing`)

Repositorio del sitio **donventas.mx**. Desplegado en **Vercel** (rama `main` = producción).
Este archivo lo lee Claude Code al inicio de cada sesión: síguelo siempre.

## ⚙ Reglas de trabajo (dev → prod) — OBLIGATORIAS
1. **Nunca** edites ni hagas commit directo a `main`. Todo cambio va en la rama `dev`
   (créala desde `main` si no existe: `git checkout main && git pull && git checkout -b dev`).
2. Al pedir un cambio: edita en `dev`, haz commit descriptivo, `git push origin dev`, y
   **da el enlace del preview de Vercel de la rama dev** para validación humana.
3. **No fusiones a `main` por tu cuenta.** Solo cuando el humano escriba explícitamente
   "haz el merge a producción" (o "merge dev a main"): `git checkout main && git pull &&
   git merge dev && git push origin main`, y confirma que Vercel está redeployando.
4. Si un cambio toca datos o llaves (Supabase, etc.), avisa antes.
5. Resume en 2 líneas qué cambiaste y en qué archivo, cada iteración.

## ⚠ Estructura del `index.html` — LÉELO ANTES DE EDITAR
`index.html` es un **archivo empaquetado (bundle) de una sola pieza**, no fuente normal.
El markup real vive como **string JSON-escapado** dentro de
`<script type="__bundler/template">…</script>` (verás `\n`, `\"`, y las barras como
`<\u002F...>` en vez de `</...>`). Las fuentes e imágenes están incrustadas como data.

Para editar **texto o pequeños fragmentos** sin romper el bundle:
- Localiza el texto por su contenido (ej. el eslogan del footer), y reemplaza respetando
  la codificación escapada del bloque (barras como `\u002F`, comillas como `\"`).
- Haz reemplazos **puntuales y mínimos**; no reescribas el string completo.
- Verifica el diff antes de commit.

> Nota: la **fuente canónica** de esta landing NO vive en este repo, sino en el proyecto de
> diseño (Claude Design), archivo `Bloque 10 - Landing - Ruta A (Terminal).html`, de donde
> se re-empaqueta el `index.html`. Cambios grandes de diseño conviene hacerlos allá y
> re-empaquetar; en este repo, prioriza ajustes de texto/contenido puntuales.

## Dónde está cada cosa (dentro de index.html)
- **Footer:** eslogan "Don Ventas · branding que vende", coordenadas CDMX/Mérida, email de
  contacto y línea de copyright.
- **Formulario de waitlist:** hace POST a Supabase (`/rest/v1/lead`). Config en el script:
  `SUPABASE_URL`, `SUPABASE_ANON` (clave pública, OK que esté en el front), tabla `lead`.
- **Banner de cookies:** guarda consentimiento en `localStorage` y registra un INSERT anónimo
  en Supabase tabla `consent_log`; carga **Microsoft Clarity** (id `xlcmparelv`) solo si el
  usuario acepta. Vercel Web Analytics (`/_vercel/insights/script.js`) es sin cookies y siempre carga.
- **Enlaces legales:** apuntan a `/15_LEGAL/…` (Aviso de Privacidad, Política de Cookies,
  Términos, Centro Legal). Esas páginas viven en la carpeta `15_LEGAL/` del repo.

## Datos / seguridad
- La `SUPABASE_ANON` del front es la **clave pública** (RLS permite solo INSERT en `lead` y
  `consent_log`). Nunca pegues la `service_role` ni secretos en el repo.
- El correo de contacto actual es `arturo.villagomez@donventas.mx` (temporal, hasta activar
  `hola@donventas.mx` y `privacidad@donventas.mx`).

## Carpeta `15_LEGAL/`
Páginas legales publicadas (self-contained, CSS incrustado). Los enlaces del sitio dependen
de que la carpeta se llame **exactamente** `15_LEGAL` y de los nombres de archivo con espacios
(`Aviso de Privacidad.html`, etc.). No los renombres.

## Buenas prácticas para ahorrar tokens
- El humano debe indicar **archivo y sección exactos**; si no, pregunta breve antes de explorar.
- No explores todo el repo: este archivo ya te dice dónde está lo importante.
- Cambios mínimos y verificados; nada de reescribir el bundle completo.
