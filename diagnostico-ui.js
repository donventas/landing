/* Don Ventas — Diagnóstico de marca · UI: encuesta paso a paso, resultado del cliente y vista interna. */
(function(){

  /* ══════════════════════════════════════════════════════════════════
     CONFIG — edita SOLO estos valores para conectar llamada, WhatsApp y Stripe.
     Todo lo demás se adapta solo. Deja un campo vacío ('') para OCULTAR ese botón.
     ─────────────────────────────────────────────────────────────────
     ─────────────────────────────────────────────────────────────────
     STRIPE — cómo pasar de PRUEBA a REAL (cobro de verdad):

     A) MODO PRUEBA (para verificar el flujo sin mover dinero):
        1) En Stripe, arriba a la derecha activa el toggle "Modo de prueba".
        2) Payment Links → crear enlace → monto = RESERVA_MONTO MXN.
        3) En el enlace, "Después del pago" → Redirigir → pon la URL de
           ESTA página + '?reserva=ok'  (muestra la pantalla "Apartaste tu lugar").
        4) Copia la URL (empieza con 'https://buy.stripe.com/test_...') y pégala
           abajo en STRIPE_RESERVA_LINK. Deja  STRIPE_ES_PRUEBA: true.

     B) MODO REAL (cuando ya vayas a cobrar):
        1) Activa tu cuenta en Stripe (verificación: RFC/datos fiscales,
           identidad y cuenta bancaria para depósitos).
        2) APAGA el "Modo de prueba" y crea de nuevo el Payment Link (los links
           de prueba NO sirven en real; hay que rehacerlo en modo activo).
        3) Repite el redirect a esta página + '?reserva=ok'.
        4) Reemplaza STRIPE_RESERVA_LINK por la URL real
           ('https://buy.stripe.com/...' SIN 'test_') y pon  STRIPE_ES_PRUEBA: false
           (así desaparece la etiqueta "Prueba").
        5) Ajusta RESERVA_MONTO si cambia el monto del apartado.

     Resumen de qué tocar al pasar a real: STRIPE_RESERVA_LINK (link real),
     STRIPE_ES_PRUEBA → false, y RESERVA_MONTO si aplica. Nada más.
     ══════════════════════════════════════════════════════════════════ */
  var DV_CFG = {
    CALENDLY_URL:        'https://calendly.com/arturo-villagomez-donventas/30min',   // (vacío → sin botón de agenda)
    WHATSAPP_NUM:        '525551054347',   // solo dígitos con lada 52, p.ej. '5215512345678'  (vacío → sin botón WhatsApp)
    STRIPE_RESERVA_LINK: 'https://buy.stripe.com/test_14A00i9hO6KF8No3Mq14400',   // Payment Link de Stripe (vacío → sin apartado)
    STRIPE_ES_PRUEBA:    true, // muestra la etiqueta "PRUEBA" junto al apartado mientras sea test
    RESERVA_MONTO:       500,  // MXN, acreditable al total del proyecto
    // Alta del lead en Supabase (llaves públicas anon; RLS solo-INSERT). Vacío → no guarda, solo muestra.
    SUPABASE_URL:        'https://hlabhmegjnrjygsywnqa.supabase.co',
    SUPABASE_ANON:       'sb_publishable_Pk-_A1MghCXv9F5r9TvcxA_vkf08JYh',
    LEAD_TABLE:          'lead'
  };

  var A={}, idx=0, RESULT=null;
  var META=(function(){var p=new URLSearchParams(location.search);return {source:p.get('utm_source')||'',medium:p.get('utm_medium')||'',campaign:p.get('utm_campaign')||'',content:p.get('utm_content')||p.get('utm_term')||''};})();
  var wrap=document.getElementById('cardWrap'), bar=document.getElementById('bar');

  function setProgress(){ bar.style.width=Math.round((idx/QUESTIONS.length)*100)+'%'; }

  function render(){
    setProgress();
    var Q=QUESTIONS[idx];
    if(!Q)return finish();
    var html='<div class="step">';
    html+='<div class="qno">Pregunta '+(idx+1)+' de '+QUESTIONS.length+'</div>';
    html+='<h2 class="q">'+Q.q+'</h2>';
    if(Q.h)html+='<p class="qh">'+Q.h+'</p>';

    if(Q.contact){
      html+='<div class="field"><label>Tu nombre</label><input id="f-nombre" value="'+(A.nombre||'')+'" placeholder="Nombre y apellido"></div>';
      html+='<div class="field"><label>Negocio / empresa</label><input id="f-empresa" value="'+(A.empresa||'')+'" placeholder="Nombre de tu negocio"></div>';
      html+='<div class="grid2"><div class="field"><label>Email</label><input id="f-email" type="email" value="'+(A.email||'')+'" placeholder="tu@correo.com"></div>';
      html+='<div class="field"><label>WhatsApp</label><input id="f-whatsapp" value="'+(A.whatsapp||'')+'" placeholder="+52 ..."></div></div>';
      if(!META.source)html+='<div class="field"><label>¿Cómo nos encontraste? (opcional)</label><input id="f-canal" value="'+(A.canal||'')+'" placeholder="Instagram, referido, búsqueda..."></div>';
      html+='<div class="field"><label>¿Qué contenido te trajo? (opcional)</label><input id="f-contenido" value="'+(A.contenido||'')+'" placeholder="Un post, un video, una recomendación..."></div>';
    } else if(Q.free){
      html+='<div class="field"><textarea id="f-free" rows="3" placeholder="'+(Q.placeholder||'')+'">'+(A[Q.id]||'')+'</textarea></div>';
    } else {
      html+='<div class="opts">';
      Q.opts.forEach(function(o,i){
        var on=isSelected(Q,i);
        html+='<button class="opt'+(Q.multi?' multi':'')+(on?' on':'')+'" data-i="'+i+'"><span class="dot"></span><span class="tx"><b>'+o.b+'</b>'+(o.s?'<span>'+o.s+'</span>':'')+'</span></button>';
      });
      html+='</div>';
    }
    html+='<div class="nav">';
    if(idx>0)html+='<button class="btn ghost" id="back">← Atrás</button>';
    html+='<span class="sp"></span>';
    var lastQ=idx===QUESTIONS.length-1;
    html+='<button class="btn primary" id="next"'+(canAdvance(Q)?'':' disabled')+'>'+(lastQ?'Ver mi diagnóstico':'Continuar')+'</button>';
    html+='</div>';
    if(idx===0)html+='<div class="hintline">Toma 5 minutos · sin costo · sin compromiso</div>';
    html+='</div>';
    wrap.innerHTML=html;
    bind(Q,lastQ);
  }

  function isSelected(Q,i){ if(Q.multi)return (A[Q.id]||[]).indexOf(Q.opts[i].b)>=0; return A['_sel_'+Q.id]===i; }
  function canAdvance(Q){ if(Q.contact)return !!(A.nombre&&A.email); if(Q.free||Q.multi)return true; return A['_sel_'+Q.id]!=null; }

  function bind(Q,lastQ){
    var nextBtn=document.getElementById('next'), backBtn=document.getElementById('back');
    if(backBtn)backBtn.onclick=function(){idx--;render();};
    if(nextBtn)nextBtn.onclick=function(){ if(nextBtn.disabled)return; saveContact(Q); idx++; render(); persist(); };
    wrap.querySelectorAll('.opt').forEach(function(btn){
      btn.onclick=function(){
        var i=+btn.dataset.i,o=Q.opts[i];
        if(Q.multi){
          A[Q.id]=A[Q.id]||[]; var pos=A[Q.id].indexOf(o.b);
          if(pos>=0)A[Q.id].splice(pos,1); else A[Q.id].push(o.b);
          btn.classList.toggle('on');
        } else {
          A['_sel_'+Q.id]=i;
          wrap.querySelectorAll('.opt').forEach(function(b){b.classList.remove('on');});
          btn.classList.add('on');
          if(nextBtn)nextBtn.disabled=false;
          setTimeout(function(){ idx++; render(); persist(); }, 220);
        }
        persist();
      };
    });
    var free=document.getElementById('f-free');
    if(free)free.oninput=function(){A[Q.id]=free.value;persist();};
    ['nombre','empresa','email','whatsapp','canal','contenido'].forEach(function(k){
      var el=document.getElementById('f-'+k);
      if(el)el.oninput=function(){A[k]=el.value;var n=document.getElementById('next');if(n)n.disabled=!canAdvance(Q);persist();};
    });
  }
  function saveContact(Q){ if(!Q.contact)return; ['nombre','empresa','email','whatsapp','canal','contenido'].forEach(function(k){var el=document.getElementById('f-'+k);if(el)A[k]=el.value;}); }

  /* ===== helpers de moneda / paquete cliente ===== */
  function fmtMXNlocal(n){ return '$'+Math.round(n).toLocaleString('es-MX')+' MXN'; }

  function saveLead(){
    // fire-and-forget: guarda el lead con su tier/score en Supabase (si hay config).
    if(!DV_CFG.SUPABASE_URL||!DV_CFG.SUPABASE_ANON||!A.email) return;
    try{
      var body={
        nombre:A.nombre||'', correo:A.email, negocio:A.empresa||'',
        whatsapp:A.whatsapp||'', reto:A.goal||'',
        paquete:(TIERS[RESULT.tier]?TIERS[RESULT.tier].label:RESULT.tier)+' · '+RESULT.total+'/100',
        consent:true, origen:(META.source||A.canal||'diagnostico')
      };
      fetch(DV_CFG.SUPABASE_URL+'/rest/v1/'+DV_CFG.LEAD_TABLE,{
        method:'POST',
        headers:{'Content-Type':'application/json','apikey':DV_CFG.SUPABASE_ANON,'Authorization':'Bearer '+DV_CFG.SUPABASE_ANON,'Prefer':'return=minimal'},
        body:JSON.stringify(body)
      }).catch(function(){});
    }catch(e){}
  }

  function ctasHtml(){
    var chk='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 13l4 4L19 7"/></svg>';
    var cal='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>';
    var wa='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.5 15.3L2 22l4.8-1.4A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-2.8.8.8-2.7-.2-.3A8 8 0 1112 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.5 6.5 0 01-3.2-2.8c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.7.7-.9 1.6-.6 2.6.4 1.4 1.3 2.6 2.6 3.6 1.9 1.4 3.4 1.6 4.3 1.4.6-.1 1.4-.6 1.6-1.2.2-.5.2-1 .1-1.1l-.4-.1z"/></svg>';
    var h='<div class="cta-stack">';
    var hasPrimary=false;
    if(DV_CFG.CALENDLY_URL){
      h+='<a class="cta-big primary" href="'+DV_CFG.CALENDLY_URL+'" target="_blank" rel="noopener">'+cal+' Agendar mi llamada gratis</a>';
      hasPrimary=true;
    }
    if(DV_CFG.WHATSAPP_NUM){
      var msg=encodeURIComponent('Hola, acabo de hacer el diagnóstico de marca'+(A.empresa?(' para '+A.empresa):'')+' y me interesa agendar la llamada.');
      h+='<a class="cta-big '+(hasPrimary?'wa':'primary')+'" href="https://wa.me/'+DV_CFG.WHATSAPP_NUM+'?text='+msg+'" target="_blank" rel="noopener">'+wa+' '+(hasPrimary?'Escríbenos por WhatsApp':'Agendar por WhatsApp')+'</a>';
      hasPrimary=true;
    }
    if(!hasPrimary){
      h+='<div class="cta-big primary" style="cursor:default">'+chk+' Te contactamos en menos de 24 h</div>';
    }
    h+='<div class="ctahint">Sin costo · sin compromiso · la llamada define tu precio exacto</div>';
    h+='<div class="ctahint" style="color:var(--accent2)">Trabajamos con pocos proyectos a la vez — <b>agendamos según cupo disponible</b>.</div>';
    if(DV_CFG.STRIPE_RESERVA_LINK){
      var link=DV_CFG.STRIPE_RESERVA_LINK+(A.email?((DV_CFG.STRIPE_RESERVA_LINK.indexOf('?')>=0?'&':'?')+'prefilled_email='+encodeURIComponent(A.email)):'');
      h+='<div class="reserva"><div class="rt"><b>¿Quieres asegurar tu lugar?'+(DV_CFG.STRIPE_ES_PRUEBA?'<span class="testflag">Prueba</span>':'')+'</b>'
        +'<p>Aparta con '+fmtMXNlocal(DV_CFG.RESERVA_MONTO)+', <b>100% acreditable</b> a tu proyecto. ¿No es para ti tras la llamada? Te lo <b>reembolsamos</b> — sin riesgo.</p></div>'
        +'<a href="'+link+'" target="_blank" rel="noopener">Apartar '+fmtMXNlocal(DV_CFG.RESERVA_MONTO)+'</a></div>';
    }
    h+='</div>';
    return h;
  }

  /* ===== resultado del cliente ===== */
  function finish(){
    bar.style.width='100%';
    RESULT=segmentar(A); persist();
    saveLead();
    document.getElementById('ibtn').style.display='block';
    var findings=clienteDiagnostico(RESULT,A);
    var nombre=A.nombre? A.nombre.split(' ')[0]:'';
    var t=TIERS[RESULT.tier];
    var icons=[
      '<svg viewBox="0 0 24 24" fill="none" stroke="#3B74F2" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="#6E97F6" stroke-width="2" stroke-linecap="round"><path d="M4 18l6-6 4 3 6-8"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="#16A862" stroke-width="2" stroke-linecap="round"><path d="M5 13l4 4L19 7"/></svg>'
    ];
    var fh=findings.map(function(f,i){return '<div class="finding"><div class="ic">'+icons[i%icons.length]+'</div><div class="ft"><b>'+f.t+'</b><p>'+f.p+'</p></div></div>';}).join('');
    document.querySelector('.card-wrap').style.display='none';
    var res=document.createElement('div');res.className='result';
    res.innerHTML=
      '<div class="rhead"><div class="in"><div class="tag">Tu diagnóstico · '+(A.empresa||'tu negocio')+'</div>'
      +'<h1>'+(nombre?nombre+', ':'')+'esto es lo que vimos en tu marca</h1>'
      +'<p>Un primer vistazo con base en tus respuestas. La versión completa, con tu plan a la medida, la revisamos juntos en la llamada.</p></div></div>'
      +'<div class="rcard"><h3>Lo que encontramos</h3>'+fh+'</div>'
      +'<div class="pkg"><div class="in">'
        +'<div class="klabel">Tu punto de partida sugerido</div>'
        +'<h2>'+t.label+'</h2>'
        +'<div class="price"><b>'+fmtRangeMXN(t.priceLo,t.priceHi)+'</b><span class="u">inversión estimada · pago '+t.pago+'</span></div>'
        +'<div class="meta"><div><div class="k">Incluye estrategia</div><div class="v">'+t.estrategia+'</div></div>'
          +'<div><div class="k">Alcance</div><div class="v">'+t.total+'</div></div>'
          +'<div><div class="k">Plazo</div><div class="v">'+t.plazo+'</div></div></div>'
        +'<ul class="scope">'+t.scope.map(function(s){return '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 13l4 4L19 7"/></svg>'+s+'</li>';}).join('')+'</ul>'
        +'<p class="refnote">Es una banda de referencia según tus respuestas. El precio exacto y el plan definitivo los cerramos juntos en tu llamada — a la medida de '+(A.empresa||'tu negocio')+'.</p>'
      +'</div></div>'
      +ctasHtml()
      +'<div style="text-align:center;margin-top:22px"><button class="btn ghost" onclick="restart()">↻ Empezar un nuevo diagnóstico</button></div>';
    document.getElementById('stage').appendChild(res);
    window.scrollTo(0,0);
  }

  /* ===== vista interna ===== */
  window.openInternal=function(){ if(!RESULT)RESULT=segmentar(A); buildInternal(); document.getElementById('modal').classList.add('on'); };
  window.closeInternal=function(){ document.getElementById('modal').classList.remove('on'); };
  window.restart=function(){ A={}; idx=0; RESULT=null; try{localStorage.removeItem('dv-diag');}catch(e){} var r=document.querySelector('.result'); if(r)r.remove(); var cw=document.querySelector('.card-wrap'); if(cw)cw.style.display=''; var ib=document.getElementById('ibtn'); if(ib)ib.style.display='none'; render(); window.scrollTo(0,0); };
  window.tab=function(name){
    document.querySelectorAll('.tabs button').forEach(function(b){b.classList.toggle('on',b.dataset.pane===name);});
    document.querySelectorAll('.pane').forEach(function(p){p.classList.remove('on');});
    document.getElementById('pane-'+name).classList.add('on');
  };

  function buildInternal(){
    var r=RESULT,t=TIERS[r.tier];
    document.getElementById('segBadge').textContent=r.tier+' · '+r.total+'/100';
    // LEAD
    document.getElementById('pane-lead').innerHTML=
      '<div class="axes">'+DIMS.map(function(D){return axCard(D.nm,r.d[D.k]+'/'+D.max,'');}).join('')+'</div>'
      +'<div class="pgrid">'
      +pc('Score total',r.total+'/100 · banda '+r.band)
      +pc('Tier final',r.tier+(r.rules.length?(' · reglas '+r.rules.join(', ')):''))
      +pc('Contacto',(A.nombre||'—')+'<br>'+(A.email||'—')+'<br>'+(A.whatsapp||''))
      +pc('Empresa / origen',(A.empresa||'—')+'<br>'+((META.source||A.canal||'—'))+(A.contenido?(' · '+A.contenido):''))
      +'</div>'
      +'<div class="pcard" style="margin-bottom:14px"><div class="l">Objetivo del cliente</div><div class="v" style="font-size:15px;font-weight:500">'+(A.goal||'—')+'</div></div>'
      +(r.note.length?('<div class="pcard"><div class="l">Notas de regla</div><div class="v" style="font-size:13.5px;font-weight:500;line-height:1.5">'+r.note.join('<br>')+'</div></div>'):'')
      +'<div class="delivery"><button class="btn" onclick="copyText(window.__lead)">⧉ Copiar resumen</button><button class="btn" onclick="downloadLead()">⬇ Descargar lead</button></div>';
    window.__lead=leadResumen(r,A,META);

    // PROPUESTA
    document.getElementById('pane-prop').innerHTML=
      '<div class="seg-note"><b>'+t.label+'.</b> Banda de referencia en MXN, sujeta a confirmación en la llamada. El diagnóstico de segmentación es sin costo.</div>'
      +'<div class="prop-line"><div class="nm"><b>Inversión del paquete</b><span>'+t.total+' · pago '+t.pago+'</span></div><div class="pr"><b>'+fmtRangeMXN(t.priceLo,t.priceHi)+'</b><span>plazo '+t.plazo+'</span></div></div>'
      +'<div class="prop-line"><div class="nm"><b>Capa estratégica</b><span>'+t.estrategia+'</span></div><div class="pr"><b>incluida</b><span>'+t.rondas+'</span></div></div>'
      +'<div class="pcard" style="margin-top:14px"><div class="l" style="margin-bottom:9px">Alcance incluido</div><ul class="scope">'+t.scope.map(function(s){return '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 13l4 4L19 7"/></svg>'+s+'</li>';}).join('')+'</ul></div>'
      +'<div class="pcard" style="margin-top:12px"><div class="l" style="margin-bottom:6px">Bloques en alcance</div><div class="v" style="font-size:13px;font-weight:500;line-height:1.7">'+t.bloques.join(' · ')+'</div></div>'
      +'<div class="delivery"><button class="btn" onclick="copyText(window.__prop)">⧉ Copiar propuesta</button><button class="btn" onclick="mailProp()">✉ Email</button><button class="btn" onclick="waProp()">WhatsApp</button></div>';
    window.__prop=propText(r,A);

    // PSB
    document.getElementById('pane-psb').innerHTML=
      '<div class="seg-note">Project Scoping Block — se valida con el fundador <b>antes</b> de presentar propuesta y queda congelado al firmar.</div>'
      +'<div class="copybox">'+escapeHtml(psbText(r,A))+'</div>'
      +'<div class="delivery"><button class="btn" onclick="copyText(window.__psb)">⧉ Copiar PSB</button></div>';
    window.__psb=psbText(r,A);

    // SCRIPT
    document.getElementById('pane-script').innerHTML=
      '<div class="seg-note">Guion en frío generado a partir del perfil, el canal y el objetivo. Sustituye [tu nombre], [día] y [hora].</div>'
      +'<div class="copybox">'+escapeHtml(coldScript(r,A,META))+'</div>'
      +'<div class="delivery"><button class="btn" onclick="copyText(window.__script)">⧉ Copiar guion</button><button class="btn" onclick="copyText(window.__contact)">⧉ Copiar mensaje corto</button></div>';
    window.__script=coldScript(r,A,META); window.__contact=contactMsg(r,A);
  }

  window.copyText=function(t){ try{navigator.clipboard&&navigator.clipboard.writeText(t);}catch(e){} var ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(e){}document.body.removeChild(ta); toast('Copiado ✓'); };
  window.downloadLead=function(){ var blob=new Blob([window.__lead+'\n\n'+window.__psb+'\n\n'+window.__prop],{type:'text/plain'}); var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='lead-'+(A.empresa||'prospecto').replace(/\s+/g,'-')+'.txt';a.click(); toast('Lead descargado ✓'); };
  window.mailProp=function(){ var subj='Propuesta Don Ventas — '+(A.empresa||''); var body=contactMsg(RESULT,A)+'\n\n'+window.__prop; openOrCopy('mailto:'+(A.email||'')+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body), body,'No se pudo abrir el correo — propuesta copiada ✓'); };
  window.waProp=function(){ var num=(A.whatsapp||'').replace(/[^0-9]/g,''); var body=contactMsg(RESULT,A)+'\n\n'+window.__prop; openOrCopy('https://wa.me/'+num+'?text='+encodeURIComponent(body), body,'No se pudo abrir WhatsApp — mensaje copiado ✓'); };
  function openOrCopy(url,fallback,msg){ var w=null; try{w=window.open(url,'_blank');}catch(e){} if(!w){ try{navigator.clipboard&&navigator.clipboard.writeText(fallback);}catch(e){} var ta=document.createElement('textarea');ta.value=fallback;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(e){}document.body.removeChild(ta); toast(msg);} else toast('Abriendo… ✓'); }

  function axCard(k,lv,nm){return '<div class="ax"><div class="k">'+k+'</div><div class="lv">'+lv+'</div>'+(nm?'<div class="nm">'+nm+'</div>':'')+'</div>';}
  function pc(l,v){return '<div class="pcard"><div class="l">'+l+'</div><div class="v" style="font-size:14px;font-weight:500;line-height:1.5">'+v+'</div></div>';}
  function escapeHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function toast(t){var el=document.getElementById('toast');el.textContent=t;el.classList.add('on');setTimeout(function(){el.classList.remove('on');},1500);}

  function persist(){ try{ localStorage.setItem('dv-diag',JSON.stringify({A:A,idx:idx})); }catch(e){} }

  /* ===== gracias (retorno del apartado de Stripe: Success URL → ?reserva=ok) ===== */
  function showGracias(){
    var stage=document.getElementById('stage');
    var cw=document.querySelector('.card-wrap'); if(cw)cw.style.display='none';
    document.querySelector('.progress').style.display='none';
    var nombre=A.nombre? A.nombre.split(' ')[0]:'';
    var wrapEl=document.createElement('div'); wrapEl.className='gracias';
    var g='<div class="ok"><svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13l5 5L20 6"/></svg></div>'
      +'<h1>'+(nombre?('¡Listo, '+nombre+'! '):'¡Listo! ')+'Apartaste tu lugar</h1>'
      +'<p>Recibimos tu apartado'+(DV_CFG.STRIPE_ES_PRUEBA?' <b>(pago de prueba)</b>':'')+'. Es <b>100% acreditable</b> a tu proyecto (y reembolsable si decides no avanzar). Te enviamos la confirmación por correo y agendamos tu llamada de kickoff.</p>'
      +'<div class="g-cta">'+ctasHtml()+'</div>';
    wrapEl.innerHTML=g;
    stage.appendChild(wrapEl);
    // marca el lead como «apartado» (best-effort)
    if(A.email){ RESULT=RESULT||segmentar(A); try{ A._reserva=true; saveLead(); }catch(e){} }
    window.scrollTo(0,0);
  }

  (function restore(){
    try{var s=JSON.parse(localStorage.getItem('dv-diag')||'null'); if(s&&s.A){A=s.A; idx=Math.min(s.idx||0,QUESTIONS.length);}}catch(e){}
    var back=new URLSearchParams(location.search).get('reserva');
    if(back==='ok'){ showGracias(); return; }
    render();
  })();
  document.getElementById('modal').addEventListener('click',function(e){ if(e.target===this)closeInternal(); });
})();
