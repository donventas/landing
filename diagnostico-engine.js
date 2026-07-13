/* Don Ventas — Diagnóstico de marca: motor de scoring, segmentación, tier, propuesta, PSB y scripts.
   5 dimensiones (D1 Madurez · D2 Presencia · D3 Momento · D4 Inversión · D5 Urgencia) → score /100.
   Bandas: Starter 0–34 · Growth 35–64 · Pro 65–100. Reglas de excepción R1–R5.
   Lenguaje de dueño en pantalla; dimensiones y reglas solo en la vista interna. */

/* ===== preguntas — cada opción suma a su dimensión vía `p`; flags para modificadores ===== */
var QUESTIONS = [
  /* ---------- D1 · Madurez de marca actual (máx 25) ---------- */
  { id:'p11', dim:'d1', q:'¿Qué tiene hoy tu negocio en cuanto a identidad visual?',
    h:'Elige lo que más se parezca a tu realidad.',
    opts:[
      {b:'Nada formal', s:'El nombre y poco más', p:0},
      {b:'Un logo suelto', s:'Sin más definiciones', p:2},
      {b:'Logo + algunos elementos', s:'Colores que "usamos", alguna plantilla', p:4},
      {b:'Un manual, pero viejo o que nadie usa', s:'Existe en un cajón', p:5},
      {b:'Manual vigente y en uso', s:'Lo seguimos todos', p:7}
    ]},
  { id:'p12', dim:'d1', q:'¿Tu marca se ve igual en todos lados?',
    h:'Fachada, redes, papelería, web…',
    opts:[
      {b:'No lo había pensado', s:'No sé / nunca lo revisé', p:0},
      {b:'No — cada canal se ve diferente', s:'Cada quien le pone su estilo', p:1},
      {b:'Más o menos', s:'Hay parecido pero no consistencia', p:3},
      {b:'Sí, bastante consistente', s:'Se reconoce en todos lados', p:6}
    ]},
  { id:'p13', dim:'d1', q:'¿Tienes los archivos editables de tu logo?',
    h:'Vector, curvas — los que pide una imprenta.',
    opts:[
      {b:'No / no sé qué es eso', s:'', p:0},
      {b:'Solo imágenes', s:'JPG/PNG de WhatsApp', p:1},
      {b:'Algunos archivos', s:'No estoy seguro de cuáles', p:3},
      {b:'Sí, todos los formatos', s:'Vector y curvas en orden', p:5}
    ]},
  { id:'p14', dim:'d1', q:'¿Quién construyó tu identidad actual?',
    h:'De dónde salió tu logo y tu imagen.',
    opts:[
      {b:'Yo mismo', s:'Canva, plantillas, IA', p:1},
      {b:'Un conocido / freelancer económico', s:'Salió del compromiso', p:2},
      {b:'La imprenta o el proveedor de turno', s:'Me lo hicieron de pasada', p:2},
      {b:'Un diseñador profesional', s:'Pero sin estrategia detrás', p:4},
      {b:'Una agencia con proceso estratégico', s:'Con método y entregables', p:7}
    ]},

  /* ---------- D2 · Presencia y canales (máx 20) ---------- */
  { id:'p21', dim:'d2', multi:true, cap:6, q:'¿En qué canales está activo tu negocio hoy?',
    h:'Elige todos los que apliquen.',
    opts:[
      {b:'Local físico'},{b:'WhatsApp Business'},{b:'Instagram'},{b:'Facebook'},
      {b:'Sitio web propio'},{b:'Marketplace (ML / Amazon)'},{b:'LinkedIn'},
      {b:'TikTok / YouTube'},{b:'Email marketing'}
    ]},
  { id:'p22', dim:'d2', q:'¿Con qué frecuencia publican contenido?',
    h:'En redes, blog, lo que sea.',
    opts:[
      {b:'Casi nunca', s:'', p:0},
      {b:'Esporádico', s:'Cuando se puede', p:1},
      {b:'1–2 veces por semana', s:'Con cierta constancia', p:3},
      {b:'Diario o casi diario', s:'Hay calendario', p:4}
    ]},
  { id:'p23', dim:'d2', q:'¿Tienen sitio web?',
    h:'Dónde te encuentran fuera de redes.',
    opts:[
      {b:'No', s:'', p:0, noWeb:true},
      {b:'Solo perfil en redes / Google', s:'Sin sitio propio', p:1, noWeb:true},
      {b:'Landing básica', s:'Una página', p:2},
      {b:'Sitio completo', s:'Varias secciones', p:3},
      {b:'Sitio + e-commerce activo', s:'Vendo en línea', p:4}
    ]},
  { id:'p24', dim:'d2', q:'¿Quiénes necesitan usar la marca además de ti?',
    h:'Quién toca tus materiales.',
    opts:[
      {b:'Solo yo', s:'', p:0},
      {b:'2–5 personas del equipo', s:'', p:3},
      {b:'Equipo + proveedores externos', s:'Imprenta, community manager…', p:5},
      {b:'Equipo + proveedores + sucursales', s:'Varias plazas o franquicias', p:6}
    ]},

  /* ---------- D3 · Momento de negocio (máx 20, P3.3 modificador) ---------- */
  { id:'p31', dim:'d3', q:'¿En qué etapa está el negocio?',
    h:'Dónde estás hoy.',
    opts:[
      {b:'Idea / pre-lanzamiento', s:'Aún no abro', p:2},
      {b:'Operando, menos de 2 años', s:'Arrancando', p:3},
      {b:'2–5 años, consolidando', s:'Ya con tracción', p:5},
      {b:'Más de 5 años, establecido', s:'Negocio maduro', p:6},
      {b:'En expansión', s:'Nuevo mercado, sucursales, inversión', p:8}
    ]},
  { id:'p32', dim:'d3', q:'¿Cuántas personas trabajan en el negocio?',
    h:'Incluyéndote.',
    opts:[
      {b:'Solo yo', s:'', p:1},
      {b:'2–5', s:'', p:2},
      {b:'6–15', s:'', p:4},
      {b:'16 o más', s:'', p:5}
    ]},
  { id:'p33', dim:'d3', q:'¿Qué viene en los próximos 12 meses?',
    h:'Tu plan más importante.',
    opts:[
      {b:'Sobrevivir / estabilizar', s:'Mantener el barco', p:1},
      {b:'Crecer ventas en mis canales', s:'Más de lo mismo, mejor', p:3},
      {b:'Abrir local / nuevo mercado', s:'Expansión física o geográfica', p:5},
      {b:'Lanzar línea o producto nuevo', s:'Algo nuevo al mercado', p:5},
      {b:'Levantar capital, franquiciar o certificarme', s:'Salto estratégico', p:7, modR2:true}
    ]},

  /* ---------- D4 · Capacidad de inversión (máx 20, P4.4 modificador) ---------- */
  { id:'p41', dim:'d4', q:'¿Han invertido antes en diseño o marketing profesional?',
    h:'Aproximado al año.',
    opts:[
      {b:'Nada / casi nada', s:'', p:0},
      {b:'Menos de $10k MXN', s:'Al año', p:2},
      {b:'$10k–$50k MXN', s:'Al año', p:4},
      {b:'Más de $50k MXN', s:'Al año', p:6}
    ]},
  { id:'p42', dim:'d4', q:'¿Cómo ves la inversión en marca?',
    h:'Tu forma de pensarla.',
    opts:[
      {b:'Un gasto a minimizar', s:'Lo necesario y ya', p:1},
      {b:'Una inversión, si veo el retorno', s:'Con números claros', p:3},
      {b:'Una inversión estratégica clave', s:'Es cómo se compite', p:5}
    ]},
  { id:'p43', dim:'d4', q:'¿Quién toma la decisión de esta inversión?',
    h:'Quién dice sí.',
    opts:[
      {b:'Yo solo', s:'Decisión directa', p:3},
      {b:'Yo con mi socio/a o familia', s:'A dos manos', p:2},
      {b:'Un comité / consejo / corporativo', s:'Varias firmas', p:1}
    ]},
  { id:'p44', dim:'d4', q:'¿En qué rango te sentirías cómodo invirtiendo para resolverlo bien?',
    h:'Para dimensionar la propuesta. No es cotización.',
    opts:[
      {b:'Menos de $20k MXN', s:'Lo esencial', p:1, budget:'lt15'},
      {b:'$20k–$40k MXN', s:'Un sistema básico', p:3, budget:'15_40'},
      {b:'$40k–$80k MXN', s:'Un sistema completo', p:5, budget:'40_80'},
      {b:'Más de $80k MXN', s:'Todo, bien hecho', p:6, budget:'gt80'},
      {b:'Prefiero ver la propuesta', s:'Muéstrame y decido', p:3, budget:'ask'}
    ]},

  /* ---------- D5 · Urgencia y detonante (máx 15, P5.2 modificador) ---------- */
  { id:'p51', dim:'d5', q:'¿Por qué ahora? ¿Qué detonó buscar esto?',
    h:'Lo que te movió hoy.',
    opts:[
      {b:'Lo vengo pensando, sin prisa', s:'Algún día', p:1},
      {b:'Tengo un evento próximo', s:'Apertura, expo, lanzamiento', p:5},
      {b:'Perdí un cliente u oportunidad por imagen', s:'Me costó dinero', p:6},
      {b:'La competencia se ve mejor', s:'Me está rebasando', p:5},
      {b:'Una inversión o alianza lo exige', s:'Me lo están pidiendo', p:6}
    ]},
  { id:'p52', dim:'d5', q:'¿Para cuándo lo necesitas?',
    h:'Tu plazo real.',
    opts:[
      {b:'Sin fecha definida', s:'Cuando se pueda', p:1},
      {b:'En 2–3 meses', s:'', p:3},
      {b:'En 1 mes', s:'', p:4},
      {b:'Ya — para ayer', s:'Urgente', p:5, urgentNow:true}
    ]},
  { id:'p53', dim:'d5', q:'Si no lo resuelves este año, ¿qué pasa?',
    h:'El costo de no hacerlo.',
    opts:[
      {b:'Nada grave, seguimos igual', s:'', p:0},
      {b:'Seguimos perdiendo oportunidades', s:'Poco a poco', p:2},
      {b:'Se frena un plan concreto de crecimiento', s:'Algo importante se detiene', p:4}
    ]},

  /* ---------- abierta + contacto ---------- */
  { id:'goal', dim:'goal', q:'Si resolviéramos una sola cosa con tu marca, ¿cuál sería?',
    h:'En tus palabras.', free:true, placeholder:'Ej. que mi marca se vea tan seria como mi trabajo' },
  { id:'contact', dim:'contact', q:'¿A dónde te enviamos tu diagnóstico?',
    h:'Lo revisamos y te contactamos para una llamada de 30 minutos, sin costo.', contact:true }
];

