# Project Estimator

The Boise Remodeling Co website includes a unified **Project Estimator** on the homepage (`/#calculator`). It gives visitors a planning range in seconds and optional refinement for a more tailored range before consultation.

## Architecture

| Layer | File | Role |
|---|---|---|
| Engine | `shared/estimateEngine.ts` | Price matrix, project-aware sqft config, refinement multipliers, planning detail level |
| UI | `components/EstimateCalculator.tsx` | Steps: project type, finish level, sqft; collapsible refine panel |
| Result | `components/estimate/EstimateResultPanel.tsx` | Range, selection summary, scope examples, disclaimer, CTA |
| Handoff | `components/ConsultationForm.tsx` | Reads `sessionStorage.brc_estimate` for pre-filled consult context |

## Behavior

- **Defaults on load:** kitchen, mid-range, project-specific default sqft; range visible immediately
- **Project-aware sizing:** slider min/max/default per project type (kitchen, bath, whole-home, addition)
- **Planning detail level:** counts only user-initiated refine choices (not auto-filled defaults)
- **Mobile:** result card above inputs + sticky summary bar above bottom nav
- **Disclaimer:** planning range only; not a proposal, bid, or guaranteed cost

## Stored estimate shape

`buildStoredEstimate()` persists to `sessionStorage` for the consult form:

- `project`, `finish`, `sqft`, `refinements`
- `priceLow`, `priceHigh`, `confidenceLabel`

## Tests

```bash
npm run test:e2e:install   # once per machine
npm run test:e2e -- e2e/calculator.spec.ts
```
