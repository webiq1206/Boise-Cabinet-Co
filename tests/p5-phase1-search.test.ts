import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { withBrandPageMetadata } from "../lib/brand-page-metadata";
import { PHASE1_ANSWERS } from "../lib/phase1Answers";
import { PHASE1_DESCRIPTIONS, PHASE1_TITLES } from "../lib/phase1SearchCopy";
import { CABINET_PRODUCTS } from "../shared/catalog";
import { ROOM_SEO } from "../shared/catalog/roomSeo";
import { LLMS_TXT } from "../shared/llmsTxt";
import { SITE_CONFIG } from "../shared/siteConfig";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Footer } from "../components/Footer.tsx";

(globalThis as typeof globalThis & { React: typeof React }).React = React;
/** The footer is the shared family SiteFooter (lib/familyBrand.ts), so its rendered HTML is what is checked. */
const renderFooter = () => renderToStaticMarkup(React.createElement(Footer));

const BRAND = " | Boise Cabinet Co";
const C13_PATHS = new Set([
  "/blog/bathroom-vanity-cost-boise",
  "/blog/whole-home-cabinet-cost-boise",
  "/blog/what-impacts-cabinet-costs-boise",
  "/blog/how-to-budget-cabinets-boise",
  "/blog/luxury-bathroom-vanity-guide",
  "/blog/small-bathroom-vanity-ideas",
  "/blog/accessible-bathroom-vanity-guide",
  "/blog/bathroom-vanity-layout-guide",
  "/blog/primary-suite-closet-cabinets",
  "/blog/garage-storage-cabinet-systems",
  "/blog/multi-room-cabinet-planning",
  "/blog/outdoor-kitchen-cabinets-boise",
  "/blog/outdoor-bar-cabinet-storage",
  "/blog/premium-outdoor-cabinetry",
  "/blog/fixed-price-vs-cost-plus",
  "/blog/cabinet-finishes-door-styles-guide",
  "/blog/cabinet-measurement-design-phase",
  "/blog/cabinet-design-development",
  "/blog/cabinet-fabrication-installation",
  "/blog/cabinet-installation-punch-list",
  "/blog/cabinet-upgrades-before-selling",
  "/blog/cabinets-for-long-term-living",
  "/guides/boise-bathroom-vanity-guide",
  "/guides/whole-home-cabinetry-guide",
  "/guides/choose-cabinet-company-boise",
  "/guides/cabinet-roi-guide-boise",
  "/blog/category/choosing-cabinet-company",
  "/blog/category/cabinet-project-process",
  "/blog/category/cabinet-roi",
]);
const VANITY_NAMES = [
  "Vanity Cabinet, 1 Door + 1 Drawer",
  "Vanity Cabinet, 2 Doors + 1 Drawer",
  "Vanity Cabinet, 1 Door + 2 Drawers",
  "Vanity Cabinet, 2 Doors + 2 Drawers",
];

function words(text: string): number {
  return text.trim().split(/\s+/).length;
}

test("phase-1 titles and descriptions stay in range and unique", () => {
  const titles = Object.values(PHASE1_TITLES);
  const descriptions = Object.entries(PHASE1_DESCRIPTIONS);
  assert.equal(titles.length, 32);
  assert.equal(descriptions.length, 61 + C13_PATHS.size);
  assert.equal(new Set(titles).size, titles.length);
  assert.equal(new Set(descriptions.map(([, description]) => description)).size, descriptions.length);
  for (const title of titles) {
    const rendered = title.length + BRAND.length;
    assert.ok(rendered >= 50 && rendered <= 60, `${rendered} ${title}`);
    assert.equal(title.includes("\u2014"), false);
    assert.equal(title.includes("\u2013"), false);
  }
  for (const [path, description] of descriptions) {
    const expanded = C13_PATHS.has(path);
    const min = expanded ? 120 : 150;
    const max = expanded ? 155 : 160;
    assert.ok(description.length >= min && description.length <= max, `${description.length} ${path}`);
    assert.equal(description.includes("\u2014"), false);
    assert.equal(description.includes("\u2013"), false);
  }
});

test("phase-1 metadata overlay replaces long tags and keeps brand copy overrides", () => {
  const painted = withBrandPageMetadata(
    {
      title: "How to Paint Kitchen Cabinets: Pro Steps for a Finish That Lasts",
      description: "short",
      alternates: { canonical: "https://boisecabinet.co/blog/how-to-paint-kitchen-cabinets" },
    },
    "/blog/[slug]",
  );
  assert.equal(painted.title, PHASE1_TITLES["/blog/how-to-paint-kitchen-cabinets"]);
  assert.equal(painted.description, PHASE1_DESCRIPTIONS["/blog/how-to-paint-kitchen-cabinets"]);

  // Phase 4: room titles and descriptions moved out of the brand override into
  // shared/catalog/roomSeo.ts (one source for all 13 room pages), so the
  // wrapper now passes the page's own kitchen metadata through untouched. The
  // old kitchen description was 165 characters; the plan trimmed it.
  const kitchen = withBrandPageMetadata(
    {
      title: ROOM_SEO.kitchen.title,
      description: ROOM_SEO.kitchen.description,
      alternates: { canonical: "https://boisecabinet.co/cabinets/kitchen" },
    },
    "/cabinets/[room]",
  );
  assert.equal(kitchen.title, "Custom Kitchen Cabinets in Boise");
  assert.equal(
    kitchen.description,
    "A kitchen that fits how you cook, with custom cabinets planned around your layout and installed by our crew. Free design consult, written price first.",
  );
});

