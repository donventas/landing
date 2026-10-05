/* Each URL carries its own reading context. No cookies, storage or referrer. */
(function () {
  'use strict';
  function normalizeTerm(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  }
  function matchesTerm(query, title, aliases) {
    var tokens = normalizeTerm(query).split(' ').filter(Boolean);
    var haystack = normalizeTerm(title + ' ' + aliases);
    return tokens.every(function (token) { return haystack.includes(token); });
  }
  function orderTerms(items, mode) {
    return items.slice().sort(function (a,b) {
      return (mode === 'frequency' ? b.frequency-a.frequency : 0) || a.title.localeCompare(b.title, 'es');
    });
  }
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
  if (typeof module !== 'undefined' && module.exports) module.exports = { resolveReading: resolveReading, normalizeTerm: normalizeTerm, matchesTerm: matchesTerm, orderTerms: orderTerms };
  if (typeof document === 'undefined') return;
  var sources = Array.from(document.querySelectorAll('[data-reading-source]')).map(function (link) {
    return { key: link.dataset.readingSource, number: link.dataset.readingNumber,
      terms: (link.dataset.readingTerms || '').split(/\s+/), href: link.getAttribute('href'), title: link.textContent.trim() };
  });
  var reading = resolveReading(window.location.search, sources);
  if (reading) document.querySelectorAll('[data-reading-return]').forEach(function (link) {
    link.setAttribute('href', reading.href);
    link.setAttribute('aria-label', reading.description);
    link.textContent = reading.label;
  });
  var list = document.querySelector('.glossary-entries');
  var entries = Array.from(list.querySelectorAll('.glossary-entry'));
  var search = document.querySelector('#term-search');
  var sort = document.querySelector('#term-sort');
  var status = document.querySelector('#term-status');
  var empty = document.querySelector('#term-empty');
  document.querySelector('.glossary-tools').hidden = false;
  function filter() {
    var count = 0;
    entries.forEach(function (entry) {
      var visible = matchesTerm(search.value, entry.querySelector('h2').textContent, entry.dataset.aliases);
      entry.hidden = !visible;
      if (visible) count++;
    });
    status.textContent = count + (count === 1 ? ' término' : ' términos') + (search.value.trim() ? (count === 1 ? ' encontrado' : ' encontrados') : ' para consultar');
    empty.hidden = count !== 0;
  }
  function openHash() {
    var id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch (_) { return; }
    var entry = entries.find(function (item) { return item.id === id; });
    if (!entry) return;
    if (entry.hidden) { search.value = ''; filter(); }
    entry.querySelector('details').open = true;
    entry.scrollIntoView({block:'start', behavior:'instant'});
    entry.querySelector('summary').focus({preventScroll:true});
  }
  search.addEventListener('input', filter);
  document.querySelector('#term-clear').addEventListener('click', function () { search.value = ''; filter(); search.focus(); });
  sort.addEventListener('change', function () {
    orderTerms(entries.map(function (el) { return {el:el,title:el.querySelector('h2').textContent,frequency:Number(el.dataset.frequency)}; }), sort.value)
      .forEach(function (item) { list.appendChild(item.el); });
    filter();
  });
  window.addEventListener('hashchange', openHash);
  // Also reopen a manually closed term when the current hash is clicked again.
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (link && link.getAttribute('href') === window.location.hash) openHash();
  });
  filter();
  openHash();
}());
