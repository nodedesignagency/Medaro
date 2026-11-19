/* MEDARO — shared JS. Keep it small; each part is labelled with what it serves. */

/* ---------- Review-only: versions ----------
   Sections offered in several versions are marked data-version="<slot>:<id>",
   e.g. data-version="hero:a" and data-version="hero:b". One per slot is shown,
   chosen with ?hero=b (default: the first one in the page). A small switcher
   appears bottom-left; hide it with ?review=0. Never goes to Framer. */
(function versions() {
  const blocks = Array.from(document.querySelectorAll('[data-version]'));
  if (!blocks.length) return;

  const params = new URLSearchParams(location.search);
  const slots = new Map();
  blocks.forEach((el) => {
    const [slot, id] = el.dataset.version.split(':');
    if (!slots.has(slot)) slots.set(slot, []);
    slots.get(slot).push({ id, el });
  });

  function show(slot, id) {
    slots.get(slot).forEach((v) => { v.el.hidden = v.id !== id; });
    params.set(slot, id);
    history.replaceState(null, '', `${location.pathname}?${params}${location.hash}`);
    document.querySelectorAll(`[data-switch="${slot}"]`).forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.id === id));
    });
  }

  slots.forEach((list, slot) => {
    const wanted = params.get(slot);
    const pick = list.find((v) => v.id === wanted) || list[0];
    list.forEach((v) => { v.el.hidden = v !== pick; });
  });

  if (params.get('review') === '0') return;
  const bar = document.createElement('div');
  bar.className = 'review-switcher';
  bar.setAttribute('aria-label', 'Review: switch versions');
  slots.forEach((list, slot) => {
    if (list.length < 2) return;
    const row = document.createElement('div');
    row.className = 'review-switcher__row';
    row.innerHTML = `<span class="review-switcher__label">${slot}</span>`;
    list.forEach((v) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = v.id;
      b.dataset.switch = slot;
      b.dataset.id = v.id;
      b.setAttribute('aria-pressed', String(!v.el.hidden));
      b.addEventListener('click', () => show(slot, v.id));
      row.appendChild(b);
    });
    bar.appendChild(row);
  });
  if (bar.children.length) document.body.appendChild(bar);
})();
