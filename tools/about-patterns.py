"""Patterns for the About page's Why MEDARO card (site/sections/about/why.css).

Writes two SVGs into site/assets/images/about/:
  why-contour.svg  topographic lines: closed, gently wobbling loops around a
                   low "hill" near the card's lower right, lime hairlines that
                   fade outwards (after Linear's sweeping hairline curves).
  why-rings.svg    two large overlapping circle outlines low on the card, their
                   overlap hatched with fine diagonals (after Linear's "Practices"
                   circles): you and your provider.
The card shows them over deep olive as <img> (works from file://, goes to Framer
as an image). Run: python3 tools/about-patterns.py
"""
import math
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "site" / "assets" / "images" / "about"
W, H = 600, 1000          # portrait, like the card (about 0.6 : 1)
LIME = "#D5E5AD"


def contour():
    cx, cy = 470, 880     # the hill's centre, lower right
    paths = []
    n = 30
    for k in range(n):
        r0 = 34 + k * 31
        pts = []
        steps = 180
        for i in range(steps + 1):
            t = 2 * math.pi * i / steps
            r = (r0
                 + (10 + k * 0.9) * math.sin(3 * t + k * 0.33)
                 + (7 + k * 0.5) * math.sin(5 * t - k * 0.21 + 1.3)
                 + 5 * math.sin(2 * t + 0.7 + k * 0.12))
            x = cx + r * math.cos(t) * 1.08
            y = cy + r * math.sin(t) * 0.92
            pts.append(f"{x:.1f} {y:.1f}")
        op = max(0.07, 0.42 - k * 0.012)
        paths.append(f'<path d="M{" L".join(pts)}Z" stroke-opacity="{op:.3f}"/>')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice">'
           f'<g fill="none" stroke="{LIME}" stroke-width="1.1" vector-effect="non-scaling-stroke">'
           + "".join(paths) + "</g></svg>")
    (OUT / "why-contour.svg").write_text(svg)


def rings():
    r = 290
    a = (200, 1030)       # left circle, low on the card (anchored to the card's foot)
    b = (450, 975)        # right circle
    hatch = []
    for i in range(-40, 80):
        x0 = i * 14
        hatch.append(f'<path d="M{x0} {H} L{x0 + H} 0"/>')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice">'
           f'<defs><clipPath id="both"><circle cx="{a[0]}" cy="{a[1]}" r="{r}"/></clipPath>'
           f'<clipPath id="other"><circle cx="{b[0]}" cy="{b[1]}" r="{r}"/></clipPath></defs>'
           f'<g clip-path="url(#both)"><g clip-path="url(#other)" stroke="{LIME}" stroke-opacity="0.22" stroke-width="1" vector-effect="non-scaling-stroke">'
           + "".join(hatch) + "</g></g>"
           f'<g fill="none" stroke="{LIME}" stroke-width="1.2" vector-effect="non-scaling-stroke">'
           f'<circle cx="{a[0]}" cy="{a[1]}" r="{r}" stroke-opacity="0.42"/>'
           f'<circle cx="{b[0]}" cy="{b[1]}" r="{r}" stroke-opacity="0.42"/>'
           f'<circle cx="{a[0]}" cy="{a[1]}" r="{r + 26}" stroke-opacity="0.12"/>'
           f'<circle cx="{b[0]}" cy="{b[1]}" r="{r + 26}" stroke-opacity="0.12"/>'
           "</g></svg>")
    (OUT / "why-rings.svg").write_text(svg)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    contour()
    rings()
    print("wrote", OUT / "why-contour.svg", OUT / "why-rings.svg")
