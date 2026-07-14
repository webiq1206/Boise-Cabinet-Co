---
name: pdf.js must use the legacy build
description: Interactive catalog broke on iPhones because the modern pdf.js build needs iOS 17.4+.
---

**Rule:** The catalog flipbook must import `pdfjs-dist/legacy/build/pdf.mjs` and serve the LEGACY worker at `public/pdf.worker.min.mjs` (build.sh re-copies it from node_modules on every deploy so it can never drift from the installed version).

**Why:** pdfjs-dist v4's modern build uses `Promise.withResolvers` and other features only in very recent engines (iOS/Safari 17.4+). On older iPhones — including Chrome on iOS, which is WebKit — the import/worker throws and visitors saw "The interactive catalog could not be loaded in your browser."

**How to apply:** If the viewer errors on mobile again, check the served worker matches the legacy build (`cmp` against node_modules) and that no code path imports plain `pdfjs-dist`. Error state must render before any loading gate (a failed PDF init while react-pageflip is still loading would otherwise show a spinner forever); the error fallback is a native `<iframe>` PDF embed + download link, never a dead-end message.
