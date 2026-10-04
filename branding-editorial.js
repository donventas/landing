/* Eventos acotados: sin grabación, respuestas, contacto ni parámetros de la URL. */
(function(){
  'use strict';
  var allowed=['diagnostic-nav','diagnostic-hero','prices-nav','case-arturo','case-tamanova','price-essential','price-complete','price-extended'];
  document.querySelectorAll('[data-brand-action]').forEach(function(link){
    link.addEventListener('click',function(){
      var action=link.getAttribute('data-brand-action');
      if(allowed.indexOf(action)>=0&&typeof window.va==='function')window.va('event',{name:'branding_action',data:{action:action}});
    });
  });
})();
