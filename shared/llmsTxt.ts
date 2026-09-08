// Single source of truth for /llms.txt, served via app/llms.txt/route.ts.
// Served through an app route (not public/) because static public/ files are
// not served by the standalone production deploy; app routes are.
//
// Follows the llms.txt spec (llmstxt.org): an H1, a blockquote summary, then
// sections of markdown links. Links MUST be markdown `[title](url)` form, not
// bare paths, or crawlers (and Lighthouse's llms-txt audit) see "no links".
export const LLMS_TXT = `# Boise Cabinet Co

> Idaho's premier custom cabinet company. We design, build, and install frameless, built-to-order kitchen cabinets, bathroom vanities, and built-in storage for Boise and the Treasure Valley.

Full content export for LLMs (every guide answer, article answer, and the complete FAQ corpus in one file): [llms-full.txt](https://boisecabinet.co/llms-full.txt)

## Business facts

- Company: Boise Cabinet Co, a DBA of P5 Home Co LLC
- Founded: 2020
- Based in Meridian, Idaho (service-area business; consultations happen in your home)
- Service area: Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell (Ada and Canyon Counties, Treasure Valley)
- Construction: frameless (European-style) cabinet boxes, soft-close hardware
- Warranty: written workmanship guarantee
- Free in-home design consultation
- Also serve builders, general contractors, and multi-family developers with volume pricing
- Phone: (208) 477-1169
- Email: hello@boisecabinet.co

## Cost planning (Treasure Valley, installed midpoints, updated June 2026)

Planning ranges only; firm quotes require approved drawings.

- Full kitchen cabinets: about $28,000 midpoint ($15,000 to $45,000+ typical, $450 to $900 per linear foot)
- Guest bathroom vanity: about $6,500 midpoint
- Master bathroom vanity: about $14,000 midpoint
- Whole-home cabinet program: about $72,000 midpoint
- Single-room built-ins or closet: about $12,000 midpoint
- Outdoor kitchen cabinets: about $16,000 midpoint
- [Full cabinet cost guide](https://boisecabinet.co/guides/boise-cabinet-cost-guide)

## Cabinets by city

- [Treasure Valley overview](https://boisecabinet.co/guides/treasure-valley-cabinet-guide)
- [Boise cabinet guide](https://boisecabinet.co/locations/boise)
- [Meridian cabinet guide](https://boisecabinet.co/locations/meridian)
- [Eagle cabinet guide](https://boisecabinet.co/locations/eagle)
- [Nampa cabinet guide](https://boisecabinet.co/locations/nampa)
- [Kuna cabinet guide](https://boisecabinet.co/locations/kuna)
- [Star cabinet guide](https://boisecabinet.co/locations/star)
- [Caldwell cabinet guide](https://boisecabinet.co/locations/caldwell)
- [Middleton cabinet guide](https://boisecabinet.co/locations/middleton)

## Catalog

- [Cabinets by room](https://boisecabinet.co/cabinets): kitchen, bathroom, laundry, mudroom, home office, entertainment, built-ins, pantry, closet, garage, outdoor, wet bar, bedroom
- [Full catalog and downloadable PDF](https://boisecabinet.co/catalog): 6 door styles, 299 finishes across matte, gloss, and woodgrain, built-to-order product categories
- [Shaker cabinets](https://boisecabinet.co/shaker-cabinets): four shaker profiles (modern, thin, alpha, beta) across 299 finishes, including white, sage green, and two-tone
- [Hardware and accessories](https://boisecabinet.co/accessories)
- [Frameless cabinet construction](https://boisecabinet.co/construction)
- [Collection and feature comparison](https://boisecabinet.co/compare)

## For builders and contractors

- [Builder and trade program](https://boisecabinet.co/builders): volume pricing for multi-family, apartments, and condos; lead times measured in weeks; consistent specs across units; 50% deposit and 50% after installation

## Tools

- [Project estimate planner](https://boisecabinet.co/estimate)
- [Finish finder and catalog](https://boisecabinet.co/catalog)

## Guides and content

- [Cabinet guides](https://boisecabinet.co/guides): cost, kitchen, bath, built-ins, whole-home, choosing a company, process, and ROI, plus city guides
- [Blog](https://boisecabinet.co/blog): planning, costs, timelines, finishes, and selection advice, organized into topic hubs
- [Planning downloads and checklists](https://boisecabinet.co/resources)

## Trust and company

- [About the company and team](https://boisecabinet.co/about)
- [Projects and reviews](https://boisecabinet.co/testimonials)
- [Warranty details](https://boisecabinet.co/warranty)
- [Contact page](https://boisecabinet.co/contact)

## Contact

- [Website](https://boisecabinet.co)
- [Contact page](https://boisecabinet.co/contact)
- Phone: (208) 477-1169
- Email: hello@boisecabinet.co
`;
