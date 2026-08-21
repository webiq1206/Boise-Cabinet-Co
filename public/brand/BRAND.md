# Boise Cabinet Co — Brand Kit

Custom Cabinetry · Boise & the Treasure Valley, Idaho · Est. 2020

Part of the Boise trades brand system. The system-wide rules live in
[`../../BRAND-SYSTEM.md`](../../BRAND-SYSTEM.md) — **this file covers only what is specific to Boise Cabinet Co.**

---

## What makes this brand distinct

| | |
|---|---|
| **Accent color** | `#7AAAAA` — Teal |
| **Seal arc** | `CUSTOM CABINETRY` |
| **Seal centre** | `BOISE` / *Cabinet* / `CO` |
| **Wordmark** | `BOISE CABINET` *Co.* |

Everything else — charcoal, bone, both typefaces, the ring geometry, spacing, minimum sizes — is shared
across all five companies.

### Accent contrast

| Pairing | Ratio | Verdict |
|---|---|---|
| `#7AAAAA` on charcoal | 5.19:1 | Passes AA for normal text |
| `#7AAAAA` on bone | 2.37:1 | Decorative only |

The accent appears on the seal's **outer ring and dots**, and on the wordmark's ***Co.*** only.

It reads well on charcoal and acceptably as a soft tint on bone. Usable either way, though the reverse lockups are where it has the most presence. Don't set accent-colored *text* on bone.

---

## Files

```
boise-cabinet-co/
├── svg/
│   ├── seal/      light/  dark/  any/     (8 files)
│   └── wordmark/  light/  dark/           (4 files)
└── png/           same tree, transparent
    ├── seal/…       1024 / 512 / 256 / 128 / 64 px
    └── wordmark/…   2400 / 1200 / 600 / 300 px wide
```

**Naming:** `boise-cabinet-co-{mark}-{ink}[-accent]-{size}`

| Use | File |
|---|---|
| Default, light background | `svg/seal/light/boise-cabinet-co-seal-charcoal.svg` |
| Default, dark background | `svg/seal/dark/boise-cabinet-co-seal-bone.svg` |
| With accent, light | `svg/seal/light/boise-cabinet-co-seal-charcoal-accent.svg` |
| With accent, dark | `svg/seal/dark/boise-cabinet-co-seal-bone-accent.svg` |
| Over a photo | `svg/seal/any/boise-cabinet-co-seal-on-charcoal.svg` |
| Horizontal lockup | `svg/wordmark/light/boise-cabinet-co-wordmark-charcoal.svg` |

---

## Quick rules

- Seal minimum **160px** on screen, **0.75in** in print. Below that use the wordmark.
- Wordmark minimum **600px** wide, **2.5in**.
- Clear space: **8% of seal diameter**; for the wordmark, one cap height of the `B`.
- Over photography, always use an `any/` disc version.
- Never recolor outside charcoal, bone, and `#7AAAAA`.

Full reasoning, typography detail, and known gaps: [`../../BRAND-SYSTEM.md`](../../BRAND-SYSTEM.md).
