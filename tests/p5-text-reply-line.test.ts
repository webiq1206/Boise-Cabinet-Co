import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { preferToTextHtml, preferToTextLine, SITE_CONFIG } from "../shared/siteConfig";

const LINE =
  "Prefer to text? Text (208) 477-1169. Business hours: Mon–Fri 9–6, Sat 9–4 MT.";
const SMS_HREF = "sms:+12084771169";
const PROMISE = /one\s+business\s+day/g;
const FOLLOW = /preferToTextLine\(|preferToTextHtml\(|<PreferToTextLine[\s/>]/;

/** Internal staff mail. It tells the team what the visitor was already told. It is not a customer reply line. */
const INTERNAL_ONLY = new Set(["server/services/estimatorSessionEmail.ts"]);

const ROOTS = ["app", "components", "shared", "lib", "server"];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next") continue;
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|js|mjs|html)$/.test(entry)) out.push(full);
  }
  return out;
}

test("the Prefer to text sentence uses one hours constant, including Saturday", () => {
  assert.equal(SITE_CONFIG.textReplyHours, "Mon–Fri 9–6, Sat 9–4 MT");
  assert.equal(SITE_CONFIG.phone, "(208) 477-1169");
  assert.equal(SITE_CONFIG.phoneSmsHref, SMS_HREF);
  assert.equal(preferToTextLine(), LINE);
  assert.equal(
    preferToTextHtml(),
    `Prefer to text? Text <a href="${SMS_HREF}">(208) 477-1169</a>. Business hours: ${SITE_CONFIG.textReplyHours}.`,
  );

  const config = readFileSync("shared/siteConfig.ts", "utf8");
  assert.equal(config.split("Mon–Fri 9–6, Sat 9–4 MT").length, 2);

  const component = readFileSync("components/contact/PreferToTextLine.tsx", "utf8");
  assert.match(component, /href=\{SITE_CONFIG\.phoneSmsHref\}/);
  assert.equal(component.includes("track("), false);
  assert.equal(component.includes("Mon–Fri 9–6, Sat 9–4 MT"), false);
});

test("each customer one-business-day line stays and is followed by Prefer to text", () => {
  const files = ROOTS.flatMap((root) => walk(root));
  const customerFiles = files.filter((file) => {
    const source = readFileSync(file, "utf8");
    return source.includes("one business day") && !INTERNAL_ONLY.has(file);
  });

  assert.ok(customerFiles.length > 0, "expected customer-facing one-business-day lines");

  for (const file of customerFiles) {
    const source = readFileSync(file, "utf8");
    const matches = [...source.matchAll(PROMISE)];
    assert.ok(matches.length > 0, file);
    matches.forEach((match, index) => {
      const start = match.index ?? 0;
      const next = matches[index + 1]?.index ?? source.length;
      const between = source.slice(start, next);
      assert.match(between, FOLLOW, `${file} occurrence ${index + 1} is missing the Prefer to text line`);
    });
  }

  const contact = readFileSync("app/contact/page.tsx", "utf8");
  const contactCopy = contact.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
  assert.match(contactCopy, /We respond within one business day\. Share your goals and we will schedule a free in-home design consultation\./);
  assert.match(contactCopy, /Call, text, or email our team\. We respond within one business day and never use high-pressure sales tactics\./);
  assert.doesNotMatch(contactCopy, /Call, email, or visit/);
  assert.match(contact, /Response within one business day/);
  assert.equal(contact.includes("link-hero-text"), false);

  const home = readFileSync("app/page.tsx", "utf8");
  assert.match(home, /We will reach out within one business day to schedule your free/);

  const staff = readFileSync("server/services/estimatorSessionEmail.ts", "utf8");
  assert.match(staff, /within one business day/);
  assert.equal(staff.includes("Prefer to text?"), false);
});

test("published office hours preserve current main 9-6 and 9-4 schedule", () => {
  const contact = readFileSync("app/contact/page.tsx", "utf8");
  assert.match(contact, /label="Call us"/);
  assert.match(contact, /label="Text us"/);
  assert.match(contact, /Mon-Fri 9 AM-6 PM and Sat 9 AM-4 PM Mountain, closed Sunday/);
  assert.doesNotMatch(contact, /7 am|8 am/);

  const seo = readFileSync("lib/seo.ts", "utf8");
  assert.match(seo, /monday: '9:00 AM - 6:00 PM'/);
  assert.match(seo, /saturday: '9:00 AM - 4:00 PM'/);
  assert.match(seo, /sunday: 'Closed'/);

  const gbp = readFileSync("shared/gbpConfig.ts", "utf8");
  assert.match(gbp, /monday: "9:00 AM - 6:00 PM"/);
  assert.match(gbp, /saturday: "9:00 AM - 4:00 PM"/);
  assert.match(gbp, /Hours set \(Mon-Fri 9 AM-6 PM, Sat 9 AM-4 PM, Sun closed\)/);
});

 test("text invitation makes no unsupported minutes guarantee and preserves honest receipt", () => {
 for (const path of ["shared/siteConfig.ts", "components/contact/PreferToTextLine.tsx"]) assert.doesNotMatch(readFileSync(path,"utf8"), /reply in minutes/i);
 const form = readFileSync("components/consultation/ConsultationFields.tsx", "utf8");
 assert.match(form, /Email delivery and follow-up are not confirmed on this page/);
 assert.doesNotMatch(form, /We sent a confirmation to your email/);
 });
