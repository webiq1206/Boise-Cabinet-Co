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
The Repl layer ships the ENTIRE workspace **regardless of `.gitignore`** (proof: `.next` is
gitignored yet `.next/cache` still ships, which is why `build.sh` must delete it). It then
gets duplicated into the "Repl (cache) layer", doubling disk/memory pressure during final
image assembly on the small `cr-2-4` (2 vCPU / 4 GB) build machine.
So enumerate the LARGEST on-disk dirs (`du -sh *` incl. dotfiles) and delete every
regenerable/runtime-irrelevant one at the end of `build.sh`. Confirmed big offenders here:
- `.next/cache` — webpack build cache (hundreds of MB).
- `.cache` — **~1.3GB**: Playwright/Chromium+WebKit browsers (`.cache/ms-playwright`, ~800MB)
  + bun/npm tooling caches. Gitignored but still shipped; never read by the standalone
  runtime. Installing Playwright (e.g. during catalog/PDF or test tooling work) silently
  balloons the image and can flip a previously-green publish into a promote-step failure.
**Fix:** `rm -rf .next/cache .cache` at the end of `build.sh` (after copying static/public
into standalone). Safe — all regenerable. Do NOT `rm` source dirs like `attached_assets` in
build.sh: the rm may hit the live repl FS and would destroy user uploads.

# After shrinking: a SEPARATE failure can surface — `node: command not found` (exit 127)
Once the image is small enough to push and the build progresses PAST `Creating Autoscale
service`, watch the RUNTIME logs (`fetchDeploymentLogs` for the service-creation window), not
just the build log. Seen here: build reaches `Creating Autoscale service` then the container
crash-loops with `bash: line 1: node: command not found` / `command finished with error
[bash -c HOSTNAME=0.0.0.0 node .next/standalone/server.js]: exit status 127` and every
healthcheck fails (the `returned status 500` lines are the health proxy reporting the dead
upstream, not an app 500).
Diagnosis when this appears: compare the failed build against the last SUCCESS build's layer
lines. If `[deployment].run`, modules (`nodejs-20`), `[nix]`, AND the (content-addressed)
"Retrieved cached nix layer" are all identical to a deploy that worked, then `node` — a
platform-provided runtime — is missing from the run container through no fault of app code
(content/data merges cannot remove a nix binary from PATH). Treat as a Replit deploy-env /
transient issue: **retry the publish first** (fresh build often re-materializes node); if it
recurs identically across a plain retry (CONFIRMED here: builds 9f45f791 + 30cea2a4 both
crash-looped with node-not-found, config byte-identical to success 1d84646e), the highest-value
in-our-control fix is to make `[deployment].run` resolve node ROBUSTLY instead of relying on a
bare `node` on PATH: try PATH first, then DISCOVER node via a glob of the image nix store, log
what resolved, then exec. Set it with `deployConfig({deploymentTarget:"autoscale", build:[...],
run:["bash","-c", <script>]})`. The script used:
`NODE_BIN="$(command -v node 2>/dev/null || true)"; [ -z "$NODE_BIN" ] && NODE_BIN="$(ls -1 /nix/store/*nodejs*-wrapped/bin/node 2>/dev/null | head -n1)"; [ -z "$NODE_BIN" ] && NODE_BIN="$(ls -1 /nix/store/*nodejs*/bin/node 2>/dev/null | head -n1)"; echo "[run] node resolved to: ${NODE_BIN:-NOT_FOUND}"; HOSTNAME=0.0.0.0 exec "${NODE_BIN:-node}" .next/standalone/server.js`
**Why glob, not a hardcoded path:** a fixed `/nix/store/<hash>-nodejs.../bin/node` is brittle
(hash changes across channel/version bumps); the glob is version-agnostic and self-heals. It is
ALSO diagnostic: if node truly isn't in the run image, runtime logs print
`[run] node resolved to: NOT_FOUND`, which is hard evidence to escalate to Replit support.
If even that prints NOT_FOUND, then the deploy image lacks the node MODULE entirely — fix by
adding nodejs to `[nix].packages` / re-adding the module to force a fresh nix layer, or support.

**Why:** image bloat at assembly time is the most plausible code-correlated cause of a
promote failure after a successful push, and shrinking the image is a high-value, low-risk
mitigation — but it is NOT proven causality. Other pre-service-creation blockers exist
(platform-side promote/controller failures, quota/capacity, image metadata/size limits). So
treat this as a mitigation, not a definitive fix. If the promote still fails identically
after shrinking the image, treat it as a Replit deployer-side/infra issue: have the user
retry the publish, and contact Replit support with the failing build IDs if it persists (per
deployment-failure-debugging.md "don't diagnose infrastructure problems").
