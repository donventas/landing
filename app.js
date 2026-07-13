/* ════════════════════════════════════════════════════════════════════
   Don Ventas — landing (donventas.mx)
   Fuente editable. Cargado con `defer` desde index.html.
   Secciones:  1) reveal on-scroll   2) lightbox   3) waitlist (Supabase)
               4) mini-diagnóstico   5) banner de cookies + Clarity
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
  [].slice.call(document.querySelectorAll('.gal .shot')).forEach(function(sh){
    sh.addEventListener('click',function(){
      var img=sh.querySelector('img'); if(!img)return;
      var n=sh.querySelector('.meta .n'), k=sh.querySelector('.meta .k'), dd=sh.querySelector('.meta .d');
      var cap='<b>'+(n?n.textContent:'')+'</b>'+(k?' · '+k.textContent:'')+(dd?' — '+dd.textContent:'');
      openLbx(img.currentSrc||img.src,cap);
    });
  });
  lbx.addEventListener('click',function(e){ if(e.target===lbx||e.target.classList.contains('x'))closeLbx(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&lbx.classList.contains('open'))closeLbx(); });
})();

/* ── 3 · waitlist form → Supabase (tabla `lead`) ──────────────────── */
(function(){
  // Config Supabase — clave pública (RLS permite solo INSERT). OK en front.
  var SUPABASE_URL = 'https://hlabhmegjnrjygsywnqa.supabase.co';
  var SUPABASE_ANON = 'sb_publishable_Pk-_A1MghCXv9F5r9TvcxA_vkf08JYh';
  var TABLE = 'lead';
  var form = document.getElementById('wlForm');
  if(!form) return;
  var ok = document.getElementById('wlOk');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var btn = form.querySelector('button[type=submit]');
    var d = {
      nombre: form.nombre.value.trim(),
      correo: form.correo.value.trim(),
      negocio: form.negocio.value.trim(),
      whatsapp: form.whatsapp.value.trim(),
      reto: form.reto.value.trim(),
      paquete: (form.paquete && form.paquete.value) || '',
      consent: form.consent.checked,
      origen: (new URLSearchParams(location.search)).get('utm_source') || 'landing',
      fecha: new Date().toISOString()
    };
    if(!d.nombre || !d.correo || !d.negocio || !d.consent){ if(form.reportValidity)form.reportValidity(); return; }
    btn.disabled = true; btn.textContent = 'Enviando…';
    function done(){
      try{ var q = JSON.parse(localStorage.getItem('dv-waitlist')||'[]'); q.push(d); localStorage.setItem('dv-waitlist', JSON.stringify(q)); }catch(_){}
      form.style.display = 'none'; ok.style.display = 'block';
      try{ var n = JSON.parse(localStorage.getItem('dv-waitlist')||'[]').length; ok.querySelector('.pos').textContent = 'Eres el registro #' + n + ' de la lista.'; }catch(_){}
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

/* ── 4 · mini-diagnóstico (chips → sugerencia + prefill del form) ──── */
(function(){
  var pick = {};
  var diag = document.getElementById('diag'); if(!diag) return;
  [].slice.call(diag.querySelectorAll('.chip')).forEach(function(c){
    c.addEventListener('click', function(){
      var q = c.closest('.diag-q').getAttribute('data-q');
      pick[q] = c.getAttribute('data-v');
      [].slice.call(c.closest('.chips').querySelectorAll('.chip')).forEach(function(x){ x.classList.remove('on'); });
      c.classList.add('on');
      if(pick.etapa && pick.necesidad && pick.ventas) showRes();
    });
  });
  function showRes(){
    var map = {
      logo:{t:'Sistema de marca · Starter', d:'Empieza por el núcleo: logo, color y tipografía con criterio.'},
      web:{t:'Activación · Landing que vende', d:'Una web enfocada en convertir, montada sobre tu identidad.'},
      sistema:{t:'Sistema de marca · Growth / Pro', d:'El sistema utilizable de punta a punta, como los pilotos.'},
      contenido:{t:'Activación · Contenido + retainer', d:'Presencia y contenido que sostienen tu marca en el tiempo.'}
    };
    var r = map[pick.necesidad] || map.sistema;
    var pre = (pick.etapa === 'nueva') ? 'Fundación (estrategia + arquetipo) + ' : '';
    var label = pre + r.t;
    document.getElementById('diagResT').textContent = label;
    document.getElementById('diagResD').textContent = r.d;
    document.getElementById('diagRes').classList.add('on');
    var h = document.getElementById('wl-paquete'); if(h) h.value = label;
    var reto = document.getElementById('wl-reto');
    if(reto && !reto.value){ reto.value = 'Diagnóstico — etapa: '+pick.etapa+' · necesita: '+pick.necesidad+' · ventas: '+pick.ventas+'.'; }
  }
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
