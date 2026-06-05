# GEO (Generative Engine Optimization) Plan - Boise Cabinet Co

Goal: make the brand maximally understandable and citable by AI systems (Google AI Overviews, ChatGPT, Perplexity, Gemini).

## Can AI clearly answer these today?

| Question | Today | Gap |
|---|---|---|
| Who is the company? | Mostly | Add named people/founder; consistent Organization |
| What do they do? | Yes | Reframe residual remodeling language |
| Where do they operate? | Yes | 8 cities in schema + content |
| Who do they serve? | Yes | Treasure Valley homeowners |
| Why trustworthy? | Weak | No reviews, no credentials, no bios |
| Why different? | Partial | Frameless/custom/299 finishes - but count conflict |

## Defects undermining AI comprehension

1. Finish count conflict (108 vs 299) - AI may surface the wrong number. Standardize to 299.
2. `public/llms.txt` stale: 3 door styles vs 6, no finish count, missing `/construction`, `/compare`, `/resources`. Rewrite.
3. OfferCatalog points to dead `/services/*` URLs - repoint to `/cabinets/*`.
4. No Person/author entities - weakens authority attribution.
5. No AggregateRating - AI has no trust quantifier.

## Actions

1. Rewrite `public/llms.txt`: accurate catalog facts (6 door styles, 299 finishes, 1 custom collection, 13 rooms, 9 product categories), hub URLs, business summary, NAP, service area, key pages.
2. Add a concise, factual "about" summary block on the homepage marked `data-speakable="summary"` (also feeds Speakable schema).
3. Strengthen Organization schema: `knowsAbout`, `founder`/`employee` (Person), `sameAs` (GBP/Houzz/BBB), `slogan`, `areaServed`.
4. Ensure every key fact (service area, finishes count, door styles, lead times, warranty) appears as plain extractable text + structured data.
5. Provide clear definitional answers (frameless vs framed, custom vs stock) in guides for citation.
6. Consistent entity `@id` and naming across all pages.

## Citation-friendly content patterns

- Lead each guide/section with a 1-2 sentence direct answer (Quick Answer blocks already exist).
- Use tables for cost/timeline/comparison (machine-extractable).
- Use unambiguous, factual statements (no marketing fluff in answer blocks).
- Keep FAQs unique per page (avoid duplicate cluster FAQs that dilute extraction).

## Measurement

- Track AI Overview / ChatGPT / Perplexity citations for "custom cabinets Boise", "cabinet company Treasure Valley", "kitchen cabinet cost Boise".
- Validate `llms.txt` reflects live catalog after each catalog rebuild.
