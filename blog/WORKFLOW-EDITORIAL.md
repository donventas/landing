# Workflow editorial de Don Ventas

Versión 1 · Dirección aprobada por Arturo el 3 de octubre de 2026.
Ámbito: este sitio; no modifica el método universal de BSB/AVOS.

## Activación y resultado

Aplicar antes de crear, reescribir, adaptar o publicar cualquier blog, aunque el
encargo solo diga «publica». Reutilizar evidencia vigente en ajustes pequeños.
El objetivo es contenido propio, comprensible, útil y descubrible; no producir
teoría intercambiable ni prometer rankings, citas de IA o ventas.

El asistente ejecuta la revisión proactivamente. Arturo acepta la voz, los claims
y la publicación. Registrar la revisión en el expediente existente del artículo
o en una sección de QA de su PR, usando la plantilla final de este documento.

## 1. Recuperar y definir antes de redactar

- Leer el artículo anterior, la dirección aprobada, voz, oferta y evidencia
  pertinente del sistema de marca. No pedir información ya resuelta.
- Definir a la persona por su situación, duda o decisión, no solo por tamaño o
  tipo de empresa. No restringir Don Ventas a mipymes por defecto.
- Elegir el trabajo principal de la pieza: descubrimiento, criterio, confianza,
  historia fundacional o ayuda para una decisión. Puede tener funciones secundarias.
- Anotar qué aporta Arturo que no bastaría con extraer de una guía genérica:
  experiencia concreta, observación, razonamiento, demostración o aprendizaje.
- Distinguir relato protegido de envoltura editorial (enlaces, metadatos, autoría).
  Una carta no necesita convertirse en tutorial ni tener cifras por obligación.

**Compuerta:** propósito, contribución propia y límites conocidos. Si falta una
experiencia, pedir un episodio concreto; nunca inventar diálogos o resultados.

## 2. Evidencia, privacidad y contrapuntos

Clasificar los claims como decisión aprobada, declaración del autor/equipo,
observación verificable, fuente externa, inferencia o hipótesis. La experiencia
de Arturo se cuenta como experiencia, no como resultado auditado independiente.

- Conservar el detalle que da sentido a la historia; no nombres de terceros,
  expedientes, correos, datos de clientes o capturas sin permiso específico.
- Buscar evidencia cuando se solicite o se generalice. Preferir fuentes primarias;
  abrir la fuente y verificar año, muestra, denominador y alcance de cada cifra.
- Los foros dan lenguaje y señales anecdóticas, no prevalencia ni prueba causal.
  Buscar también contrapuntos. No seleccionar solo quejas que apoyen una venta.
- Señalar ejemplos ilustrativos y propuestas no probadas. No disfrazarlos de
  campañas ejecutadas, testimonios o comparaciones de conversión.
- No atribuir todas las ventas, pérdidas o consultas equivocadas a una sola causa.
- Citar lo necesario junto al claim. No llenar una historia con cifras decorativas.

**Compuerta:** retirar, matizar o bloquear solo claims sin sustento/permisos.
No publicar datos privados en los registros de QA de este repositorio público.

## 3. Intención de búsqueda y voz propia

- Separar preguntas observadas (Search Console, clientes, fuentes) de consultas
  propuestas. Existencia de resultados no equivale a volumen, dificultad ni demanda.
- Registrar mercado/idioma, fecha y fuente de datos disponibles; no inventar
  probabilidades de posicionamiento ni extrapolar una búsqueda aislada.
- Elegir una intención principal que el artículo realmente resuelva. No intentar
  abarcar «por qué no vendo» con una historia que solo trata confusión de oferta.
- La carta fundacional puede priorizar autoría y confianza con búsqueda de marca;
  no forzar keywords genéricas o una sección FAQ para justificar su existencia.
- Mantener título humano y descriptivo. Ajustar `<title>`/descripción sin cambiar
  la promesa. Conservar URL; si un cambio fuera necesario, aprobar redirección,
  canonical, enlaces y sitemap juntos.

**Compuerta:** encaje entre pregunta, contenido y oferta. Demanda no medida se
registra como desconocida; no bloquea un ensayo útil aprobado como exploración.

## 4. Edición antes del diseño

- Abrir con situación o historia concreta. Mostrar qué se aprendió, no solo una
  conclusión tajante o una lista de recomendaciones sin contexto.
- Dar pronto una respuesta útil cuando sea una pieza de criterio; una carta puede
  resolverlo mediante el relato. No imponer una misma fórmula a toda la familia.
- Recortar repeticiones y frases que cualquier competidor podría firmar.
- Traducir tecnicismos al cambio que importaría al lector, sin deformar el producto.
- Añadir una demostración cuando explique mejor el criterio que otro párrafo.
- Reconocer el oficio del cliente. No juzgarlo, infantilizarlo ni sugerir sustituirlo.
- Evitar ataques genéricos a agencias y garantías de ventas, rankings o viralidad.
- Elegir un siguiente paso proporcionado; preservar revisión humana del diagnóstico,
  sin prometer PDF automático ni plazo que operación no haya confirmado.

**Compuerta:** revisión editorial de Arturo. La aprobación anterior de otra pieza
no autoriza un relato nuevo; un cambio técnico no debe reabrir copy protegido.

## 5. Portada y publicación técnica

Usar la familia editorial vigente, no generar imágenes por rutina. Revisar el
contexto real de cada fotografía y distinguir retrato/documento de escena conceptual.
La misma escena debe continuar en móvil salvo adaptación explícitamente aprobada.
Evitar recortar rostros o perder la actividad; imagen y texto dentro del mismo marco.

