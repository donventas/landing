/* Don Ventas: optional, consent-first analytics. No form values or free text. */
(function (root) {
  'use strict';
  var ID = 'G-YD4BFZTY4V', CONTAINER = 'GTM-M6J49828';
  var KEY = 'dv-analytics-consent-v1', TTL = 180 * 86400000;
  var CAMPAIGN_KEY = 'dv-analytics-campaign-v1', CAMPAIGN_TTL = 30 * 60000;
  // A closed vocabulary, not a regex accepting arbitrary campaign/customer text.
  var campaignNames = ['tu-marca-es-tu-ventaja', 'entender-antes-de-comunicar', 'origen-don-ventas', 'diagnostico-contenido', 'diagnostico-marca'];
  var campaignChannels = { instagram: 'social', facebook: 'social', linkedin: 'social', newsletter: 'email', whatsapp: 'messaging' };
  var campaignPieces = ['bio', 'publicacion', 'historia', 'video', 'correo', 'enlace'];
  var pages = {
    '/': 'inicio', '/index.html': 'inicio', '/branding.html': 'marca',
    '/diagnostico.html': 'diagnostico', '/blog/': 'ideas', '/blog/index.html': 'ideas',
    '/blog/por-que-nacio-don-ventas.html': 'fundacional',
    '/blog/contenido-que-atrae-clientes.html': 'entender',
    '/blog/tu-marca-es-tu-ventaja.html': 'ventaja', '/blog/glosario.html': 'glosario'
  };
  var terms = 'contenido-de-marca campana marca marketing promesa-de-marca branding experiencia-de-usuario pagina-de-destino conversion copy identidad-visual posicionamiento propuesta-de-valor seo'.split(' ');
  var steps = 'outcome salesProblem consistencyProblem searchProblem otherProblem nextAction attempted proof businessAudience timing budgetBand desired clarityProblem systemProblem launchProblem repositionProblem brandOtherProblem applications users autonomy difference contact'.split(' ');
  // Reading order (includes the hero); independent of the decorative folio numbering.
  var landingSections = [
    { key: 'hero', heading: 'hero-title' }, { key: 'problema', heading: 'friction-title' },
    { key: 'metodo', heading: 'method-title' }, { key: 'servicios', heading: 'services-title' },
    { key: 'casos', heading: 'proof-title' }, { key: 'ideas', heading: 'ideas-title' },
    { key: 'quien', heading: 'founder-title' }, { key: 'preguntas', heading: 'faq-title' },
    { key: 'contacto', heading: 'contact-title' }
  ];
  function landingOrder(key) { return landingSections.findIndex(function (item) { return item.key === key; }) + 1; }
  function member(value, list) { return list.indexOf(value) >= 0 ? value : null; }
  function page(path) { return Object.prototype.hasOwnProperty.call(pages, path) ? pages[path] : null; }
  function validCampaign(value) {
    if (!value || !Object.prototype.hasOwnProperty.call(campaignChannels, value.source) ||
        campaignChannels[value.source] !== value.medium || !member(value.name, campaignNames) || !member(value.content, campaignPieces)) return null;
    return { source: value.source, medium: value.medium, name: value.name, content: value.content };
  }
  function campaignFrom(search, session, now, external) {
    var params = new URLSearchParams(search), keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
    // An invalid/new external entry must not inherit an earlier campaign.
    if (Array.from(params.keys()).some(function (key) { return /^utm_|^(gclid|dclid|gbraid|wbraid)$/.test(key); })) {
      if (keys.some(function (key) { return params.getAll(key).length !== 1; }) ||
          Array.from(params.keys()).some(function (key) { return /^(gclid|dclid|gbraid|wbraid)$/.test(key); })) return null;
      return validCampaign({ source: params.get('utm_source'), medium: params.get('utm_medium'), name: params.get('utm_campaign'), content: params.get('utm_content') });
    }
    if (external) return null;
    try {
      var saved = JSON.parse(session.getItem(CAMPAIGN_KEY));
      return saved && saved.version === 1 && typeof saved.at === 'number' && saved.at <= now && now - saved.at < CAMPAIGN_TTL ? validCampaign(saved.campaign) : null;
    } catch (_) { return null; }
  }
  function cleanEvent(name, data) {
    data = data || {};
    var output = {}, route = member(data.route, ['contenido', 'branding']);
    if (['diagnostic_viewed', 'diagnostic_started', 'diagnostic_step_viewed', 'diagnostic_step_completed', 'diagnostic_submit_attempted', 'diagnostic_completed', 'diagnostic_submit_failed', 'diagnostic_validation_error'].indexOf(name) >= 0) {
      if (!route) return null;
      output.route = route;
      if (name === 'diagnostic_step_completed' || name === 'diagnostic_step_viewed') {
        if (!member(data.step, steps)) return null;
        output.step = data.step;
      }
      if (name === 'diagnostic_validation_error') output.step = 'contact';
      // Intentionally omit recommendation, budget, answers, API messages and IDs.
    } else if (['glossary_lookup', 'glossary_open'].indexOf(name) >= 0) {
      if (!member(data.term, terms)) return null;
      output.term = data.term;
    } else if (['content_selected', 'reading_return', 'service_selected', 'diagnostic_entry'].indexOf(name) >= 0) {
      if (!member(data.destination, Object.keys(pages).map(function (p) { return pages[p]; }).concat(['servicios']))) return null;
      output.destination = data.destination;
    } else if (name === 'section_viewed') {
      if (!member(data.section, ['hero', 'problema', 'metodo', 'servicios', 'casos', 'ideas', 'quien', 'inversion', 'preguntas', 'contacto'])) return null;
      output.section = data.section;
    } else if (name === 'reading_progress') {
      if (!member(data.percent, [25, 50, 75, 90])) return null;
      output.percent = data.percent;
    } else if (name === 'visible_time') {
      if (!member(data.seconds, [10, 30, 60, 120])) return null;
      output.seconds = data.seconds;
    } else if (name !== 'whatsapp_click' && name !== 'page_view') return null;
    if (['content_selected', 'service_selected', 'diagnostic_entry', 'whatsapp_click'].indexOf(name) >= 0 &&
        member(data.origin_section, landingSections.map(function (item) { return item.key; }).concat(['header', 'footer', 'other']))) {
      output.origin_section = data.origin_section;
    }
    return output;
  }
  function readChoice(storage, now) {
    try {
      var value = JSON.parse(storage.getItem(KEY));
      return value && value.version === 1 && ['accepted', 'rejected'].indexOf(value.choice) >= 0 &&
        typeof value.at === 'number' && value.at <= now && now - value.at < TTL ? value.choice : null;
    } catch (_) { return null; }
  }
  var api = { cleanEvent: cleanEvent, readChoice: readChoice, page: page, key: KEY, campaignFrom: campaignFrom, campaignKey: CAMPAIGN_KEY, landingSections: landingSections };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (!root.document || root.DVAnalytics) return;
  var doc = root.document, storage, session;
  try { storage = root.localStorage; } catch (_) { storage = null; }
  try { session = root.sessionStorage; } catch (_) { session = null; }
  var choice = readChoice(storage, Date.now()), started = false, seen = {}, recent = {};
  var source = page(root.location.pathname), production = root.location.hostname === 'www.donventas.mx' && root.location.protocol === 'https:';
  var preview = !production, records = [], status, panel, prefs, previousFocus;
  var campaign = null, campaignAt = 0, journeyTimer = null, visibleMs = 0, lastTick = 0;
  var sectionSince = {}, lastStep = '', stepSince = 0;
  function command() { root.dataLayer.push(arguments); }
  function clearCampaign() { campaign = null; try { session.removeItem(CAMPAIGN_KEY); } catch (_) {} }
  function campaignFields() {
    return { campaign_id: '', campaign_term: '', campaign_name: campaign ? campaign.name : '',
      campaign_source: campaign ? campaign.source : '', campaign_medium: campaign ? campaign.medium : '', campaign_content: campaign ? campaign.content : '' };
  }
  function stopCookies() {
    if (journeyTimer !== null) root.clearInterval(journeyTimer);
    journeyTimer = null; visibleMs = 0; sectionSince = {}; lastStep = ''; clearCampaign();
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
    if (source === 'inicio') {
      if (name === 'section_viewed') {
        if (!landingOrder(clean.section)) return false;
        clean.section_order = landingOrder(clean.section);
      }
      if (clean.origin_section && landingOrder(clean.origin_section)) clean.origin_order = landingOrder(clean.origin_section);
    } else delete clean.origin_section;
    var token = name + JSON.stringify(clean), now = Date.now();
    if (recent[token] && now - recent[token] < 1000) return false;
    if (name !== 'diagnostic_submit_failed' && name !== 'diagnostic_submit_attempted' &&
        ['page_view', 'diagnostic_viewed', 'diagnostic_started', 'diagnostic_step_viewed', 'diagnostic_step_completed', 'diagnostic_completed', 'diagnostic_validation_error', 'section_viewed', 'reading_progress', 'visible_time'].indexOf(name) >= 0 && seen[token]) return false;
    recent[token] = now; seen[token] = true;
    if (campaign && now - campaignAt >= CAMPAIGN_TTL) {
      clearCampaign();
      if (!preview) command('set', campaignFields());
    }
    if (campaign) {
      campaignAt = now;
      try { session.setItem(CAMPAIGN_KEY, JSON.stringify({ version: 1, at: now, campaign: campaign })); } catch (_) {}
      // Explicit dimensions keep this bounded last-tagged-entry model distinct from GA attribution models.
      clean.entry_source = campaign.source; clean.entry_medium = campaign.medium;
      clean.entry_campaign = campaign.name; clean.entry_content = campaign.content;
    }
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
  function inView(el) {
    if (!el) return false;
    var box = el.getBoundingClientRect();
    var height = Math.max(0, Math.min(box.bottom, root.innerHeight) - Math.max(box.top, 0));
    var width = Math.max(0, Math.min(box.right, root.innerWidth) - Math.max(box.left, 0));
    return box.width > 0 && box.height > 0 && height >= Math.min(box.height, root.innerHeight) * 0.5 && width >= Math.min(box.width, root.innerWidth) * 0.5;
  }
  function startJourney() {
    if (journeyTimer !== null || !root.setInterval) return;
    lastTick = Date.now();
    var selectors = {
      hero: 'main h1', problema: '#friccion h2, #problema h2', metodo: '#metodo h2',
      servicios: '#servicios h2, #sistema h2', casos: '#trabajo h2, #casos h2',
      inversion: '#inversion h2', preguntas: '#preguntas h2', contacto: '#contacto h2, #diagnostico h2'
    };
    if (source === 'inicio') {
      selectors = {};
      landingSections.forEach(function (item) { selectors[item.key] = '#' + item.heading; });
    }
    journeyTimer = root.setInterval(function () {
      var now = Date.now(), delta = now - lastTick; lastTick = now;
      if (choice !== 'accepted' || doc.visibilityState !== 'visible') { sectionSince = {}; lastStep = ''; return; }
      // Do not count sleep, background time or long event-loop stalls as attention.
      if (delta > 0 && delta <= 2500) visibleMs += delta;
      [10, 30, 60, 120].forEach(function (seconds) { if (visibleMs >= seconds * 1000) track('visible_time', { seconds: seconds }); });
      Object.keys(selectors).forEach(function (section) {
        if (inView(doc.querySelector(selectors[section]))) {
          if (!sectionSince[section]) sectionSince[section] = now;
          if (now - sectionSince[section] >= 1000) track('section_viewed', { section: section });
        } else delete sectionSince[section];
      });
      var form = doc.querySelector('.dv-form-shell[data-analytics-step]');
      if (form && inView(form.querySelector('.dv-step h3'))) {
        var route = form.getAttribute('data-route-name'), step = form.getAttribute('data-analytics-step'), key = route + ':' + step;
        if (key !== lastStep) { lastStep = key; stepSince = now; }
        if (now - stepSince >= 1000) {
          track('diagnostic_viewed', { route: route });
          track('diagnostic_step_viewed', { route: route, step: step });
        }
      } else lastStep = '';
      // Scrolling is exposure, not proof of reading. Emit only the current band, not skipped bands.
      var article = doc.querySelector('article.article-copy, article.manifesto-story');
      if (article && visibleMs >= 5000) {
        var box = article.getBoundingClientRect();
        if (box.height > 0 && box.top < root.innerHeight && box.bottom > 0) {
          var progress = Math.min(100, Math.max(0, (root.innerHeight - box.top) / box.height * 100));
          var bands = [90, 75, 50, 25], band = bands.find(function (n) { return progress >= n; });
          if (band) track('reading_progress', { percent: band });
        }
      }
    }, 1000);
  }
  function start() {
    if (choice !== 'accepted' || !source) return;
    if (started) { startJourney(); return; }
    started = true;
    var external = false;
    try { external = !!doc.referrer && new URL(doc.referrer).origin !== root.location.origin; } catch (_) { external = true; }
    campaign = campaignFrom(root.location.search || '', session, Date.now(), external);
    campaignAt = Date.now();
    if (!campaign) clearCampaign();
    if (!preview) {
      root['ga-disable-' + ID] = false;
      root.dataLayer = root.dataLayer || [];
      command('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      command('set', { page_location: canonical(), page_title: 'Don Ventas | ' + source, page_referrer: '',
        allow_google_signals: false, allow_ad_personalization_signals: false,
        cookie_expires: 5184000, cookie_update: false });
      command('set', campaignFields());
      command('consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      root.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      var script = doc.createElement('script');
      script.async = true; script.src = 'https://www.googletagmanager.com/gtm.js?id=' + CONTAINER;
      script.referrerPolicy = 'origin';
      doc.head.appendChild(script);
    }
    track('page_view');
    startJourney();
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
      function clickTrack(name, data) {
        data = data || {};
        if (source === 'inicio') {
          var section = link.closest && link.closest('main > section');
          var heading = section && section.getAttribute('aria-labelledby');
          var item = landingSections.find(function (entry) { return entry.heading === heading; });
          data.origin_section = item ? item.key : link.closest && link.closest('header, nav') ? 'header' : link.closest && link.closest('footer') ? 'footer' : 'other';
        }
        track(name, data);
      }
      if (url.protocol === 'https:' && ['wa.me', 'api.whatsapp.com'].indexOf(url.hostname) >= 0) { clickTrack('whatsapp_click'); return; }
      if (url.origin !== root.location.origin) return;
      var target = page(url.pathname);
      if (link.hasAttribute('data-reading-return') && target && target !== 'glosario') { track('reading_return', { destination: target }); return; }
      if (target === 'glosario' && url.hash) { track('glossary_lookup', { term: url.hash.slice(1) }); return; }
      if (target === 'diagnostico' || (['inicio', 'marca'].indexOf(target) >= 0 && ['#contacto', '#diagnostico'].indexOf(url.hash) >= 0)) { clickTrack('diagnostic_entry', { destination: 'diagnostico' }); return; }
      if (target === 'marca' || (target === 'inicio' && url.hash === '#servicios')) { clickTrack('service_selected', { destination: target === 'marca' ? 'marca' : 'servicios' }); return; }
      if (target && target !== source) clickTrack('content_selected', { destination: target });
    });
    doc.addEventListener('toggle', function (event) {
      var entry = event.target.closest && event.target.closest('.glossary-entry');
      if (entry && event.target.open) track('glossary_open', { term: entry.id });
    }, true);
    root.addEventListener('storage', function (event) {
      if (event.key === KEY && readChoice(storage, Date.now()) !== 'accepted') { choice = 'rejected'; stopCookies(); if (started && !preview) root.location.reload(); }
    });
    doc.addEventListener('visibilitychange', function () { lastTick = Date.now(); sectionSince = {}; lastStep = ''; });
    if (choice !== 'accepted') stopCookies();
    start();
  }
  root.DVAnalytics = { track: track, preview: preview, records: records };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})(typeof window !== 'undefined' ? window : this);
