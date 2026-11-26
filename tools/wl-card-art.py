#!/usr/bin/env python3
"""
Weight Loss pricing + progress cards: the two card images, made from the raw
Magnific renders (2026-11-25, Nano Banana 2.1, 4K, 3584x4800; the renders stay
in the MEDARO Magnific project, not in git).

    python3 tools/wl-card-art.py vial  <vial-render.png>
    python3 tools/wl-card-art.py lunge <lunge-render.png> <lunge-cutout.png>
    python3 tools/wl-card-art.py care  <care-render.png> <head-enhanced.png> <x> <y> <w> <h>

vial:  the Tirzepatide vial standing on a pale ledge (after the user's
       NAD+ jar-on-a-ledge reference). Rendered on a flat wall close to the
       card colour; here the wall is brought exactly to the card colour
       (--p-mist #E7EADF) with a per-channel gain, highlights rolled off so the
       glass and metal keep their sparkle. Output is opaque: the wall becomes
       the card. The label print is drawn by tools/pack-print.py on this
       image's pixel grid (print-vial-ledge.svg).
       -> site/assets/images/weight-loss/card-vial.webp (1344x1800)

lunge: the couple in a kettlebell lunge (after the user's lunge reference;
       the people from hero V4 as image references). The wall in the render is
       darker sage than the card, so the people come from Magnific's background
       removal and their shadows are lifted off the original floor: the floor's
       brightness divided by the lit floor, thin stray light-stripes closed away,
       kept as black at (1 - ratio) opacity, so on any card colour it multiplies
       like a real shadow. Output has alpha.
       -> site/assets/images/weight-loss/card-lunge.webp

care:  the care section's photo (2026-11-26): a man of about 34 on park
       grass, laughing (Nano Banana 2.1, 4K, 3712x4608). His head was cropped
       (x, y, w, h: 1400 360 1760 1500) and run through Magnific's skin enhancer (faithful); here it
       goes back in place with a soft 60px edge, and the photo is scaled for
       the panel (1800 wide: 2x at 1920).
       -> site/assets/images/weight-loss/care-man.webp

Needs: pip install pillow numpy scipy
"""
import os
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "site", "assets", "images", "weight-loss")
CARD = np.array([0xE7, 0xEA, 0xDF], dtype=float)  # --p-mist, the cards' --color-surface


def soft_gain(rgb, gain, knee=0.86):
    """rgb * gain, with a smooth shoulder above `knee` instead of a hard clip."""
    v = rgb / 255.0 * gain
    over = v > knee
    v[over] = knee + (1 - knee) * np.tanh((v[over] - knee) / (1 - knee))
    return np.clip(v * 255.0, 0, 255)


