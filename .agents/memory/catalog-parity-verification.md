---
name: catalog parity verification
description: How to actually prove the cabinet catalog is 1:1 with the supplier PDF, and the pdftotext "2 ROT" split gotcha that hides real SKUs.
---

# Catalog 1:1 parity — proving it, not just claiming it

The cabinet catalog (`data/catalog.json`, the single source of truth) must match the
supplier (OSC) PDF exactly. Two things matter:

## 1. Verification must diff against the TRUE source and check exact membership
- `scripts/catalog/diff-pdf-skus.mjs` must diff the PDF extraction against
  `data/catalog.json` codes — NOT against `data/supplier-catalog/cabinetProducts.json`
  (a stale subset). Diffing the wrong file silently hides gaps.
- `scripts/catalog/verify-catalog-integrity.ts` must assert EXACT set equality against
  a committed golden manifest `data/catalog-expected-cabinet-codes.json` (report both
  `missing` and `unexpected`). A count-only check passes even when a code is silently
  substituted.
- The meaningful parity signal is `pdf_only=0` from `catalog:inventory`. `json_only` is
  expected and benign — the catalog carries spec-table / variant SKUs that the
  conservative token extractor (`osc-sku-patterns.mjs`) does not emit as standalone tokens.
- **Why:** an earlier "all green" claim was false — the inventory diff was validating the
  265-SKU stale file, so it could not prove the 380+ catalog matched the PDF.

## 2. pdftotext splits "2ROT" into "2 ROT" — do NOT dismiss it as noise
- In the PDF a rollout count glued to "ROT" (e.g. `FLFH-1D-2ROT`) extracts as
  `FLFH-1D-2 ROT`. The conservative regex then captures the bare prefix `FLFH-1D-2`.
- That bare prefix is the MIDDLE of a real 1ROT/2ROT/3ROT series. Treating it as a
  truncation artifact and excluding it hid two genuinely-missing SKUs
  (`FLFH-1D-2ROT`, `FLFH-2D-2ROT`). They were added; dims identical to sibling
  1ROT/3ROT, attrs = doors + `rollouts:2` + `fullHeight` + `floating`.
- **How to apply:** when a "PDF only" token looks like the middle of a numeric series
  (1/2/3, 0/1/2…), check the surrounding PDF lines for the spaced form before
  denylisting. Only after confirming the real code is in the catalog should the bare
  artifact go in `OSC_SKU_DENYLIST` (exact-token suppression, never broad pattern).

## 3. Dimensions are part of parity, not just codes
- Code membership matching the PDF is NOT enough — the supplier appendix tabulates
  six dims per code (`minW,maxW,minH,maxH,minD,maxD`) and those must match too.
- Golden dims manifest `data/catalog-expected-cabinet-dims.json` is built verbatim
  from the PDF by `scripts/catalog/build-expected-dims.mjs` (a spec row = a code token
  followed by exactly six integers; only codes also in catalog.json are recorded —
  box-identical variants the appendix does not separately list are skipped).
- `verify-catalog-integrity.ts` asserts each catalog cabinet's six dims equal the
  golden manifest. To audit ad hoc, extract via `pdftotext -layout` and diff the six
  trailing ints per row against catalog.json.
- **Why:** a real defect set had 4 wrong heights (`B-2D-2TD-{1,2,3}PART` minH 30 vs PDF
  21; `TBFH-1D-1ROT-2S` minH 21 vs PDF 12) that passed code-membership checks.

## 4. meta is derived — guard against drift
- `data/catalog.json` `meta` (counts + byCategory) is a cache, not authority.
  `scripts/catalog/recompute-meta.mjs` recomputes it from the arrays (preserves
  source/notes). verify now fails if meta diverges from real array counts.
- **Why:** `meta.cabinets` was stale at 320 while the array held 382.

## Generator
- All additive SKU work goes through `scripts/catalog/add-missing-skus.mjs`
  (deterministic, idempotent, dedupes by code), then `codegen-catalog.mjs` +
  `generate-catalog-svgs.mjs`, then regenerate the manifest.
- For correcting fields on records that ALREADY exist (e.g. wrong dims), the additive
  generator won't touch them (it only inserts missing codes). Fix BOTH the literal in
  `add-missing-skus.mjs` AND the committed record in `data/catalog.json` so they stay
  consistent, then re-run codegen+svgs and regenerate manifests.
