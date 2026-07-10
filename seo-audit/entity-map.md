# Entity Map & Knowledge Graph - Boise Cabinet Co

## Entities
- **Organization** - Boise Cabinet Co (LocalBusiness on home + /about; now `@id: /#organization` / `/#localbusiness`). Strong central node; NAP in `SITE_CONFIG`. **Missing (now fixed): logo.**
- **Service/Room entities** - 13 rooms `/cabinets/[room]` (Service schema); 1 collection (thin); 6 door styles; 299 finishes; 382 products (noindex).
- **Location entities** - 8 cities as `/guides/[city]` + Treasure Valley master. No room x city pages. Garden City claimed in schema but no page.
- **Team entities** - **3 members, all placeholders (name == role), 0 Person entities.** Owner "Nick" named in code, hidden from site. **Biggest knowledge-graph gap.**
- **Project entities** - `caseStudies.ts` (slug/city/service) but **no `/projects/[slug]` route** - rendered only on homepage.

## Relationship graph (X = exists in DATA but not rendered as a link)
```
                    ORGANIZATION (Boise Cabinet Co)
                    /#organization  /#localbusiness
             __________|________________|__________
            |                                       |
      TEAM (3)  X no names/Person            LOCATIONS (8 cities = /guides/[city])
                                                     | footer (city->org only)  X city->room
   SERVICE / ROOM ENTITIES  /cabinets/[room] (13)  <-'
      | products Y   | guide Y(1)   X finish   X sibling   X blog-cluster   X reviews
      v              v
   PRODUCTS(382)   GUIDES(17) -> RelatedPostCards Y -> BLOG(56) -> category hubs
   noindex
   FINISHES(299)    DOOR STYLES(6)      PROJECTS / CASE STUDIES
   X ->door         X ->finish          data only, NO PAGE (carries city+service)
   X ->room         X ->room
   X ->collection   X ->sibling
```

## Existing / missing / weak relationships
- **Exist:** blog/guide -> related; room -> 1 pillar guide; room -> products; door -> products; city -> org (footer).
- **Missing (data exists, not linked):** finish -> door / room / collection; door -> finish / room / sibling; room -> blog-cluster / sibling / finishes / doors / city; project -> room / city; room <-> city.
- **Weak:** blog/FAQ -> specific room.

## Fixes
1. Give case studies real routes (`/projects/[slug]`) - project -> room -> city -> finish links.
2. Render the finish<->door<->collection<->room links (helpers already compute them).
3. Add named team -> Person schema (E-E-A-T + graph).
4. Register finishes/doors into the internal-link system so they earn contextual inbound links.
5. Update the stale `SEO-AUDIT-INVENTORY.md` (documents a defunct remodeling architecture).