test("room titles carry the city and a benefit within 60 rendered characters", () => {
  assert.equal(Object.keys(ROOM_SEO).length, 13);
  const titles = Object.values(ROOM_SEO).map((room) => room.title);
  assert.equal(new Set(titles).size, titles.length);
  for (const room of Object.values(ROOM_SEO)) {
    if (room.title === "Custom Kitchen Cabinets in Boise" || room.title === "Custom Pantry Cabinets in Boise") {
      assert.equal(room.title.includes("|"), false, room.title);
    } else {
      assert.match(room.title, /^[A-Z][^|]* Boise \| [A-Z]/, room.title);
    }
    assert.ok(room.title.length + BRAND.length <= 60, `${room.title.length + BRAND.length} ${room.title}`);
    assert.match(`${room.h1Lead} Boise, Idaho`, /cabinets in Boise, Idaho$/);
    assert.doesNotMatch(room.phrase, /ins cabinets/);
    if (room.description) assert.ok(room.description.length >= 120 && room.description.length <= 155, room.description);
  }
});

test("phase-1 answer blocks are 40 to 60 words and use no em dashes", () => {
  assert.equal(PHASE1_ANSWERS.length, 7);
  for (const block of PHASE1_ANSWERS) {
    const count = words(block.paragraph);
    assert.ok(count >= 40 && count <= 60, `${count} ${block.heading}`);
    assert.ok(block.faqs.length >= 3 && block.faqs.length <= 5, block.heading);
    const text = `${block.heading} ${block.paragraph} ${block.faqs.map((faq) => `${faq.question} ${faq.answer}`).join(" ")}`;
    assert.equal(text.includes("\u2014"), false);
    assert.equal(text.includes("Jared"), false);
    assert.equal(text.includes("Perkins"), false);
    assert.equal(text.includes("Garden City"), false);
  }
});

test("bathroom vanity FAQ names products that exist in the catalog", () => {
  const names = new Set(CABINET_PRODUCTS.map((product) => product.name));
  for (const name of VANITY_NAMES) assert.equal(names.has(name), true, name);
  const faqs = readFileSync("shared/catalog/roomFaqs.ts", "utf8");
  for (const name of VANITY_NAMES) assert.equal(faqs.includes(name), true);
  assert.equal(faqs.includes("How much does a custom bathroom vanity cost in Boise?"), true);
});

test("IndexNow ping is bundled on startup and logs status", () => {
  const key = "bf5008c034e54394850021f302ce4416";
  assert.equal(readFileSync(`public/${key}.txt`, "utf8").trim(), key);
  const script = readFileSync("scripts/submit-indexnow.mjs", "utf8");
  assert.equal(script.includes(key), true);
  assert.equal(script.includes("export default async function submit"), true);
  assert.equal(script.includes("function isDirectRun()"), true);
  const boot = readFileSync("instrumentation.ts", "utf8");
  assert.equal(boot.includes('import("./scripts/submit-indexnow.mjs")'), true);
  assert.equal(boot.includes("[startup] IndexNow status: HTTP"), true);
  assert.equal(boot.includes("if (!dbUrl) return;"), true);
  assert.equal(boot.includes('NEXT_RUNTIME === "nodejs"'), true);
  assert.equal(boot.includes('NODE_ENV === "production"'), true);
});

