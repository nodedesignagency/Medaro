#!/usr/bin/env python3
"""
MEDARO pack print: the labels on the client's packs, drawn as vector art and
wrapped onto the blank renders the way real print sits on a cylinder.

    python3 tools/pack-print.py            # writes site/assets/images/products/print-*.svg

Why: a flat label laid over a round vial reads as a sticker ("cheap way to add
the copy and frame", the user, 2026-11-20). Here every word, hairline and tab
is set flat in Host Grotesk (shaped with HarfBuzz, so kerning is the font's),
then each outline point is projected onto the render's cylinder:

    theta = u / R                      u = arc length from the front centre
    x'    = cx + R * sin(theta)        letters crowd together towards the sides
    y'    = ys + k * (ys - eye) * cos(theta)
                                       the camera's perspective: lines below eye
                                       level sag in the middle, lines above arch,
                                       measured from the blank label's own edges

The output SVGs share the render's pixel grid (viewBox = render size) and sit
over it as <img>, so they work from file:// and in Framer. Text is outlines:
no font needed to display them.

Words: the client's, as written on their packs (2026-11-20). Layout: ours, the
pen-label system (DESIGN.md → Direction, rule 6): hairlines, the name in medium,
one solid colour block.

Needs: pip install fonttools brotli uharfbuzz. The font (Host Grotesk, OFL) is
downloaded once into tools/.cache/.
"""
import math
import os
import urllib.request

import uharfbuzz as hb
from fontTools.pens.filterPen import FilterPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "site", "assets", "images", "products")
CACHE = os.path.join(ROOT, "tools", ".cache")
FONT_URL = "https://fonts.gstatic.com/s/hostgrotesk/v5/co3BmWBnlCJ3U42vbbfdwMjZpFjm.woff2"

# Brand colours (site/styles.css, palette A)
INK = "#343B29"     # Dark Olive Green: text on lime
MOSS = "#6B7A45"    # the vial label body: a lighter olive green (user, 2026-11-20: "the green you used is also too dark")
LIME = "#D5E5AD"    # Soft Nude Lime
PAPER = "#F4F5EF"


# ---------------------------------------------------------------- fonts ----
_fonts = {}


def font(weight):
    """Host Grotesk at a fixed weight: (HarfBuzz font, fontTools glyph set, upem)."""
    if weight in _fonts:
        return _fonts[weight]
    os.makedirs(CACHE, exist_ok=True)
    var = os.path.join(CACHE, "host-grotesk-var.ttf")
    if not os.path.exists(var):
        woff2 = os.path.join(CACHE, "host-grotesk-latin.woff2")
        urllib.request.urlretrieve(FONT_URL, woff2)
        f = TTFont(woff2)
        f.flavor = None
        f.save(var)
    path = os.path.join(CACHE, f"host-grotesk-{weight}.ttf")
    if not os.path.exists(path):
        instancer.instantiateVariableFont(TTFont(var), {"wght": weight}).save(path)
    tt = TTFont(path)
    blob = hb.Blob.from_file_path(path)
    hbfont = hb.Font(hb.Face(blob))
    _fonts[weight] = (hbfont, tt.getGlyphSet(), tt["head"].unitsPerEm, tt)
    return _fonts[weight]


def shape(text, weight, size, tracking=0.0):
    """Glyphs and pen positions for one line, in label units. tracking in em."""
    hbfont, glyphset, upem, tt = font(weight)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hbfont, buf, {"kern": True, "liga": True})
    s = size / upem
    order = tt.getGlyphOrder()
    glyphs, x = [], 0.0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        glyphs.append((order[info.codepoint], x + pos.x_offset * s, pos.y_offset * s))
        x += pos.x_advance * s + tracking * size
    width = x - tracking * size  # no tracking after the last letter
    return glyphs, width, s, glyphset


