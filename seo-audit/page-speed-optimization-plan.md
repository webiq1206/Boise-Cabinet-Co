# Performance / Core Web Vitals Plan - Boise Cabinet Co

**Lighthouse: Not Verified** - PSI API returned HTTP 429 (quota, no key) and CrUX field data is not yet available for the domain. Findings below are from measured curl timings + source review.

## Measured (live)
- **TTFB excellent:** ~0.22-0.23s across home / finish / room (SSR + `x-nextjs-cache: HIT` on Google Frontend CDN).
- **Large HTML payloads:** home 203 KB, finish detail 100 KB, **`/cabinets/kitchen` 486 KB** raw HTML - the room page SSRs a large product list (low text-to-markup). Ties to the "large lists, no pagination" UX/perf finding.
- **33 JS/CSS refs** on the homepage.
- **HTTP/2**, HSTS, aggressive immutable-style caching (`s-maxage=31536000`).

## Source review (good foundations)
- Custom `next/image` **variant loader** + pre-generated width variants + blur manifest; hero uses `priority`/`fetchPriority=high` + preload; fonts preloaded (`next/font`, weights trimmed to 300/400). Modern WebP throughout. CLS should be low (reserved image space).

## Recommendations
1. **[MED] Paginate/lazy-load the large lists** - `/products/[cat]` (162 items), `/cabinets/[room]`, blog index. Cuts the 486 KB room HTML, improves LCP/TBT on mobile, and is also a UX win.
2. **[LOW] Re-run Lighthouse with an API key** (or PSI UI) for mobile + desktop to capture real LCP/CLS/TBT and confirm >=95 targets once the redesign deploy propagates.
3. **[LOW] Verify the CDN purges on deploy** - the 1-year `s-maxage` is fine if deploys invalidate; confirm the redesign propagates (it had not at audit time).
4. **[LOW] `www` does not resolve** - add a `www -> apex` redirect or a DNS record so typed `www` URLs don't fail.

Total page weight and request count are otherwise reasonable; the image pipeline is well-engineered. The single actionable perf item is trimming the oversized SSR lists.
