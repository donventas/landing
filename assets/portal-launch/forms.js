(()=>{'use strict';
 const forms=[...document.querySelectorAll('[data-portal-form]')];
 const states=new Map(forms.map(form=>[form,{started:Date.now(),key:crypto.randomUUID(),signature:null,busy:false}]));
 const labels={waitlist:'Avísame del Portal',contact:'Conversemos'};
 const privacyDetails=document.getElementById('privacidad-formularios');
 function revealPrivacy(){if(location.hash==='#privacidad-formularios'&&privacyDetails)privacyDetails.open=true;}
 function revealContact(){const details=document.getElementById('consulta-encargo');if(location.hash==='#consulta-encargo'&&details)details.open=true;}
 document.querySelectorAll('a[href="#privacidad-formularios"]').forEach(link=>link.addEventListener('click',()=>{if(privacyDetails)privacyDetails.open=true;}));
 document.querySelectorAll('a[href="#consulta-encargo"]').forEach(link=>link.addEventListener('click',()=>{const details=document.getElementById('consulta-encargo');if(details)details.open=true;}));
 window.addEventListener('hashchange',revealPrivacy);window.addEventListener('hashchange',revealContact);revealPrivacy();revealContact();
 const notices=[...document.querySelectorAll('[data-form-environment]')];
 const unavailable=()=>notices.forEach(el=>{el.hidden=false;el.textContent='Este formulario no está disponible por ahora. Inténtalo más tarde.';});
 unavailable();
 // Google Translate is a separate origin: send readers to the official form,
 // rather than submit personal data through the translator or weaken API checks.
 if(location.hostname&&location.hostname.endsWith('.translate.goog')){
  const urls={waitlist:'https://www.donventas.mx/#lista',contact:'https://www.donventas.mx/#consulta-encargo'};
  forms.forEach(form=>{
   form.hidden=true;
   const notice=form.parentElement.querySelector('[data-form-environment]')||document.querySelector('[data-form-environment]');
   if(!notice)return;
   notice.hidden=false; notice.textContent='Para enviar tus datos de forma segura, abre el formulario en el sitio oficial. ';
   const link=document.createElement('a'); link.href=urls[form.dataset.portalForm]; link.rel='noopener noreferrer'; link.translate=false; const language=new URLSearchParams(location.search).get('_x_tr_tl'); const texts={en:'Open official form',fr:'Ouvrir le formulaire officiel',pt:'Abrir formulário oficial',de:'Offizielles Formular öffnen',it:'Apri il modulo ufficiale',bg:'Отвори официалния формуляр',ja:'公式フォームを開く','zh-CN':'打开官方表格',ar:'فتح النموذج الرسمي'}; link.textContent=(texts[language]||'Abrir formulario oficial')+' ↗';
   notice.appendChild(document.createElement('br')); notice.appendChild(link);
  });
  return;
 }
 const contact=document.getElementById('help-form');
 if(contact){
  const choices=[...contact.querySelectorAll('input[name="needs"]')],example=contact.querySelector('#help-example');
  const examples={claridad:'Por ejemplo: quiero que mis clientes entiendan mejor mis servicios.',web:'Por ejemplo: necesito una página para explicar mis servicios y recibir consultas.',propuesta:'Por ejemplo: quiero presentar una propuesta y no sé cómo organizarla.',marca:'Por ejemplo: mi negocio cambió y quiero actualizar su identidad.',materiales:'Por ejemplo: necesito llevar mi marca a empaques, letreros o documentos.',otro:'Cuéntanos qué está pasando o qué te gustaría conseguir.'};
  const update=()=>{const selected=choices.filter(c=>c.checked);choices[0].setCustomValidity(selected.length?'':'Elige al menos una opción.');example.textContent=selected.length===1?examples[selected[0].value]:'Por ejemplo: cuéntanos qué quieres lograr y qué has intentado hasta ahora.';};
  choices.forEach(c=>c.addEventListener('change',update));update();
  const more=contact.querySelector('[data-details-toggle]'),extra=contact.querySelector('[data-details-extra]');
  if(more&&extra){const expand=open=>{extra.hidden=!open;more.setAttribute('aria-expanded',String(open));};more.hidden=false;expand(false);more.addEventListener('click',()=>expand(extra.hidden));contact.addEventListener('invalid',e=>{if(extra.contains(e.target))expand(true);},true);}
  const steps=[...contact.querySelectorAll('[data-wizard-step]')],progress=contact.querySelector('[data-wizard-progress]');
  if(steps.length===2&&progress){
   let current=0;const titles=['Tu necesidad','Tus datos'];
   const show=(index,focus=false)=>{current=index;steps.forEach((step,i)=>{step.hidden=i!==index;});progress.textContent=`${String(index+1).padStart(2,'0')} / 02 · ${titles[index]}`;if(focus){const target=steps[index].querySelector('legend,h4');target?.focus();}};
   progress.hidden=false;contact.querySelectorAll('[data-wizard-actions],[data-wizard-back]').forEach(el=>{el.hidden=false;});
   contact.querySelectorAll('[data-wizard-next]').forEach((button,i)=>button.addEventListener('click',()=>{const invalid=[...steps[i].querySelectorAll('input,textarea,select')].find(field=>!field.checkValidity());if(invalid){invalid.reportValidity();return;}show(i+1,true);}));
   contact.querySelectorAll('[data-wizard-back]').forEach(button=>button.addEventListener('click',()=>show(Math.max(0,current-1),true)));
   show(0);
  }
 }
 fetch('/api/portal-intake',{cache:'no-store'}).then(r=>r.json()).then(config=>{
  if(config.enabled&&config.mode==='live')notices.forEach(el=>{el.hidden=true;});
  else if(config.enabled&&config.mode==='simulation')notices.forEach(el=>{el.hidden=false;el.textContent='Vista previa: los envíos se simulan. No se guardan datos ni se envían correos.';});
  if(config.mode==='test'){
   notices.forEach(el=>{el.hidden=false;el.textContent='Prueba real controlada: solo admite el correo autorizado. Se guardará la solicitud y podrá enviarse un correo de prueba.';});
   const privacy=document.querySelector('#privacidad-formularios p');if(privacy)privacy.textContent='Esta prueba real usa únicamente el correo autorizado por Arturo. El registro de ayuda y la lista del Portal se guardan por separado, con acceso restringido. La lista requiere confirmación y permite la baja sin afectar al blog. Los registros de esta prueba no se usarán para campañas. La conservación y automatización se revisarán antes de habilitar el formulario público.';
  }
 }).catch(unavailable);
 for(const form of forms){form.addEventListener('submit',async event=>{
  event.preventDefault();const state=states.get(form);if(state.busy)return;
  const result=form.querySelector('[data-form-result]'),button=form.querySelector('[type=submit]');
  if(!form.reportValidity())return;
  const formData=new FormData(form),values=Object.fromEntries(formData);
  const kind=form.dataset.portalForm;
  const needs=formData.getAll('needs');
  const signature=JSON.stringify({...values,needs});if(state.signature!==null&&signature!==state.signature)state.key=crypto.randomUUID();state.signature=signature;
  const payload={kind,email:values.email,name:values.name||'',message:values.message||'',interest:values.interest||'',needs,timing:values.timing||'',whatsapp:values.whatsapp||'',consent:values.consent==='on',website:values.website||'',started_at:state.started,submission_key:state.key};
  state.busy=true;button.disabled=true;button.textContent='Enviando…';result.hidden=false;result.textContent='Estamos procesando tu solicitud…';
  try{
   const response=await fetch('/api/portal-intake',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});
   const data=await response.json();
   if(!response.ok||data.ok!==true)throw new Error(response.status===429?'rate':response.status===422?'invalid':'unavailable');
   if(data.mode!=='simulation'&&window.DVAnalytics)window.DVAnalytics.track('portal_request_received',{form:kind});
   if(data.mode==='simulation')result.textContent='Prueba completada. No se guardaron datos ni se enviaron correos. No estás inscrito en la lista.';
   else if(data.status==='pending_confirmation')result.textContent='Solicitud recibida. Si falta confirmar tu correo, recibirás un enlace; revisa también la carpeta de spam. Repetir la solicitud no duplica tu registro.';
   else result.textContent='Recibimos tu solicitud para atenderla. Esto no es una suscripción a marketing.';
   result.focus();
  }catch(error){result.textContent=error.message==='rate'?'Has enviado varias solicitudes. Espera 15 minutos antes de intentarlo de nuevo. Conservamos lo escrito en esta página.':error.message==='invalid'?'Revisa los campos y vuelve a intentarlo en unos segundos. Lo escrito sigue aquí.':'No pudimos confirmar la recepción. Tu texto sigue aquí; puedes volver a intentarlo. No te hemos inscrito ni confirmado una entrega.';result.focus();}
  finally{state.busy=false;button.disabled=false;button.textContent=labels[kind];}
 });}
})();
