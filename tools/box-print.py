#!/usr/bin/env python3
"""
MEDARO shipping-box print for How Medaro Works, step 3.

Magnific renders the boxes blank (DESIGN.md -> Direction: "Magnific makes the 3D
product, code makes the branding"); this script prints them in code, after the
user's deboss references (2026-11-23: BIGFACE, SOURCE, JOLY, GUIPU; "can we do
debossed version something like these images"):

  - the lid: a giant MEDARO pressed into the board (blind deboss, no ink), shaded
    from a soft height map lit from the window (left and back), so the walls facing
    the light catch it and the others fall into shadow;
  - a lime label (the brand accent) wrapping over the front edge, JOLY-style: the
    small wordmark on the lid part, the client's tagline "Made for Better Health."
    on the front part;
  - each box front: the official wordmark, small, in ink.

The flat prints are HTML (the official wordmark from site/assets/logo/wordmark.svg,
Host Grotesk) rendered to PNG with the pre-installed Playwright (node), warped onto
the faces with perspective transforms (corners measured on the blank render, in its
own pixels) and multiplied into the paper; her fingers on the lid are masked out by
colour (the lid is near-neutral, skin is warm). Only the client's words go on the
box; no drug names, claims or invented small print, and never on a bottle or vial
(DESIGN.md -> Direction, rules 6-8).

Usage (from the repo root):
  python3 tools/box-print.py BLANK.png OUT.png
BLANK.png is the full-size 2592x1600 render (site/assets/images/steps/step-3-blank.webp
is a 1600px copy; scale the corner lists by 1600/2592 to use it).
"""
import os
import re
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INK, LIME = "#343B29", "#D5E5AD"
LW, LH = 2530, 1855   # lid, flat (about 30 x 22 cm)
FW, FH = 2530, 1000   # front face, flat
LABEL_X, LABEL_W = 0.63, 0.20   # the label's position along the front edge (same on lid and front)
LID = [(1213, 293), (2007, 493), (1456, 767), (607, 464)]          # back-left, back-right, front-right, front-left
FRONTS = [[(608, 470), (1455, 765), (1465, 1118), (615, 825)],    # lifted box: top-left, top-right, bottom-right, bottom-left
          [(585, 885), (1460, 1215), (1468, 1535), (600, 1170)]]  # lower box


def wordmark(fill):
    svg = open(os.path.join(ROOT, "site/assets/logo/wordmark.svg")).read()
    svg = re.sub(r"<title>.*?</title>|<!--.*?-->", "", svg, flags=re.S)
    return svg.replace('fill="#000000"', f'fill="{fill}"').replace(
        'width="4413" height="712"', 'style="width:100%;height:auto;display:block"')


def pages():
    head = ('<!doctype html><html><head><meta charset="utf-8">'
            '<link href="https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@400;500&display=swap" rel="stylesheet">'
            '<style>html,body{margin:0;background:transparent}.face{position:relative;overflow:hidden}</style></head><body>')
    mw = LW * 0.92
    return {
        "deboss": (LW, LH, f'<div class="face" style="width:{LW}px;height:{LH}px"><div style="position:absolute;'
                           f'left:{int(LW*0.04)}px;width:{int(mw)}px;top:{int(LH*0.44 - mw/6.2/2)}px">{wordmark("#000")}</div></div>'),
        "label": (LW, LH, f'<div class="face" style="width:{LW}px;height:{LH}px"><div style="position:absolute;'
                          f'left:{int(LW*LABEL_X)}px;width:{int(LW*LABEL_W)}px;top:{int(LH*0.74)}px;height:{int(LH*0.26)+2}px;'
                          f'background:{LIME}"><div style="position:absolute;left:8%;top:22%;width:58%">{wordmark(INK)}</div></div></div>'),
        "front": (FW, FH, f'<div class="face" style="width:{FW}px;height:{FH}px"><div style="position:absolute;'
                          f'left:{int(FW*0.08)}px;width:{int(FW*0.30)}px;top:{int(FH*0.5 - FW*0.30/6.2/2)}px">{wordmark(INK)}</div>'
                          f'<div style="position:absolute;left:{int(FW*LABEL_X)}px;width:{int(FW*LABEL_W)}px;top:-2px;'
                          f'height:{int(FH*0.46)}px;background:{LIME}"><div style="position:absolute;left:8%;right:8%;bottom:16%;'
                          f"font:500 {int(FH*0.075)}px/1.1 'Host Grotesk',sans-serif;letter-spacing:-0.01em;color:{INK}\">"
                          f'Made for<br>Better Health.</div></div></div>'),
    }, head


