---
name: Duplicate/reused image detection
description: How to reliably find a reused stock image across the repo when copies are stored under different filenames, formats, and hashes.
---

When hunting a single reused stock photo across `public/images`, do NOT trust filenames or raw file hashes alone. The same visual can exist as:

- A real `.png` and a `.webp` of it — different raw SHA256 (png bytes != webp bytes), but the png *re-encodes* to the exact webp. To match a webp-content target, re-encode each png to webp at the same quality and compare hashes (e.g. `sharp(png).webp({quality:82}).toBuffer()`), not the raw png bytes.
- Byte-for-byte copies under a different name created by the blog registry's `copyFrom` (`BLOG_ASSET_COPY_MAP`) — these share the source's raw hash but render under a different slug.

**Why:** A flatlay reused ~a dozen times was stored as `process-design-review.*` AND as a separate real png `choose-remodeling-contractor-boise.png` whose webp encoded to the identical content. A raw-hash sweep missed the png and nearly left the flatlay live on the guide + content-hub heroes.

**How to apply:** Sweep by content. Decode-and-re-encode pngs before comparing to a webp-content target. Check both `BLOG_IMAGE_REGISTRY[*].hero` and `HUB_HERO_IMAGES`, and resolve `copyFrom` sources. Blog heroes are served as raw `.png` by `staticVariantLoader` (blog dir is NOT a `build-image-variants` target, so blog paths are absent from `IMAGE_VARIANTS`); the sibling `.webp`/-640/-1080 are legacy/unused but should still be regenerated from the png so stale content does not linger.
