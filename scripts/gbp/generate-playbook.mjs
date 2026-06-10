/**
 * Generates docs/GBP-PLAYBOOK.md and refreshes docs/GBP-LAUNCH.md from shared/gbpConfig.ts.
 * Run: npx tsx scripts/gbp/generate-playbook.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");
const docsDir = path.join(root, "docs");

// Dynamic import of TS config via tsx when run with npx tsx
const {
  GBP_PROFILE,
  GBP_BUSINESS_DESCRIPTION,
  GBP_SERVICE_AREAS,
  GBP_SERVICES,
  GBP_DOOR_PRODUCTS,
  GBP_BONUS_PRODUCTS,
  GBP_QA_SEEDS,
  GBP_NAP_BLOCK,
  GBP_COMPLETENESS_CHECKLIST,
  gbpUrl,
} = await import("../../shared/gbpConfig.ts");

function serviceTable(services) {
  return services
    .map(
      (s) =>
        `| ${s.name} | ${s.description} | ${gbpUrl(s.path, s.campaign)} |`,
    )
    .join("\n");
}

function productTable(products) {
  return products
    .map(
      (p) =>
        `| ${p.name} | ${p.description} | ${gbpUrl(p.path, p.campaign)} | ${p.imagePath} |`,
    )
    .join("\n");
}

function qaSection() {
  return GBP_QA_SEEDS.map(
    (qa, i) => `### Q${i + 1}: ${qa.question}\n\n> ${qa.answer}`,
  ).join("\n\n");
}

const PLAYBOOK = `# Boise Cabinet Co: Complete GBP Optimization Playbook

> Auto-generated from [\`shared/gbpConfig.ts\`](../shared/gbpConfig.ts). Regenerate: \`npm run gbp:docs\`

End-to-end Google Business Profile setup. Copy values exactly to keep NAP aligned with the website.

**Related docs:** [GBP-LEGACY-AUDIT.md](./GBP-LEGACY-AUDIT.md) (run first) · [GBP-LAUNCH.md](./GBP-LAUNCH.md) (quick copy-paste reference)

---

## Phase 0: Pre-Launch Audit

1. Complete [GBP-LEGACY-AUDIT.md](./GBP-LEGACY-AUDIT.md)
2. Gather assets: run \`npm run gbp:photos\` → uploads from \`public/gbp-upload/\`
3. Go to [business.google.com](https://business.google.com) and claim or create your profile

---

## Phase 1: Core Profile Setup

| Field | Value |
|---|---|
| Business name | \`${GBP_PROFILE.businessName}\` |
| Legal name | \`${GBP_PROFILE.legalName}\` |
| Business type | ${GBP_PROFILE.businessType} |
| Address on file | ${GBP_PROFILE.addressOnFile} |
| Phone | ${GBP_PROFILE.phone} |
| Email | ${GBP_PROFILE.email} |
| Website | \`${GBP_PROFILE.websiteUrl}\` |
| Appointment link | \`${GBP_PROFILE.appointmentUrl}\` |
| Opening date | ${GBP_PROFILE.openingDate} |

### Categories

- **Primary:** ${GBP_PROFILE.primaryCategory}
- **Secondary:** ${GBP_PROFILE.secondaryCategories.join(", ")}

---

## Phase 2: Service Areas (9 cities)

| City | County | GBP label | Guide URL |
|---|---|---|---|
${GBP_SERVICE_AREAS.map((a) => `| ${a.name} | ${a.county} | ${a.gbpLabel} | \`${gbpUrl(a.guidePath, `guide-${a.name.toLowerCase().replace(/\s+/g, "-")}`)}\` |`).join("\n")}

Service radius: **${GBP_PROFILE.serviceRadiusMiles} miles** (city list is preferred over a vague region label).

---

## Phase 3: Hours and Attributes

| Day | Hours |
|---|---|
| Monday | ${GBP_PROFILE.hours.monday} |
| Tuesday | ${GBP_PROFILE.hours.tuesday} |
| Wednesday | ${GBP_PROFILE.hours.wednesday} |
| Thursday | ${GBP_PROFILE.hours.thursday} |
| Friday | ${GBP_PROFILE.hours.friday} |
| Saturday | ${GBP_PROFILE.hours.saturday} |
| Sunday | ${GBP_PROFILE.hours.sunday} |

**Attributes:** Online estimates → \`${GBP_PROFILE.estimateUrl}\` · Onsite services → Yes

**Payment methods:** ${GBP_PROFILE.paymentMethods.join(", ")}

---

## Phase 4: Business Description (${GBP_BUSINESS_DESCRIPTION.length} chars)

> ${GBP_BUSINESS_DESCRIPTION}

---

## Phase 5: Services (11 core + bonus)

Paste each description into GBP **Edit profile → Services** and add the full URL.

### Core services

| GBP service | Description | Link |
|---|---|---|
${serviceTable(GBP_SERVICES.filter((s) => s.priority === "core"))}

### Bonus services (if GBP allows more slots)

| GBP service | Description | Link |
|---|---|---|
${serviceTable(GBP_SERVICES.filter((s) => s.priority === "bonus"))}

---

## Phase 6: Products

### Core products (6 door styles)

| Product | Description | Link | Photo source |
|---|---|---|---|
${productTable(GBP_DOOR_PRODUCTS)}

### Bonus products

| Product | Description | Link | Photo source |
|---|---|---|---|
${productTable(GBP_BONUS_PRODUCTS)}

**Pricing:** Leave blank or "Contact for quote". Do not publish misleading fixed prices.

---

## Phase 7: Photos

1. Run \`npm run gbp:photos\` to build \`public/gbp-upload/\` (${GBP_COMPLETENESS_CHECKLIST.find((c) => c.includes("20+")) ? "20+" : "20"} files minimum)
2. Upload as **owner** photos in GBP
3. Add your own before/after install photos with city names in filenames
4. Set logo (\`logo-boise-cabinet-co-idaho.png\`) and cover (\`cover-custom-kitchen-cabinets-treasure-valley-idaho.webp\`)

---

## Phase 8: Q&A (seed 8 questions)

Post each question as a customer, then answer as the business:

${qaSection()}

---

## Phase 9: Social Profiles

| Platform | URL |
|---|---|
| Facebook | ${GBP_PROFILE.social.facebook} |
| Instagram | ${GBP_PROFILE.social.instagram} |

---

## Phase 10: Messaging

Enable **Chat** in GBP. Welcome message:

> ${GBP_PROFILE.messagingWelcome}

Appointment button: \`${GBP_PROFILE.appointmentUrl}\`

---

## Phase 11: Verification

1. Complete Google verification (postcard, phone, email, or video)
2. Search \`Boise Cabinet Co\` in Google Maps to confirm
3. Copy your public GBP URL
4. Set \`NEXT_PUBLIC_GBP_URL\` in production (see Phase 14)

---

## Phase 12: Post-Launch Cadence

- **1 GBP post per week:** rotate project showcases (name the city), guide links, door/finish highlights, seasonal tips
- **Reviews:** request after every install; respond within 48 hours mentioning service + city
- **Photos:** add 2-4 new owner photos per month from active projects
- At **5+ reviews:** set \`NEXT_PUBLIC_REVIEW_RATING\` and \`NEXT_PUBLIC_REVIEW_COUNT\`

### Post CTA URLs

| CTA | URL |
|---|---|
| Book consultation | \`${GBP_PROFILE.appointmentUrl}\` |
| Cost guide | \`${gbpUrl("/guides/boise-cabinet-cost-guide", "post-cost-guide")}\` |
| Kitchen guide | \`${gbpUrl("/guides/boise-kitchen-cabinet-guide", "post-kitchen-guide")}\` |
| ROI guide | \`${gbpUrl("/guides/cabinet-roi-guide-boise", "post-roi-guide")}\` |

---

## Phase 13: NAP Consistency

\`\`\`
${GBP_NAP_BLOCK}
\`\`\`

**Citation priority:** Google Business Profile → Bing Places (import from GBP) → Apple Business Connect → Facebook → Instagram → Yelp → Houzz → BBB → Nextdoor

---

## Phase 14: Website Integration (after GBP is live)

| Task | Env variable |
|---|---|
| GBP profile URL | \`NEXT_PUBLIC_GBP_URL\` |
| Idaho license # | \`NEXT_PUBLIC_LICENSE_NUMBER\` |
| Review rating (5+ reviews) | \`NEXT_PUBLIC_REVIEW_RATING\` |
| Review count (5+ reviews) | \`NEXT_PUBLIC_REVIEW_COUNT\` |
| Houzz / BBB / Yelp | \`NEXT_PUBLIC_HOUZZ_URL\`, etc. |

---

## Phase 15: What NOT to Do

- Do not keyword-stuff the business name
- Do not publish a street address (SAB, no public showroom)
- Do not claim Boise Cabinet Inc listings
- Do not leave Boise Remodeling Co NAP live
- Do not use fake reviews or fabricated schema ratings

---

## Profile Completeness Checklist

${GBP_COMPLETENESS_CHECKLIST.map((item) => `- [ ] ${item}`).join("\n")}
`;

const LAUNCH = `# Google Business Profile Launch Kit - Boise Cabinet Co

Quick copy-paste reference. Full step-by-step workflow: [GBP-PLAYBOOK.md](./GBP-PLAYBOOK.md)

> Auto-generated from [\`shared/gbpConfig.ts\`](../shared/gbpConfig.ts). Regenerate: \`npm run gbp:docs\`

## Before you start

1. [GBP-LEGACY-AUDIT.md](./GBP-LEGACY-AUDIT.md)
2. \`npm run gbp:photos\` → upload from \`public/gbp-upload/\`

## Profile settings

| Field | Value |
|---|---|
| Business name | \`${GBP_PROFILE.businessName}\` |
| Business type | ${GBP_PROFILE.businessType} |
| Address on file | ${GBP_PROFILE.addressOnFile} |
| Service areas | ${GBP_SERVICE_AREAS.map((a) => a.gbpLabel).join(", ")} |
| Phone | ${GBP_PROFILE.phone} |
| Website | \`${GBP_PROFILE.websiteUrl}\` |
| Appointment link | \`${GBP_PROFILE.appointmentUrl}\` |
| Hours | Mon-Fri 7:00 AM - 6:00 PM, Sat 8:00 AM - 4:00 PM, Sun closed |
| Opening date | ${GBP_PROFILE.openingDate} |

## Categories

- Primary: **${GBP_PROFILE.primaryCategory}**
- Secondary: ${GBP_PROFILE.secondaryCategories.join(", ")}

## Business description (${GBP_BUSINESS_DESCRIPTION.length} chars)

> ${GBP_BUSINESS_DESCRIPTION}

## Services (core)

| GBP service | Description | Link |
|---|---|---|
${serviceTable(GBP_SERVICES.filter((s) => s.priority === "core"))}

## Products (door styles)

| Product | Link |
|---|---|
${GBP_DOOR_PRODUCTS.map((p) => `| ${p.name} | ${gbpUrl(p.path, p.campaign)} |`).join("\n")}

## Q&A seeds

${GBP_QA_SEEDS.map((qa, i) => `${i + 1}. ${qa.question}`).join("\n")}

Full answers: [GBP-PLAYBOOK.md#phase-8-qa-seed-8-questions](./GBP-PLAYBOOK.md)

## Messaging welcome

> ${GBP_PROFILE.messagingWelcome}

## Post-launch

- 1 GBP post/week · respond to reviews within 48h
- At 5+ reviews: \`NEXT_PUBLIC_REVIEW_RATING\` + \`NEXT_PUBLIC_REVIEW_COUNT\`
- Set \`NEXT_PUBLIC_GBP_URL\` after verification
- Import to Bing Places + Apple Business Connect
`;

fs.writeFileSync(path.join(docsDir, "GBP-PLAYBOOK.md"), PLAYBOOK);
fs.writeFileSync(path.join(docsDir, "GBP-LAUNCH.md"), LAUNCH);
console.log("Wrote docs/GBP-PLAYBOOK.md and docs/GBP-LAUNCH.md");
