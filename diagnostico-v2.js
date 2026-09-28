/* Don Ventas — motor compartido de diagnóstico v2.
   Dinámico: muestra únicamente preguntas aplicables.
   Determinista: las mismas respuestas producen la misma ruta y recomendación.
   La recomendación en pantalla es preliminar; el PDF conserva revisión humana. */
(function(root){
  'use strict';

  var CONFIG={
    SUPABASE_URL:'https://hlabhmegjnrjygsywnqa.supabase.co',
    SUPABASE_ANON:'sb_publishable_Pk-_A1MghCXv9F5r9TvcxA_vkf08JYh',
    LEAD_TABLE:'lead'
  };

  var CONTENT_QUESTIONS=[
    {id:'outcome',type:'single',title:'¿Qué quieres lograr primero?',hint:'Elige el resultado que más importa en los próximos 90 días.',required:true,auto:true,options:[
      {id:'traffic',label:'Atraer personas que sí podrían comprar',desc:'Que lleguen personas con una necesidad real.'},
      {id:'orders',label:'Generar más conversaciones o pedidos',desc:'Acercar el contenido a una acción comercial.'},
      {id:'trust',label:'Construir confianza antes de la decisión',desc:'Explicar mejor por qué elegirte.'},
      {id:'search',label:'Aparecer mejor en Google y herramientas de inteligencia artificial',desc:'Ser encontrado y entendido cuando investigan.'},
      {id:'consistency',label:'Publicar con mayor consistencia',desc:'Dejar de empezar desde cero cada semana.'},
      {id:'other',label:'Otro resultado',other:true}
    ]},
    {id:'monthlyBudget',type:'single',title:'¿Qué inversión mensual puedes sostener durante al menos 90 días?',hint:'Sirve para recomendar un ritmo realista. No es una cotización.',required:true,auto:true,options:[
      {id:'lt12',label:'Menos de $12,000 MXN al mes'},
      {id:'12_20',label:'$12,000–$20,000 MXN al mes'},
      {id:'21_32',label:'$21,000–$32,000 MXN al mes'},
      {id:'33_50',label:'$33,000–$50,000 MXN al mes'},
      {id:'gt50',label:'Más de $50,000 MXN al mes'},
      {id:'unknown',label:'Aún no tengo un presupuesto definido'}
    ]},
    {id:'timing',type:'single',title:'¿Cuándo quieres empezar?',hint:'La fecha ayuda a separar una prioridad real de una exploración.',required:true,auto:true,options:[
      {id:'now',label:'Lo antes posible'},
      {id:'month',label:'Durante el próximo mes'},
      {id:'quarter',label:'En dos o tres meses'},
      {id:'exploring',label:'Solo estoy explorando por ahora'}
    ]},
    {id:'obstacle',type:'single',title:'¿Qué frena más tu contenido hoy?',hint:'Selecciona el problema principal.',required:true,auto:true,options:[
      {id:'ideas',label:'No sabemos qué publicar',desc:'Faltan temas y una dirección clara.'},
      {id:'quality',label:'El contenido no refleja la calidad del negocio',desc:'El diseño, los textos o el mensaje se sienten genéricos.'},
      {id:'cadence',label:'Publicamos sin consistencia',desc:'La operación depende del tiempo disponible.'},
      {id:'conversion',label:'Hay atención, pero pocas conversaciones o pedidos',desc:'Falta una razón o un siguiente paso claro.'},
      {id:'site',label:'El sitio no explica ni aparece en búsquedas',desc:'Las personas encuentran dudas cuando están por decidir.'},
      {id:'other',label:'Otro problema',other:true}
    ]},
    {id:'channels',type:'multi',title:'¿Dónde tiene presencia activa tu negocio?',hint:'Puedes elegir varias opciones.',required:true,options:[
      {id:'instagram',label:'Instagram'}, {id:'facebook',label:'Facebook'},
      {id:'linkedin',label:'LinkedIn'}, {id:'tiktok',label:'TikTok / YouTube'},
      {id:'website',label:'Sitio web'}, {id:'google',label:'Google / Maps'},
      {id:'whatsapp',label:'WhatsApp Business'}, {id:'other',label:'Otro canal',other:true}
    ]},
    {id:'cadence',type:'single',title:'¿Con qué frecuencia publican?',hint:'Cuenta redes, blog, newsletter o video.',required:true,auto:true,options:[
      {id:'rare',label:'Casi nunca'},
      {id:'sporadic',label:'Cuando se puede'},
      {id:'weekly',label:'Una o dos veces por semana'},
      {id:'frequent',label:'Tres o más veces por semana'}
    ]},
    {id:'siteState',type:'single',title:'¿Qué papel cumple hoy tu sitio web?',hint:'Esto nos ayuda a saber si también necesitas mejorar el sitio y los buscadores.',required:true,auto:true,options:[
      {id:'none',label:'No tenemos sitio'},
      {id:'social',label:'Solo usamos redes o Google Maps'},
      {id:'basic',label:'Tenemos una página básica que casi no genera contactos'},
      {id:'works',label:'El sitio explica bien y sí genera contactos'},
      {id:'unknown',label:'No sabemos si está funcionando'}
    ]},
    {id:'setupBudget',type:'single',title:'Si necesitas mejorar el sitio para aparecer en Google o en herramientas de IA, ¿qué inversión inicial considerarías?',hint:'Solo aparece cuando tus respuestas indican que hoy es difícil encontrar o entender tu negocio.',required:true,auto:true,showIf:function(a){return needsSearch(a);},options:[
      {id:'lt25',label:'Menos de $25,000 MXN'},
      {id:'25_45',label:'$25,000–$45,000 MXN'},
      {id:'46_80',label:'$46,000–$80,000 MXN'},
      {id:'81_120',label:'$81,000–$120,000 MXN'},
      {id:'gt120',label:'Más de $120,000 MXN'},
      {id:'unknown',label:'Aún no tengo un presupuesto definido'}
    ]},
    {id:'resources',type:'multi',title:'¿Qué materiales o recursos tienes disponibles?',hint:'No necesitas tener todo; nos ayuda a dimensionar la producción.',required:true,options:[
      {id:'spokesperson',label:'Una persona que pueda aparecer o dar entrevistas'},
      {id:'photos',label:'Fotos o video propios'},
      {id:'cases',label:'Casos, resultados o testimonios verificables'},
      {id:'team',label:'Alguien del equipo puede revisar y aprobar'},
      {id:'none',label:'Necesitamos construirlo casi desde cero'},
      {id:'other',label:'Otro recurso',other:true}
    ]},
    {id:'offer',type:'text',title:'¿Qué vende tu negocio y qué debería hacer una persona interesada?',hint:'Descríbelo en palabras simples. Evita pegar una presentación completa.',required:true,placeholder:'Ej. Ayudamos a restaurantes a reducir desperdicio; el siguiente paso es pedir una demostración.'},
    {id:'audience',type:'text',title:'¿A quién necesitas atraer?',hint:'Describe al cliente que más te interesa y lo que está intentando resolver.',required:true,placeholder:'Ej. Dueños de restaurantes con dos o más sucursales que buscan controlar costos.'},
    contactQuestion('contenido')
  ];

  var BRAND_QUESTIONS=[
    {id:'desired',type:'single',title:'¿Qué quieres resolver primero con tu marca?',hint:'Elige el resultado que más cambiaría cómo publicas, presentas o vendes.',required:true,auto:true,options:[
      {id:'clarity',label:'Que la marca se entienda mejor',desc:'Aclarar qué vendes, para quién y por qué elegirte.'},
      {id:'consistency',label:'Que todo se vea y suene consistente',desc:'Dejar de improvisar entre canales y proveedores.'},
      {id:'autonomy',label:'Que el equipo pueda crear sin depender de una agencia',desc:'Tener reglas, plantillas y archivos utilizables.'},
      {id:'launch',label:'Lanzar una marca nueva con una base sólida'},
      {id:'reposition',label:'Reposicionar una marca que ya existe'},
      {id:'other',label:'Otro resultado',other:true}
    ]},
    {id:'projectBudget',type:'single',title:'¿Qué inversión considerarías para resolverlo bien?',hint:'El rango sirve para recomendar profundidad y aplicaciones. No es una cotización.',required:true,auto:true,options:[
      {id:'lt18',label:'Menos de $18,000 MXN'},
      {id:'18_30',label:'$18,000–$30,000 MXN'},
      {id:'31_60',label:'$31,000–$60,000 MXN'},
      {id:'61_120',label:'$61,000–$120,000 MXN'},
      {id:'gt120',label:'Más de $120,000 MXN'},
      {id:'unknown',label:'Aún no tengo un presupuesto definido'}
    ]},
    {id:'timing',type:'single',title:'¿Cuándo necesitas empezar?',hint:'El plazo modifica el orden y la capacidad necesaria.',required:true,auto:true,options:[
      {id:'now',label:'Lo antes posible'},
      {id:'month',label:'Durante el próximo mes'},
      {id:'quarter',label:'En dos o tres meses'},
      {id:'exploring',label:'Solo estoy explorando por ahora'}
    ]},
    {id:'stage',type:'single',title:'¿En qué momento está el negocio?',hint:'Selecciona la situación más cercana.',required:true,auto:true,options:[
      {id:'idea',label:'Estamos en la idea o pre-lanzamiento'},
      {id:'early',label:'Ya operamos, pero la marca todavía es improvisada'},
      {id:'established',label:'El negocio está establecido y queremos profesionalizarlo'},
      {id:'expansion',label:'Estamos expandiendo, lanzando o entrando a otro mercado'},
      {id:'rebrand',label:'Necesitamos corregir o reemplazar una identidad existente'}
    ]},
    {id:'assets',type:'single',title:'¿Qué tienes hoy en cuanto a identidad?',hint:'No evaluamos si te gusta; necesitamos conocer el punto de partida.',required:true,auto:true,options:[
      {id:'none',label:'Solo el nombre o una idea'},
      {id:'logo',label:'Un logo suelto'},
      {id:'basic',label:'Logo, colores y algunas plantillas'},
      {id:'manualOld',label:'Un manual que está viejo o nadie usa'},
      {id:'system',label:'Un sistema vigente y utilizado'}
    ]},
    {id:'consistency',type:'single',title:'¿La marca se reconoce igual en todos sus puntos de contacto?',hint:'Redes, presentaciones, sitio, propuestas, empaque y proveedores.',required:true,auto:true,options:[
      {id:'no',label:'No; cada canal se ve diferente'},
      {id:'partial',label:'Más o menos; hay elementos comunes'},
      {id:'yes',label:'Sí; existe una consistencia clara'},
      {id:'unknown',label:'No lo hemos revisado'}
    ]},
    {id:'users',type:'single',title:'¿Quién necesita usar la marca?',hint:'Esto define cuánto sistema y documentación hacen falta.',required:true,auto:true,options:[
      {id:'owner',label:'Solo yo'},
      {id:'smallTeam',label:'Un equipo de 2–5 personas'},
      {id:'providers',label:'Equipo y proveedores externos'},
      {id:'scale',label:'Equipo, proveedores y varias unidades o sucursales'}
    ]},
    {id:'applications',type:'multi',title:'¿Dónde necesitas que la marca funcione?',hint:'Puedes elegir varias aplicaciones.',required:true,options:[
      {id:'social',label:'Contenido y redes'},
      {id:'sales',label:'Presentaciones, propuestas y ventas'},
      {id:'web',label:'Sitio o producto digital'},
      {id:'print',label:'Papelería e impresos'},
      {id:'packaging',label:'Empaque o producto'},
      {id:'space',label:'Local, evento o señalización'},
      {id:'other',label:'Otra aplicación',other:true}
    ]},
    {id:'autonomy',type:'single',title:'¿Qué nivel de autonomía buscas después del proyecto?',hint:'Una marca útil debe poder operarse, no quedarse como presentación.',required:true,auto:true,options:[
      {id:'agency',label:'Prefiero que Don Ventas siga operándola'},
      {id:'shared',label:'Queremos operar una parte y recibir acompañamiento'},
      {id:'independent',label:'Queremos reglas, archivos y plantillas para operar solos'}
    ]},
    {id:'difference',type:'text',title:'¿Qué hace valioso o diferente a tu negocio?',hint:'Si todavía no está claro, dilo: esa también es información útil.',required:true,placeholder:'Ej. Tenemos diez años resolviendo… Nuestros clientes nos eligen porque…'},
    contactQuestion('branding')
  ];

  function contactQuestion(route){
    return {id:'contact',type:'contact',title:'¿A dónde enviamos tu diagnóstico?',hint:route==='branding'?'Revisaremos tu sistema actual y prepararemos una recomendación de alcance.':'Revisaremos tu contenido, presencia y oportunidades antes de preparar el PDF.',required:true};
  }

  function needsSearch(a){
    return a.entry==='autoridad'||a.entry==='motor'||a.outcome==='search'||a.outcome==='trust'||a.obstacle==='site'||['none','social','basic','unknown'].indexOf(a.siteState)>=0;
  }

  function monthlyRank(v){return {lt12:0,'12_20':1,'21_32':2,'33_50':3,gt50:4,unknown:-1}[v];}
  function setupRank(v){return {lt25:0,'25_45':1,'46_80':2,'81_120':3,gt120:4,unknown:-1}[v];}
  function brandBudgetRank(v){return {lt18:0,'18_30':1,'31_60':2,'61_120':3,gt120:4,unknown:-1}[v];}

  function recommendContent(a){
    var search=needsSearch(a);
    var content=a.entry!=='autoridad' && (a.entry==='motor'||['traffic','orders','consistency'].indexOf(a.outcome)>=0||['ideas','quality','cadence','conversion'].indexOf(a.obstacle)>=0);
    var key=search&&content?'motor':(search?'autoridad':'contenido');
    var catalog={
      contenido:{name:'Contenido para atraer posibles clientes',band:'$12,000–$32,000 MXN al mes',desc:'Temas, textos y diseños principales, con versiones para cada canal y revisión mensual.'},
      autoridad:{name:'Sitio para que te encuentren y confíen',band:'$25,000–$80,000 MXN de implementación',desc:'Un sitio claro, mejoras para buscadores (SEO) y respuestas fáciles de entender para herramientas de IA.'},
      motor:{name:'Redes, sitio, buscadores e inteligencia artificial',band:'$35,000–$95,000 MXN de implementación + $28,000–$50,000 MXN al mes',desc:'Contenido, sitio, búsquedas y mejora continua conectados en un solo plan.'}
    };
    var m=monthlyRank(a.monthlyBudget),s=setupRank(a.setupBudget),gap=false,start='';
    if(key==='contenido' && m===0){gap=true;start='Conviene iniciar con un alcance acotado o madurar recursos antes de una operación mensual completa.';}
    if(key==='autoridad' && (s===0||s===-1)){gap=true;start=s===0?'Conviene empezar por una intervención priorizada antes de construir el sistema completo.':'La inversión inicial debe confirmarse antes de definir el alcance.';}
    if(key==='motor' && (m<3||s<1)){
      gap=true;
      start=search?'Necesitas trabajar más de un frente, pero recomendamos hacerlo por etapas: primero el problema más importante que cabe en tu presupuesto y después el segundo.':'Recomendamos una primera etapa acotada y un plan para conectar el resto.';
    }
    var reasons=[];
    if(content)reasons.push('Tus respuestas muestran que necesitas mejores temas, mayor constancia o un siguiente paso más claro para vender.');
    if(search)reasons.push('También hay un problema en el sitio o es difícil encontrar y entender tu negocio antes de decidir.');
    if(a.resources&&a.resources.indexOf('none')>=0)reasons.push('La producción deberá incluir una fase inicial para construir evidencia y materiales.');
    if(a.timing==='exploring')reasons.push('El momento todavía es exploratorio; el PDF debe ayudarte a decidir sin forzar una compra.');
    return {route:'contenido',key:key,name:catalog[key].name,band:catalog[key].band,desc:catalog[key].desc,gap:gap,start:start,reasons:reasons};
  }

  function recommendBrand(a){
    var score=0;
    if(['none','logo'].indexOf(a.assets)>=0)score+=2; else if(['basic','manualOld'].indexOf(a.assets)>=0)score+=1;
    if(a.consistency==='no')score+=2; else if(a.consistency!=='yes')score+=1;
    if(a.users==='providers')score+=1; else if(a.users==='scale')score+=2;
    if((a.applications||[]).length>=4)score+=2; else if((a.applications||[]).length>=2)score+=1;
    if(a.autonomy==='independent')score+=1;
    if(['expansion','rebrand'].indexOf(a.stage)>=0)score+=1;
    var need=score<=3?'essential':(score<=6?'complete':'extended');
    var catalog={
      essential:{name:'Sistema esencial',band:'$18,000–$30,000 MXN',desc:'Claridad, núcleo visual y las reglas mínimas para dejar de improvisar.'},
      complete:{name:'Sistema de marca completo',band:'$31,000–$60,000 MXN',desc:'Mensaje, identidad y usos prioritarios para que la marca sea consistente.'},
      extended:{name:'Sistema extendido',band:'$61,000–$120,000 MXN',desc:'Una guía amplia para equipos, proveedores y todos los lugares donde aparece la marca.'}
    };
    var needRank={essential:1,complete:2,extended:3}[need],capacity=brandBudgetRank(a.projectBudget),gap=capacity>=0&&capacity<needRank;
    var start='';
    if(a.projectBudget==='lt18')start='El presupuesto está por debajo del mínimo de un sistema completo; conviene priorizar una intervención puntual o una ruta de maduración.';
    else if(gap)start='La necesidad es mayor que el rango disponible. Recomendamos construir el sistema por etapas y dejar un plan claro para completarlo.';
    else if(a.projectBudget==='unknown')start='Primero debemos validar profundidad, aplicaciones y capacidad antes de cerrar el alcance.';
    var reasons=[];
    if(['none','logo'].indexOf(a.assets)>=0)reasons.push('El punto de partida todavía no funciona como un sistema reutilizable.');
    if(a.consistency!=='yes')reasons.push('Los lugares donde aparece la marca necesitan reglas y recursos comunes.');
    if(['providers','scale'].indexOf(a.users)>=0)reasons.push('Varias personas o proveedores necesitan una fuente clara para aplicar la marca.');
    if(a.autonomy==='independent')reasons.push('La autonomía exige archivos editables, plantillas, documentación y transferencia de uso.');
    return {route:'branding',key:need,name:catalog[need].name,band:catalog[need].band,desc:catalog[need].desc,gap:gap||a.projectBudget==='lt18'||a.projectBudget==='unknown',start:start,reasons:reasons,score:score};
  }

  function recommendation(route,a){return route==='branding'?recommendBrand(a):recommendContent(a);}

  function questionsFor(route){return route==='branding'?BRAND_QUESTIONS:CONTENT_QUESTIONS;}
  function visibleQuestions(route,state){return questionsFor(route).filter(function(q){return !q.showIf||q.showIf(state);});}

  function optionLabel(question,value){
    var option=(question.options||[]).filter(function(o){return o.id===value;})[0];
    return option?option.label:value;
  }

  function summarize(route,state,result){
    var lines=['Ruta: '+route,'Recomendación: '+result.name,'Rango: '+result.band];
    visibleQuestions(route,state).forEach(function(q){
      if(q.type==='contact')return;
      var value=state[q.id];
      if(value==null||value===''||(Array.isArray(value)&&!value.length))return;
      if(Array.isArray(value))value=value.map(function(v){return optionLabel(q,v);}).join(', ');
      else if(q.options)value=optionLabel(q,value);
      if(state[q.id+'Other'])value+=': '+state[q.id+'Other'];
      lines.push(q.title+' '+value);
    });
    return lines.join(' | ');
  }

  function escapeHtml(value){return String(value==null?'':value).replace(/[&<>'"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch];});}

  function clean(value){return String(value==null?'':value).trim();}
  function validEmail(value){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value));}
  function validWebUrl(value){
    var text=clean(value);
    if(!text)return true;
    if(!/^https?:\/\//i.test(text))return false;
    try{
      var parsed=new URL(text);
      return !!parsed.hostname&&parsed.hostname.indexOf('.')>0;
    }catch(_e){return false;}
  }
  function contactErrors(state){
    var errors={};
    if(!clean(state.name))errors.name='Escribe tu nombre.';
    if(!clean(state.business))errors.business='Escribe el nombre de tu negocio o marca.';
    if(!clean(state.email))errors.email='Escribe un correo para enviarte el diagnóstico.';
    else if(!validEmail(state.email))errors.email='Revisa el correo. Ejemplo: nombre@empresa.com';
    if(clean(state.url)&&!validWebUrl(state.url))errors.url='Escribe una dirección completa que empiece con https:// o deja este campo vacío.';
    if(!state.consent)errors.consent='Necesitamos tu autorización para guardar las respuestas y contactarte.';
    return errors;
  }

  function submitErrorMessage(error){
    if(error&&error.name==='AbortError')return 'La conexión tardó demasiado. Tus respuestas siguen guardadas; intenta nuevamente.';
    if(error&&(error.status===401||error.status===403))return 'El formulario no pudo guardar tu solicitud. Tus respuestas siguen guardadas; intenta nuevamente o escríbenos por correo.';
    if(error&&error.status>=400&&error.status<500)return 'No pudimos guardar la solicitud. Revisa los datos e intenta nuevamente.';
    return 'No tuvimos conexión con el servicio de registro. Tus respuestas siguen guardadas; intenta nuevamente.';
  }

  function Diagnostic(el){
    this.el=el;
    var params=new URLSearchParams(location.search);
    this.route=(params.get('ruta')||el.getAttribute('data-route')||'contenido').toLowerCase();
    if(['contenido','branding'].indexOf(this.route)<0)this.route='contenido';
    this.storageKey='dv-diagnostic-v2-'+this.route;
    this.state={entry:params.get('entrada')||el.getAttribute('data-entry')||''};
    this.index=0;
    this.load();
    this.render();
    this.bindEntryLinks();
  }

  Diagnostic.prototype.load=function(){
    try{var saved=JSON.parse(localStorage.getItem(this.storageKey)||'null');if(saved&&saved.state){this.state=saved.state;this.index=saved.index||0;}}catch(_e){}
  };
  Diagnostic.prototype.persist=function(){
    try{localStorage.setItem(this.storageKey,JSON.stringify({state:this.state,index:this.index}));}catch(_e){}
  };
  Diagnostic.prototype.bindEntryLinks=function(){
    var self=this;
    [].slice.call(document.querySelectorAll('[data-diagnostic-entry]')).forEach(function(link){
      link.addEventListener('click',function(){self.state.entry=link.getAttribute('data-diagnostic-entry')||'';self.persist();});
    });
  };
  Diagnostic.prototype.current=function(){
    var list=visibleQuestions(this.route,this.state);
    if(this.index>=list.length)this.index=list.length-1;
    return {list:list,q:list[this.index]};
  };
  Diagnostic.prototype.hasAnswer=function(q){
    if(q.type==='contact')return Object.keys(contactErrors(this.state)).length===0;
    var value=this.state[q.id];
    if(q.type==='multi')return !q.required||(Array.isArray(value)&&value.length>0);
    if(q.required&&(value==null||String(value).trim()===''))return false;
    if(value==='other'&&!String(this.state[q.id+'Other']||'').trim())return false;
    return true;
  };
  Diagnostic.prototype.render=function(){
    var current=this.current(),q=current.q,list=current.list;
    if(!q)return;
    var progress=Math.round(((this.index+1)/list.length)*100);
    var routeLabel=this.route==='branding'?'Sistema de marca':'Contenido, sitio y buscadores';
    var h='<div class="dv-form-shell" data-route-name="'+this.route+'">';
    h+='<div class="dv-form-top"><div><span class="dv-form-kicker">Diagnóstico · '+routeLabel+'</span><strong>'+(this.index+1)+' / '+list.length+'</strong></div><div class="dv-progress" aria-label="Progreso"><i style="width:'+progress+'%"></i></div></div>';
    h+='<div class="dv-step" aria-live="polite"><h3>'+escapeHtml(q.title)+'</h3>';
    if(q.hint)h+='<p class="dv-step-hint">'+escapeHtml(q.hint)+'</p>';
    h+=this.fieldHtml(q);
    h+='<div class="dv-form-nav">'+(this.index?'<button type="button" class="btn dv-back">← Atrás</button>':'<span></span>')+'<button type="button" class="btn solid dv-next"'+(this.hasAnswer(q)?'':' disabled')+'>'+(q.type==='contact'?'Enviar y ver recomendación':'Continuar')+' <span class="ar">→</span></button></div>';
    if(this.index===0)h+='<p class="dv-form-note">4–6 minutos · presupuesto al inicio · revisión humana en 3–5 días hábiles</p>';
    h+='</div></div>';
    this.el.innerHTML=h;
    this.bind(q);
  };
  Diagnostic.prototype.fieldHtml=function(q){
    var self=this,h='';
    if(q.type==='single'||q.type==='multi'){
      h+='<div class="dv-options '+(q.type==='multi'?'is-multi':'')+'">';
      q.options.forEach(function(o,i){
        var selected=q.type==='multi'?(self.state[q.id]||[]).indexOf(o.id)>=0:self.state[q.id]===o.id;
        h+='<button type="button" class="dv-option'+(selected?' is-selected':'')+'" data-value="'+o.id+'" aria-pressed="'+(selected?'true':'false')+'"><span class="dv-option-key">'+String.fromCharCode(65+i)+'</span><span><b>'+escapeHtml(o.label)+'</b>'+(o.desc?'<small>'+escapeHtml(o.desc)+'</small>':'')+'</span><i aria-hidden="true"></i></button>';
      });
      h+='</div>';
      var selectedOther=q.type==='multi'?(this.state[q.id]||[]).indexOf('other')>=0:this.state[q.id]==='other';
      if(selectedOther)h+='<label class="dv-other">Tu respuesta<textarea rows="2" data-field="'+q.id+'Other" placeholder="Escríbela en tus palabras">'+escapeHtml(this.state[q.id+'Other']||'')+'</textarea></label>';
    }else if(q.type==='text'){
      h+='<label class="dv-textarea"><textarea rows="5" data-field="'+q.id+'" placeholder="'+escapeHtml(q.placeholder||'')+'">'+escapeHtml(this.state[q.id]||'')+'</textarea></label>';
    }else if(q.type==='contact'){
      h+='<div class="dv-contact-grid"><label data-field-wrap="name">Tu nombre <span>obligatorio</span><input data-field="name" autocomplete="name" maxlength="160" required value="'+escapeHtml(this.state.name||'')+'"><small class="dv-field-error" data-error-for="name" aria-live="polite" hidden></small></label><label data-field-wrap="business">Negocio o marca <span>obligatorio</span><input data-field="business" autocomplete="organization" maxlength="200" required value="'+escapeHtml(this.state.business||'')+'"><small class="dv-field-error" data-error-for="business" aria-live="polite" hidden></small></label><label data-field-wrap="email">Correo de trabajo <span>obligatorio</span><input data-field="email" type="email" autocomplete="email" maxlength="320" required value="'+escapeHtml(this.state.email||'')+'"><small class="dv-field-error" data-error-for="email" aria-live="polite" hidden></small></label><label>WhatsApp <span>opcional</span><input data-field="whatsapp" autocomplete="tel" maxlength="80" value="'+escapeHtml(this.state.whatsapp||'')+'"></label></div>';
      h+='<label class="dv-contact-full" data-field-wrap="url">Sitio o red principal <span>opcional</span><input data-field="url" type="url" inputmode="url" placeholder="https://" value="'+escapeHtml(this.state.url||'')+'"><small class="dv-field-help">Déjalo vacío si todavía no tienes sitio web o una red principal.</small><small class="dv-field-error" data-error-for="url" aria-live="polite" hidden></small></label>';
      h+='<label class="dv-consent"><input data-field="consent" type="checkbox"'+(this.state.consent?' checked':'')+'><span>Acepto que Don Ventas use esta información para preparar el diagnóstico y contactarme. Leí el <a href="15_LEGAL/Aviso de Privacidad.html" target="_blank" rel="noopener">Aviso de Privacidad</a>.</span></label>';
      h+='<small class="dv-field-error dv-consent-error" data-error-for="consent" aria-live="polite" hidden></small>';
    }
    return h;
  };
  Diagnostic.prototype.bind=function(q){
    var self=this,next=this.el.querySelector('.dv-next'),back=this.el.querySelector('.dv-back');
    if(back)back.onclick=function(){self.index=Math.max(0,self.index-1);self.render();self.persist();};
    if(next)next.onclick=function(){
      self.captureFields();
      if(!self.hasAnswer(q)){self.render();return;}
      if(q.type==='contact'){self.finish();return;}
      self.index+=1;self.render();self.persist();self.track('diagnostic_step_completed',{route:self.route,step:q.id});
    };
    [].slice.call(this.el.querySelectorAll('.dv-option')).forEach(function(btn){
      btn.onclick=function(){
        var value=btn.getAttribute('data-value');
        if(q.type==='multi'){
          var values=self.state[q.id]||[],pos=values.indexOf(value);
          if(pos>=0)values.splice(pos,1);else values.push(value);
          self.state[q.id]=values;self.render();self.persist();
        }else{
          self.state[q.id]=value;self.persist();
          if(q.auto&&value!=='other'){setTimeout(function(){self.index+=1;self.render();self.persist();},170);}else self.render();
        }
      };
    });
    [].slice.call(this.el.querySelectorAll('[data-field]')).forEach(function(field){
      var event=field.type==='checkbox'?'change':'input';
      field.addEventListener(event,function(){
        self.captureFields();
        if(q.type==='contact'){
          var fieldName=field.getAttribute('data-field'),errors=contactErrors(self.state);
          if(field.type==='checkbox'||field.getAttribute('aria-invalid')==='true'||clean(field.value))self.setFieldError(fieldName,errors[fieldName]||'');
        }
        var n=self.el.querySelector('.dv-next');if(n)n.disabled=!self.hasAnswer(q);self.persist();
      });
      if(q.type==='contact')field.addEventListener('blur',function(){self.captureFields();var fieldName=field.getAttribute('data-field'),errors=contactErrors(self.state);self.setFieldError(fieldName,errors[fieldName]||'');});
    });
    if(this.index===0)this.track('diagnostic_started',{route:this.route});
  };
  Diagnostic.prototype.captureFields=function(){
    var self=this;
    [].slice.call(this.el.querySelectorAll('[data-field]')).forEach(function(field){self.state[field.getAttribute('data-field')]=field.type==='checkbox'?field.checked:field.value;});
  };
  Diagnostic.prototype.setFieldError=function(fieldName,message){
    var field=this.el.querySelector('[data-field="'+fieldName+'"]'),error=this.el.querySelector('[data-error-for="'+fieldName+'"]'),wrap=this.el.querySelector('[data-field-wrap="'+fieldName+'"]');
    if(field){if(message)field.setAttribute('aria-invalid','true');else field.removeAttribute('aria-invalid');}
    if(wrap)wrap.classList.toggle('has-error',!!message);
    if(error){error.textContent=message||'';error.hidden=!message;}
  };
  Diagnostic.prototype.showContactErrors=function(){
    var self=this,errors=contactErrors(this.state);
    ['name','business','email','url','consent'].forEach(function(fieldName){self.setFieldError(fieldName,errors[fieldName]||'');});
    return errors;
  };
  Diagnostic.prototype.resultMarkup=function(result,delivery,error){
    var reasons=result.reasons.length?'<ul>'+result.reasons.map(function(r){return '<li>'+escapeHtml(r)+'</li>';}).join('')+'</ul>':'';
    var deliveryMarkup=delivery==='error'
      ? '<div class="dv-result-next dv-result-error"><b>No pudimos registrar tus datos</b><p>'+escapeHtml(submitErrorMessage(error))+' Si el problema continúa, escríbenos a <a href="mailto:arturo.villagomez@donventas.mx">arturo.villagomez@donventas.mx</a>.</p><small>Referencia: DV-'+escapeHtml(error&&error.status?error.status:'CONEXION')+'</small><button type="button" class="btn dv-retry">Intentar de nuevo</button></div>'
      : '<div class="dv-result-next"><b>Solicitud recibida</b><p>Revisaremos hechos e inferencias y, si existe encaje, te enviaremos por correo un diagnóstico en PDF con prioridades, alcance y siguiente paso. Plazo estimado: 3–5 días hábiles.</p></div>';
    return '<div class="dv-result"><span class="dv-result-kicker">Recomendación preliminar</span><h3>'+escapeHtml(result.name)+'</h3><p class="dv-result-band">'+escapeHtml(result.band)+'</p><p>'+escapeHtml(result.desc)+'</p>'+reasons+(result.start?'<div class="dv-result-plan"><b>Cómo empezar</b><p>'+escapeHtml(result.start)+'</p></div>':'')+deliveryMarkup+'<button type="button" class="btn dv-restart">Hacer otro diagnóstico</button></div>';
  };
  Diagnostic.prototype.bindResultActions=function(summary,result){
    var self=this,restart=this.el.querySelector('.dv-restart'),retry=this.el.querySelector('.dv-retry');
    if(restart)restart.onclick=function(){self.state={entry:''};self.index=0;self.render();};
    if(retry)retry.onclick=function(){self.submitLead(summary,result);};
  };
  Diagnostic.prototype.finish=function(){
    this.captureFields();
    if(Object.keys(this.showContactErrors()).length)return;
    var result=recommendation(this.route,this.state),summary=summarize(this.route,this.state,result);
    this.result=result;
    this.el.innerHTML='<div class="dv-result dv-result-loading" role="status" aria-live="polite"><span class="dv-result-kicker">Guardando diagnóstico</span><h3>Un momento…</h3><p>Estamos registrando tus respuestas de forma segura.</p></div>';
    this.el.scrollIntoView({behavior:'smooth',block:'center'});
    this.submitLead(summary,result);
  };
  Diagnostic.prototype.submitLead=function(summary,result){
    var self=this;
    this.el.querySelectorAll('button').forEach(function(btn){btn.disabled=true;});
    this.sendLead(summary,result).then(function(){
      self.track('diagnostic_completed',{route:self.route,recommendation:result.key,budget_gap:result.gap});
      try{localStorage.removeItem(self.storageKey);sessionStorage.removeItem('dv-lead-pending');}catch(_e){}
      self.el.innerHTML=self.resultMarkup(result,'success');self.bindResultActions(summary,result);
    }).catch(function(error){
      self.track('diagnostic_submit_failed',{route:self.route,status:error&&error.status||0,code:error&&error.code||'unknown'});
      self.el.innerHTML=self.resultMarkup(result,'error',error);self.bindResultActions(summary,result);
    });
  };
  Diagnostic.prototype.sendLead=function(summary,result){
    if(!this.state.submissionKey)this.state.submissionKey=(root.crypto&&root.crypto.randomUUID)?root.crypto.randomUUID():('dv-'+Date.now()+'-'+Math.random().toString(16).slice(2));
    var body={
      nombre:this.state.name||'',correo:this.state.email||'',negocio:this.state.business||'',whatsapp:this.state.whatsapp||'',
      reto:summary+(this.state.url?' | URL: '+this.state.url:''),paquete:result.name+' · '+result.band,consent:!!this.state.consent,
      origen:'landing-'+this.route+'-'+((new URLSearchParams(location.search)).get('utm_source')||'directo'),
      submission_key:this.state.submissionKey
    };
    try{sessionStorage.setItem('dv-lead-pending',JSON.stringify(body));}catch(_e){}
    var controller=typeof AbortController!=='undefined'?new AbortController():null;
    var timeout=setTimeout(function(){if(controller)controller.abort();},12000);
    return fetch(CONFIG.SUPABASE_URL+'/rest/v1/'+CONFIG.LEAD_TABLE,{method:'POST',headers:{'Content-Type':'application/json','apikey':CONFIG.SUPABASE_ANON,'Prefer':'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify(body),signal:controller?controller.signal:undefined}).then(function(response){
      return response.text().then(function(raw){
        if(!response.ok){
          var error=new Error('LEAD_SUBMIT_FAILED'),details={};
          try{details=raw?JSON.parse(raw):{};}catch(_e){}
          error.status=response.status;error.code=details.code||'http_'+response.status;throw error;
        }
        return true;
      });
    }).finally(function(){clearTimeout(timeout);});
  };
  Diagnostic.prototype.track=function(name,data){try{if(root.va)root.va('event',{name:name,data:data||{}});}catch(_e){}}

  root.DVDiagnostic={recommendation:recommendation,needsSearch:needsSearch,visibleQuestions:visibleQuestions,contactErrors:contactErrors,validWebUrl:validWebUrl};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.DVDiagnostic;
  if(typeof document==='undefined')return;
  document.addEventListener('DOMContentLoaded',function(){[].slice.call(document.querySelectorAll('[data-dv-diagnostic]')).forEach(function(el){new Diagnostic(el);});});
})(typeof window!=='undefined'?window:this);
