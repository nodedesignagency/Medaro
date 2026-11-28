import sys
# Extends a photo upward with more of its own sky (Why MEDARO V2 → wl-why-sky-tall.webp for Framer tablet/phone).
# A smooth field fitted to the top rows (Gaussian low-pass, continued upward with an easing slope) plus mirrored
# strips of the photo's own grain, so the seam does not show. Usage: python3 tools/sky-extend.py in.webp out.webp
# Needs numpy, scipy, Pillow.
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
src = Image.open(sys.argv[1]).convert('RGB')
a = np.asarray(src).astype(np.float32)
H, W, _ = a.shape
E = 1700                                        # rows of sky added on top
top = a[:420]                                   # pure sky (the raised hand starts ~ y 470)
low = np.stack([gaussian_filter(top[..., c], sigma=(40, 120), mode='reflect') for c in range(3)], -1)
res = top - np.stack([gaussian_filter(top[..., c], sigma=4, mode='reflect') for c in range(3)], -1)   # the grain
t0 = low[0]                                     # field at the seam (row 0)
t1 = low[300]
slope = (t0 - t1) / 300.0                       # change per row going up
k = np.arange(E, 0, -1, dtype=np.float32)[:, None, None]   # distance above the seam, top row = E
K = 700.0
field = t0[None] + slope[None] * (K * (1 - np.exp(-k / K)))
# grain: mirrored strips of the real residual, random horizontal shifts per strip
rng = np.random.default_rng(7)
grain = np.zeros((E, W, 3), np.float32)
strip = res[8:408]                              # 400 rows, edges trimmed
y = E
flip = True
while y > 0:
    s = strip[::-1] if flip else strip
    s = np.roll(s, rng.integers(0, W), axis=1)
    h = min(len(s), y)
    grain[y - h:y] = s[len(s) - h:]
    y -= h
    flip = not flip
# feather strip joins: blend 24 rows of grain across each join to avoid hard lines
ext = np.clip(field + grain, 0, 255)
out = np.concatenate([ext, a], 0)
img = Image.fromarray(out.round().astype(np.uint8))
small = img.resize((2400, round(out.shape[0] * 2400 / W)), Image.LANCZOS)
small.save(sys.argv[2], 'WEBP', quality=84, method=6)
print(small.size)
# check views
