# Notas SEO / GEO — Don Ventas

Referencia rápida para indexación del sitio. No afecta al sitio (archivo de documentación).

## Archivos publicados (en producción)
- `robots.txt` — permite crawlers web y de IA (GPTBot, OAI-SearchBot, ChatGPT-User,
  Google-Extended, PerplexityBot, ClaudeBot, Claude-Web, Applebot-Extended) y declara el sitemap.
- `sitemap.xml` — home, `branding.html`, `diagnostico.html` y las 4 páginas legales de `15_LEGAL/`.
- `llms.txt` — resumen del negocio para motores de IA.
- `index.html` / `branding.html` / `diagnostico.html` — datos estructurados JSON-LD + canonical + OG/Twitter.
- `scripts/audit_content.py` — control local de peso textual y jerarquía H1/H2/H3 por sección.
- Host canónico vigente: `https://www.donventas.mx/`, alineado con la redirección efectiva.
- La home declara explícitamente `index,follow`; los previews pueden seguir protegidos por Vercel.
- Un preview protegido por Vercel puede responder `X-Robots-Tag: noindex`; es correcto y no
  debe usarse para diagnosticar la indexación del dominio productivo. Validar siempre
  `https://www.donventas.mx/` después del merge y despliegue.

## Google Search Console

### 1. Verificar propiedad (una vez)
1. https://search.google.com/search-console → iniciar sesión.
2. Agregar propiedad → tipo **Dominio** → escribir `donventas.mx` (sin https, sin www).
3. Google da un registro **TXT** → agregarlo en el DNS de `donventas.mx`
   (Vercel → Domains, o el registrador si el DNS vive allá) → **Verificar**.
   - Alternativa: propiedad **Prefijo de URL** (`https://www.donventas.mx/`) con verificación por
     archivo HTML subido a la raíz del repo (se puede automatizar por commit).

### 2. Enviar sitemap
- GSC → **Sitemaps** → escribir `sitemap.xml` → Enviar. Debe quedar "Correcto" con 7 URLs.

### 3. Forzar primer rastreo (opcional)
- GSC → **Inspección de URLs** → `https://www.donventas.mx/` → **Solicitar indexación**.
  Repetir con `https://www.donventas.mx/diagnostico.html` y
  `https://www.donventas.mx/branding.html`.

### 4. Comprobación previa (responden 200)
- `https://www.donventas.mx/sitemap.xml`
- `https://www.donventas.mx/robots.txt` (incluye `Sitemap:`)

## Bing (opcional)
- https://www.bing.com/webmasters → importar propiedad desde GSC → reenviar `sitemap.xml`.

## Notas
- La indexación no es inmediata (horas a días). El sitemap solo acelera el descubrimiento.
- GEO (motores de IA): no hay consola universal de envío; se apoya en rastreo normal, entidad
  consistente, respuestas claras, evidencia verificable, `robots.txt`, `llms.txt` y páginas citables.
- SEO, AEO y GEO son complementarios: indexar no garantiza ranking; estructurar respuestas no
  garantiza citas; permitir crawlers no garantiza menciones.

## Peso editorial de la home

La home mantiene una arquitectura comercial breve y una zona de preguntas más explícita:

- hero y problema: comprensión inmediata;
- oferta y método: decisión y siguiente paso;
- prueba: evidencia visual sin resultados inventados;
- sistema: criterio sin exponer nombres internos;
- recursos y FAQ: respuestas citables para SEO, AEO y GEO;
- diagnóstico: conversión.

No reducir texto por una cuota arbitraria. Ejecutar `python scripts/audit_content.py` y revisar
si cada párrafo ayuda a entender, comparar, confiar o actuar. Las secciones visualmente tituladas
deben conservar encabezados HTML reales.

## Regla de lenguaje claro sin perder SEO ni GEO

La página debe poder entenderse sin conocer términos de marketing. El término cotidiano va
primero; la palabra técnica aparece después, entre paréntesis o en una explicación breve cuando
ayuda a identificar el servicio.

| Evitar como primera explicación | Usar primero | Término técnico que puede conservarse después |
| --- | --- | --- |
| tráfico calificado | personas que sí podrían comprar | tráfico calificado |
| copy | textos o mensajes | copywriting |
| generar demanda | atraer interés y posibles clientes | generación de demanda |
| SEO | aparecer en Google o en buscadores | SEO |
| AEO / GEO | ser entendido y citado por herramientas de IA | AEO / GEO |
| brief | formulario o cuestionario | brief |
| lead / prospecto | posible cliente o persona interesada | lead |
| atomización | versiones para cada canal | atomización de contenido |

Aplicación por superficie:

- **Títulos, botones y primeros párrafos:** solo lenguaje cotidiano.
- **Descripciones de servicio y FAQ:** lenguaje cotidiano seguido del término técnico.
- **JSON-LD, `llms.txt` y metadatos:** combinar intención de búsqueda y explicación clara.
- **Código interno y nombres de datos:** pueden conservar términos técnicos cuando no son visibles.

La repetición de siglas no mejora por sí sola el posicionamiento. Mantener una entidad consistente,
servicios explícitos, respuestas útiles, estructura semántica y datos verificables es más importante
que forzar palabras clave en cada sección.

## Regla de énfasis editorial en azul

El azul ayuda a escanear el contenido; no sustituye una jerarquía clara ni se usa como decoración.
En textos densos se destaca la frase que responde una de estas preguntas: **qué resultado obtengo**,
**qué problema se resuelve** o **qué sucede después**.

- usar una frase destacada por párrafo; dos solo si el párrafo es excepcionalmente largo;
- destacar palabras cotidianas y resultados, no siglas o términos técnicos por defecto;
- conservar el texto completo dentro del HTML: el color no debe cargar significado indispensable;
- usar `strong.key-phrase` cuando la frase tenga énfasis semántico real;
- revisar el ritmo de toda la sección: no todos los párrafos necesitan azul.

## Regla de prueba comercial verificable

Los casos del portafolio explican **necesidad, entrega visible y estado**. Un resultado comercial
solo se publica cuando existe evidencia autorizada que lo respalda. Las muestras conceptuales deben
seguir identificadas como tales; una pieza visual no equivale por sí sola a una venta, mejora de
posicionamiento o resultado del negocio.

Las tarjetas de servicio incluyen un criterio “Te conviene si” para ayudar a elegir sin conocer
terminología de marketing. El diagnóstico informa desde el inicio el tiempo para completarlo y el
plazo estimado de revisión humana.
