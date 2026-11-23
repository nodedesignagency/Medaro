#!/usr/bin/env python3
"""
MEDARO shipping-box print for How Medaro Works, step 3 (2026-11-23).

Magnific renders the boxes blank (DESIGN.md -> Direction: "Magnific makes the 3D
product, code makes the branding"); this script prints them in code:

  1. draws the flat front-face print (the official wordmark from
     site/assets/logo/wordmark.svg, the client's tagline "Made for Better Health."
     in Host Grotesk, a lime band in the brand accent) as HTML and renders it to a
     transparent PNG with the pre-installed Playwright (node);
  2. warps it onto each box's front face (four corners measured on the blank
     render, in its own pixels) with a perspective transform;
  3. multiplies it into the render so the paper texture and shading show through.

Only the client's words go on the box; no drug names, claims or invented small
print, and never on a bottle or vial (DESIGN.md -> Direction, rules 6-8).

Usage (from the repo root):
  python3 tools/box-print.py BLANK.png OUT.png
BLANK.png is the full-size 2592x1600 render (site/assets/images/steps/step-3-blank.webp
is a 1600px copy; scale QUADS by 1600/2592 to use it). Writes OUT.png at the input size.
"""
import os
import re
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INK = "#343B29"      # --p-ink, Dark Olive Green
LIME = "#D5E5AD"     # --p-accent, Soft Nude Lime
W, H = 2530, 1000    # flat face, about the real face's proportions
# Front faces on the 2592x1600 render: top-left, top-right, bottom-right, bottom-left
QUADS = {
    "lifted": [(608, 470), (1455, 765), (1465, 1118), (615, 825)],
    "lower": [(585, 885), (1460, 1215), (1468, 1535), (600, 1170)],
}


def face_html():
    svg = open(os.path.join(ROOT, "site/assets/logo/wordmark.svg")).read()
    svg = re.sub(r"<title>.*?</title>|<!--.*?-->", "", svg, flags=re.S)
    svg = svg.replace('fill="#000000"', f'fill="{INK}"').replace(
        'width="4413" height="712"', 'style="height:100%;width:auto;display:block"')
    return f"""<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@400;500&display=swap" rel="stylesheet">
<style>html,body{{margin:0;background:transparent}}
.face{{position:relative;width:{W}px;height:{H}px;overflow:hidden}}
.mark{{position:absolute;left:{int(W*0.075)}px;top:{int(H*0.34)}px;height:{int(H*0.21)}px}}
.tag{{position:absolute;left:{int(W*0.077)}px;top:{int(H*0.62)}px;font:400 {int(H*0.085)}px/1 "Host Grotesk",sans-serif;letter-spacing:-0.01em;color:{INK}}}
.band{{position:absolute;left:{int(W*0.80)}px;top:0;width:{int(W*0.075)}px;height:100%;background:{LIME}}}
</style></head><body><div class="face"><div class="band"></div><div class="mark">{svg}</div>
<div class="tag">Made for Better Health.</div></div></body></html>"""


RENDER_JS = """
const { chromium } = require('playwright')
;(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: '<-loopback>,localhost,127.0.0.1' } : undefined
  const b = await chromium.launch(proxy ? { proxy } : {})
  const p = await b.newPage({ viewport: { width: %d, height: %d } })
  await p.goto('file://' + process.argv[2], { waitUntil: 'networkidle' })
  await p.evaluate(() => document.fonts.ready)
  await p.locator('.face').screenshot({ path: process.argv[3], omitBackground: true })
  await b.close()
})()
""" % (W, H)


def coeffs(dst, src):
    """PIL PERSPECTIVE coefficients: output (image) pixel -> input (flat print) pixel."""
    a, b = [], []
    for (x, y), (u, v) in zip(dst, src):
        a.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.append(u)
        a.append([0, 0, 0, x, y, 1, -v * x, -v * y]); b.append(v)
    return np.linalg.solve(np.array(a, float), np.array(b, float)).tolist()


def main(blank, out_path):
    with tempfile.TemporaryDirectory() as tmp:
        html, js, png = (os.path.join(tmp, n) for n in ("face.html", "render.js", "face.png"))
        open(html, "w").write(face_html())
        open(js, "w").write(RENDER_JS)
        subprocess.run(["node", js, html, png], check=True)
        ink = Image.open(png).convert("RGBA")
    base = Image.open(blank).convert("RGB")
    out = np.asarray(base, float) / 255
    src = [(0, 0), (W, 0), (W, H), (0, H)]
    for quad in QUADS.values():
        warped = ink.transform(base.size, Image.PERSPECTIVE, coeffs(quad, src), resample=Image.BICUBIC)
        w = np.asarray(warped.filter(ImageFilter.GaussianBlur(0.6)), float) / 255
        alpha = w[..., 3:4] * 0.94
        out = out * (1 - alpha) + out * w[..., :3] * alpha  # multiply
    Image.fromarray((out * 255).clip(0, 255).astype("uint8")).save(out_path)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
