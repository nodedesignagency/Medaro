// Weight Loss landing → Framer (2026-11-28): flatten the vial renders with their
// label print (multiply) and satin sheen (screen), as components/product.css layers
// them in the HTML, because Framer has no blend stack for images.
//   - the pricing vials also get the HTML's two drop shadows baked in (Framer has no
//     drop-shadow filter): 157px of transparent padding round the 466×1100 render;
//   - card 1's ledge photo gets the HTML's left mask baked into the alpha.
//
//   node tools/framer/wl-flatten.js <checkout of claude/youthful-noether-ftr6t5> <dir with the plain prints> <out dir>
//
// Needs Playwright (pre-installed in the cloud container). Writes PNGs; convert to
// WebP (quality 90) before uploading.
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
const [src, prints, out] = process.argv.slice(2)
const IMG = path.join(src, 'site/assets/images')
const jobs = [
  { out: 'wl-price-vial-tirzepatide.png', base: `${IMG}/products/vial-tirzepatide.webp`, print: `${prints}/print-vial-tirzepatide-plain.svg`, sheen: `${IMG}/products/sheen-vial.svg`, w: 466, h: 1100, shadow: true },
  { out: 'wl-price-vial-semaglutide.png', base: `${IMG}/products/vial-tirzepatide.webp`, print: `${prints}/print-vial-semaglutide-plain.svg`, sheen: `${IMG}/products/sheen-vial.svg`, w: 466, h: 1100, shadow: true },
  { out: 'wl-card-vial-ledge.png', base: `${IMG}/weight-loss/card-vial.webp`, print: `${prints}/print-vial-ledge-plain.svg`, sheen: `${IMG}/weight-loss/sheen-vial-ledge.svg`, w: 1344, h: 1800, mask: true },
]
;(async () => {
  fs.mkdirSync(out, { recursive: true })
  const browser = await chromium.launch()
  for (const j of jobs) {
    const s = 1100 / 281 // the HTML shows the 1100px render 281px tall at 1440: shadow sizes ×3.915 in render px
    const pad = j.shadow ? Math.round(40 * s) : 0
    const W = j.w + 2 * pad, H = j.h + 2 * pad
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
    const filter = j.shadow ? `filter: drop-shadow(0 ${14 * s}px ${18 * s}px rgb(38 43 30 / 0.16)) drop-shadow(0 ${2 * s}px ${3 * s}px rgb(38 43 30 / 0.12));` : ''
    const mask = j.mask ? '-webkit-mask-image: linear-gradient(to right, transparent 8%, #000 30%); mask-image: linear-gradient(to right, transparent 8%, #000 30%);' : ''
    await page.setContent(`<!doctype html><html><head><style>
      html,body{margin:0;background:transparent}
      .pack{position:relative;display:block}
      .pack img{position:absolute;inset:0;width:100%;height:100%;display:block}
      .print{mix-blend-mode:multiply}.sheen{mix-blend-mode:screen}
      </style></head><body><div style="padding:${pad}px"><span class="pack" style="width:${j.w}px;height:${j.h}px;${filter}${mask}">
      <img src="file://${j.base}"><img class="print" src="file://${j.print}"><img class="sheen" src="file://${j.sheen}"></span></div></body></html>`)
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(out, j.out), omitBackground: true, clip: { x: 0, y: 0, width: W, height: H } })
    console.log(j.out, W, H)
  }
  await browser.close()
})()
