import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { preferToTextHtml, preferToTextLine, SITE_CONFIG } from "../shared/siteConfig";
import {
  findProhibitedResponseLanguage,
  normalizeForResponseScan,
  scanSourceForResponsePromises,
} from "../scripts/lib/prohibitedResponseLanguage";

const LINE =
  "Prefer to text? Text (208) 477-1169. Business hours: Mon–Fri 9–6, Sat 9–4 MT.";
const SMS_HREF = "sms:+12084771169";

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

test("no customer or staff copy promises a response window; it says we answer", () => {
  // Owner instruction: say we answer, and never "within one business day" on any site.
  const hits = scanSourceForResponsePromises(".");
  assert.deepEqual(hits, [], hits.map((hit) => `${hit.file} [${hit.label}] ${hit.excerpt}`).join("\n"));

  // The guard itself must catch split, numeric and minutes variants.
  for (const sample of [
    "We reply within one\n          business day.",
    "We reply within one business day.",
    "1 business day to reply",
    "a one-business-day response",
    "We will call you back next business day",
    "A quick call or text answers most questions in a minute.",
    "We reply in minutes during business hours",
    "Respond within 24 hours",
    "a 24-hour reply",
    "Quick questions, fast replies",
    'replies"} within one\n          business day. <PreferToTextLine />',
  ]) {
    assert.ok(findProhibitedResponseLanguage(sample).length > 0, sample);
  }
  // Unrelated timing stays allowed.
  for (const sample of [
    "Daily cap (emails / 24h)",
    "completion within 8 business days",
    "Less than a minute left",
    "Cancel with 24-hour notice",
    "Quick answer",
  ]) {
    assert.deepEqual(findProhibitedResponseLanguage(sample), [], sample);
  }

  const contact = readFileSync("app/contact/page.tsx", "utf8");
  const contactCopy = normalizeForResponseScan(contact);
  assert.match(contactCopy, /We answer your questions and help you work out the next step\./);
  assert.match(contactCopy, /Call, text, or email our team\. We answer your questions and never use high-pressure sales tactics\./);
  assert.doesNotMatch(contactCopy, /Call, email, or visit/);
  assert.equal(contact.includes("link-hero-text"), false);

  const home = readFileSync("app/page.tsx", "utf8");
  assert.match(home, /We answer your questions and help you work out the next step/);

  // Staff are told what the visitor was told, with no deadline.
  const staff = readFileSync("server/services/estimatorSessionEmail.ts", "utf8");
  assert.match(staff, /call them back to answer their questions/);
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
  for (const path of ["shared/siteConfig.ts", "components/contact/PreferToTextLine.tsx"]) {
    assert.doesNotMatch(readFileSync(path, "utf8"), /reply in minutes/i);
  }
  const form = readFileSync("components/consultation/ConsultationFields.tsx", "utf8");
  assert.match(form, /Email delivery and follow-up are not confirmed on this page/);
  assert.doesNotMatch(form, /We sent a confirmation to your email/);

  // Success states say the request is in, not that a reply or email already happened.
  for (const path of ["components/design-studio/ShareView.tsx", "components/design-studio/steps/SaveStep.tsx"]) {
    const source = normalizeForResponseScan(readFileSync(path, "utf8"));
    assert.match(source, /has your request and will follow up to answer your questions/, path);
  }
  const abandonment = normalizeForResponseScan(readFileSync("components/estimate/recovery/AbandonmentPrompt.tsx", "utf8"));
  assert.doesNotMatch(abandonment, /in a minute/);
  assert.match(abandonment, /Call or text with your questions and we will answer them/);
  const assistant = readFileSync("lib/assistant/tools.ts", "utf8");
  assert.doesNotMatch(assistant, /fastest way/i);
  assert.match(assistant, /The request is saved and the team will follow up to answer their questions/);
});
