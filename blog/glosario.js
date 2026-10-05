/* Each URL carries its own reading context. No cookies, storage or referrer. */
(function () {
  'use strict';
  function resolveReading(search, sources) {
    var params = new URLSearchParams(search);
    if (params.getAll('from').length !== 1 || params.getAll('at').length !== 1) return null;
    var from = params.get('from'), at = params.get('at');
    if (!/^[a-z0-9-]+$/.test(from) || !/^[a-z0-9-]+$/.test(at)) return null;
    var source = sources.find(function (item) { return item.key === from; });
    if (!source || !source.terms.includes(at) || !/^\/blog\/[a-z0-9-]+\.html$/.test(source.href)) return null;
    return { href: source.href + '#termino-' + at, label: '← Volver al artículo ' + source.number,
      description: 'Volver a «' + source.title + '» y continuar donde consultaste el término' };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { resolveReading: resolveReading };
  if (typeof document === 'undefined') return;
  var sources = Array.from(document.querySelectorAll('[data-reading-source]')).map(function (link) {
    return { key: link.dataset.readingSource, number: link.dataset.readingNumber,
      terms: (link.dataset.readingTerms || '').split(/\s+/), href: link.getAttribute('href'), title: link.textContent.trim() };
  });
  var reading = resolveReading(window.location.search, sources);
  if (!reading) return;
  document.querySelectorAll('[data-reading-return]').forEach(function (link) {
    link.setAttribute('href', reading.href);
    link.setAttribute('aria-label', reading.description);
    link.textContent = reading.label;
  });
}());