/* ===== dimensiones (vista interna) ===== */
var DIMS=[
  {k:'d1', nm:'Madurez de marca', max:25},
  {k:'d2', nm:'Presencia y canales', max:20},
  {k:'d3', nm:'Momento de negocio', max:20},
  {k:'d4', nm:'Capacidad de inversión', max:20},
  {k:'d5', nm:'Urgencia y detonante', max:15}
];

/* ===== tiers (paquetes) — bandas de precio MXN, alcance, rondas y plazos ===== */
var TIERS={
  Starter:{ label:'Starter · Claridad y arranque', band:'0–34',
    priceLo:18000, priceHi:30000, pago:'50 / 50', plazo:'10–12 días hábiles',
    rondas:'2 de concepto · 1 por bloque', total:'6 bloques', estrategia:'Voz de marca express',
    bloques:['01 Logo','02 Color','03 Tipografía','09 Social básico','15 Papelería esencial','18 Referencia rápida'],
    scope:['Estrategia de voz express (propuesta de valor + esencia)','Logo, sistema de color y tipografía','Avatares y plantillas base de redes','Tarjeta, membrete y firma de correo','Guía maestra (HTML + PDF) + archivos finales de logo'] },
  Growth:{ label:'Growth · Sistema completo', band:'35–64',
    priceLo:35000, priceHi:60000, pago:'50 / 50', plazo:'20–25 días hábiles',
    rondas:'2 de concepto · 1 por bloque', total:'12 bloques', estrategia:'Estrategia y voz de marca completa',
    bloques:['01–03 Núcleo','04 Patterns','05 Íconos','06 Fotografía','07 Elementos gráficos','08 Presentaciones','09 Social completo','11 Contenido educativo','15 Papelería completa','18 Referencia'],
    scope:['Estrategia y voz de marca completa','Todo el núcleo + patterns, íconos, dirección de foto y gráficos','Plantillas de presentación y contenido educativo','Sistema de redes completo (feed, stories, carruseles)','Tokens (CSS/SCSS) + formatos editables (PPTX/DOCX)'] },
  Pro:{ label:'Pro · Marca integral', band:'65–100',
    priceLo:70000, priceHi:120000, pago:'40 / 30 / 30', plazo:'35–45 días hábiles',
    rondas:'3 de concepto · 2 por bloque', total:'18 bloques', estrategia:'Paquete estratégico completo',
    bloques:['Todo Growth','10 Landing','12 Merchandising','13 Stand y evento','14 Mascota','16 Memes / playful','17 Videoconferencia'],
    scope:['Paquete estratégico: research, perfil de cliente y posicionamiento','Los 18 bloques del sistema, aplicados a tus piezas reales','Landing, merch, stand, mascota y material de evento','Generadores parametrizables + bundles offline','Sistema de mockups y matriz de técnicas de producción'] }
};

