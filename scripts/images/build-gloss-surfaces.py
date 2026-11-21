"""Gloss surfaces for the drawn door (owner, 21 November 2026: "the gloss
images look terrible with the 2 tone and abstract shapes... make them all
actually look like gloss").

The supplier draws every gloss sample with a painted reflection: a lighter
lower-left triangle, an arc or a corner glow over the real colour. This writes
a clean surface for each gloss sample into
public/images/catalog/finishes/gloss-surface/<file>.webp (480px, the same
geometry as the catalog sample) and <file>-160.webp (the chip), and
shared/catalog/generated/glossSurfaces.ts listing them. The catalog samples
themselves are not changed.

- A solid lacquer becomes its own colour, read from the centre and upper
  right of the sample, where every sample shows the surface.
- A grain sample with a painted arc becomes the arc-free strip of its own
  pixels, mirrored across the width like bookmatched veneer.
- A grain sample with no painted reflection is kept as it is.

The gloss itself is drawn in CSS on the door and the chip (app/finish-picker.css).

Run from the repository root: python3 scripts/images/build-gloss-surfaces.py
(needs numpy and Pillow), then npm run images:blur and npm run images:versions.
"""
import sys, glob, os, json
import numpy as np
from PIL import Image, ImageFilter
src_dir = sys.argv[1] if len(sys.argv) > 1 else 'public/images/catalog/finishes'
out_dir = sys.argv[2] if len(sys.argv) > 2 else os.path.join(src_dir, 'gloss-surface')
os.makedirs(out_dir, exist_ok=True)
X0, X1, Y0, Y1 = 4, 454, 79, 465   # the swatch area inside a 480px catalog sample
report = {}
# Grain samples with a painted arc on the left: the region right of x=340 is
# clean at every height (checked by eye, 21 November 2026). Their surface is
# that strip of the sample's own pixels, mirrored across the width like
# bookmatched veneer. Grain samples without an arc are kept as they are.
ARC_GRAIN = {'gloss-ash', 'gloss-canyon-charcoal', 'gloss-carbone', 'gloss-eucalipto-brown', 'gloss-eucalipto-grey', 'gloss-palisandro-azuro', 'gloss-rovere-grigio'}
STRIP_X = 340

def otsu(v):
    h, edges = np.histogram(v, bins=128)
    c = (edges[:-1] + edges[1:]) / 2
    w0 = np.cumsum(h); w1 = w0[-1] - w0
    m0 = np.cumsum(h * c) / np.maximum(w0, 1); m1 = (np.sum(h * c) - np.cumsum(h * c)) / np.maximum(w1, 1)
    return c[np.argmax(w0 * w1 * (m0 - m1) ** 2)]

files = sorted(f for f in glob.glob(os.path.join(src_dir, 'gloss-*.webp')) if not any(f.endswith(s) for s in ('-160.webp', '-320.webp', '-640.webp')))
for f in files:
    slug = os.path.basename(f)[:-5]
    im = Image.open(f).convert('RGB')
    if im.size != (480, 480): im = im.resize((480, 480), Image.LANCZOS)
    a = np.asarray(im).astype(np.float64)
    sw = a[Y0:Y1, X0:X1]
    lum = sw @ [0.299, 0.587, 0.114]
    big = np.asarray(Image.fromarray(lum.astype(np.uint8)).filter(ImageFilter.GaussianBlur(14))).astype(np.float64)
    huge = np.asarray(Image.fromarray(lum.astype(np.uint8)).filter(ImageFilter.GaussianBlur(40))).astype(np.float64)
    # two clusters on the smoothed brightness: the painted reflection and the surface
    lo, hi = np.percentile(big, 10), np.percentile(big, 90)
    for _ in range(20):
        t = (lo + hi) / 2
        dark = big <= t
        if dark.all() or (~dark).all(): break
        lo2, hi2 = big[dark].mean(), big[~dark].mean()
        if abs(lo2 - lo) < 0.01 and abs(hi2 - hi) < 0.01: break
        lo, hi = lo2, hi2
    light = ~dark
    # texture: how much fine detail is left once the smooth shading is removed
    detail = np.abs(lum - np.asarray(Image.fromarray(lum.astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))).astype(np.float64))
    textured = float(np.median(detail)) > 1.2
    gap = hi - lo
    base_dark = sw[dark].mean(axis=0) if dark.any() else sw.reshape(-1, 3).mean(axis=0)
    if not textured:
        # a solid lacquer: the surface is the colour under the painted reflection
        # The painted reflection sits in the lower left, or as an arc or a
        # corner glow; the centre and the upper right agree on the surface
        # colour in every sample (checked 21 November 2026).
        patch = np.concatenate([sw[10:120, 330:440].reshape(-1, 3), sw[170:230, 195:255].reshape(-1, 3)])
        colour = np.median(patch, axis=0)
        clean = np.broadcast_to(colour, sw.shape).copy()
        kind = 'solid'
    else:
        if slug in ARC_GRAIN:
            strip = sw[:, STRIP_X - X0:]
            tiles, flip, width = [], False, 0
            while width < sw.shape[1]:
                tiles.append(strip[:, ::-1] if flip else strip); width += strip.shape[1]; flip = not flip
            clean = np.concatenate(tiles, axis=1)[:, :sw.shape[1]]
        else:
            clean = sw.copy()
        kind = 'grain'
    # The surface fills the whole file, so no white margin can show at the
    # door's edge when the sample is scaled: the swatch's own edge pixels are
    # carried out to the border.
    out = np.pad(np.clip(clean, 0, 255), ((Y0, 480 - Y1), (X0, 480 - X1), (0, 0)), mode='edge')
    img = Image.fromarray(out.astype(np.uint8))
    img.save(os.path.join(out_dir, slug + '.webp'), quality=90)
    img.resize((160, 160), Image.LANCZOS).save(os.path.join(out_dir, slug + '-160.webp'), quality=88)
    report[slug] = {'kind': kind, 'colour': '#%02x%02x%02x' % tuple(int(v) for v in (np.median(clean.reshape(-1, 3), axis=0)))}
ts = ['// Generated by scripts/images/build-gloss-surfaces.py. Do not edit.',
      '// Catalog gloss sample files that have a clean surface in /images/catalog/finishes/gloss-surface/.',
      'export const GLOSS_SURFACE_FILES: ReadonlySet<string> = new Set([']
ts += ['  %s,' % json.dumps(slug + '.webp') for slug in sorted(report)]
ts += [']);', '']
open('shared/catalog/generated/glossSurfaces.ts', 'w').write('\n'.join(ts))
print(len(report), sum(1 for r in report.values() if r['kind'] == 'grain'), 'grain')
