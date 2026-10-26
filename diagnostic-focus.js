/* Preview-only focus continuity. Does not change answers, steps or delivery. */
(function () {
  'use strict';
  var active, host, step, value, observer;
  document.addEventListener('focusin', function (event) {
    var field = event.target, shell = field.closest('.dv-form-shell,.dv-result');
    if (observer) observer.disconnect();
    active = null;
    if (!shell) return;
    active = field; host = shell.parentElement;
    step = shell.getAttribute('data-analytics-step');
    value = field.getAttribute('data-value');
    observer = new MutationObserver(function () {
      if (!active || active.isConnected || document.activeElement !== document.body) return;
      var current = host.querySelector('.dv-form-shell,.dv-result');
      if (!current) return;
      var target;
      if (value !== null && current.getAttribute('data-analytics-step') === step) {
        target = Array.from(current.querySelectorAll('.dv-option')).find(function (button) {
          return button.getAttribute('data-value') === value;
        });
      }
      target = target || current.querySelector('h3');
      if (!target) return;
      if (target.tagName === 'H3') target.setAttribute('tabindex', '-1');
      target.focus({preventScroll:true});
      target.scrollIntoView({block:'nearest',behavior:'instant'});
    });
    observer.observe(host, {childList:true, subtree:true});
  });
}());

