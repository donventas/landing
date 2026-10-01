/* Don Ventas — motor compartido de diagnóstico v3.
   Dinámico: muestra únicamente preguntas aplicables.
   Determinista: las mismas respuestas producen la misma ruta y recomendación.
   La recomendación en pantalla es preliminar; el seguimiento conserva revisión humana. */
(function(root){
  'use strict';

  var CONFIG={
    SUPABASE_URL:'https://hlabhmegjnrjygsywnqa.supabase.co',
    SUPABASE_ANON:'sb_publishable_Pk-_A1MghCXv9F5r9TvcxA_vkf08JYh',
    LEAD_TABLE:'lead'
  };

  var CONTENT_QUESTIONS=[
    {id:'salesProblem',type:'single',title:'¿Dónde se atora hoy la decisión de tu cliente?',hint:'Empecemos por el problema que reconoces, no por elegir un paquete.',required:true,options:[
      {id:'noInquiries',label:'Nos ven, pero casi nadie pregunta o compra'},
      {id:'notFound',label:'No nos encuentran las personas correctas'},
      {id:'unclearOffer',label:'Nuestra oferta no se entiende rápido'},
      {id:'consistency',label:'Publicamos sin constancia o dirección'},
      {id:'other',label:'Otro problema',other:true}
    ]},
    {id:'outcome',type:'single',title:'Si esto mejora, ¿qué cambio te importaría más?',hint:'Piensa en los próximos 90 días. Es una prioridad a investigar, no una promesa de resultado.',required:true,options:[
      {id:'orders',label:'Recibir más conversaciones o pedidos adecuados'},
      {id:'trust',label:'Que la oferta se entienda y genere confianza'},
      {id:'consistency',label:'Publicar con mayor consistencia'},
      {id:'search',label:'Aparecer cuando buscan soluciones como la nuestra'},
      {id:'other',label:'Otro cambio',other:true}
    ]},
    {id:'budgetBand',type:'single',title:function(a){return budgetTitle('contenido',a);},hint:function(a){return budgetHint('contenido',a);},context:function(a){return budgetContext('contenido',a);},required:true,options:function(a){return budgetOptions('contenido',a);}},
    {id:'proof',type:'single',title:'¿Cuál es la mejor prueba que ya tienes?',hint:'Elige la evidencia más útil. Después podremos revisar materiales adicionales.',required:true,options:[
      {id:'cases',label:'Casos, resultados o reseñas'},
      {id:'photos',label:'Fotografías o videos reales'},
      {id:'process',label:'Un proceso o una persona experta que pueda explicarlo'},
      {id:'none',label:'Todavía tenemos poco documentado'},
      {id:'other',label:'Otra prueba',other:true}
    ]},
    contactQuestion('contenido')
  ];

  var BRAND_QUESTIONS=[
    {id:'desired',type:'single',title:'¿Qué quieres resolver primero con tu marca?',hint:'Elige el resultado que más cambiaría cómo publicas, presentas o vendes.',required:true,options:[
      {id:'clarity',label:'Que la marca se entienda mejor',desc:'Aclarar qué vendes, para quién y por qué elegirte.'},
      {id:'consistency',label:'Trabajar con consistencia y más autonomía',desc:'Tener reglas, plantillas y archivos utilizables.'},
      {id:'launch',label:'Lanzar una marca nueva con una base sólida'},
      {id:'reposition',label:'Reposicionar una marca que ya existe'},
      {id:'other',label:'Otro resultado',other:true}
    ]},
    {id:'clarityProblem',type:'single',title:'¿Qué cuesta más trabajo explicar sobre tu marca?',hint:'Elige el punto que genera más dudas.',required:true,showIf:function(a){return a.desired==='clarity';},options:[
      {id:'offer',label:'Qué vendemos exactamente'},
      {id:'audience',label:'Para quién es nuestra oferta'},
      {id:'difference',label:'Por qué deberían elegirnos'},
      {id:'value',label:'Por qué vale lo que cuesta'},
      {id:'other',label:'Otra dificultad',other:true}
    ]},
    {id:'systemProblem',type:'single',title:'¿Dónde se rompe más la consistencia de la marca?',hint:'Piensa en el trabajo cotidiano, no solo en el logo.',required:true,showIf:function(a){return a.desired==='consistency';},options:[
      {id:'channels',label:'Cada canal se ve y suena diferente'},
      {id:'team',label:'Cada persona aplica la marca a su manera'},
      {id:'templates',label:'Faltan plantillas y archivos utilizables'},
      {id:'manual',label:'Existe un manual, pero está viejo o nadie lo usa'},
      {id:'other',label:'Otro problema',other:true}
    ]},
    {id:'launchProblem',type:'single',title:'¿Qué necesitas tener listo para lanzar?',hint:'Elige la base que hoy hace falta.',required:true,showIf:function(a){return a.desired==='launch';},options:[
      {id:'strategy',label:'Aclarar la idea, el público y la propuesta'},
      {id:'identity',label:'Crear nombre, logo y sistema visual'},
      {id:'applications',label:'Preparar redes, sitio o materiales de venta'},
      {id:'complete',label:'Construir la marca completa desde el inicio'},
      {id:'other',label:'Otra necesidad',other:true}
    ]},
    {id:'repositionProblem',type:'single',title:'¿Qué dejó de funcionar en la marca actual?',hint:'Elige la señal que hizo necesario cambiar.',required:true,showIf:function(a){return a.desired==='reposition';},options:[
      {id:'old',label:'Se ve desactualizada frente al negocio actual'},
      {id:'wrongAudience',label:'Atrae a un público que ya no buscamos'},
      {id:'growth',label:'No acompaña el crecimiento o una nueva oferta'},
      {id:'confusion',label:'La gente no entiende bien qué hacemos'},
      {id:'other',label:'Otro problema',other:true}
    ]},
    {id:'brandOtherProblem',type:'text',title:'¿Qué problema te gustaría resolver con tu marca?',hint:'Descríbelo en palabras simples.',required:true,showIf:function(a){return a.desired==='other';},placeholder:'Ej. La empresa creció, pero la marca todavía parece de un negocio pequeño.'},
    {id:'applications',type:'multi',maxSelections:2,title:'¿Dónde necesitas que la marca funcione primero?',hint:'Elige hasta dos lugares prioritarios.',required:true,options:[
      {id:'social',label:'Contenido y redes'},
      {id:'sales',label:'Presentaciones, propuestas y ventas'},
      {id:'web',label:'Sitio o producto digital'},
      {id:'physical',label:'Empaque, impresos, local o eventos'},
      {id:'other',label:'Otro lugar',other:true}
    ]},
    {id:'autonomy',type:'single',title:'¿Cómo quieres trabajar con la marca después del proyecto?',hint:'Esto nos permite recomendar operación continua o herramientas para trabajar por tu cuenta.',required:true,options:[
      {id:'agency',label:'Prefiero que Don Ventas siga operándola'},
      {id:'shared',label:'Queremos operar una parte y recibir acompañamiento'},
      {id:'independent',label:'Queremos reglas, archivos y plantillas para operar solos'}
    ]},
    {id:'budgetBand',type:'single',title:function(a){return budgetTitle('branding',a);},hint:function(a){return budgetHint('branding',a);},context:function(a){return budgetContext('branding',a);},required:true,options:function(a){return budgetOptions('branding',a);}},
    contactQuestion('branding')
  ];

  function contactQuestion(route){
    return {id:'contact',type:'contact',title:'¿A quién le damos seguimiento?',hint:route==='branding'?'Revisaremos tu sistema actual y prepararemos una recomendación de alcance.':'Cuéntanos qué vendes, a quién quieres llegar y dónde podemos responderte. La revisión es humana.',required:true};
  }

  function questionOptions(question,state){return typeof question.options==='function'?question.options(state):question.options||[];}
  function questionText(value,state){return typeof value==='function'?value(state):value||'';}
  function optionLabelById(question,value,state){
    var option=questionOptions(question,state).filter(function(o){return o.id===value;})[0];
    return option?option.label:value;
  }
  function contentProblem(a){
    return {id:a.salesProblem||'other',text:optionLabelById(CONTENT_QUESTIONS[0],a.salesProblem,a)||'un problema que requiere revisión'};
  }
  function brandProblem(a){
    var map={clarity:['clarityProblem',BRAND_QUESTIONS[1]],consistency:['systemProblem',BRAND_QUESTIONS[2]],launch:['launchProblem',BRAND_QUESTIONS[3]],reposition:['repositionProblem',BRAND_QUESTIONS[4]]};
    var pair=map[a.desired];
    if(!pair)return {id:'other',text:a.brandOtherProblem||'una necesidad que requiere revisión'};
    return {id:a[pair[0]],text:optionLabelById(pair[1],a[pair[0]],a)};
  }
  function preliminaryContentKey(a){
    var problem=contentProblem(a).id;
    var search=a.entry==='autoridad'||a.entry==='motor'||a.outcome==='search'||problem==='notFound';
    var content=a.entry==='contenido'||a.entry==='motor'||a.outcome!=='search'||['noInquiries','unclearOffer','consistency'].indexOf(problem)>=0;
    return search&&content?'motor':(search?'autoridad':'contenido');
  }
  function needsSearch(a){return preliminaryContentKey(a)!=='contenido';}
  function budgetOptions(route,state){
    if(route==='branding')return [
      {id:'b_lt18',label:'Hasta $18 mil MXN / primera etapa + IVA'}, {id:'b_18_30',label:'$18–30 mil MXN / primera etapa + IVA'},
      {id:'b_31_60',label:'$31–60 mil MXN / primera etapa + IVA'}, {id:'b_gt60',label:'Más de $60 mil MXN / primera etapa + IVA'},
      {id:'unknown',label:'Necesito conocer primero el alcance recomendado'}
    ];
    var key=preliminaryContentKey(state);
    if(key==='contenido')return [
      {id:'c_lt12',label:'Hasta $12 mil MXN / mes + IVA'}, {id:'c_12_20',label:'$12–20 mil MXN / mes + IVA'},
      {id:'c_21_32',label:'$21–32 mil MXN / mes + IVA'}, {id:'c_gt32',label:'Más de $32 mil MXN / mes + IVA'},
      {id:'unknown',label:'Necesito ver primero qué conviene hacer'}
    ];
    if(key==='autoridad')return [
      {id:'a_lt25',label:'Hasta $25 mil MXN / implementación + IVA'}, {id:'a_25_45',label:'$25–45 mil MXN / implementación + IVA'},
      {id:'a_46_80',label:'$46–80 mil MXN / implementación + IVA'}, {id:'a_gt80',label:'Más de $80 mil MXN / implementación + IVA'},
      {id:'unknown',label:'Necesito ver primero qué conviene hacer'}
    ];
    return [
      {id:'m_lt35',label:'Hasta $35 mil MXN / inicio + IVA'}, {id:'m_35_60',label:'$35–60 mil MXN / inicio + IVA'},
      {id:'m_61_95',label:'$61–95 mil MXN / inicio + IVA'}, {id:'m_gt95',label:'Más de $95 mil MXN / inicio + IVA'},
      {id:'unknown',label:'Necesito ver primero qué conviene hacer'}
    ];
  }
  function budgetTitle(route,state){
    if(route==='branding')return '¿Qué inversión podrías considerar para resolver esta primera etapa?';
    var key=preliminaryContentKey(state);
    if(key==='contenido')return '¿Qué inversión mensual podrías sostener durante tres meses?';
    if(key==='autoridad')return '¿Qué inversión podrías considerar para mejorar cómo encuentran y entienden tu negocio?';
    return '¿Qué inversión podrías considerar para empezar por la prioridad más importante?';
  }
  function budgetHint(route,state){
    var basis=route==='contenido'&&preliminaryContentKey(state)==='contenido'?'Elige un rango mensual.':'Elige un rango para la primera etapa.';
    return basis+' Los importes están abreviados, indican el periodo y no incluyen IVA. Sirven para ajustar la profundidad; no son una cotización.';
  }
  function budgetContext(route,state){
    if(route==='branding'){
      var desired=optionLabelById(BRAND_QUESTIONS[0],state.desired,state).toLowerCase();
      return 'Hasta aquí entendemos que buscas '+desired+' y que el principal freno es: '+brandProblem(state).text.toLowerCase()+'. La inversión solo ajustará la profundidad de la primera etapa.';
    }
    var outcome=optionLabelById(CONTENT_QUESTIONS[1],state.outcome,state).toLowerCase();
    var route={contenido:'contenido para redes',autoridad:'sitio y búsqueda',motor:'contenido y sitio conectados'}[preliminaryContentKey(state)];
    return 'Hasta aquí entendemos que el principal freno es '+contentProblem(state).text.toLowerCase()+', que buscas '+outcome+' y que la ruta preliminar es '+route+'.';
  }
  function budgetRank(value){
    return {c_lt12:0,c_12_20:1,c_21_32:2,c_gt32:3,a_lt25:0,a_25_45:1,a_46_80:2,a_gt80:3,m_lt35:0,m_35_60:1,m_61_95:2,m_gt95:3,b_lt18:0,b_18_30:1,b_31_60:2,b_gt60:3,unknown:-1}[value];
  }

  function recommendContent(a){
    var key=preliminaryContentKey(a),search=key!=='contenido',content=key!=='autoridad';
    var catalog={
      contenido:{name:'Contenido para atraer posibles clientes',band:'$12–32 mil MXN / mes + IVA',desc:'Temas, textos y diseños principales, con versiones para cada canal y revisión mensual.'},
      autoridad:{name:'Sitio para que te encuentren y confíen',band:'$25–80 mil MXN / implementación + IVA',desc:'Un sitio claro, mejoras para buscadores y respuestas fáciles de entender para herramientas de inteligencia artificial.'},
      motor:{name:'Contenido y sitio conectados por etapas',band:'Desde $35 mil MXN / inicio + IVA',desc:'Contenido, sitio y búsquedas conectados en un plan que empieza por el problema más importante.'}
    };
    var capacity=budgetRank(a.budgetBand),gap=false,start='';
    if(key==='contenido'&&capacity===0){gap=true;start='La mejor forma de empezar es una intervención prioritaria y un plan para crecer después.';}
    if(key==='autoridad'&&capacity===0){gap=true;start='Conviene resolver primero la parte del sitio que más afecta la confianza o los contactos.';}
    if(key==='motor'&&capacity>=0&&capacity<2){gap=true;start='Recomendamos hacerlo por etapas: primero el problema con mayor impacto y después conectar el segundo frente.';}
    if(a.budgetBand==='unknown')start='El diagnóstico definirá primero qué conviene resolver; después podremos dimensionar la inversión sin forzar un alcance prematuro.';
    var reasons=[];
    if(content)reasons.push('Tus respuestas muestran que necesitas mejores temas, mayor constancia o un siguiente paso más claro para vender.');
    if(search)reasons.push('También hay un problema en el sitio o es difícil encontrar y entender tu negocio antes de decidir.');
    if(a.proof==='none')reasons.push('La producción deberá incluir una fase inicial para documentar evidencia y materiales reales.');
    return {route:'contenido',key:key,name:catalog[key].name,band:catalog[key].band,desc:catalog[key].desc,gap:gap,start:start,reasons:reasons};
  }

  function recommendBrand(a){
    var score=0;
    var problem=brandProblem(a).id;
    if(['complete','identity','old','wrongAudience','channels','manual'].indexOf(problem)>=0)score+=2; else score+=1;
    if((a.applications||[]).length>=2)score+=2; else score+=1;
    if(a.autonomy==='independent')score+=1;
    if(['launch','reposition'].indexOf(a.desired)>=0)score+=1;
    var need=score<=2?'essential':(score<=4?'complete':'extended');
    var catalog={
      essential:{name:'Sistema esencial',band:'$18–30 mil MXN / primera etapa + IVA',desc:'Claridad, núcleo visual y las reglas mínimas para dejar de improvisar.'},
      complete:{name:'Sistema de marca completo',band:'$31–60 mil MXN / primera etapa + IVA',desc:'Mensaje, identidad y usos prioritarios para que la marca sea consistente.'},
      extended:{name:'Sistema extendido',band:'$61–120 mil MXN / primera etapa + IVA',desc:'Una guía amplia para equipos, proveedores y todos los lugares donde aparece la marca.'}
    };
    var needRank={essential:1,complete:2,extended:3}[need],capacity=budgetRank(a.budgetBand),gap=capacity>=0&&capacity<needRank;
    var start='';
    if(a.budgetBand==='b_lt18')start='La mejor forma de empezar es una intervención prioritaria y una ruta clara para completar el sistema después.';
    else if(gap)start='La necesidad es mayor que el rango disponible. Recomendamos construir el sistema por etapas y dejar un plan claro para completarlo.';
    else if(a.budgetBand==='unknown')start='Primero debemos validar profundidad y aplicaciones antes de dimensionar la inversión.';
    var reasons=[];
    if(['launch','reposition'].indexOf(a.desired)>=0)reasons.push('El momento del negocio exige una base que pueda aplicarse sin improvisar.');
    if(['channels','team','providers','templates','manual'].indexOf(problem)>=0)reasons.push('Los lugares donde aparece la marca necesitan reglas y recursos comunes.');
    if(a.autonomy==='shared'||a.autonomy==='independent')reasons.push('El equipo necesita una fuente clara para aplicar la marca sin reinterpretarla cada vez.');
    if(a.autonomy==='independent')reasons.push('La autonomía exige archivos editables, plantillas, documentación y transferencia de uso.');
    return {route:'branding',key:need,name:catalog[need].name,band:catalog[need].band,desc:catalog[need].desc,gap:gap||a.budgetBand==='b_lt18',start:start,reasons:reasons,score:score};
  }

  function recommendation(route,a){return route==='branding'?recommendBrand(a):recommendContent(a);}

  function questionsFor(route){return route==='branding'?BRAND_QUESTIONS:CONTENT_QUESTIONS;}
  function visibleQuestions(route,state){return questionsFor(route).filter(function(q){return !q.showIf||q.showIf(state);});}

  function summarize(route,state,result){
    var lines=['Ruta: '+route,'Recomendación: '+result.name,'Rango: '+result.band];
    visibleQuestions(route,state).forEach(function(q){
      if(q.type==='contact')return;
      var value=state[q.id];
      if(value==null||value===''||(Array.isArray(value)&&!value.length))return;
      if(Array.isArray(value))value=value.map(function(v){return optionLabelById(q,v,state);}).join(', ');
      else if(q.options)value=optionLabelById(q,value,state);
      if(state[q.id+'Other'])value+=': '+state[q.id+'Other'];
      lines.push(questionText(q.title,state)+' '+value);
    });
    return lines.join(' | ');
  }

  function reviewItems(route,state){
    var result=recommendation(route,state);
    if(route==='branding')return [
      {id:'desired',label:'Lo que quieres lograr',value:optionLabelById(BRAND_QUESTIONS[0],state.desired,state)},
      {id:'desired',label:'Problema principal',value:brandProblem(state).text},
      {id:'desired',label:'Ruta preliminar',value:result.name},
      {id:'budgetBand',label:'Inversión considerada',value:optionLabelById(BRAND_QUESTIONS[BRAND_QUESTIONS.length-2],state.budgetBand,state)}
    ];
    return [
      {id:'salesProblem',label:'Problema principal',value:contentProblem(state).text},
      {id:'outcome',label:'Cambio buscado',value:optionLabelById(CONTENT_QUESTIONS[1],state.outcome,state)},
      {id:'outcome',label:'Ruta preliminar',value:result.name},
      {id:'budgetBand',label:'Inversión considerada',value:optionLabelById(CONTENT_QUESTIONS[2],state.budgetBand,state)}
    ];
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
    if(clean(state.websiteConfirm))errors.spam='No pudimos validar el formulario. Actualiza la página e inténtalo de nuevo.';
    if(!clean(state.name))errors.name='Escribe tu nombre.';
    if(!clean(state.business))errors.business='Escribe el nombre de tu negocio o marca.';
    if(!clean(state.businessAudience))errors.businessAudience='Cuéntanos brevemente qué vendes y a quién quieres llegar.';
    if(!clean(state.email))errors.email='Escribe un correo para poder responderte.';
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
    this.storageKey='dv-diagnostic-v4-'+this.route;
    this.state={entry:params.get('entrada')||el.getAttribute('data-entry')||'',startedAt:Date.now()};
    this.index=0;
    this.viewedSteps={};
    this.startedTracked=false;
    this.completed=false;
    this.submitting=false;
    this.abandonmentTracked=false;
    this.load();
    if(!this.state.startedAt)this.state.startedAt=Date.now();
    this.render();
    this.bindEntryLinks();
    this.bindAbandonment();
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
      link.addEventListener('click',function(){
        self.state.entry=link.getAttribute('data-diagnostic-entry')||'';
        self.persist();
      });
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
    if(q.type==='single'&&questionOptions(q,this.state).length&&!questionOptions(q,this.state).some(function(option){return option.id===value;}))return false;
    if(value==='other'&&!String(this.state[q.id+'Other']||'').trim())return false;
    return true;
  };
  Diagnostic.prototype.render=function(){
    var current=this.current(),q=current.q,list=current.list;
    if(!q)return;
    var pendingBranch=this.route==='branding'&&!this.state.desired;
    var total=list.length+(pendingBranch?1:0);
    var progress=Math.round(((this.index+1)/total)*100);
    var routeLabel=this.route==='branding'?'Sistema de marca':'Contenido, sitio y buscadores';
    var h='<div class="dv-form-shell" data-route-name="'+this.route+'">';
    h+='<div class="dv-form-top"><div><span class="dv-form-kicker">Diagnóstico · '+routeLabel+'</span><strong>'+(this.index+1)+' / '+total+'</strong></div><div class="dv-progress" aria-label="Progreso"><i style="width:'+progress+'%"></i></div></div>';
    var title=questionText(q.title,this.state),hint=questionText(q.hint,this.state),context=questionText(q.context,this.state);
    h+='<div class="dv-step" aria-live="polite">';
    if(context)h+='<div class="dv-route-recap"><span>Lo que entendimos</span><p>'+escapeHtml(context)+'</p></div>';
    h+='<h3>'+escapeHtml(title)+'</h3>';
    if(hint)h+='<p class="dv-step-hint">'+escapeHtml(hint)+'</p>';
    if(q.type==='contact')h+=this.reviewMarkup();
    h+=this.fieldHtml(q);
    h+='<div class="dv-form-nav">'+(this.index?'<button type="button" class="btn dv-back">← Atrás</button>':'<span></span>')+'<button type="button" class="btn solid dv-next"'+(this.hasAnswer(q)?'':' disabled')+'>'+(q.type==='contact'?'Enviar y ver recomendación':'Continuar')+' <span class="ar">→</span></button></div>';
    if(this.index===0)h+='<p class="dv-form-note">3–4 minutos · revisión humana · confirmación de encaje en hasta 2 días hábiles</p>';
    h+='</div></div>';
    this.el.innerHTML=h;
    this.bind(q);
    this.trackStepView(q,total);
  };
  Diagnostic.prototype.reviewMarkup=function(){
    var rows=reviewItems(this.route,this.state).map(function(item){
      return '<div class="dv-review-row"><span>'+escapeHtml(item.label)+'</span><b>'+escapeHtml(item.value)+'</b><button type="button" data-edit-step="'+escapeHtml(item.id)+'" aria-label="Editar '+escapeHtml(item.label.toLowerCase())+'">Editar</button></div>';
    }).join('');
    return '<section class="dv-review" aria-labelledby="dv-review-title"><div class="dv-review-head"><span>Antes de enviar</span><strong id="dv-review-title">Revisa lo que entendimos</strong></div>'+rows+'</section>';
  };
  Diagnostic.prototype.fieldHtml=function(q){
    var self=this,h='';
    if(q.type==='single'||q.type==='multi'){
      h+='<div class="dv-options '+(q.type==='multi'?'is-multi':'')+'">';
      questionOptions(q,this.state).forEach(function(o,i){
        var selected=q.type==='multi'?(self.state[q.id]||[]).indexOf(o.id)>=0:self.state[q.id]===o.id;
        h+='<button type="button" class="dv-option'+(selected?' is-selected':'')+'" data-value="'+o.id+'" aria-pressed="'+(selected?'true':'false')+'"><span class="dv-option-key">'+String.fromCharCode(65+i)+'</span><span><b>'+escapeHtml(o.label)+'</b>'+(o.desc?'<small>'+escapeHtml(o.desc)+'</small>':'')+'</span><i aria-hidden="true"></i></button>';
      });
      h+='</div>';
      var selectedOther=q.type==='multi'?(this.state[q.id]||[]).indexOf('other')>=0:this.state[q.id]==='other';
      if(selectedOther)h+='<label class="dv-other">Tu respuesta<textarea rows="2" data-field="'+q.id+'Other" placeholder="Escríbela en tus palabras">'+escapeHtml(this.state[q.id+'Other']||'')+'</textarea></label>';
    }else if(q.type==='text'){
      h+='<label class="dv-textarea"><textarea rows="5" data-field="'+q.id+'" placeholder="'+escapeHtml(q.placeholder||'')+'">'+escapeHtml(this.state[q.id]||'')+'</textarea></label>';
    }else if(q.type==='contact'){
      h+='<div class="dv-contact-grid"><label data-field-wrap="name">Tu nombre <span>obligatorio</span><input data-field="name" autocomplete="name" maxlength="160" required value="'+escapeHtml(this.state.name||'')+'"><small class="dv-field-error" data-error-for="name" aria-live="polite" hidden></small></label><label data-field-wrap="business">Negocio o marca <span>obligatorio</span><input data-field="business" autocomplete="organization" maxlength="200" required value="'+escapeHtml(this.state.business||'')+'"><small class="dv-field-error" data-error-for="business" aria-live="polite" hidden></small></label><label data-field-wrap="email">Correo de trabajo <span>obligatorio</span><input data-field="email" type="email" autocomplete="email" maxlength="320" required value="'+escapeHtml(this.state.email||'')+'"><small class="dv-field-error" data-error-for="email" aria-live="polite" hidden></small></label><label>WhatsApp <span>opcional · recomendado</span><input data-field="whatsapp" autocomplete="tel" maxlength="80" value="'+escapeHtml(this.state.whatsapp||'')+'"><small class="dv-field-help">Si lo dejas, Arturo puede compartirte personalmente el diagnóstico breve e iniciar la conversación por ahí.</small></label></div>';
      h+='<label class="dv-contact-full" data-field-wrap="businessAudience">¿Qué vendes y a quién quieres llegar? <span>obligatorio</span><textarea data-field="businessAudience" rows="3" maxlength="600" required placeholder="Ej. Ayudamos a restaurantes con varias sucursales a controlar costos.">'+escapeHtml(this.state.businessAudience||'')+'</textarea><small class="dv-field-error" data-error-for="businessAudience" aria-live="polite" hidden></small></label>';
      h+='<label class="dv-contact-full" data-field-wrap="url">Sitio o red principal <span>opcional</span><input data-field="url" type="url" inputmode="url" placeholder="https://" value="'+escapeHtml(this.state.url||'')+'"><small class="dv-field-help">Déjalo vacío si todavía no tienes sitio web o una red principal.</small><small class="dv-field-error" data-error-for="url" aria-live="polite" hidden></small></label>';
      h+='<label class="dv-honeypot" aria-hidden="true">No completar<input data-field="websiteConfirm" tabindex="-1" autocomplete="off" value=""></label>';
      h+='<label class="dv-consent"><input data-field="consent" type="checkbox"'+(this.state.consent?' checked':'')+'><span>Acepto que Don Ventas use esta información para preparar el diagnóstico y contactarme. Leí el <a href="15_LEGAL/Aviso de Privacidad.html" target="_blank" rel="noopener">Aviso de Privacidad</a>.</span></label>';
      h+='<small class="dv-field-error" data-error-for="spam" aria-live="polite" hidden></small>';
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
      self.track('diagnostic_step_completed',{route:self.route,step:q.id,step_index:self.index+1,total_steps:visibleQuestions(self.route,self.state).length});
      self.index+=1;self.render();self.persist();
    };
    [].slice.call(this.el.querySelectorAll('.dv-option')).forEach(function(btn){
      btn.onclick=function(){
        var value=btn.getAttribute('data-value');
        if(q.type==='multi'){
          var options=questionOptions(q,self.state),selected=options.filter(function(option){return option.id===value;})[0];
          var values=self.state[q.id]||[],pos=values.indexOf(value);
          if(pos>=0)values.splice(pos,1);
          else if(selected&&selected.exclusive)values=[value];
          else{
            values=values.filter(function(current){return !options.some(function(option){return option.id===current&&option.exclusive;});});
            if(!q.maxSelections||values.length<q.maxSelections)values.push(value);
          }
          self.state[q.id]=values;self.render();self.persist();
        }else{
          self.state[q.id]=value;self.persist();
          if(q.auto&&value!=='other'){setTimeout(function(){self.index+=1;self.render();self.persist();},170);}else self.render();
        }
      };
    });
    [].slice.call(this.el.querySelectorAll('[data-field]')).forEach(function(field){
      var event=field.type==='checkbox'||field.tagName==='SELECT'?'change':'input';
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
    [].slice.call(this.el.querySelectorAll('[data-edit-step]')).forEach(function(button){
      button.onclick=function(){
        self.captureFields();
        var target=button.getAttribute('data-edit-step'),list=visibleQuestions(self.route,self.state);
        var nextIndex=list.findIndex(function(question){return question.id===target;});
        if(nextIndex>=0){self.index=nextIndex;self.render();self.persist();}
      };
    });
    if(this.index===0&&!this.startedTracked){this.startedTracked=true;this.track('diagnostic_started',{route:this.route});}
  };
  Diagnostic.prototype.trackStepView=function(q,total){
    var key=this.route+':'+q.id+':'+this.index;
    this.lastViewed={id:q.id,index:this.index+1,total:total};
    if(this.viewedSteps[key])return;
    this.viewedSteps[key]=true;
    this.track('diagnostic_step_viewed',{route:this.route,step:q.id,step_index:this.index+1,total_steps:total});
  };
  Diagnostic.prototype.bindAbandonment=function(){
    var self=this;
    root.addEventListener('pagehide',function(){
      if(self.completed||self.submitting||self.abandonmentTracked||!self.lastViewed)return;
      self.abandonmentTracked=true;
      self.track('diagnostic_abandoned',{route:self.route,step:self.lastViewed.id,step_index:self.lastViewed.index,total_steps:self.lastViewed.total,answered_count:Object.keys(self.state).filter(function(key){return self.state[key]!==''&&self.state[key]!=null;}).length});
    });
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
    ['name','business','businessAudience','email','url','consent','spam'].forEach(function(fieldName){self.setFieldError(fieldName,errors[fieldName]||'');});
    return errors;
  };
  Diagnostic.prototype.resultMarkup=function(result,delivery,error){
    var reasons=result.reasons.length?'<ul>'+result.reasons.map(function(r){return '<li>'+escapeHtml(r)+'</li>';}).join('')+'</ul>':'';
    var deliveryMarkup=delivery==='error'
      ? '<div class="dv-result-next dv-result-error"><b>No pudimos registrar tus datos</b><p>'+escapeHtml(submitErrorMessage(error))+' Si el problema continúa, escríbenos a <a href="mailto:arturo.villagomez@donventas.mx">arturo.villagomez@donventas.mx</a>.</p><small>Referencia: DV-'+escapeHtml(error&&error.status?error.status:'CONEXION')+'</small><button type="button" class="btn dv-retry">Intentar de nuevo</button></div>'
      : '<div class="dv-result-next"><b>Solicitud recibida</b><p>La revisaremos de forma humana y te responderemos en hasta dos días hábiles. Si dejaste WhatsApp, Arturo podrá compartirte personalmente un diagnóstico breve por ahí; si no, usaremos tu correo. Cuando ayude a definir o formalizar el siguiente paso, prepararemos también un PDF de una página.</p></div>';
    return '<div class="dv-result"><span class="dv-result-kicker">Recomendación preliminar</span><h3>'+escapeHtml(result.name)+'</h3><p class="dv-result-band">'+escapeHtml(result.band)+'</p><p>'+escapeHtml(result.desc)+'</p>'+reasons+(result.start?'<div class="dv-result-plan"><b>Cómo empezar</b><p>'+escapeHtml(result.start)+'</p></div>':'')+deliveryMarkup+'<button type="button" class="btn dv-restart">Hacer otro diagnóstico</button></div>';
  };
  Diagnostic.prototype.bindResultActions=function(summary,result){
    var self=this,restart=this.el.querySelector('.dv-restart'),retry=this.el.querySelector('.dv-retry');
    if(restart)restart.onclick=function(){self.state={entry:'',startedAt:Date.now()};self.index=0;self.viewedSteps={};self.startedTracked=false;self.completed=false;self.submitting=false;self.abandonmentTracked=false;self.render();};
    if(retry)retry.onclick=function(){self.submitLead(summary,result);};
  };
  Diagnostic.prototype.finish=function(){
    this.captureFields();
    if(Object.keys(this.showContactErrors()).length)return;
    if(Date.now()-(this.state.startedAt||0)<3000){this.setFieldError('spam','Espera un momento antes de enviar. Tus respuestas siguen guardadas.');return;}
    var result=recommendation(this.route,this.state),summary=summarize(this.route,this.state,result);
    this.track('diagnostic_step_completed',{route:this.route,step:'contact',step_index:this.index+1,total_steps:visibleQuestions(this.route,this.state).length});
    this.result=result;
    this.el.innerHTML='<div class="dv-result dv-result-loading" role="status" aria-live="polite"><span class="dv-result-kicker">Guardando diagnóstico</span><h3>Un momento…</h3><p>Estamos registrando tus respuestas de forma segura.</p></div>';
    this.el.scrollIntoView({behavior:'smooth',block:'center'});
    this.submitLead(summary,result);
  };
  Diagnostic.prototype.submitLead=function(summary,result){
    var self=this;
    this.submitting=true;
    this.el.querySelectorAll('button').forEach(function(btn){btn.disabled=true;});
    this.sendLead(summary,result).then(function(){
      self.completed=true;self.submitting=false;
      self.track('diagnostic_completed',{route:self.route,recommendation:result.key,budget_gap:result.gap});
      try{localStorage.removeItem(self.storageKey);sessionStorage.removeItem('dv-lead-pending');}catch(_e){}
      self.el.innerHTML=self.resultMarkup(result,'success');self.bindResultActions(summary,result);
    }).catch(function(error){
      self.submitting=false;
      self.track('diagnostic_submit_failed',{route:self.route,status:error&&error.status||0,code:error&&error.code||'unknown'});
      self.el.innerHTML=self.resultMarkup(result,'error',error);self.bindResultActions(summary,result);
    });
  };
  Diagnostic.prototype.sendLead=function(summary,result){
    if(!this.state.submissionKey)this.state.submissionKey=(root.crypto&&root.crypto.randomUUID)?root.crypto.randomUUID():('dv-'+Date.now()+'-'+Math.random().toString(16).slice(2));
    var body={
      nombre:this.state.name||'',correo:this.state.email||'',negocio:this.state.business||'',whatsapp:this.state.whatsapp||'',
      reto:summary+' | Negocio y cliente: '+(this.state.businessAudience||'')+(this.state.url?' | URL: '+this.state.url:''),paquete:result.name+' · '+result.band,consent:!!this.state.consent,
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

  root.DVDiagnostic={recommendation:recommendation,needsSearch:needsSearch,visibleQuestions:visibleQuestions,budgetContext:budgetContext,reviewItems:reviewItems,contactErrors:contactErrors,validWebUrl:validWebUrl};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.DVDiagnostic;
  if(typeof document==='undefined')return;
  function init(){[].slice.call(document.querySelectorAll('[data-dv-diagnostic]')).forEach(function(el){if(!el.dataset.dvDiagnosticReady){el.dataset.dvDiagnosticReady='true';new Diagnostic(el);}});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})(typeof window!=='undefined'?window:this);
