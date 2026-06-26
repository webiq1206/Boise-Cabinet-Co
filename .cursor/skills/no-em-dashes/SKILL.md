---
name: no-em-dashes
description: Enforces a zero em dash policy on all user-facing content. Use whenever creating or editing any page, route, blog post, service page, location page, landing page, FAQ, metadata, UI copy, email copy, toast messages, error strings, or any text that ships to users. Scans for and removes em dashes before finishing.
---

# No Em Dashes

No webpage, post, etc should EVER contain em dashes whatsoever!

This rule applies to every user-facing string: page body copy, headings, metadata (title, description, OG tags), CTAs, FAQs, alt text, schema text, blog posts, component UI labels, toasts, and error messages.

## What counts

**Forbidden:** Unicode character U+2014 (the em dash).

Also forbidden: the HTML entity for em dash, the numeric entity for em dash, and any other encoding that renders an em dash.

## What is allowed

- Hyphen-minus `-` in compound words (`AI-powered`, `follow-up`)
- En dash (U+2013) only when required for ranges (`2024-2025`, `pages 10-15`)
- Regular punctuation: commas, colons, semicolons, parentheses, periods

When unsure, prefer a comma, colon, period, or parentheses over any dash variant.

## Replacement guide

| Em dash use | Replace with |
|-------------|--------------|
| Parenthetical aside | Commas or parentheses |
| Introducing a list or explanation | Colon |
| Breaking two independent clauses | Period or semicolon |
| Attribution or source | Comma or parentheses |
| Dramatic pause | Comma or restructure the sentence |

**Before:** `Speed matters - buyers leave after five minutes.` (using an em dash between clauses)  
**After:** `Speed matters. Buyers leave after five minutes.` or `Speed matters, because buyers leave after five minutes.`

**Before:** `Three steps - respond, qualify, book.` (using an em dash before a list)  
**After:** `Three steps: respond, qualify, book.`

## Workflow

1. **While writing:** Never insert an em dash. Choose an alternative from the table above.
2. **Before finishing:** Scan every file you touched for em dashes.
3. **If found:** Replace with the best alternative and re-read the sentence for natural flow.
4. **Do not ship** until the scan is clean.

## Pre-publish check

Run from the repo root on paths you changed:

```bash
rg $'\u2014|&mdash;|&#8212;' path/to/changed/files -g '*.{tsx,ts,jsx,js,json,md,mdx,html}'
```

Or scan common user-facing directories:

```bash
rg $'\u2014|&mdash;|&#8212;' app/ src/ pages/ components/ content/ data/ public/ -g '*.{tsx,ts,jsx,js,json,md,mdx,html}'
```

Exit code 0 with no matches in user-facing paths means the check passed. Fix any hits before considering the work done.

## Checklist

- [ ] No em dash characters in new or edited user-facing copy
- [ ] No em dash HTML or numeric entities in JSX, HTML, or metadata
- [ ] Scan on changed paths returns zero matches
- [ ] Sentences still read naturally after replacement