def vial(src):
    im = Image.open(src).convert("RGB")
    W, H = 1344, 1800  # the render scaled by 0.375 (3584x4800 -> 1344x1800)
    im = im.resize((W, H), Image.LANCZOS)
    a = np.asarray(im).astype(float)
    wall = np.median(a[: H // 10].reshape(-1, 3), axis=0)  # the empty wall above the vial
    out = soft_gain(a, CARD / wall)
    # the shoulder pulls the wall a hair under the card: measure and correct linearly
    wall2 = np.median(out[: H // 10].reshape(-1, 3), axis=0)
    out = np.clip(out + (CARD - wall2), 0, 255)
    print("wall", wall.round(1), "->", np.median(out[: H // 10].reshape(-1, 3), axis=0).round(1))
    path = os.path.join(OUT, "card-vial.webp")
    Image.fromarray(out.astype(np.uint8)).save(path, quality=84, method=6)
    print(path, os.path.getsize(path) // 1024, "KB")


def lunge(src, cutout):
    o = Image.open(src).convert("RGB")
    W, H = o.size
    orig = np.asarray(o).astype(float)
    cut = Image.open(cutout).convert("RGBA").resize((W, H), Image.LANCZOS)
    c = np.asarray(cut).astype(float)
    alpha = c[:, :, 3] / 255.0

    # ---- shadows on the floor
    L = orig.mean(axis=2)
    lit = 238.0  # the sunlit floor, measured (234-241)
    ratio = np.clip(L / lit, 0, 1)
    ys, xs = np.mgrid[0:H, 0:W]
    edge = 3545 + xs * 0.042  # the floor's back edge (the wall above it is not floor)
    ratio[ys < edge + 10] = 1.0
    back = np.clip((ys - (edge + 10)) / 340.0, 0, 1) ** 0.8  # shadows fade in from the back edge, no hard line
    # the dark strip left of the sunlit patch is the room's shade, not theirs
    left = np.clip((xs - 420) / 260.0, 0, 1)
    ratio = 1 - (1 - ratio) * left
    # two thin straight shadow-lines run right across the floor (an off-frame window frame, not
    # theirs): measured per column, centre y = a + b*x. Fill each band from the floor just above
    # and below it, so where it crosses their own shadow the shadow carries on unbroken.
    for a0, b, hw in ((3904, 0.0590, 34), (4321, 0.0679, 36)):
        for x in range(W):
            yc = a0 + b * x
            y0, y1 = int(yc - hw), int(yc + hw)
            top = np.median(ratio[y0 - 10:y0 - 2, x])
            bot = np.median(ratio[y1 + 2:y1 + 10, x])
            t = np.linspace(0, 1, y1 - y0)
            band = top + (bot - top) * t
            keep = alpha[y0:y1, x] > 0.5
            ratio[y0:y1, x] = np.where(keep, ratio[y0:y1, x], band)
    ratio[alpha > 0.5] = 1.0
    # a soft fade at the right and bottom, so the shadows never end on a hard line
    fade = np.clip((W - xs) / 240.0, 0, 1) * np.clip((H - ys) / 200.0, 0, 1)
    ratio = 1 - (1 - ratio) * fade * back
    ratio = ndimage.gaussian_filter(ratio, 2.0)  # lose the film grain in the shadow
    shadow_a = np.clip(1 - ratio, 0, 1)
    shadow_a[shadow_a < 0.012] = 0
    # keep only shadow that touches them: floor marks and stray specks go
    lab, n = ndimage.label(shadow_a > 0.03)
    touch = np.unique(lab[ndimage.binary_dilation(alpha > 0.5, iterations=14) & (lab > 0)])
    keep = np.isin(lab, touch)
    keep = ndimage.binary_dilation(keep, iterations=6)  # keep their soft edges too
    shadow_a[~keep] = 0

    # ---- people over their shadows (the cut-out's own colour)
    a_out = alpha + shadow_a * (1 - alpha)
    rgb = c[:, :, :3] * alpha[..., None] / np.maximum(a_out, 1e-6)[..., None]  # shadow is black
    rgba = np.dstack([rgb, a_out * 255]).clip(0, 255).astype(np.uint8)
    img = Image.fromarray(rgba, "RGBA")

    # crop to the content (people + shadows) with a little air, then scale for the web
    bb = img.getchannel("A").point(lambda v: 255 if v > 6 else 0).getbbox()
    x0, y0, x1, y1 = bb
    img = img.crop((max(0, x0 - 40), max(0, y0 - 40), x1, y1))
    s = 1400 / img.width
    img = img.resize((1400, round(img.height * s)), Image.LANCZOS)
    path = os.path.join(OUT, "card-lunge.webp")
    img.save(path, quality=84, method=6)
    print(path, img.size, os.path.getsize(path) // 1024, "KB")
    # preview on the card colour
    prev = Image.new("RGBA", img.size, tuple(int(v) for v in CARD) + (255,))
    prev.alpha_composite(img)
    return prev


def care(src, head, x, y, w, hh):
    im = Image.open(src).convert("RGB")
    crop = im.crop((x, y, x + w, y + hh))
    h = Image.open(head).convert("RGB").resize((w, hh), Image.LANCZOS)  # the enhancer returns it upscaled
    # the enhancer shifts the colour a few levels (darker, cooler): take its fine detail, the
    # original's colour (low-frequency difference added back), so no patch shows in the sky
    o, e = np.asarray(crop).astype(float), np.asarray(h).astype(float)
    diff = ndimage.gaussian_filter(o - e, sigma=(40, 40, 0))
    h = Image.fromarray(np.clip(e + diff, 0, 255).astype(np.uint8))
    # feathered mask: full inside, fading over 60px to the crop's edges
    m = np.ones((h.height, h.width), dtype=float)
    f = 60
    ramp = np.clip(np.arange(h.width) / f, 0, 1)
    m *= np.minimum(ramp, ramp[::-1])[None, :]
    ramp = np.clip(np.arange(h.height) / f, 0, 1)
    m *= np.minimum(ramp, ramp[::-1])[:, None]
    mask = Image.fromarray((m * 255).astype(np.uint8))
    im.paste(h, (x, y), mask)
    W = 1800
    im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
    path = os.path.join(OUT, "care-man.webp")
    im.save(path, quality=74, method=6)  # under 300 KB
    print(path, im.size, os.path.getsize(path) // 1024, "KB")


if __name__ == "__main__":
    what = sys.argv[1]
    if what == "vial":
        vial(sys.argv[2])
    elif what == "lunge":
        p = lunge(sys.argv[2], sys.argv[3])
        if len(sys.argv) > 4:
            p.convert("RGB").save(sys.argv[4], quality=88)
    elif what == "care":
        care(sys.argv[2], sys.argv[3], *(int(v) for v in sys.argv[4:8]))
    else:
        sys.exit(__doc__)
