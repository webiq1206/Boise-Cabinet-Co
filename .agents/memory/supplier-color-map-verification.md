---
name: Supplier color map verification
description: How BRC catalog finishes map to One Source Cabinets' real published colors, and the rule for the verified flag.
---

# Supplier color map (BRC finishes → One Source Cabinets)

`shared/supplier/productColorMap.ts` maps each Boise Cabinet Co palette finish to a One Source
Cabinets product. The original crosswalk was **fabricated** — it invented Tafisa SKU names
(e.g. "Classic White (CR)", "Daybreak (IS)", "Prélude Crystalite/Isola/Materia" series) that do
**not** exist in One Source's actual catalog. Do not trust those names if they ever reappear.

**Rule (owner):** "nothing fake labeled `verified: true`." Only set `verified: true` when a BRC
finish confidently corresponds to a real One Source color (hue/character + name where applicable).
Unconfirmed entries carry **no** supplier fields (`supplierPanelBrand/Color/Series` omitted) and
`verified: false`, so the UI never surfaces an unconfirmed match.

**Why:** the finishes page publicly claims these supplier products; a wrong claim is a real
integrity/legal problem, not just a data nit.

**How to apply:** the verified flag gates display — `components/catalog/FinishSwatchGrid.tsx` only
shows the supplier label when `mapping.verified && mapping.supplierColorName`.

## One Source's REAL published palette (source of truth)
Scanned from onesourcecabinets.com (matte / gloss / woodgrain pages):
- **Matte** — Tafisa **Lummia "Perfect Matt"**: Calm Sea, Eucalyptus, Carte Blanche, Morning Dew,
  Midnight Sun, Vanilla Orchid, North Wind, Black.
- **Gloss** — One Source gloss line, panel brand NOT published by supplier (leave brand omitted):
  Gloss Tan, Gloss Light Grey, Gloss Dark Grey, Gloss White, Gloss Deep Blue, Gloss Black, Gloss Graphite.
- **Woodgrain** — three partners:
  - **Salt International** (Salt TSV): Canyon Charcoal, Canyon Walnut, Coral Bark, Epic, Coral Sand,
    Eucalipto Grey, Eucalipto White, Olmo Miele (honey elm), Panna, Pecan Scuro (espresso),
    Rockefeller (near-black), Canyon Oak (honey-tan).
  - **Stevenswood**: Evening Notte, Kirsche (cherry), Grey Echo, Morning Fog, Midnight Run,
    Serotina, Ontano, White Zebrine, Alno.
  - **Tafisa Karisma** (wire-brushed oak): Chameleon (cool gray oak), First Class (dark brown oak),
    Free Spirit (light oak), Rhapsody (mid oak), Sheer Beauty (blond peachy oak), Fashionista (dark brown oak).

Door styles (Slab, Shaker, Thin Shaker), Mesa AZ + Colorado Springs CO facilities are all real/correct.
`scripts/build-supplier-color-map.mjs` holds an inline mirror of the map and regenerates the docs
CSVs — keep it in lockstep with `productColorMap.ts` and run it after edits.
