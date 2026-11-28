#!/usr/bin/env python3
"""
Men's Health → Quad 4 cards, card 1 ("Designed for Convenience"): the blue Quad 4
ampoule lying on the card, with its own shadow and the blue light its liquid throws.

    python3 tools/quad-card-ampoule.py <raw-render.png>

The render (Nano Banana 2.1, 2K, 2026-11-26): a top-down flat lay of our blank
blue ampoule (references: ampoule-quad4-blue.webp laid level, and the user's ISDIN
ampoule photo for the glass and light), level across the frame, tip left, on one
flat pale steel-blue paper (#D5E2EB, measured in all four corners and the edges:
it varies by under 1 level). Because the backdrop is one known colour, it can be
taken out instead of cut away (tools/unmix-glass.py's idea): every pixel becomes
the least opacity that explains it over that colour, so the shadow, the caustic
and the see-through glass all stay, and the card's own colour shows through them.

Writes, into site/assets/images/mens-health/:
  quad-card-ampoule.webp        the ampoule, its shadow and caustic, on transparency
  quad-card-ampoule-print.svg   our Quad 4 print (tools/pack-print.py → ampoule()),
                                wrapped onto this photo's glass; laid over it with
                                mix-blend-mode: screen, like the hand's print

The print is the same artwork as every other Quad 4 ampoule, at the same size
relative to the glass, anchored on the base. The glass here lies level, seen from
above: a cylinder with its axis across the frame (centre y 769, R 209 at the
render's 2752 × 1536; base end x 2530), so the upright print is turned a quarter
(its "down the axis" runs left to right, its letters stand upright) and wrapped.
"""
import importlib.util
import math
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "site", "assets", "images", "mens-health")

spec = importlib.util.spec_from_file_location("pack_print", os.path.join(ROOT, "tools", "pack-print.py"))
pp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pp)

# ---- the render
RAW_W, RAW_H = 2752, 1536
BG = np.array([213.1, 226.1, 234.9])     # the paper it was shot on
CROP = (150, 470, 2752, 1300)            # the ampoule, its shadow and caustic, with room
OUT_W = 1400                             # 2x for the card at 1920 (the ampoule ≈ 560px wide there)
NOISE = 0.03                             # paper grain: opacities under this are the paper itself

# ---- the glass, in the render's pixels
AXIS_Y, R, BASE_X = 769.0, 209.0, 2530.0
S = R / 197.0                            # ampoule-quad4.webp's R is 197


class Lying:
    """The upright cylinder maths (pack-print's Cylinder), turned a quarter: the render rotated
    clockwise is an upright ampoule (tip at the top), so draw there and turn back."""

    def __init__(self):
        # upright frame = this render turned clockwise: x_up = H - y, y_up = x
        self.cyl = pp.Cylinder(cx=RAW_H - AXIS_Y, r=R, eye=RAW_W / 2, k=0.03)
        self.r = R

    def __call__(self, pt):
        xu, yu = self.cyl(pt)
        return (yu, RAW_H - xu)


def image(raw_path):
    im = Image.open(raw_path).convert("RGB")
    assert im.size == (RAW_W, RAW_H), im.size
    im = im.crop(CROP)
    h = round(im.height * OUT_W / im.width)
    c = np.array(im.resize((OUT_W, h), Image.LANCZOS)).astype(float)
    bg = BG[None, None, :]
    darker = np.where(c < bg, (bg - c) / bg, 0.0)
    brighter = np.where(c > bg, (c - bg) / (255.0 - bg), 0.0)
    a = np.maximum(darker, brighter).max(2)
    a2 = np.clip((a - NOISE) / (1 - NOISE), 0, 1)       # the paper drops out, its grain with it
    safe = np.maximum(a, 1e-6)[..., None]
    fg = np.clip(bg + (c - bg) / safe, 0, 255)          # the colour that, at opacity a, gives c over the paper
    # where the paper is nearly all there (the soft ends of the shadow), that colour is mostly grain
    # blown up by a tiny opacity: take it from a softened copy instead (same look, far fewer bytes)
    soft = np.array(Image.fromarray(c.astype(np.uint8)).filter(ImageFilter.GaussianBlur(4))).astype(float)
    sa = np.maximum(darker, brighter).max(2)
    sa = np.maximum(np.array(Image.fromarray((sa * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(4))) / 255.0, 1e-6)
    fg_soft = np.clip(bg + (soft - bg) / sa[..., None], 0, 255)
    t = np.clip((a2 - 0.08) / 0.17, 0, 1)[..., None]     # under 8% opacity soft, over 25% sharp
    fg = fg_soft * (1 - t) + fg * t
    rgba = np.dstack([fg, a2 * 255]).round().astype(np.uint8)
    out = Image.fromarray(rgba, "RGBA")
    path = os.path.join(OUT, "quad-card-ampoule.webp")
    out.save(path, "WEBP", quality=82, alpha_quality=85, method=6)
    print("wrote", path, out.size, os.path.getsize(path) // 1024, "KB")
    return out.size


def print_svg(size):
    p = pp.ampoule(where=pp.Scaled(Lying(), S, 2194, BASE_X))
    x0, y0, x1, y1 = CROP
    w, h = x1 - x0, y1 - y0
    # the fade across the glass, as on the hand (its shadow side at 72%): here the shadow side is the
    # bottom (light from the upper left), the lit side the top
    stops = "".join(f'<stop offset="{o}" stop-color="#fff" stop-opacity="{a}"/>'
                    for o, a in [(0, 0.72), (0.2, 0.86), (0.42, 0.97), (0.55, 1), (0.9, 1), (1, 0.9)])
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0} {y0} {w} {h}" width="{size[0]}" height="{size[1]}">',
           "<title>Quad 4 ampoule lying flat: print on glass</title>",
           "<defs>"
           f'<linearGradient id="fade-g" x1="0" x2="0" y1="{pp.fmt(AXIS_Y + R)}" y2="{pp.fmt(AXIS_Y - R)}" gradientUnits="userSpaceOnUse">{stops}</linearGradient>'
           f'<mask id="fade" maskUnits="userSpaceOnUse" x="{x0}" y="{y0}" width="{w}" height="{h}"><rect x="{x0}" y="{y0}" width="{w}" height="{h}" fill="url(#fade-g)"/></mask>'
           "</defs>",
           '<g mask="url(#fade)">']
    for fill, op, d in p.layers:
        o = f' fill-opacity="{op}"' if op < 1 else ""
        out.append(f'<path fill="{fill}"{o} d="{d}"/>')
    out.append("</g></svg>")
    path = os.path.join(OUT, "quad-card-ampoule-print.svg")
    with open(path, "w") as f:
        f.write("\n".join(out) + "\n")
    print("wrote", path)


if __name__ == "__main__":
    size = image(sys.argv[1])
    print_svg(size)
