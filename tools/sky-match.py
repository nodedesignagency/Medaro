#!/usr/bin/env python3
"""
Sky match: recolour the sky of one photo to the sky of another, keeping clouds,
grain and hair edges (2026-11-26, Weight Loss difference card 1: the user wanted
the woman's blue sky "green to like the medicine bottle" card next to it).

    python3 tools/sky-match.py <photo.png> <reference.webp> <out.png> <out-1024.png>

How: in Lab, a pixel counts as sky by how blue it is (b below the skin, cloth
and hair; a soft ramp, so strands that mix with the sky blend). Each sky pixel
moves to the reference sky's colour at the same height (the reference's left
edge, above its steps, smoothed): a and b against a smooth 2D field of the
photo's own sky colour (so a bluer corner lands on the same green), lightness by
85% of the per-row difference (the sky's own falloff stays). Nothing that is not
blue changes.

The raw renders stay in the MEDARO Magnific project, not in git.
Needs: pip install pillow numpy scipy scikit-image
"""
import sys
import numpy as np
from PIL import Image
from skimage import color
from scipy import ndimage

src, ref, out, preview = sys.argv[1:5]
w = np.asarray(Image.open(src).convert('RGB')).astype(float) / 255
v = np.asarray(Image.open(ref).convert('RGB')).astype(float) / 255
H, W = w.shape[:2]
lw, lv = color.rgb2lab(w), color.rgb2lab(v)
hv = lv.shape[0]

# target sky (vial card): left strip, rows down to where the steps start
strip = lv[:, 8:40]
bottom = int(hv * 790 / 1024)                # the steps start at row ~800 on the left edge
T = strip[:bottom].mean(1)                   # (n, 3) Lab per row
T = np.stack([ndimage.uniform_filter1d(T[:, c], 61, mode='nearest') for c in range(3)], 1)
print('vial sky rows 0 -', bottom)

# source sky: rows of the left strip of the woman's image (sky only there)
sstrip = lw[:, 8:int(W * 0.12)]
Sraw = sstrip.mean(1)
Sm = np.stack([ndimage.uniform_filter1d(Sraw[:, c], 41, mode='nearest') for c in range(3)], 1)

t = np.arange(H) / (H - 1)
Tm = np.stack([np.interp(t * (bottom - 1), np.arange(bottom), T[:, c]) for c in range(3)], 1)
delta = Tm - Sm                               # per row shift in L, a, b
delta[:, 0] *= 0.85                           # most of the lightness change; keeps the sun in the sky

# which pixels are sky: blue (b below the skin, cloth and hair), soft edge so hair strands blend
b = lw[..., 2]
wc = np.clip((3.5 - b) / 6.0, 0, 1)
wc = ndimage.gaussian_filter(wc, 0.6)
# colour (a, b) per pixel against a smooth 2D field of the sky's own colour, so the bluer right side
# lands on the same green; lightness keeps the per-row shift (the sky's natural falloff stays)
sig = 60
den = ndimage.gaussian_filter(wc, sig) + 1e-6
field = np.stack([ndimage.gaussian_filter(lw[..., c] * wc, sig) / den for c in (1, 2)], -1)
d = np.empty_like(lw)
d[..., 0] = delta[:, None, 0]
d[..., 1:] = Tm[:, None, 1:] - field
new = lw + wc[..., None] * d
rgb = np.clip(color.lab2rgb(new), 0, 1)
img = Image.fromarray((rgb * 255 + 0.5).astype(np.uint8))
img.save(out)
img.resize((1024, 1024), Image.LANCZOS).save(preview)
for y in (0, H // 4, H // 2, 3 * H // 4, H - 1):
    print(y, 'src', Sm[y].round(1), 'tgt', Tm[y].round(1))
