# Project Estimator & Design Studio sizing

## Project Estimator

The Boise Remodeling Co website includes a unified **Project Estimator** on the homepage (`/#calculator`). It gives visitors a planning range in seconds and optional refinement for a more tailored range before consultation.

### Architecture

| Layer | File | Role |
|---|---|---|
| Engine | `shared/estimateEngine.ts` | Price matrix, project-aware sqft config, refinement multipliers, planning detail level |
| UI | `components/EstimateCalculator.tsx` | Guided wizard steps |
| Result | `components/estimate/EstimateResultPanel.tsx` | Range, selection summary, scope examples, disclaimer, CTA |
| Handoff | `components/ConsultationForm.tsx` | Reads `sessionStorage.brc_estimate` for pre-filled consult context |

### Behavior

- **Defaults on load:** kitchen, mid-range, project-specific default sqft; range visible immediately
- **Planning detail level:** counts only user-initiated refine choices (not auto-filled defaults)
- **Disclaimer:** planning range only; not a proposal, bid, or guaranteed cost

### Tests

```bash
npm run test:e2e:install   # browsers + OS libs (--with-deps; sudo on Linux)
npm run test:e2e -- e2e/calculator.spec.ts
```

See [docs/testing/playwright-e2e.md](docs/testing/playwright-e2e.md) for Linux / cloud workspace setup.

---

## Design Studio room sizing

Design Studio (`/design-studio`) uses **planning-grade** room dimensions for layout fit checks and visualization. **Field template measure** is still required before ordering cabinets.

### Dimension sources (accuracy)

| `roomMeta.source` | Meaning | Wizard gate | Room box can grow? |
|---|---|---|---|
| `manual` | User typed inches or picked a size bucket | Yes | No |
| `vision-scan` | OpenAI photo API or client fallback from photo aspect | Yes | No |
| `photo` | Two-tap refine on room photo | Yes | No |
| `ar-scan` | WebXR corner measure (beta) | Yes | No |
| `auto-layout` | Template size for a layout | No | Yes (internal only) |
| `auto-fit` | Expanded to fit cabinet modules | No | Yes (internal only) |

`isScannedRoom()` in `lib/design/roomScanGeometry.ts` only accepts **user-measured** sources. `expandRoomMetaToFitModules()` does not change user-measured width/depth.

### UX flow

1. **Room step:** photo (primary), size buckets, or exact inches
2. **Layout step:** floor plan + optional photo overlay + 2D planner
3. **Preview step:** 3D + photo overlay (transform persisted in `layoutJson.photoOverlayTransform`)

### API

- `POST /api/design-studio/scan-room` — requires `OPENAI_API_KEY`; client falls back to `estimateRoomFromDataUrl()` on failure
- Saved designs store `roomMeta`, `roomBounds`, `photoUrl`, `photoOverlayTransform` in `layoutJson`

### Tests

```bash
npm run verify:room-scan
npm run test:e2e:install
npm run test:e2e:design-studio
```
