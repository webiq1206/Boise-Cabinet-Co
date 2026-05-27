# Homepage Audit (`/`)

File: `app/page.tsx`

| Field | Value | Status |
|---|---|---|
| Title | "Lawn Care Kuna - Lawn Care, Landscaping & Christmas Lights" (54 chars) | PASS |
| Description | "Professional lawn care, landscaping..." (155 chars) | PASS |
| Canonical | `https://lawncarekuna.com` (no trailing slash) | FIXED (was trailing slash) |
| OG title / description / url | match metadata + canonical | PASS |
| OG image | `/images/lawn-care-kuna-logo.png` 1200x630 declared | LOGGED follow-up: dedicated OG card |
| Twitter card | summary_large_image | PASS |
| H1 | single, contains "Lawn Care" + "Kuna, Idaho" | PASS |
| JSON-LD: LocalBusiness | via generateLocalBusinessSchema() | PASS |
| JSON-LD: Organization | via generateOrganizationSchema() | PASS |
| JSON-LD: FAQPage | hand-built from 6 homepage FAQs | PASS |
| JSON-LD: SpeakableSpecification | targets hero + FAQ section | PASS |
| Internal links | 16+ to /services/* and /areas/* | PASS |
| Hero image alt | descriptive ("Beautiful Idaho lawn...") | PASS |
| LCP image preloaded in layout | PASS |
