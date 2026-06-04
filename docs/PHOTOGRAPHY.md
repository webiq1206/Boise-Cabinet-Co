# Real Photography Drop-In Guide

This site is **image-first**: every product already renders a generated diagram,
color tile, or placeholder photo. Real photography is a parallel track - when a
real image is ready, **drop the file into the slot below and it replaces the
generated asset with no code change**.

All catalog data flows from `data/catalog.json` -> `scripts/catalog/codegen-catalog.mjs`
-> `shared/catalog/generated/*`. For finishes and cabinets the codegen
auto-detects on-disk photos, so after adding files run:

```bash
npm run catalog:build      # codegen + regenerate SVGs + verify
```

Doors, rooms, accessories, and hardware resolve their paths directly from the
slug at runtime, so those files appear immediately on next build with no codegen
needed.

## File format & quality

- Format: **WebP**, sRGB, optimized (use `npm run images:optimize`).
- Resolution: author at **2x** the displayed size (retina). ~1600px on the long
  edge is plenty for cards; hero/room shots can be larger.
- No supplier/brand watermarks, no stock/web photos. On-brand only.
- Keep the subject centered and consistent so the fixed aspect ratios crop cleanly.

## Production order

Highest visual impact first: **finishes -> doors -> rooms -> accessories**.
Cabinets keep their generated box diagrams (320 SKUs); a real photo is optional
per SKU.

## Slots, naming, and aspect ratios

Slugs come from the generated catalog. To list them:

```bash
npx tsx -e "import {FINISHES,DOOR_STYLES,ROOM_CATEGORIES,ACCESSORIES,HARDWARE_OPTIONS} from './shared/catalog'; \
console.log(FINISHES.map(f=>f.slug))"
```

### 1. Finishes (299) - aspect **1:1**

- Swatch: `public/images/catalog/finishes/{finish-slug}.webp`
- Optional in-room shot: `public/images/catalog/finishes/in-room/{finish-slug}.webp`
- Fallback when absent: generated tile `public/generated/finishes/{finish-slug}.svg`
- Codegen behavior: if `finishes/{slug}.webp` exists on disk, `imagePath` is set
  to it automatically; otherwise it points at the generated tile. **Re-run
  `npm run catalog:codegen` after adding swatches.**

### 2. Door styles (6) - aspect **4:3**

- `public/images/catalog/door-styles/{door-slug}.webp`
- Slugs: `slab`, `three-piece`, `modern-shaker`, `thin-shaker`, `alpha-shaker`, `beta-shaker`
- Fallback when absent: generated profile `public/generated/door-styles/{door-slug}.svg`
- (Path comes from the `image` field in `data/catalog.json`; keep filenames in sync if you rename.)

### 3. Rooms (8) - aspect **3:2**

- `public/images/catalog/rooms/{room-slug}.webp`
- Nav rooms: `kitchen`, `bathroom`, `laundry`, `mudroom`, `home-office`,
  `entertainment`, `built-ins`, `pantry`
- This is the room `heroImage`; the same file feeds the estimator project picker.

### 4. Accessories (6) - aspect **1:1**

- `public/images/catalog/accessories/{accessory-slug}.webp`
- Slugs: `rollout-tray`, `trash-pullout`, `lazy-susan`, `blind-corner`,
  `partition`, `floating-shelf`

### 5. Cabinets (320) - aspect **3:4** (keep diagrams)

- Default: generated box diagram `public/generated/cabinets/{cabinet-slug}.svg`.
- Optional real photo: set the cabinet's `boxImage` in `data/catalog.json` to a
  path under `/generated/...` or `/images/catalog/...` and place the file there,
  then re-run `npm run catalog:build`. Most SKUs should stay as diagrams.

### Hardware (13) - aspect 4:3

- `public/images/catalog/hardware/{hardware-slug}.webp`

## Verifying after a drop

```bash
npm run catalog:visuals:verify   # confirms every bound asset exists on disk
npm run catalog:images:verify    # reports how many slots still use generated art
```

`catalog:images:verify` is a progress tracker (it warns, never fails the build),
so you can watch the count of real photos climb as the shoot progresses.
