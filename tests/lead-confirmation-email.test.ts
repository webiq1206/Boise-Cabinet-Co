/**
 * Lead confirmation wording and the Schedule now button. No mail is sent.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  CABINET_EMAIL_ACCENT,
  ESTIMATE_ADJUST_NOTE,
  ESTIMATE_FAMILY_PS,
  SCHEDULE_URL,
  decoratePreliminaryEstimateEmail,
  requestConfirmation,
  scheduleIntentFor,
} from "../server/services/leadConfirmationEmail.ts";
import { estimateEmail } from "../lib/p5/estimateEmail.ts";
import { issueRecord } from "../lib/p5/estimateDocument.ts";
import { ESTIMATOR_BRAND } from "../lib/p5/brand.ts";

const BANNED = /—|Perkins 5|showroom|\bshop\b/i;

/** Owner wording, 16 November 2026. Pinned here so a change to the constants is a deliberate one. */
const ADJUST =
  "If something is missing, or you'd like to change the scope, the finishes or the timing, tell us. It's easy to adjust, and we'd rather get it right than have you guessing.";
const FAMILY_PS =
  "P.S. Anything else on your list? Boise Cabinet Co is part of P5 Home Co, the company behind Boise Construction Co, Boise Remodeling Co and Boise Handyman Co. So whether it's a few repairs, new cabinets, a full kitchen or bath remodel, an addition or a new home, tell us and we'll plan it alongside this project.";
const AFTER_ESTIMATE = /Anything else on your list|P\.S\.|easy to adjust/;

