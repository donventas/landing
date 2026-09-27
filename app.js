/* ════════════════════════════════════════════════════════════════════
   Don Ventas — landing (donventas.mx)
   Fuente editable. Cargado con `defer` desde index.html.
   Secciones:  1) reveal on-scroll   2) lightbox   3) solicitud de diagnóstico (Supabase)
               4) preselección de oferta   5) banner de cookies + Clarity
   Config (llaves públicas) al pie de cada sección — edítalas ahí.
   ════════════════════════════════════════════════════════════════════ */

/* Vercel Web Analytics — bootstrap (sin cookies; el <script> del insights
   se carga desde index.html justo después de este archivo). */
window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };

/* ── 1 · reveal on-scroll (+ failsafe de impresión) ───────────────── */
(function(){
  document.documentElement.classList.add('js');
  var els=[].slice.call(document.querySelectorAll('.reveal'));
  if('IntersectionObserver' in window && els.length){
    var io=new IntersectionObserver(function(ents){
      ents.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    },{rootMargin:'0px 0px -8% 0px',threshold:.12});
    els.forEach(function(el){ io.observe(el); });
    // Failsafe SOLO para impresión/PDF (ahí no corre el observer de scroll):
    // revela todo para que nada salga en blanco en papel. En pantalla NO se
    // fuerza nada, así la animación de entrada por scroll se reproduce.
    var revealAll=function(){ els.forEach(function(el){ el.classList.add('in'); }); };
    window.addEventListener('beforeprint', revealAll);
    if(window.matchMedia){ try{ var mq=window.matchMedia('print'); if(mq.addEventListener) mq.addEventListener('change',function(e){ if(e.matches) revealAll(); }); else if(mq.addListener) mq.addListener(function(e){ if(e.matches) revealAll(); }); }catch(e){} }
  } else { els.forEach(function(el){ el.classList.add('in'); }); }
})();

