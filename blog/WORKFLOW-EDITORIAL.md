# Workflow editorial de Don Ventas

Versión 1.3 · Dirección del 3 de octubre de 2026; jerarquía de notas y glosario
progresivo aprobados por Arturo el 4 de octubre de 2026. Copy de regalos y tarjetas
sociales aprobado el 10 de octubre de 2026.
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

### Regla de lenguaje claro y glosario progresivo

En cada blog nuevo o revisión, detectar términos de marketing, negocio y web
que una persona sin formación en esas áreas pudiera no entender. No depender
solo de una lista fija o un detector automático: revisar la frase y su contexto.

1. Sustituir el tecnicismo cuando no aporte precisión. El artículo debe entenderse
   sin consultar el glosario; preservar la voz y las historias aprobadas.
2. Si conviene conservarlo, revisar `blog/glosario.html` y reutilizar su entrada.
   Si falta, añadirla en la misma PR: significado sencillo, ejemplo ilustrativo,
   confusión frecuente y lectura relacionada cuando exista. No inventar casos.
3. Enlazar solo la primera aparición útil en el cuerpo mediante un enlace HTML
   descriptivo a `/blog/glosario.html?from=clave-articulo&at=id-del-termino#id-del-termino`, nunca al inicio genérico
   del glosario. No marcar todos los términos ni introducir jerga para enlazarla.
4. Los IDs son estables, en minúsculas y sin acentos; reutilizar sinónimos bajo
   una misma entrada. No renombrar ni eliminar un ID con enlaces entrantes.
5. La definición completa debe estar en HTML y ser alcanzable sin JavaScript,
   con encabezado visible, margen para la navegación fija y foco perceptible.
   Usar enlaces directos, sin popups ni iconos repetidos. Cada enlace de origen
   lleva `id="termino-id-del-termino"` para regresar al punto exacto de lectura.
   Registrar el artículo y sus términos en los enlaces HTML `data-reading-source`
   del glosario. La prueba comprueba que origen, término y regreso coincidan.
   El script mínimo del glosario lee solo ese registro permitido; no acepta una
   URL arbitraria de retorno, no usa referrer, cookies ni almacenamiento compartido.
   Si se consultan otros términos, se conserva el punto de lectura inicial.
   Sin origen válido o sin JavaScript, ofrecer las lecturas sin fingir cuál era
   el artículo de origen. Probar dos artículos y dos pestañas para un mismo término.
6. Dar contexto sencillo a fuentes especializadas cuando se necesiten. Las
   explicaciones propias no se atribuyen automáticamente a una institución.
7. Ejecutar `node --test`: la prueba del glosario recorre todos los blogs y
   falla ante enlaces genéricos en artículos, destinos inexistentes, IDs
   duplicados o entradas sin definición, ejemplo y aclaración. No sustituye
   la detección editorial de palabras nuevas ni la prueba con personas.

Registrar en QA/PR: términos detectados; cuáles se simplificaron, reutilizaron,
añadieron o se dejaron sin vínculo y por qué; enlaces directos probados; recorrido
con teclado/teléfono y vuelta al artículo. Añadir entradas no requiere crear
páginas SEO individuales ni prometer posicionamiento. Mostrar cambios de voz y
nuevas definiciones a Arturo antes del release.

#### Orden y consulta del glosario

- Cada término se presenta en un `details/summary` nativo, con significado,
  ejemplo, aclaración «No confundir con», relaciones, lectura y retorno al origen.
  No imponer exclusividad: se pueden comparar varias entradas abiertas.
- Orden inicial: número de artículos publicados que mencionan el concepto en
  su cuerpo, agrupando aliases editoriales de `data-aliases`. Desempatar por
  nombre en español. No contar repeticiones, menú, metadatos, lecturas relacionadas
  ni el glosario; no presentarlo como demanda o búsquedas de usuarios.
- Ejecutar `node scripts/glossary-frequency.cjs` al crear/revisar blogs o aliases.
  Revisar las coincidencias y actualizar `data-frequency` y el orden HTML de
  las entradas en la misma PR. El test falla si el inventario queda desactualizado.
  Es una aproximación léxica revisable, no inferencia automática del significado.
- Búsqueda por término/alias sin distinguir mayúsculas o acentos; orden alfabético
  opcional. Sin resultados: explicación y acción para restablecer la lista.
- Al llegar por fragmento o seguir un concepto relacionado, abrir su entrada y
  conservar el contexto de origen. Si un filtro la ocultaba, limpiar el filtro.
  Sin JS, las definiciones siguen completas en HTML y se abren manualmente;
  ocultar controles que no funcionarían. Probar enlaces, teclado y dos orígenes.

### Regla de notas: transparencia sin interrumpir el relato

La narración lleva el hilo; las notas ayudan a comprobarlo. No convertir cada
ejemplo, imagen o dato en un bloque defensivo del mismo peso que el artículo.
Antes de añadir una nota, decidir qué interpretación incorrecta evita.

