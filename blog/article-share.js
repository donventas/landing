/* Pilot only. Share public editorial text, never the current query, answers or contact. */
(function (root) {
  'use strict';
  var article = 'contenido-que-atrae-clientes';
  var canonical = 'https://www.donventas.mx/blog/' + article + '.html';
  function shareUrl(method, placement) {
    if (['whatsapp', 'copy'].indexOf(method) < 0 || ['article', 'gift'].indexOf(placement) < 0) return null;
    var url = new URL(canonical);
    url.searchParams.set('utm_source', method === 'whatsapp' ? 'whatsapp' : 'reader');
    url.searchParams.set('utm_medium', method === 'whatsapp' ? 'messaging' : 'referral');
    url.searchParams.set('utm_campaign', 'entender-antes-de-comunicar');
    url.searchParams.set('utm_content', placement + '-share');
    return url.href;
  }
  function message(placement) {
    return 'Te comparto esto porque puede servirte para el contenido de tu negocio. Incluye un checklist gratuito para revisar antes de publicar: ' + shareUrl('whatsapp', placement);
  }
  async function copyLink(clipboard, url, timeout) {
    var timer;
    try {
      if (!clipboard || !clipboard.writeText) throw Error('clipboard unavailable');
      await Promise.race([clipboard.writeText(url), new Promise(function(_,reject){timer=setTimeout(function(){reject(Error('clipboard timeout'));},timeout || 1500);})]);
    } finally { clearTimeout(timer); }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {shareUrl: shareUrl, message: message, copyLink:copyLink};
  if (!root.document) return;
  var doc = root.document, quiet = doc.querySelector('[data-article-share-pilot]');
  if (!quiet || root.location.pathname !== '/blog/' + article + '.html') return;
  function track(name, data) { if (root.DVAnalytics) root.DVAnalytics.track(name, data); }
  function actions(container, placement) {
    container.classList.add('article-share-actions');
    var whatsapp = doc.createElement('a');
    whatsapp.href = 'https://wa.me/?text=' + encodeURIComponent(message(placement));
    whatsapp.target = '_blank'; whatsapp.rel = 'noopener noreferrer';
    whatsapp.setAttribute('data-article-share', 'whatsapp');
    whatsapp.textContent = 'Compartir por WhatsApp';
    whatsapp.setAttribute('aria-label', 'Compartir por WhatsApp (abre otra pestaña)');
    whatsapp.addEventListener('click', function () { track('article_share_clicked', {method:'whatsapp', placement:placement}); });
    var copy = doc.createElement('button'); copy.type = 'button'; copy.textContent = 'Copiar enlace';
    var status = doc.createElement('p'); status.className = 'article-share-status'; status.setAttribute('role','status');
    var manual = doc.createElement('div'); manual.className = 'article-share-manual'; manual.hidden = true;
    var label = doc.createElement('label'); label.htmlFor = 'share-url-' + placement; label.textContent = 'Enlace para copiar';
    var input = doc.createElement('input'); input.id = label.htmlFor; input.readOnly = true; input.type = 'text';
    input.value = shareUrl('copy', placement); manual.append(label, input);
    copy.addEventListener('click', async function () {
      copy.disabled = true; status.textContent = 'Copiando enlace…';
      track('article_share_clicked', {method:'copy', placement:placement});
      try {
        await copyLink(root.navigator.clipboard, shareUrl('copy', placement));
        manual.hidden = true; status.textContent = 'Enlace copiado. Tú eliges a quién enviárselo.';
        track('article_share_copied', {method:'copy', placement:placement});
      } catch (_) {
        manual.hidden = false; status.textContent = 'No pudimos copiarlo automáticamente. Selecciona y copia este enlace.';
        input.focus(); input.select();
      } finally { copy.disabled = false; }
    });
    container.append(whatsapp, copy, status, manual);
  }
  actions(quiet.querySelector('[data-share-actions]'), 'article');
  doc.addEventListener('dv:gift-ready', function (event) {
    if (!event.detail || event.detail.article !== article) return;
    var delivery = doc.querySelector('#regalo-del-articulo .gift-delivery');
    if (!delivery || delivery.hidden) return;
    if (!delivery.querySelector('[data-gift-share]')) {
      var download = delivery.querySelector('[data-gift-download]');
      var row = doc.createElement('div'); row.className = 'gift-delivery-actions';
      download.before(row); row.append(download);
      var toggle = doc.createElement('button'); toggle.type = 'button'; toggle.className = 'gift-share-toggle';
      toggle.textContent = 'Compartir artículo'; toggle.setAttribute('data-gift-share','');
      toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-controls','gift-share-options');
      var options = doc.createElement('div'); options.id = 'gift-share-options';
      options.className = 'article-share article-share-after'; options.hidden = true;
      options.setAttribute('role','group'); options.setAttribute('aria-label','Opciones para compartir el artículo');
      actions(options,'gift'); row.append(toggle); row.after(options);
      toggle.addEventListener('click',function(){options.hidden=!options.hidden;toggle.setAttribute('aria-expanded',String(!options.hidden));});
      options.addEventListener('keydown',function(e){if(e.key==='Escape'){options.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.focus();}});
      download.addEventListener('click',function(){track('article_gift_download_clicked');});
    }
    if (event.detail.reason === 'receipt') track('article_gift_received');
  });
})(typeof window !== 'undefined' ? window : globalThis);