- Un `h1`, jerarquía clara, texto principal en HTML, autor visible con enlace a su
  perfil, título y descripción únicos, canonical de producción y `BlogPosting`.
- Fechas veraces: conservar publicación; actualizar modificación solo por cambio
  real, coherente con metadatos y sitemap. No simular frescura.
- OG/Twitter acordes al artículo, imagen disponible con dimensiones y descripción.
- Imágenes con `width`/`height`, `srcset`/`sizes`; precarga coincidente para evitar
  descargas duplicadas. No cargar imágenes grandes innecesarias ni scripts nuevos.
- Enlaces desde el HUB y lecturas relacionadas; actualizar resúmenes, tiempos de
  lectura y `llms.txt` existente cuando cambien. Este último no garantiza citas.
- Comprobar robots, canonical, HTTP, `noindex` y restricciones de CDN/hosting.
  Preview protegido/noindex no representa la indexabilidad de producción.
- Google exige indexación y elegibilidad para fragmentos para sus funciones de IA;
  no un schema especial. Revisar `OAI-SearchBot` para búsqueda en ChatGPT.
  Acceso para búsqueda y entrenamiento son decisiones separadas: no modificar
  `GPTBot` ni otros permisos de entrenamiento por optimizar descubrimiento.

Fuentes técnicas a revalidar al ejecutar cambios relevantes:
[Google: contenido útil](https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=es),
[Google: funciones de IA](https://developers.google.com/search/docs/appearance/ai-features),
[OpenAI: rastreadores](https://developers.openai.com/api/docs/bots).

## 6. QA antes de proponer el merge

Ejecutar `node --test` y `git diff --check`. El workflow de GitHub corre la
suite en PRs hacia `main`; su pase comprueba invariantes, no la verdad del relato.

- Revisar ambas piezas afectadas y el HUB a 320/390/768/escritorio; sumar anchos
  alrededor del breakpoint si cambia composición. Registrar si son simulados.
- Comprobar teclado, foco visible, landmarks, contraste de texto nuevo, imágenes,
  enlaces, índice, lectura relacionada y acceso al diagnóstico. No enviar leads
  reales innecesarios en cambios solo editoriales.
- Sin regresión de carga: registrar peso de HTML/imagen y recursos nuevos. En
  cambios de assets/JS/CSS o layout, medir laboratorio con condiciones comparables
  (URL, viewport, red/CPU y herramienta). No presentar una prueba local rápida
  como certificación de Core Web Vitals reales. En cambios solo de texto registrar
  explícitamente qué se vuelve a medir y qué permanece sin nueva medición.
- Revisar LCP, CLS y respuesta a interacción cuando corresponda; los objetivos de
  campo de referencia son LCP ≤2.5 s, INP ≤200 ms y CLS ≤0.1 al percentil 75.
  Revalidar umbrales antes de nuevas evaluaciones de rendimiento.
- Mostrar preview concreto y distinguir auto-revisión, QA independiente y aprobación
  del autor. Si falta alguna evidencia, declarar la limitación; no inventar un pase.

**Compuerta:** texto, evidencia y funcionamiento revisados; aprobación explícita
del release antes de merge. Las casillas no sustituyen a Arturo ni al QA visual.

## 7. Publicación y aprendizaje

Tras autorización: merge, registrar commit, verificar despliegue y páginas canónicas,
metadatos/headers reales, imágenes y siguiente paso. Entonces revisar Search Console,
enviar sitemap o solicitar rastreo si hace falta y si está autorizado. La solicitud
no es confirmación de indexación, que a su vez no prueba posicionamiento.

En una revisión posterior autorizada, separar:

| Pregunta | Evidencia que sirve | Lo que no demuestra |
|---|---|---|
| ¿Se comprende? | Cómo describe el lector la oferta y el aprendizaje | Que le guste la portada |
| ¿Se identifica y cree? | Comentarios concretos, dudas y razones expresadas | Tiempo de lectura por sí solo |
| ¿Es propio y respetuoso? | Qué idea recuerda y cómo se sintió tratado | Un tono llamativo por sí solo |
| ¿Se descubre? | Indexación, consultas/impresiones/clics y referencias reales | Una URL técnicamente disponible |
| ¿Ayuda comercialmente? | Conversaciones pertinentes y avance hacia el servicio | Seguidores o visitas aislados |

No atribuir causalidad a muestras pequeñas; conservar periodo, muestra y contexto.
No crear seguimiento automático, formularios públicos ni foros sin otro encargo.

## Registro mínimo reutilizable por artículo

Copiar estas preguntas al QA/PR existente; no crear otra fuente de verdad:

1. Pieza, URL, versión/base, propósito y situación del lector.
2. Aporte propio, material protegido y cambios autorizados.
3. Claims/fuentes/permisos; interpretación, hipótesis y contraejemplos.
4. Intención principal; consultas observadas/propuestas y datos desconocidos.
5. Comprobación de comprensión, identificación, credibilidad, diferencia y respeto.
6. Consumidores afectados: texto/HUB/autoría/OG/schema/sitemap/índice auxiliar.
7. QA técnico/visual, carga, accesibilidad, entorno y limitaciones reales.
8. Decisión: conservar/ajustar/diferir; aceptación editorial, aprobación de release,
   commit publicado e indexación cada uno con su propio estado.

No escribir «completo» si solo quedó preparado. Revertir el commit de la PR conserva
la versión publicada previa; no borrar relatos, decisiones ni evidencia histórica.