# ----------------------------------------------------------- the wrap ----
class Cylinder:
    """A vertical cylinder seen from the front, as in the render."""

    def __init__(self, cx, r, eye, k):
        self.cx, self.r, self.eye, self.k = cx, r, eye, k

    def __call__(self, pt):
        u, yf = pt
        th = u / self.r
        ys = (yf + self.k * self.eye) / (1 + self.k)  # the line's height at the silhouette
        return (self.cx + self.r * math.sin(th), ys + self.k * (ys - self.eye) * math.cos(th))


class WarpPen(FilterPen):
    """Projects every point; long straight segments are split so they bend."""

    def __init__(self, out, warp, step=4.0):
        super().__init__(out)
        self.warp, self.step, self.cur, self.start = warp, step, None, None

    def moveTo(self, p):
        self.cur = self.start = p
        self._outPen.moveTo(self.warp(p))

    def lineTo(self, p):
        (x0, y0), (x1, y1) = self.cur, p
        n = max(1, int(math.hypot(x1 - x0, y1 - y0) / self.step))
        for i in range(1, n + 1):
            t = i / n
            self._outPen.lineTo(self.warp((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)))
        self.cur = p

    def qCurveTo(self, *pts):
        self._outPen.qCurveTo(*[None if q is None else self.warp(q) for q in pts])
        self.cur = pts[-1] if pts[-1] is not None else self.cur

    def curveTo(self, *pts):
        self._outPen.curveTo(*[self.warp(q) for q in pts])
        self.cur = pts[-1]

    def closePath(self):
        if self.cur is not None and self.start is not None and self.cur != self.start:
            self.lineTo(self.start)
        self._outPen.closePath()
        self.cur = None

    def endPath(self):
        self._outPen.endPath()
        self.cur = None


