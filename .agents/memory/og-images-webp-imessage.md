---
name: OG link-preview images must be JPEG/PNG
description: iMessage showed a blank link card because the Open Graph image was WebP.
---

**Rule:** Any page-specific Open Graph image must be JPEG or PNG (1200x630), never WebP. The site-wide default OG image is still `og-default.webp` — if blank link previews are reported for other pages, that default is the suspect.

**Why:** iMessage/Safari link previews (and some other crawlers) do not render WebP OG images; the /catalog link showed a blank dark card in iMessage until it got a JPEG.

**How to apply:** Pass a page-specific image via the `ogImage` option in the page-metadata builder. The /catalog OG image is the catalog PDF's cover cropped to 1200x630 (`pdftoppm` page 1 + `magick` crop) — regenerate it if the catalog cover changes, it is a static file, not derived at build time.
