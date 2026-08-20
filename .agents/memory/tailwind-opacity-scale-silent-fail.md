---
name: Tailwind opacity modifiers must be multiples of 5
description: Why gradient/text scrims silently rendered as nothing across the hero and several page bands.
---

**Rule:** Every Tailwind color-opacity modifier in this repo must be a multiple
of 5 (`/25`, `/55`, `/90`). Tailwind 3.4's default opacity scale is
`0,5,10,...,100`; anything else (`/72`, `/38`, `/58`, `/52`, `/82`) generates NO
class at all. The element keeps the class name in the DOM, so it looks correct
in review, but `--tw-gradient-from` is never set and the whole gradient resolves
to `none`.

**Why:** Found 2026-08-20 while matching the home hero to boiseremodeling.co.
`from-inverse/72 via-inverse/38` (home hero), `from-inverse/58` (its top scrim),
and `from-inverse/52` (BeforeAfterSlider, FeaturedProjectSection, and the
/about + /contact hero scrims) had never rendered in production - which is why
hero copy looked washed out over photography. Verify with
`node -e "console.log(Object.keys(require('tailwindcss/defaultTheme').opacity))"`
or by grepping the built CSS for the exact class.

**How to apply:** After changing any `/NN` modifier, confirm it painted:
`getComputedStyle(el).backgroundImage` must start with `linear-gradient`, not be
`none`. Sweep for offenders with:
`grep -rhoE '\b(bg|text|border|from|via|to)-[a-z-]+/[0-9]{1,3}\b' --include='*.tsx' components/ app/ | sort -u` and filter `n % 5 != 0`.
Still outstanding (decorative only, enabling them CHANGES visuals - ask first):
`bg-inverse-foreground/6` (EstimateResultPanel) and `from-primary/8`
(ProcessSection, /about, /contact).

**Related:** `.brc-label` in globals.css sits outside any `@layer` and hard-sets
`color: hsl(var(--muted-foreground))`, so a bare `text-*` utility on it loses on
source order. globals.css already ships `.brc-label.text-inverse-muted` to win
that fight - use that exact pairing (it is 68% alpha by design) rather than
inventing a new one.
