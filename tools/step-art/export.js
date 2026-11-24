// Renders the step illustrations (SVG sources in this folder) to transparent WebP-ready PNGs.
// Usage: node tools/step-art/export.js <outdir>   then tools/step-art/export.py converts to WebP.
// Chromium draws the grain filter, so every browser (and Framer) gets the same pixels.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const out = process.argv[2];
  const dir = __dirname;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.svg'));
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 768, height: 768 }, deviceScaleFactor: 1 });
  for (const f of files) {
    const svg = fs.readFileSync(path.join(dir, f), 'utf8');
    await p.setContent(`<html><body style="margin:0;background:transparent">${svg.replace('<svg ', '<svg width="768" height="768" ')}</body></html>`);
    await p.screenshot({ path: path.join(out, f.replace('.svg', '.png')), omitBackground: true, clip: { x: 0, y: 0, width: 768, height: 768 } });
  }
  await b.close();
})();
