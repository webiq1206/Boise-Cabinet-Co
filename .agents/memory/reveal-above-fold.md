---
name: Reveal above-the-fold pitfall
description: When scroll-reveal animation may hide above-fold hero content pre-hydration
---

The `Reveal` component (`components/Reveal.tsx`) is a `"use client"` IntersectionObserver wrapper that starts at `opacity:0` and fades in. On SSR/static pages this initial hidden state is in the server HTML until React hydrates and the effect runs.

**Rule:** Never wrap above-the-fold hero content in `Reveal`. Render hero text/CTAs immediately; reserve `Reveal` for below-fold sections only.

**Why:** Above-fold content wrapped in `Reveal` renders blank until hydration (visible flash of empty hero on slow loads / when captured before JS runs). The content is still in the DOM for crawlers, but the perceived render is broken.

**How to apply:** In landing/marketing pages, the first viewport (hero) gets no `Reveal`; sections that the user scrolls to get `Reveal` with staggered `delay` props.
