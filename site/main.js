/* MEDARO — shared JS. Keep it small; each part is labelled with what it serves. */

/* ---------- Header ----------
   is-scrolled: the page has moved. is-solid (glass header): the element named
   in data-solid-after has scrolled up behind the bar, so the bar turns light. */
(function header() {
  const headers = Array.from(document.querySelectorAll('[data-header]'));
  if (!headers.length) return;
  const update = () => {
    headers.forEach((el) => {
      el.classList.toggle('is-scrolled', window.scrollY > 8);
      const after = el.dataset.solidAfter && document.querySelector(el.dataset.solidAfter);
      if (after) el.classList.toggle('is-solid', after.getBoundingClientRect().bottom < el.getBoundingClientRect().bottom + 8);
    });
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('version-change', update);
})();

/* ---------- Scenes: the page changes colour for a section ----------
   A section with data-scene="<name>" sets data-scene on <html> while it
   crosses the middle of the screen; the section's CSS redefines the colour
   tokens under :root[data-scene="<name>"] and styles.css fades them (the
   tokens are registered with @property, so the whole page animates). */
(function scenes() {
  const els = Array.from(document.querySelectorAll('[data-scene]'));
  if (!els.length || !('IntersectionObserver' in window)) return;
  const root = document.documentElement;
  const on = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) on.add(e.target); else on.delete(e.target); });
    const active = els.find((el) => on.has(el) && !el.closest('[hidden]'));
    if (active) root.dataset.scene = active.dataset.scene; else delete root.dataset.scene;
  }, { rootMargin: '-50% 0px -50% 0px' });
  els.forEach((el) => io.observe(el));
})();

/* ---------- Drift: rows that slide sideways as the page scrolls ----------
   data-drift="-1" slides left, "1" slides right, a quarter of the screen
   over the section's scroll. Rows are much wider than the screen (their
   tiles repeat), so their ends never show. Halfway through the scroll a
   row's tiles start on the frame edge; data-phase="0.5" shifts a row by half
   a tile. Reduced motion: rows rest at that halfway point. */
(function drift() {
  const rows = Array.from(document.querySelectorAll('[data-drift]'));
  if (!rows.length) return;
  const root = document.documentElement;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;
  const update = () => {
    queued = false;
    const vh = window.innerHeight;
    const frameMax = parseFloat(getComputedStyle(root).getPropertyValue('--frame-max')) || 1888;
    rows.forEach((row) => {
      if (row.closest('[hidden]')) return;
      const box = row.parentElement.getBoundingClientRect();
      const over = Math.max(0, row.scrollWidth - box.width);
      const pitch = row.firstElementChild.getBoundingClientRect().width + (parseFloat(getComputedStyle(row).columnGap) || 0);
      const side = Math.max(16, (box.width - frameMax) / 2);
      const centre = Math.round(over / 2 / pitch) * pitch - side + pitch * (Number(row.dataset.phase) || 0);
      const travel = Math.min(box.width * 0.25, over);
      let p = still.matches ? 0.5 : (vh - box.top) / (vh + box.height);
      p = Math.min(1, Math.max(0, p));
      const x = centre + travel * (p - 0.5) * (Number(row.dataset.drift) < 0 ? 1 : -1);
      row.style.transform = `translate3d(${(-x).toFixed(1)}px, 0, 0)`;
    });
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  update();
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  window.addEventListener('load', queue);
  window.addEventListener('version-change', queue);
  still.addEventListener('change', queue);
})();

/* ---------- Review-only: versions and palettes ----------
   Sections offered in several versions are marked data-version="<slot>:<id>",
   e.g. data-version="hero:a" and data-version="hero:b". One per slot is shown,
   chosen with ?hero=b (default: the first one in the page).
   Palettes: <html data-palettes="a,b,c"> lists them; ?palette=b applies one
   (see the palette blocks at the top of styles.css).
   ?briefs=on shows what each stand-in image should become.
   Options: <html data-options="blue:a,b;…"> sets data-blue on <html>; ?blue=b.
   A small switcher appears bottom-left; hide it with ?review=0. Never goes to Framer. */
(function review() {
  const params = new URLSearchParams(location.search);
  const root = document.documentElement;
  const slots = new Map();

  document.querySelectorAll('[data-version]').forEach((el) => {
    const [slot, id] = el.dataset.version.split(':');
    if (!slots.has(slot)) slots.set(slot, []);
    slots.get(slot).push({ id, el });
  });

  const palettes = (root.dataset.palettes || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (palettes.length) {
    const wanted = params.get('palette');
    root.dataset.palette = palettes.includes(wanted) ? wanted : palettes[0];
  }
  if (params.get('briefs') === 'on') root.dataset.briefs = 'on';

  // Options: <html data-options="blue:a,b"> → data-blue="a" on <html>, ?blue=b to switch
  const options = new Map();
  (root.dataset.options || '').split(';').map((s) => s.trim()).filter(Boolean).forEach((def) => {
    const [name, list] = def.split(':');
    const ids = list.split(',').map((x) => x.trim()).filter(Boolean);
    options.set(name, ids);
    const wanted = params.get(name);
    root.dataset[name] = ids.includes(wanted) ? wanted : ids[0];
  });

  function apply(slot, id) {
    if (slot === 'palette') {
      root.dataset.palette = id;
    } else if (options.has(slot)) {
      root.dataset[slot] = id;
    } else {
      slots.get(slot).forEach((v) => { v.el.hidden = v.id !== id; });
      window.dispatchEvent(new CustomEvent('version-change', { detail: { slot, id } }));
    }
  }

  slots.forEach((list, slot) => {
    const wanted = params.get(slot);
    const pick = list.find((v) => v.id === wanted) || list[0];
    list.forEach((v) => { v.el.hidden = v !== pick; });
  });

  if (params.get('review') === '0') return;

  const rows = [];
  slots.forEach((list, slot) => {
    if (list.length > 1) rows.push({ slot, ids: list.map((v) => v.id), current: (list.find((v) => !v.el.hidden) || list[0]).id });
  });
  if (palettes.length > 1) rows.push({ slot: 'palette', ids: palettes, current: root.dataset.palette });
  options.forEach((ids, name) => { if (ids.length > 1) rows.push({ slot: name, ids, current: root.dataset[name] }); });
  if (!rows.length) return;

  const bar = document.createElement('div');
  bar.className = 'review-switcher';
  bar.setAttribute('aria-label', 'Review: switch versions');
  rows.forEach(({ slot, ids, current }) => {
    const row = document.createElement('div');
    row.className = 'review-switcher__row';
    const label = document.createElement('span');
    label.className = 'review-switcher__label';
    label.textContent = slot;
    row.appendChild(label);
    ids.forEach((id) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = id;
      b.setAttribute('aria-pressed', String(id === current));
      b.addEventListener('click', () => {
        apply(slot, id);
        params.set(slot, id);
        history.replaceState(null, '', `${location.pathname}?${params}${location.hash}`);
        row.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      });
      row.appendChild(b);
    });
    bar.appendChild(row);
  });
  document.body.appendChild(bar);
})();
