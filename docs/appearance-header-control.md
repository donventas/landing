# Selector de apariencia — candidato de desarrollo

## Mandato y fuentes

Arturo autorizó coordinar sitio, Portal y Marca en sus respectivos chats. Este
incremento se preparó inicialmente sin permiso de publicación. El 26-oct-2026,
Arturo autorizó publicarlo y verificar su disponibilidad en los sitios publicados.
Base de landing: main
`b0e325fcc35f36534e0da12acc4f23cf74429663` (PR61). Se preservan heroes, contenidos,
activos y tokens aprobados; fuentes de marca referenciadas en el rollout:
Runtime PR75 `f8a764bb3b18b8575c5826c7646953d40031ff34` y PR76
`cbd68d81fe70da9d3d1e6125c67d25d77ad9b454`.

Método BSB: snapshot verificado `aebf69bddc11cdadacd0bf076fc507c3123426fe`,
sin afirmar frescura del paquete instalado respecto de AVOS live. Ruta web,
fase execute, approved-baseline; Class A PRESENTATION_REFINEMENT, assembly-led.
Se reutiliza el paquete de `docs/appearance-rollout.md`; este es su delta de
interacción, no una nueva identidad ni un Brand Book.

## Composición y comportamiento propuestos

- Cabeceras editoriales: control de 44 × 44 antes de «Explorar» / acciones.
- Cabeceras de artículos: antes de las acciones existentes, sin inventar menú.
- Páginas sin esa cabecera: conservan el selector nativo al pie.
- Sol/luna expresan la apariencia efectiva; el nombre accesible explicita la
  preferencia, incluida la opción de dispositivo. Nunca se interpreta como un
  toggle que impida recuperar System.
- Disclosure con Claro, Oscuro y Según tu dispositivo. La selección no depende
  solo del color. Teclado mediante botones nativos, foco visible, Escape y clic
  exterior; no hay trampa de foco. No se alteran formulario, hash ni scroll.
- Panel alineado al borde derecho; ancho máximo limitado por viewport. Sin
  animación ornamental. Tinta, papel, azul, tipografía y foco del sistema actual.
- Preferencia local `dv.appearance.v1` conservada. No sincronización entre
  dominios, cookies, analítica ni identificación de personas.

Derivación: la cabecera y su campo oscuro son la composición ya aprobada; el
control utilitario hereda sus tokens, borde discreto y jerarquía secundaria.
La nueva iconografía funcional es un candidato simple sol/luna, no un emblema.
No entran referencias visuales de otras marcas. Roles de ensamblaje y producción
SVG: Codex; aceptación visual/criterio compartido: Arturo y chat de Marca.

## Consumidores y verificación

Inventario: las 21 rutas de `scripts/appearance-pages.cjs`. Se modifica el
comportamiento compartido, no el texto de artículos. Pruebas requeridas: motor
de preferencias, almacenamiento bloqueado, reinicialización, foco/cierre,
320/390/768/1440 px, claro/oscuro/dispositivo, inicio/servicio/artículo y páginas
sin cabecera. Reload y control del pie deben conservar coherencia.

## Resultado de desarrollo

- 331/331 pruebas Node aprobadas, incluidas cuatro nuevas del control. La
  ejecución aislada inicial tuvo tres fallos de acceso local; la repetición con
  acceso al filesystem temporal y localhost pasó completa.
- Navegador IAB: 48 comprobaciones geométricas (seis familias × cuatro anchos
  320/390/768/1440 × claro/oscuro), sin recortes del control ni overflow horizontal.
  Se corrigió el apilamiento heredado de `.nav-cta` en los dos artículos de contexto.
- Inventario de las 21 rutas a 390 px: 15 con control en cabecera, seis sin esa
  cabecera mantienen su selector nativo. Sin duplicados; selector al pie habilitado.
- Observación visual: servicio móvil claro, artículo móvil oscuro, inicio desktop
  oscuro y artículo de contexto a 320 px. No equivale a inspección visual de cada
  combinación ni a prueba en dispositivo físico.
- UI real: selección y reload, Tab, Escape, clic exterior, salida de foco y
  exclusión mutua con Explorar. Cambio a System conserva respuesta `lanzar`,
  paso inicial y scroll 453 px del diagnóstico; no se envió solicitud.
- Matriz y capturas: directorio hermano `appearance-header-evidence`, fuera del
  repositorio público. Prueba local `http://127.0.0.1:8799/branding.html?appearance=light`.
- Preview aislado sin transporte real ni analítica; HTML de las 21 rutas intacto.
  Sin commit, push, merge ni publicación en este incremento.

Release del 26-oct-2026: aceptación de Arturo recibida; suite completa repetida,
331/331 PASS con Node 24. Se solicita revisión independiente focalizada de Marca
antes de merge. Se verificará el SHA desplegado y las 21 rutas en producción.
Portal tiene su release propio ya verificado; Runtime no es un sitio público ni
se modifica en esta entrega. La alianza Creactiva conserva su co-branding aprobado;
las social cards son plantillas de exportación, no páginas de navegación.
El preview local no es un enlace accesible desde otro celular.
Rollback: restaurar únicamente este delta sobre la base citada, conservando las
preferencias almacenadas y todo el release PR61.
