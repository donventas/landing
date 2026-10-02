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
    {id:'outcome',type:'single',title:'¿Qué quieres lograr primero?',hint:'Elige el resultado que más importa en los próximos 90 días.',required:true,options:[
      {id:'qualified',label:'Atraer personas que sí podrían comprar',desc:'Que lleguen personas con una necesidad real.'},
      {id:'orders',label:'Generar más conversaciones o pedidos',desc:'Acercar el contenido a una acción comercial.'},
      {id:'trust',label:'Construir confianza antes de la decisión',desc:'Explicar mejor por qué elegirte.'},
      {id:'consistency',label:'Publicar con mayor consistencia',desc:'Dejar de empezar desde cero cada semana.'},
      {id:'search',label:'Aparecer cuando buscan soluciones como la tuya',desc:'Ser encontrado en Google y en respuestas de herramientas de inteligencia artificial.'},
      {id:'other',label:'Otro resultado',other:true}
    ]},
    {id:'salesProblem',type:'single',title:'¿Qué está impidiendo que más personas te contacten?',hint:'Elige el freno que más se parece a tu situación.',required:true,showIf:function(a){return ['qualified','orders','trust'].indexOf(a.outcome)>=0;},options:[
      {id:'lowReach',label:'Pocas personas ven nuestro contenido'},
      {id:'noInquiries',label:'Nos ven, pero casi nadie pregunta o compra'},
      {id:'unclearOffer',label:'No explicamos bien lo que vendemos'},
      {id:'lowTrust',label:'Nuestro contenido no genera suficiente confianza'},
      {id:'noNextStep',label:'No queda claro qué hacer después de vernos'},
      {id:'site',label:'El sitio no ayuda a decidir o encontrarnos'},
      {id:'other',label:'Otro problema',other:true}
    ]},
    {id:'consistencyProblem',type:'single',title:'¿Qué hace difícil publicar con constancia?',hint:'Elige el problema que más interrumpe el trabajo.',required:true,showIf:function(a){return a.outcome==='consistency';},options:[
      {id:'ideas',label:'No sabemos qué publicar'},
      {id:'time',label:'No tenemos tiempo para producirlo'},
      {id:'generic',label:'El contenido termina viéndose genérico'},
      {id:'approvals',label:'Las revisiones tardan demasiado'},
      {id:'process',label:'No existe un proceso claro para publicar'},
      {id:'other',label:'Otro problema',other:true}
    ]},
    {id:'searchProblem',type:'single',title:'¿Qué sucede cuando alguien busca tu negocio o una solución como la tuya?',hint:'No necesitas conocer términos técnicos.',required:true,showIf:function(a){return a.outcome==='search';},options:[
      {id:'noSite',label:'No tenemos sitio web'},
      {id:'notFound',label:'Tenemos sitio, pero casi nadie lo encuentra'},
      {id:'unclearSite',label:'El sitio no explica bien lo que ofrecemos'},
      {id:'noLeads',label:'Recibimos visitas, pero pocos contactos'},
      {id:'unknown',label:'No sabemos si el sitio está funcionando'},
      {id:'other',label:'Otro problema',other:true}
    ]},
    {id:'otherProblem',type:'text',title:'¿Qué problema te gustaría resolver?',hint:'Cuéntalo como se lo explicarías a una persona de confianza.',required:true,showIf:function(a){return a.outcome==='other';},placeholder:'Ej. Nos cuesta explicar por qué nuestro servicio vale lo que cuesta.'},
    {id:'nextAction',type:'single',title:'Cuando alguien se interesa, ¿qué debería hacer después?',hint:'Esta acción nos ayuda a conectar el contenido con una venta real.',required:true,options:[
      {id:'whatsapp',label:'Escribir por WhatsApp'},
      {id:'quote',label:'Pedir una cotización'},
      {id:'call',label:'Agendar una llamada o demostración'},
      {id:'buy',label:'Comprar en línea'},
      {id:'visit',label:'Visitar el negocio'},
      {id:'other',label:'Otra acción',other:true}
    ]},
    {id:'attempted',type:'multi',title:'¿Qué han intentado para atraer clientes?',hint:'Puedes elegir varias opciones. No repetiremos una fórmula que ya sabes que no te funciona.',required:true,options:[
      {id:'internal',label:'Publicar por nuestra cuenta'},
      {id:'provider',label:'Trabajar con un freelancer o agencia'},
      {id:'templates',label:'Usar plantillas o Canva'},
      {id:'ai',label:'Generar contenido con inteligencia artificial'},
      {id:'ads',label:'Pagar anuncios'},
      {id:'none',label:'Todavía no hemos trabajado esto con constancia',exclusive:true},
      {id:'other',label:'Otra cosa',other:true}
    ]},
    {id:'proof',type:'multi',title:'¿Qué podemos demostrar hoy sobre tu negocio?',hint:'No necesitas tener todo. Elegiremos el contenido a partir de evidencia real.',required:true,options:[
      {id:'cases',label:'Resultados o casos de clientes'},
      {id:'reviews',label:'Testimonios o reseñas'},
      {id:'photos',label:'Fotografías o videos reales'},
      {id:'process',label:'Un proceso o forma de trabajar propia'},
      {id:'spokesperson',label:'Una persona que pueda explicar o aparecer'},
      {id:'none',label:'Todavía tenemos poco documentado',exclusive:true},
      {id:'other',label:'Otra prueba',other:true}
    ]},
    {id:'businessAudience',type:'text',title:'¿Qué vendes y a quién necesitas atraer?',hint:'Una respuesta breve es suficiente. Esto evita recomendar contenido genérico.',required:true,placeholder:'Ej. Ayudamos a restaurantes con varias sucursales a reducir desperdicio y controlar costos.'},
    {id:'timing',type:'single',title:'¿Cuándo quieres empezar?',hint:'El plazo nos ayuda a ordenar la primera etapa.',required:true,options:[
      {id:'now',label:'Lo antes posible'},
      {id:'month',label:'Durante el próximo mes'},
      {id:'quarter',label:'En dos o tres meses'},
      {id:'exploring',label:'Solo estoy explorando por ahora'}
    ]},
    {id:'budgetBand',type:'single',title:function(a){return budgetTitle('contenido',a);},hint:function(a){return budgetHint('contenido',a);},context:function(a){return budgetContext('contenido',a);},required:true,options:function(a){return budgetOptions('contenido',a);}},
    contactQuestion('contenido')
  ];

  var BRAND_QUESTIONS=[
    {id:'desired',type:'single',title:'¿Qué quieres resolver primero con tu marca?',hint:'Elige el resultado que más cambiaría cómo publicas, presentas o vendes.',required:true,options:[
      {id:'clarity',label:'Que la marca se entienda mejor',desc:'Aclarar qué vendes, para quién y por qué elegirte.'},
      {id:'consistency',label:'Que todo se vea y suene consistente',desc:'Dejar de improvisar entre canales y proveedores.'},
      {id:'autonomy',label:'Que el equipo pueda crear sin depender de una agencia',desc:'Tener reglas, plantillas y archivos utilizables.'},
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
    {id:'systemProblem',type:'single',title:'¿Dónde se rompe más la consistencia de la marca?',hint:'Piensa en el trabajo cotidiano, no solo en el logo.',required:true,showIf:function(a){return ['consistency','autonomy'].indexOf(a.desired)>=0;},options:[
      {id:'channels',label:'Cada canal se ve y suena diferente'},
      {id:'team',label:'Cada persona aplica la marca a su manera'},
      {id:'providers',label:'Los proveedores no reciben instrucciones claras'},
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
    {id:'applications',type:'multi',title:'¿Dónde necesitas que la marca funcione?',hint:'Puedes elegir varias aplicaciones.',required:true,options:[
      {id:'social',label:'Contenido y redes'},
      {id:'sales',label:'Presentaciones, propuestas y ventas'},
      {id:'web',label:'Sitio o producto digital'},
      {id:'print',label:'Papelería e impresos'},
      {id:'packaging',label:'Empaque o producto'},
      {id:'space',label:'Local, evento o señalización'},
      {id:'other',label:'Otra aplicación',other:true}
    ]},
    {id:'users',type:'single',title:'¿Quién necesita usar la marca?',hint:'Esto define cuántas reglas, archivos y plantillas hacen falta.',required:true,options:[
      {id:'owner',label:'Solo yo'},
      {id:'smallTeam',label:'Un equipo de 2–5 personas'},
      {id:'providers',label:'Equipo y proveedores externos'},
      {id:'scale',label:'Equipo, proveedores y varias unidades o sucursales'}
    ]},
    {id:'autonomy',type:'single',title:'¿Cómo quieres trabajar con la marca después del proyecto?',hint:'Esto nos permite recomendar operación continua o herramientas para trabajar por tu cuenta.',required:true,options:[
      {id:'agency',label:'Prefiero que Don Ventas siga operándola'},
      {id:'shared',label:'Queremos operar una parte y recibir acompañamiento'},
      {id:'independent',label:'Queremos reglas, archivos y plantillas para operar solos'}
    ]},
    {id:'difference',type:'text',title:'¿Qué hace valioso o diferente a tu negocio?',hint:'Si todavía no está claro, dilo: esa también es información útil.',required:true,placeholder:'Ej. Tenemos diez años resolviendo… Nuestros clientes nos eligen porque…'},
    {id:'timing',type:'single',title:'¿Cuándo necesitas empezar?',hint:'El plazo nos ayuda a ordenar la primera etapa.',required:true,options:[
      {id:'now',label:'Lo antes posible'},
      {id:'month',label:'Durante el próximo mes'},
      {id:'quarter',label:'En dos o tres meses'},
      {id:'exploring',label:'Solo estoy explorando por ahora'}
    ]},
    {id:'budgetBand',type:'single',title:function(a){return budgetTitle('branding',a);},hint:function(a){return budgetHint('branding',a);},context:function(a){return budgetContext('branding',a);},required:true,options:function(a){return budgetOptions('branding',a);}},
    contactQuestion('branding')
  ];

  function contactQuestion(route){
    return {id:'contact',type:'contact',title:'¿Cómo podemos darte seguimiento?',hint:route==='branding'?'Arturo revisará tu sistema actual antes de recomendar un alcance.':'Arturo revisará tu contenido, presencia y oportunidades antes de proponerte el siguiente paso.',required:true};
  }

  function questionOptions(question,state){return typeof question.options==='function'?question.options(state):question.options||[];}
  function questionText(value,state){return typeof value==='function'?value(state):value||'';}
  function optionLabelById(question,value,state){
    var option=questionOptions(question,state).filter(function(o){return o.id===value;})[0];
    return option?option.label:value;
  }
  function contentProblem(a){
    if(['qualified','orders','trust'].indexOf(a.outcome)>=0)return {id:a.salesProblem,text:optionLabelById(CONTENT_QUESTIONS[1],a.salesProblem,a)};
    if(a.outcome==='consistency')return {id:a.consistencyProblem,text:optionLabelById(CONTENT_QUESTIONS[2],a.consistencyProblem,a)};
    if(a.outcome==='search')return {id:a.searchProblem,text:optionLabelById(CONTENT_QUESTIONS[3],a.searchProblem,a)};
    return {id:'other',text:a.otherProblem||'un problema que requiere revisión'};
  }
  function brandProblem(a){
    var map={clarity:['clarityProblem',BRAND_QUESTIONS[1]],consistency:['systemProblem',BRAND_QUESTIONS[2]],autonomy:['systemProblem',BRAND_QUESTIONS[2]],launch:['launchProblem',BRAND_QUESTIONS[3]],reposition:['repositionProblem',BRAND_QUESTIONS[4]]};
    var pair=map[a.desired];
    if(!pair)return {id:'other',text:a.brandOtherProblem||'una necesidad que requiere revisión'};
    return {id:a[pair[0]],text:optionLabelById(pair[1],a[pair[0]],a)};
  }
  function preliminaryContentKey(a){
    var problem=contentProblem(a).id;
    var search=a.entry==='autoridad'||a.entry==='motor'||a.outcome==='search'||problem==='site'||['noSite','notFound','unclearSite','noLeads','unknown'].indexOf(problem)>=0;
    var content=a.entry==='motor'||a.outcome!=='search'||['lowReach','noInquiries','unclearOffer','lowTrust','noNextStep','ideas','time','generic','approvals','process'].indexOf(problem)>=0;
    return search&&content?'motor':(search?'autoridad':'contenido');
  }
  function needsSearch(a){return preliminaryContentKey(a)!=='contenido';}
  function budgetOptions(route,state){
    if(route==='branding')return [
      {id:'b_lt18',label:'Hasta 18 mil MXN'}, {id:'b_18_30',label:'18–30 mil MXN'},
      {id:'b_31_60',label:'31–60 mil MXN'}, {id:'b_61_120',label:'61–120 mil MXN'},
      {id:'b_gt120',label:'Más de 120 mil MXN'}, {id:'unknown',label:'Necesito conocer primero el alcance recomendado'}
    ];
    var key=preliminaryContentKey(state);
    if(key==='contenido')return [
      {id:'c_lt12',label:'Hasta 12 mil MXN al mes'}, {id:'c_12_20',label:'12–20 mil MXN al mes'},
      {id:'c_21_32',label:'21–32 mil MXN al mes'}, {id:'c_33_50',label:'33–50 mil MXN al mes'},
      {id:'c_gt50',label:'Más de 50 mil MXN al mes'}, {id:'unknown',label:'Necesito ver primero qué conviene hacer'}
    ];
    if(key==='autoridad')return [
      {id:'a_lt25',label:'Hasta 25 mil MXN'}, {id:'a_25_45',label:'25–45 mil MXN'},
      {id:'a_46_80',label:'46–80 mil MXN'}, {id:'a_81_120',label:'81–120 mil MXN'},
      {id:'a_gt120',label:'Más de 120 mil MXN'}, {id:'unknown',label:'Necesito ver primero qué conviene hacer'}
    ];
    return [
      {id:'m_lt30',label:'Hasta 30 mil MXN'}, {id:'m_30_60',label:'30–60 mil MXN'},
      {id:'m_61_100',label:'61–100 mil MXN'}, {id:'m_101_150',label:'101–150 mil MXN'},
      {id:'m_gt150',label:'Más de 150 mil MXN'}, {id:'unknown',label:'Necesito ver primero qué conviene hacer'}
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
    return basis+' Los rangos están en MXN, no incluyen IVA y no son una cotización.';
  }
  function budgetContext(route,state){
    if(route==='branding'){
      var desired=optionLabelById(BRAND_QUESTIONS[0],state.desired,state).toLowerCase();
      return 'Hasta aquí entendemos que buscas '+desired+' y que el principal freno es: '+brandProblem(state).text.toLowerCase()+'. La inversión solo ajustará la profundidad de la primera etapa.';
    }
    var outcome=optionLabelById(CONTENT_QUESTIONS[0],state.outcome,state).toLowerCase();
    var action=optionLabelById(CONTENT_QUESTIONS[5],state.nextAction,state).toLowerCase();
    return 'Hasta aquí entendemos que buscas '+outcome+' y que hoy el principal freno es: '+contentProblem(state).text.toLowerCase()+'. El siguiente paso que quieres provocar es '+action+'.';
  }
  function budgetRank(value){
    return {c_lt12:0,c_12_20:1,c_21_32:2,c_33_50:3,c_gt50:4,a_lt25:0,a_25_45:1,a_46_80:2,a_81_120:3,a_gt120:4,m_lt30:0,m_30_60:1,m_61_100:2,m_101_150:3,m_gt150:4,b_lt18:0,b_18_30:1,b_31_60:2,b_61_120:3,b_gt120:4,unknown:-1}[value];
  }

  function recommendContent(a){
    var key=preliminaryContentKey(a),search=key!=='contenido',content=key!=='autoridad';
    var catalog={
      contenido:{name:'Contenido para atraer posibles clientes',band:'12–32 mil MXN al mes',desc:'Temas, textos y diseños principales, con versiones para cada canal y revisión mensual.'},
      autoridad:{name:'Sitio para que te encuentren y confíen',band:'25–80 mil MXN de inversión inicial',desc:'Un sitio claro, mejoras para buscadores y respuestas fáciles de entender para herramientas de inteligencia artificial.'},
      motor:{name:'Contenido y sitio conectados por etapas',band:'Primera etapa según prioridad',desc:'Contenido, sitio y búsquedas conectados en un plan que empieza por el problema más importante.'}
    };
    var capacity=budgetRank(a.budgetBand),gap=false,start='';
    if(key==='contenido'&&capacity===0){gap=true;start='La mejor forma de empezar es una intervención prioritaria y un plan para crecer después.';}
    if(key==='autoridad'&&capacity===0){gap=true;start='Conviene resolver primero la parte del sitio que más afecta la confianza o los contactos.';}
    if(key==='motor'&&capacity>=0&&capacity<2){gap=true;start='Recomendamos hacerlo por etapas: primero el problema con mayor impacto y después conectar el segundo frente.';}
    if(a.budgetBand==='unknown')start='El diagnóstico definirá primero qué conviene resolver; después podremos dimensionar la inversión sin forzar un alcance prematuro.';
    var reasons=[];
    if(content)reasons.push('Tus respuestas muestran que necesitas mejores temas, mayor constancia o un siguiente paso más claro para vender.');
    if(search)reasons.push('También hay un problema en el sitio o es difícil encontrar y entender tu negocio antes de decidir.');
    if(a.proof&&a.proof.indexOf('none')>=0)reasons.push('La producción deberá incluir una fase inicial para documentar evidencia y materiales reales.');
    if(a.timing==='exploring')reasons.push('El momento todavía es exploratorio; la revisión debe ayudarte a decidir sin forzar una compra.');
    return {route:'contenido',key:key,name:catalog[key].name,band:catalog[key].band,desc:catalog[key].desc,gap:gap,start:start,reasons:reasons};
  }

  function recommendBrand(a){
    var score=0;
    var problem=brandProblem(a).id;
    if(['complete','identity','old','wrongAudience','channels','manual'].indexOf(problem)>=0)score+=2; else score+=1;
    if(a.users==='providers')score+=1; else if(a.users==='scale')score+=2;
    if((a.applications||[]).length>=4)score+=2; else if((a.applications||[]).length>=2)score+=1;
    if(a.autonomy==='independent')score+=1;
    if(['launch','reposition'].indexOf(a.desired)>=0)score+=1;
    var need=score<=3?'essential':(score<=6?'complete':'extended');
    var catalog={
      essential:{name:'Sistema esencial',band:'18–30 mil MXN',desc:'Claridad, núcleo visual y las reglas mínimas para dejar de improvisar.'},
      complete:{name:'Sistema de marca completo',band:'31–60 mil MXN',desc:'Mensaje, identidad y usos prioritarios para que la marca sea consistente.'},
      extended:{name:'Sistema extendido',band:'61–120 mil MXN',desc:'Una guía amplia para equipos, proveedores y todos los lugares donde aparece la marca.'}
    };
    var needRank={essential:1,complete:2,extended:3}[need],capacity=budgetRank(a.budgetBand),gap=capacity>=0&&capacity<needRank;
    var start='';
    if(a.budgetBand==='b_lt18')start='La mejor forma de empezar es una intervención prioritaria y una ruta clara para completar el sistema después.';
    else if(gap)start='La necesidad es mayor que el rango disponible. Recomendamos construir el sistema por etapas y dejar un plan claro para completarlo.';
    else if(a.budgetBand==='unknown')start='Primero debemos validar profundidad y aplicaciones antes de dimensionar la inversión.';
    var reasons=[];
    if(['launch','reposition'].indexOf(a.desired)>=0)reasons.push('El momento del negocio exige una base que pueda aplicarse sin improvisar.');
    if(['channels','team','providers','templates','manual'].indexOf(problem)>=0)reasons.push('Los lugares donde aparece la marca necesitan reglas y recursos comunes.');
    if(['providers','scale'].indexOf(a.users)>=0)reasons.push('Varias personas o proveedores necesitan una fuente clara para aplicar la marca.');
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
    this.storageKey='dv-diagnostic-v3-'+this.route;
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
    if(q.type==='single'&&questionOptions(q,this.state).length&&!questionOptions(q,this.state).some(function(option){return option.id===value;}))return false;
    if(value==='other'&&!String(this.state[q.id+'Other']||'').trim())return false;
    return true;
  };
  Diagnostic.prototype.render=function(){
    var current=this.current(),q=current.q,list=current.list;
    if(!q)return;
    var pendingBranch=(this.route==='contenido'&&!this.state.outcome)||(this.route==='branding'&&!this.state.desired);
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
    h+=this.fieldHtml(q);
    h+='<div class="dv-form-nav">'+(this.index?'<button type="button" class="btn dv-back">← Atrás</button>':'<span></span>')+'<button type="button" class="btn solid dv-next"'+(this.hasAnswer(q)?'':' disabled')+'>'+(q.type==='contact'?'Enviar y ver recomendación':'Continuar')+' <span class="ar">→</span></button></div>';
    if(this.index===0)h+='<p class="dv-form-note">4–6 minutos · preguntas según tu situación · revisión y respuesta personal</p>';
    h+='</div></div>';
    this.el.innerHTML=h;
    this.bind(q);
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
          var options=questionOptions(q,self.state),selected=options.filter(function(option){return option.id===value;})[0];
          var values=self.state[q.id]||[],pos=values.indexOf(value);
          if(pos>=0)values.splice(pos,1);
          else if(selected&&selected.exclusive)values=[value];
          else{
            values=values.filter(function(current){return !options.some(function(option){return option.id===current&&option.exclusive;});});
            values.push(value);
          }
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
      : '<div class="dv-result-next"><b>Solicitud recibida</b><p>Arturo revisará personalmente tus respuestas. Si hay información suficiente y existe encaje, te contactará por correo o WhatsApp con las oportunidades prioritarias y una propuesta del siguiente paso.</p></div>';
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

  root.DVDiagnostic={recommendation:recommendation,needsSearch:needsSearch,visibleQuestions:visibleQuestions,budgetContext:budgetContext,contactErrors:contactErrors,validWebUrl:validWebUrl,Diagnostic:Diagnostic};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.DVDiagnostic;
  if(typeof document==='undefined')return;
  document.addEventListener('DOMContentLoaded',function(){[].slice.call(document.querySelectorAll('[data-dv-diagnostic]')).forEach(function(el){new Diagnostic(el);});});
})(typeof window!=='undefined'?window:this);
