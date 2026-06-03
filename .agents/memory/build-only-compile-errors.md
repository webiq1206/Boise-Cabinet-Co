---
name: Build-only compile errors (duplicate exports) escape dev + ignoreBuildErrors
description: Why a Next.js publish can fail in `next build` even when the dev server is green and TS errors are ignored
---

# Signature
The publish gets PAST `prebuild` (all verify gates OK) and dies inside `next build`
with "Failed to compile." + an SWC error like `the name <x> is exported multiple
times`. The dev server is simultaneously serving 200s and looks healthy.

# Why dev + tsc don't catch it
- `next dev` compiles modules lazily per-route, so a hard module-syntax error in a
  widely-imported barrel can stay latent in dev even though the route renders.
- A duplicate named re-export (`export { x } from "./q"` appearing twice for the same
  name, e.g. once in a grouped block and once in a stray "backward-compat" line) is a
  SWC parse/compile error, NOT a type error.
- This project sets `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds:
  true` in next.config, so `tsc --noEmit` errors are pure noise that never fail the
  build. Do NOT chase them. Only SWC compile errors fail `next build`.

**Why:** a publish failed on `shared/catalog/index.ts` exporting
`getFinishesForDoorStyle` twice; dev was green and tsc showed ~dozens of unrelated
pre-existing type errors that had also been present in the last SUCCESSFUL build.

**How to apply:** when the build log says "Failed to compile" with a duplicate/exported
error, fix that exact module-syntax issue. Verify by grepping the barrel for duplicate
export identifiers (a small node script counting `export { ... } from`, `export
function`, `export const` names) rather than running a full local `next build` (it OOMs
here — see local-next-build-oom.md). Ignore the tsc/eslint output entirely.
