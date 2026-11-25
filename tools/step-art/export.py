"""PNG renders (export.js) -> site/assets/icons/step-*.webp and care-*.webp, 768px, transparent."""
import sys, pathlib
from PIL import Image
src, dst = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
for png in sorted(list(src.glob('step-*.png')) + list(src.glob('care-*.png'))):
    im = Image.open(png).convert('RGBA')
    out = dst / (png.stem + '.webp')
    im.save(out, 'WEBP', quality=88, method=6)
    print(out, out.stat().st_size // 1024, 'KB')
