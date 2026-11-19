# Claude Code Project Instructions

## Instant estimate (`/instant-estimate`): framed, never copied

Owner decision, 13 November 2026: the P5 family's central estimator is the
primary pricing call to action on this site.

* There is ONE estimator. It runs on p5homeco.com and this site only frames it:
  `components/estimator/EstimatorFrame.tsx` loads
  `https://p5homeco.com/estimator/embed?brand=cabinet&project=<id>`. Questions,
  pricing, property lookup, QuickBooks, lead delivery and attribution all happen
  there. NEVER copy estimator logic, pricing, questions or QuickBooks code into
  this repository.
* `EstimatorFrame.tsx` is byte-identical across the family sites. Do not edit
  it here; site differences are props. `EstimatorAnalytics.tsx` is this site's
  own: it sends the estimator's events to `track()` and fires the accepted-lead
  conversion on `estimator_completed` only, once per page view.
* CTAs (`shared/ctaCopy.ts`, `shared/instantEstimate.ts`): the header, mobile
  menu and bottom bar say "Instant estimate" and go to `/instant-estimate`
  (`lib/familyBrand.ts` `cta`); buttons inside a page say "Get an instant
  estimate". A room page leads with it only when the estimator can price that
  room (`ROOM_ESTIMATOR_PROJECT`), and links `/instant-estimate?project=<id>`.
  Every other page keeps "Request a quote" to `/estimate`: never send a visitor
  to an estimator that cannot price their project. Wherever the instant
  estimate leads, keep "Request a quote" or the phone beside it.
* Wording. Allowed: "instant estimate", "instant preliminary estimate",
  "preliminary price range", "in minutes", "free", "any time, day or night",
  "no appointment", "no waiting for a callback", "on your own schedule",
  "before you talk to a contractor", "no obligation". Not allowed: calling it a
  quote, bid, final price, firm price or guaranteed price; any promise about
  how fast a person replies; "no contact information required" (the estimator
  asks for name, email and phone before it shows the range); a specific number
  of minutes or seconds; em dashes; "near me"; invented numbers.
  `scripts/lib/prohibitedResponseLanguage.ts` enforces the quote and
  stated-minutes parts; the reply-time patterns there are unchanged.
* Existing tools stay until the owner retires them. `/estimate` (the quote
  request form and its planning wizard), `/estimate/scope`, the homepage
  planning slider, the chat assistant, every form and API route remain mounted
  and working. Only primary CTAs were re-pointed. Do not delete or unmount any
  of them until the owner says the replacement is verified live.
* Guard: `tests/p5-instant-estimate.test.ts` (runs with `tests/p5-*.test.ts`).

## Scope and one total for customers (owner decision, 16 November 2026)

Every customer-facing estimate shows the full scope of work and ONE price (the
range, or a firm total) for the whole project: no line item, unit, category,
division, room, building or allowance price. This covers the framed instant
estimator (enforced on p5homeco.com) and this site's copy of the shared
document estimator (`lib/p5`: `/estimate/scope`, staff-published estimates,
the customer email, PDF and saved links). `customerPresentation()` in
`lib/p5/customerProjection.ts` is the one customer boundary; edit it in
p5-home-co and apply the same change here, then update
`lib/p5/shared-manifest.json`. Internal records, team emails, the
administrative PDF, the admin page, the CRM payload and QuickBooks keep every
price.

Cabinet's planning wizard (`components/estimate/EstimateResultPanel.tsx`)
lists each room as scope with no per-room price; the per-room amounts stay in
the team email. Guard: `tests/p5-instant-estimate.test.ts`.

## One team email per request (owner decision, 17 November 2026)

A request-form submission produces ONE team email, not two. p5homeco.com sends
it: the "New lead" (or "Details added") email in the approved layout. This
site's own team email is the fallback.

* The bridge (`server/services/p5IntakeBridge.ts`) sends `team_alert:
  "confirm"` and `team_notes`, waits up to 30 seconds, and returns
  `{ forwarded, alert }`. `alert` is `sent`, `failed` or `none` exactly as p5
  answered; anything else (an older p5, an HTTP error, a timeout, a thrown
  fetch, bad JSON) is `unknown`. It never throws.