def fmt(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


class Print:
    """One pack's print. Shapes are given flat: u from the front centre, y as seen at the front."""

    def __init__(self, cyl):
        self.cyl = cyl
        self.layers = []  # (fill, opacity, path data)

    def _pen(self):
        svg = SVGPathPen(None, ntos=fmt)
        return svg, WarpPen(svg, self.cyl)

    def rect(self, u0, y0, u1, y1, fill, opacity=1.0):
        svg, pen = self._pen()
        pen.moveTo((u0, y0))
        pen.lineTo((u1, y0))
        pen.lineTo((u1, y1))
        pen.lineTo((u0, y1))
        pen.closePath()
        self.layers.append((fill, opacity, svg.getCommands()))

    def line(self, u0, u1, y, w, fill, opacity=1.0):
        self.rect(u0, y - w / 2, u1, y + w / 2, fill, opacity)

    def segment(self, a, b, w, fill, opacity=1.0):
        """A straight stroke of width w from a to b (flat coords), square ends."""
        (x0, y0), (x1, y1) = a, b
        d = math.hypot(x1 - x0, y1 - y0)
        nx, ny = -(y1 - y0) / d * w / 2, (x1 - x0) / d * w / 2
        svg, pen = self._pen()
        pen.moveTo((x0 + nx, y0 + ny))
        pen.lineTo((x1 + nx, y1 + ny))
        pen.lineTo((x1 - nx, y1 - ny))
        pen.lineTo((x0 - nx, y0 - ny))
        pen.closePath()
        self.layers.append((fill, opacity, svg.getCommands()))

    def text(self, s, u, y, size, weight=400, fill=LIME, anchor="start", tracking=0.0, opacity=1.0, along=False):
        """One line of text; returns its flat length.
        along=False: across the pack, baseline at height y, starting at u.
        along=True: down the pack's axis, reading top to bottom like the pen labels (the tops of the
        letters face right): baseline at u, starting at height y."""
        glyphs, width, scale, glyphset = shape(s, weight, size, tracking)
        shift = {"middle": width / 2, "end": width}.get(anchor, 0)
        svg, pen = self._pen()
        for name, gx, gy in glyphs:
            if along:  # font x → down the axis, font up → +u
                tp = TransformPen(pen, (0, scale, scale, 0, u + gy, y - shift + gx))
            else:
                tp = TransformPen(pen, (scale, 0, 0, -scale, u - shift + gx, y - gy))
            glyphset[name].draw(tp)
        self.layers.append((fill, opacity, svg.getCommands()))
        return width

    def body_path(self, u0, y0, u1, y1):
        """The path data of a flat rectangle once wrapped (used to clip shading to the label)."""
        svg, pen = self._pen()
        pen.moveTo((u0, y0))
        pen.lineTo((u1, y0))
        pen.lineTo((u1, y1))
        pen.lineTo((u0, y1))
        pen.closePath()
        return svg.getCommands()

    def band_path(self, y0, y1, x_min, x_max, n=96):
        """A band right round the cylinder from y0 to y1 (front heights): its top and bottom edges follow
        the perspective arcs, and its ends run out to x_min / x_max past the silhouette, so no sliver of
        blank paper shows at the sides."""
        r = self.cyl.r
        top = [self.cyl((-r * math.pi / 2 + r * math.pi * i / n, y0)) for i in range(n + 1)]
        bot = [self.cyl((-r * math.pi / 2 + r * math.pi * i / n, y1)) for i in range(n + 1)]
        pts = [(x_min, top[0][1])] + top + [(x_max, top[-1][1]), (x_max, bot[-1][1])] + bot[::-1] + [(x_min, bot[0][1])]
        return "M" + "L".join(f"{fmt(x)} {fmt(y)}" for x, y in pts) + "Z"

    def band(self, y0, y1, fill, x_min, x_max, opacity=1.0):
        self.layers.append((fill, opacity, self.band_path(y0, y1, x_min, x_max)))

    def svg(self, w, h, title, shade=None, clip=None, shade_clip=None, fade=None):
        """shade: (stops) for a horizontal black overlay that darkens the print towards the cylinder's sides,
        clipped to shade_clip (path data) when given, so it never touches the glass around a label.
        fade: (stops) for a horizontal opacity mask on the print instead, for print that is screened onto
        glass: black shading would show as a box where the render is transparent."""
        out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">',
               f"<title>{title}</title>"]
        defs = []
        if shade:
            stops = "".join(f'<stop offset="{o}" stop-color="#000" stop-opacity="{a}"/>' for o, a in shade)
            defs.append(f'<linearGradient id="shade" x1="0" x2="{w}" y1="0" y2="0" gradientUnits="userSpaceOnUse">{stops}</linearGradient>')
        if clip:
            defs.append(f'<clipPath id="clip"><path d="{clip}"/></clipPath>')
        if shade_clip:
            defs.append(f'<clipPath id="shade-clip"><path d="{shade_clip}"/></clipPath>')
        if fade:
            stops = "".join(f'<stop offset="{o}" stop-color="#fff" stop-opacity="{a}"/>' for o, a in fade)
            defs.append(f'<linearGradient id="fade-g" x1="0" x2="{w}" y1="0" y2="0" gradientUnits="userSpaceOnUse">{stops}</linearGradient>'
                        f'<mask id="fade" maskUnits="userSpaceOnUse" x="0" y="0" width="{w}" height="{h}"><rect width="{w}" height="{h}" fill="url(#fade-g)"/></mask>')
        if defs:
            out.append("<defs>" + "".join(defs) + "</defs>")
        attrs = (' clip-path="url(#clip)"' if clip else "") + (' mask="url(#fade)"' if fade else "")
        out.append(f"<g{attrs}>")
        for fill, op, d in self.layers:
            o = f' fill-opacity="{op}"' if op < 1 else ""
            out.append(f'<path fill="{fill}"{o} d="{d}"/>')
        if shade:
            sc = ' clip-path="url(#shade-clip)"' if shade_clip else ""
            out.append(f'<rect width="{w}" height="{h}" fill="url(#shade)"{sc}/>')
        out.append("</g></svg>")
        return "\n".join(out) + "\n"


