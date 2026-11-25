/* Weight Loss · Ongoing care V1: the care dial (ongoing--v1.css).
   While the dial rises into view it scales 0.9 → 1 (--enter); the intro
   (the closing lines) shows in the centre on the way up. Once pinned it holds
   only a short beat (LEAD: a fifth of a stretch; round 6, user 2026-11-25:
   "it takes so long to get to Follow-up care"), then each point gets one
   stretch of scroll: crossing into a stretch swaps the centre text and the
   active node; the lit dots (--pct, 0–100) follow the scroll continuously
   from the top, reaching each node as it lights and closing the loop after
   the fourth. Scrolling back reverses it all. Runs only while its version is
   shown. */
(function wlOngoing() {
  const root = document.querySelector('[data-wlong1]');
  if (!root) return;
  const track = root.querySelector('[data-wlong1-track]');
  const stage = root.querySelector('[data-wlong1-stage]');
  const dial = root.querySelector('.wlong1__dial');
  const points = Array.from(root.querySelectorAll('.wlong1__point'));
  const states = Array.from(root.querySelectorAll('.wlong1__state'));
  const n = points.length;
  if (!track || !stage || !dial || n < 2) return;
  root.classList.add('is-live');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');

  const LEAD = 0.2;  // the intro's hold once pinned, in stretches (it was 1: a whole stretch before Follow-up care)
  let step = 0;
  let lead = 0;
  const measure = () => {
    const h = stage.offsetHeight;
    if (!h) return; // hidden version
    step = window.innerHeight * 0.55;
    lead = step * LEAD;
    track.style.height = `${h + lead + (n + 0.4) * step}px`; // +0.4: the closed loop holds a moment before the section moves on
  };

  let current = -1;
  const show = (s) => {
    if (s === current) return;
    current = s;
    states.forEach((el, i) => el.classList.toggle('is-on', i === s));
    points.forEach((p, i) => {
      p.classList.toggle('is-active', i === s - 1);
      p.classList.toggle('is-done', i < s - 1);
    });
  };

  let queued = false;
  const update = () => {
    queued = false;
    if (!step) return;
    const pin = parseFloat(getComputedStyle(stage).top) || 0;
    const y = pin - track.getBoundingClientRect().top; // how far into the pinned stretch (negative while rising)
    show(y < lead ? 0 : Math.min(n, 1 + Math.floor((y - lead) / step)));
    const p = Math.min(1, Math.max(0, (y - lead) / (n * step)));
    dial.style.setProperty('--pct', (p * 100).toFixed(2));
    const rise = Math.min(1, Math.max(0, 1 + y / (window.innerHeight * 0.6))); // 0 when 60% of a window away, 1 once pinned
    dial.style.setProperty('--enter', still.matches ? 1 : (0.9 + 0.1 * rise).toFixed(4));
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };

  measure();
  update();
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', () => { measure(); queue(); });
  window.addEventListener('version-change', () => { measure(); queue(); });
})();
