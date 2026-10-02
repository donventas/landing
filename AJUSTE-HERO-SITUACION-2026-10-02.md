# Ajuste candidato — hero por situación

**Fecha:** 02-oct-2026

**Estado:** candidato en rama; revisión humana pendiente; no publicado

**Repositorio consumidor:** `donventas/landing`

**Rama:** `codex/situation-first-web`

## Propósito y frontera

La portada ya explicaba la oferta con lenguaje cotidiano, pero su campo visual principal
seguía centrado en el símbolo de Don Ventas. Este incremento representa a una persona
capaz que ya conoce su negocio y está ordenando cómo explicarlo, demostrarlo y conducir a
un siguiente paso. El símbolo 3D se retiró del hero por decisión de Arturo: repetía la
identidad ya visible en el encabezado, cubría evidencia útil y no aportaba suficiente valor.

La dirección procede de D-10 en la rama de Runtime `codex/customer-taste-pilot`; esa
decisión sigue pendiente de merge y de evidencia humana. Esta aplicación es reversible y
no se presenta como preferencia validada, mejora comercial demostrada ni autorización de
publicación.

## Composición

- **Trabajo de la escena:** hacer reconocible la situación «tengo algo valioso, pero su
  presencia todavía no ayuda a entenderlo o elegirlo».
- **Agencia de la persona:** analiza, compara y decide; Don Ventas no la rescata ni la
  sustituye.
- **Evidencia visible:** cuaderno, prototipo neutral, materiales editoriales, teléfono y
  laptop pertenecen al mismo campo de trabajo.
- **Perspectiva:** todos los objetos direccionales se orientan para el uso del personaje,
  no para presentarlos frontalmente a la cámara.
- **Firma:** el wordmark B6 del encabezado identifica la marca; la fotografía queda libre
  de emblemas superpuestos. Los archivos 3D permanecen en el repositorio como rollback,
  pero esta página ya no descarga su JavaScript ni su malla.
- **Copy:** el titular aprobado se conserva; la entrada nombra la situación y la bajada
  identifica contenido para redes, sitios web y sistemas de marca.

## Fuente y derivados

| Archivo | Función | SHA-256 |
| --- | --- | --- |
| `assets/editorial/source/hero-situacion-capacidad-v1-source.png` | fuente raster conservada | `45cade9fbc491a1d0e23066ee73464ba8c877b94e3dee5fb2add03e36dd6ed4c` |
| `assets/editorial/hero-situacion-capacidad-v1.webp` | derivado 1122 × 1402 | `557e848e405676c5a913b2d542daaa0fcd6473d9580670e0b34ef3061270ef50` |
| `assets/editorial/hero-situacion-capacidad-v1-960.webp` | derivado 960 × 1200 | `db376d10ebfe1f52c693f73755906958b7b076b9189211a855b827f59c4db470` |
| `assets/editorial/hero-situacion-capacidad-v1-640.webp` | derivado 640 × 800 | `46331fc729fd8a50322df5954d4c82b5663241fe0191681195586b7ba67af272` |

Los WebP se generaron desde la fuente PNG con `sharp`, calidad 82 y sin ampliación.

## Prompt final de producción

```text
Make the entire desktop arrangement feel organically set up and used from the seated
person's physical perspective, not staged for the camera. Reorient every directional
object consistently toward him: smartphone, printed layout cards, notebook diagrams,
laptop and neutral prototype. Preserve the same capable Latino person, identity, face,
expression, pose, hands, workspace, lighting, camera position, vertical framing and
neutral cross-category character. No readable words, logos, watermark, cosmetics,
handshake, helpless expression or object staged squarely toward the camera. The final
image should feel like an observational photograph of a real working session in progress.
```

La fuente se creó con la herramienta integrada de generación de imágenes y recibió dos
correcciones dirigidas: retirar el sesgo hacia cosméticos y orientar primero el teléfono,
luego toda la mesa, desde la perspectiva del personaje.

## Consumidores y QA

- `index.html`: `picture` responsivo, texto alternativo y prioridad alta de carga; sin
  emblema ni ejecución 3D en el hero.
- `home.css`: composición paralela en escritorio; en teléfono la escena aparece antes del
  copy y del CTA para establecer el contexto antes de pedir una acción.
- `blog/index.html`: se retiró la promesa inconsistente de un PDF automático; la revisión
  humana y el encaje vuelven a coincidir con el flujo público vigente.
- Pruebas automáticas: referencias locales, SEO, accesibilidad básica, diagnóstico,
  seguridad y presencia de la escena.
- Revisión visual realizada en escritorio, 390 px y 320 px. Aceptación estética y eficacia
  comercial permanecen separadas y pendientes.
