# Extensión de apariencia — candidato para revisión

Estado: PR #61 (draft), correcciones del dictamen NO APTO en segunda revisión.
Merge y producción retenidos hasta el nuevo dictamen y la decisión de Arturo.
Arturo confirmó sus pruebas de los tres pilotos. Se registra como aceptación manual
declarada; no se infieren dispositivos, navegadores ni cobertura que no indicó.

## Fuentes y límites

- Sitio editable: donventas/landing, baseline c487c25184ec05feed526e36572d274acb9d4eb0.
- Pilotos aprobados v2.3 del 25 de octubre de 2026, preservados en su checkout original.
- Marca: Runtime PR75 f8a764bb3b18b8575c5826c7646953d40031ff34; dirección web
  documental PR76 cbd68d81fe70da9d3d1e6125c67d25d77ad9b454.
- BSB: snapshot congelado aebf69bddc11cdadacd0bf076fc507c3123426fe,
  adapter candidate.5, ruta web/execute/approved-baseline. Sin actualización del
  paquete ni afirmación de frescura live. WE-17 y revisión independiente aplicados.
- Riesgo de producto W2: existen formularios. La revisión aislada no certifica
  entregas comerciales ni reclasifica el producto como W0.
- No se modifican Portal, Runtime, AVOS, BSB, DNS ni contenido editorial aprobado.

## Alcance

El inventario ejecutable está en scripts/appearance-pages.cjs: 21 páginas.
Incluye inicio, branding, diagnóstico, perfil, índice del blog, nueve artículos,
glosario, cinco documentos legales y preferencias de correo.

La alianza Creactiva conserva su expresión de marca compartida y no recibe esta
paleta. Social cards son plantillas de exportación, no páginas de navegación.
No se confunde sitemap con inventario: también se cubren utilidades no indexables.

## Implementación

- Dos hojas aditivas por familia, bootstrap pequeño sin dependencias y control
  nativo al pie. No añade barra al hero ni overlay flotante en móvil.
- Preferencia local `dv.appearance.v1`; clara, oscura o dispositivo. Sin datos
  personales ni analítica. Fallback sin JS conserva la apariencia existente.
- Las portadas fotográficas que dependen de una superficie ink la conservan;
  muestras de marca y fotografías no se filtran, recolorean ni sustituyen.
- Control de foco del diagnóstico reutiliza la corrección aprobada del piloto.
- Plantillas legales empaquetadas se mantienen empaquetadas; inicialización
  tardía explícita y escape correcto del cierre script dentro del JSON.
- Datos, esquemas JSON-LD, URLs canónicas, sitemap y cuerpos editoriales intactos.

## Revisión remota y seguridad

La rama codex/appearance-site-rollout usa únicamente el entorno Preview de Vercel.
Los tres endpoints de contacto/suscripción retornan antes de leer configuración,
payload o transportes cuando VERCEL_ENV=preview. GET de disponibilidad declara
simulación; los envíos retornan 503 sin persistencia, correo ni suscripción.
El flujo production conserva sus handlers originales. No se cambian credenciales.

El índice /api/appearance-review existe solo con VERCEL_ENV=preview; production
devuelve 404. Incluye enlaces claros/oscuros para las 21 páginas, pensado para móvil.
Preview: https://landing-git-codex-appearance-site-rollout-don-ventas.vercel.app/api/appearance-review
PR: https://github.com/donventas/landing/pull/61
La protección de Vercel permanece activa: un visitante sin sesión es redirigido
al acceso de Vercel. Arturo necesitará iniciar sesión con su cuenta autorizada
desde el celular. No se desactivó protección ni se compartieron secretos de bypass.
Vercel distingue entornos según su documentación oficial:
https://vercel.com/docs/environment-variables/system-environment-variables
https://vercel.com/docs/deployments/environments

## QA y compuertas

- 327 pruebas automatizadas pasan con Node 24. Node del sistema es anterior y
  no ejecuta los tests TypeScript existentes; no se modifica ese runtime.
- 21 pruebas comparan HTML completo contra integrar la versión baseline: solo
  inserciones previstas. Verificación independiente coincide: 21/21 preservados.
- Inicialización normal/tardía y almacenamiento bloqueado cubiertos por pruebas.
- Revisión móvil inicial de 21 páginas en clara/oscura, sin overflow horizontal
  de documento. Contraste de texto directo examinado; esto no equivale a una
  auditoría WCAG completa, no cubre automáticamente píxeles de imágenes/gradientes.
- Revisión independiente encontró carga tardía legal y contraste de compartir,
  encuestas, etiqueta legal y foco del diálogo; correcciones incorporadas. Cierre
  independiente de 2cf3777 sin bloqueantes en sus pendientes; 25 tests específicos
  y seis comprobaciones de wrappers sin acceso a cuerpo, cabeceras ni red.
