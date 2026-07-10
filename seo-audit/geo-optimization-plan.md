# GEO Optimization Plan - Boise Cabinet Co

**AI-search-readiness: PARTIAL, leaning strong.** An AI can already identify and cite the business (entity, location, service area, cost bands, cited-quality content) from raw HTML with correct schema and consistent NAP - well above local-business baseline.

## Strengths (protect)
- **SSR raw HTML** ships core answer text, headings, and FAQ Q&A on every template (verified) - no JS-gated main content.
- **`llms.txt` present + excellent** (`app/llms.txt/route.ts`) with dated 2026 cost bands, city guides, catalog counts, tool links. Keep dates fresh.
- **Entity clarity high** - homepage first paragraph states who/what/where; org schema carries area, contact, hours.
- **NAP identical** everywhere.

## Fixes (to reach a confident "yes")
1. **[HIGH] Door-style detail** - was the weakest (no H1/FAQ/answer). H1 + answer **added**; add 3-5 FAQs + FAQPage.
2. **[HIGH] Finish detail H1** - **added.**
3. **[MED] Quotable numbers** on finish/room/door pages (lead time, warranty term, starting band) as self-contained, dated sentences.
4. **[MED] Comparison tables** - door-style table + custom-vs-stock (decision queries).
5. **[MED] Named team + author entities** (E-E-A-T is a GEO signal) [DATA].
6. **[LOW] Swap the fake `(208) 555-0000` placeholder** - **done** (was a raw-HTML mis-extraction risk).
7. **[FIXED] Org/LocalBusiness logo + linked `@id`** improves entity-graph clarity for AI.

## Raw-vs-rendered (per template)
Home/blog/guide/about = **high**; room/finish = **adequate** (answer + FAQ in raw, low text-to-markup); door-style = **weak** pre-fix (now improved with H1 + answer). No JS-gated content anywhere.
