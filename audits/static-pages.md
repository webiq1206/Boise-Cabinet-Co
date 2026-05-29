# Static Utility Pages Audit

| Route | File | Title | Description | Canonical | H1 | JSON-LD | Status |
|---|---|---|---|---|---|---|---|
| `/about` | `app/about/page.tsx` | "About Boise Remodeling Co" | NAP + founding story | yes | "About Us" | none | PASS (LOGGED: consider AboutPage schema) |
| `/contact` | `app/contact/page.tsx` | "Contact Boise Remodeling Co" | NAP + form | yes | "Contact Us" | none | PASS (LOGGED: ContactPage schema) |
| `/faq` | `app/faq/page.tsx` | "FAQ - Boise Remodeling Co" | indexed FAQ list | yes | "Frequently Asked Questions" | FAQPage | PASS |
| `/get-quote` | `app/get-quote/page.tsx` | "Get a Free Quote" | quote wizard CTA | yes | "Get Your Free Remodeling Quote" | none | PASS |
| `/pricing` | `app/pricing/layout.tsx` | "Project Planning" | pricing intro | yes | "Pricing" | none | PASS (twitter card FIXED) |
| `/seasonal-guide` | `app/seasonal-guide/page.tsx` | "Idaho Remodeling Seasonal Guide" | spring/summer/fall/winter | yes | "Seasonal Remodeling Guide" | none | PASS |
| `/commercial` | `app/commercial/page.tsx` | "Commercial Remodeling in Kuna" | B2B intro | yes | "Commercial Services" | none | PASS |
| `/commercial/hoa-services` | `app/commercial/hoa-services/page.tsx` | "HOA Remodeling Services" | HOA package | yes | "HOA Services" | none | PASS |
| `/commercial/municipal-services` | `app/commercial/municipal-services/page.tsx` | "Municipal Remodeling Contracts" | municipal package | yes | "Municipal Services" | none | PASS |
| `/privacy-policy` | `app/privacy-policy/page.tsx` | "Privacy Policy" | full policy | yes | "Privacy Policy" | none | PASS (robots:noindex,follow recommended; LOGGED) |
| `/terms-of-service` | `app/terms-of-service/page.tsx` | "Terms of Service" | full TOS | yes | "Terms of Service" | none | PASS (LOGGED noindex,follow recommended) |

No defects discovered on these pages. Logged follow-ups are quality polish, not blockers.