RENDER_JS = """
const { chromium } = require('playwright')
;(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: '<-loopback>,localhost,127.0.0.1' } : undefined
  const b = await chromium.launch(proxy ? { proxy } : {})
  const jobs = JSON.parse(process.argv[2])
  for (const [html, png, w, h] of jobs) {
    const p = await b.newPage({ viewport: { width: w, height: h } })
    await p.goto('file://' + html, { waitUntil: 'networkidle' })
    await p.evaluate(() => document.fonts.ready)
    await p.locator('.face').screenshot({ path: png, omitBackground: true })
    await p.close()
  }
  await b.close()
})()
"""


def gauss(a, sigma):
    """Gaussian blur through the FFT (no scipy needed)."""
    h, w = a.shape
    p = int(sigma * 4)
    A = np.pad(a, p, mode="edge")
    fy, fx = np.fft.fftfreq(A.shape[0])[:, None], np.fft.fftfreq(A.shape[1])[None, :]
    k = np.exp(-2 * (np.pi * sigma) ** 2 * (fx ** 2 + fy ** 2))
    return np.real(np.fft.ifft2(np.fft.fft2(A) * k))[p:p + h, p:p + w]


def coeffs(dst, w, h):
    """PIL PERSPECTIVE coefficients: output (image) pixel -> input (flat print) pixel."""
    a, b = [], []
    for (x, y), (u, v) in zip(dst, [(0, 0), (w, 0), (w, h), (0, h)]):
        a.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.append(u)
        a.append([0, 0, 0, x, y, 1, -v * x, -v * y]); b.append(v)
    return np.linalg.solve(np.array(a, float), np.array(b, float)).tolist()


def main(blank_path, out_path):
    blank_im = Image.open(blank_path).convert("RGB")
    size = blank_im.size
    img = np.asarray(blank_im, float) / 255
    with tempfile.TemporaryDirectory() as tmp:
        layout, head = pages()
        jobs = []
        for name, (w, h, body) in layout.items():
            html = os.path.join(tmp, name + ".html")
            open(html, "w").write(head + body + "</body></html>")
            jobs.append([html, os.path.join(tmp, name + ".png"), w, h])
        js = os.path.join(tmp, "render.js")
        open(js, "w").write(RENDER_JS)
        subprocess.run(["node", js, str(jobs).replace("'", '"')], check=True)
        flat = {name: Image.open(os.path.join(tmp, name + ".png")).convert("RGBA") for name in layout}

    def warp(im, quad, blur):
        w, h = im.size
        return im.transform(size, Image.PERSPECTIVE, coeffs(quad, w, h), resample=Image.BICUBIC).filter(ImageFilter.GaussianBlur(blur))

    def gray(arr):
        return Image.fromarray((np.clip(arr, 0, 1) * 255).astype("uint8"), "L")

    # the lid, minus her fingers
    q = Image.new("L", size, 0)
    ImageDraw.Draw(q).polygon(LID, fill=255)
    q = np.asarray(q.filter(ImageFilter.GaussianBlur(1)), float) / 255
    r, g, b = (img[..., i] * 255 for i in range(3))
    lidlike = np.clip((22 - (r - b)) / 10, 0, 1) * np.clip(((r + g + b) / 3 - 135) / 15, 0, 1)
    lidmask = np.asarray(gray(q * lidlike).filter(ImageFilter.GaussianBlur(1.2)), float)[..., None] / 255

    # blind deboss: a soft height map, lit from the window (left and back)
    A = np.asarray(flat["deboss"], float)[..., 3] / 255
    gy, gx = np.gradient(gauss(A, 5.0))
    shade = -(gx * -0.62 + gy * -0.78) * 10.0
    dark = np.clip(-shade, 0, 1) * 0.55 + A * 0.04
    lite = np.clip(shade, 0, 1) * 0.65
    d = np.asarray(warp(gray(dark), LID, 0.8), float)[..., None] / 255 * lidmask
    l = np.asarray(warp(gray(lite), LID, 0.8), float)[..., None] / 255 * lidmask
    img = img * (1 - d) + img * 0.55 * d
    img = img + (1 - img) * l * 0.9

    # ink and label, multiplied into the paper
    def multiply(img, im, quad, mask=1.0, strength=0.95):
        layer = np.asarray(warp(im, quad, 0.6), float) / 255
        a = layer[..., 3:4] * mask * strength
        return img * (1 - a) + img * layer[..., :3] * a
    img = multiply(img, flat["label"], LID, lidmask, 0.96)
    for quad in FRONTS:
        img = multiply(img, flat["front"], quad)
    Image.fromarray((np.clip(img, 0, 1) * 255).astype("uint8")).save(out_path)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