1. **Esencial y visible:** mantener junto al elemento una frase breve si cambia
   su interpretación. Ejemplos: «Ilustración con IA · escena ficticia» o
   «Ejemplo ilustrativo · no es una campaña probada». Nunca ocultar que una
   imagen es ficticia ni presentar una propuesta como resultado obtenido.
2. **Fuente vinculada al dato:** citar con enlace descriptivo cerca del claim.
   El alcance que evita una generalización engañosa pertenece a la frase
   principal; muestra, fecha de trabajo de campo y límites adicionales pueden
   ir en un desplegable «Sobre la encuesta y sus límites».
3. **Detalle disponible, no obligatorio:** usar HTML nativo `details/summary`,
   sin nuevos scripts, tooltips exclusivos de hover ni texto cargado después
   de pulsar. Un lector debe poder consultarlo con teclado o teléfono.
4. **Sin redundancia:** si el relato ya matiza una conclusión, no repetir el
   mismo descargo en un recuadro largo. No eliminar límites sustantivos,
   atribución, privacidad o contexto necesario por hacer la pieza más atractiva.
5. **Jerarquía legible:** notas de al menos 14 px como base de esta familia,
   contraste AA y área de acción de al menos 44 px. Menor protagonismo mediante
   extensión, ritmo y peso; no mediante texto diminuto o de bajo contraste.
   Comprobar estilos calculados: las reglas generales del artículo no deben
   sobrescribir las notas. Revisar 320/390/768/escritorio, zoom y foco.

En cada revisión recorrer el artículo con los detalles cerrados y después
abiertos. Cerrados: historia comprensible y no engañosa. Abiertos: evidencia
consultable y enlaces operativos. No añadir notas a la carta fundacional
por simetría cuando su relato no las necesita. Aceptación estética, rigor
de la evidencia y eficacia comercial siguen siendo verificaciones distintas.

### Regla de regalos: distinguir contenido, acceso y uso

Antes de entregar el regalo, describir lo que recibirá la persona. Después de
entregarlo, explicar cómo puede usarlo. Nunca presentar el contenido del recurso
como un requisito para obtenerlo.

- Personalizar `offerKicker`, `offerTitle` y `description` en `article-gifts.json`.
  Preferir «Un regalo para…» y «Tu checklist/guía «Nombre»». Una cantidad de puntos,
  ejercicios o ejemplos describe el PDF, no tareas que haya que completar antes.
- Evitar encabezados de acceso como «Ahora te toca ponerlo en práctica» o «Revisa
  estas cinco cosas». Reservar esos imperativos para las instrucciones del recurso.
- Mostrar antes de abrir el formulario `accessTerms`: tres preguntas y correo,
  descarga al terminar, sin suscripción obligatoria. Si el flujo cambia, actualizar
  todos los avisos y pruebas juntos. El aviso inicial `readingConditions` debe
  declarar también el correo; no confundir facilitarlo con aceptar marketing.
- Conservar una invitación contextual para aportar experiencias y ejemplos reales
  que ayuden a futuros lectores; no pedir respuestas «correctas» ni más largas.
- Comprobar: ¿qué recibo?, ¿qué tengo que hacer para recibirlo?, ¿qué puedo hacer
  después con él? Compartir y suscribirse nunca son requisitos de la descarga.

### Regla de vistas previas al compartir: editorial, no anuncio

Aplicar a cada nuevo artículo con regalo y a sus revisiones:

1. El título OG/Twitter invita a leer mediante una situación, pregunta o tensión
   propia del artículo. No convertirlo en anuncio del regalo ni usar clickbait
   ajeno al relato. Puede conservar el titular existente si ya cumple esa función.
2. La descripción explica brevemente el contenido y menciona como beneficio
   secundario el recurso gratuito específico: checklist o guía y para qué sirve.
   No prometer una descarga sin requisitos: el artículo explica preguntas y correo
   antes del clic. Solo anunciar recursos existentes y efectivamente habilitados.
3. Conservar la imagen editorial aprobada: sin banners, sellos «GRATIS», precios,
   botones falsos ni mensajes de regalo sobre la escena. El texto complementa la
   imagen, no la convierte en un anuncio. No regenerarla por cambiar metadatos.
4. Sincronizar `og:title`/`twitter:title` y `og:description`/`twitter:description`.
   Usar un hook y descripción propios por artículo, no una frase genérica repetida.
   No cambiar H1, título SEO, canonical, relato, fechas ni schema por ese motivo.
5. Verificar HTML servido, imagen y recurso públicos después del despliegue. La
   vista previa real depende del cliente y de su caché: no asegurar que una tarjeta
   antigua se actualizó ni que mostrará la descripción sin comprobarlo allí.
6. Ejecutar las pruebas de catálogo/metadatos: recurso disponible, tipo correcto,
   títulos únicos, OG/Twitter coherentes y requisitos explícitos. Es una compuerta
   técnica, no reemplaza la revisión editorial del hook y su fidelidad al texto.

No extender por esta regla los botones interactivos de compartir: su despliegue
es una decisión independiente. No contar un clic como mensaje enviado o lead.

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
