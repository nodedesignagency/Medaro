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

/* ---------- Header: highlight that slides behind the hovered link ----------
   Used by the liquid-glass nav (data-thumb on the links). */
(function headerThumb() {
  document.querySelectorAll('.site-header__links[data-thumb]').forEach((nav) => {
    const thumb = document.createElement('span');
    thumb.className = 'site-header__thumb';
    thumb.setAttribute('aria-hidden', 'true');
    nav.prepend(thumb);
    const place = (a) => {
      thumb.style.width = `${a.offsetWidth}px`;
      thumb.style.transform = `translateX(${a.offsetLeft}px)`;
    };
    const moveTo = (a) => {
      if (!thumb.classList.contains('is-on')) {
        // appear in place on the first hover, then slide between links
        thumb.style.transition = 'none';
        place(a);
        void thumb.offsetWidth;
        thumb.style.transition = '';
      } else {
        place(a);
      }
      thumb.classList.add('is-on');
    };
    nav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('pointerenter', () => moveTo(a));
      a.addEventListener('focus', () => moveTo(a));
    });
    nav.addEventListener('pointerleave', () => thumb.classList.remove('is-on'));
    nav.addEventListener('focusout', (e) => {
      if (!nav.contains(e.relatedTarget)) thumb.classList.remove('is-on');
    });
  });
})();

/* ---------- Review-only: versions and palettes ----------
   Sections offered in several versions are marked data-version="<slot>:<id>",
   e.g. data-version="hero:a" and data-version="hero:b". One per slot is shown,
   chosen with ?hero=b (default: the first one in the page).
   Palettes: <html data-palettes="a,b,c"> lists them; ?palette=b applies one
   (see the palette blocks at the top of styles.css).
   ?briefs=on shows what each stand-in image should become.
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

  function apply(slot, id) {
    if (slot === 'palette') {
      root.dataset.palette = id;
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
