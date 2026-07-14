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

# Seed/validate the pipeline offline from captured competitor data:
npx tsx backlink-engine/backfill-seed.ts
```

**Schedule on Replit:** add a Scheduled Deployment (or cron) running `npx tsx backlink-engine/cycle.ts` daily or weekly. Add `AHREFS_API_KEY` to Replit Secrets first (the in-session Ahrefs tools used to build this are not available to a deployed cron).

## Compliance guardrails (built in)

- No paid links, PBNs, link exchanges at scale, or automated mass posting.
- Denylists reject hosting footprints and link farms before they can enter the pipeline.
- Editorial outreach is **drafted, queued, and human-approved** before sending — no unattended send footprint.
- `store.ts` never re-pitches a won or rejected domain (no spammy repeat outreach).
- Relevance-first scoring keeps the profile topically coherent.

## Status & roadmap

**Built and validated (this pass):**
- Competitor discovery + authority benchmarking (live Ahrefs).
- Qualification/scoring engine with denylists — validated on real data (17 qualified / 10 rejected).
- Classification → category + automation + recommended play.
- Personalized outreach drafting.
- Persistent pipeline store + ranked reporting.
- Seeded initial pipeline (`data/pipeline.json`).

**Next (needs a credential or a decision):**
1. **`AHREFS_API_KEY` in Replit Secrets** → flip the live cron cycle on.
2. **Approval dashboard** — a `/admin/backlinks` route to review the ranked pipeline and one-tap approve/reject drafts.
3. **Sender** — wire approved `assisted` drafts to email send (from `SITE.outreachFromEmail`; a dedicated `outreach@` subdomain is recommended to protect primary-domain deliverability).
4. **Auto-submitter** — structured directory/review-profile submission for `auto` items (credential-gated; respects each site's ToS, no CAPTCHA bypass).
5. **Monitoring** — diff our referring domains each cycle to detect **gained/lost** links and competitor velocity; auto-refill the pipeline.
6. **Enrichment** — pull each candidate's ranking keywords for sharper relevance (an extra Ahrefs call per domain).

## The DA 50+ reality

DA is a third-party Moz score, not what Google uses and not directly controllable. The real objective is a **steadily growing profile of authoritative, relevant, editorially-earned links**. The engine optimizes for that; DR/DA/traffic are tracked as directional signals in `authoritySnapshots`. Expect local-parity wins in weeks and authority-tier gains over quarters — sustainably, without penalty risk.
