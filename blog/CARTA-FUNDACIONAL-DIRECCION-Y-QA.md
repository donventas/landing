# Carta fundacional de Don Ventas — dirección y QA

**Estado:** preview actualizado; artículo aprobado y cierre técnico en QA
**Rama:** `codex/foundational-blog`  
**Base:** `donventas/landing` `main` en `ddfb761`  
**Fecha:** 2026-10-02

## Mandato

Convertir la dirección aprobada para el primer artículo fundacional de Don Ventas en una página editorial pública, sin publicarla todavía en producción. La pieza debe explicar por qué existe la marca, conectar la trayectoria de Arturo con su propuesta y conservar una lectura clara para personas sin conocimientos de marketing.

## Audiencia, tesis y siguiente paso

- **Audiencia:** personas, profesionales y responsables de negocios que saben que ofrecen algo valioso, pero todavía tienen dificultades para explicarlo, generar confianza o ser encontrados.
- **Tesis:** el valor de un negocio no siempre se vuelve visible por sí solo; necesita una forma clara, demostrable y encontrable.
- **Pilar:** producto y valor, conectado con la posición de Arturo como generalista estratégico que integra finanzas, operación, producto y sistemas.
- **CTA:** `Recibe tu diagnóstico`; no se promete un PDF automático ni un plazo fijo.

## Evidencia y límites de los claims

- El origen familiar, el permiso para mencionarlo y la formulación `más de 20 empresas` fueron confirmados por Arturo: `OWNER_CONFIRMED`.
- La capacidad de Arturo para integrar finanzas, operación, producto, marca y despliegue web está respaldada de forma general por Career OS y `EVD-WEB-001`: `SUPPORTED`.
- No se publican títulos contractuales, fechas exactas, nombres de clientes, cifras de impacto ni causalidad comercial sin evidencia adicional.
- La historia de lanzamientos con poca respuesta se presenta como experiencia personal, sin convertirla en una estadística ni atribuir la causa completa a una sola variable.
- No se prometen ventas, alcance, posicionamiento, viralidad ni resultados automáticos.

## Especificación de composición

- **Protagonista:** la historia y el retrato autorizado del fundador.
- **Tono:** carta personal con claridad comercial; emocional sin dramatización artificial.
- **Ritmo:** azul marino para la narración y color papel para origen y propósito; un bloque azul de quiebre; listas solamente cuando ayudan a comprender la trayectoria o el método.
- **Firma dominante:** tipografía editorial de gran escala con frases clave en azul.
- **Firma de apoyo:** El Don como marca de agua discreta.
- **Tratamiento quieto:** filetes, folios monoespaciados, pies de imagen y espacios amplios.
- **Antipatrones evitados:** índice de manual, tablas instructivas, exceso de palabras técnicas, fotografías presentadas como evidencia histórica sin serlo, 3D decorativo y múltiples frases azules por pantalla.
- **Anchuras verificadas:** 320, 390, 768 y 1440 px; sin desborde horizontal observado.

## Consumidores afectados

| Consumidor | Clasificación | Cambio |
|---|---|---|
| `blog/por-que-nacio-don-ventas.html` | pieza maestra nueva | Artículo, SEO, datos estructurados, retrato, CTA y progreso de lectura |
| `blog/index.html` | adaptación para HUB | Carta fijada como artículo 00 y guía práctica conservada como segunda pieza |
| `index.html` | integración en inicio | Carta como lectura editorial principal, guía práctica secundaria y ancla de autor |
| `blog/blog.css` | familia compartida | Componentes específicos de la carta y tarjeta secundaria del HUB |
| `home.css` | adaptación en inicio | Jerarquía de lectura y acceso a la historia del fundador |
| `sitemap.xml` | índice técnico | Nueva URL y actualización del HUB |
| `llms.txt` | índice semántico | Descripción y enlace de la carta fundacional |
| `og-fundacional-1200x630.jpg` | portada social | Composición horizontal para Open Graph y X |
| `og-fundacional-1200x900.jpg` | portada social | Composición 4:3 para datos estructurados y superficies compatibles |
| `og-fundacional-1200x1200.jpg` | portada social | Composición cuadrada para datos estructurados y reutilización editorial |

## Verificación realizada

- Pruebas Node, referencias locales y dimensiones de portadas verificadas.
- Un solo `h1`, canonical, `index,follow`, `BlogPosting` y breadcrumbs válidos.
- Retrato con dimensiones, carga correcta y texto alternativo.
- Enlaces locales resueltos y consola sin errores ni advertencias.
- Sin desborde horizontal en 320, 390, 768 y 1440 px.
- Revisión visual directa del hero, HUB, bloque de quiebre, contraste valor/percepción, propósito y cierre.
- Revisión visual directa de las composiciones sociales 16:9, 4:3 y 1:1; el retrato se ensambla completo con `object-fit: contain` y no se recorta.
- `prefers-reduced-motion` elimina las transiciones de la pieza.

## Limitaciones y compuertas

- Las vistas responsive son simuladas; no sustituyen una prueba en dispositivo físico.
- La carta fue aprobada editorialmente por el propietario; la integración y los derivados permanecen en preview para revisión final.
- Search Console y la solicitud de indexación solo aplican después de que la URL canónica exista en producción.
- Merge y publicación permanecen bloqueados hasta autorización explícita posterior al preview.

## Rollback

Retirar la nueva página y revertir los cambios acotados del HUB, `sitemap.xml`, `llms.txt`, CSS y pruebas. El artículo práctico existente permanece intacto durante este incremento.
