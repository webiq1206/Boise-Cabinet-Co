---
name: Local next build OOM
description: Why `next build` cannot complete in this Replit container and how to verify code soundness instead.
---

# Local `next build` OOM

`next build` is silently OOM-killed (SIGKILL/exit 137, no JS heap error) during the
webpack "Creating an optimized production build" phase. It never reaches a code error.

**Why:** The 8GB container is shared with the always-on `Start application` dev
server (`next-server` grows to ~1GB+ after route compiles) plus a respawning
tsserver/LSP (up to ~1.7GB). That ~3-4GB baseline leaves too little physical RAM
for the webpack compile, so the OS OOM-killer takes it. `experimental.cpus:1`,
`workerThreads:false`, and `--max-old-space-size` caps do NOT prevent it — the
death is an OS-level RSS kill, not a V8 heap-limit throw. Even the launching shell
can get OOM-killed (exit 137) if it sleeps through the build's memory peak.

**How to apply:** Do not try to win the memory fight (you cannot stop the dev
server — the guard blocks killing it and it auto-restarts). Instead verify code
soundness without a full local build:
- Run the lightweight prebuild verify gates: `verify:content`, `verify:images`,
  `verify:no-em-dash` (tsx scripts, low memory).
- Confirm the dev server compiles routes by curling them (200 = webpack compiled
  that route's modules successfully): `curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/<route>`.
- Check redirects with `-w "%{http_code} -> %{redirect_url}"` (expect 308).
- grep source for any dangling references to removed slugs/images.
If a true production build is required, it must run in a higher-memory environment
(the deploy builder) rather than locally.

**Deploy-builder memory (next.config.js `experimental`):** to keep deploy builds
inside a modest memory envelope, three flags are set: `webpackBuildWorker: true`
(isolates the webpack compile heap in its own worker — must be set *explicitly*
because the project's custom `webpack()` alias function otherwise disables the
worker by default), `memoryBasedWorkersCount: true`, and `cpus: 2`. The dominant
build-memory spike for this site is the "Generating static pages" phase: Next
spawns one full app-loading render worker per CPU by default, and with ~150 static
pages (blog/guides/city-service `generateStaticParams`) that stacks fast. Capping
workers by memory + a hard `cpus` cap is the structural fix; do not just raise
`--max-old-space-size`. The `@shared`/`@/shared` webpack aliases are redundant with
tsconfig `paths`, so the custom `webpack()` fn could be dropped to auto-enable the
build worker, but it's kept and the flag set explicitly instead.
