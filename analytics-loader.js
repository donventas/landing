/* Don Ventas — carga diferida de Vercel Web Analytics.
   Conserva la medición sin competir con el contenido de la primera vista. */
(function () {
  'use strict';

  var loaded = false;
  var interactions = ['pointerdown', 'keydown', 'touchstart'];

  window.va = window.va || function () {
    (window.vaq = window.vaq || []).push(arguments);
  };

  function cleanup() {
    interactions.forEach(function (eventName) {
      window.removeEventListener(eventName, loadAnalytics);
    });
  }

  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    cleanup();

    var script = document.createElement('script');
    script.src = '/_vercel/insights/script.js';
    script.async = true;
    script.dataset.sdkn = '@vercel/analytics';
    document.head.appendChild(script);
  }

  interactions.forEach(function (eventName) {
    window.addEventListener(eventName, loadAnalytics, { once: true, passive: true });
  });

  window.addEventListener('load', function () {
    window.setTimeout(function () {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(loadAnalytics, { timeout: 1500 });
      } else {
        loadAnalytics();
      }
    }, 6000);
  }, { once: true });
})();
