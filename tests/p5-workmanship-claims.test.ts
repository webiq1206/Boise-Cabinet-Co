import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  CABINET_WORKMANSHIP_SCOPE,
  CABINET_WORKMANSHIP_WARRANTY,
  FINAL_COMPLETION_EXPLAINED,
  publicText,
  showLifetimeWarranty,
} from "../shared/claims";
import { HOMEPAGE_FAQS } from "../shared/homepageFaqs";
import { HERO_STATS } from "../shared/siteContent";
import { LLMS_TXT } from "../shared/llmsTxt";
import { KNOWLEDGE_TOPICS } from "../shared/assistantKnowledge";
import { FAMILY_BRAND } from "../lib/familyBrand";

// Verified policy (November 2026): one-year workmanship coverage from documented
// Final Completion, covering our crew and subcontractors. Manufacturer and product
// terms are separate. Supply-only does not cover another installer's workmanship.

const ROOTS = ["app", "components", "shared", "lib", "server"];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next") continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|js|mjs)$/.test(entry)) out.push(full);
  }
  return out;
}

const WRONG_DURATION = /\b(?:two|2)[\s-]*(?:year|yr)s?\b[^.]{0,60}\b(?:warrant|workmanship|coverage)|\b(?:warrant|workmanship)\w*\b[^.]{0,40}\b(?:two|2)[\s-]*(?:year|yr)s?\b/i;
const WRONG_START = /warranty begins at installation|warranty starts at installation|from (?:the date of )?installation|from possession|from substantial completion/i;

test("the workmanship constants state one year from documented Final Completion", () => {
  assert.match(CABINET_WORKMANSHIP_WARRANTY, /^1-year workmanship coverage/);
  assert.match(CABINET_WORKMANSHIP_WARRANTY, /documented Final Completion/);
  assert.match(FINAL_COMPLETION_EXPLAINED, /inspections/);
  assert.match(CABINET_WORKMANSHIP_SCOPE, /subcontractors/);
  assert.match(CABINET_WORKMANSHIP_SCOPE, /Manufacturer and product warranties are separate/);
  assert.match(CABINET_WORKMANSHIP_SCOPE, /Supply-only orders do not cover another installer's workmanship/);
});

test("no public source states a two-year warranty or an installation start", () => {
  const files = ROOTS.flatMap((root) => walk(root));
  const bad: string[] = [];
  for (const file of files) {
    const text = readFileSync(file, "utf8").replace(/\s+/g, " ");
    if (WRONG_DURATION.test(text)) bad.push(`${file}: duration`);
    if (WRONG_START.test(text)) bad.push(`${file}: start`);
    if (/\.toLowerCase\(\)/.test(text) && /CABINET_WORKMANSHIP_WARRANTY\.toLowerCase\(\)/.test(text)) bad.push(`${file}: lower-cased term`);
  }
  assert.deepEqual(bad, []);
  assert.equal(HERO_STATS.some((stat) => /2 yr/.test(stat.num)), false);
  assert.ok(HERO_STATS.some((stat) => stat.num === "1 yr" && /Final Completion/.test(stat.label)));
});

test("rendered consumers carry the corrected term: speakable, FAQ, llms, assistant, warranty page", () => {
  const home = readFileSync("app/page.tsx", "utf8");
  const speakable = home.match(/publicText\("([^"]+)"\)/)?.[1] ?? "";
  assert.match(publicText(speakable), /1-year workmanship coverage on our installation from documented Final Completion/);

  const faq = HOMEPAGE_FAQS.find((item) => /warranty/i.test(item.q));
  assert.ok(faq);
  assert.match(faq.a, /1-year workmanship coverage/);
  assert.match(faq.a, /Supply-only orders do not cover another installer's workmanship/);

  assert.ok(LLMS_TXT.includes(CABINET_WORKMANSHIP_WARRANTY));
  const warrantyTopic = KNOWLEDGE_TOPICS.find((topic) => topic.key === "warranty");
  assert.ok(warrantyTopic?.content.includes(CABINET_WORKMANSHIP_WARRANTY));

  const page = readFileSync("app/warranty/page.tsx", "utf8");
  assert.match(page, /"Cabinet Warranty \| 1-Year Workmanship"/);
  assert.match(page, /FINAL_COMPLETION_EXPLAINED/);
  assert.match(page, /CABINET_WORKMANSHIP_SCOPE/);
  assert.match(page, /On supply-only orders, the workmanship of another installer/);
});

test("the warranty page leads existing customers to help, with notice and safety caveats", () => {
  const page = readFileSync("app/warranty/page.tsx", "utf8").replace(/\s+/g, " ");
  assert.match(page, /<Link href="#get-help"> Get help with a completed project/);
  assert.doesNotMatch(page, /<Link href="\/estimate"> Request a quote/);
  assert.match(page, /id="get-help"/);
  for (const field of ["Name:", "Project address:", "Affected item and location:", "When it started:", "What is happening:", "Photos"]) {
    assert.ok(page.includes(field), field);
  }
  assert.match(page, /Your signed agreement sets the notice method for a formal warranty claim/);
  assert.match(page, /contact emergency services or your utility first/);
  assert.doesNotMatch(page, /portal|ticket number/i);

  const company = FAMILY_BRAND.footer.groups.find((group) => group.title === "Company");
  assert.ok(company?.links.some((link) => link.label === "Existing customer? Get help" && link.href === "/warranty#get-help"));
});

test("dormant lifetime wording stays disabled by default", () => {
  assert.equal(showLifetimeWarranty(undefined), false);
  assert.equal(showLifetimeWarranty("1"), false);
  assert.equal(showLifetimeWarranty("false"), false);
  assert.notEqual(process.env.SHOW_LIFETIME_WARRANTY, "true");
  assert.notEqual(process.env.NEXT_PUBLIC_SHOW_LIFETIME_WARRANTY, "true");
});
