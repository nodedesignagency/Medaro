/* Home · hero, version A: the care index drives the portrait frame.
   Hover or focus a line: its photo fades in and its headline shows in the
   frame. Leaving the index returns to the default photo. */
(function heroCareIndex() {
  const root = document.querySelector('.hero-a');
  if (!root) return;

  const index = root.querySelector('.hero-a__index');
  const rows = Array.from(root.querySelectorAll('.hero-a__row'));
  const media = root.querySelector('.hero-a__media');
  const layers = Array.from(media.querySelectorAll('[data-layer]'));
  const caption = media.querySelector('.hero-a__caption');
  const tagEl = caption.querySelector('.hero-a__caption-tag');
  const textEl = caption.querySelector('.hero-a__caption-text');

  let current = null;
  let swap;

  function show(key) {
    if (key === current) return;
    current = key;
    const layer = layers.find((l) => l.dataset.layer === key) || layers[0];
    layers.forEach((l) => l.classList.toggle('is-shown', l === layer));
    rows.forEach((r) => r.classList.toggle('is-active', r.dataset.media === key));
    media.dataset.tone = layer.dataset.tone || 'light';

    caption.classList.add('is-swapping');
    clearTimeout(swap);
    swap = setTimeout(() => {
      tagEl.textContent = layer.dataset.tag || '';
      textEl.textContent = layer.dataset.caption || '';
      caption.hidden = !layer.dataset.caption;
      caption.classList.remove('is-swapping');
    }, 160);
  }

  rows.forEach((r) => {
    r.addEventListener('pointerenter', () => show(r.dataset.media));
    r.addEventListener('focus', () => show(r.dataset.media));
  });
  index.addEventListener('pointerleave', () => show('all'));
  index.addEventListener('focusout', (e) => {
    if (!index.contains(e.relatedTarget)) show('all');
  });

  show('all');
})();
