---
name: Outreach config/template module cycle
description: Why config.ts must not use imported template consts during module init.
---
`lib/outreach/config.ts` and `lib/outreach/template.ts` import each other:
template.ts needs `getOutreachPostalAddress`/`getOutreachSenderName` from config;
config needs `resolveTemplateKey` (and template keys) from template.

**Rule:** Never reference an imported template export at config.ts *module-init*
time. Keep DEFAULTS (e.g. `defaultTemplate: "personal"`) as plain literals, and
only call `resolveTemplateKey()` inside `getOutreachConfig()` (runtime).

**Why:** If template.ts loads first, it pulls config.ts mid-init; template's
exports are not yet assigned, so any top-level use in config would hit a TDZ /
undefined. Runtime use is fine because both modules are fully loaded by call time.

**How to apply:** When adding new template-derived config defaults or new
templates, validate/resolve them at runtime, not in the DEFAULTS object or other
top-level config code.
