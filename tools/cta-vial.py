#!/usr/bin/env python3
"""
Weight Loss → closing CTA photo: our Tirzepatide vial on a morning kitchen counter.

    python3 tools/cta-vial.py <raw-render.png>

The render (Nano Banana 2.1, 2K, 2026-11-26; reference: products/vial-tirzepatide.webp,
blank label) is 2752 × 1536. Its vial stands a little low for the CTA band, where the
subject has to sit in the glass between the words and the white list, so:

1. The canvas is extended 400px downward from the render's own cabinet front (the plain
   panel under the counter's edge): each column carries its own colour on down, with fresh
   film grain and a soft fall-off towards the floor (extend_down). Nothing else is invented. The page then crops from the top
   (object-position), which lifts the vial into the glass.
2. Our label print (tools/pack-print.py → vial(), the client's Compounded Tirzepatide
   label, word for word) is wrapped onto the photo's blank label: glass centre x 1376.5,
   R 84.5, the label's front from y 928 to 1148, the camera level with its foot (eye 1146,
   k 0.043, measured from the label's own edges: the top arcs 9px, the foot is flat).
   Same artwork, same size relative to the label (s = 84.5 / 228.5), anchored on its top.
   Laid over the photo with mix-blend-mode: multiply, so the photo's light stays on it.

Writes site/assets/images/weight-loss/cta-vial.webp and cta-vial-print.svg (same 2752 × 1936 grid).
"""
import importlib.util
import math
import os
import sys

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "site", "assets", "images", "weight-loss")
spec = importlib.util.spec_from_file_location("pack_print", os.path.join(ROOT, "tools", "pack-print.py"))
pp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pp)

W, H, EXT = 2752, 1536, 400

CX, R, TOP, EYE, K = 1376.5, 84.5, 928.0, 1146.0, 0.043
S = R / pp.VIAL.r
BAND_X = (CX - R - 0.5, CX + R + 0.5)       # the band's ends, in this photo's x (just past the silhouette)


class Mapped:
    """Flat print coordinates (the vial render's: u across, y down) → this photo."""

    def __init__(self):
        self.cyl = pp.Cylinder(cx=CX, r=R, eye=EYE, k=K)
        self.r = pp.VIAL.r               # band sweeps are given in flat units

    def __call__(self, pt):
        u, y = pt
        return self.cyl((u * S, TOP + (y - pp.VIAL_TOP) * S))


def extend_down(im, ext, rows=20, fall=0.86, seed=7):
    """Extend a photo downward by `ext` px from its own last `rows` rows: each column keeps its own
    colour (seams and edges carry straight on), fresh film grain, a soft fall-off. No tiling, so no
    repeating bands. Shared with the Men's CTA photo (cta-watch)."""
    base = im[-rows:].mean(0, keepdims=True)                         # 1 × W × 3: each column's colour
    rng = np.random.default_rng(seed)
    grain = rng.normal(0, 3.0, (ext, im.shape[1], 3))
    fallv = np.linspace(1.0, fall, ext)[:, None, None]
    ext_px = base * fallv + grain
    # blend the first rows into the photo's own last rows, so the join doesn't show
    n = min(24, ext)
    w = np.linspace(1, 0, n)[:, None, None]
    ext_px[:n] = ext_px[:n] * (1 - w) + im[-1:] * w + grain[:n] * w * 0
    return np.clip(np.concatenate([im, ext_px], 0), 0, 255).astype(np.uint8)


def photo(raw):
    im = np.array(Image.open(raw).convert("RGB")).astype(float)
    assert im.shape[:2] == (H, W), im.shape
    out = extend_down(im, EXT)
    path = os.path.join(OUT, "cta-vial.webp")
    Image.fromarray(out).save(path, "WEBP", quality=76, method=6)
    print("wrote", path, out.shape[1], "x", out.shape[0], os.path.getsize(path) // 1024, "KB")


def print_svg(variant="Microdose"):
    p = pp.Print(Mapped())
    L = -152
    edge = math.pi / 2 * pp.VIAL.r
    # vial() in tools/pack-print.py, line for line
    p.band(pp.VIAL_TOP, pp.VIAL_BOT, pp.MOSS, *BAND_X)
    p.text("RX ONLY", L, 465, 25, 500, pp.PAPER, tracking=0.12, opacity=0.82)
    p.line(-edge, edge, 503, 2.2, pp.PAPER, 0.36)
    p.text("Compounded", L - 1, 583, 40, 400, pp.LIME)
    p.text("Tirzepatide", L - 3, 661, 72, 500, pp.PAPER, tracking=-0.02)
    p.line(-edge, edge, 707, 2.2, pp.PAPER, 0.36)
    p.text("Injection", L, 777, 29, 400, pp.PAPER, opacity=0.82)
    p.band(823, pp.VIAL_BOT, pp.LIME, *BAND_X)
    p.text(f"{variant} Vial", L, 925, 38, 500, pp.INK, tracking=-0.015)
    # no shading of our own: the print multiplies onto the photo, whose light already shades the label
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H + EXT}" width="{W}" height="{H + EXT}">',
           f"<title>Compounded Tirzepatide, {variant} Vial: label print on the CTA photo</title>",
           "<g>"]
    for fill, op, d in p.layers:
        o = f' fill-opacity="{op}"' if op < 1 else ""
        out.append(f'<path fill="{fill}"{o} d="{d}"/>')
    out.append("</g></svg>")
    path = os.path.join(OUT, "cta-vial-print.svg")
    with open(path, "w") as f:
        f.write("\n".join(out) + "\n")
    print("wrote", path)


def watch(raw):
    """Men's CTA photo (cta-watch.webp): the same 400px extension, so the page can lift the hands into the glass."""
    im = np.array(Image.open(raw).convert("RGB")).astype(float)
    assert im.shape[:2] == (H, W), im.shape
    out = extend_down(im, EXT, fall=0.9, seed=11)
    path = os.path.join(ROOT, "site", "assets", "images", "mens-health", "cta-watch.webp")
    Image.fromarray(out).save(path, "WEBP", quality=76, method=6)
    print("wrote", path, out.shape[1], "x", out.shape[0], os.path.getsize(path) // 1024, "KB")


if __name__ == "__main__":
    # python3 tools/cta-vial.py <vial-render.png> [<watch-render.png>]
    photo(sys.argv[1])
    print_svg()
    if len(sys.argv) > 2:
        watch(sys.argv[2])
