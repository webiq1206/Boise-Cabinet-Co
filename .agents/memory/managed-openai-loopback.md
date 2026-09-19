---
name: Managed OpenAI loopback endpoint
description: Replit-managed OpenAI requests use a credential-paired local sidecar rather than a public HTTPS base URL.
---

Treat the managed OpenAI integration base URL as a loopback-only HTTP sidecar. Qualification-only code must require the managed key/base pair together, accept only `http://localhost` without URL credentials, query, or fragment, and never fall back to a direct OpenAI key or caller-controlled base URL.

**Why:** A generic HTTPS requirement rejected the real managed route before dispatch, while accepting arbitrary HTTP(S) hosts would risk sending the managed bearer credential outside the Repl.

**How to apply:** When adding a paid qualification or provider-identity check, validate the managed endpoint before reserving spend and transition the ledger to unknown only immediately before the actual fetch.