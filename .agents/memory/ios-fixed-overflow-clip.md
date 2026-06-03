---
name: iOS fixed bars drift with overflow-x:hidden on root
description: Why this site uses overflow-x:clip (not hidden) on html/body to keep the mobile fixed bottom nav pinned on iOS.
---

The mobile bottom nav (`components/Navigation.tsx`, `position: fixed; bottom-0`)
drifted to mid-screen on scroll on iPhone. Cause: `app/globals.css` had
`html, body { overflow-x: hidden }`. On iOS Safari, `overflow-x: hidden` on the
**root `<html>`** turns it into a scroll container, so `position: fixed`
descendants resolve against that container instead of the viewport.

**Fix:** use `overflow-x: clip` instead of `hidden`. `clip` still prevents
horizontal scroll but does NOT create a scroll container, so fixed/sticky keep
resolving against the viewport.

**How to apply:** Never set `overflow-x: hidden` on `html`/`body` here — use
`clip`. If you must contain horizontal overflow on a wrapper that also holds
fixed children, prefer `clip` or move the constraint off the fixed element's
positioning ancestor chain.
