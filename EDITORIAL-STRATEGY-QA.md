# Alineación editorial y recorridos · 6 de octubre de 2026

## Mandato y baseline

Arturo aprobó las cinco fases del diagnóstico: coherencia/navegación, servicios y
prueba, SEO, validación y evidencia para decidir expansión. Implementación en rama;
merge y publicación de este candidato requieren revisión y autorización de release.
Base: `c13f0dc04f87680ae72501f5fadc2bd8434247aa` (PR #35).
Fuentes internas leídas, no distribuidas: Customer Taste v0.4 y Brand Profile v1.4
locales aprobados para esta aplicación. No se modifican Runtime, Portal ni AVOS.

## Contrato previo a implementación

Trabajo assembly-led: refinamiento de presentación y copy bajo dirección aprobada.
Se reutiliza la composición de BRAND-EVOLUTION-QA.md: hero integrado, tipografía,
imágenes, colores y marcas exactas. No hay nuevos activos, dirección visual, precios,
testimonios ni garantías. Relatos de los tres artículos protegidos; solo envoltura y
siguientes acciones. Audiencia por momentos: hipótesis de relevancia, no demanda medida.

- Cabecera móvil: acceso nativo desplegable; enlaces en HTML sin dependencia de JS.
  Misma gramática editorial, líneas discretas y acento azul; sin referencia externa.
- Hero: conservar H1/imagen y ancla práctica; reflujo natural, no ocultar significado.
- Servicios: cuándo sirve, alcance acordable, prueba y acción; anclas existentes.
- Formulario: ocho pasos, autonomía transversal; no añadir preguntas ni recopilar
  más datos. Consentimiento, idempotencia, contexto editable y errores protegidos.
- Prueba: diferenciar artefacto ilustrativo, sitio operativo y propiedad verificable.
- Glosario: misma familia nativa; definición, ejemplo, confusión, relaciones y lectura.
- Consumidores: inicio/branding comparten home.css y app.js; diagnóstico independiente
  y embebido comparten diagnostico-v2.js; blog/glosario/artículos conservan sus familias.
- Muestras de riesgo: cabecera+hero 320/390/768/1120/1440 y formulario de ocho pasos.
  Revisar cada página afectada y el conjunto. No recortar portadas ni cambiar fuentes.
- Entorno: edición/Node confirmados; Chrome headless disponible, por probar en esta
  rama. Search Console autenticado y QA independiente pendientes de comprobación.
- BSB web+copy execute: contratos de composición, contenido, paridad y entrega;
  escenas, 3D, nuevas marcas y PDF no aplican: no se producen ni alteran esos activos.
- Rollback: commits de esta rama; no reemplazo de fuentes aprobadas ni borrado histórico.

## Estados (se completan con evidencia, no por intención)

1. Coherencia y navegación: implementada y verificada en candidato local.
2. Servicios y prueba: implementada, conservando destinos y evidencia existentes.
3. SEO y consistencia: implementada y validada estructuralmente; no equivale a indexación.
4. QA funcional, visual, carga e independiente: aprobada, incluida regresión final tras contraste.
5. Search Console y decisiones de expansión: pendiente de acceso/datos reales. El control
   de Chrome interrumpió la consulta por no poder verificar la URL activa. No se simulan
   datos ni se interpreta esta ausencia como falta de demanda. No se han solicitado
   indexación, páginas adicionales ni cambios en una cuenta externa en esta ronda.

## Cambios y preservación

- Inicio: menú móvil nativo con rutas y diagnóstico; hero conserva H1/escena e incluye
  el propósito completo. Se hacen visibles explicación práctica y ruta secundaria en móvil.
- Conectar e integrar permiten explorar más de un servicio; no son paquetes automáticos.
- Cuatro servicios explican cuándo sirven y qué acordar; web enlaza a su prueba específica.
  Acompañamiento: prioridad → alcance/responsable → revisión y decisión; no suscripción obligatoria.
- Branding: incluye lanzamiento, conservación y evolución; evita oponer recursos propios a
  acompañamiento. Título/meta alineados; nueva definición del glosario vinculada.
- Diagnóstico: ocho pasos, sin nuevos datos personales; autonomía transversal. Borradores
  antiguos sin envío vuelven a elegir modalidad; intentos en curso retienen elección y clave.
  El resumen refleja redacción vigente, no se afirma identidad textual con versiones anteriores.
- Perfil de Arturo: aplicaciones según alcance, no ejecución total implícita.
- HUB: promesas de lectura ajustadas al artículo real, no una supuesta guía. CTA «Solicita».
  Artículos: solo cierre y enlaces; relatos, cifras, autores, fuentes, portadas y fechas protegidos.
- Glosario: 15 términos; nueva entrada «sistema de marca» con definición, ejemplo ilustrativo,
  límite, relaciones y destino. Frecuencia editorial 0 verificada; no equivale a búsquedas.
- Conservados sitemap de 13 URLs, canonical, robots, entidades, imágenes/fuentes, API y
  módulo de medición. No hay redirecciones ni páginas por momento. Fuentes internas intactas.

## Pruebas y evidencia

- `node --test`: 143/143 aprobadas; ninguna omitida. `git diff --check`: limpio.
- Chrome headless 154.0.8037.94: 9 páginas × 8 anchos (320, 390, 620, 621, 768,
  1120, 1121, 1440), sin overflow; 285 enlaces internos/fragmentos resueltos.
- Menús: teclado, foco, Escape, cierre tras enlace, destinos y uso sin JavaScript.
- Glosario: término abierto por fragmento; mismo término desde dos artículos vuelve al
  origen correcto; relaciones conservan el origen. Definición nueva accesible sin nueva ruta.
- Formulario sintético: consentimiento obligatorio, respuesta 503, recarga, reintento con
  misma clave, éxito y reinicio. API local simulada; sin leads reales ni tráfico a Google.
- QA visual del productor e independiente: capturas de inicio, branding, diagnóstico,
  perfil, HUB, glosario y artículos. Revisor independiente `editorial_strategy_review`:
  56 pruebas enfocadas y revisión visual efectiva, incluidos menús y hero final 390/1440.
  Corregidos sus hallazgos: propósito explícito, CTA y precisión del comentario técnico.
- Accesibilidad: corregidos contraste del rótulo de continuidad, textos secundarios de
  diagnóstico, botones del perfil, autoría/enlaces del blog y glosario sobre fondo claro;
  breadcrumbs subrayados y jerarquía de encabezados del diagnóstico. No se cambió el relato.
- Observación opcional heredada: la firma del hero del HUB se fragmenta en varias líneas;
  no se altera en este alcance. La auditoría experimental no ponderada de nombres
  accesibles también señala tarjetas del HUB nombradas por su título, no por todos
  sus textos visibles. Se registra para revisión específica; 100/100 no significa
  ausencia absoluta de observaciones. Aceptación editorial final corresponde a Arturo.
- Herramientas QA nuevas excluidas del deploy mediante `.vercelignore`; servidor ligado
  a 127.0.0.1 y `X-Robots-Tag: noindex`. No se relajan permisos de medición ni CSP.

## Carga comparable, no datos de campo

Lighthouse 12.8.2; Chrome 154; móvil simulado 412 × 823, DPR 1.75, RTT 150 ms,
1638.4 kbps y CPU ×4. Servidor local gzip, almacenamiento nuevo, CSP real de cada ruta.
El fixture no reproduce la CDN de Vercel: Insights devuelve un script vacío; Google
permanece desactivado en localhost. Misma condición para base y candidato. No son
pruebas de concurrencia, datos INP reales ni evidencia comercial.

| Página | Rendimiento | Accesibilidad automática | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|
| Inicio | 98 | 100 | 2.259 s | 0.000125 | 0 ms |
| Branding | 98 | 100 | 2.421 s | 0 | 0 ms |
| Diagnóstico | 99 | 100 | 1.736 s | 0.000007 | 0 ms |
| Arturo | 98 | 100 | 2.114 s | 0.000105 | 0 ms |
| Blog | 98 | 100 | 2.260 s | 0.000173 | 0 ms |
| Glosario | 98 | 100 | 2.267 s | 0.000334 | 0 ms |
| Carta fundacional | 99 | 100 | 2.186 s | 0.000173 | 0 ms |
| Artículo de contenido | 99 | 100 | 2.188 s | 0.000173 | 0 ms |

Base c13f0dc bajo la misma configuración: inicio 98, LCP 2.327 s; branding 97,
LCP 2.499 s. No se observa regresión en estas corridas; las diferencias pequeñas
no demuestran una mejora generalizable. Sin nuevas imágenes, fuentes o dependencias
en el sitio. Incrementos gzip: home +431 B, branding +121 B, HUB +32 B, glosario
+325 B, motor de diagnóstico +358 B, app.js +256 B (normalización de líneas incluida).
Glosario HTML 28,775 B: presupuesto bruto de prueba pasa de 28 a 30 kB por una
definición nativa; no por añadir imágenes/scripts. No se oculta contenido para medir.

Referencia técnica revalidada: [Web Vitals](https://web.dev/articles/vitals)
(campo: p75 LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1; Lighthouse no mide INP de usuarios).
[Títulos de Google](https://developers.google.com/search/docs/appearance/title-link):
descriptivos y coherentes con la página, sin promesa de que Google reproduzca el texto.
La puntuación SEO local no certifica indexabilidad: el servidor impide indexación
deliberadamente. Canonical y sitemap se prueban por separado contra URLs de producción.

Informes de esta ronda: carpeta temporal `dv-editorial-strategy-YX7VD8`, `results.json`,
`lh-home.json` y `lh-final-*.json`. Las capturas no se suben al sitio ni contienen leads.
Regresión final sobre todos los ajustes: `dv-editorial-strategy-jBfFIP/results.json`,
72 layouts, 285 enlaces, menú, glosario y formulario aprobados; cero errores JavaScript.
Main remoto consultado sigue en c13f0dc; no hay entradas Git sin fusionar ni marcadores
de conflicto. La rama actual no incorpora el PR #17 descartado.
Preview local: `http://127.0.0.1:8788/`. No hay merge ni despliegue de este candidato.

## Propuesta antigua descartada

PR #17 cerrado sin merge por instrucción expresa de Arturo, 2026-10-07 00:16 UTC.
Rama e historial conservados. Sus conflictos no se resuelven reincorporando un
emblema 3D, diagnósticos, SLA o alcance comercial sustituidos por releases posteriores.
