#!/usr/bin/env python3
"""
Make the clear glass in a cut-out render really see-through.

    python3 tools/unmix-glass.py <cutout.png> <out.webp> --bg 47.6,52.8,37.2 [--floor 0.5] [--height 2200 --width 406]

Background removal keeps whatever showed through clear glass: an ampoule
rendered on a flat dark olive comes out filled with that olive, and the stage's
light can't pass through it. Because we render on ONE flat, even colour
(DESIGN.md → Direction, rule 7), that colour is known, so it can be taken out:
for every pixel, the least opacity that explains it over the backdrop

    a = max over channels of  (obs - bg) / (255 - bg)   if brighter
                              (bg - obs) / bg           if darker

then the glass's own colour  fg = bg + (obs - bg) / a.  Reflections and edges
stay solid; plain see-through glass drops to --floor (clear glass still dims
what is behind it: 0.5 keeps the print readable over the bright beam).

--bg: the backdrop colour, sampled from the raw render's corners.
The result is cropped to the object (6px margin) and resized to --width × --height,
so it lines up with the print made by tools/pack-print.py.
"""
import argparse

import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("cutout")
ap.add_argument("out")
ap.add_argument("--bg", required=True, help="r,g,b of the flat backdrop the object was rendered on")
ap.add_argument("--floor", type=float, default=0.5)
ap.add_argument("--width", type=int, default=406)
ap.add_argument("--height", type=int, default=2200)
ap.add_argument("--quality", type=int, default=84)
args = ap.parse_args()

bg = np.array([float(v) for v in args.bg.split(",")])
c = np.array(Image.open(args.cutout).convert("RGBA")).astype(float)
obs, cut_a = c[..., :3], c[..., 3] / 255.0
a = np.maximum((obs - bg) / (255 - bg), (bg - obs) / bg).max(axis=2)
a = np.clip(np.maximum(a, args.floor), 0, 1)
fg = np.clip(bg + (obs - bg) / a[..., None], 0, 255)
img = Image.fromarray(np.dstack([fg, a * cut_a * 255]).astype(np.uint8), "RGBA")

ys, xs = np.where(cut_a > 8 / 255)
img = img.crop((xs.min() - 6, ys.min() - 6, xs.max() + 7, ys.max() + 7))
img = img.resize((args.width, args.height), Image.LANCZOS)
img.save(args.out, "WEBP", quality=args.quality, method=6)
print(f"{args.out}: {img.size[0]}×{img.size[1]}")
