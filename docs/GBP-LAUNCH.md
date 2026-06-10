# Google Business Profile Launch Kit - Boise Cabinet Co

Implementation-ready copy and settings for creating the GBP. After verification,
set `NEXT_PUBLIC_GBP_URL` so the site emits the profile in `sameAs` schema and UI
trust badges (`shared/siteConfig.ts`).

## Profile settings

| Field | Value |
|---|---|
| Business name | `Boise Cabinet Co` (exactly; matches LLC and site - no keywords appended) |
| Business type | Service-Area Business (hide address) |
| Address on file | Meridian, ID (for verification only; do not display) |
| Service areas | Boise ID, Meridian ID, Eagle ID, Nampa ID, Kuna ID, Star ID, Middleton ID, Caldwell ID, Garden City ID |
| Phone | (208) 477-1169 |
| Website | `https://boisecabinet.co/?utm_source=gbp&utm_medium=organic&utm_campaign=profile` |
| Appointment link | `https://boisecabinet.co/contact?utm_source=gbp&utm_medium=organic&utm_campaign=appointment` |
| Hours | Mon-Fri 7:00 AM - 6:00 PM, Sat 8:00 AM - 4:00 PM, Sun closed |
| Opening date | 2017 |

## Categories

- Primary: **Cabinet maker**
- Secondary: Cabinet store, Kitchen remodeler, Bathroom remodeler, Carpenter

## Business description (744 chars, fits the 750 limit)

> Boise Cabinet Co designs, builds, and installs custom frameless (European-style)
> kitchen cabinets, bathroom vanities, and built-in storage for Boise, Meridian,
> Eagle, Nampa, Kuna, Star, Middleton, and Caldwell. Founded in 2017, we offer
> 299 cabinet finishes and six door styles, all built to order with soft-close
> hardware and backed by a limited lifetime workmanship warranty. Every project
> starts with a free in-home design consultation, a written scope before
> fabrication, and one accountable team from first sketch to final walkthrough.
> Homeowners track design approvals, timelines, and installation through a
> dedicated client portal. We handle Ada and Canyon County projects with local
> permit and schedule expertise. Request your free consultation today.

## Services (map 1:1 to site URLs)

| GBP service | Description (300 char max) | Landing URL |
|---|---|---|
| Custom kitchen cabinets | Built-to-order frameless kitchen cabinets: base runs, uppers, pantries, islands, and appliance panels designed as one coordinated system for Treasure Valley homes. | /cabinets/kitchen |
| Bathroom vanities | Custom vanity cabinets engineered for moisture resistance, with grooming drawer storage and hamper pull-outs, matched to your tile and stone selections. | /cabinets/bathroom |
| Closet systems | Custom closet cabinets and organizers sized to your space, from reach-in upgrades to full primary suite systems. | /cabinets/closet |
| Pantry cabinets | Walk-in and reach-in pantry systems with adjustable shelving, appliance garages, and pull-out storage. | /cabinets/pantry |
| Garage storage cabinets | Durable garage cabinet systems that stand up to tools, gear, and Idaho temperature swings. | /cabinets/garage |
| Laundry & mudroom cabinets | Folding surfaces, pull-out hampers, bench seating, boot storage, and locker systems built for daily family traffic. | /cabinets/laundry |
| Built-ins & entertainment centers | Window seats, bookcases, media centers, fireplace surrounds, and architectural millwork built to order. | /cabinets/built-ins |
| Home office cabinets | Built-in desks, file drawers, and shelving with integrated cable management. | /cabinets/home-office |
| Outdoor kitchen cabinets | Weather-resistant outdoor kitchen and bar cabinetry for Treasure Valley patios. | /cabinets/outdoor |
| Cabinet installation | Professional installation by our own team, with final walkthrough and lifetime workmanship warranty. | /construction |
| Free design consultation | A 60-90 minute in-home consultation: explore finishes and door styles, get planning guidance and an honest investment range. No pressure. | /contact |

## Products (one per door style, photo + link)

| Product | Link |
|---|---|
| Slab cabinet doors | /door-styles/slab |
| 3 Piece cabinet doors | /door-styles/three-piece |
| Modern Shaker cabinet doors | /door-styles/modern-shaker |
| Thin Shaker cabinet doors | /door-styles/thin-shaker |
| Alpha Shaker cabinet doors | /door-styles/alpha-shaker |
| Beta Shaker cabinet doors | /door-styles/beta-shaker |

## Q&A seeds (post as the business, then answer as the business)

Reuse the homepage FAQ copy verbatim from `shared/homepageFaqs.ts`:

1. What makes Boise Cabinet Co different from other cabinet companies?
2. What kind of cabinets do you build?
3. How long does a custom cabinet project take?
4. What areas do you serve?
5. Do you install cabinets or supply only?
6. What warranty do you provide?
7. What does the free design consultation include?
8. How does pricing work?

## Photos at launch (20+ minimum)

- Before/after kitchen sets from `public/images/gallery/`
- Team photo from the About page
- 6 door style photos (reuse product images above)
- 6-8 finish detail shots (matte, gloss, woodgrain examples)
- Logo (`public/icon-512.png`) and cover image (`public/images/marketing/og-default.webp`)

Name files descriptively before upload, e.g. `custom-kitchen-cabinets-boise-idaho-shaker.jpg`.

## Attributes

- Online estimates: yes
- Onsite services: yes
- Identifies as family-owned / veteran-owned: set only if true

## Post-launch cadence

- 1 GBP post per week: alternate project showcases (city named), guide links, and seasonal tips
- Respond to every review within 48 hours, naturally mentioning service + city
- At 5+ reviews: set `NEXT_PUBLIC_REVIEW_RATING` and `NEXT_PUBLIC_REVIEW_COUNT` so aggregateRating schema emits
- Replicate to Bing Places (import from GBP) and Apple Business Connect with identical NAP

## Legacy listing audit

Before/while creating the GBP, search Google, Yelp, and YellowPages for the
pre-rebrand identity (Boise Remodeling Co, (208) 352-2011, Kuna address). Claim
and correct or remove anything found so the old NAP never conflicts with the
new entity. Note the unrelated "Boise Cabinet Inc" (Garden City, (208) 323-0010)
is a different company; never merge or claim its listings.
