/* Weight Loss · care: the glass cards across the portrait turn slowly, like
   hims' carousel. Three cards, named positions (care.css): every 3.6s the
   centre card moves left, the right one comes to the centre, and the left
   one fades out past the edge and comes back in on the right. Paused while
   the pointer is over the panel, while the tab is hidden and while the
   section's version is not shown. Reduced motion: the cards stay put. */
(function careCarousel() {
  const roots = Array.from(document.querySelectorAll('[data-care-carousel]'));
  if (!roots.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  roots.forEach((root) => {
    const cards = Array.from(root.children);
    if (cards.length !== 3) return;
    const place = (el, pos, instant) => {
      if (instant) el.style.transition = 'none';
      el.dataset.pos = pos;
      if (instant) { void el.offsetWidth; el.style.transition = ''; }
    };
    let order = [2, 0, 1]; // left, centre, right: health starts in the middle
    place(cards[order[0]], 'left', true);
    place(cards[order[1]], 'center', true);
    place(cards[order[2]], 'right', true);
    if (reduce) return;

    let paused = false;
    const panel = root.parentElement;
    panel.addEventListener('mouseenter', () => { paused = true; });
    panel.addEventListener('mouseleave', () => { paused = false; });

    setInterval(() => {
      if (paused || document.hidden || !root.offsetParent) return;
      const [l, c, r] = order;
      place(cards[l], 'out-left');
      place(cards[c], 'left');
      place(cards[r], 'center');
      setTimeout(() => {
        place(cards[l], 'out-right', true);
        requestAnimationFrame(() => place(cards[l], 'right'));
      }, 720);
      order = [c, r, l];
    }, 3600);
  });
})();