test("llms files and the footer publish useful contacts without a private street or administrative labels", () => {
  for (const fact of ["hello@boisecabinet.co", "(208) 477-1169", "Service area:", "8381215"]) {
    assert.equal(LLMS_TXT.includes(fact), true, fact);
  }
  assert.equal(/Wapoot|4031|Public representative|no public showroom|staffed storefront/.test(LLMS_TXT), false);
  // Phase 4: llms.txt is generated from content at build, so "Last updated" is
  // the build date rather than the hand-set 2026-10-16 this used to pin.
  assert.match(LLMS_TXT, /Last updated: \d{4}-\d{2}-\d{2}/);
  assert.equal(LLMS_TXT.includes("Jared"), false);
  const full = readFileSync("app/llms-full.txt/route.ts", "utf8");
  assert.equal(full.includes("LLMS_TXT.trim()"), true);
  // Phase 2 family chrome: the footer is the shared SiteFooter, so the rendered HTML is checked.
  // The family row names every company with a site; Boise ADU Co is left out until its own site
  // exists (family rollout brief), so the old "Boise ADU Co (projects currently run through Boise
  // Construction Co)" line is intentionally gone.
  const footer = renderFooter();
  assert.equal(footer.includes(`href="mailto:${SITE_CONFIG.email}"`), true);
  assert.equal(footer.includes(`>${SITE_CONFIG.email}</a>`), true);
  assert.equal(/Public representative|Wapoot|staffed storefront/.test(footer), false);
  assert.equal(footer.includes("Serving Boise and the Treasure Valley"), true);
  assert.equal(footer.includes("The P5 Home Co family"), true);
  assert.equal(footer.includes('href="https://p5homeco.com" rel="noopener">P5 Home Co</a>'), true);
  assert.equal(footer.includes('href="https://boiseconstruction.co" rel="noopener">Boise Construction Co</a>'), true);
  assert.equal(footer.includes('href="https://boiseremodeling.co" rel="noopener">Boise Remodeling Co</a>'), true);
  assert.equal(footer.includes('href="https://boisehandyman.co" rel="noopener">Boise Handyman Co</a>'), true);
  assert.match(footer, /<span class="fam-footer-current" aria-current="true">Boise Cabinet Co<\/span>/);
  assert.equal(footer.includes("Boise ADU Co"), false);
  assert.equal(footer.includes("https://boiseadu"), false);
  const contact = readFileSync("app/contact/page.tsx", "utf8");
  assert.equal(contact.includes("{SITE_CONFIG.email}"), true);
  assert.equal(contact.includes("No public showroom."), false);
  assert.equal(contact.includes("SiteEmailLink"), false);
});

test("home title and H1 preserve current custom-cabinet identity and quote entry", () => {
  const home = withBrandPageMetadata(
    { title: "Home", description: "fallback", alternates: { canonical: "https://boisecabinet.co/" } },
    "/",
  );
  assert.deepEqual(home.title, { absolute: "Boise Cabinets, Built to Order | Boise Cabinet Co" });
  assert.equal(
    home.description,
    "Kitchen cabinets, vanities and built-ins designed to your measurements and installed by our own crew. Free in-home design consult, written price first.",
  );
  const hero = readFileSync("components/approved/ApprovedHome.tsx", "utf8");
  // The site-owned video hero preserves the same H1 and exact accent line.
  assert.match(hero, /id="family-hero-title">Custom cabinets in Boise,[\s\S]*?className="fam-hero-accent">Idaho<\/span><\/h1>/);
  assert.equal(hero.includes("designs custom cabinets to your measurements"), true);
  assert.equal(hero.includes("Written price before work"), true);
  assert.equal(hero.includes("IDAHO_REGISTERED_CONTRACTOR"), true);
  assert.equal(hero.includes("Bonded & insured"), false);
  assert.equal(hero.includes('"/cabinets/kitchen"'), true);
  assert.equal(hero.includes('id="cabinetry"'), true);
  assert.match(hero, /href="\/estimate" data-cta="primary"/);
  assert.equal(hero.includes("Custom kitchen cabinets, bathroom vanities, and built-in storage."), true);
  assert.equal(hero.includes("Jared"), false);
  assert.equal(hero.includes("\u2014"), false);
  const contact = withBrandPageMetadata(
    { title: "Contact", alternates: { canonical: "https://boisecabinet.co/contact" } },
    "/contact",
  );
  assert.deepEqual(contact.title, { absolute: "Contact Our Boise Custom Cabinet Team | Boise Cabinet Co" });
  const shell = readFileSync("components/portal/PortalShell.tsx", "utf8");
  assert.equal(shell.includes("isAuthenticated"), true);
  assert.equal(shell.includes('href="/api/logout"'), true);
  const gate = readFileSync("components/portal/PortalAuthGate.tsx", "utf8");
  assert.equal(gate.includes('href="/login'), false);
  assert.equal(gate.includes("window.location.assign(loginHref)"), true);
  const estimate = readFileSync("app/estimate/page.tsx", "utf8");
  assert.equal(estimate.includes("<h1"), true);
  assert.match(estimate, /<EstimateCalculatorWizard fitViewport\s*\/>/);
  const wizard = readFileSync("components/estimate/EstimateCalculatorWizard.tsx", "utf8");
  assert.match(wizard, /<GuidedFlowShell/);
  const guided = readFileSync("components/guided-flow/GuidedFlowShell.tsx", "utf8");
  assert.equal((guided.match(/<h2\b/g) || []).length, 2, "Both guided layouts retain subordinate headings");
  assert.doesNotMatch(guided, /<h1\b/);
  const login = readFileSync("app/login/layout.tsx", "utf8");
  assert.equal(login.includes("<h1"), true);
});
