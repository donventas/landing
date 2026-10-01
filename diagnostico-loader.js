/* Carga progresiva del diagnóstico: el formulario conserva su lugar y solo
   descarga la lógica cuando el visitante se aproxima o manifiesta intención. */
(function(){
  'use strict';
  var root=document.querySelector('[data-dv-diagnostic]');
  if(!root)return;
  var requested=false;
  function fallback(){
    if(root.dataset.dvDiagnosticReady)return;
    root.innerHTML='<div class="dv-diagnostic-fallback" role="alert"><h3>No pudimos abrir el diagnóstico.</h3><p>Escríbenos a <a href="mailto:hola@donventas.mx">hola@donventas.mx</a> y te ayudamos personalmente.</p></div>';
  }
  function load(){
    if(requested)return;
    requested=true;
    var script=document.createElement('script');
    script.src='diagnostico-v2.js?v=20261001-5';
    script.async=true;
    script.onerror=fallback;
    document.head.appendChild(script);
  }
  function isDiagnosticLink(target){
    var link=target&&target.closest?target.closest('a[href="#contacto"],a[href="#diagnostico"]'):null;
    if(link)load();
  }
  ['pointerenter','touchstart','focusin','click'].forEach(function(name){document.addEventListener(name,isDiagnosticLink,{passive:name!=='focusin'&&name!=='click',capture:true});});
  if('IntersectionObserver' in window){
    var observer=new IntersectionObserver(function(entries){
      if(entries.some(function(entry){return entry.isIntersecting;})){observer.disconnect();load();}
    },{rootMargin:'700px 0px',threshold:0.01});
    observer.observe(root);
  }else load();
})();
