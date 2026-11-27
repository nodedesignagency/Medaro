/* Weight Loss · Pricing: "One Price. Every Dose." (pricing.css).
   The switch (two radios) picks the medication: the section's data-product
   moves the ink pill and recolours the product half, the chosen product's
   block fades in and the result names it. The slider sets the weight; the
   result is weight × the product's data-rate, rounded. No rate yet: the
   result stays "XX" with [DATA NEEDED] (CLAUDE.md: never invent pounds
   lost); give each .wlprice__item a data-rate once the client sends the
   basis and its qualifier, and the marker goes. */
(function wlPricing() {
  const root = document.querySelector('[data-wlprice]');
  if (!root) return;
  const radios = Array.from(root.querySelectorAll('input[name="wlprice-product"]'));
  const items = Array.from(root.querySelectorAll('.wlprice__item'));
  const range = root.querySelector('.wlprice__range');
  const weightOut = root.querySelector('[data-weight]');
  const result = root.querySelector('[data-result]');
  const resultNum = root.querySelector('[data-result-num]');
  const nameOut = root.querySelector('[data-name]');
  const needed = root.querySelector('[data-needed]');
  if (!radios.length || !items.length || !range) return;
  root.classList.add('is-live');

  const current = () => items.find((el) => el.dataset.product === root.dataset.product) || items[0];

  const compute = () => {
    const w = Number(range.value);
    const item = current();
    const rate = parseFloat(item.dataset.rate);
    weightOut.textContent = w;
    range.setAttribute('aria-valuetext', `${w} pounds`);
    range.style.setProperty('--fill', `${((w - range.min) / (range.max - range.min)) * 100}%`);
    nameOut.textContent = item.querySelector('.wlprice__name').textContent;
    if (Number.isFinite(rate) && rate > 0) {
      resultNum.textContent = Math.round(w * rate);
      result.removeAttribute('data-empty');
      needed.hidden = true;
    } else {
      resultNum.textContent = 'XX'; // a placeholder that can't pass for a figure
      result.setAttribute('data-empty', '');
      needed.hidden = false;
    }
  };

  const choose = (product) => {
    root.dataset.product = product;
    items.forEach((el) => el.classList.toggle('is-on', el.dataset.product === product));
    compute();
  };

  radios.forEach((r) => r.addEventListener('change', () => { if (r.checked) choose(r.value); }));
  range.addEventListener('input', compute);
  choose((radios.find((r) => r.checked) || radios[0]).value);
})();
