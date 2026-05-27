# Noindex Surface Audit

These routes must not appear in search results. Both robots.txt and in-document robots meta should agree.

| Route | File | robots.txt | layout robots meta | Status |
|---|---|---|---|---|
| `/admin` | `app/admin/page.tsx` | disallow /admin/ | `index:false, follow:false, nocache:true, nosnippet:true` | FIXED (new `app/admin/layout.tsx`) |
| `/admin/dashboard` | `app/admin/dashboard/page.tsx` | disallow | inherits admin layout | FIXED |
| `/subcontractor` | `app/subcontractor/page.tsx` | disallow /subcontractor/ | `index:false, follow:false, nocache, nosnippet` | FIXED (new `app/subcontractor/layout.tsx`) |
| `/subcontractor/portal` | `app/subcontractor/portal/page.tsx` | disallow | inherits subcontractor layout | FIXED |
| `/subcontractor/purchases` | `app/subcontractor/purchases/page.tsx` | disallow | inherits | FIXED |
| `/quote/edit` | `app/quote/edit/page.tsx` | (not disallowed, tokenised) | `index:false, follow:false, nocache:true` | FIXED (new `app/quote/layout.tsx`) |
| `/quote-status` | `app/quote-status/page.tsx` | (not disallowed, tokenised) | `index:false, follow:true` | FIXED |

Why both layers: robots.txt is a crawl directive; in-document noindex is a retention/index directive. Pages that get linked externally (leaked tokens, manual links) can still be crawled even when robots.txt forbids, so in-document noindex is the authoritative signal for de-listing.
