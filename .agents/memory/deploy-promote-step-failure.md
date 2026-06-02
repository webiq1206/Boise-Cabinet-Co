---
name: Autoscale deploy fails at promote (service-creation) step
description: How to diagnose a Replit autoscale deploy that builds + pushes all layers but is marked "failed" with no runtime logs
---

# Signature
Autoscale (cloud_run) publish: `next build` compiles, all pages generate, and every image
layer pushes ("Created pid1/hosting/Repl/Repl (cache) layer"), then the build is marked
**failed ~6s later** and `fetchDeploymentLogs` returns "no deployment logs". The app's own
startup probe never runs.

# How to diagnose (do this FIRST, don't theorize)
Pull build logs via `getDeploymentBuild({buildId})` (in code_execution sandbox) and compare
the **tail** of a SUCCESS vs a FAILURE build:
- SUCCESS ends with: `Creating Autoscale service` -> `upsertCloudRunService completed` ->
  `Waiting for service to be ready` -> `Deployment successful`.
- FAILURE ends at `Created Repl (cache) layer` and **never logs `Creating Autoscale service`**.
So the failure is in the deployer's image->service-creation (promote) step, AFTER a fully
successful build+push, BEFORE the container ever starts. App-startup/runtime code is therefore
irrelevant to this class of failure (the container is never run; no startup probe).

# What this rules out
- App startup crashes / instrumentation.ts / DB driver — the container never starts here.
- Port mappings — a failure that occurred while `.replit` still had a single port proves an
  extra `[[ports]]` entry is not the cause. (You also can't edit `.replit` ports directly;
  they're system-managed.)

# Most actionable lever: shrink the deployment image
The Repl layer ships the ENTIRE workspace, including `.next/cache` (webpack build cache,
hundreds of MB, regenerable, never read by `.next/standalone/server.js` at runtime). It then
gets duplicated into the "Repl (cache) layer", doubling disk/memory pressure during final
image assembly on the small `cr-2-4` (2 vCPU / 4 GB) build machine.
**Fix:** add `rm -rf .next/cache` at the end of `build.sh` (after copying static/public into
standalone). Safe — pure build cache.

**Why:** image bloat at assembly time is the most plausible code-correlated cause of a
promote failure after a successful push, and shrinking the image is a high-value, low-risk
mitigation — but it is NOT proven causality. Other pre-service-creation blockers exist
(platform-side promote/controller failures, quota/capacity, image metadata/size limits). So
treat this as a mitigation, not a definitive fix. If the promote still fails identically
after shrinking the image, treat it as a Replit deployer-side/infra issue: have the user
retry the publish, and contact Replit support with the failing build IDs if it persists (per
deployment-failure-debugging.md "don't diagnose infrastructure problems").
