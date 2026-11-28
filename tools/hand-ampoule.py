#!/usr/bin/env python3
"""
The Quad 4 ampoule in a man's hand (Men's Health landing → Introducing Quad 4):
the web image, the fingers-in-front layer, and see-through blue glass.

    python3 tools/hand-ampoule.py <render.png> <cutout.png> [--tint 0.5]

Sources (Magnific, 2026-11-25, in the user's library): the 4K render
"A man's hand holds up a glass ampoule …" (3584×4800) and its background
removal (2986×4000). Not in the repo (too large); download both first.

Writes site/assets/images/products/:
  hand-ampoule-quad4.webp        the hand and ampoule, 1368×2475, the ampoule's axis on the centre line
  hand-ampoule-quad4-front.webp  only the thumb and index fingertip where they pass in front of the glass,
                                 laid over the turning print (components/pack-spin.js)

See-through glass (user, 2026-11-25: "it is looking more opaque make it more
translucent"): background removal leaves the glass fully opaque, filled with the
light backdrop seen through the blue liquid. Each glass pixel is split, like
tools/unmix-glass.py, into the backdrop B behind it (estimated row by row from
the render just outside the glass) and the glass's own colour F at the least
opacity a that explains it:
    a = max over channels of (obs - B) / (255 - B) if brighter, (B - obs) / B if darker
    F = B + (obs - B) / a
then the blue tint's opacity is lowered (× --tint) while white reflections, the
neck ring and the bright rims keep theirs, so the page shows through the liquid.
Geometry (cut-out pixels): axis x 1515, glass radius 110, tip y 786, liquid line
y 1396, base y 2045 (tools/pack-print.py maps the print with the same numbers).
"""
import argparse
import os

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "site", "assets", "images", "products")
AX, R, TIP, BASE = 1515.0, 110.0, 786, 2045
CROP = (int(AX - 912), 700, int(AX + 912), 4000)   # symmetric about the axis, tip to the bottom edge
SCALE = 0.75                                       # → 1368 × 2475

ap = argparse.ArgumentParser()
ap.add_argument("render")
ap.add_argument("cutout")
ap.add_argument("--tint", type=float, default=0.6, help="opacity kept by the blue tint in the middle of the glass (1 = as rendered)")
ap.add_argument("--edge", type=float, default=0.95, help="opacity kept by the tint at the glass's sides (thicker glass, seen at a slant)")
ap.add_argument("--preview", help="write only a preview PNG here (the ampoule on the page colour and on stripes), not the site files")
args = ap.parse_args()

cut = Image.open(args.cutout).convert("RGBA")
a = np.asarray(cut).astype(np.float32)
obs, cut_a = a[..., :3], a[..., 3] / 255.0
H, W = cut_a.shape
render = np.asarray(Image.open(args.render).convert("RGB").resize((W, H), Image.LANCZOS)).astype(np.float32)
ys, xs = np.mgrid[0:H, 0:W]
r, g, b = obs[..., 0], obs[..., 1], obs[..., 2]
skin = (r - b > 18) & (r > 70) & (cut_a > 0.78)

# ---- the backdrop behind the glass, per row, from the render just outside the silhouette ----
rows = np.arange(H)
left = np.median(render[:, int(AX - R - 100):int(AX - R - 40)], axis=1)
right = np.median(render[:, int(AX + R + 40):int(AX + R + 100)], axis=1)
clean_to = 1760                                    # below this the fingers enter the sample strips
left[clean_to:] = left[clean_to - 1]
right[clean_to:] = right[clean_to - 1]
left = ndi.uniform_filter1d(left, 61, axis=0)
right = ndi.uniform_filter1d(right, 61, axis=0)
t = np.clip((xs - (AX - R)) / (2 * R), 0, 1)[..., None]
B = left[:, None, :] * (1 - t) + right[:, None, :] * t

# ---- the glass: inside the cut-out, near the axis, between tip and base, not skin ----
glass = (cut_a > 0.5) & (np.abs(xs - AX) <= R + 8) & (ys >= TIP - 6) & (ys <= BASE + 14) & ~skin
glass = ndi.binary_opening(glass, iterations=1)