* The decision is `sendTeamEmailAfterBridge()` in
  `server/services/teamEmail.ts`, called inside `after()` by
  `app/api/consultation/route.ts` (request, callback, request with a planning
  range) and `app/api/consultation/details/route.ts` (details or files added).
  `sent`: the shared family inbox gets nothing more from this site; any other
  admin recipient still gets this site's email. Everything else: this site's
  email goes to every recipient, exactly as before. A lead must never end with
  zero team emails, so every doubt sends.
* The shared inbox test is `isSharedFamilyInbox()`: `hello@` at p5homeco.com,
  boisecabinet.co, boiseconstruction.co, boiseremodeling.co, boisehandyman.co
  or boiseadu.co, in any letter case. Today that is this site's only admin
  recipient (`getAdminRecipientEmails`).
* The visitor's response and the customer's confirmation are never gated on
  the bridge. Only the team email waits for it, and only inside `after()`.
  Never `await` the bridge or the team email on the visitor's path.
* `team_notes` (`consultationTeamNotes()`, `detailsTeamNotes()`) carry what
  this site's team email has and the bridge fields do not: the planning
  wizard's range with its per-room amounts, budget and timeline, the property
  lookup (parcel, home size, lot, permitting authority) and the lead dashboard
  link. Plain `Label: value` lines, at most 40 of at most 300 characters. p5
  prints them in its team email and does not store them on the lead. Never
  repeat a field the bridge already sends.
* `team_notes` carry customer-facing figures only. p5's inbox sync copies its
  "New lead" email into HubSpot with the full body, and costs and margins stay
  out of HubSpot (owner rule). Never put a cost, margin, markup, gross profit,
  contingency or overhead number in a note, nor pricing-alert text that names
  a margin (a count of alerts at most). The builders read no such field, and
  `cleanTeamNotes()` leaves out any line that names one (`namesInternalFigure`);
  p5 drops such lines too. Do not reword a figure to get it through.
* The planning range also travels as a structured `estimate` (owner decision,
  13 and 17 November 2026: every estimate a visitor is given becomes a
  customer and an UNSENT estimate in QuickBooks, which p5 creates).
  `consultationSiteEstimate()` in `server/services/teamEmail.ts` builds it and
  the bridge sends it with a Step 1 request only: never a callback, never
  Step 2, never a request without a range.
  * Customer amounts only. `low` and `high` are the range the visitor was
    shown. Several rooms: one line per room, `amount` the middle of that
    room's range, the range said in its `description`; p5 totals the lines.
    One room or no split: no lines, and p5 uses the middle of the range.
    Never a cost, margin, markup, profit, contingency or overhead in any
    field; this site holds none for a planning range, and visitor text that
    names one is left out of titles, descriptions and the label.
  * Never send `verified`. The range comes from the visitor's browser and is
    not recomputed on this server, and p5 reads `verified: true` as "the site
    recomputed it". The type has no such field.
  * The numbers are checked instead: finite, above zero, every low at or
    under its high, the rooms adding up to the total, at most 60 lines, a
    total p5 accepts unverified (at most $500,000). Anything off sends no
    `estimate` at all, and the request itself goes through unchanged. The
    builder never throws.
  * The contract belongs to p5homeco.com (`docs/lead-intake-contract.md`
    there). Guard: `tests/p5-site-estimate.test.ts` (every project, finish
    and size from the real wizard) and the route checks in
    `tests/p5-one-team-email.test.ts`.
* Not covered, because they do not post to the p5 intake: the design pricing
  request, saved estimator sessions and the admin lead manager.
* The document estimator (`lib/p5`, `/estimate/scope`) does post to the p5
  intake, by its own rule: it emails the team itself and says
  `team_alert: "site"`, so p5 sends no second email. See "Document estimator
  leads go to P5" below. It never uses the bridge or `team_alert: "confirm"`.
* Guards: `tests/p5-one-team-email.test.ts` (runs both routes with fakes) and
  `tests/p5-intake-bridge.test.ts`. Never submit a test through the live
  request form: it fires a server-side Meta Lead conversion.

## Document estimator leads go to P5 (owner decisions, 13, 17 and 18 November 2026)

Every project request and every estimate the document estimator
(`/estimate/scope`, shared code in `lib/p5`) takes on this site becomes a P5
lead and a HubSpot deal; a priced estimate also becomes a QuickBooks customer
with an UNSENT estimate. ONE lead per project and ONE team email. Both are a
post to `https://p5homeco.com/api/leads/intake`, built by the shared
`lib/p5/p5LeadIntake.ts` (figures in `lib/p5/documentEstimateFigures.ts`).

