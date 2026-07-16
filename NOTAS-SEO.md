# Notas SEO / GEO — Don Ventas

Referencia rápida para indexación del sitio. No afecta al sitio (archivo de documentación).

## Archivos publicados (en producción)
- `robots.txt` — permite crawlers web y de IA (GPTBot, OAI-SearchBot, ChatGPT-User,
  Google-Extended, PerplexityBot, ClaudeBot, Claude-Web, Applebot-Extended) y declara el sitemap.
- `sitemap.xml` — home, `diagnostico.html` y las 4 páginas legales de `15_LEGAL/`.
- `llms.txt` — resumen del negocio para motores de IA.
- `index.html` / `diagnostico.html` — datos estructurados JSON-LD + canonical + OG/Twitter.

## Google Search Console

### 1. Verificar propiedad (una vez)
1. https://search.google.com/search-console → iniciar sesión.
2. Agregar propiedad → tipo **Dominio** → escribir `donventas.mx` (sin https, sin www).
3. Google da un registro **TXT** → agregarlo en el DNS de `donventas.mx`
   (Vercel → Domains, o el registrador si el DNS vive allá) → **Verificar**.
   - Alternativa: propiedad **Prefijo de URL** (`https://donventas.mx/`) con verificación por
     archivo HTML subido a la raíz del repo (se puede automatizar por commit).

### 2. Enviar sitemap
- GSC → **Sitemaps** → escribir `sitemap.xml` → Enviar. Debe quedar "Correcto" con 6 URLs.

### 3. Forzar primer rastreo (opcional)
- GSC → **Inspección de URLs** → `https://donventas.mx/` → **Solicitar indexación**.
  Repetir con `https://donventas.mx/diagnostico.html`.

### 4. Comprobación previa (responden 200)
- `https://donventas.mx/sitemap.xml`
- `https://donventas.mx/robots.txt` (incluye `Sitemap:`)

## Bing (opcional)
- https://www.bing.com/webmasters → importar propiedad desde GSC → reenviar `sitemap.xml`.

## Notas
- La indexación no es inmediata (horas a días). El sitemap solo acelera el descubrimiento.
- GEO (motores de IA): no hay consola de envío; se descubre por rastreo normal vía robots.txt + llms.txt.
