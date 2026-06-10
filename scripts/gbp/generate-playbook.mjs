/**
 * Regenerates docs/GBP-SETUP-GUIDE.md from shared/gbpConfig.ts (plain-language, no code).
 * Run: npx tsx scripts/gbp/generate-playbook.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.join(__dirname, "../../docs");

const {
  GBP_PROFILE,
  GBP_BUSINESS_DESCRIPTION,
  GBP_SERVICE_AREAS,
  GBP_SERVICES,
  GBP_DOOR_PRODUCTS,
  GBP_BONUS_PRODUCTS,
  GBP_QA_SEEDS,
  GBP_COMPLETENESS_CHECKLIST,
} = await import("../../shared/gbpConfig.ts");

const site = "https://boisecabinet.co";

function page(path) {
  return `${site}${path}`;
}

function serviceBlock(s, index) {
  return `---

**Service ${index}: ${s.name}**

Description:
${s.description}

Link: ${page(s.path)}

`;
}

function productBlock(p, index) {
  return `---

**Product ${index}: ${p.name}**

Description:
${p.description}

Link: ${page(p.path)}

`;
}

const qaBlocks = GBP_QA_SEEDS.map(
  (qa, i) => `---

**Question ${i + 1}:** ${qa.question}

**Answer:**
${qa.answer}

`,
).join("");

const GUIDE = `# Boise Cabinet Co — Google Business Profile Setup Guide

Your complete, step-by-step guide to creating and optimizing your Google Business Profile. Work through each section in order. Copy the text exactly as written so your profile matches your website and all other listings.

---

## Before You Begin

### Step 1: Check for conflicting listings

Search Google Maps and Google for each of these before creating anything new:

1. **Boise Remodeling Co** — This is your old business name. If you find it, claim the listing and update it, or request removal. The old phone number was (208) 352-2011. Your correct number is ${GBP_PROFILE.phone}.
2. **Boise Cabinet Co** — If a profile already exists, claim it. If not, you will create a new one.
3. **Boise Cabinet Inc** in Garden City — This is a **different company** with phone (208) 323-0010. Never claim or merge their listing.

Also search Yelp and YellowPages for "Boise Remodeling Co" and correct anything you find.

### Step 2: Gather your photos

Collect these before you open Google Business Profile:

- Your company logo
- Your best wide kitchen photo (for the cover image)
- At least 10 kitchen project photos (before/after if possible)
- At least 4 bathroom vanity photos
- One photo per door style (Slab, 3 Piece, Modern Shaker, Thin Shaker, Alpha Shaker, Beta Shaker)
- 6–8 finish close-ups (matte, gloss, and woodgrain examples)
- Team photo and installation/shop photos

Rename every photo before uploading. Use this pattern: what it shows, then city, then Idaho.

Examples:
- custom-kitchen-cabinets-boise-idaho-modern-shaker.jpg
- bathroom-vanity-cabinets-meridian-idaho.jpg
- frameless-cabinet-installation-eagle-idaho.jpg

### Step 3: Sign in to Google Business Profile

1. Go to business.google.com
2. Sign in with the Google account you will use long-term (prefer a business account you will not lose access to)
3. Click **Add your business to Google**, or **Manage now** if a listing already exists

---

## Section 1: Create Your Profile

### Step 4: Enter your business name

Type exactly:

**${GBP_PROFILE.businessName}**

Rules:
- Do not add keywords (wrong example: "Boise Cabinet Co | Custom Kitchen Cabinets Boise")
- Must match your LLC: ${GBP_PROFILE.legalName}
- Must match your website branding

### Step 5: Choose your business type

You do not have a public showroom. Customers visit their homes for consultations.

1. When asked "Do you have a location customers can visit?" — select **No**
2. Choose **Service-area business**
3. **Hide your street address** from the public profile
4. Keep Meridian, ID on file internally for verification only — do not show it publicly on the profile

### Step 6: Set your primary category

**${GBP_PROFILE.primaryCategory}**

Do not use General contractor or Home improvement store as your primary category.

### Step 7: Add secondary categories

Add all four of these:

${GBP_PROFILE.secondaryCategories.map((c, i) => `${i + 1}. ${c}`).join("\n")}

### Step 8: Enter your phone number

**${GBP_PROFILE.phone}**

Use this exact number on your website, Google profile, invoices, and every other listing.

### Step 9: Enter your website

**${site}**

### Step 10: Set your appointment link

**${page("/contact")}**

This is the Book button on your profile. It should go to your consultation request page.

### Step 11: Enter your opening date

**${GBP_PROFILE.openingDate}**

---

## Section 2: Service Areas

### Step 12: Add all nine service areas

In your profile, go to Edit profile → Location → Service area. Add each city:

| City | Add as |
|---|---|
${GBP_SERVICE_AREAS.map((a) => `| ${a.name} | ${a.gbpLabel} |`).join("\n")}

You serve within roughly ${GBP_PROFILE.serviceRadiusMiles} miles of the Treasure Valley. Listing each city is better than only writing "Treasure Valley."

---

## Section 3: Hours, Attributes, and Payment

### Step 13: Set your regular hours

| Day | Hours |
|---|---|
| Monday | ${GBP_PROFILE.hours.monday} |
| Tuesday | ${GBP_PROFILE.hours.tuesday} |
| Wednesday | ${GBP_PROFILE.hours.wednesday} |
| Thursday | ${GBP_PROFILE.hours.thursday} |
| Friday | ${GBP_PROFILE.hours.friday} |
| Saturday | ${GBP_PROFILE.hours.saturday} |
| Sunday | ${GBP_PROFILE.hours.sunday} |

Update special hours for holidays and any days your shop or office is closed.

### Step 14: Turn on business attributes

| Attribute | Setting |
|---|---|
| Online estimates | Yes |
| Onsite services | Yes |
| Identifies as family-owned | Only if true |
| Identifies as veteran-owned | Only if true |

Do not claim anything you cannot back up.

### Step 15: Add payment methods (if prompted)

${GBP_PROFILE.paymentMethods.join(", ")}

---

## Section 4: Business Description

### Step 16: Paste your business description

Google allows up to 750 characters. Copy this entire paragraph into your profile description:

${GBP_BUSINESS_DESCRIPTION}

Do not put your phone number or website URL inside the description. Google has separate fields for those.

---

## Section 5: Services

### Step 17: Add your services

Go to Edit profile → Services. For each service below, click Add a custom service, paste the description, and add the website link.

${GBP_SERVICES.filter((s) => s.priority === "core").map((s, i) => serviceBlock(s, i + 1)).join("")}

### Optional bonus services (add if Google allows more)

| Service | Link |
|---|---|
${GBP_SERVICES.filter((s) => s.priority === "bonus").map((s) => `| ${s.name} | ${page(s.path)} |`).join("\n")}

---

## Section 6: Products

### Step 18: Add your door style products

Go to Edit profile → Products → Add product. Each product needs a name, description, photo, and link. Leave price blank or use "Contact for quote."

${GBP_DOOR_PRODUCTS.map((p, i) => productBlock(p, i + 1)).join("")}

### Optional bonus products

| Product | Description | Link |
|---|---|---|
${GBP_BONUS_PRODUCTS.map((p) => `| ${p.name} | ${p.description} | ${page(p.path)} |`).join("\n")}

---

## Section 7: Photos and Video

### Step 19: Upload at least 20 photos

Upload photos from your owner account so they show as "By owner."

| What to upload | How many |
|---|---|
| Logo | 1 |
| Cover photo (best wide kitchen shot) | 1 |
| Kitchen project photos | 8 or more |
| Bathroom vanity photos | 4 or more |
| Installation and shop photos | 3 or more |
| Team photo | 1–2 |
| Door style photos | 6 (one per style) |
| Finish swatch close-ups | 6–8 |

Name every file descriptively before uploading (see Step 2).

### Step 20: Optional video

Upload one or two short videos (30–60 seconds):
- Walkthrough of a completed kitchen (name the city in the title)
- Door style and finish comparison

Example title: Custom Kitchen Cabinet Install – Eagle, Idaho – Boise Cabinet Co

---

## Section 8: Questions and Answers

### Step 21: Seed your Q&A section

Have a friend post each question below as a customer. Then answer as the business, copying your answer exactly.

${qaBlocks}

### Bonus questions to add after launch

- Do you offer closet, laundry, and mudroom cabinets? (Yes — link to ${page("/cabinets")})
- Can I design my cabinets online before committing? (Yes — link to ${page("/design-studio")})
- What door styles and finishes are available? (Six styles, 299 finishes — link to ${page("/finishes")})

---

## Section 9: Social Profiles and Messaging

### Step 22: Link your social accounts

| Platform | URL |
|---|---|
| Facebook | ${GBP_PROFILE.social.facebook} |
| Instagram | ${GBP_PROFILE.social.instagram} |

Make sure both pages use the same business name, phone, and website before linking.

### Step 23: Enable messaging

Turn on Chat in your Google profile. Set this automated welcome message:

${GBP_PROFILE.messagingWelcome}

Respond to messages within 24 hours (same business day is ideal).

### Step 24: Confirm your appointment button

Your Book button should link to: ${page("/contact")}

---

## Section 10: Verification

### Step 25: Complete Google verification

Google will verify your business by postcard, phone, email, or video. Use your Meridian address on file. Do not change your business name or address during verification.

### Step 26: Confirm your profile is live

1. Search "Boise Cabinet Co" in Google Maps
2. Check that your name, phone, hours, and service areas look correct
3. Confirm your street address is hidden
4. Save your public Google profile link — you will need it for citations and review requests

---

## Section 11: After You Go Live

### Step 27: Replicate your listing elsewhere

Import or manually create matching listings on:

1. Bing Places (import from Google)
2. Apple Business Connect (import from Google)
3. Facebook Business Page
4. Instagram business profile
5. Yelp
6. Houzz
7. BBB
8. Nextdoor Business

Use this exact information everywhere:

- **Business name:** ${GBP_PROFILE.businessName}
- **Phone:** ${GBP_PROFILE.phone}
- **Email:** ${GBP_PROFILE.email}
- **Website:** ${site}
- **Location:** Meridian, ID (service-area business; no street address published)

### Step 28: Publish your first Google post

Post a completed project photo with the city named. Example text:

Custom Modern Shaker kitchen cabinets installed in Meridian, Idaho. Frameless construction, soft-close hardware, white oak finish. Ready to plan your project?

Set the button to **Book** and link to ${page("/contact")}

### Step 29: Set up your weekly posting rhythm

Post once per week. Rotate through these four types:

**Week A — Project showcase**
Photo of a completed kitchen or bath. Name the city. Button: Book → ${page("/contact")}

Rotate cities: Boise → Meridian → Eagle → Nampa → Kuna → Star → Middleton → Caldwell

**Week B — Helpful guide**
Example: "Planning a kitchen remodel in Boise? Our cost guide covers timelines and what to expect."
Link to: ${page("/guides/boise-cabinet-cost-guide")}

**Week C — Product highlight**
Feature a door style or finish with a photo. Link to the matching page on boisecabinet.co

**Week D — Seasonal tip**
Examples: spring kitchen planning, holiday pantry organization, outdoor kitchen season in Idaho.
Button: Book → ${page("/contact")}

### Step 30: Start collecting reviews

After every completed install:
1. Send the homeowner a direct link to leave a Google review
2. Respond to every review within 48 hours
3. Mention the service type and city in your response

Review response template:

Thank you, [Name]! It was a pleasure designing and installing your [kitchen/vanity] cabinets in [City]. We appreciate you trusting Boise Cabinet Co with your home.

### Step 31: Keep adding photos

Upload 2–4 new owner photos every month from active projects. Fresh photos signal an active, trustworthy business.

---

## Section 12: What Not to Do

- Do not add keywords to your business name
- Do not publish a street address (you are a service-area business with no public showroom)
- Do not claim Boise Cabinet Inc's listings
- Do not leave old Boise Remodeling Co listings live with the wrong phone or name
- Do not buy or fake reviews
- Do not use a different phone number on Google than on your website

---

## Final Checklist

Work through this list before you consider your profile complete.

${GBP_COMPLETENESS_CHECKLIST.map((item) => `- [ ] ${item.replace(/NEXT_PUBLIC_GBP_URL/g, "Google profile link saved for website team")}`).join("\n")}

---

*${GBP_PROFILE.businessName} · ${GBP_PROFILE.phone} · ${GBP_PROFILE.email} · boisecabinet.co*
`;

fs.writeFileSync(path.join(docsDir, "GBP-SETUP-GUIDE.md"), GUIDE);
console.log("Wrote docs/GBP-SETUP-GUIDE.md");
