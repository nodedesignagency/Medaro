/* Weight Loss · Ongoing care V1: the pinned care cycle (ongoing--v1.css).
   The track gives the stage room to stay pinned: one stretch of scroll for
   the intro, then one per point. Crossing into a stretch changes the state
   (the middle text, the active node); the ring's green progress follows the
   scroll continuously from the top node, reaching each node as it lights
   up and closing the loop at the end. Scrolling back reverses it all.
   Runs only while its version is shown. */
(function wlOngoing() {
  const root = document.querySelector('[data-wlong1]');
  if (!root) return;
  const track = root.querySelector('[data-wlong1-track]');
  const stage = root.querySelector('[data-wlong1-stage]');
  const points = Array.from(root.querySelectorAll('.wlong1__point'));
  const states = Array.from(root.querySelectorAll('.wlong1__state'));
  const ring = root.querySelector('.wlong1__ring');
  const n = points.length;
  if (!track || !stage || n < 2) return;
  root.classList.add('is-live');

  let step = 0;
  const measure = () => {
    const h = stage.offsetHeight;
    if (!h) return; // hidden version
    step = window.innerHeight * 0.55;
    track.style.height = `${h + (n + 1.4) * step}px`; // +0.4: the closed loop holds a moment before the section moves on
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
    const y = pin - track.getBoundingClientRect().top; // how far into the pinned stretch
    show(Math.min(n, Math.max(0, Math.floor(y / step))));
    const p = Math.min(1, Math.max(0, (y - step) / (n * step)));
    ring.style.setProperty('--p', (p * 100).toFixed(2));
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };

  measure();
  update();
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', () => { measure(); queue(); });
  window.addEventListener('version-change', () => { measure(); queue(); });
})();
