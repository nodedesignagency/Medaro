/* Weight Loss · three steps: the pinned panel's conveyor (steps.css).
   The track gives the panel room to stay pinned while you scroll. Through
   that scroll the cards move up through the right side: a short hold at the
   start and the end, then one move per card, each move eased so the card
   settles and holds in the middle before the next one comes. --d on each
   card is its distance from the middle, in cards (0 = showing; 1 = next,
   below; -1 = last, above). A light follow (lerp) smooths mouse-wheel steps.
   Reduced motion: the cards jump from one to the next, no travel.
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

    const HOLD = 0.07; // share of the pinned scroll held at each end
    const SETTLE = 0.2; // share of each move spent holding before and after

    const target = () => {
      const range = track.offsetHeight - panel.offsetHeight;
      if (range <= 0) return 0; // hidden version
      const pin = parseFloat(getComputedStyle(panel).top) || 0;
      const y = Math.min(range, Math.max(0, pin - track.getBoundingClientRect().top));
      const u = Math.min(1, Math.max(0, (y / range - HOLD) / (1 - 2 * HOLD))) * (n - 1);
      const k = Math.min(n - 2, Math.floor(u));
      let f = Math.min(1, Math.max(0, (u - k - SETTLE) / (1 - 2 * SETTLE)));
      f = f * f * (3 - 2 * f); // smoothstep: leaves gently, lands gently
      return k + f;
    };

    let goal = 0;
    let at = 0;
    let raf = 0;
    const paint = (p) => cards.forEach((c, i) => c.style.setProperty('--d', (i - p).toFixed(4)));
    const tick = () => {
      raf = 0;
      if (still.matches) { at = Math.round(goal); paint(at); return; }
      at += (goal - at) * 0.22;
      if (Math.abs(goal - at) < 0.0005) at = goal;
      paint(at);
      if (at !== goal) raf = requestAnimationFrame(tick);
    };
    const update = () => {
      goal = target();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    at = goal = target();
    paint(at);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('version-change', update);
    still.addEventListener('change', update);
  });
})();
