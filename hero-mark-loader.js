/* Don Ventas — carga progresiva del render 3D.
   El SVG canónico permanece visible y el render pesado se reserva para después
   de la primera vista, salvo que la persona interactúe antes con la escena. */
(function () {
  'use strict';

  var stage = document.querySelector('.b10-motion-stage');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var status = stage && stage.querySelector('[data-b10-motion-status]');
  var loaded = false;
  var timer = 0;

  if (!stage) return;
  if (reduce) {
    if (status) status.textContent = 'Vista estática · movimiento reducido';
    return;
  }

  function cleanup() {
    window.clearTimeout(timer);
    stage.removeEventListener('pointerenter', loadViewer);
    stage.removeEventListener('touchstart', loadViewer);
    stage.removeEventListener('focusin', loadViewer);
  }

  function loadViewer() {
    if (loaded) return;
    loaded = true;
    cleanup();
    if (status) status.textContent = 'Preparando entrada 3D';
    var script = document.createElement('script');
    script.src = 'hero-mark-3d.js?v=20261001-5';
    script.async = true;
    script.onerror = function () {
      if (status) status.textContent = 'Vista estática · SVG canónico';
    };
    document.head.appendChild(script);
  }

  stage.addEventListener('pointerenter', loadViewer, { once: true, passive: true });
  stage.addEventListener('touchstart', loadViewer, { once: true, passive: true });
  stage.addEventListener('focusin', loadViewer, { once: true });

  window.addEventListener('load', function () {
    timer = window.setTimeout(function () {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(loadViewer, { timeout: 1500 });
      } else {
        loadViewer();
      }
    }, 7000);
  }, { once: true });
})();
