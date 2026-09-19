---
name: Playwright WebKit Nix ABI gap
description: Why Chromium can run while Playwright's downloaded WebKit still fails in this Replit Nix environment.
---

Playwright's downloaded WebKit build can require exact Ubuntu-era multimedia and ICU sonames that are not supplied by the active Nix channel. Adding ordinary GTK/X11/NSS libraries is enough for Chromium but does not prove WebKit compatibility.

**Why:** WebKit launch still requested exact libraries such as `libicu*.so.74`, GTK 4, GStreamer components, Flite, and matching codec libraries after Chromium launched and completed the responsive suite.

**How to apply:** Treat Chromium and WebKit runtime verification separately. Do not claim WebKit coverage from a Chromium pass or add arbitrary compatibility symlinks; use a browser build packaged for the current Nix channel or an environment with Playwright's supported system ABI.