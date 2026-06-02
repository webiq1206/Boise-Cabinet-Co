---
name: Deploy prebuild verify gates (em-dash, content, images)
description: Why a Boise Cabinet Co publish can fail in prebuild before next build/deploy ever runs
---

# Signature
A publish fails FAST (~1-2 min, well under a normal ~4.5 min build) and the build log
ends inside `prebuild`, before `next build` ("Creating an optimized production build" /
"Generating static pages") ever runs. No image-layer or "Creating Autoscale service"
lines appear. This is a hard prebuild gate failing, NOT the promote-step flakiness.

# The gates
`package.json` `prebuild` chains hard checks that each `process.exit(1)` on failure and
abort the build:
`links:generate && audit:links && resources:generate && images:blog && verify:content
&& verify:images && verify:no-em-dash`.

`verify:no-em-dash` (`scripts/verify-no-em-dash.ts`) scans dirs `app components shared
lib server` for the Unicode em-dash `—` and fails the build on ANY occurrence (scripts/
is NOT scanned). `audit:links` is warn-only (never fails).

# The trap with generated files
`images:blog` runs `node scripts/generate-blog-image-registry.mjs`, which REGENERATES
`shared/blogImageRegistry.ts` on every build. So fixing em-dashes (or other gate
violations) in the committed generated file is not enough — prebuild overwrites it. You
must fix the GENERATOR's output template (the `ts` template literal in
`generate-blog-image-registry.mjs`), then regenerate, or the violation returns next build.

**Why:** a deploy succeeded, then an identical-looking publish failed because the
registry got regenerated with an em-dash in its header comment between deploys. The
verify gate is intentional (the project bans em-dashes in user-facing source), so the
fix is to make generators emit ASCII hyphens, not to weaken the check.

**How to apply:** when a publish fails fast in prebuild, pull the build log tail
(getDeploymentBuild) and look for which verify step exited non-zero. If it's a generated
file, patch the generator template + regenerate; never just edit the committed artifact.
