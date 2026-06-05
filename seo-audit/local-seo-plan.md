# Local SEO Plan - Boise Cabinet Co

Strategy decision (locked with client): NO standalone city/location doorway pages. Local relevance is achieved by weaving genuine local signals into existing pages plus off-site GBP/citation work.

## NAP consistency

| Field | Current | Action |
|---|---|---|
| Name | Boise Cabinet Co | OK |
| Address | 2283 N Coopers Hawk Ave, Kuna, ID 83634 | Verify; show fully on contact + footer |
| Phone | (208) 555-0100 | PLACEHOLDER - replace via env `NEXT_PUBLIC_PHONE`/`_TEL` |
| Hours | Mon-Fri 7-6, Sat 8-4, Sun closed | Confirm |

Footer currently omits the street address (`components/Footer.tsx`). Add full NAP to footer for sitewide consistency.

## On-site local signals to weave (no new pages)

1. Name the 8 cities (Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, Caldwell) where contextually relevant in hubs, room pages, About, Contact.
2. Reference Ada vs Canyon County (permits/HOA), dry high-desert climate, freeze-thaw, local housing stock (where it affects cabinet material/finish choices).
3. Keep the two existing local guides strong: `treasure-valley-cabinet-guide` (master) + `boise-cabinet-guide` (location), cross-linked from hubs.
4. Complete LocalBusiness schema `areaServed` for all 8 cities (already present) + correct OfferCatalog URLs.
5. Add Contact to primary nav; ensure phone is click-to-call sitewide (present in nav/footer).

## Off-site / GBP (client actions, documented here)

- Claim/optimize Google Business Profile (category: Cabinet maker / Custom furniture; service area: Treasure Valley). Add to `sameAs`.
- Build consistent citations (BBB, Houzz, Yelp, Angi, Nextdoor, local chamber). Match NAP exactly.
- Solicit reviews -> feed real `rating`/`reviewCount` into `BUSINESS_INFO`, enabling AggregateRating + Review schema.
- Add GBP/Houzz/BBB links to footer + `sameAs`.

## Local trust / proof to add

- Real project examples with city names + before/after (testimonials/gallery already city-tagged; add dates/attribution).
- Licenses/insurance specifics (flagged placeholders now; real values before launch).
- Map link on contact (present); optional embedded map.

## Local schema checklist

- LocalBusiness with full PostalAddress, geo, openingHours, areaServed (8 cities), priceRange, telephone, email, sameAs (+ GBP).
- AggregateRating once reviews exist.
- Service schema for design/build/install with correct `/cabinets/*` URLs and `areaServed`.

## What we explicitly will NOT do

- No `/cabinets-in-{city}` or `/services/{slug}/{city}` doorway pages.
- No city-name-swapped near-duplicate templates.
- No thin location pages without unique local proof.

## Success criteria

- Consistent NAP across home, contact, footer, schema, GBP.
- Map-pack eligibility via optimized GBP + citations.
- Local intent satisfied by genuinely local content woven into authoritative pages.