# ------------------------------------------------------------- the vial ----
# assets/images/products/vial-tirzepatide.webp, 466×1100: a blank white paper
# label on a clear vial, lime flip cap. Label silhouette x 4–461 (centre 232.5,
# R 228.5), front y 398–995; its edges arc by 8px at the top and 27px at the
# bottom, which puts the camera's eye level at y 551 (k 0.0641).
VIAL = Cylinder(cx=232.5, r=228.5, eye=551, k=0.0641)
VIAL_TOP, VIAL_BOT = 398, 995
VIAL_X = (3.5, 462.5)  # the label runs right to the silhouette (paper is opaque to x 4–461, half-covered at 462)
VIAL_TOP, VIAL_BOT = VIAL_TOP - 1.5, VIAL_BOT + 1  # cover the paper's bright cut edge


def vial(variant):
    """The client's MEDARO Tirzepatide vial mock-up, word for word: Injection · Compounded ·
    Tirzepatide · <variant> Vial · RX ONLY. Body in the brand's olive (client: "change the Color
    of the body to the brand Color"). Our layout, the pens' recipe turned across the vial: the row
    above (RX ONLY), hairline, the name band (Compounded in lime over Tirzepatide), hairline, the use
    line (Injection), and the variant on one solid lime block across the foot, a third of the label
    like the pens' dose tab. Even 50-unit steps between rows."""
    p = Print(VIAL)
    L = -152  # content edge, flat (−0.67 rad: still face-on); hairlines run right round
    edge = math.pi / 2 * VIAL.r
    p.band(VIAL_TOP, VIAL_BOT, MOSS, *VIAL_X)
    p.text("RX ONLY", L, 465, 25, 500, PAPER, tracking=0.12, opacity=0.82)
    p.line(-edge, edge, 503, 2.2, PAPER, 0.36)
    p.text("Compounded", L - 1, 583, 40, 400, LIME)
    p.text("Tirzepatide", L - 3, 661, 72, 500, PAPER, tracking=-0.02)
    p.line(-edge, edge, 707, 2.2, PAPER, 0.36)
    p.text("Injection", L, 777, 29, 400, PAPER, opacity=0.82)
    p.band(823, VIAL_BOT, LIME, *VIAL_X)
    p.text(f"{variant} Vial", L, 925, 38, 500, INK, tracking=-0.015)
    # the paper's own shading carries the light (the print multiplies onto it); deepen the far sides a little
    shade = [(0, 0.34), (0.1, 0.12), (0.24, 0), (0.9, 0), (1, 0.1)]
    body = p.band_path(VIAL_TOP, VIAL_BOT, *VIAL_X)
    return p.svg(466, 1100, f"Compounded Tirzepatide, {variant} Vial: label print", shade=shade, shade_clip=body)


def vial_sheen():
    """A satin highlight on the label where the key light (from the right) glances off it,
    laid over the print with screen. Same for every vial label."""
    p = Print(VIAL)
    body = p.band_path(VIAL_TOP, VIAL_BOT, *VIAL_X)
    stops = [(0, 0), (0.62, 0), (0.76, 0.07), (0.835, 0.17), (0.875, 0.2), (0.92, 0.1), (0.97, 0.03), (1, 0)]
    g = "".join(f'<stop offset="{o}" stop-color="#fff" stop-opacity="{a}"/>' for o, a in stops)
    # a faint cool rim on the shadow side, where the backdrop reflects
    r = "".join(f'<stop offset="{o}" stop-color="#e8eedb" stop-opacity="{a}"/>' for o, a in [(0, 0.08), (0.05, 0.03), (0.12, 0)])
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 466 1100" width="466" height="1100">'
            f'<title>Vial label: satin highlight</title><defs>'
            f'<linearGradient id="s" x1="0" x2="466" gradientUnits="userSpaceOnUse">{g}</linearGradient>'
            f'<linearGradient id="r" x1="0" x2="466" gradientUnits="userSpaceOnUse">{r}</linearGradient>'
            f'<clipPath id="c"><path d="{body}"/></clipPath></defs>'
            f'<g clip-path="url(#c)"><rect width="466" height="1100" fill="url(#s)"/><rect width="466" height="1100" fill="url(#r)"/></g></svg>\n')


