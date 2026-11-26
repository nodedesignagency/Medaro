#!/usr/bin/env python3
"""
Weight Loss hero V4 photo: a square close shot of the couple, extended to the
left with empty sky, sea and grass (2026-11-26).

    python3 tools/wl-hero-assemble.py <extension.png> <close-shot.png> <out.png>

Why: people in a wide 21:9 render get small faces that the model smooths ("pure
ai slop", user). A square 4K render where the couple is big keeps real faces;
Magnific Expand (magnific-expand, 30 credits) then paints the empty left side.
Expand returns about half the asked size and re-colours the source a little, so:
the extension is scaled to the final height and colour-matched row by row to the
original; fine grain is added to match; the original close shot goes back over
the right with a soft seam, its film vignette lifted at its left edge; and in the
sky the large-scale brightness across the join is replaced by a straight blend
(grain and detail stay). Output 4016x1886 -> site/assets/images/weight-loss/v4-run.webp.

The renders stay in the MEDARO Magnific project, not in git.
Needs: pip install pillow numpy scipy
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

wide_p, sq_p, out_p = sys.argv[1:4]
x0w, sidew = 1536, 1360                 # where the square sits in the extension (measured)
H = 1886
wide = Image.open(wide_p).convert('RGB')
k = H / wide.size[1]
Wout = round(wide.size[0] * k)
x0 = round(x0w * k)
ext = np.asarray(wide.resize((Wout, H), Image.LANCZOS)).astype(float)
sq = np.asarray(Image.open(sq_p).convert('RGB').resize((H, H), Image.LANCZOS)).astype(float)
side = Wout - x0
sq = sq[:, :side] if side < H else sq
print('canvas', Wout, H, 'square at', x0, 'side', side)

# colour: per-row difference between the original and the extension over the square's left strip
strip = 260
d = sq[:, :strip].mean(1) - ext[:, x0:x0 + strip].mean(1)          # (H, 3)
d = np.stack([ndimage.gaussian_filter1d(d[:, c], 40, mode='nearest') for c in range(3)], 1)
ext[:, :x0 + strip] += d[:, None, :]
print('row colour shift (mean abs)', np.abs(d).mean(0).round(2))

# grain: the original's fine noise in the sky vs the upscaled extension's
def hp(a):
    return a - ndimage.gaussian_filter(a, (2, 2, 0))
g_sq = hp(sq[60:600, 40:400]).std()
g_ex = hp(ext[60:600, 200:900]).std()
add = max(g_sq ** 2 - g_ex ** 2, 0) ** 0.5
rng = np.random.default_rng(7)
noise = rng.normal(0, add, ext.shape[:2])[..., None] * np.array([1.0, 1.0, 1.0])
noise = ndimage.gaussian_filter(noise, (0.6, 0.6, 0))
ext[:, :x0 + strip] += noise[:, :x0 + strip] * (add / max(noise.std(), 1e-6))
print('grain std original', round(g_sq, 2), 'extension', round(g_ex, 2), 'added', round(add, 2))

# the square has a film vignette: its sky darkens towards its own left edge, the extension doesn't.
# Lift the square's left edge to the extension's level (fading out over 500px, before her hair at ~547px),
# then blend it in over a soft seam.
left = ext[:, x0 - 220:x0 - 20].mean(1)
right = sq[:, 20:220].mean(1)
dv = np.stack([ndimage.gaussian_filter1d((left - right)[:, c], 30, mode='nearest') for c in range(3)], 1)
span = 500
t = np.clip(np.arange(span) / span, 0, 1)
w = 1 - (t * t * (3 - 2 * t))
sq = sq.copy()
sq[:, :span] += dv[:, None, :] * w[None, :, None]
print('vignette lift (mean abs)', np.abs(dv).mean(0).round(2))

feather = 160
alpha = np.clip(np.arange(side) / feather, 0, 1)
alpha = (alpha * alpha * (3 - 2 * alpha))[None, :, None]
out = ext.copy()
out[:, x0:x0 + side] = alpha * sq + (1 - alpha) * ext[:, x0:x0 + side]

# the extension copied the square's vignette into its last ~250px, so the sky dips across the join.
# In the sky only, replace the large-scale brightness between two clean columns with a straight blend;
# grain and fine detail stay. Ends 147px before her hair; fades out towards the horizon.
xa, xb = x0 - 560, x0 + 400
low = np.stack([ndimage.gaussian_filter(out[..., c], 40) for c in range(3)], -1)
t = ((np.arange(xa, xb) - xa) / (xb - xa))[None, :, None]
target = low[:, xa:xa + 1] * (1 - t) + low[:, xb - 1:xb] * t
ys = np.arange(out.shape[0])
wy = np.clip((1050 - ys) / 200, 0, 1)[:, None, None]
out[:, xa:xb] += wy * (target - low[:, xa:xb])
Image.fromarray(np.clip(out + 0.5, 0, 255).astype(np.uint8)).save(out_p)
