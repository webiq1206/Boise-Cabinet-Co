/**
 * Lead confirmation wording and the Schedule now button. No mail is sent.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  CABINET_EMAIL_ACCENT,
  SCHEDULE_URL,
  decoratePreliminaryEstimateEmail,
  requestConfirmation,
  scheduleIntentFor,
} from "../server/services/leadConfirmationEmail.ts";

const BANNED = /—|Perkins 5|showroom|\bshop\b/i;

function visible(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
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

  const intake = decoratePreliminaryEstimateEmail({
    subject: "Boise Cabinet Co: Your project request REF",
    text: "unchanged",
    html: "<p>unchanged</p>",
  });
  assert.equal(intake.text, "unchanged");
  assert.equal(intake.html, "<p>unchanged</p>");

  const again = decoratePreliminaryEstimateEmail(message);
  assert.equal(again.text, message.text);
  assert.equal(again.html, message.html);
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
