#!/usr/bin/env python3
"""
Weight Loss pricing + progress cards: the two card images, made from the raw
Magnific renders (2026-11-25, Nano Banana 2.1, 4K, 3584x4800; the renders stay
in the MEDARO Magnific project, not in git).

    python3 tools/wl-card-art.py vial  <vial-render.png>
    python3 tools/wl-card-art.py care  <care-render.png> <head-enhanced.png> <x> <y> <w> <h>
    python3 tools/wl-card-art.py plate <landscape-render.png>
    python3 tools/wl-card-art.py couple <couple-render.png> <couple-cutout.png> <heads-enhanced.png> <x> <y> <w> <h>

vial:  the Tirzepatide vial standing on a pale ledge (after the user's
       NAD+ jar-on-a-ledge reference). Rendered on a flat wall close to the
       card colour; here the wall is brought exactly to the card colour
       (--p-mist #E7EADF) with a per-channel gain, highlights rolled off so the
       glass and metal keep their sparkle. Output is opaque: the wall becomes
       the card. The label print is drawn by tools/pack-print.py on this
       image's pixel grid (print-vial-ledge.svg).
       -> site/assets/images/weight-loss/card-vial.webp (1344x1800)

care:  the care section's photo (2026-11-26): a man of about 34 on park
       grass, laughing (Nano Banana 2.1, 4K, 3712x4608). His head was cropped
       (x, y, w, h: 1400 360 1760 1500) and run through Magnific's skin enhancer (faithful); here it
       goes back in place with a soft 60px edge, and the photo is scaled for
       the panel (1800 wide: 2x at 1920).
       -> site/assets/images/weight-loss/care-man.webp

couple: card 2 since 2026-11-27 (the client: no exercise; the user picked
       "close and laughing"): the hero couple standing side by side, laughing,
       in casual clothes, on a pale studio floor (Nano Banana 2.1, 4K,
       3584x4800, words only, the hero render as the only reference). Heads
       through the skin enhancer (1300 560 1100 1150) and put back; the couple
       from Magnific's background removal; their shadows lifted off the sunlit
       floor patch: brightness / the patch's local level (a 361px grey closing,
       so the patch's own edges and the shade around it cancel out), kept as
       black alpha, only where it touches them.
       -> site/assets/images/weight-loss/card-couple.webp

plate: hero V4's background since 2026-11-27 (user: "add landscape behind
       the couple"): the hero render's sky, sun and grain with no people and
       low hazy hills and oaks along the foot (Nano Banana 2.1, 4K, 16:9,
       5504x3072, words only, the hero render the only reference). 320px of
       sky off the top makes it exactly 2:1; scaled to the old plate's size,
       so the couple's cut-out (v4-people.webp) keeps its place in %.
       -> site/assets/images/weight-loss/v4-sky.webp (3600x1800)

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


def paste_head(src, head, x, y, w, hh):
    """The render with a skin-enhanced crop (x, y, w, hh) put back: the enhancer's fine detail with
    the original's colour (it shifts a few levels darker and cooler), feathered over 60px."""
    im = Image.open(src).convert("RGB")
    crop = im.crop((x, y, x + w, y + hh))
    h = Image.open(head).convert("RGB").resize((w, hh), Image.LANCZOS)  # the enhancer returns it upscaled
    o, e = np.asarray(crop).astype(float), np.asarray(h).astype(float)
    diff = ndimage.gaussian_filter(o - e, sigma=(40, 40, 0))
    h = Image.fromarray(np.clip(e + diff, 0, 255).astype(np.uint8))
    m = np.ones((hh, w), dtype=float)
    f = 60
    ramp = np.clip(np.arange(w) / f, 0, 1)
    m *= np.minimum(ramp, ramp[::-1])[None, :]
    ramp = np.clip(np.arange(hh) / f, 0, 1)
    m *= np.minimum(ramp, ramp[::-1])[:, None]
    im.paste(h, (x, y), Image.fromarray((m * 255).astype(np.uint8)))
    return im


