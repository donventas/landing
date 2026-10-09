/* Private article conversation. No form values in URLs, analytics or browser storage. */
(function () {
  'use strict';
  var host = document.querySelector('[data-article-comments]');
  if (!host) return;
  var articleId = host.getAttribute('data-article-comments');
  var articleTitle = document.querySelector('h1').textContent.trim();
  host.innerHTML = '<section class="private-comment" aria-labelledby="comment-title">' +
    '<h2 id="comment-title">¿Te pasó algo parecido o te quedó una pregunta?</h2>' +
    '<p class="comment-private">Te leo. Tu mensaje es privado y no se publicará en el blog.</p>' +
    '<details class="comment-details"><summary>Comentar con Arturo <span aria-hidden="true">＋</span></summary>' +
    '<div class="comment-content"><p class="comment-context">Sobre: <span data-comment-title></span></p>' +
    '<p class="comment-environment" role="status">Comprobando disponibilidad…</p>' +
    '<form class="comment-form" novalidate>' +
    '<div class="comment-field"><label for="comment-message">Tu mensaje <span>(obligatorio)</span></label>' +
    '<textarea id="comment-message" name="message" rows="5" maxlength="5000" required aria-describedby="comment-message-hint comment-message-error" placeholder="¿Qué te gustaría comentar?"></textarea>' +
    '<small id="comment-message-hint">Hasta 5,000 caracteres. No compartas contraseñas ni información sensible.</small>' +
    '<small id="comment-message-error" class="comment-error"></small></div>' +
    '<div class="comment-fields"><div class="comment-field"><label for="comment-email">Correo para responderte <span>(obligatorio)</span></label>' +
    '<input id="comment-email" name="email" type="email" autocomplete="email" maxlength="254" required aria-describedby="comment-email-error"><small id="comment-email-error" class="comment-error"></small></div>' +
    '<div class="comment-field"><label for="comment-name">Tu nombre <span>(opcional)</span></label>' +
    '<input id="comment-name" name="name" autocomplete="name" maxlength="100" aria-describedby="comment-name-error"><small id="comment-name-error" class="comment-error"></small></div></div>' +
    '<div class="comment-trap" aria-hidden="true"><label for="comment-website">Deja este campo vacío</label><input id="comment-website" name="website" tabindex="-1" autocomplete="off"></div>' +
    '<label class="comment-opt-in" for="comment-newsletter"><input id="comment-newsletter" name="newsletter" type="checkbox" aria-describedby="comment-opt-note"><span>Ideas para hacer más visible tu negocio.<strong>Recíbelas por correo.</strong></span></label>' +
    '<p id="comment-opt-note" class="comment-fine">Opcional · artículos y novedades de Don Ventas. Puedes darte de baja cuando quieras. Enviar un comentario no te suscribe.</p>' +
    '<p class="comment-fine">Usaremos tus datos para atender este mensaje. <a href="/15_LEGAL/Comentarios%20Privados.html">Consulta cómo los cuidamos</a>.</p>' +
    '<div class="comment-actions"><button class="btn solid" type="submit" disabled>Enviar mensaje privado</button><span>Sin cuenta. Sin descargar nada.</span></div>' +
    '<p class="comment-status" role="status" aria-live="polite" aria-atomic="true" tabindex="-1"></p>' +
    '</form></div></details></section>';
  host.querySelector('[data-comment-title]').textContent = articleTitle;
  var details = host.querySelector('details'), form = host.querySelector('form'), button = form.querySelector('button');
  var status = host.querySelector('.comment-status'), environment = host.querySelector('.comment-environment');
  var ready = false, busy = false, opened = false, fingerprint = '', key = '', dirty = false;
  function track(name, reason) { if (window.DVAnalytics) window.DVAnalytics.track(name, { reason: reason }); }
  function uuid() { return crypto.randomUUID(); }
  function fieldError(field, message) {
    var input = form.elements[field], el = document.getElementById('comment-' + field + '-error');
    if (!el) return; el.textContent = message; input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }
  function announce(message, error) { status.textContent = message; status.classList.toggle('is-error', !!error); status.focus({ preventScroll: true }); }
  details.addEventListener('toggle', function () {
    if (!details.open || opened) return; opened = true; track('article_message_opened');
    fetch('/api/article-message', { credentials: 'same-origin', cache: 'no-store' }).then(function (r) { if (!r.ok) throw Error(); return r.json(); }).then(function (data) {
      ready = data.enabled === true && ['simulation', 'test', 'live'].includes(data.mode); button.disabled = !ready;
      environment.textContent = !ready ? 'Este canal aún está en preparación. Puedes consultar el correo de contacto en nuestro aviso de privacidad.' : data.mode === 'simulation' ? 'Previo local · usa datos ficticios. No se enviarán correos ni se activarán suscripciones.' : data.mode === 'test' ? 'Prueba privada · solo admite el correo autorizado de Arturo. No uses datos de otras personas.' : 'Tu mensaje llegará de forma privada a Don Ventas.';
    }).catch(function () { environment.textContent = 'No pudimos comprobar la disponibilidad. Cierra y abre este bloque para reintentar.'; opened = false; });
  });
  form.addEventListener('input', function (e) { dirty = true; if (['message', 'email', 'name'].includes(e.target.name)) fieldError(e.target.name, ''); });
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  form.addEventListener('submit', async function (event) {
    event.preventDefault(); if (busy || !ready) return;
    ['message', 'email', 'name'].forEach(function (f) { fieldError(f, ''); });
    var payload = { article_id: articleId, message: form.elements.message.value.trim(), email: form.elements.email.value.trim(), name: form.elements.name.value.trim(), newsletter: form.elements.newsletter.checked, website: form.elements.website.value };
    var invalid;
    if (!payload.message || Array.from(payload.message).length > 5000) { fieldError('message', 'Escribe un mensaje de hasta 5,000 caracteres.'); invalid = 'message'; }
    if (!payload.email || !form.elements.email.validity.valid) { fieldError('email', 'Escribe un correo válido para responderte.'); invalid = invalid || 'email'; }
    if (Array.from(payload.name).length > 100) { fieldError('name', 'Usa hasta 100 caracteres.'); invalid = invalid || 'name'; }
    if (invalid) { form.elements[invalid].focus(); return; }
    var nextFingerprint = JSON.stringify(payload);
    if (nextFingerprint !== fingerprint) { fingerprint = nextFingerprint; key = uuid(); }
    payload.submission_key = key; busy = true; button.disabled = true; button.textContent = 'Guardando tu mensaje…'; form.setAttribute('aria-busy', 'true');
    // Freeze fields during submission so success cannot erase edits made in flight.
    Array.from(form.elements).forEach(function (el) { if (el !== button) el.disabled = true; });
    var controller = new AbortController(), timer = setTimeout(function () { controller.abort(); }, 12000);
    try {
      var response = await fetch('/api/article-message', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(payload), signal: controller.signal });
      var result = await response.json().catch(function () { return {}; });
      if (!response.ok || result.ok !== true) {
        var error = new Error('send_failed'); error.status = response.status; error.field = result.field; throw error;
      }
      form.reset(); dirty = false; fingerprint = ''; key = '';
      announce(result.mode === 'simulation' ? 'Prueba completada: guardamos tu mensaje solo en este entorno local. No se ha enviado ningún correo.' + (payload.newsletter ? ' Tu interés en suscribirte quedó como pendiente de confirmación; no hay una suscripción activa.' : '') : 'Recibimos tu mensaje. Gracias por compartirlo conmigo.' + (payload.newsletter ? ' Si tu correo aún no está confirmado, recibirás un enlace para confirmar la suscripción. Revisa también la carpeta de correo no deseado.' : ''), false);
      track('article_message_sent');
    } catch (error) {
      var reason = error.status === 429 ? 'rate_limited' : error.status === 422 ? 'validation' : 'unavailable';
      if (reason === 'validation' && ['message', 'email', 'name'].includes(error.field)) fieldError(error.field, 'Revisa este campo antes de reintentar.');
      announce(reason === 'rate_limited' ? 'Has enviado varios mensajes. Espera 15 minutos y vuelve a intentarlo. Lo que escribiste sigue aquí.' : 'No pudimos confirmar la recepción. Conservamos lo que escribiste: puedes reintentar sin duplicar el mensaje.', true);
      track('article_message_failed', reason);
    } finally {
      clearTimeout(timer); busy = false; form.removeAttribute('aria-busy');
      Array.from(form.elements).forEach(function (el) { el.disabled = false; }); button.disabled = !ready; button.textContent = 'Enviar mensaje privado';
    }
  });
})();
