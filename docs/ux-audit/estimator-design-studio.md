# UX Audit: Project Estimator & Design Studio

**Audit date:** 2026-06-03  
**Status:** Remediation in progress (see commits on `main`)

## Device matrix

| Tier | Device / viewport | Browser | Estimator | Design Studio |
|------|-------------------|---------|-----------|---------------|
| P0 | iPhone 14/15 (390×844) | Safari | Automated (Playwright) | Automated + manual |
| P0 | Pixel 7 (412×915) | Chrome | Automated | Automated |
| P1 | iPad Pro 11 | Safari | Automated | Automated |
| P1 | Desktop 1280+ | Chrome, Safari, Firefox | Automated | Automated |

## Design Studio — findings

| ID | Severity | Issue | Symptom | Owner | Status |
|----|----------|-------|---------|-------|--------|
| DS-01 | P0 | Step 0 requires `isScannedRoom`; manual buried in advanced | Continue disabled after room pick | `DesignStudioProvider`, `RoomScanPanel` | Fixed: co-primary manual + presets |
| DS-02 | P0 | Fixed bottom CTA without safe-area | Pricing form under home indicator | `DesignWizard`, `layout.tsx` | Fixed |
| DS-03 | P0 | Auto-open mobile 3D on layout | Page jump, WebGL jank | `DesignWizard` | Fixed |
| DS-04 | P0 | Step indicators 32px | Mis-taps | `DesignWizard` / `StepProgress` | Fixed (44px) |
| DS-05 | P1 | Planner `touch-action: none` | Scroll feels stuck | `Room2DPlanner` | Fixed: contain + hint |
| DS-06 | P1 | 3D loads before user opens preview | Slow mobile load | `LivePreviewPanel` | Fixed: defer mount |
| DS-07 | P1 | WebGL context loss uncaught | Blank preview | `CabinetPreview3D` | Fixed: retry UI |
| DS-08 | P2 | Finish step = preview + save + pricing | Overwhelming last step | `FinishStep` | Fixed: split steps |
| DS-09 | P2 | Duplicate save CTA on mobile | Redundant buttons | `DesignWizard` | Fixed |
| DS-10 | P3 | `ScanStep.tsx` unused | Drift risk | removed | Fixed |

## Project Estimator — findings

| ID | Severity | Issue | Symptom | Owner | Status |
|----|----------|-------|---------|-------|--------|
| EST-01 | P1 | Single long scroll (~9 sections) | Decision fatigue | `EstimateCalculator` | Fixed: wizard |
| EST-02 | P1 | Confidence ignores defaults | “Starting guidance” at 40% with range shown | `estimateEngine` / calculator | Fixed |
| EST-03 | P1 | Dual finish paths (swatch + tier) | Confusion | `EstimateCalculator` | Fixed: single path |
| EST-04 | P2 | Project type not in `touched` | Asymmetric progress | `EstimateCalculator` | Fixed |
| EST-05 | P2 | Consult project types mismatch | `whole-home` etc. missing in form | `ConsultationForm` | Fixed |
| EST-06 | P2 | Estimate confirm gate + review step | Friction on mobile | `ConsultationForm` | Fixed: streamlined mobile |

## Regression tests

- `e2e/design-studio-scan.spec.ts` — scan gate + fixtureScan
- `e2e/design-studio-mobile.spec.ts` — fixtureManual path, iPhone/Pixel
- `e2e/design-studio-planner.spec.ts` — planner touch
- `e2e/calculator-mobile.spec.ts` — wizard + sessionStorage
- `e2e/design-studio-performance.spec.ts` — soft load budget

## Manual checklist (post-fix)

1. iPhone Safari: `/design-studio` → Kitchen → “Enter room size” → 120×144 → Continue through save.
2. iPhone: `/design-studio?projectId=demo-001` → save → portal design tab shows selections.
3. iPhone: `/#calculator` → complete wizard → Book visit → consult pre-filled.
4. Rotate to landscape on layout step; planner scrollable.
