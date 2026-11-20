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

/* ---------- Rolling links (.link-roll) ----------
   Splits each link's text into letters for the hover roll (styles.css).
   Kerning is measured on the unsplit text and put back as a margin on each
   letter (in em, so it holds at any size). The word stays readable to
   screen readers in a visually hidden span; the letters are aria-hidden. */
(function rollLinks() {
  const links = Array.from(document.querySelectorAll('.link-roll'));
  if (!links.length) return;
  const split = () => links.forEach((el) => {
    if (el.dataset.rolled || !el.getClientRects().length) return; // hidden (another version): split when shown
    const node = el.firstChild;
    const text = el.textContent;
    if (!node || node.nodeType !== 3 || !text.trim()) return;
    // measure each letter's kerned position before splitting
    const range = document.createRange();
    const xs = [];
    for (let i = 0; i <= text.length; i++) {
      range.setStart(node, Math.min(i, text.length - 1));
      range.setEnd(node, Math.min(i + 1, text.length));
      const r = range.getBoundingClientRect();
      xs.push(i < text.length ? r.left : r.right);
    }
    const size = parseFloat(getComputedStyle(el).fontSize) || 16;
    const sr = document.createElement('span');
    sr.className = 'visually-hidden';
    sr.textContent = text;
    const vis = document.createElement('span');
    vis.className = 'link-roll__text';
    vis.setAttribute('aria-hidden', 'true');
    const chars = Array.from(text).map((ch, i) => {
      const c = document.createElement('span');
      c.className = 'link-roll__c';
      c.style.setProperty('--i', i);
      c.textContent = ch;
      vis.appendChild(c);
      return c;
    });
    el.textContent = '';
    el.append(sr, vis);
    chars.forEach((c, i) => {
      const kern = (xs[i + 1] - xs[i]) - c.getBoundingClientRect().width;
      if (Math.abs(kern) > 0.05) c.style.marginRight = `${(kern / size).toFixed(4)}em`;
    });
    el.dataset.rolled = '1';
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(split); else split();
  window.addEventListener('version-change', () => requestAnimationFrame(split));
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

/* ---------- Steps: one step at a time while the stage is pinned ----------
   [data-steps] holds a [data-steps-track] (the scroll room) and its steps
   [data-step], each with a .steps__card. Scroll inside the track: a pause on
   each step, and between steps the next card rises from below the screen
   onto the stack, moving with the scroll (--rise on the card, --depth on
   the cards it covers). Halfway up, the step changes: data-state before /
   active / after on each step (CSS animates the text) and --step on the
   section (the rolling number). Reduced motion: cards jump, no rise. */
(function steps() {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('section[data-steps]').forEach((root) => {
    const track = root.querySelector('[data-steps-track]');
    const items = Array.from(root.querySelectorAll('[data-step]'));
    const cards = items.map((el) => el.querySelector('.steps__card'));
    if (!track || !items.length || cards.some((c) => !c)) return;
    const n = items.length;
    let dwell = 0, rise = 0, current = -1;

    // Room to scroll: a pause per step plus one card-rise between steps.
    // A card rises from just below the screen to its place, as far as you scroll.
    const measure = () => {
      const vh = window.innerHeight;
      rise = Math.max(240, vh - cards[0].offsetTop + 32);
      dwell = vh * 0.35;
      track.style.height = `${vh + n * dwell + (n - 1) * rise}px`;
      root.style.setProperty('--steps-enter', `${rise}px`);
    };
    const setActive = (i) => {
      if (i === current) return;
      current = i;
      root.style.setProperty('--step', i);
      items.forEach((el, k) => {
        el.dataset.state = k < i ? 'before' : k > i ? 'after' : 'active';
        if (k === i) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current');
      });
    };
    let queued = false;
    const update = () => {
      queued = false;
      const r = track.getBoundingClientRect();
      const range = n * dwell + (n - 1) * rise;
      const y = Math.min(range, Math.max(0, -r.top));
      const t = [1];
      for (let k = 1; k < n; k++) {
        const startK = k * dwell + (k - 1) * rise;
        let v = Math.min(1, Math.max(0, (y - startK) / rise));
        if (still.matches) v = v >= 0.5 ? 1 : 0;
        t.push(v);
      }
      let depth = 0;
      for (let k = n - 1; k >= 0; k--) {
        cards[k].style.setProperty('--rise', t[k].toFixed(4));
        cards[k].style.setProperty('--depth', depth.toFixed(4));
        depth += t[k] * (k > 0 ? 1 : 0);
      }
      setActive(t.reduce((a, v, k) => (k > 0 && v >= 0.5 ? k : a), 0));
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
    measure();
    update();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', () => { measure(); queue(); });
    still.addEventListener('change', queue);
  });
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
