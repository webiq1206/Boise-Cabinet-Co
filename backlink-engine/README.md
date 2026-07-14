# Backlink Engine — autonomous, white-hat link acquisition

An automated system that continuously **discovers, qualifies, prioritizes, drafts, and tracks** high-quality backlink opportunities for `boisecabinet.co`, and completes as much of each acquisition workflow as is safe without a human. It runs on Replit alongside the site.

> **The honest scope.** Everything up to the moment a message is *sent* or a form is *submitted in your name* is fully automated. Actual sends/submissions of editorial outreach pass a one-tap human approval gate. That gate is not a limitation — an unattended, discoverable pattern of automated outreach is exactly what devalues links and triggers manual actions. This design is what keeps the profile white-hat while automating ~90% of the labor. Structured, no-judgment submissions (standard business directories / review-platform profiles) are flagged `auto` for hands-off completion by the credential-gated submitter.

## Why it's built this way (the core insight)

We validated against live competitor data (2026-07-14). Two findings drive the whole design:

1. **`is_spam=false` + high Domain Rating is a trap.** Competitor "backlinks" are dominated by hosting/CDN footprints (`squarespace`, `amazonaws`, `netlify`, `blogspot`) and high-DR link farms (`viesearch`, `folkd`, `apsense`). Qualifying on DR alone would fill the pipeline with exactly the junk that risks a penalty. So the **denylist + relevance filter is the core IP** — see `scoring.ts` and the denylists in `config.ts`.
2. **The local field is weak (DR 0–7), but DA 50+ is a different league.** Mirroring local competitors only gets local-pack parity. Real authority requires a layer none of them have. Hence **two engines** (below).

## Two engines

| Engine | Plays | Automation | Impact |
|---|---|---|---|
| **Local parity** | citations, chamber/BBB/Houzz/Angi profiles, curated "best of" lists | mostly `auto` / `assisted` | Local pack + NAP consistency; modest DR |
| **Authority** | digital PR, NKBA/NARI/KCMA associations, supplier/manufacturer links, resource pages, broken-link, unlinked mentions, guest posts on DR40+ design sites, local news | `assisted` / `manual` | The DA-mover toward 50+ |

## Architecture

```
cycle.ts (orchestrator, runs on a schedule)
  ├─ ahrefs.ts      pull authority snapshot + competitor referring/broken links
  ├─ config.ts      profile, competitors, relevance vocab, thresholds, DENYLISTS, seeds
  ├─ scoring.ts     hard-disqualify (denylist/spam/off-topic/site-wide) → 0-100 composite
  ├─ classify.ts    map a qualified domain → category + automation + recommended play
  ├─ outreach.ts    per-category personalized draft (queued, never auto-sent)
  ├─ store.ts       JSON pipeline (data/pipeline.json); never re-pitch won/rejected
  └─ types.ts       shared contracts
```

**Scoring** (quality over quantity): relevance is weighted highest (0.40), then DR (0.30, log-scaled), audience traffic (0.20), link quality (0.10). Hard disqualifiers run first: Ahrefs spam flag, platform/CDN footprint, known link farm, site-wide/footer link pattern, off-topic (for categories where topical fit matters), sub-floor DR, and zombie (DR but no traffic). "Functional" categories (directories, review platforms, associations, curated lists, local news) bypass the keyword-relevance gate — a local business belongs in them regardless of the domain's own keywords.

## Run it

```bash
# One acquisition cycle (needs AHREFS_API_KEY in env / Replit Secrets):
npx tsx backlink-engine/cycle.ts

# Print the current ranked pipeline without hitting the API:
npx tsx backlink-engine/cycle.ts --report

# Find recipient emails for outreach opportunities (polite, capped):
npx tsx backlink-engine/enrich-contacts.ts

# Dispatch items a human approved in /admin/backlinks (dry-run by default):
npx tsx backlink-engine/dispatch.ts

# Seed/validate the pipeline offline from captured competitor data:
npx tsx backlink-engine/backfill-seed.ts
```

