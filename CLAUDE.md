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