/* ===== motor de scoring + segmentación ===== */
function segmentar(a){
  var d={d1:0,d2:0,d3:0,d4:0,d5:0};
  var flags={modR2:false,budget:null,urgentNow:false,canales:0,noWeb:false};
  QUESTIONS.forEach(function(Q){
    if(Q.multi){
      var arr=a[Q.id]||[]; flags.canales=arr.length;
      d[Q.dim]+=Math.min(arr.length, Q.cap||arr.length);
    } else if(Q.dim && Q.dim.charAt(0)==='d'){
      var sel=a['_sel_'+Q.id];
      if(sel!=null){
        var o=Q.opts[sel];
        d[Q.dim]+=o.p||0;
        if(o.modR2)flags.modR2=true;
        if(o.budget)flags.budget=o.budget;
        if(o.urgentNow)flags.urgentNow=true;
        if(o.noWeb)flags.noWeb=true;
      }
    }
  });
  // cap por dimensión
  DIMS.forEach(function(D){ if(d[D.k]>D.max)d[D.k]=D.max; });
  var total=d.d1+d.d2+d.d3+d.d4+d.d5;

  // banda
  var band = total<=34?'Starter' : (total<=64?'Growth':'Pro');
  var tier=band, rules=[], note=[];

  // R2 — piso estratégico (capital/franquicia/certificación) → piso Growth, sugiere Pro
  if(flags.modR2 && band==='Starter'){ tier='Growth'; rules.push('R2'); note.push('Tu plan (capital / franquicia / certificación) exige base estratégica: piso Growth, con Pro recomendado.'); }
  else if(flags.modR2 && band==='Growth'){ rules.push('R2'); note.push('Por tu plan estratégico, vale la pena evaluar el salto a Pro.'); }

  // R1 — techo presupuestal: el presupuesto señala un tier menor al de la banda
  var budgetTier={lt15:'Starter','15_40':'Starter','40_80':'Growth',gt80:'Pro',ask:null}[flags.budget];
  var order={Starter:0,Growth:1,Pro:2};
  if(budgetTier && order[budgetTier] < order[tier]){
    note.push('Tu situación pide '+tier+', pero tu rango cómodo encaja en '+budgetTier+': arrancamos en '+budgetTier+' y dejamos por escrito el roadmap para sumar el resto después.');
    tier=budgetTier; rules.push('R1');
  }

  // R3 — sin proyecto de manual: D1 alto (≥20) → bloques sueltos / refresh
  if(d.d1>=20){ rules.push('R3'); note.push('Tu marca ya está madura: en vez de un manual completo, conviene un refresh o bloques sueltos por cotización.'); }

  // R4 — urgencia incompatible con Pro
  if(flags.urgentNow && tier==='Pro'){ rules.push('R4'); note.push('Pro no cabe en "para ayer": lo hacemos en fases — Fase 1 express (núcleo) en 10–12 días y el resto después.'); }

  // R5 — banda Growth con presencia mínima → Starter+
  if(band==='Growth' && flags.canales<=2 && flags.noWeb){ rules.push('R5'); note.push('Tu presencia aún es mínima: mejor Starter + 1–2 bloques puntuales que un Growth completo.'); }

  return {d:d, total:total, band:band, tier:tier, rules:rules, note:note, flags:flags};
}