**Environment variables (Replit Secrets):**

| Var | Purpose |
|---|---|
| `AHREFS_API_KEY` | Required for live cycles + monitoring |
| `RESEND_API_KEY` | Optional; email transport for approved outreach |
| `BACKLINK_SEND_LIVE` | Set to `true` (with `RESEND_API_KEY`) to actually send; otherwise sender is dry-run |

**Schedule on Replit:** two Scheduled Deployments — `npx tsx backlink-engine/cycle.ts` weekly (discovery + monitoring), and `npx tsx backlink-engine/dispatch.ts` daily (dispatches whatever you approved). Add `AHREFS_API_KEY` first (the in-session Ahrefs tools used to build this are not available to a deployed cron).

## The full loop

```
cycle.ts (weekly)                     dashboard (/admin/backlinks)        dispatch.ts (daily)
 discover + qualify + score  ─────▶  human reviews, one-tap approve  ──▶  send email / prep submission
        ▲                                                                          │
        │ monitor: gained/lost + velocity ◀────────────────────────── link goes live │
        └──────────────────────────────────────────────────────────────────────────┘
```

Monitoring runs inside every cycle: it diffs our referring domains to auto-mark **won**/**lost**, and tracks our + competitors' DR/refdomain **velocity** from the snapshot history.

## Compliance guardrails (built in)

- No paid links, PBNs, link exchanges at scale, or automated mass posting.
- Denylists reject hosting footprints and link farms before they can enter the pipeline.
- Editorial outreach is **drafted, queued, and human-approved** before sending — no unattended send footprint.
- `store.ts` never re-pitches a won or rejected domain (no spammy repeat outreach).
- Relevance-first scoring keeps the profile topically coherent.

## Status & roadmap

**Built and validated:**
- Competitor discovery + authority benchmarking (live Ahrefs).
- Qualification/scoring engine with denylists — validated on real data (17 qualified / 10 rejected).
- Classification → category + automation + recommended play.
- Personalized outreach drafting.
- Persistent pipeline store + ranked reporting + seeded pipeline.
- **`/admin/backlinks` approval dashboard** — one-tap approve/reject, expandable drafts.
- **Sender** (`sender.ts`) — approved outreach via Resend; dry-run unless `BACKLINK_SEND_LIVE=true`.
- **Submitter** (`submitter.ts`) — consistent NAP submission payload + steps for directory/review items.
- **Monitoring** (`monitor.ts`) — auto gained/lost detection + authority velocity, wired into every cycle.
- **Dispatch** (`dispatch.ts`) — processes approved items (send / prep).
- **Contact discovery** (`contacts.ts` + `enrich-contacts.ts`) — scrapes target contact/about pages for the best recipient email (role-based, same-domain, placeholder-filtered), with an info@ fallback.

**Next (needs a credential or is a further enhancement):**
1. **`AHREFS_API_KEY` in Replit Secrets** → flip the live cron on (your move).
2. **`RESEND_API_KEY` + verified sending domain** → turn outreach send from dry-run to live.
3. **Relevance enrichment** — pull each candidate's ranking keywords for sharper topical scoring.

### Compliance line (unchanged and deliberate)

`submitter.ts` never creates accounts, solves CAPTCHAs, or submits forms — it prepares the exact data and a human completes the listing. Editorial outreach is only sent after a human approves it in the dashboard. This is the boundary that keeps the whole system inside Google's guidelines.

## The DA 50+ reality

DA is a third-party Moz score, not what Google uses and not directly controllable. The real objective is a **steadily growing profile of authoritative, relevant, editorially-earned links**. The engine optimizes for that; DR/DA/traffic are tracked as directional signals in `authoritySnapshots`. Expect local-parity wins in weeks and authority-tier gains over quarters — sustainably, without penalty risk.
