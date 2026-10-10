/* No analytics, external resources, storage or automatic GET-side effects. */
(function () {
  'use strict';
  // A second email link may reuse this tab. Reinitialize for its new fragment;
  // loading the page still never confirms or unsubscribes without a click.
  window.addEventListener('hashchange', function () {
    if (/^#(confirm|unsubscribe)=([a-f0-9]{64})$/.test(location.hash)) location.reload();
  });
  var match = /^#(confirm|unsubscribe)=([a-f0-9]{64})$/.exec(location.hash);
  // Fragments never reach the server; remove the token from the visible URL/history.
  history.replaceState(null, '', location.pathname);
  if (!match) return;
  var action=match[1],token=match[2],button=document.getElementById('subscription-action'),status=document.getElementById('subscription-status');
  document.getElementById('subscription-description').textContent=action==='confirm' ? 'Confirma que quieres recibir artículos y novedades de Don Ventas. Puedes darte de baja cuando quieras.' : 'Puedes cancelar tu solicitud o dejar de recibir novedades. No necesitas iniciar sesión.';
  button.hidden=false;button.textContent=action==='confirm'?'Confirmar mi suscripción':'Darme de baja';
  button.addEventListener('click',async function(){
    button.disabled=true;status.textContent='Guardando tu decisión…';
    var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},12000);
    try{
      var response=await fetch('/api/article-subscription',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({action:action,token:token}),signal:controller.signal});
      var body=await response.json();
      if(response.status===410){status.textContent='Este enlace ya no está disponible. Puedes escribir a arturo.villagomez@donventas.mx para recibir ayuda.';button.hidden=true;return;}
      if(!response.ok || body.ok!==true)throw Error();
      status.textContent=action==='confirm'?'Listo. Confirmaste tu suscripción a Don Ventas.':'Listo. Registramos tu baja. No recibirás novedades de esta suscripción.';
      token='';button.hidden=true;
    }catch{status.textContent='No pudimos confirmar el cambio. Puedes reintentar; hacerlo de nuevo no duplica tu solicitud.';button.disabled=false;}
    finally{clearTimeout(timer);status.focus({preventScroll:true});}
  });
})();