/* ===== diagnóstico para el cliente (sin jerga, 3 hallazgos) ===== */
function clienteDiagnostico(r,a){
  var f=[];
  var d1=r.d.d1;
  if(d1<=6) f.push({t:'Tu marca aún no trabaja para ti',p:'Tienes un negocio que funciona, pero tu imagen todavía no comunica por qué vales lo que vales. Hay mucho por ganar aquí.'});
  else if(d1<=14) f.push({t:'Tienes piezas, falta un sistema',p:'Ya hay logo y algunos elementos, pero no un sistema que se vea consistente y se sienta intencional en todos lados.'});
  else if(d1<20) f.push({t:'Buena base, lista para subir de nivel',p:'Tu marca está más armada que la del promedio; el salto es volverla un sistema completo y aplicado a tus piezas reales.'});
  else f.push({t:'Marca madura — toca afinar, no rehacer',p:'Ya tienes un sistema vigente. Lo que necesitas es un refresh o piezas puntuales, no empezar de cero.'});

  // momento / objetivo
  var mom={2:'Estás creciendo y tu marca tiene que crecer contigo para no quedarse chica.',
           3:'Vienen pasos grandes (nuevo mercado, producto o capital): tu marca tiene que respaldarlos.'}[
           r.d.d3>=13?3:2];
  f.push({t:'Tu momento lo pide ahora',p:(a.goal? '"'+a.goal+'" — '+mom : mom)});

  // urgencia / riesgo
  var urg = r.flags.urgentNow ? 'Lo necesitas pronto: lo bueno es que se puede arrancar por el núcleo y avanzar por fases.' :
            (r.d.d5>=10 ? 'Hay un detonante claro y un costo de no actuar: este es buen momento para moverte.' :
            'No hay incendio, y eso juega a tu favor: construir con calma da mejor resultado.');
  f.push({t:'Por qué tiene sentido empezar',p:urg});
  return f;
}

