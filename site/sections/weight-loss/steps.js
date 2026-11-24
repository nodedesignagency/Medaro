/* Weight Loss · three steps: the pinned panel's deck (steps.css), the same
   motion as How Medaro Works (main.js → steps). The track gives the panel
   room to stay pinned: a pause on each card, and between cards the next one
   rises from just below the panel to its place, moving exactly as far as you
   scroll (no easing, no lag), landing on the card before. --rise (0 → 1) on
   the rising card, --depth on every card under it (how many cards lie on
   it). Reduced motion: the cards jump at the halfway point.
   Runs only while its version is shown (the section lives under hero V4). */
(function wlSteps() {
  const roots = Array.from(document.querySelectorAll('[data-wlsteps]'));
  if (!roots.length) return;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');

  roots.forEach((root) => {
    const track = root.querySelector('[data-wlsteps-track]');
    const panel = root.querySelector('[data-wlsteps-panel]');
    const cards = Array.from(root.querySelectorAll('[data-wlsteps-card]'));
    const n = cards.length;
    if (!track || !panel || n < 2) return;
    root.classList.add('is-live');

    let rise = 0;
    let dwell = 0;
    let range = 0;
    const measure = () => {
      const h = panel.offsetHeight;
      if (!h) return; // hidden version
      rise = Math.max(200, h - cards[0].offsetTop); // from the panel's bottom edge to the card's place
      dwell = window.innerHeight * 0.35;              // the pause on each card
      range = n * dwell + (n - 1) * rise;
      track.style.height = `${h + range}px`;
      root.style.setProperty('--enter', `${rise}px`);
    };

    let queued = false;
    const update = () => {
      queued = false;
      if (!range) return;
      const pin = parseFloat(getComputedStyle(panel).top) || 0;
      const y = Math.min(range, Math.max(0, pin - track.getBoundingClientRect().top));
      const t = [1];
      for (let k = 1; k < n; k++) {
        const start = k * dwell + (k - 1) * rise; // a pause, a rise, a pause, a rise, a pause
        let v = Math.min(1, Math.max(0, (y - start) / rise));
        if (still.matches) v = v >= 0.5 ? 1 : 0;
        t.push(v);
      }
      let depth = 0;
      for (let k = n - 1; k >= 0; k--) {
        cards[k].style.setProperty('--rise', t[k].toFixed(4));
        cards[k].style.setProperty('--depth', depth.toFixed(4));
        cards[k].style.setProperty('--shadow', k > 0 ? Math.min(1, t[k] * 3).toFixed(3) : '0');
        depth += k > 0 ? t[k] : 0;
      }
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };

    measure();
    update();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', () => { measure(); queue(); });
    window.addEventListener('version-change', () => { measure(); queue(); });
    still.addEventListener('change', queue);
  });
})();
