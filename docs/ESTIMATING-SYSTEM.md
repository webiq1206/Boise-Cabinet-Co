# Estimating System

One centralized pricing engine, two customer surfaces. This document is the
operating manual for the estimating experience: where pricing lives, how the
guided estimator and the conversational assistant stay numerically identical,
how to test changes, and what to check before launch.

## Architecture

```
Customer input
  ├── Guided estimator (components/estimate/EstimateCalculatorWizard.tsx)
  └── Conversational assistant (components/assistant/AssistantWidget.tsx
      → POST /api/assistant/chat → tool layer in lib/assistant/tools.ts)
              │
              ▼
  Shared structured project data          EstimateSelections[] — persisted in
  (lib/estimate/wizardPersistence.ts)     localStorage `brc_estimate_wizard`,
              │                           read/written by BOTH surfaces
              ▼
  Centralized pricing engine              shared/estimateEngine.ts
              │
              ▼
  Validation layer                        shared/estimateValidation.ts — every
              │                           surface validates before display
              ▼
  Estimate → Lead workflow                POST /api/consultation → CRM leads,
                                          submissions, quotes, emails, Meta CAPI
```

Both surfaces import the same engine module and the same payload builders
(`buildCombinedStoredEstimate`, `buildCombinedConsultationPayload`,
`buildEstimateRecord`), so identical inputs produce identical outputs by
construction. `POST /api/estimate/calculate` exposes the engine to any future
client under the same guarantee.

## Where pricing lives (the single source of truth)

Every dollar figure originates in ONE block:
`shared/estimateEngine.ts`, between the `MODELED TREASURE VALLEY PRICING -
EDIT HERE` and `END MODELED PRICING` markers:

- `PROJECT_PRICING` — installed $/linear-foot bands (base + upper runs) per room
- `DOOR_STYLE_MULTIPLIER`, `FINISH_CATEGORY_MULTIPLIER`,
  `FINISH_TIER_MULTIPLIER`, `CONSTRUCTION_MULTIPLIER`,
  `LAYOUT_COMPLEXITY_MULTIPLIER` — upgrade premiums
- `PRICE_ROUND_TO` — display rounding ($100)

Formula: `round((perUnitLow × baseLF + upperPerUnitLow × upperLF) × multipliers)`.

To tune pricing: edit that block, run `npm run test:pricing`, update the
literal snapshot table in `tests/pricing/estimate-engine.test.ts` to the new
intended values, and commit both together. A snapshot failure without a
matching deliberate pricing edit is a regression.

A DB-backed admin pricing UI was considered and deferred: a single documented
code block plus a regression suite is auditable and safe; a pricing UI without
those guardrails is how silent price drift happens. Revisit if the owner needs
to tune prices without a deploy.

## The AI never invents anything

The assistant (`claude-opus-5` via `@anthropic-ai/sdk`) can only:

- **State prices** returned by its `calculate_estimate` tool — the engine +
  validation layer. The model performs no arithmetic on prices.
- **State business facts** returned by `get_business_info` — topics assembled
  in `shared/assistantKnowledge.ts` exclusively from published site content
  (siteConfig, catalog content, homepage FAQs, process steps, estimator
  disclaimers). To change an answer, edit the underlying source module.
- **Save leads** through `save_lead`, which builds the exact consultation-form
  body (same builders as the wizard) with `source: "assistant"` and the
  conversation transcript, and submits through the one lead ingress
  (`/api/consultation`). Assistant leads appear in the same CRM inbox,
  filterable by the "assistant" source; the transcript renders in the lead
  detail's submission payload.
- **Hand off** via `request_human_handoff` (priority-flagged lead or the
  direct phone line).

Photos are context only — the system prompt forbids deriving measurements or
prices from images, and QA verifies the refusal.

Guardrails: `tests/assistant/tools.test.ts` asserts no dollar figure can enter
through knowledge topics; the system prompt (`lib/assistant/systemPrompt.ts`)
forbids un-tooled numbers, invented promotions, urgency tactics, and recording
selections the homeowner didn't make; the route caps tool rounds, rate limits
per IP and globally, and never echoes provider errors.

## Test suites

| Command | What it proves |
| --- | --- |
| `npm run test:pricing` | 8k+ checks: literal price snapshots, an independent re-implementation of the formula swept across every option combination, invariants (monotonic upgrades, $100 rounding, null-when-not-priceable, clamping, purity), multi-room sums, payload shapes, validation layer |
| `npm run test:parity` | The HTTP calculate route returns byte-identical prices to the wizard's direct module composition |
| `npm run test:assistant` | Tool layer without an LLM: normalization, exact engine parity, knowledge grounding, lead-body parity with the wizard |
| `npm run verify:estimate` | Legacy engine sanity checks |
| `npm run test:estimating` | All four in sequence |
| `E2E_PROJECTS="Desktop Chrome" npx playwright test e2e/calculator.spec.ts e2e/calculator-mobile.spec.ts` | Full wizard flow incl. contact submission (needs a dev server; pass `E2E_BASE_URL` + `E2E_NO_WEBSERVER=1` to reuse one) |

Live conversational QA: drive real conversations against a dev server and
check grounding (corrections, scope changes, budget honesty, fabrication
resistance, parity). The scripted harness used at build time lives in the
session notes; re-running a handful of its scenarios after any system-prompt
change is strongly recommended.

## Environment

| Var | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Enables the assistant. Absent → the widget hides entirely and the site behaves exactly as before chat existed. |
| `ASSISTANT_MODEL` | Optional override; defaults to `claude-opus-5`. |

## Launch checklist (staging/production)

1. Set `ANTHROPIC_API_KEY` in the deployment environment. Rotate the key if it
   was ever shared over an insecure channel.
2. With `DATABASE_URL` configured, submit a test conversation through to lead
   capture and verify in the admin CRM: lead appears with source
   "assistant", the estimate range matches what chat showed, and the
   transcript renders in the lead detail (submission payload).
3. Confirm the Resend admin/homeowner emails render the per-room estimate
   table for an assistant lead.
4. Spot-check wizard-vs-chat parity in production: build the same kitchen in
   both surfaces and compare ranges (they import one module; any mismatch
   means deployment skew).
5. Watch server logs for `[assistant]` and `[estimateValidation]` entries —
   both indicate something upstream needs attention, never routine traffic.

## Known limitations (deliberate)

- The engine prices cabinetry + installation only. Countertops, appliances,
  itemized demolition/delivery/hardware, and minimum charges are NOT modeled —
  the assistant and estimator say so rather than guessing. Pricing them
  requires real business inputs from the owner.
- Rate limits are per-process (lib/rateLimit.ts); strict global limits would
  need a shared store.
- The assistant's wording is generated per conversation; the architecture
  makes invented prices structurally impossible, but tone evolves with the
  system prompt — re-run conversational QA after prompt edits.
