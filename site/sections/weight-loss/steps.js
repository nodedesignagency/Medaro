/* Weight Loss · three steps: the pinned panel's card wheel (steps.css),
   after the user's "Built for every stage of growth" recording. The track
   gives the panel room to stay pinned: one stretch of scroll per step. When
   the scroll crosses into the next stretch, --pos changes on every card
   (0 showing, 1 next, -1 last) and the wheel turns by CSS transition: the
   showing card swings out at the top right, the next swings in from the
   bottom right. Scrolling back turns it back. Reduced motion: the card just
   changes (the global reduced-motion rule makes the transition instant).
   Runs only while its version is shown (the section lives under hero V4). */
(function wlSteps() {
  const roots = Array.from(document.querySelectorAll('[data-wlsteps]'));
  if (!roots.length) return;

  roots.forEach((root) => {
    const track = root.querySelector('[data-wlsteps-track]');
    const panel = root.querySelector('[data-wlsteps-panel]');
    const cards = Array.from(root.querySelectorAll('[data-wlsteps-card]'));
    const n = cards.length;
    if (!track || !panel || n < 2) return;
    root.classList.add('is-live');

    let step = 0; // scroll per step
    const measure = () => {
      const h = panel.offsetHeight;
      if (!h) return; // hidden version
      step = window.innerHeight * 0.6;
      track.style.height = `${h + n * step}px`;
    };

    let active = -1;
    const show = (i) => {
      if (i === active) return;
      active = i;
      cards.forEach((c, k) => {
        c.style.setProperty('--pos', k - i);
        if (k === i) c.setAttribute('aria-current', 'step'); else c.removeAttribute('aria-current');
      });
    };

    let queued = false;
    const update = () => {
      queued = false;
      if (!step) return;
      const pin = parseFloat(getComputedStyle(panel).top) || 0;
      const y = pin - track.getBoundingClientRect().top; // how far into the pinned stretch
      show(Math.min(n - 1, Math.max(0, Math.floor(y / step))));
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };

    measure();
    update();
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-ready'))); // transitions on after the first paint
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', () => { measure(); queue(); });
    window.addEventListener('version-change', () => { measure(); queue(); });
  });
})();
