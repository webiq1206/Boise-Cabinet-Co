# UX Audit: Project Estimator & Design Studio

**Audit date:** 2026-06-03  
**Last updated:** 2026-06-04  
**Status:** Room sizing + visualization pass shipped; manual device QA remaining

## Device matrix

| Tier | Device / viewport | Browser | Estimator | Design Studio |
|------|-------------------|---------|-----------|---------------|
| P0 | iPhone 14/15 (390×844) | Safari | Automated (Playwright webkit in CI) | Automated + manual |
| P0 | Pixel 7 (412×915) | Chrome | Automated | Automated |
| P1 | iPad Pro 11 | Safari | Automated | Automated |
| P1 | Desktop 1280+ | Chrome, Safari, Firefox | Automated | Automated |

## Design Studio — room & visualize (2026-06-04)

| Item | Status |
|------|--------|
| Photo-first room step (Safari/Chrome) | Done |
| Size buckets without tape measure | Done |
| `auto-fit` / `auto-layout` excluded from wizard gate | Done |
| User-measured rooms never auto-expanded | Done |
| Photo overlay on layout step + 2D planner open | Done |
| Overlay transform persisted in `layoutJson` | Done |
| Photo API fallback when OpenAI unavailable | Done |
| Accuracy notices (`RoomAccuracyNotice`) | Done |
| Marketing copy aligned | Done |

## Regression tests

```bash
npm run verify:room-scan
npm run test:e2e:install
npm run test:e2e -- e2e/design-studio-mobile.spec.ts
npm run test:e2e -- e2e/design-studio-photo.spec.ts
npm run test:e2e -- e2e/design-studio-scan.spec.ts
npm run test:e2e -- e2e/design-studio-save-restore.spec.ts
```

CI: `.github/workflows/e2e.yml` (Desktop Chrome + Pixel 7)

## Manual checklist (required before calling “production perfect”)

1. **iPhone Safari:** Kitchen → take room photo → adjust size → layout → drag photo overlay → save.
2. **Android Chrome:** Same as above.
3. **Desktop:** QR handoff → complete room step on phone → return to desktop session.
4. **Airplane mode photo:** Confirm client fallback toast and Continue still works.
5. **Layout too large:** Small room + large layout → read hint; no silent room growth.
6. **Save → share link → reopen:** Room size, photo, overlay position match.
7. **Portal:** `/design-studio?projectId=demo-001` → save → portal design tab.

## Remaining (optional)

- Native iOS RoomPlan / LiDAR companion app
- Stronger photo scale calibration (door reference)
- `remove-cabinets` AI wired into overlay remodel toggle
- Estimator → Design Studio deep link with `roomType` query param
