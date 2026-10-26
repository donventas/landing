/* On-demand public-page translation. No widget, remote script, storage or telemetry. */
(function () {
  'use strict';
  function initialize() {
    var details = document.getElementById('idioma');
    if (!details || details.dataset.languageBound) return;
    details.dataset.languageBound = 'true';
    var summary = details.querySelector('summary');
    var select = details.querySelector('[data-dv-language-target]');
    var link = details.querySelector('[data-dv-language-url]');
    var closeButton = details.querySelector('.dv-language-close');
    var panel = details.querySelector('.dv-language-panel');
    var trigger, dialog, returnTarget = summary;
    var appearance = document.querySelector('.dv-appearance-control');
    if (appearance && typeof HTMLDialogElement !== 'undefined') {
      trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'dv-language-trigger';
      trigger.setAttribute('aria-label','Cambiar idioma / Change language');
      trigger.setAttribute('aria-haspopup','dialog');
      trigger.setAttribute('aria-controls','dv-language-dialog');
      trigger.setAttribute('aria-expanded','false');
      trigger.title = 'Idioma / Language';
      summary.setAttribute('aria-haspopup','dialog');
      summary.setAttribute('aria-controls','dv-language-dialog');
      trigger.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg><span translate="no">ES</span>';
      appearance.parentNode.insertBefore(trigger,appearance);
      dialog = document.createElement('dialog');
      dialog.id = 'dv-language-dialog';
      dialog.className = 'dv-language-dialog';
      dialog.setAttribute('aria-label','Elige tu idioma / Choose your language');
      dialog.appendChild(panel);
      document.body.appendChild(dialog);
      trigger.addEventListener('click',function(){ open(trigger); });
      summary.addEventListener('click',function(event){ event.preventDefault(); open(summary); });
      dialog.addEventListener('cancel',function(event){ event.preventDefault(); close(true); });
      dialog.addEventListener('keydown',function(event){
        if(event.key !== 'Tab') return;
        var first = select || closeButton;
        if(event.shiftKey && document.activeElement === first) { event.preventDefault(); closeButton.focus(); }
        else if(!event.shiftKey && document.activeElement === closeButton) { event.preventDefault(); first.focus(); }
      });
      dialog.addEventListener('click',function(event){ if(event.target === dialog) close(true); });
      dialog.addEventListener('close',function(){ trigger.setAttribute('aria-expanded','false'); });
      addEventListener('resize',function(){ if (dialog.open) positionDialog(); });
    }
    function positionDialog() {
      var rect = trigger.getBoundingClientRect();
      dialog.style.setProperty('--language-top',Math.max(12,rect.bottom + 12)+'px');
      dialog.style.setProperty('--language-left',Math.max(12,Math.min(rect.left,innerWidth - 372))+'px');
    }
    // Google owns its translated-page toolbar. Do not overlay, hide or simulate it.
    function close(focus) {
      details.open = false;
      if (dialog && dialog.open) dialog.close();
      if (trigger) trigger.setAttribute('aria-expanded','false');
      if (focus) returnTarget.focus({preventScroll:true});
    }
    function open(source) {
      document.querySelectorAll('.mobile-explore[open]').forEach(function (menu) { menu.open = false; });
      if (dialog) {
        returnTarget = source || trigger;
        positionDialog();
        if (!dialog.open) dialog.showModal();
        trigger.setAttribute('aria-expanded','true');
        (select || closeButton).focus({preventScroll:true});
        return;
      }
      details.open = true;
      summary.focus({preventScroll:true});
      details.scrollIntoView({behavior:'instant',block:'start'});
    }
    function openFromAnchor() { if (location.hash === '#idioma') open(); }
    closeButton.hidden = false;
    closeButton.addEventListener('click', function () { close(true); });
    if (select && link) {
      var clean;
      try {
        clean = new URL(link.dataset.dvLanguageUrl);
        if (clean.origin !== 'https://www.donventas.mx' || clean.username || clean.password || clean.pathname === '/suscripcion.html') throw Error();
        clean.search = ''; clean.hash = '';
        select.disabled = false;
        select.addEventListener('change', function () {
          if (!['en','fr','pt','de','it','bg','ja','zh-CN','ar'].includes(select.value)) return;
          var destination = new URL('https://translate.google.com/website');
          destination.searchParams.set('sl','es'); destination.searchParams.set('tl',select.value);
          destination.searchParams.set('u',clean.href);
          link.href = destination.href;
        });
      } catch (_) { link.removeAttribute('href'); link.textContent = 'Usa Traducir en tu navegador / Use your browser’s Translate option'; }
    }
    document.querySelectorAll('[data-dv-language-open]').forEach(function (entry) {
      entry.addEventListener('click', function (event) {
        event.preventDefault();
        open();
      });
    });
    details.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && details.open) { event.preventDefault(); event.stopPropagation(); close(true); }
    });
    details.addEventListener('focusout', function (event) { if (!dialog && !details.contains(event.relatedTarget)) close(false); });
    document.addEventListener('pointerdown', function (event) { if (!dialog && !details.contains(event.target) && !event.target.closest('[data-dv-language-open]')) close(false); });
    document.querySelectorAll('.mobile-explore').forEach(function (menu) { menu.addEventListener('toggle', function () { if (menu.open) close(false); }); });
    document.querySelectorAll('.dv-appearance-trigger').forEach(function (button) { button.addEventListener('click', function () { close(false); }); });
    // Protect existing brand-only marks; never mark paragraphs or whole pages untranslated.
    document.querySelectorAll('.wordmark,.brand-wordmark').forEach(function (mark) { mark.setAttribute('translate','no'); mark.classList.add('notranslate'); });
    // Direct preview and shared anchors must reveal the control, not just its closed summary.
    openFromAnchor();
    if (document.readyState !== 'complete') addEventListener('load',openFromAnchor,{once:true});
    addEventListener('hashchange',openFromAnchor);
  }
  if (document.readyState !== 'complete') {
    document.addEventListener('DOMContentLoaded', initialize, {once:true});
    addEventListener('load',initialize,{once:true});
  }
  else initialize();
}());