# ---- unmix and thin the tint ----
alpha = np.maximum((obs - B) / np.maximum(255 - B, 1), (B - obs) / np.maximum(B, 1)).max(axis=2)
alpha = np.clip(alpha, 0.02, 1)
F = np.clip(B + (obs - B) / alpha[..., None], 0, 255)
whiteness = np.clip((F.min(axis=2) / np.maximum(F.max(axis=2), 1) - 0.55) / 0.35, 0, 1)   # reflections, ring
# across each row of the glass: 0 at its middle, 1 at its sides; the tint thins most in the middle,
# where light passes straight through, and stays deeper towards the sides
gx0 = np.where(glass.any(1), np.argmax(glass, 1), 0)
gx1 = np.where(glass.any(1), W - 1 - np.argmax(glass[:, ::-1], 1), 1)
mid, half = (gx0 + gx1) / 2, np.maximum((gx1 - gx0) / 2, 1)
side = np.clip(np.abs(xs - mid[:, None]) / half[:, None], 0, 1) ** 2.2
tint = args.tint + (args.edge - args.tint) * side
keep = tint + (1 - tint) * whiteness
new_a = np.clip(alpha * keep, 0, 1)
# the outermost pixels of the glass (its rim) stay as solid as they were: a crisp silhouette
dist = ndi.distance_transform_edt(glass)
rim = np.clip(1 - (dist - 2) / 6, 0, 1)
new_a = new_a * (1 - rim) + alpha * rim
w = glass[..., None]
out_rgb = np.where(w, F, obs)
out_a = np.where(glass, new_a * cut_a, cut_a)
img = Image.fromarray(np.dstack([out_rgb, out_a * 255]).astype(np.uint8), "RGBA")
sz = (round((CROP[2] - CROP[0]) * SCALE), round((CROP[3] - CROP[1]) * SCALE))
if args.preview:
    box = (int(AX - 190), TIP - 40, int(AX + 190), BASE + 160)
    piece = img.crop(box)
    page = Image.new("RGBA", piece.size, (237, 242, 248, 255)); page.alpha_composite(piece)
    stripes = Image.new("RGBA", piece.size, (237, 242, 248, 255))
    for x in range(0, piece.width, 48):
        stripes.paste((52, 59, 41, 255), (x, 0, x + 20, piece.height))
    stripes.alpha_composite(piece)
    both = Image.new("RGB", (piece.width * 2 + 16, piece.height), "white")
    both.paste(page.convert("RGB"), (0, 0)); both.paste(stripes.convert("RGB"), (piece.width + 16, 0))
    both.save(args.preview)
    raise SystemExit(0)
img.crop(CROP).resize(sz, Image.LANCZOS).save(os.path.join(OUT, "hand-ampoule-quad4.webp"), quality=86, method=6)

# ---- the fingers in front of the glass ----
inside = (np.abs(xs - AX) <= R + 3) & (ys >= 1700) & (ys <= BASE + 30)
front = ndi.binary_opening(inside & skin, iterations=2)
lab, n = ndi.label(front)
sizes = ndi.sum(front, lab, range(1, n + 1))
front = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 400])
grow = ndi.binary_dilation(front, iterations=26) & skin
fa = ndi.gaussian_filter((front | grow).astype(np.float32), 1.2)
fa = np.where(np.abs(xs - AX) <= R + 30, fa, 0) * cut_a
fimg = Image.fromarray(np.dstack([obs, fa * 255]).astype(np.uint8), "RGBA")
fimg.crop(CROP).resize(sz, Image.LANCZOS).save(os.path.join(OUT, "hand-ampoule-quad4-front.webp"), quality=90, method=6)

ga = alpha[glass]
print(f"hand-ampoule-quad4.webp {sz[0]}×{sz[1]}; glass opacity before {ga.mean():.2f} (median {np.median(ga):.2f}), "
      f"after {new_a[glass].mean():.2f}")
