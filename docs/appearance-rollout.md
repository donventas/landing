# Extensión de apariencia — candidato para revisión

Estado: desarrollo; no merge ni publicación de producción autorizados para este release.
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
Vercel distingue entornos según su documentación oficial:
https://vercel.com/docs/environment-variables/system-environment-variables
https://vercel.com/docs/deployments/environments

## QA y compuertas

- 324 pruebas automatizadas pasan con Node 24. Node del sistema es anterior y
  no ejecuta los tests TypeScript existentes; no se modifica ese runtime.
- 21 pruebas comparan HTML completo contra integrar la versión baseline: solo
  inserciones previstas. Verificación independiente coincide: 21/21 preservados.
- Inicialización normal/tardía y almacenamiento bloqueado cubiertos por pruebas.
- Revisión móvil inicial de 21 páginas en clara/oscura, sin overflow horizontal
  de documento. Contraste de texto directo examinado; esto no equivale a una
  auditoría WCAG completa, no cubre automáticamente píxeles de imágenes/gradientes.
- Revisión independiente encontró carga tardía legal y contraste de compartir,
  encuestas, etiqueta legal y foco del diálogo; correcciones incorporadas, cierre
  renderizado y comprobación remota pendientes antes de entregar este candidato.
- No se enviaron datos a destinatarios reales. No hay solicitudes de indexación.

## Release y rollback

Pendiente completar QA remoto y aceptación del candidato. No activar auto-merge.
Tras aprobación expresa del release se podrá fusionar; en ese momento revisar la
suite, el diff de producción y checks. Rollback mediante revert del futuro merge,
sin reset destructivo y preservando activos/copy baseline. La preferencia local
no afecta datos del cliente; versiones anteriores simplemente ignoran su clave.