def care(src, head, x, y, w, hh):
    im = paste_head(src, head, x, y, w, hh)
    W = 1800
    im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
    path = os.path.join(OUT, "care-man.webp")
    im.save(path, quality=74, method=6)  # under 300 KB
    print(path, im.size, os.path.getsize(path) // 1024, "KB")


def couple(src, cutout, head, x, y, w, hh):
    orig = np.asarray(Image.open(src).convert("RGB")).astype(float)
    H, W = orig.shape[:2]
    rgb = np.asarray(paste_head(src, head, x, y, w, hh)).astype(float)
    cut = np.asarray(Image.open(cutout).convert("RGBA").resize((W, H), Image.LANCZOS)).astype(float)
    alpha = cut[:, :, 3] / 255.0
    edge = (alpha > 0) & (alpha < 0.98)
    rgb[edge] = cut[:, :, :3][edge]  # soft edges (hair) from the cut-out, never the wall behind

    # ---- their shadows, only inside the sunlit floor patch (the shade around it is the room's)
    L = orig.mean(axis=2)
    ys = np.arange(H)[:, None]
    xs = np.arange(W)[None, :]
    lit_px = (L > 228) & (ys > 3700)
    lit_level = float(np.median(L[lit_px]))
    # the patch: the lit floor, closed (their shadows and feet inside it are filled in), holes filled,
    # then pulled 40px in from its soft edge so the edge itself never reads as a shadow line
    m = lit_px.astype(np.uint8)
    m = ndimage.minimum_filter(ndimage.maximum_filter(m, size=301), size=301)
    m = ndimage.binary_fill_holes(m)
    m = ndimage.minimum_filter(m.astype(np.uint8), size=81).astype(float)
    inside = ndimage.gaussian_filter(m, 18)
    ratio = np.clip(L / lit_level, 0, 1)
    ratio[alpha > 0.5] = 1.0
    ratio = ndimage.gaussian_filter(ratio, 2.0)
    shadow_a = np.clip(1 - ratio, 0, 1) * inside
    shadow_a[shadow_a < 0.02] = 0
    lab, n = ndimage.label(shadow_a > 0.04)
    touch = np.unique(lab[ndimage.binary_dilation(alpha > 0.5, iterations=14) & (lab > 0)])
    keep = ndimage.binary_dilation(np.isin(lab, touch), iterations=6)
    shadow_a[~keep] = 0
    fade = np.clip((W - xs) / 240.0, 0, 1) * np.clip((H - ys) / 200.0, 0, 1)
    shadow_a *= fade
    print("lit floor", round(lit_level, 1))

    a_out = alpha + shadow_a * (1 - alpha)
    out = rgb * alpha[..., None] / np.maximum(a_out, 1e-6)[..., None]  # shadow is black
    img = Image.fromarray(np.dstack([out, a_out * 255]).clip(0, 255).astype(np.uint8), "RGBA")
    x0, y0, x1, y1 = img.getchannel("A").point(lambda v: 255 if v > 6 else 0).getbbox()
    img = img.crop((max(0, x0 - 30), max(0, y0 - 30), min(W, x1 + 10), min(H, y1 + 10)))
    Ht = 1400
    img = img.resize((round(img.width * Ht / img.height), Ht), Image.LANCZOS)
    path = os.path.join(OUT, "card-couple.webp")
    img.save(path, quality=82, method=6)
    print(path, img.size, os.path.getsize(path) // 1024, "KB")
    prev = Image.new("RGBA", img.size, tuple(int(v) for v in CARD) + (255,))
    prev.alpha_composite(img)
    return prev


def plate(src):
    im = Image.open(src).convert("RGB")
    W, H = im.size
    im = im.crop((0, H - W // 2, W, H)).resize((3600, 1800), Image.LANCZOS)  # sky off the top: 2:1
    path = os.path.join(OUT, "v4-sky.webp")
    im.save(path, quality=80, method=6)
    print(path, im.size, os.path.getsize(path) // 1024, "KB")


if __name__ == "__main__":
    what = sys.argv[1]
    if what == "vial":
        vial(sys.argv[2])
    elif what == "plate":
        plate(sys.argv[2])
    elif what == "couple":
        p = couple(sys.argv[2], sys.argv[3], sys.argv[4], *(int(v) for v in sys.argv[5:9]))
        if len(sys.argv) > 9:
            p.convert("RGB").save(sys.argv[9], quality=88)
    elif what == "care":
        care(sys.argv[2], sys.argv[3], *(int(v) for v in sys.argv[4:8]))
    else:
        sys.exit(__doc__)
