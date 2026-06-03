# Playwright E2E on Linux

`verify:room-scan` does not need browsers. Playwright E2E needs **browser binaries** and **OS libraries** (glib, gtk, gstreamer, etc.).

## One-time setup (Ubuntu / Debian)

Install browsers **and** system dependencies (requires `sudo`):

```bash
npm ci
npm run test:e2e:install
```

That runs `playwright install --with-deps chromium webkit`, which is equivalent to:

```bash
npx playwright install chromium webkit
sudo npx playwright install-deps
```

On **Cursor cloud / Replit / minimal containers** without `sudo`, browser install may succeed but tests will fail with `libglib-2.0.so.0: cannot open shared object file`. Use **GitHub Actions** (see `.github/workflows/e2e.yml`) or a full Ubuntu VM with the commands above.

## Design Studio room tests (recommended local command)

Runs only Design Studio specs on **Desktop Chrome** (not all 4 device projects):

```bash
npm run verify:room-scan
npm run test:e2e:design-studio
```

Equivalent manual command:

```bash
npm run test:e2e -- \
  e2e/design-studio-mobile.spec.ts \
  e2e/design-studio-photo.spec.ts \
  e2e/design-studio-save-restore.spec.ts \
  e2e/design-studio-scan.spec.ts \
  --project="Desktop Chrome"
```

## All device projects

Each spec file runs once per project (4× test count). Requires deps for WebKit (iPhone/iPad) and Chromium (Desktop/Pixel):

```bash
npm run test:e2e:install
npm run test:e2e -- e2e/design-studio-mobile.spec.ts e2e/design-studio-photo.spec.ts
```

Limit projects:

```bash
E2E_PROJECTS="Desktop Chrome,Pixel 7" npm run test:e2e -- e2e/design-studio-mobile.spec.ts
```

## CI

GitHub Actions runs `npx playwright install --with-deps chromium webkit` on `ubuntu-latest` automatically.

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| `playwright install` warns "Missing libraries" | Run `npm run test:e2e:install` (with `--with-deps`) or `sudo npx playwright install-deps` |
| `libglib-2.0.so.0: cannot open shared object file` | OS deps not installed; use `test:e2e:install` with sudo |
| 28 tests instead of 7 | You ran all Playwright projects; add `--project="Desktop Chrome"` or use `npm run test:e2e:design-studio` |
| WebKit fails on Linux only | Run `E2E_PROJECTS=Desktop Chrome,Pixel 7 npm run test:e2e ...` |
