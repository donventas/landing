/* Don Ventas: optional, consent-first analytics. No form values or free text. */
(function (root) {
  'use strict';
  var ID = 'G-YD4BFZTY4V', CONTAINER = 'GTM-M6J49828';
  var KEY = 'dv-analytics-consent-v1', TTL = 180 * 86400000;
  var pages = {
    '/': 'inicio', '/index.html': 'inicio', '/branding.html': 'marca',
    '/diagnostico.html': 'diagnostico', '/blog/': 'ideas', '/blog/index.html': 'ideas',
    '/blog/por-que-nacio-don-ventas.html': 'fundacional',
    '/blog/contenido-que-atrae-clientes.html': 'entender',
    '/blog/tu-marca-es-tu-ventaja.html': 'ventaja', '/blog/glosario.html': 'glosario'
  };
  var terms = 'contenido-de-marca campana marca marketing promesa-de-marca branding experiencia-de-usuario pagina-de-destino conversion copy identidad-visual posicionamiento propuesta-de-valor seo'.split(' ');
  var steps = 'outcome salesProblem consistencyProblem searchProblem otherProblem nextAction attempted proof businessAudience timing budgetBand desired clarityProblem systemProblem launchProblem repositionProblem brandOtherProblem applications users autonomy difference contact'.split(' ');
  function member(value, list) { return list.indexOf(value) >= 0 ? value : null; }
  function page(path) { return Object.prototype.hasOwnProperty.call(pages, path) ? pages[path] : null; }
  function cleanEvent(name, data) {
    data = data || {};
    var output = {}, route = member(data.route, ['contenido', 'branding']);
    if (['diagnostic_started', 'diagnostic_step_completed', 'diagnostic_completed', 'diagnostic_submit_failed'].indexOf(name) >= 0) {
      if (!route) return null;
      output.route = route;
      if (name === 'diagnostic_step_completed') {
        if (!member(data.step, steps)) return null;
        output.step = data.step;
      }
      // Intentionally omit recommendation, budget, answers, API messages and IDs.
    } else if (['glossary_lookup', 'glossary_open'].indexOf(name) >= 0) {
      if (!member(data.term, terms)) return null;
      output.term = data.term;
    } else if (['content_selected', 'reading_return', 'service_selected', 'diagnostic_entry'].indexOf(name) >= 0) {
      if (!member(data.destination, Object.keys(pages).map(function (p) { return pages[p]; }).concat(['servicios']))) return null;
      output.destination = data.destination;
    } else if (name !== 'whatsapp_click' && name !== 'page_view') return null;
    return output;
  }
  function readChoice(storage, now) {
    try {
      var value = JSON.parse(storage.getItem(KEY));
      return value && value.version === 1 && ['accepted', 'rejected'].indexOf(value.choice) >= 0 &&
        typeof value.at === 'number' && value.at <= now && now - value.at < TTL ? value.choice : null;
    } catch (_) { return null; }
  }
  var api = { cleanEvent: cleanEvent, readChoice: readChoice, page: page, key: KEY };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (!root.document || root.DVAnalytics) return;
  var doc = root.document, storage;
  try { storage = root.localStorage; } catch (_) { storage = null; }
  var choice = readChoice(storage, Date.now()), started = false, seen = {}, recent = {};
  var source = page(root.location.pathname), production = root.location.hostname === 'www.donventas.mx' && root.location.protocol === 'https:';
  var preview = !production, records = [], status, panel, prefs, previousFocus;
  function command() { root.dataLayer.push(arguments); }
  function stopCookies() {
    root['ga-disable-' + ID] = true;
    ['_ga', '_ga_YD4BFZTY4V'].forEach(function (key) {
      ['', '; Domain=' + root.location.hostname, '; Domain=.donventas.mx'].forEach(function (domain) {
        doc.cookie = key + '=; Max-Age=0; Path=/; SameSite=Lax' + domain;
      });
    });
  }
  function canonical() {
    var path = root.location.pathname === '/index.html' ? '/' : root.location.pathname === '/blog/index.html' ? '/blog/' : root.location.pathname;
    return 'https://www.donventas.mx' + path;
  }
  function track(name, data) {
    if (choice !== 'accepted' || !source) return false;
    var clean = cleanEvent(name, data);
    if (!clean) return false;
    var token = name + JSON.stringify(clean), now = Date.now();
    if (recent[token] && now - recent[token] < 1000) return false;
    if (['page_view', 'diagnostic_started', 'diagnostic_step_completed', 'diagnostic_completed'].indexOf(name) >= 0 && seen[token]) return false;
    recent[token] = now; seen[token] = true;
    clean.content_id = source;
    clean.page_location = canonical();
    clean.page_title = 'Don Ventas | ' + source;
    clean.page_referrer = ''; // Never copy a referrer path or query into Google.
    clean.send_to = ID;
    if (preview) {
      records.push({ event: name, parameters: clean });
      if (records.length > 30) records.shift();
      if (status) status.textContent = 'Vista previa · sin envío a Google. Último evento: ' + name;
      doc.dispatchEvent(new root.CustomEvent('dv:analytics-preview', { detail: { event: name, parameters: clean } }));
    } else command('event', name, clean);
    return true;
  }
  function start() {
    if (started || choice !== 'accepted' || !source) return;
    started = true;
    if (!preview) {
      root['ga-disable-' + ID] = false;
      root.dataLayer = root.dataLayer || [];
      command('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      command('set', { page_location: canonical(), page_title: 'Don Ventas | ' + source, page_referrer: '',
        allow_google_signals: false, allow_ad_personalization_signals: false,
        cookie_expires: 5184000, cookie_update: false,
        campaign_id: '', campaign_name: '', campaign_source: '', campaign_medium: '', campaign_term: '', campaign_content: '' });
      command('consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      root.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      var script = doc.createElement('script');
      script.async = true; script.src = 'https://www.googletagmanager.com/gtm.js?id=' + CONTAINER;
      script.referrerPolicy = 'origin';
      doc.head.appendChild(script);
    }
    track('page_view');
  }
  function choose(value) {
    var wasActive = started && !preview;
    choice = value;
    var stored = false;
    try { storage.setItem(KEY, JSON.stringify({ version: 1, choice: value, at: Date.now() })); stored = true; } catch (_) {}
    panel.hidden = true;
    if (previousFocus && previousFocus.isConnected) previousFocus.focus();
    else prefs.focus();
    if (value === 'accepted') start();
    else {
      stopCookies(); records.length = 0;
      // Stop loaded Google listeners with a fresh document; do not erase lead answers.
      if (wasActive && stored) root.location.reload();
    }
    status.textContent = (preview ? 'Vista previa · sin envío a Google. ' : '') +
      (value === 'accepted' ? 'Analítica opcional aceptada.' : 'Analítica opcional rechazada.') +
      (!stored ? ' Tu navegador no permite guardar esta preferencia.' : '');
  }
  function init() {
    var css = doc.createElement('link'); css.rel = 'stylesheet'; css.href = '/analytics.css'; doc.head.appendChild(css);
    var wrap = doc.createElement('div'); wrap.className = 'dv-analytics';
    wrap.innerHTML = '<section class="dv-analytics-panel" aria-labelledby="dv-analytics-title" role="region" hidden>' +
      '<h2 id="dv-analytics-title">Tú eliges qué medir</h2><p>¿Nos permites usar Google Analytics para saber qué contenido resulta útil? Es opcional: puedes leer y solicitar tu diagnóstico sin aceptarlo. No enviamos tus respuestas ni datos de contacto.</p>' +
      '<a href="/15_LEGAL/Politica%20de%20Cookies.html">Cómo usamos la analítica</a>' +
      '<div class="dv-analytics-actions"><button type="button" data-analytics-choice="rejected">Rechazar</button><button type="button" data-analytics-choice="accepted">Aceptar analítica</button></div></section>' +
      '<div class="dv-analytics-footer"><button type="button" data-analytics-settings>Preferencias de analítica</button><span role="status" aria-live="polite"></span></div>';
    doc.body.appendChild(wrap);
    panel = wrap.querySelector('.dv-analytics-panel'); prefs = wrap.querySelector('[data-analytics-settings]'); status = wrap.querySelector('[role="status"]');
    panel.hidden = !!choice;
    if (preview) status.textContent = 'Vista previa · no se envían datos a Google.';
    prefs.onclick = function () { previousFocus = doc.activeElement; panel.hidden = false; panel.querySelector('button').focus(); };
    wrap.querySelectorAll('[data-analytics-choice]').forEach(function (button) { button.onclick = function () { choose(button.getAttribute('data-analytics-choice')); }; });
    doc.addEventListener('click', function (event) {
      var link = event.target.closest && event.target.closest('a[href]');
      if (!link) return;
      var url; try { url = new URL(link.href, root.location.href); } catch (_) { return; }
      if (url.protocol === 'https:' && ['wa.me', 'api.whatsapp.com'].indexOf(url.hostname) >= 0) { track('whatsapp_click'); return; }
      if (url.origin !== root.location.origin) return;
      var target = page(url.pathname);
      if (link.hasAttribute('data-reading-return') && target && target !== 'glosario') { track('reading_return', { destination: target }); return; }
      if (target === 'glosario' && url.hash) { track('glossary_lookup', { term: url.hash.slice(1) }); return; }
      if (target === 'diagnostico' || (target === 'inicio' && ['#contacto', '#diagnostico'].indexOf(url.hash) >= 0)) { track('diagnostic_entry', { destination: 'diagnostico' }); return; }
      if (target === 'marca' || (target === 'inicio' && url.hash === '#servicios')) { track('service_selected', { destination: target === 'marca' ? 'marca' : 'servicios' }); return; }
      if (target && target !== source) track('content_selected', { destination: target });
    });
    doc.addEventListener('toggle', function (event) {
      var entry = event.target.closest && event.target.closest('.glossary-entry');
      if (entry && event.target.open) track('glossary_open', { term: entry.id });
    }, true);
    root.addEventListener('storage', function (event) {
      if (event.key === KEY && readChoice(storage, Date.now()) !== 'accepted') { choice = 'rejected'; stopCookies(); if (started && !preview) root.location.reload(); }
    });
    if (choice !== 'accepted') stopCookies();
    start();
  }
  root.DVAnalytics = { track: track, preview: preview, records: records };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})(typeof window !== 'undefined' ? window : this);
