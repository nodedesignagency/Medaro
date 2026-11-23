#!/usr/bin/env python3
"""
MEDARO box print for How Medaro Works, step 3.

The render (Magnific, Nano Banana 2.1) is a sage rigid box held square to the
camera, with an abstract contour pattern debossed into the board and no ink,
after the user's references (2026-11-23: REOME, Homecoming, Soma, Hotei, SEED:
"i want like this something premium you can use debossed pattern thing too").
The pattern is the render's own (an abstract deboss renders well, like the
debossed tablets); every word is code (DESIGN.md -> Direction: "Magnific makes
the 3D product, code makes the branding"):

  - the official wordmark (site/assets/logo/wordmark.svg) in ink, centred in the
    plain lower third, REOME-style;
  - the client's tagline "Made for Better Health." small below it (Host Grotesk)
    (user, 2026-11-23: "make medaro 10% bigger and keep medaro first and then at
    bottom ... made for better health").

The flat print is HTML rendered to PNG with the pre-installed Playwright (node),
warped onto the box face (its corners measured on the render, in its own pixels)
and multiplied into the board, so the paper texture and light show through;
anything skin-coloured (her thumb) is masked out. Only the client's words go on the
box; no drug names, claims or invented small print, and never on a bottle or vial
(DESIGN.md -> Direction, rules 6-8).

Usage (from the repo root):
  python3 tools/box-print.py BLANK.png OUT.png
BLANK.png is the full-size 2592x1600 render (site/assets/images/steps/step-3-blank.webp
is a 1600px copy; scale FACE by 1600/2592 to use it).
"""
import json
import os
import re
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INK = "#343B29"                   # --p-ink, Dark Olive Green
W, H = 1536, 2128                 # the face, flat (2x the face's size on the render)
FACE = [(927, 262), (1695, 251), (1697, 1318), (929, 1326)]   # top-left, top-right, bottom-right, bottom-left


def face_html():
    svg = open(os.path.join(ROOT, "site/assets/logo/wordmark.svg")).read()
    svg = re.sub(r"<title>.*?</title>|<!--.*?-->", "", svg, flags=re.S)
    svg = svg.replace('fill="#000000"', f'fill="{INK}"').replace(
        'width="4413" height="712"', 'style="width:100%;height:auto;display:block"')
    mw = W * 0.52 * 1.1   # 10% bigger (user, 2026-11-23)
    return f"""<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@400;500&display=swap" rel="stylesheet">
<style>html,body{{margin:0;background:transparent}}
.face{{position:relative;width:{W}px;height:{H}px;overflow:hidden}}
.tag{{position:absolute;left:0;right:0;top:{int(H*0.866)}px;text-align:center;font:500 {int(H*0.034)}px/1 "Host Grotesk",sans-serif;letter-spacing:0.01em;color:{INK}}}
.mark{{position:absolute;left:{int((W-mw)/2)}px;width:{int(mw)}px;top:{int(H*0.772)}px}}
</style></head><body><div class="face"><div class="mark">{svg}</div><div class="tag">Made for Better Health.</div></div></body></html>"""


RENDER_JS = """
const { chromium } = require('playwright')
;(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: '<-loopback>,localhost,127.0.0.1' } : undefined
  const b = await chromium.launch(proxy ? { proxy } : {})
  const [html, png, w, h] = JSON.parse(process.argv[2])
  const p = await b.newPage({ viewport: { width: w, height: h } })
  await p.goto('file://' + html, { waitUntil: 'networkidle' })
  await p.evaluate(() => document.fonts.ready)
  await p.locator('.face').screenshot({ path: png, omitBackground: true })
  await b.close()
})()
"""


def coeffs(dst, w, h):
    """PIL PERSPECTIVE coefficients: output (image) pixel -> input (flat print) pixel."""
    a, b = [], []
    for (x, y), (u, v) in zip(dst, [(0, 0), (w, 0), (w, h), (0, h)]):
        a.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.append(u)
        a.append([0, 0, 0, x, y, 1, -v * x, -v * y]); b.append(v)
    return np.linalg.solve(np.array(a, float), np.array(b, float)).tolist()


def main(blank_path, out_path):
    base = Image.open(blank_path).convert("RGB")
    img = np.asarray(base, float) / 255
    with tempfile.TemporaryDirectory() as tmp:
        html, js, png = (os.path.join(tmp, n) for n in ("face.html", "render.js", "face.png"))
        open(html, "w").write(face_html())
        open(js, "w").write(RENDER_JS)
        subprocess.run(["node", js, json.dumps([html, png, W, H])], check=True)
        flat = Image.open(png).convert("RGBA")
    warped = flat.transform(base.size, Image.PERSPECTIVE, coeffs(FACE, W, H), resample=Image.BICUBIC)
    layer = np.asarray(warped.filter(ImageFilter.GaussianBlur(0.6)), float) / 255
    # the board is a cool sage (red below green); skin is warm (red well above green)
    r, g = img[..., 0] * 255, img[..., 1] * 255
    board = np.clip((12 - (r - g)) / 10, 0, 1)[..., None]
    a = layer[..., 3:4] * board * 0.94
    img = img * (1 - a) + img * layer[..., :3] * a     # multiply: the board shows through
    Image.fromarray((np.clip(img, 0, 1) * 255).astype("uint8")).save(out_path)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
