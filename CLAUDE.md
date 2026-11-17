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
* Not covered, because they do not post to the p5 intake: the design pricing
  request, saved estimator sessions, the admin lead manager, and the document
  estimator's team email (`lib/p5`, shared code, edited in p5-home-co only).
* Guards: `tests/p5-one-team-email.test.ts` (runs both routes with fakes) and
  `tests/p5-intake-bridge.test.ts`. Never submit a test through the live
  request form: it fires a server-side Meta Lead conversion.

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