* The visitor's unpriced PROJECT REQUEST: the `crm` channel in
  `lib/p5/intakeDeliveryRuntime.ts` (brand-owned) is
  `p5LeadIntakeTransport()`. Form `p5-project-request`, `team_alert: "site"`,
  brand the PRIMARY TEAM the request was routed to (cabinet work is "Boise
  Cabinet Co"; a whole kitchen taken here is "Boise Remodeling Co"), id the
  request's lead key. No price, so nothing goes to QuickBooks.
* The ESTIMATE the team prices and publishes: `syncCrm()` in
  `lib/p5/deliveryAdapter.ts` (brand-owned) calls `forwardEstimateToP5()` with
  brand "Boise Cabinet Co". Form `p5-estimator`, `team_alert: "site"`, an
  `estimate` of kind `document`, and `request_external_id` so it joins the
  request's lead. CUSTOMER AMOUNTS ONLY: never a cost, margin, markup, profit,
  contingency or overhead figure. It throws when P5 does not accept the post,
  so the outbox marks the CRM job for review. The old lead dashboard
  (`LEAD_DASHBOARD_API_URL`) is no longer called from `syncCrm()`.
* The forwarder is loaded inside `syncCrm()` with `await import(...)`, never a
  static import: the shared `tests/p5-intake-reply-to.test.ts` runs the adapter
  in a VM with a fixed dependency list.
* The switch is the existing `P5_CRM_DELIVERY=on`, already set in production
  (owner, 18 November 2026): both paths are live as soon as this code is.
  Without it the `crm` channel is `crm-disabled` and the outbox queues no CRM
  job. Only requests saved since 18 November 2026 are sent
  (`PROJECT_REQUEST_LEADS_SINCE`); `P5_REQUEST_LEADS_SINCE` (an ISO moment)
  brings older ones in on purpose.
* One team email: this site has already emailed the team (the request's own
  `team` channel, the estimate's internal record), which is why both posts say
  `team_alert: "site"`. When an estimate's figures cannot be sent, the lead
  goes without `estimate` and without `team_alert`, and P5 sends its usual
  "New lead" email.
* A synthetic QA record is never posted on either path.
* The canonical review receiver (`lib/p5/canonicalReviewTransport.ts`,
  project_review_v1) is NOT used and stays gated (`INTAKE_RUNTIME_PROOF.crm`).
  Do not wire it back into the runtime.
* Shared files, never edited here: `lib/p5/p5LeadIntake.ts`,
  `lib/p5/documentEstimateFigures.ts`, `lib/p5/manualReview.ts`,
  `lib/p5/submitEndpoint.ts`, `tests/p5-lead-intake.test.ts`. They were copied
  byte for byte from p5-home-co `7e0338c` (five files, not a full sync) and
  their hashes are in `lib/p5/shared-manifest.json`.
* The shared `tests/p5-crm-delivery.test.ts` (copied from p5-home-co
  `36c2602`) tests the keyed lead dashboard code directly and no longer goes
  through this site's `syncCrm()`. Never patch that file here. The lead
  dashboard transport itself stays held by `tests/p5-keyed-crm.test.ts`.
* The contract belongs to p5homeco.com (`docs/lead-intake-contract.md` there:
  `team_alert: "site"`, `p5-project-request`, `request_external_id`).
* Guards: `tests/p5-intake-local-crm.test.ts` (this site's wiring: the runtime
  channel, both bodies, a refused post) and `tests/p5-lead-intake.test.ts`
  (the shared code). Fake fetch only; never post a test to the live intake.

## Publishing to Replit: never approve a DROP

Replit's Republish compares the development database with production and
proposes a migration for the difference. A development database that is behind
makes Replit offer to `DROP TABLE` live tables. On 13 November 2026 this nearly
deleted a real customer estimate on p5homeco.com: the code was pulled and
published without the step below.

Every time, in this order, in the Replit workspace:

1. Pull the latest `main` into the workspace. Redeploy ships the workspace, not GitHub.
2. Run `npm run db:push` against the DEVELOPMENT database, so it matches the drizzle schema in shared/schema.ts.
3. Republish, and read the database step before approving. Approve only "no
   changes" or `CREATE` and `ADD COLUMN` lines you expect.
4. If it shows `DROP` or anything destructive, cancel and stop. Do not publish.

This applies whoever does the pull: a person, Replit's assistant or Claude.
Never run a schema command against the live database. The same checklist is in
`replit.md`, which Replit's assistant reads.

## Interior page refinement (owner approval, 19 November 2026)

Room, location, article and guide pages were refined to the homepage standard,
adapted from boise-remodeling-co. Styles live in `app/interior-refinement.css`
(imported last in `app/layout.tsx`); the homepage layout is untouched.

* **Image alt text is local.** Every content image's alt is "<work> in <city>,
  Idaho: <what the picture shows>", built by `localAlt()` in
  `shared/localAlt.ts`. The work is taken from the description (kitchen
  cabinets, bathroom vanities, built-in cabinets, cabinet finishes, cabinet door
  styles and so on), the city is Boise unless the page passes its own
  (`/locations/[city]` does). Owner direction: no qualifier ("idea",
  "concept", "inspiration", "representative") in or beside an image
  description. New images go through `localAlt()`, never a bare string. Brand
  lockups keep their own alt. Guard: `tests/local-alt.test.ts`.
* **City photographs are distinct.** `/images/areas/<city>.webp` (and its
  `-640` and `-1080` sizes) are eight different photographs from the owner's
  Photo Dump, described in `AREA_HERO_PICTURE` (`shared/cityServiceImages.ts`)
  and in `scripts/generate-blog-image-registry.mjs`. Change a file and change
  both descriptions. The `.png` originals in that folder are the older set and
  are not served.
* **One closing links block.** Room and location pages end with "Keep
  exploring" (`components/marketing/KeepExploring.tsx`): cities and rooms as
  photo cards (a swipe row on phones, balanced rows from tablet up) that keep
  their full anchor text for search, guides and related pages as one list with
  thumbnails, no link shown twice. Do not stack separate "Related cabinet
  pages", "Guides for ..." or "Where we work" lists under it again.
  `.lx-cell` stays `position: relative`: without it the hidden anchor text
  escapes the swipe row and widens the page on phones.
* **FAQ questions keep their spaces.** `AccordionTrigger`
  (`components/ui/accordion.tsx`) wraps the question in one element. The trigger
  is a flex row, and bare text beside the keep-together span dropped the space
  between them ("Do youserve Kuna?").
* **Article headings are whole.** `.guide-section-details[open]
  .guide-section-summary > span` keeps the child combinator; without it the rule
  hid the last words of every article heading.
* **Articles and guides**: quiet header and date line, one "On this page" row
  on phones, downloads and the guide note after the article, one share bar and
  one closing call to action on phones, related pages with their photographs.
  On desktop the reading column and the sticky rail fill the container.
* Door styles and finishes on room pages sit two across on phones
  (`.lx-swatch-grid`).

## Photos, thumbnails and phone lists (owner, 19 November 2026)

* No staged props in a photo: no plants, vases, bowls, baskets, fruit or
  flowers. Books on a bookshelf and clothes in a closet are the subject and are
  fine. The homepage hero video and its poster keep their props by the owner's
  decision (see "Homepage hero video" below). `rooms/kitchen-walnut-mountain.webp`
  and `collections/custom.webp` were replaced with prop-free Photo Dump
  kitchens on 19 November 2026 (same paths; the first is hashed in
  `tests/sam-image-swaps.test.ts`, and the pins were updated with it).
* Door style cards (`CatalogVisualCard.tsx`): a profile diagram is shown whole
  on its charcoal ground (`isProfileDiagram()`), never cropped to fill. A door
  style with a photograph must have photograph variants too: `slab` and
  `thin-shaker` once had diagram `-320/-640` files under a photo base, so
  phones and cards got the diagram.
* Replacing a photo means replacing its variants. `npm run images:variants`
  only writes a `-320/-640/-1080` (or `-640/-1080/-1920`) file that does not
  exist, so an old variant keeps serving the OLD picture to phones. Delete the
  base file's variants first, then run `images:variants` and `images:blur`.
* A changed picture needs its words changed with it: the alt in
  `scripts/generate-blog-image-registry.mjs` (then run it; the registry is
  generated), `imageAlt` in `shared/catalog/roomCategories.ts`, and the entry
  in `data/projects.json` (then `npm run projects:build`). Describe only what
  the picture shows.
* Two city cards never share a picture (`shared/cityServiceImages.ts` files).
* Keep exploring (`components/marketing/KeepExploring.tsx`): every row has a
  thumbnail. A page with no photo of its own is in `STATIC_PAGE_IMAGE`; add a
  new static page there. Card rows are balanced for any count
  (`balancedColumns()`): a count that cannot fill whole rows becomes one swipe
  row, never a short last row.
* Phone lists (below 701px, `app/interior-refinement.css`): the blog and guide
  indexes are compact rows (`lx-blog-card`: 112px photo, topic, title; date,
  excerpt and "Read article" hidden; photo `object-position: 50% 20%` so a
  person's head is never cut off). Card sets are two across (`lx-two-up`, and
  the `/cabinets` room grid). City guides are one-line rows
  (`lx-guide-compact`). The copy stays in the HTML.
* `docs/interior-route-audit.json` pins each interior page's metadata and
  schema code. A deliberate SEO change must update the signature in the same
  commit; it sat stale from #116 until 19 November 2026 with twelve tests red.

## Fourth pass (owner, 19 November 2026)

* **No picture twice among neighbours.** Pictures are compared by what they
  show, not by file name: `shared/generated/imageIdentity.ts` (written by
  `scripts/images/build-image-identity.mjs`, part of `npm run images:blur`)
  holds a difference hash for every base photograph, and `samePicture()` /
  `distinctPictures()` in `shared/imageIdentity.ts` read it. "Related
  resources" under an article or guide (`RelatedPostCards.tsx`) drops a card
  whose photograph is the page's own or another card's. On `/guides` and
  `/blog`, cards within three places of each other never share a picture.
  Guard: `tests/index-card-images.test.ts`. After adding or replacing a
  photograph run `npm run images:blur`.
* **Accessories hero** is the oak drawer stack
  (`/images/blog/kitchen-cabinet-organization-ideas.webp`), not the vertical
  divider render, which shows a utensil jar and is also the Vertical Partition
  card on that page. The accessory product renders under
  `public/images/catalog/accessories` still show staged kitchen items; there is
  no prop-free photograph of those products in the owner's folder.
* **Homepage hero video.** The video and poster in `public/media/cabinet` are
  the owner's original (2026-11-05). The owner reviewed an AI replacement on
  19 November 2026 and chose to keep the original video and poster, props
  included. Do not replace or flag the hero video again unless the owner asks.
* **Door style cards share one image height** (`isDoorStyleImage()` in
  `CatalogVisualCard.tsx`, 4:3 for a photograph and a diagram alike), so titles
  line up across a row.
* **Tablets.** Room page finish swatches are four across from 768px
  (`RoomCatalogShowcase.tsx`); the contact page email address is set at body
  size between 701px and 1023px so it does not break inside the domain; the
  guides index closes with its own bottom padding. A full-page capture shows
  the sticky header row and the bottom bar part way down the page and leaves
  sticky side columns at the top: judge those from viewport captures.

## Replaced photographs get a new URL (19 November 2026)

* `/images` and `/generated` are served `immutable` for a year
  (`next.config.js`), keyed by URL. A photograph replaced under the same file
  name kept its URL, so anyone who had seen the old picture kept seeing it.
  Every file replaced since 1 November 2026 (644, size variants included) now
  goes out as `<path>?v=<content hash>`.
* The list is `shared/generated/imageVersions.ts`, written by
  `npm run images:versions` (`scripts/images/build-image-versions.mjs`), which
  compares each file with `shared/generated/imageHashes.json`. A file that
  changed joins the list and stays; a size variant follows its base. Run it
  LAST after adding or replacing an image: after `images:variants` and
  `images:blur`.
* The version is added only where a URL is handed to the browser:
  `lib/images/staticVariantLoader.ts` (every `next/image`, on the variant it
  picks), `heroImageAttrs()` (src and srcset) and plain `<img>` tags through
  `versionedSrc()` in `lib/images/imageVersion.ts`. Page URLs, sitemaps,
  structured data, Open Graph, alt text, variant lookup and picture identity
  keep the plain path. Do not mark an image `unoptimized` (it skips the loader)
  and do not write a bare `/images`, `/generated` or `/family` path in an
  `<img>`.
* `/media` (the hero video and poster) is not immutable and needs no version.
* Guard: `tests/image-versions.test.ts` (`npm run verify:image-versions`, in
  prebuild).
* **Homepage planning range ids** are made in `ApprovedHome` and passed to
  `KitchenPlanningRange` as `idPrefix`. An id made with `useId()` inside a
  component loaded with `next/dynamic` differs between server and browser and
  fails hydration.
