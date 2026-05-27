# Static Utility Pages Audit

| Route | File | Title | Description | Canonical | H1 | JSON-LD | Status |
|---|---|---|---|---|---|---|---|
| `/about` | `app/about/page.tsx` | "About Lawn Care Kuna" | NAP + founding story | yes | "About Us" | none | PASS (LOGGED: consider AboutPage schema) |
| `/contact` | `app/contact/page.tsx` | "Contact Lawn Care Kuna" | NAP + form | yes | "Contact Us" | none | PASS (LOGGED: ContactPage schema) |
| `/faq` | `app/faq/page.tsx` | "FAQ - Lawn Care Kuna" | indexed FAQ list | yes | "Frequently Asked Questions" | FAQPage | PASS |
| `/get-quote` | `app/get-quote/page.tsx` | "Get a Free Quote" | quote wizard CTA | yes | "Get Your Free Lawn Care Quote" | none | PASS |
| `/pricing` | `app/pricing/layout.tsx` | "Lawn Care Pricing" | pricing intro | yes | "Pricing" | none | PASS (twitter card FIXED) |
| `/seasonal-guide` | `app/seasonal-guide/page.tsx` | "Idaho Lawn Care Seasonal Guide" | spring/summer/fall/winter | yes | "Seasonal Lawn Care Guide" | none | PASS |
| `/commercial` | `app/commercial/page.tsx` | "Commercial Lawn Care in Kuna" | B2B intro | yes | "Commercial Services" | none | PASS |
| `/commercial/hoa-services` | `app/commercial/hoa-services/page.tsx` | "HOA Lawn Care Services" | HOA package | yes | "HOA Services" | none | PASS |
| `/commercial/municipal-services` | `app/commercial/municipal-services/page.tsx` | "Municipal Lawn Care Contracts" | municipal package | yes | "Municipal Services" | none | PASS |
| `/privacy-policy` | `app/privacy-policy/page.tsx` | "Privacy Policy" | full policy | yes | "Privacy Policy" | none | PASS (robots:noindex,follow recommended; LOGGED) |
| `/terms-of-service` | `app/terms-of-service/page.tsx` | "Terms of Service" | full TOS | yes | "Terms of Service" | none | PASS (LOGGED noindex,follow recommended) |

No defects discovered on these pages. Logged follow-ups are quality polish, not blockers.