/* ── 2 · lightbox de galería ──────────────────────────────────────── */
(function(){
  var lbx=document.getElementById('lbx'); if(!lbx) return;
  var lbxImg=lbx.querySelector('img'), lbxCap=lbx.querySelector('figcaption');
  function openLbx(src,cap){ lbxImg.src=src; lbxCap.innerHTML=cap||''; lbx.classList.add('open'); lbx.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
  function closeLbx(){ lbx.classList.remove('open'); lbx.setAttribute('aria-hidden','true'); document.body.style.overflow=''; setTimeout(function(){lbxImg.src='';},320); }
  [].slice.call(document.querySelectorAll('.gal [data-gallery]')).forEach(function(gallery){
    var sh=gallery.closest('.shot'), stage=gallery.querySelector('.case-stage'), stageImg=stage&&stage.querySelector('img');
    if(!sh||!stage||!stageImg)return;
    [].slice.call(gallery.querySelectorAll('.case-thumb')).forEach(function(thumb){
      thumb.addEventListener('click',function(){
        var src=thumb.getAttribute('data-src'), alt=thumb.getAttribute('data-alt')||'';
        var fit=thumb.getAttribute('data-fit')||'contain', label=thumb.getAttribute('data-label')||'Vista';
        var previousSrc=stageImg.getAttribute('src'), previousAlt=stageImg.alt||'';
        var previousFit=stage.getAttribute('data-fit')||'contain', previousLabel=stage.getAttribute('data-label')||'Vista';
        if(src)stageImg.src=src;
        stageImg.alt=alt;
        stage.setAttribute('data-fit',fit);
        stage.setAttribute('data-label',label);
        stage.setAttribute('aria-label','Ampliar '+(alt||'referencia visual'));
        thumb.setAttribute('data-src',previousSrc);
        thumb.setAttribute('data-alt',previousAlt);
        thumb.setAttribute('data-fit',previousFit);
        thumb.setAttribute('data-label',previousLabel);
        thumb.setAttribute('aria-label','Ver '+(previousAlt||'referencia visual anterior'));
        var thumbImg=thumb.querySelector('img'); if(thumbImg)thumbImg.src=previousSrc;
      });
    });
    stage.addEventListener('click',function(){
      var n=sh.querySelector('.meta .n'), k=sh.querySelector('.meta .k'), dd=sh.querySelector('.meta .d');
      var cap='<b>'+(n?n.textContent:'')+'</b>'+(k?' · '+k.textContent:'')+(dd?' — '+dd.textContent:'');
      openLbx(stageImg.currentSrc||stageImg.src,cap);
    });
  });
  lbx.addEventListener('click',function(e){ if(e.target===lbx||e.target.classList.contains('x'))closeLbx(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&lbx.classList.contains('open'))closeLbx(); });
})();

/* ── 3 · solicitud de diagnóstico → Supabase (tabla `lead`) ─────── */
(function(){
  // Config Supabase — clave pública (RLS permite solo INSERT). OK en front.
  var SUPABASE_URL = 'https://hlabhmegjnrjygsywnqa.supabase.co';
  var SUPABASE_ANON = 'sb_publishable_Pk-_A1MghCXv9F5r9TvcxA_vkf08JYh';
  var TABLE = 'lead';
  var form = document.getElementById('wlForm');
  if(!form) return;
  var ok = document.getElementById('wlOk');
  var started = false;
  form.addEventListener('focusin', function(){
    if(started) return; started = true;
    window.va('event', {name:'diagnostic_form_started'});
  });
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var btn = form.querySelector('button[type=submit]');
    var canales = [].slice.call(form.querySelectorAll('input[name="canal"]:checked')).map(function(x){return x.value;});
    var oferta = form.oferta.value || 'Por recomendar';
    var reto = [
      'Objetivo: ' + form.objetivo.value.trim(),
      'Audiencia: ' + form.audiencia.value.trim(),
      'Canales: ' + (canales.join(', ') || 'No indicado'),
      'Conversión: ' + form.conversion.value.trim(),
      'Capacidad: ' + form.inversion.value.trim()
    ].join(' | ');
    var d = {
      nombre: form.nombre.value.trim(),
      correo: form.correo.value.trim(),
      negocio: form.negocio.value.trim(),
      whatsapp: form.whatsapp.value.trim(),
      reto: reto,
      paquete: oferta,
      consent: form.consent.checked,
      origen: (new URLSearchParams(location.search)).get('utm_source') || 'landing',
      fecha: new Date().toISOString()
    };
    form.reto.value = reto;
    form.paquete.value = oferta;
    if(!d.nombre || !d.correo || !d.negocio || !form.objetivo.value || !form.audiencia.value || !form.conversion.value || !form.inversion.value || !d.consent){ if(form.reportValidity)form.reportValidity(); return; }
    btn.disabled = true; btn.textContent = 'Enviando…';
    window.va('event', {name:'diagnostic_form_submitted', data:{offer:oferta}});
    function done(){
      try{ var q = JSON.parse(localStorage.getItem('dv-waitlist')||'[]'); q.push(d); localStorage.setItem('dv-waitlist', JSON.stringify(q)); }catch(_){}
      form.hidden = true; ok.hidden = false;
      if(ok.querySelector('.pos')) ok.querySelector('.pos').textContent = 'Conserva este correo como referencia de tu solicitud.';
      window.va('event', {name:'diagnostic_form_completed', data:{offer:oferta}});
    }
    if(SUPABASE_URL && SUPABASE_ANON){
      fetch(SUPABASE_URL + '/rest/v1/' + TABLE, {
        method:'POST',
        headers:{'Content-Type':'application/json','apikey':SUPABASE_ANON,'Authorization':'Bearer '+SUPABASE_ANON,'Prefer':'return=minimal'},
        body: JSON.stringify({nombre:d.nombre,correo:d.correo,negocio:d.negocio,whatsapp:d.whatsapp,reto:d.reto,paquete:d.paquete,consent:d.consent,origen:d.origen})
      }).then(done).catch(done);
    } else {
      setTimeout(done, 450); // demo/local hasta conectar Supabase
    }
  });
})();

/* ── 4 · oferta elegida → preselección del brief ─────────────────── */
(function(){
  var select = document.getElementById('wl-oferta');
  if(!select) return;
  var labels = {contenido:'Contenido para redes', autoridad:'Sitio + SEO', motor:'Contenido + SEO + AEO'};
  [].slice.call(document.querySelectorAll('[data-offer]')).forEach(function(link){
    link.addEventListener('click', function(){
      var value = labels[link.getAttribute('data-offer')];
      if(value) select.value = value;
    });
  });
})();

