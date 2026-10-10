/* Bounded research + immediate resource. No answers/email in URLs, storage or analytics. */
(async function () {
  'use strict';
  var host = document.querySelector('[data-article-comments]');
  if (!host) return;
  var article = host.dataset.articleComments, data, availability;
  try {
    var responses = await Promise.all([fetch('/blog/article-gifts.json', {cache:'no-store'}), fetch('/api/article-message', {cache:'no-store', credentials:'same-origin'})]);
    if (responses.some(function(r){return !r.ok;})) return;
    data = await responses[0].json(); availability = await responses[1].json();
  } catch (_) { return; } // The independent comment channel remains available.
  var gift = data.articles[article];
  if (!gift || !availability.enabled || !Array.isArray(availability.gift_articles) || !availability.gift_articles.includes(article)) return;
  var section = document.createElement('section'); section.className = 'private-comment article-gift'; section.id = 'regalo-del-articulo';
  section.setAttribute('aria-labelledby','gift-title');
  section.innerHTML = '<span class="comment-kicker">Del artículo a la práctica · recurso gratuito</span><h2 id="gift-title"></h2><p data-gift-description></p>' +
    '<details class="comment-details"><summary>Responder y obtener mi regalo <span aria-hidden="true">＋</span></summary><div class="comment-content">' +
    '<div class="gift-form-intro"><span>3 preguntas · PDF al terminar</span><p><strong>Tu experiencia puede ayudar a alguien más.</strong></p><p data-response-invitation></p></div>' +
    '<p class="comment-environment"></p><form class="gift-form"><fieldset class="gift-experience"><legend>Cuéntanos tu experiencia</legend><div data-gift-questions></div></fieldset>' +
    '<fieldset class="gift-contact"><legend>Tu contacto</legend><p class="comment-fine">Solo para aclarar tu experiencia si hace falta. No te suscribe.</p><div class="comment-fields"><div class="comment-field"><label for="gift-email">Correo electrónico</label><input id="gift-email" name="email" type="email" autocomplete="email" maxlength="254" required></div><div class="comment-field"><label for="gift-name">Nombre <span>(opcional)</span></label><input id="gift-name" name="name" autocomplete="name" maxlength="100"></div></div></fieldset>' +
    '<div class="comment-trap" aria-hidden="true"><label for="gift-website">Deja vacío</label><input id="gift-website" name="website" tabindex="-1" autocomplete="off"></div>' +
    '<p class="comment-fine gift-privacy">Tus respuestas nos ayudan a crear recursos útiles. No incluyas datos sensibles ni de terceros. <a href="/15_LEGAL/Comentarios%20Privados.html#encuestas">Privacidad</a>.</p>' +
    '<div class="gift-subscribe"><label class="gift-subscribe-label" for="gift-newsletter"><input id="gift-newsletter" type="checkbox" name="newsletter" aria-describedby="gift-newsletter-promise gift-newsletter-details gift-newsletter-confirmation"><span><span class="gift-optional">SIGAMOS EN CONTACTO · OPCIONAL</span><strong data-newsletter-label></strong><span id="gift-newsletter-promise"></span></span></label><p id="gift-newsletter-details"></p><p id="gift-newsletter-confirmation"></p></div>' +
    '<div class="comment-actions gift-submit"><button class="btn solid" type="submit">Enviar y obtener mi PDF</button><span>Descarga inmediata.<br> Con o sin suscripción.</span></div>' +
    '<p class="comment-status" role="status" aria-live="polite" tabindex="-1"></p><button class="gift-refresh" type="button" hidden>Actualizar invitación</button></form></div></details>' +
    '<div class="gift-delivery" hidden tabindex="-1"><h3>Tu regalo está listo.</h3><p>Descárgalo ahora y guarda tu copia. No necesitas iniciar sesión.</p><a class="btn solid" data-gift-download download>Descargar PDF</a>' +
    '<p class="comment-fine">Úsalo como referencia o marca sus casillas, si las tiene. Los cambios que guardes en el PDF no se envían a Don Ventas.</p><button type="button" class="gift-remember">Recordar este regalo en este navegador</button><p class="comment-fine" data-gift-remember-note></p></div>';
  section.querySelector('h2').textContent = gift.title;
  section.querySelector('[data-gift-description]').textContent = gift.description;
  section.querySelector('[data-response-invitation]').textContent = gift.responseInvitation || 'Cuéntanos qué te pasó, con un ejemplo si puedes. Así podemos crear artículos y recursos más útiles para ti y para quienes leen este blog.';
  function consentCopy(){
    section.querySelector('[data-newsletter-label]').textContent = data.newsletter.label;
    section.querySelector('#gift-newsletter-promise').textContent = data.newsletter.promise;
    section.querySelector('#gift-newsletter-details').textContent = data.newsletter.details;
    section.querySelector('#gift-newsletter-confirmation').textContent = data.newsletter.confirmation;
  }
  consentCopy();
  section.querySelector('.comment-environment').textContent = availability.mode === 'simulation' ? 'Prueba local · usa datos ficticios. No enviamos correos ni activamos suscripciones.' : availability.mode === 'test' ? 'Prueba privada · solo admite el correo autorizado de Arturo.' : 'Respuestas privadas · no se publican en el blog.';
  gift.questions.forEach(function(q,i){
    var field = document.createElement('div'); field.className='comment-field gift-question';
    var label=document.createElement('label'); label.htmlFor='gift-answer-'+i;
    var number=document.createElement('span');number.className='gift-question-number';number.textContent='0'+(i+1);number.setAttribute('aria-hidden','true');
    var question=document.createElement('span');question.className='gift-question-text';question.textContent=q;label.append(number,question);
    var input=document.createElement('textarea'); input.id=label.htmlFor; input.name='answer'+i; input.rows=2; input.maxLength=900; input.required=true;
    field.append(label,input); section.querySelector('[data-gift-questions]').append(field);
  });
  host.before(section);
  if(host.dataset.giftDiscovery && gift.preview && window.DVGiftPilot) window.DVGiftPilot(host,section,gift);
  // One primary next step: gift. The commercial option stays available, collapsed.
  var ending=host.closest('.article-ending'), diagnosis=ending && ending.querySelector('[data-next-step="diagnosis"]');
  if(diagnosis && section.giftWizard){
    var existingLink=diagnosis.querySelector('a[href]');
    if(existingLink){var subtle=document.createElement('aside');subtle.className='gift-service-link';subtle.setAttribute('aria-labelledby','gift-service-title');subtle.innerHTML='<div><h3 id="gift-service-title">¿Quieres ayuda para aplicarlo a tu negocio?</h3><p>Revisemos qué necesita tu marca y por dónde empezar.</p></div>';var serviceLink=existingLink.cloneNode(false);serviceLink.className='';serviceLink.textContent='Solicitar diagnóstico →';subtle.append(serviceLink);section.after(subtle);diagnosis.hidden=true;}
  }else if(diagnosis){var commercial=document.createElement('details');commercial.className='gift-commercial';var summary=document.createElement('summary');summary.textContent='¿Prefieres trabajar esto con Don Ventas?';commercial.append(summary);diagnosis.before(commercial);commercial.append(diagnosis);section.before(commercial);commercial.before(section);}
  var form=section.querySelector('form'), button=form.querySelector('button[type=submit]'), status=section.querySelector('.comment-status'), delivery=section.querySelector('.gift-delivery');
  var busy=false, dirty=false, fingerprint='', key='', storageKey='dv-gift:'+gift.id;
  var link=section.querySelector('[data-gift-download]'); link.href=gift.file;
  var refresh=section.querySelector('.gift-refresh');
  refresh.addEventListener('click',async function(){
    if(busy)return;busy=true;refresh.disabled=true;
    try{
      var updated=await fetch('/blog/article-gifts.json',{cache:'no-store'});if(!updated.ok)throw Error();
      var nextData=await updated.json(),nextGift=nextData.articles[article];
      if(!nextGift || nextGift.id!==gift.id || JSON.stringify(nextGift.questions)!==JSON.stringify(gift.questions)){
        status.textContent='También cambiaron las preguntas. Copia tus respuestas antes de recargar esta página para revisar la nueva versión.';return;
      }
      data=nextData;gift=nextGift;consentCopy();link.href=gift.file;
      section.querySelector('[data-gift-description]').textContent=gift.description;
      form.elements.newsletter.checked=false;fingerprint='';key='';refresh.hidden=true;
      status.classList.remove('is-error');status.textContent='Invitación actualizada. Conservamos tus respuestas y desmarcamos la suscripción para que decidas de nuevo. Ya puedes enviar.';
      form.elements.newsletter.focus();
    }catch(_){status.textContent='No pudimos actualizar. Tus respuestas siguen aquí. Vuelve a intentar actualizar la invitación.';}
    finally{busy=false;refresh.disabled=false;}
  });
  function reveal(focus){delivery.hidden=false;section.querySelector('details').open=false;section.querySelector('summary').firstChild.textContent='Volver a compartir mi experiencia ';if(focus)delivery.focus({preventScroll:true});document.dispatchEvent(new CustomEvent('dv:gift-ready',{detail:{article:article,reason:focus?'receipt':'remembered'}}));}
  try {var remembered=localStorage.getItem(storageKey);if(remembered===gift.file || (Array.isArray(gift.previousFiles) && gift.previousFiles.includes(remembered)))reveal(false);}catch(_){}
  section.querySelector('.gift-remember').addEventListener('click',function(){
    var note=section.querySelector('[data-gift-remember-note]');
    try{localStorage.setItem(storageKey,gift.file);note.textContent='Listo. Al volver desde este navegador verás la descarga sin responder otra vez. Solo guardamos el identificador del recurso, no tu correo ni tus respuestas.';}
    catch(_){note.textContent='Este navegador no permite recordarlo. Descarga el PDF o guarda su enlace para abrirlo sin volver a responder.';}
  });
  form.addEventListener('input',function(){dirty=true;});
  window.addEventListener('beforeunload',function(e){if(dirty){e.preventDefault();e.returnValue='';}});
  form.addEventListener('submit',async function(e){
    e.preventDefault();if(busy || (section.giftWizard ? !section.giftWizard.validate() : !form.reportValidity()))return;
    var answers=gift.questions.map(function(_,i){return form.elements['answer'+i].value.trim();});
    var missing=answers.findIndex(function(a){return !a;});if(missing!==-1){form.elements['answer'+missing].focus();return;}
    var payload={article_id:article,email:form.elements.email.value.trim(),name:form.elements.name.value.trim(),newsletter:form.elements.newsletter.checked,website:form.elements.website.value,survey:{version:data.version,answers:answers}};
    if(form.elements.comment)payload.survey.comment=form.elements.comment.value.trim();
    var next=JSON.stringify(payload);if(next!==fingerprint){fingerprint=next;key=crypto.randomUUID();}payload.submission_key=key;
    busy=true;form.setAttribute('aria-busy','true');Array.from(form.elements).forEach(function(el){el.disabled=true;});button.textContent='Guardando respuestas…';
    var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},12000);
    try{
      var response=await fetch('/api/article-message',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(payload),signal:controller.signal});
      var result=await response.json();
      if(!response.ok || result.ok!==true || !result.gift || result.gift.id!==gift.id || result.gift.url!==gift.file){var err=new Error();err.status=response.status;err.code=result.code;throw err;}
      dirty=false;form.reset();fingerprint='';key='';
      delivery.querySelector('h3').textContent='Gracias por compartir tu experiencia. Tu PDF está listo.';
      reveal(true);
    }catch(err){refresh.hidden=err.code!=='survey_updated';status.textContent=err.code==='survey_updated'?'Actualizamos el formulario. Usa «Actualizar invitación» para revisarlo sin perder tus respuestas.':err.status===429?'Espera 15 minutos antes de reintentar. Tus respuestas siguen aquí.':'No pudimos confirmar el envío. Tus respuestas siguen aquí; reintenta sin duplicarlas.';status.classList.add('is-error');status.focus({preventScroll:true});}
    finally{clearTimeout(timer);busy=false;form.removeAttribute('aria-busy');Array.from(form.elements).forEach(function(el){el.disabled=false;});button.textContent='Enviar y obtener mi PDF';}
  });
})();
