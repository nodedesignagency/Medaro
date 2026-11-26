#!/usr/bin/env python3
"""
Our Quad 4 print, wrapped onto a photo of the upright ampoule.

    python3 tools/photo-ampoule-print.py <out.svg> --size 2048x2048 --cx 1023 --r 120 --base 1590 \
        [--eye 1000] [--k 0.03] [--lit left|right] [--width 1200]

For any Magnific photo in which our blank Quad 4 ampoule stands upright and faces
the camera (references: products/ampoule-quad4-blue.webp): measure the glass in
the photo's own pixels (the body's centre x and half-width R, and the base, the
lowest row of the glass), and this writes the same print as every other Quad 4
ampoule (tools/pack-print.py → ampoule(), the white version screened onto blue
glass), at the same size relative to the glass, anchored on the base, wrapped
round the cylinder. Lay it over the photo with mix-blend-mode: screen.

--lit: the side the light comes from; the print fades a little towards the other
side (as on the hand ampoule), so it sits in the photo's light.
--width: the displayed image's width; the SVG keeps the photo's own coordinates
(viewBox) and is drawn at this size.

Used for: Men's Health → The MEDARO difference, card 3 (mens-health/diff-ampoule-stone.webp):
  python3 tools/photo-ampoule-print.py site/assets/images/mens-health/diff-ampoule-stone-print.svg \
      --size 2048x2048 --cx 1023 --r 120 --base 1590 --eye 1000 --lit left --width 1200
"""
import argparse
import importlib.util
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location("pack_print", os.path.join(ROOT, "tools", "pack-print.py"))
pp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pp)

ap = argparse.ArgumentParser()
ap.add_argument("out")
ap.add_argument("--size", required=True, help="the photo's pixel size, WxH")
ap.add_argument("--cx", type=float, required=True)
ap.add_argument("--r", type=float, required=True)
ap.add_argument("--base", type=float, required=True)
ap.add_argument("--eye", type=float, default=None, help="camera eye height in the photo (default: mid body)")
ap.add_argument("--k", type=float, default=0.03)
ap.add_argument("--lit", choices=["left", "right"], default="left")
ap.add_argument("--width", type=int, default=None)
a = ap.parse_args()

W, H = (int(v) for v in a.size.lower().split("x"))
s = a.r / 197.0                                  # ampoule-quad4.webp: R 197, base y 2194
eye = a.eye if a.eye is not None else a.base - 600 * s
cyl = pp.Cylinder(cx=a.cx, r=a.r, eye=eye, k=a.k)
p = pp.ampoule(where=pp.Scaled(cyl, s, 2194, a.base))

stops = [(0, 0.72), (0.2, 0.86), (0.42, 0.97), (0.55, 1), (0.9, 1), (1, 0.9)]   # the hand's: lit on the right
if a.lit == "left":
    stops = [(round(1 - o, 2), v) for o, v in reversed(stops)]
x0, x1 = a.cx - a.r, a.cx + a.r
dw = a.width or W
dh = round(H * dw / W)
g = "".join(f'<stop offset="{o}" stop-color="#fff" stop-opacity="{v}"/>' for o, v in stops)
out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{dw}" height="{dh}">',
       "<title>Quad 4 ampoule: print on glass</title>",
       "<defs>"
       f'<linearGradient id="fade-g" x1="{pp.fmt(x0)}" x2="{pp.fmt(x1)}" y1="0" y2="0" gradientUnits="userSpaceOnUse">{g}</linearGradient>'
       f'<mask id="fade" maskUnits="userSpaceOnUse" x="0" y="0" width="{W}" height="{H}"><rect width="{W}" height="{H}" fill="url(#fade-g)"/></mask>'
       "</defs>",
       '<g mask="url(#fade)">']
for fill, op, d in p.layers:
    o = f' fill-opacity="{op}"' if op < 1 else ""
    out.append(f'<path fill="{fill}"{o} d="{d}"/>')
out.append("</g></svg>")
with open(a.out, "w") as f:
    f.write("\n".join(out) + "\n")
print("wrote", a.out)
