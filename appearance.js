/* Appearance is a local preference, not a tracking or marketing identifier. */
(function () {
  'use strict';
  var root = document.documentElement, key = 'dv.appearance.v1';
  var valid = function (v) { return ['light', 'dark', 'system'].includes(v); };
  var query = new URLSearchParams(location.search).get('appearance'), stored;
  try { stored = localStorage.getItem(key); } catch (_) {}
  var pref = valid(query) ? query : valid(stored) ? stored : 'system';
  var media = matchMedia('(prefers-color-scheme: dark)');
  function render() {
    root.dataset.dvAppearance = pref === 'system' ? (media.matches ? 'dark' : 'light') : pref;
    root.dataset.dvPreference = pref;
    document.querySelectorAll('[data-dv-appearance-select]').forEach(function (select) { select.value = pref; select.disabled = false; });
  }
  render();
  media.addEventListener('change', render);
  addEventListener('storage', function (e) { if (e.key === key || e.key === null) { pref = valid(e.newValue) ? e.newValue : 'system'; render(); } });
  function initialize() {
    document.querySelectorAll('[data-dv-appearance-select]').forEach(function (select) {
      if (select.dataset.appearanceBound) return;
      select.dataset.appearanceBound = 'true';
      select.addEventListener('change', function () {
        pref = select.value;
        try { localStorage.setItem(key, pref); } catch (_) {}
        // Remove the review override so a refresh respects the chosen preference.
        var url = new URL(location.href); url.searchParams.delete('appearance'); history.replaceState(null, '', url);
        render();
      });
    });
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
}());

