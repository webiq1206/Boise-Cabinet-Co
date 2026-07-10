# Metadata Map - Boise Cabinet Co

Root title template (`app/layout.tsx`): `%s | Boise Cabinet Co` (home uses absolute). Titles/descriptions flow `lib/seo.ts` -> `lib/page-metadata.ts` -> `lib/catalog-metadata.ts`.

| Page type | Route | Title (pre-brand) | Description | Index |
|---|---|---|---|---|
| Home | `/` | `Boise Cabinet Co \| Custom Cabinets in Treasure Valley` (absolute) | Custom kitchen, bath, storage cabinets for Boise/Meridian/Eagle & the Treasure Valley. Licensed & insured. Free design consultation. | index |
| Blog post | `/blog/[slug]` | `{seoTitle\|\|title}` (brand stripped) | `{metaDescription\|\|excerpt<=157}` | index |
| Guide / city | `/guides/[slug]` | `{seoTitle\|\|title}` | `{metaDescription\|\|excerpt<=157}` | index |
| Room | `/cabinets/[room]` | `{room.name} Cabinets` | `{room.description[:155]}... Custom {room} cabinets from Boise Cabinet Co in the Treasure Valley.` | index |
| Product category | `/products/[category]` | `{Label} Cabinets \| Sizes & Specs` | `Compare {count} {label} configurations ... frameless, soft-close, 299 finishes.` | index |
| Product detail | `/products/[c]/[s]` | `{name} ({dims})` (>60 chars) | `{description} {dims}. Built to order ...` | **noindex,follow** |
| Finish category | `/finishes/[category]` | `{Matte\|Gloss\|Woodgrain} Finishes` | `{CATEGORY_DESC} Browse Boise Cabinet Co {category} finishes.` | index |
| Finish detail | `/finishes/[c]/[s]` | `{name} Cabinet Finish` | `{name} is a {family} {category} finish ... pairings, care, door styles.` | index if `isFinishIndexable`, else noindex |
| Door-style detail | `/door-styles/[s]` | `{name} Door Style` | `{description[:160]}...` | index |
| Collection detail | `/collections/[s]` | `{name}` (double-"Cabinets" bug FIXED) | `{tagline} {description[:120]}...` | index |
| About | `/about` | `About Us` | `Learn about Boise Cabinet Co, Idaho's premier custom cabinet company ...` | index |
| Contact | `/contact` | `Contact Us` | `... free design consultation. Call {phone} ... Serving Boise, Meridian ...` | index |
| Blog index | `/blog` | `Cabinet Design Insights` | `Honest cabinet design advice for Idaho homeowners ...` | index |
| B2B/utility | dealer, installer, search, estimate, finder, compare | per-page | per-page | dealer/installer/search **noindex**; estimate/finder/compare index |

**Issues:** (1) blog/guide titles need a 60-char guard before the 19-char brand suffix. (2) product-detail title >60 chars (mitigated by noindex) - trim dimensions to description. (3) collection double-"Cabinets" - **fixed**. Descriptions/canonicals all pass site-wide.