/* ── 5 · banner de cookies + carga condicional de Clarity ─────────── */
/* window.dvCookie(accepted) lo llaman los botones (onclick) del banner. */
(function(){
  var KEY='dv-cookie-consent';
  var AVISO_VER='2026-07-12';
  var SB_URL='https://hlabhmegjnrjygsywnqa.supabase.co';
  var SB_ANON='sb_publishable_Pk-_A1MghCXv9F5r9TvcxA_vkf08JYh';
  var CLARITY_ID='xlcmparelv';
  var el=document.getElementById('dv-cookie');
  if(!el) return;

  function anonId(){
    try{ var k='dv-anon', v=localStorage.getItem(k);
      if(!v){ v=(Date.now().toString(36)+Math.random().toString(36).slice(2,10)); localStorage.setItem(k,v); }
      return v;
    }catch(e){ return 'na'; }
  }

  function logConsent(accepted){
    if(!SB_URL||!SB_ANON) return;
    try{
      fetch(SB_URL+'/rest/v1/consent_log', {
        method:'POST',
        headers:{'Content-Type':'application/json','apikey':SB_ANON,'Authorization':'Bearer '+SB_ANON,'Prefer':'return=minimal'},
        body: JSON.stringify({
          choice: accepted?'accepted':'rejected',
          aviso_version: AVISO_VER,
          anon_id: anonId(),
          page: (location.pathname||'/'),
          user_agent: (navigator.userAgent||'').slice(0,300)
        })
      }).catch(function(){});
    }catch(e){}
  }

  function loadClarity(){
    if(window.__dvClarity)return; window.__dvClarity=1;
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window,document,"clarity","script",CLARITY_ID);
  }

  window.dvCookie=function(accepted){
    try{localStorage.setItem(KEY, accepted?'yes':'no');}catch(e){}
    logConsent(accepted);
    el.classList.remove('show');
    setTimeout(function(){el.style.display='none';},400);
    if(accepted) loadClarity();
  };

  var saved;try{saved=localStorage.getItem(KEY);}catch(e){}
  if(saved==='yes'){ el.style.display='none'; loadClarity(); }
  else if(saved==='no'){ el.style.display='none'; }
  else { requestAnimationFrame(function(){ setTimeout(function(){el.classList.add('show');},600); }); }
})();

/* ── 6 · feed de testimonios publicados (testimonios.json → sección "Voces") ──
   El portal genera este JSON al publicar una reseña con consentimiento y pasada
   la ventana de 48 h (Reseñas → "Copiar feed JSON"). Si el archivo está vacío,
   la sección permanece oculta: nunca mostramos testimonios de relleno. */
(function(){
  var wrap=document.getElementById('voces'), grid=document.getElementById('vocesGrid');
  if(!wrap||!grid) return;
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function stars(n){n=Math.max(0,Math.min(5,n|0));var o='';for(var i=1;i<=5;i++){o+='<span'+(i<=n?' class="on"':'')+'>★</span>';}return o;}
  fetch('testimonios.json',{cache:'no-store'}).then(function(r){return r.ok?r.json():[];}).then(function(list){
    if(!Array.isArray(list)) list=[];
    list=list.filter(function(t){return t && String(t.quote||'').trim();});
    if(!list.length) return; // sin testimonios reales → sección oculta
    grid.innerHTML=list.map(function(t){
      var who=esc(t.business||t.author||'Cliente Don Ventas');
      var k=esc(t.sector||(t.business?t.author:'')||'');
      return '<figure class="tcard"><div class="stars">'+stars(t.rating)+'</div>'+
        '<blockquote>'+esc(t.quote)+'</blockquote>'+
        '<figcaption><span class="n">'+who+'</span>'+(k?'<span class="k">'+k+'</span>':'')+'</figcaption></figure>';
    }).join('');
    wrap.hidden=false;
    requestAnimationFrame(function(){wrap.classList.add('in');});
  }).catch(function(){});
})();
