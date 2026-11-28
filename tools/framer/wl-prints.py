#!/usr/bin/env python3
"""
Weight Loss landing → Framer (2026-11-28): the vial label prints with "Vial" alone
in the lime block (client, 2026-11-21: "Just remove the microdose"), for the three
vials the landing page shows: the pricing card's Semaglutide and Tirzepatide vials
and card 1's vial on the ledge.

    python3 tools/framer/wl-prints.py <checkout of claude/youthful-noether-ftr6t5> <out dir>

Uses that checkout's tools/pack-print.py (needs fonttools, brotli, uharfbuzz).
Writes print-vial-tirzepatide-plain.svg, print-vial-semaglutide-plain.svg,
print-vial-ledge-plain.svg. Flatten them with tools/framer/wl-flatten.js.
"""
import importlib.util
import os
import sys

src, out = sys.argv[1], sys.argv[2]
spec = importlib.util.spec_from_file_location("pp", os.path.join(src, "tools", "pack-print.py"))
pp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pp)

# vial("") would set " Vial" (a leading space shifts the word): strip every string
_text = pp.Print.text
pp.Print.text = lambda self, s, *a, **k: _text(self, s.strip(), *a, **k)

files = {
    "print-vial-tirzepatide-plain.svg": pp.vial("", pp.VIAL, drug="Tirzepatide"),
    "print-vial-semaglutide-plain.svg": pp.vial("", pp.VIAL, drug="Semaglutide"),
    "print-vial-ledge-plain.svg": pp.vial("", pp.LEDGE, drug="Tirzepatide"),
}
os.makedirs(out, exist_ok=True)
for name, data in files.items():
    with open(os.path.join(out, name), "w") as f:
        f.write(data)
    print(name)