- QA remoto inicial autenticado: 21 rutas en clara/oscura sin desbordamiento
  horizontal ni imágenes rotas detectadas. La etiqueta inicial 390/320 px era
  incompleta: `layout.width` medía el área útil (375/305), no el viewport.
  Esta ronda inicial no acredita por sí sola los anchos declarados ni ausencia
  global de fallos de contraste; el dictamen independiente encontró tres casos.
  La matriz corregida y sus límites se registran abajo.
- Selector remoto legal probado sobre el empaquetado real: cambia a oscuro;
  no depende de la simplificación del servidor local. GET remoto de comentarios
  confirma simulation y catálogo de regalos. CI y deploy de 2cf3777 exitosos.
- Flujo local controlado de tres respuestas: avance y foco correctos, casilla de
  marketing desmarcada, error simulado conserva respuestas y contacto ficticio.
  El aviso de analítica recibió además contraste ink explícito para sus enlaces.
- Evidencia local: appearance-evidence-2026-10-25 junto al worktree, capturas y
  resultados DOM. Viewports simulados no equivalen a probar Safari/iOS real.
- No se enviaron datos a destinatarios reales. No hay solicitudes de indexación.

## Correcciones focalizadas del dictamen de marca — 26 de octubre de 2026

El candidato be406fc186fae23d5bfa12d320e65034062b46ad recibió NO APTO para merge
y publicación. La dirección creativa se consideró alineada. Esta revisión conserva
el mismo baseline, ruta BSB y activos: no rediseña, reescribe ni modifica HTML.

- `appearance.css`: la regla general de enlaces de cabecera reduce especificidad
  con `:where` y excluye el CTA de diagnóstico. Recupera tinta sobre azul dentro
  de la superficie oscura de la cabecera: 6.68:1 en vez de 2.50:1.
- `appearance-families.css`: énfasis de `.editorial-method dd strong` en azul
  funcional sobre papel, 7.40:1 en vez de 1.58:1.
- Enlaces del footer de ambos artículos de contexto usan el token de contraste
  de su superficie: 7.40:1 en clara y 9.29:1 en oscura, en vez de 1.56:1 en clara.
- Tres pruebas nuevas protegen esos selectores y la respuesta de Sistema al
  cambio de media query, conservando la prioridad de una elección explícita.

Evidencia local durable: `appearance-evidence-pr61-r2`, junto al worktree, fuera
del repositorio público. Contiene cuatro matrices JSON, 180 casos interactivos,
tres capturas, el helper de QA y `summary.json`. No contiene contactos reales.

- 252 combinaciones: 21 rutas × 320/390/768/1280 px × clara/oscura/Sistema.
  Cada registro distingue `viewportWidth` (`innerWidth`), `contentWidth`
  (`documentElement.clientWidth`) y scrollbar. En esta ejecución, la diferencia
  es 15 px. También acredita preferencia, apariencia resuelta y hoja cargada.
- Sin overflow de documento en esas combinaciones. Los 216 elementos visibles
  afectados muestreados en la matriz tienen contraste textual >=4.5:1.
- 180 casos guardados de normal, foco de teclado, hover y pulsado real: 14
  controles a 320/390 y 16 a 768/1280, cada uno en las tres preferencias.
  Dos CTA se ocultan en móvil por el diseño preexistente; no se fuerzan visibles.
- Los 132 casos de móvil/tableta incluyen además una segunda lectura con hover
  sostenido entre capturas; las 48 muestras de escritorio registran hover y
  pulsado, sin una segunda muestra separada de hover sostenido.
- Sistema resolvió a oscuro en este navegador. Sus dos ramas y cambios de
  preferencia se comprobaron también por unit test, no cambiando el sistema
  operativo ni simulando una prueba física. No certifica Safari/iOS ni WCAG total.
- Hubo interrupciones del controlador y coordenadas no estabilizadas durante
  scroll. Esos intentos no cuentan como aprobados; las muestras finales guardadas
  se repitieron y se verificaron sin fallos. El viewport temporal fue restaurado.
- Suite completa: 327/327; `git diff --check` sin errores. Las pruebas de
  conservación de HTML y seguridad de Preview siguen pasando. No se enviaron
  formularios reales ni se tocaron los endpoints en esta corrección.

La evidencia del productor no sustituye el dictamen independiente. Se solicita
revisión focalizada del nuevo SHA; el NO APTO anterior no se convierte en APTO
por tests verdes o por haber subido estas correcciones.

## Release y rollback

Pendiente aceptación del candidato remoto por Arturo. No activar auto-merge.
Tras aprobación expresa del release se podrá fusionar; en ese momento revisar la
suite, el diff de producción y checks. Rollback mediante revert del futuro merge,
sin reset destructivo y preservando activos/copy baseline. La preferencia local
no afecta datos del cliente; versiones anteriores simplemente ignoran su clave.
