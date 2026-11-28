/* Men's Health · How MEDARO works: the steps take turns (2026-11-25, after
   the user's StemWave recording). The open step's line fills for
   --mhhiw-step (a CSS animation); when it is full the next step opens and
   its photo fades in, round and round. Click (or Enter/Space) opens a step
   and starts its line again.
   Holds still: off screen, while the mouse is on the list (reading), while
   the keyboard is in it, and under reduced motion (no line, no turning:
   the steps open when chosen). Without this script every step is open. */
(() => {
  const root = document.querySelector('.mhhiw');
  if (!root) return;
  const steps = [...root.querySelectorAll('.mhhiw__step')];
  const shots = [...root.querySelectorAll('.mhhiw__shot')];
  const list = root.querySelector('.mhhiw__steps');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const holds = new Set(['view']);
  let current = 0;

  const sync = () => root.classList.toggle('is-paused', holds.size > 0);
  const hold = (why, on) => { if (on) holds.add(why); else holds.delete(why); sync(); };

  function show(i, restart) {
    current = (i + steps.length) % steps.length;
    steps.forEach((step, k) => {
      const on = k === current;
      step.classList.toggle('is-active', on);
      step.querySelector('.mhhiw__step-btn').setAttribute('aria-expanded', String(on));
    });
    shots.forEach((shot, k) => shot.classList.toggle('is-active', k === current));
    if (restart) {
      const line = steps[current].querySelector('.mhhiw__progress');
      line.style.animation = 'none';
      void line.offsetWidth; // start the line again from empty
      line.style.animation = '';
    }
  }

  steps.forEach((step, k) => {
    step.querySelector('.mhhiw__step-btn').addEventListener('click', () => show(k, true));
  });
  list.addEventListener('animationend', (e) => {
    if (e.animationName === 'mhhiw-progress') show(current + 1);
  });
  list.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hold('pointer', true); });
  list.addEventListener('pointerleave', () => hold('pointer', false));
  list.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) hold('focus', true); });
  list.addEventListener('focusout', (e) => { if (!list.contains(e.relatedTarget)) hold('focus', false); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => hold('view', !entry.isIntersecting), { threshold: 0.45 }).observe(root);
  } else {
    hold('view', false);
  }

  // The list keeps the height of its tallest state: every title closed but
  // one, the longest text open (closed rows are 10px taller than the open
  // one: the open card's text sits closer under its title).
  function reserve() {
    const names = steps.map((step) => step.querySelector('.mhhiw__step-btn').getBoundingClientRect().height - parseFloat(getComputedStyle(step.querySelector('.mhhiw__step-btn')).paddingBottom) + 22);
    const texts = steps.map((step) => step.querySelector('.mhhiw__text').getBoundingClientRect().height);
    const h = names.reduce((a, b) => a + b, 0) - 10 + Math.max(...texts);
    list.style.minHeight = `${Math.ceil(h) + 2}px`; // + 2: sub-pixel rounding
  }
  let lastWidth = 0;
  new ResizeObserver(() => {
    if (root.clientWidth === lastWidth) return;
    lastWidth = root.clientWidth;
    reserve();
  }).observe(root);
  document.fonts?.ready.then(reserve);

  const setAuto = () => root.classList.toggle('is-auto', !reduce.matches);
  reduce.addEventListener('change', setAuto);
  setAuto();
  sync();
  show(0);
  root.classList.add('is-ready');
})();
