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

## ✅ Estructura — FUENTE EDITABLE (ya no es un bundle)
El sitio es fuente normal, editable con diffs baratos. Tres archivos + assets:
- **`index.html`** — markup limpio. Enlaza `styles.css` y (con `defer`) `app.js`. Edita el
  texto/estructura aquí directamente; no hay strings escapados.
- **`styles.css`** — todo el CSS (tokens en `:root`, secciones, form, banner de cookies).
  Las fuentes se cargan por `@import` de Google Fonts al inicio del archivo.
- **`app.js`** — todo el JS, en 5 secciones comentadas: (1) reveal on-scroll, (2) lightbox,
  (3) waitlist→Supabase, (4) mini-diagnóstico, (5) banner de cookies + Clarity. Las llaves
  públicas (Supabase URL/anon, Clarity id) están como `var` al inicio de cada sección.

Para un cambio de texto: edítalo en `index.html`. Para estilo: `styles.css`. Para lógica /
llaves: `app.js`. Cambios chicos = diffs chicos.

> Nota: la fuente canónica de diseño sigue viviendo en el proyecto de diseño (Claude Design),
> `Bloque 10 - Landing - Ruta A (Terminal).html`. Cambios grandes de diseño conviene hacerlos
> allá y re-exportar los tres archivos; los ajustes de texto/contenido/copys van directo aquí.

## Dónde está cada cosa
- **Footer** (`index.html`, `<footer class="foot">`): eslogan "Don Ventas · branding que vende",
  coordenadas CDMX/Mérida, email de contacto.
- **Formulario de waitlist** (`app.js`, §3): POST a Supabase (`/rest/v1/lead`). Config:
  `SUPABASE_URL`, `SUPABASE_ANON` (clave pública, OK en el front), `TABLE`.
- **Banner de cookies** (markup en `index.html` `#dv-cookie`; lógica en `app.js`, §5): guarda
  consentimiento en `localStorage`, registra INSERT anónimo en Supabase `consent_log`, y carga
  **Microsoft Clarity** (`CLARITY_ID='xlcmparelv'`) solo si el usuario acepta. Vercel Web
  Analytics (`/_vercel/insights/script.js`, en `index.html`) es sin cookies y siempre carga.
- **Estilos del banner:** en `styles.css`, sección `/* ══ banner de cookies ══ */`.
- **Enlaces legales:** apuntan a `15_LEGAL/…` (Aviso de Privacidad, Política de Cookies,
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
- Cambios mínimos y verificados; edita solo el archivo que corresponde (html / css / js).

> Migración jul-2026: el sitio dejó de ser un bundle escapado de una pieza y pasó a fuente
> editable (`index.html` + `styles.css` + `app.js` + assets). Si ves un `index.html` viejo
> con `<script type="__bundler/template">`, es de antes de la migración.
