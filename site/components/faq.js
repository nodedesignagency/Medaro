/* FAQ (component): one answer open at a time. Without JS every answer stays
   open (the CSS folds them only once .is-ready is set). */
(() => {
  document.querySelectorAll('.faq').forEach((faq) => {
    const buttons = [...faq.querySelectorAll('.faq__q')];
    const panel = (b) => document.getElementById(b.getAttribute('aria-controls'));
    const set = (b, open) => {
      b.setAttribute('aria-expanded', String(open));
      panel(b).classList.toggle('is-open', open);
    };
    buttons.forEach((b) => {
      set(b, b.getAttribute('aria-expanded') === 'true');
      b.addEventListener('click', () => {
        const open = b.getAttribute('aria-expanded') !== 'true';
        buttons.forEach((o) => { if (o !== b) set(o, false); });
        set(b, open);
      });
    });
    faq.classList.add('is-ready');
  });
})();
