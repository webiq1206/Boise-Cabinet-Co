# Boise Remodeling Co

Treasure Valley design-build remodeling: kitchens, bathrooms, whole-home renovations, and room additions.

## Development

```bash
npm install
npm run dev          # http://localhost:5000
npm run build
npm run test:e2e:install   # first time only (Playwright browser)
npm run test:e2e -- e2e/calculator.spec.ts
```

E2E tests use port **3456** by default (macOS often reserves 5000 for AirPlay).

## Key paths

- Homepage + estimator: `app/page.tsx`, `components/EstimateCalculator.tsx`
- Estimate engine: `shared/estimateEngine.ts`
- Site copy: `shared/siteContent.ts`
# Boise-Cabinet-Co
