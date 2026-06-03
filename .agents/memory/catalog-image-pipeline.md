---
name: catalog image pipeline
description: How catalog room/collection hero images are produced and the placeholder gotcha to avoid
---

# Catalog room & collection hero images

Hero images for the homepage room grid and the collections band live under
`public/images/catalog/rooms/` and `public/images/catalog/collections/`. Components
reference only the base `.webp`; Next/Image generates responsive sizes at runtime, so any
hand-built width-suffixed variants are not referenced by code (they only need to match
whatever widths are smaller than the source).

## Placeholder gotcha (the important lesson)
`scripts/seed-catalog-images.mjs` is a *placeholder filler*, not a source of truth. Each slug
is mapped to a best-guess legacy marketing photo, and several of those guesses are wrong-room
(it once shipped a living room for the mudroom, a kitchen island for the pantry, and
near-identical kitchens for all collection tiers).

**Why it matters:** running that script to "restore" images silently reintroduces the
mismatched photos. To fix catalog imagery, generate real per-room / per-tier images and write
them straight to the catalog path, then build webp — do NOT re-run the seeder.

**Guard in place:** the seeder now skips a slug if either its `.webp` or `.png` already
exists, so it can no longer clobber a real asset.

## Manifest vs catalog drift, and never regenerate to mark "generated"
`scripts/build-site-image-manifest.mjs` hand-maintains HARDWARE/ACCESSORIES slug lists that
can drift from the real catalog (`shared/catalog/*.ts`) — the ACCESSORIES list once had only
10 of the catalog's 17 accessories, so 7 catalog items had no manifest entry and went
unverified. `shared/catalog/catalogImages.ts` maps catalog slugs to image filenames (note the
hardware slug→file renames, e.g. `round-knob-nickel`→`knob-round-nickel`); use it as the
source of truth for which image files the app actually requests.

**Why it matters / how to apply:** `verify:images` only checks files that have a manifest
entry, so a complete-looking pass can still leave catalog items showing placeholders. Sync the
generator list to the catalog, but do NOT run the generator to set statuses — it rebuilds the
whole manifest with status:"pending", wiping the existing "generated" flags on rooms/collections.
Edit the manifest JSON in place (flip status + append missing entries) instead.

## sharp is not installed in this environment
`sharp` is declared in package.json but absent from `node_modules` here, so any script that
imports it fails. Use the Nix-provided `cwebp` for PNG->webp (`cwebp -q 82 -resize W 0 in.png
-o out.webp`), or imagemagick `convert`. The seeder now lazy-loads sharp and falls back to
cwebp for this reason.