/* ===== helpers ===== */
function fmtMXN(n){return '$'+Math.round(n).toLocaleString('es-MX')+' MXN';}
function fmtRangeMXN(lo,hi){return '$'+Math.round(lo).toLocaleString('es-MX')+'–$'+Math.round(hi).toLocaleString('es-MX')+' MXN';}

/* ===== PSB (Project Scoping Block) — vista interna ===== */
function psbText(r,a){
  var t=TIERS[r.tier], hoy=new Date().toISOString().slice(0,10);
  var L=[];
  L.push('=== PROJECT SCOPING BLOCK — '+(a.empresa||'(cliente)')+' ('+hoy+') ===');
  L.push('SCORE: D1='+r.d.d1+'/25  D2='+r.d.d2+'/20  D3='+r.d.d3+'/20  D4='+r.d.d4+'/20  D5='+r.d.d5+'/15  TOTAL='+r.total+'/100');
  L.push('BANDA: '+r.band);
  L.push('REGLAS APLICADAS: '+(r.rules.length?r.rules.join(', '):'ninguna'));
  L.push('TIER FINAL: '+r.tier);
  L.push('CAPA ESTRATÉGICA: '+t.estrategia);
  L.push('BLOQUES EN ALCANCE: '+t.bloques.join(' · '));
  L.push('RONDAS: '+t.rondas);
  L.push('PLAZO COMPROMETIDO: '+t.plazo);
  L.push('BANDA DE PRECIO: '+fmtRangeMXN(t.priceLo,t.priceHi)+'  ANTICIPO: '+t.pago);
  if(r.note.length)L.push('NOTAS DE REGLA: '+r.note.join(' | '));
  L.push('OBJETIVO DEL CLIENTE: '+(a.goal||'—'));
  L.push('CONTACTO: '+(a.nombre||'—')+' · '+(a.email||'—')+' · '+(a.whatsapp||'—'));
  return L.join('\n');
}

/* ===== lead (vista interna) ===== */
function leadResumen(r,a,meta){
  var L=[];
  L.push('PROSPECTO — '+(a.empresa||'(empresa)')+' · '+r.tier+' ('+r.total+'/100)');
  L.push('Contacto: '+(a.nombre||'—')+' · '+(a.email||'—')+' · '+(a.whatsapp||'—'));
  L.push('');
  L.push('PERFIL (5 dimensiones):');
  DIMS.forEach(function(D){ L.push('· '+D.nm+': '+r.d[D.k]+'/'+D.max); });
  L.push('Score total: '+r.total+'/100 → banda '+r.band+' → tier '+r.tier);
  if(r.rules.length)L.push('Reglas: '+r.rules.join(', '));
  L.push('');
  L.push('Objetivo: '+(a.goal||'—'));
  L.push('');
  L.push('ORIGEN:');
  L.push('· Canal: '+(meta.source||a.canal||'—')+(meta.medium?(' / '+meta.medium):''));
  L.push('· Campaña: '+(meta.campaign||'—'));
  L.push('· Contenido que lo trajo: '+(a.contenido||meta.content||'—'));
  L.push('· Fecha: '+new Date().toLocaleString('es-MX'));
  return L.join('\n');
}

