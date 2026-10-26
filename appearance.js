/* Appearance is a local preference, not a tracking or marketing identifier. */
(function () {
  'use strict';
  var root = document.documentElement, key = 'dv.appearance.v1';
  var valid = function (v) { return ['light', 'dark', 'system'].includes(v); };
  var query = new URLSearchParams(location.search).get('appearance'), stored;
  try { stored = localStorage.getItem(key); } catch (_) {}
  var pref = valid(query) ? query : valid(stored) ? stored : 'system';
  var media = matchMedia('(prefers-color-scheme: dark)');
  var control, trigger, panel, choices;
  var names = { light: 'Claro', dark: 'Oscuro', system: 'Según tu dispositivo' };
  function render() {
    root.dataset.dvAppearance = pref === 'system' ? (media.matches ? 'dark' : 'light') : pref;
    root.dataset.dvPreference = pref;
    document.querySelectorAll('[data-dv-appearance-select]').forEach(function (select) { select.value = pref; select.disabled = false; });
    if (trigger) {
      trigger.setAttribute('aria-label', 'Cambiar apariencia. ' + names[pref]);
      trigger.title = 'Cambiar apariencia · ' + names[pref];
      control.dataset.effective = root.dataset.dvAppearance;
      choices.forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.appearanceChoice === pref)); });
    }
  }
  function choose(value) {
    if (!valid(value)) return;
    pref = value;
    try { localStorage.setItem(key, pref); } catch (_) {}
    // Keep article anchors and unrelated query parameters intact.
    var url = new URL(location.href); url.searchParams.delete('appearance'); history.replaceState(null, '', url);
    render();
  }
  function close(returnFocus) {
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (returnFocus) trigger.focus({ preventScroll: true });
  }
  function headerControl() {
    var host = document.querySelector('.editorial-nav .nav-actions, .editorial-nav .nav-cta, .nav .nav-cta');
    if (!host || host.querySelector('.dv-appearance-control')) return;
    control = document.createElement('div');
    control.className = 'dv-appearance-control';
    // Functional, editable SVGs; no external assets, icon font or network request.
    control.innerHTML = '<button class="dv-appearance-trigger" type="button" aria-label="Cambiar apariencia" aria-expanded="false" aria-controls="dv-appearance-panel">' +
      '<svg class="dv-appearance-sun" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>' +
      '<svg class="dv-appearance-moon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z"/></svg></button>' +
      '<div class="dv-appearance-panel" id="dv-appearance-panel" role="group" aria-label="Apariencia del sitio" hidden><p>Apariencia</p>' +
      Object.keys(names).map(function (value) { return '<button type="button" data-appearance-choice="' + value + '" aria-pressed="false"><span>' + names[value] + '</span><span class="dv-appearance-check" aria-hidden="true">✓</span></button>'; }).join('') + '</div>';
    host.insertBefore(control, host.firstChild);
    trigger = control.querySelector('.dv-appearance-trigger');
    panel = control.querySelector('.dv-appearance-panel');
    choices = Array.from(control.querySelectorAll('[data-appearance-choice]'));
    trigger.addEventListener('click', function () {
      if (!panel.hidden) { close(false); return; }
      document.querySelectorAll('.mobile-explore[open]').forEach(function (menu) { menu.open = false; });
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
    });
    choices.forEach(function (button) { button.addEventListener('click', function () { choose(button.dataset.appearanceChoice); close(true); }); });
    control.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); event.stopPropagation(); close(true); } });
    control.addEventListener('focusout', function (event) { if (!control.contains(event.relatedTarget)) close(false); });
    document.addEventListener('pointerdown', function (event) { if (!control.contains(event.target)) close(false); });
    document.querySelectorAll('.mobile-explore').forEach(function (menu) { menu.addEventListener('toggle', function () { if (menu.open) close(false); }); });
  }
  render();
  media.addEventListener('change', render);
  addEventListener('storage', function (e) { if (e.key === key || e.key === null) { pref = valid(e.newValue) ? e.newValue : 'system'; render(); } });
  function initialize() {
    headerControl();
    document.querySelectorAll('[data-dv-appearance-select]').forEach(function (select) {
      if (select.dataset.appearanceBound) return;
      select.dataset.appearanceBound = 'true';
      select.addEventListener('change', function () {
        choose(select.value);
      });
    });
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
}());

