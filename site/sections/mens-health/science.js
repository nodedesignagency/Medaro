/* ==========================================================================
   Men's Health · The science behind Quad 4: the callout lines end at the glass
   (user, 2026-11-25: "reduce this space between points and bottle").
   The ampoule is narrow at its tip and neck and wide at its body, so each
   label's dotted line is made to end GAP px from the glass at the height
   where its curve ends, measured from the render's outline (EDGES: its
   left and right edge every 10 rows of ampoule-quad4-blue.webp, 406×2200,
   alpha > 25%). Sets --reach on each line; without this script the CSS
   reach (18px short of the body's width) stands.
   ========================================================================== */
(function scienceCallouts() {
  const section = document.querySelector('.mhsci');
  if (!section) return;
  const GAP = 6;            // px between a line's end and the glass
  const DROP = 18;          // the curve's end, below (or above) the line
  const W = 406, H = 2200, STEP = 10;
  const EDGES = { l: [185,162,148,139,132,127,123,120,118,116,115,115,114,113,112,112,111,111,110,110,110,109,108,108,107,107,106,105,105,104,102,102,101,100,99,99,98,97,97,96,96,96,97,98,100,102,105,106,108,110,111,111,111,127,111,112,108,104,102,98,94,90,86,83,79,77,76,76,76,76,78,79,81,84,86,91,95,97,98,99,99,101,98,95,92,87,80,72,59,48,37,27,21,15,12,14,12,8,10,9,9,9,9,9,9,7,8,7,8,9,9,9,9,9,9,9,9,8,9,8,9,8,8,8,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,8,8,8,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,6,6,9,9,9,6,6,9,6,6,9,6,6,9,9,9,9,8,9,9,9,9,12,12,12,12,11,11,11,12,32,32,8,7,7,7,8,7,7,27,8,28,7,7,7,7,7,6,6,7,8,9,13,15,24,38,75,134], r: [225,239,258,268,275,278,283,283,282,283,284,285,285,286,287,295,295,295,288,297,295,297,292,292,292,291,292,293,294,295,296,296,297,298,299,301,301,302,303,303,303,303,304,309,308,306,304,302,299,298,297,297,297,297,297,298,299,301,304,311,315,319,321,324,325,328,331,331,331,330,330,327,325,323,311,317,313,301,307,307,289,289,289,302,314,314,315,307,337,334,370,381,388,388,368,374,378,398,399,396,398,398,398,398,383,395,395,393,396,392,391,391,391,391,391,400,400,400,400,400,399,400,399,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,400,399,399,399,399,396,396,396,397,397,399,399,399,399,399,399,399,399,397,397,397,399,399,399,397,399,397,397,399,397,397,397,397,397,397,399,399,399,399,399,399,399,399,397,400,400,400,400,400,400,400,399,398,397,392,385,368,331,268] };
  const pack = section.querySelector('.mhsci__pack');
  const items = [...section.querySelectorAll('.mhsci__item')];

  function place() {
    const p = pack.getBoundingClientRect();
    if (!p.height) return;
    items.forEach((item) => {
      const lead = item.querySelector('.mhsci__lead');
      if (!lead) return;
      lead.style.removeProperty('--reach');
      const end = item.classList.contains('mhsci__item--end');
      const low = item.classList.contains('mhsci__item--low');
      const box = item.getBoundingClientRect();
      const lineY = lead.getBoundingClientRect().top + 1;
      const y = lineY + (low ? -DROP : DROP);
      const row = Math.min(EDGES.l.length - 1, Math.max(0, Math.round((y - p.top) / p.height * H / STEP)));
      const s = p.width / W;
      const reach = end
        ? box.left - (p.left + EDGES.r[row] * s + GAP)
        : (p.left + EDGES.l[row] * s - GAP) - box.right;
      lead.style.setProperty('--reach', Math.round(reach) + 'px');
    });
  }

  place();
  if (document.fonts) document.fonts.ready.then(place);
  window.addEventListener('load', place);
  if ('ResizeObserver' in window) new ResizeObserver(place).observe(section);
})();
