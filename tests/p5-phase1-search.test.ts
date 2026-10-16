import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { withBrandPageMetadata } from "../lib/brand-page-metadata";
import { PHASE1_ANSWERS } from "../lib/phase1Answers";
import { PHASE1_DESCRIPTIONS, PHASE1_TITLES } from "../lib/phase1SearchCopy";
import { CABINET_PRODUCTS } from "../shared/catalog";
import { LLMS_TXT } from "../shared/llmsTxt";

const BRAND = " | Boise Cabinet Co";
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
  const descriptions = Object.values(PHASE1_DESCRIPTIONS);
  assert.equal(titles.length, 32);
  assert.equal(descriptions.length, 61);
  assert.equal(new Set(titles).size, titles.length);
  assert.equal(new Set(descriptions).size, descriptions.length);
  for (const title of titles) {
    const rendered = title.length + BRAND.length;
    assert.ok(rendered >= 50 && rendered <= 60, `${rendered} ${title}`);
    assert.equal(title.includes("\u2014"), false);
    assert.equal(title.includes("\u2013"), false);
  }
  for (const description of descriptions) {
    assert.ok(description.length >= 150 && description.length <= 160, `${description.length} ${description}`);
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

  const kitchen = withBrandPageMetadata(
    {
      title: "Kitchen Cabinets",
      description: "Custom kitchen cabinets from Boise Cabinet Co in the Treasure Valley.",
      alternates: { canonical: "https://boisecabinet.co/cabinets/kitchen" },
    },
    "/cabinets/[room]",
  );
  assert.deepEqual(kitchen.title, { absolute: "Kitchen Cabinets in Boise, Idaho | Boise Cabinet Co" });
  assert.equal(
    kitchen.description,
    "Plan kitchen cabinets for your Boise or Treasure Valley home. Explore frameless construction, door styles, finishes, layout, supply and installation.",
  );
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

test("llms files and the footer publish the public email, address, and representative", () => {
  for (const fact of [
    "hello@boisecabinet.co",
    "4031 W Wapoot St, Meridian, ID 83646",
    "Nick Perkins",
    "no public showroom",
    "Last updated: 2026-10-16",
    "Public representative: Nick Perkins. Service-area business based at 4031 W Wapoot St, Meridian, ID 83646; no public showroom. (208) 477-1169. hello@boisecabinet.co.",
  ]) {
    assert.equal(LLMS_TXT.includes(fact), true, fact);
  }
  assert.equal(LLMS_TXT.includes("Jared"), false);
  const full = readFileSync("app/llms-full.txt/route.ts", "utf8");
  assert.equal(full.includes("LLMS_TXT.trim()"), true);
  const footer = readFileSync("components/Footer.tsx", "utf8");
  assert.equal(footer.includes("mailto:${SITE_CONFIG.email}"), true);
  assert.equal(footer.includes("{SITE_CONFIG.email}"), true);
  assert.equal(footer.includes("Public representative: Nick Perkins · 4031 W Wapoot St, Meridian, ID 83646 · Service-area business, not a staffed storefront"), true);
  assert.equal(footer.includes("Part of"), true);
  assert.equal(footer.includes("https://boiseconstruction.co"), true);
  assert.equal(footer.includes("https://boiseremodeling.co"), true);
  assert.equal(footer.includes("https://boisehandyman.co"), true);
  assert.equal(footer.includes("https://boisecabinet.co"), true);
  assert.equal(footer.includes("Boise ADU Co (launching soon)"), true);
  assert.equal(footer.includes("https://boiseadu"), false);
  const contact = readFileSync("app/contact/page.tsx", "utf8");
  assert.equal(contact.includes("{SITE_CONFIG.email}"), true);
  assert.equal(contact.includes("No public showroom."), true);
  assert.equal(contact.includes("SiteEmailLink"), false);
});
