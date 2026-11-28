#!/usr/bin/env python3
"""
The Quad 4 ampoule on its own, in the Men's Health blue (Men's Health landing →
The science behind Quad 4, 2026-11-25): our clear ampoule render, unchanged in
shape and light, with the blue of the hand-held ampoule above it ("Use the same
bottle design but i want this type of blue color in it").

    python3 tools/blue-ampoule.py [--preview out.png]

Reads  site/assets/images/products/ampoule-quad4.webp       (406×2200, clear glass cut-out)
Writes site/assets/images/products/ampoule-quad4-blue.webp  (406×2200, blue see-through glass)

How: the clear glass is seen on the page colour B (the Men's blue paper,
#EDF2F8) and each pixel's lightness L is mapped onto the hand ampoule's blue,
measured on the same paper: its body (92, 176, 210) where the clear body sits
(L ≈ 150), deeper towards the dark rims, paling to white in the reflections
and the neck ring. The result is split back into a cut-out on B, like
tools/unmix-glass.py: the least opacity a that gives the colour on B,
    a = max over channels of (B - T) / B if darker, (T - B) / (255 - B) if lighter
    F = B + (T - B) / a
so the page shows through the glass (about 60% blue in the middle of the body,
like the hand's) and the edges stay soft. Print: the white print screened on,
as on the hand's (print-ampoule-quad4.svg, label-ampoule-quad4.js from
tools/pack-print.py).
"""
import argparse
import os

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTS = os.path.join(ROOT, "site", "assets", "images", "products")
B = np.array([237.0, 242.0, 248.0])        # the Men's Health page colour, --p-paper-mh
BODY = np.array([92.0, 176.0, 210.0])      # the hand ampoule's blue body on that paper (measured)
DEEP = np.array([22.0, 118.0, 176.0])      # its darkest rims
L_BODY, L_DEEP = 150.0, 70.0               # the clear render's lightness at its body and its darkest rims


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", help="also write the result on the page colour beside the clear one")
    args = ap.parse_args()

    src = np.array(Image.open(os.path.join(PRODUCTS, "ampoule-quad4.webp")).convert("RGBA")).astype(float)
    a0 = src[..., 3:] / 255.0
    seen = src[..., :3] * a0 + B * (1 - a0)                      # the clear glass on the page
    L = seen @ np.array([0.2126, 0.7152, 0.0722])

    # lightness → blue: deep at the rims, the hand's body blue at the body, white in the reflections
    t_dark = np.clip((L - L_DEEP) / (L_BODY - L_DEEP), 0, 1)[..., None]
    t_light = np.clip((L - L_BODY) / (255 - L_BODY), 0, 1)[..., None] ** 1.5
    T = np.where((L <= L_BODY)[..., None], DEEP + (BODY - DEEP) * t_dark, BODY + (255 - BODY) * t_light)

    # back into a cut-out on B: the least opacity that gives T on the page
    darker = np.where(T < B, (B - T) / B, 0)
    lighter = np.where(T > B, (T - B) / (255 - B), 0)
    a = np.clip(np.maximum(darker, lighter).max(axis=-1, keepdims=True), 1e-4, 1)
    F = np.clip(B + (T - B) / a, 0, 255)
    a = np.where(a0 > 0, a, 0)                                   # nothing outside the render's silhouette
    out = np.concatenate([F, a * 255], axis=-1).round().astype(np.uint8)
    img = Image.fromarray(out, "RGBA")
    dst = os.path.join(PRODUCTS, "ampoule-quad4-blue.webp")
    img.save(dst, "WEBP", quality=92, method=6)
    print(f"{dst}: {os.path.getsize(dst) // 1024} KB")

    if args.preview:
        page = Image.new("RGBA", (406 * 2 + 60, 2200), tuple(int(c) for c in B) + (255,))
        page.alpha_composite(Image.fromarray(src.astype(np.uint8), "RGBA"), (20, 0))
        page.alpha_composite(img, (406 + 40, 0))
        page.convert("RGB").resize((page.width // 2, page.height // 2)).save(args.preview)


if __name__ == "__main__":
    main()