# ---------------------------------------------------------- the ampoule ----
# assets/images/products/ampoule-quad4.webp, 406×2200: a blank clear glass
# ampoule with a clear, colourless liquid, like the vials' glass (Nano Banana
# 2.1, 2026-11-20, after the user's ampoule references), rendered on one
# plain flat colour, the stage's deep olive. Body x 6–399 (centre 202.5, R 197) from the
# shoulder at y 980 to the base at 2194; the liquid starts at y 1060.
AMPOULE = Cylinder(cx=202.5, r=197, eye=1100, k=0.03)


def ampoule(ink=False):
    """Quad 4 (Men's Health) as a glass ampoule, after the user's references (Rising, SNP, Dr.Melaxin,
    Avon): print straight on the glass, running along the axis. Words: the client's own copy only
    (content/mens-health.md): Quad 4 · Sildenafil · Vardenafil · Tadalafil · Apomorphine · Sublingual ·
    Rx only. Nothing from the competitor's bottle (user, 2026-11-20: "that is competitor details i dont
    want"). Layout: the pen-label system, along the axis: two hairlines the length of the print, the name
    in the band between them, one solid tab at the band's end (Sublingual, knocked out to the glass),
    Rx only in the lane on one side, the ingredients in the lane on the other.
    Colour: paper white, screened onto the clear glass like the Rising and SNP prints (the ampoule is clear
    and colourless like the vials, user: "lets make bottle tone like that like transparent"); faded a
    little towards the shadow side so it sits in the light.
    ink=True: the same print in dark olive ink, multiplied, for the light cards and the menu, where the clear
    glass shows the paper behind it and white print would vanish."""
    p = Print(AMPOULE)
    PAPER_ = INK if ink else PAPER
    KNOCK = "#fff" if ink else "#000"   # what a knocked-out letter is drawn in: invisible under each blend
    top, foot = 1150, 2118          # the print's length down the axis
    band_l, band_r = -62, 64        # the hairlines: the name band between them
    p.segment((band_l, top), (band_l, foot), 2.6, PAPER_, 0.6)
    p.segment((band_r, top), (band_r, foot), 2.6, PAPER_, 0.6)
    # the name, along the band (cap height spans the band's middle)
    p.text("Quad 4", -40, top + 34, 124, 500, PAPER_, tracking=-0.02, along=True)
    # the solid tab at the band's foot end, its word knocked out (black adds nothing under screen)
    tab_top = 1924
    p.rect(band_l, tab_top, band_r, foot, PAPER_, 0.92)
    p.text("Sublingual", -11, tab_top + 26, 32, 500, KNOCK, along=True)
    # the lanes either side
    p.text("Rx only", band_r + 16, top + 4, 31, 500, PAPER_, along=True)
    p.text("Sildenafil · Vardenafil · Tadalafil · Apomorphine", band_l - 40, top + 4, 30, 500, PAPER_, along=True)
    fade = None if ink else [(0, 0.72), (0.2, 0.86), (0.42, 0.97), (0.55, 1), (0.9, 1), (1, 0.9)]
    return p.svg(406, 2200, "Quad 4 ampoule: print on glass" + (" (ink)" if ink else ""), fade=fade)


if __name__ == "__main__":
    files = {
        "print-vial-microdose.svg": vial("Microdose"),
        "print-vial-multidose.svg": vial("Multidose"),
        "print-ampoule-quad4.svg": ampoule(),
        "print-ampoule-quad4-ink.svg": ampoule(ink=True),
        "sheen-vial.svg": vial_sheen(),
    }
    for name, data in files.items():
        with open(os.path.join(OUT, name), "w") as f:
            f.write(data)
        print(f"{name}: {len(data) // 1024} KB")
