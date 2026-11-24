/* Weight Loss · Ongoing care: the phone's three rows come in one after another
   the first time the stage reaches the screen. Without JS (or with reduced
   motion) they are simply there. */
(() => {
  const section = document.querySelector('.wlong');
  if (!section || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const stage = section.querySelector('.wlong__stage');
  section.classList.add('is-armed');
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      section.classList.add('is-in');
      io.disconnect();
    }
  }, { threshold: 0.35 });
  io.observe(stage);
})();
