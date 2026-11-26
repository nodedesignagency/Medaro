#!/usr/bin/env python3
"""Recolour the illustrated care icons from the Weight Loss lime to another
page's accent (2026-11-26: Men's Health ongoing care in blue).

The Weight Loss set (assets/icons/ongoing/*.webp, one Magnific sheet in our
illustrated style, made in the buttons' lime) is turned in OKLab: every
pixel keeps its lightness step from the lime and its alpha (the cut-through
details stay see-through), and takes the target's hue, its chroma scaled the
same way. So the shading, paper grain and highlights survive; only the
colour changes. No credits spent.

  python3 tools/tint-icons.py SRC.webp OUT.webp [--from #d5e5ad] [--to #a7d5ff]

Needs Pillow and numpy.
"""
import argparse

import numpy as np
from PIL import Image


def srgb_to_linear(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def linear_to_srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - 0.055)


def to_oklab(rgb):
    lin = srgb_to_linear(rgb)
    m1 = np.array([[0.4122214708, 0.5363325363, 0.0514459929],
                   [0.2119034982, 0.6806995451, 0.1073969566],
                   [0.0883024619, 0.2817188376, 0.6299787005]])
    lms = np.cbrt(lin @ m1.T)
    m2 = np.array([[0.2104542553, 0.7936177850, -0.0040720468],
                   [1.9779984951, -2.4285922050, 0.4505937099],
                   [0.0259040371, 0.7827717662, -0.8086757660]])
    return lms @ m2.T


def from_oklab(lab):
    m2i = np.array([[1.0, 0.3963377774, 0.2158037573],
                    [1.0, -0.1055613458, -0.0638541728],
                    [1.0, -0.0894841775, -1.2914855480]])
    lms = (lab @ m2i.T) ** 3
    m1i = np.array([[4.0767416621, -3.3077115913, 0.2309699292],
                    [-1.2684380046, 2.6097574011, -0.3413193965],
                    [-0.0041960863, -0.7034186147, 1.7076147010]])
    return linear_to_srgb(lms @ m1i.T)


def hex_lab(h):
    h = h.lstrip('#')
    rgb = np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)])
    return to_oklab(rgb[None, :])[0]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('out')
    ap.add_argument('--from', dest='src_hex', default='#d5e5ad', help='the colour the icons were made in (Weight Loss lime)')
    ap.add_argument('--to', dest='dst_hex', default='#a7d5ff', help="the new accent (Men's sky)")
    a = ap.parse_args()

    im = Image.open(a.src).convert('RGBA')
    px = np.asarray(im).astype(np.float64) / 255
    rgb, alpha = px[..., :3], px[..., 3:]
    lab = to_oklab(rgb.reshape(-1, 3))

    s, d = hex_lab(a.src_hex), hex_lab(a.dst_hex)
    s_c, d_c = np.hypot(s[1], s[2]), np.hypot(d[1], d[2])
    d_h = np.arctan2(d[2], d[1])

    L = lab[:, 0] + (d[0] - s[0])                        # same lightness step from the accent
    C = np.hypot(lab[:, 1], lab[:, 2]) * (d_c / s_c)      # chroma scaled to the new accent's
    out = np.stack([L, C * np.cos(d_h), C * np.sin(d_h)], axis=1)
    rgb2 = from_oklab(out).reshape(rgb.shape)

    res = np.concatenate([rgb2, alpha], axis=-1)
    Image.fromarray((np.clip(res, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGBA').save(a.out, 'WEBP', quality=90, method=6)


if __name__ == '__main__':
    main()
