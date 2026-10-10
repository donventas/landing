/* Shared gift experience, extended from the approved pilot; availability remains server-controlled. */
window.DVGiftPilot = function(host, section, gift) {
    section.classList.add('gift-discovery-pilot');
    section.querySelector('h2').textContent=gift.offerTitle || gift.title;
    var opener=section.querySelector('.comment-details>summary');opener.classList.add('gift-primary-action');opener.firstChild.textContent=(gift.cta || 'Quiero mi guía')+' ';
    var offer=document.createElement('div');offer.className='gift-offer';
    var preview=document.createElement('figure');preview.className='gift-preview';
    var image=document.createElement('img');image.src=gift.preview;image.width=612;image.height=792;image.loading='lazy';image.decoding='async';
    image.alt='Vista previa del recurso de una hoja: '+gift.title+'.';
    preview.append(image);
    var offerCopy=document.createElement('div');offerCopy.className='gift-offer-copy';
    var kicker=section.querySelector('.comment-kicker');kicker.textContent='Ahora te toca ponerlo en práctica';
    offerCopy.append(kicker,section.querySelector('h2'),section.querySelector('[data-gift-description]'));
    offer.append(preview,offerCopy);section.prepend(offer);
    var terms=document.createElement('p');terms.className='gift-offer-terms';terms.textContent='Responde tres preguntas. Descarga gratis, sin suscribirte.';
    section.querySelector('.comment-details').after(terms);
    var extra=document.createElement('details');extra.className='gift-extra-comment';
    extra.innerHTML='<summary>¿Quieres contarme algo más? <span>(opcional)</span></summary><div class="comment-field"><label for="gift-comment">Tu comentario o pregunta</label><textarea id="gift-comment" name="comment" rows="2" maxlength="900" aria-describedby="gift-comment-hint"></textarea><small id="gift-comment-hint">Te leo en privado. Hasta 900 caracteres; no incluyas información sensible.</small></div>';
    section.querySelector('.gift-contact').after(extra);
    var form=section.querySelector('form'), fields=Array.from(section.querySelectorAll('.gift-question'));
    var experience=section.querySelector('.gift-experience'), contact=section.querySelector('.gift-contact');
    var finalParts=[contact,extra,section.querySelector('.gift-privacy'),section.querySelector('.gift-subscribe'),section.querySelector('.gift-submit')];
    var step=0, progress=document.createElement('div'), review=document.createElement('div'), navigation=document.createElement('div');
    progress.className='gift-step-progress';progress.innerHTML='<p role="status" aria-live="polite"></p><progress max="4" value="1" aria-label="Avance del formulario"></progress>';
    review.className='gift-answer-review';review.setAttribute('aria-label','Tus respuestas anteriores');
    navigation.className='gift-step-navigation';navigation.innerHTML='<button type="button" data-gift-back>← Atrás</button><button type="button" data-gift-next>Continuar →</button>';
    form.prepend(progress,review);section.querySelector('.comment-status').before(navigation);
    var back=navigation.querySelector('[data-gift-back]'), next=navigation.querySelector('[data-gift-next]');
    form.noValidate=true; // Inline accessible feedback, never browser validation balloons.
    section.querySelector('.gift-form-intro>span').textContent='3 preguntas + tu contacto · PDF al terminar';
    contact.querySelector('legend').textContent='Último paso: recibe tu regalo';
    contact.querySelector('.comment-fine').textContent='Tu PDF se descarga aquí, al enviar. El correo no te suscribe.';
    function showStep(index,focus){
      step=index;experience.hidden=step===fields.length;
      fields.forEach(function(field,i){field.hidden=i!==step;});
      finalParts.forEach(function(part){part.hidden=step!==fields.length;});
      progress.querySelector('p').textContent=step<fields.length?'Pregunta '+(step+1)+' de '+fields.length:'Tus respuestas están listas. Solo falta tu contacto.';
      progress.querySelector('progress').value=step+1;
      back.hidden=step===0;next.hidden=step===fields.length;
      review.replaceChildren();
      fields.forEach(function(field,i){
        var answer=field.querySelector('textarea').value.trim();if(i>=step || !answer)return;
        var edit=document.createElement('button');edit.type='button';edit.className='gift-answer-edit';
        edit.setAttribute('aria-label','Editar respuesta '+(i+1)+': '+gift.questions[i]);
        var number=document.createElement('span');number.textContent='0'+(i+1);
        var excerpt=document.createElement('span');excerpt.className='gift-answer-excerpt';excerpt.textContent=answer;
        var action=document.createElement('span');action.textContent='Editar';edit.append(number,excerpt,action);
        edit.addEventListener('click',function(){showStep(i,true);});review.append(edit);
      });
      review.hidden=!review.childElementCount;
      if(focus)(step<fields.length?fields[step].querySelector('textarea'):form.elements.email).focus();
    }
    var inputs=fields.map(function(field){return field.querySelector('textarea');}).concat([form.elements.email,form.elements.name,form.elements.comment]);
    var errors=new Map();
    inputs.forEach(function(input){
      var error=document.createElement('p');error.id=input.id+'-error';error.className='gift-field-error';error.setAttribute('role','alert');error.hidden=true;
      input.after(error);errors.set(input,error);
      input.setAttribute('aria-describedby',((input.getAttribute('aria-describedby') || '')+' '+error.id).trim());
      input.addEventListener('input',function(){if(input.getAttribute('aria-invalid')==='true')validateField(input);});
    });
    function validateField(input){
      var message='';
      if(input.required && !input.value.trim())message=input.type==='email'?'Escribe tu correo, por ejemplo: nombre@empresa.com.':'Cuéntanos brevemente. Si no te ha pasado, puedes decirlo.';
      else if(input.type==='email' && input.validity.typeMismatch)message='Revisa tu correo. Debe verse así: nombre@empresa.com.';
      else if(input.maxLength>0 && input.value.length>input.maxLength)message='Usa hasta '+input.maxLength+' caracteres.';
      else if(!input.validity.valid)message='Revisa este dato para continuar.';
      var error=errors.get(input);if(error.textContent!==message)error.textContent=message;
      error.hidden=!message;if(message)input.setAttribute('aria-invalid','true');else input.removeAttribute('aria-invalid');
      return !message;
    }
    next.addEventListener('click',function(){var input=fields[step].querySelector('textarea');if(validateField(input))showStep(step+1,true);else input.focus();});
    back.addEventListener('click',function(){showStep(Math.max(0,step-1),true);});
    section.giftWizard={validate:function(){
      for(var i=0;i<fields.length;i++){var input=fields[i].querySelector('textarea');if(!validateField(input)){showStep(i,true);return false;}}
      showStep(fields.length,false);
      var invalid=null;inputs.slice(fields.length).forEach(function(input){if(!validateField(input) && !invalid)invalid=input;});
      if(invalid){if(invalid===form.elements.comment)extra.open=true;invalid.focus();return false;}return true;
    }};
    form.addEventListener('reset',function(){queueMicrotask(function(){inputs.forEach(function(input){input.removeAttribute('aria-invalid');var error=errors.get(input);error.hidden=true;error.textContent='';});extra.open=false;showStep(0,false);});});
    showStep(0,false);
    // Never conceal an independent message already opened or started while the API loaded.
    var activeComment=host.querySelector('details[open]') || Array.from(host.querySelectorAll('input,textarea')).some(function(el){return el.type==='checkbox'?el.checked:!!el.value;});
    if(!activeComment)host.hidden=true;
    if(location.hash==='#comenta-conmigo' && !activeComment){section.querySelector('details').open=true;showStep(fields.length,false);extra.open=true;requestAnimationFrame(function(){extra.querySelector('textarea').focus();});}
    function giftJump(event){
      if(event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return;
      // Keep native anchor navigation/back behavior; own the dynamically added link.
      event.stopPropagation();var index=document.querySelector('[data-section-index]');if(index)index.open=false;
      requestAnimationFrame(function(){var title=section.querySelector('h2');title.tabIndex=-1;title.focus({preventScroll:true});section.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});title.addEventListener('blur',function(){title.removeAttribute('tabindex');},{once:true});});
    }
    var introSlot=document.querySelector('[data-gift-intro-slot]');
    if(!introSlot){var heading=document.querySelector('.article-cover-copy,.manifesto-heading');if(heading){introSlot=document.createElement('div');introSlot.setAttribute('data-gift-intro-slot','');heading.append(introSlot);}}
    if(introSlot){
      var intro=document.createElement('aside');intro.className='gift-reading-note';intro.setAttribute('aria-label','Regalo de este artículo');
      intro.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6"/></svg><div><p class="gift-note-title">Que esto no se quede en lectura.</p><p>Al final te espera <strong data-gift-note-title></strong>: <span data-gift-note-description></span></p><p class="gift-note-conditions">Tres preguntas · descarga inmediata · sin suscripción obligatoria.</p><a href="#regalo-del-articulo">Ver el regalo <span aria-hidden="true">↓</span></a></div>';
      intro.querySelector('[data-gift-note-description]').textContent=gift.intro || gift.description;
      intro.querySelector('[data-gift-note-title]').textContent='«'+gift.title+'»';intro.querySelector('a').addEventListener('click',giftJump);introSlot.append(intro);
    }
    var indexNav=document.querySelector('[data-section-index] nav');
    if(indexNav){var indexLink=document.createElement('a');indexLink.className='gift-index-link';indexLink.href='#regalo-del-articulo';indexLink.textContent='Tu regalo · '+gift.title;indexLink.addEventListener('click',giftJump);indexNav.append(indexLink);}

};