function visible(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

function lastParagraph(html: string): string {
  return [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].at(-1)?.[1] ?? "";
}

/** Adjust note above the disclaimer, one schedule link, the exact P.S. last. */
function assertAfterEstimateWording(message: { text: string; html?: string }): void {
  const html = message.html ?? "";
  assert.ok(message.text.includes(ADJUST));
  assert.ok(html.includes(ADJUST));
  assert.ok(message.text.indexOf(ADJUST) < message.text.indexOf("We work hard to make that estimate"));
  assert.ok(html.indexOf(ADJUST) < html.indexOf("We work hard to make that estimate"));
  assert.ok(message.text.includes(`Schedule now: ${SCHEDULE_URL}`));
  assert.match(html, />Schedule now</);
  assert.equal(message.text.split(SCHEDULE_URL).length - 1, 1, "one schedule link in the text");
  assert.equal(html.split(">Schedule now<").length - 1, 2, "one button: its Outlook copy and its link");
  assert.ok(message.text.endsWith(`\n\n${FAMILY_PS}`), "the P.S. is the last paragraph of the text");
  assert.equal(message.text.split(FAMILY_PS).length - 1, 1);
  // In the HTML the P.S. closes the letter: after the disclaimer, and only the brand footer follows it.
  assert.ok(html.indexOf("We work hard to make that estimate") < html.indexOf(FAMILY_PS));
  const afterPs = visible(html.slice(html.indexOf(FAMILY_PS) + FAMILY_PS.length)).trim();
  assert.ok(afterPs === "" || afterPs.startsWith("Boise Cabinet Co "), "only the brand footer follows the P.S.");
  assert.ok(afterPs.length < 400, "nothing but the footer follows the P.S.");
  assert.equal(html.split(FAMILY_PS).length - 1, 1);
  assert.doesNotMatch(`${message.text}\n${visible(html)}`, BANNED);
  assert.doesNotMatch(`${message.text}\n${visible(html)}`, /near me|\bquote\b/i);
}

test("a project request names the 1 hour walkthrough, and a callback names the 15 minute consult", () => {
  const project = requestConfirmation({
    firstName: "Ada",
    brandName: "Boise Cabinet Co",
    intent: "walkthrough",
    phone: "(208) 477-1169",
    accent: CABINET_EMAIL_ACCENT,
  });
  const callback = requestConfirmation({
    firstName: "Ada",
    brandName: "Boise Cabinet Co",
    intent: "consult",
    accent: CABINET_EMAIL_ACCENT,
  });
  assert.equal(project.subject, "We have your request, Ada");
  assert.match(project.text, /^Hi Ada,/);
  assert.match(project.text, /Thanks for reaching out to Boise Cabinet Co\. We have your request, and someone from the team will follow up shortly\./);
  assert.match(project.text, /choose the 1 hour option for a home walkthrough/);
  assert.match(project.text, /any estimate we share/);
  assert.match(project.text, /that first estimate/);
  assert.match(project.text, /Either way, we'll work with you to get you what you want, within your budget\./);
  assert.match(project.text, /call \(208\) 477-1169/);
  assert.match(project.text, /The Boise Cabinet Co team/);
  assert.doesNotMatch(project.text, /View your estimate/);
  assert.match(callback.text, /choose the 15 minute option for a phone consult/);
  assert.match(callback.html, new RegExp(CABINET_EMAIL_ACCENT));
  assert.match(project.html, /background-color:#383837/);
  assert.match(project.html, /color:#ffffff/);
  assert.match(project.html, /v:roundrect/);
  assert.match(project.html, /width="100%"/);
  assert.match(project.html, /role="presentation"/);
  assert.ok(project.text.includes(`Schedule now: ${SCHEDULE_URL}`));
  assert.equal(scheduleIntentFor({ requestKind: "callback" }), "consult");
  assert.equal(scheduleIntentFor({ requestKind: "request" }), "walkthrough");
  assert.equal(scheduleIntentFor({ form: "Site Chat" }), "consult");
  for (const message of [project, callback]) {
    assert.doesNotMatch(`${message.subject}\n${message.text}\n${visible(message.html)}`, BANNED);
    assert.ok(message.text.includes(SCHEDULE_URL));
    assert.doesNotMatch(visible(message.html), /\$\s?\d|\bcost\b|\bmargin\b/);
    // A request confirmation is not an estimate email: no adjust note, no P.S., and it still says "Hi".
    assert.doesNotMatch(`${message.text}\n${visible(message.html)}`, AFTER_ESTIMATE);
    assert.match(visible(message.html), /^\s*Hi Ada,/);
    assert.doesNotMatch(`${message.text}\n${message.html}`, /Hey /);
  }
});

test("the after-estimate wording is the owner's, and it lives in one place", () => {
  assert.equal(ESTIMATE_ADJUST_NOTE, ADJUST);
  assert.equal(ESTIMATE_FAMILY_PS, FAMILY_PS);
  for (const file of [
    "app/api/consultation/route.ts",
    "app/api/consultation/details/route.ts",
    "app/api/designs/pricing-request/route.ts",
    "server/services/emailLayout.ts",
    "lib/p5/estimateEmail.ts",
    "lib/p5/intakeEmail.ts",
    "lib/p5/deliveryAdapter.ts",
  ]) {
    assert.doesNotMatch(readFileSync(file, "utf8"), AFTER_ESTIMATE, file);
  }
});

test("a missing first name still reads as a sentence", () => {
  const message = requestConfirmation({ firstName: "  ", brandName: "Boise Cabinet Co", intent: "walkthrough" });
  assert.match(message.text, /^Hi there,/);
  assert.equal(message.subject, "We have your request, there");
});

test("the preliminary estimate email gains the button without touching other messages", () => {
  const thanks = "Your preliminary estimate is below, and the complete estimate is attached as a PDF.</p>";
  const view = `<table role="presentation"><tr><td><a href="https://boisecabinet.co/estimate/e/token">View or update your estimate online</a></td></tr></table>`;
  const html = `<p>Thank you for using the Boise Cabinet Co online estimator. ${thanks}${view}<p>Total</p>`;
  const text = ["Boise Cabinet Co", "View or update your estimate online: https://boisecabinet.co/estimate/e/token", ""].join("\n");
  const message = decoratePreliminaryEstimateEmail({
    subject: "Your Boise Cabinet Co preliminary estimate EST-1",
    text,
    html,
  });
  assert.match(message.text, /choose the 1 hour option/);
  assert.match(message.text, /We work hard to make that estimate as realistic as we can/);
  assert.ok(message.text.includes(`Schedule now: ${SCHEDULE_URL}`));
  assert.ok(message.text.indexOf("Schedule now:") < message.text.indexOf("View or update your estimate online:"));
  assert.match(message.html, />Schedule now</);
  assert.ok(message.html.indexOf(">Schedule now<") < message.html.indexOf(">View or update your estimate online<"));
  assert.ok(message.html.indexOf(">View or update your estimate online<") < message.html.indexOf("walk the property"));
  assert.match(message.html, /background-color:#383837/);
  assert.doesNotMatch(`${message.text}\n${visible(message.html)}`, BANNED);
  assertAfterEstimateWording(message);

  const intake = decoratePreliminaryEstimateEmail({
    subject: "Boise Cabinet Co: Your project request REF",
    text: "unchanged",
    html: "<p>unchanged</p>",
  });
  assert.equal(intake.text, "unchanged");
  assert.equal(intake.html, "<p>unchanged</p>");

  // Team and alert mail from the same transport is never decorated.
  for (const subject of ["Boise Cabinet Co: internal estimate record (ref 0f1e2d3c)", "Boise Cabinet Co: estimate delivery needs attention (ref 0f1e2d3c)"]) {
    const team = decoratePreliminaryEstimateEmail({ subject, text: "Contract price", html: "<p>Hi Ada,</p><p>Thank you for using the</p>" });
    assert.equal(team.text, "Contract price");
    assert.equal(team.html, "<p>Hi Ada,</p><p>Thank you for using the</p>");
  }

  const again = decoratePreliminaryEstimateEmail(message);
  assert.equal(again.text, message.text);
  assert.equal(again.html, message.html);

  // Markup the decorator does not recognise still gets the whole block, P.S. last.
  const plain = decoratePreliminaryEstimateEmail({
    subject: "Your Boise Cabinet Co preliminary estimate EST-2",
    text: "Boise Cabinet Co\nTotal",
    html: "<html><body><p>Total</p></body></html>",
  });
  assertAfterEstimateWording(plain);
  const textOnly = decoratePreliminaryEstimateEmail({ subject: "Your Boise Cabinet Co preliminary estimate EST-3", text: "Total" });
  assert.equal(textOnly.html, undefined);
  assert.ok(textOnly.text.endsWith(`\n\n${FAMILY_PS}`));
  assert.ok(textOnly.text.indexOf(ADJUST) < textOnly.text.indexOf("We work hard to make that estimate"));
});

test("the shared estimator's customer email is sent with the greeting, the adjust note and the P.S.; the team's is not", () => {
  const id = "0f1e2d3c-4b5a-4000-8000-00000000abcd";
  const contact = { name: "Ada Lovelace", email: "qa@example.invalid", phone: "(208) 555-0100" };
  const scope = { text: "Replace the kitchen cabinets.", answers: { service: "kitchen", finish: "mid-range", location: "Boise, ID" }, uploads: [], uncertainFields: [] as string[] };
  const customer = {
    range: { low: 6800, high: 7500 },
    categoryRanges: [{ category: "Cabinets", low: 4000, high: 4400 }],
    lineItems: [],
    exclusions: ["Appliances"],
    verificationItems: ["Confirm door style."],
    issue: issueRecord({ brandId: ESTIMATOR_BRAND.id, id, revision: 1, now: new Date("2026-11-16T18:00:00Z"), contact, scope }),
  };
  const record = { customer, contact, internal: { directCost: 4430, contractPrice: 7166, lines: [], warnings: [] } };
  const subject = "Your Boise Cabinet Co preliminary estimate P5-0F1E2D3C";

  const keys = ["P5_LINK_SECRET", "DATABASE_URL", "REPLIT_DB_URL"] as const;
  const saved = keys.map((key) => process.env[key]);
  try {
    for (const withLink of [true, false]) {
      if (withLink) process.env.P5_LINK_SECRET = "offline-test-only";
      else {
        delete process.env.P5_LINK_SECRET;
        delete process.env.DATABASE_URL;
        delete process.env.REPLIT_DB_URL;
      }
      const original = estimateEmail(id, record, false);
      assert.equal(original.html.includes("View or update your estimate online"), withLink);
      assert.match(original.html, />Hi Ada,<\/p>/);
      assert.doesNotMatch(`${original.text}\n${original.html}`, AFTER_ESTIMATE);

      const sent = decoratePreliminaryEstimateEmail({ subject, ...original });
      assertAfterEstimateWording(sent);
      assert.match(sent.html, />Hey Ada,<\/p><p [^>]*>Thank you for using the Boise Cabinet Co online estimator\./);
      assert.doesNotMatch(sent.html, />Hi Ada,</);
      // The plain-text copy has no greeting of its own, so none is added.
      assert.doesNotMatch(sent.text, /^(?:Hi|Hey|Hello)\b/m);
      // The P.S. closes the letter: after the PDF note in the text, and directly above the footer in the HTML.
      assert.ok(sent.text.indexOf("Your complete estimate is attached as a PDF.") < sent.text.indexOf(FAMILY_PS));
      assert.ok(sent.html.indexOf(FAMILY_PS) < sent.html.lastIndexOf("boisecabinet.co"));
      assert.ok(sent.html.endsWith("</table></td></tr></table></body></html>"));
      // Nothing else in the estimate moved.
      let at = 0;
      for (const line of original.text.split("\n").filter(Boolean)) {
        const found = sent.text.indexOf(line, at);
        assert.ok(found >= 0, `kept in order: ${line}`);
        at = found + line.length;
      }
      for (const kept of ["$6,800 to $7,500", "Appliances", "Confirm door style.", "Preliminary estimate, not a contract."]) {
        assert.ok(original.html.includes(kept) && sent.html.includes(kept), kept);
      }
    }
    process.env.P5_LINK_SECRET = "offline-test-only";
    const admin = estimateEmail(id, record, true);
    const adminSent = decoratePreliminaryEstimateEmail({ subject: "Boise Cabinet Co: internal estimate record (ref 0f1e2d3c)", ...admin });
    assert.equal(adminSent.text, admin.text);
    assert.equal(adminSent.html, admin.html);
    assert.doesNotMatch(`${adminSent.text}\n${adminSent.html}`, AFTER_ESTIMATE);
    assert.ok(!adminSent.text.includes(SCHEDULE_URL) && !adminSent.html.includes(SCHEDULE_URL));
  } finally {
    keys.forEach((key, i) => {
      if (saved[i] === undefined) delete process.env[key];
      else process.env[key] = saved[i];
    });
  }
});

test("live sends use the confirmation, and the shared estimate template still has the insertion point", () => {
  const consultation = readFileSync("app/api/consultation/route.ts", "utf8");
  assert.match(consultation, /scheduleIntentFor\(\{ requestKind: data\.requestKind \}\)/);
  assert.match(consultation, /if \(data\.email\) \{\s*await client\.emails\.send/);
  assert.doesNotMatch(consultation, /data\.message/);
  assert.doesNotMatch(consultation, /data\.projectType/);
  const details = readFileSync("app/api/consultation/details/route.ts", "utf8");
  assert.match(details, /merge\.set\.email/);
  assert.match(details, /requestKind === "callback" \? "consult" : "walkthrough"/);
  assert.ok(details.indexOf('status: "replayed"') < details.indexOf("confirmationEmail"), "a replay does not send a second confirmation");
  const pricing = readFileSync("app/api/designs/pricing-request/route.ts", "utf8");
  assert.match(pricing, /intent: "walkthrough"/);
  assert.match(pricing, /to: data\.email/);
  const adapter = readFileSync("lib/p5/deliveryAdapter.ts", "utf8");
  assert.match(adapter, /typeof decoratePreliminaryEstimateEmail==="function"/);
  const estimate = readFileSync("lib/p5/estimateEmail.ts", "utf8");
  assert.match(estimate, /Your preliminary estimate is below, and the complete estimate is attached as a PDF/);
  for (const form of ["components/quote/QuoteRequestForm.tsx", "components/consultation/ConsultationFields.tsx", "components/design-studio/ShareView.tsx"]) {
    assert.doesNotMatch(readFileSync(form, "utf8"), /Schedule now/);
  }
});
