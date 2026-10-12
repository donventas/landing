/* Surface follows the section immediately above the contact dock. No tracking. */
(() => {
  let pending = false;
  function updateSurface() {
    pending = false;
    if (document.body.classList.contains('dialog-open')) return;
    const dock = document.querySelector('.mobile-actions');
    if (!dock || getComputedStyle(dock).display === 'none') return;
    const y = Math.max(1, dock.getBoundingClientRect().top - 12);
    const element = document.elementFromPoint(Math.min(60, innerWidth / 2), y);
    const section = element?.closest('[data-surface]');
    document.body.dataset.contactSurface = section?.dataset.surface || 'light';
  }
  function schedule() {
    if (!pending) { pending = true; requestAnimationFrame(updateSurface); }
  }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  addEventListener('load', schedule);
  document.querySelector('#quote-dialog')?.addEventListener('close', schedule);
  schedule();
})();
