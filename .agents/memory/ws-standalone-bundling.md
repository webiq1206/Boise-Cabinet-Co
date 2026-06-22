---
name: ws/neon bundling breaks prod login
description: Why Neon DB calls fail only in the deployed standalone build with "t.mask is not a function" / "Connection terminated unexpectedly"
---

# Symptom
Login (any Neon DB query) works in dev but fails ONLY on the published/autoscale
site with a 500. Deployment logs show:
- `TypeError: t.mask is not a function` (in a minified `chunks/NNN.js`)
- `Login error: Error: Connection terminated unexpectedly`

# Root cause
With `output: 'standalone'`, Next/webpack bundles AND minifies the `ws` package
into the server chunks. Minification mangles `bufferUtil.mask`, so when the Neon
serverless driver's WebSocket tries to send a frame, masking throws and the DB
connection is torn down. Dev works because dev mode loads `ws` unminified from
`node_modules`. `WS_NO_BUFFER_UTIL` / `WS_NO_UTF_8_VALIDATE` env vars do NOT fix
it — the broken function is ws's own JS `mask`, not the native addon.

# Fix
Mark the WebSocket/Neon packages external so they load from real `node_modules`
at runtime instead of being bundled:
```js
// next.config.js (Next 14: use the experimental key, NOT top-level serverExternalPackages which is Next 15)
experimental: {
  serverComponentsExternalPackages: ['ws', '@neondatabase/serverless', 'bufferutil', 'utf-8-validate'],
}
```
**Why:** Next.js traces externalized packages into the standalone `node_modules`,
so they ship unminified and the WebSocket frame masking works.

**How to apply:** Any time a DB/WebSocket call works in dev but 500s only on the
deployed standalone build, suspect server-bundle minification of `ws` first.
Requires a re-publish to take effect.
