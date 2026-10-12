(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const projects = $$('.project');
  const thumbs = $$('.project-thumb');
  const filters = $$('[data-filter]');
  const viewport = $('#project-viewport');
  let active = 0;
  let selectedFilter = 'Todos';
  let visibleIndices = projects.map((_, i) => i);
  function showProject(index, announce = true) {
    active = index;
    projects.forEach((project, i) => { project.hidden = i !== index; });
    thumbs.forEach((thumb, i) => {
      thumb.hidden = !visibleIndices.includes(i);
      thumb.setAttribute('aria-pressed', String(i === index));
    });
    const position = visibleIndices.indexOf(index) + 1;
    $('#gallery-count').textContent = `${String(position).padStart(2, '0')} / ${String(visibleIndices.length).padStart(2, '0')}`;
    $('#project-prev').disabled = $('#project-next').disabled = visibleIndices.length < 2;
    if (announce) $('#gallery-status').textContent = `${projects[index].dataset.name}. Proyecto ${position} de ${visibleIndices.length}. Filtro: ${selectedFilter}.`;
  }
  function move(direction) {
    const index = (visibleIndices.indexOf(active) + direction + visibleIndices.length) % visibleIndices.length;
    showProject(visibleIndices[index]);
  }
  filters.forEach(button => button.addEventListener('click', () => {
    selectedFilter = button.dataset.filter;
    visibleIndices = projects.flatMap((project, i) => selectedFilter === 'Todos' || project.dataset.categories.split(',').includes(selectedFilter) ? [i] : []);
    filters.forEach(f => f.setAttribute('aria-pressed', String(f === button)));
    showProject(visibleIndices.includes(active) ? active : visibleIndices[0]);
  }));
  thumbs.forEach((button, i) => button.addEventListener('click', () => showProject(i)));
  $('#project-prev').addEventListener('click', () => move(-1));
  $('#project-next').addEventListener('click', () => move(1));
  viewport.tabIndex = 0;
  viewport.setAttribute('aria-roledescription', 'carrusel');
  viewport.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') showProject(visibleIndices[0]);
    else if (event.key === 'End') showProject(visibleIndices.at(-1));
    else move(event.key === 'ArrowRight' ? 1 : -1);
  });
  let touchStart;
  viewport.addEventListener('pointerdown', event => {
    touchStart = event.pointerType === 'touch' ? {x:event.clientX,y:event.clientY} : null;
  });
  viewport.addEventListener('pointercancel', () => { touchStart = null; });
  viewport.addEventListener('pointerup', event => {
    if (!touchStart) return;
    const dx = event.clientX - touchStart.x, dy = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
  });
  $$('.js-control').forEach(el => { el.hidden = false; });
  document.documentElement.classList.add('enhanced');
  showProject(0, false);

  const dialog = $('#quote-dialog'), form = $('#quote-form');
  const fieldsets = $$('fieldset[data-step]', form);
  const titles = ['¿Qué necesitas?', '¿Cómo va tu diseño?', '¿Cómo prefieres conversar?'];
  const fields = ['service','design','contact'];
  let step = 0, reference = '', lastTrigger;
  const selected = name => $(`input[name="${name}"]:checked`, form)?.value || '';
  const choose = (name, value) => {
    if (!value) return;
    const radio = $$(`input[name="${name}"]`, form).find(input => input.value === value);
    if (radio) radio.checked = true;
  };
  function buildMessage() {
    const lines = ['Hola, me gustaría cotizar un proyecto con Creactiva y Don Ventas.', '', `Necesito: ${selected('service') || 'Por definir'}.`, `Mi diseño: ${selected('design') || 'Por definir'}.`, `Prefiero: ${selected('contact') || 'Por definir'}.`];
    if (reference) lines.push(`Referencia del portafolio: ${reference}.`);
    const notes = $('#project-notes').value.trim();
    if (notes) lines.push('', `Detalles: ${notes}`);
    return lines.join('\n');
  }
  function updateMessage() {
    const message = buildMessage();
    $('#message-preview').textContent = message;
    $('#quote-send').href = `https://wa.me/${document.body.dataset.whatsapp}?text=${encodeURIComponent(message)}`;
    $('#quote-send').setAttribute('aria-disabled', String(!selected('contact')));
  }
  function renderStep(focus = true) {
    fieldsets.forEach((fieldset, i) => { fieldset.hidden = i !== step; });
    $('#quote-title').textContent = titles[step];
    $('#quote-step').textContent = `Paso ${step + 1} de 3`;
    $('#quote-back').hidden = step === 0;
    $('#quote-next').hidden = step === 2;
    $('#quote-send').hidden = step !== 2;
    $('#quote-error').textContent = '';
    $('#quote-reference').hidden = !reference;
    $('#quote-reference-text').textContent = `Referencia: ${reference}`;
    updateMessage();
    if (focus) $('#quote-title').focus();
    $('.quote-body').scrollTop = 0;
  }
  function valid() {
    if (selected(fields[step])) return true;
    $('#quote-error').textContent = 'Elige una opción para continuar.';
    $(`input[name="${fields[step]}"]`, form).focus();
    return false;
  }
  if (typeof dialog.showModal === 'function') {
    $$('.quote-trigger').forEach(link => link.addEventListener('click', event => {
      event.preventDefault();
      lastTrigger = link;
      choose('service', link.dataset.service);
      choose('design', link.dataset.design);
      if (link.dataset.project) reference = link.dataset.project;
      step = 0;
      document.body.classList.add('dialog-open');
      dialog.showModal();
      renderStep();
    }));
  }
  $('#quote-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    lastTrigger?.focus();
  });
  $('#clear-reference').addEventListener('click', () => { reference = ''; renderStep(); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!valid()) return;
    if (step < 2) { step++; renderStep(); }
    else $('#quote-send').focus();
  });
  $('#quote-back').addEventListener('click', () => { step = Math.max(0, step - 1); renderStep(); });
  form.addEventListener('input', () => { $('#quote-error').textContent = ''; updateMessage(); });
  $('#quote-send').addEventListener('click', event => {
    if (!valid()) event.preventDefault();
    else updateMessage();
  });
})();
