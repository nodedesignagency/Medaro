/* Weight Loss · hero V3: the photo fan's entrance (after Mahadeva's PhotoFan).
   The resting markup is the open fan, so without this script, or with
   reduced motion, the fan is simply there. When a third of the band is in
   view (it may start hidden behind the review switcher), the pile is put
   1200px below, then stepped through the template's states:
   piled (0s, 0.4s) → settled (0.4s, 1s) → open (0.8s, 1s). CSS owns every
   transform (hero--v3.css); this only sets data-fan. */
(function wlFan() {
  const fans = Array.from(document.querySelectorAll('[data-fan]'));
  if (!fans.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  fans.forEach((fan) => {
    const band = fan.closest('[data-fan-band]') || fan.parentElement;
    fan.dataset.fan = 'out';
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.3)) return;
      io.disconnect();
      // two frames, so "out" is painted before the rise starts
      requestAnimationFrame(() => requestAnimationFrame(() => {
        fan.dataset.fan = 'piled';
        setTimeout(() => { fan.dataset.fan = 'settled'; }, 400);
        setTimeout(() => { fan.dataset.fan = 'open'; }, 800);
      }));
    }, { threshold: [0, 0.3, 0.6] });
    io.observe(band);
  });
})();
