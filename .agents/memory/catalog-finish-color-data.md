---
name: Catalog finish color data quirk
description: How finish hexColor values behave in the supplier catalog, for any color-family / swatch / filter work.
---

# Finish color data quirk (supplier catalog)

When deriving anything from a finish's `hexColor` (color-family chips, light/dark tone,
swatch fallbacks):

- **Whites are a warm off-white, not pure white.** The catalog whites all share
  `#F2EFE9` (HSL lightness ~0.93, saturation ~0.26). Classifying "Whites" by *low
  saturation* misses them entirely — they read as warm/cream. Key Whites off
  **lightness** (e.g. `l >= 0.86`), not saturation.
- **hexColor is a shared, approximate value per color group**, not per-SKU. Many
  differently-named finishes share the exact same hex (e.g. every white = `#F2EFE9`,
  every tan/beige = `#D8CFC0`). Do not assume hex uniqueness.
- **The library is woodgrain-heavy.** Of ~299 finishes, ~191 are woodgrain. Always
  bucket woodgrain → "Woods" by `category` before touching hex, or Woods will swamp
  every hue bucket and tone skews dark.

**Why:** color-family classification silently produced zero "Whites" until the
threshold was switched from saturation-based to lightness-based against the real data.

**How to apply:** validate any new hex-derived classifier against the real
`shared/catalog/generated/finishes.ts` (all ~299), not the smaller
`data/supplier-catalog/finishes.json` subset — counts differ.