/* ===== propuesta (texto) ===== */
function propText(r,a){
  var t=TIERS[r.tier];
  var L=[];
  L.push('Propuesta Don Ventas — '+(a.empresa||'')+' · '+t.label);
  L.push('');
  L.push('Inversión: '+fmtRangeMXN(t.priceLo,t.priceHi)+'  ·  Pago '+t.pago);
  L.push('Plazo: '+t.plazo+'  ·  Rondas: '+t.rondas);
  L.push('');
  L.push('Incluye:');
  t.scope.forEach(function(s){L.push('· '+s);});
  L.push('');
  L.push('Bloques en alcance: '+t.bloques.join(' · '));
  if(r.note.length){ L.push(''); L.push('Notas: '+r.note.join(' ')); }
  L.push('');
  L.push('Banda de referencia en MXN, sujeta a confirmación en la llamada de diagnóstico. El diagnóstico de segmentación es sin costo.');
  return L.join('\n');
}

/* ===== scripts de venta ===== */
function coldScript(r,a,meta){
  var t=TIERS[r.tier];
  var canal=meta.source||a.canal||'nuestro contenido';
  var nombre=a.nombre? a.nombre.split(' ')[0]:'';
  var hook = r.d.d1<=6 ? 'que tu marca por fin comunique por qué vales lo que vales' :
             (r.d.d1<20 ? 'volver tu marca un sistema consistente y aplicado' : 'afinar tu marca con un refresh puntual');
  var S=[];
  S.push('GUION EN FRÍO — '+nombre+' · '+(a.empresa||'')+' ('+r.tier+')');
  S.push('');
  S.push('1) APERTURA');
  S.push('"Hola '+nombre+', soy [tu nombre] de Don Ventas. Hiciste nuestro diagnóstico de marca '+(canal!=='—'?('desde '+canal):'')+' — gracias por completarlo. ¿Te robo 2 minutos?"');
  S.push('');
  S.push('2) PUENTE (lo que nos dijo)');
  S.push('"Por lo que respondiste, tu prioridad ahora es '+hook+'. '+(a.goal?('Me quedé con esto: \u201c'+a.goal+'\u201d. '):'')+'Es justo lo que hacemos."');
  S.push('');
  S.push('3) VALOR EN UNA FRASE');
  S.push('"En Don Ventas no hacemos logos bonitos y ya. Construimos la razón por la que alguien te elige a ti — y lo paga sin regatear."');
  S.push('');
  S.push('4) PRUEBA SEGÚN SU CASO');
  S.push('"A negocios como el tuyo les armamos '+t.scope[0].toLowerCase()+' y '+(t.scope[1]||'').toLowerCase()+'."');
  S.push('');
  S.push('5) CIERRE A LA LLAMADA (no a la venta)');
  S.push('"Te preparé una propuesta a tu medida. ¿La vemos juntos 30 min por Zoom el [día] a las [hora]? Te muestro exactamente qué haríamos y cuánto."');
  S.push('');
  S.push('6) OBJECIÓN \u201cestá caro / no es momento\u201d');
  S.push('"Justo por eso la llamada: para que veas el retorno antes de decidir. El diagnóstico no te cuesta nada, y armamos un plan por etapas que arranca desde '+fmtMXN(t.priceLo)+'."');
  S.push('');
  S.push('REFERENCIA (no la sueltes salvo que pregunte): '+r.tier+' '+fmtRangeMXN(t.priceLo,t.priceHi)+' · pago '+t.pago+' · '+t.plazo+'.');
  return S.join('\n');
}

function contactMsg(r,a){
  var nombre=a.nombre? a.nombre.split(' ')[0]:'';
  return 'Hola '+nombre+', soy [tu nombre] de Don Ventas. Vi tu diagnóstico de marca — preparé una propuesta a la medida de '+(a.empresa||'tu negocio')+'. ¿Tienes 30 min esta semana para mostrártela por Zoom? Quedo atento. ¡Gracias!';
}
