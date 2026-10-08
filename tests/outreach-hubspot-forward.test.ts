import { test } from "node:test";
import assert from "node:assert/strict";
import { buildHubSpotForward, HUBSPOT_FORWARD_ADDRESS } from "../lib/outreach/hubspotForward";
import { SITE_CONFIG } from "../shared/siteConfig";

const original = {
  id: "received-original-123", from: "Customer <customer@example.invalid>",
  to: ["replies@reply.boisecabinet.co"], cc: ["architect@example.invalid"],
  created_at: "2026-10-06T14:13:00.000Z",
  headers: { Date: "Tue, 6 Oct 2026 08:12:58 -0600" },
  subject: "Re: Cabinet project", message_id: "<original-message@example.invalid>",
};
const content = {
  plainText: "Please quote both homes.\nKeep this complete final line.",
  html: "<p>Please quote <strong>both homes</strong>.</p><p>Keep this complete final line.</p>",
  attachmentNotice: "This reply includes 1 attachment(s): Cabinet <plans>.pdf. Retrieve the original files from the received email in Resend.",
};

test("a CRM forward preserves original participants, date, full bodies and traceability", () => {
  const payload = buildHubSpotForward(original, content);
  assert.equal(payload.from, `${SITE_CONFIG.senderDisplayName} <${SITE_CONFIG.email}>`);
  assert.equal(payload.to, HUBSPOT_FORWARD_ADDRESS);
  assert.equal(payload.replyTo, "customer@example.invalid");
  assert.equal(payload.subject, "Fwd: Re: Cabinet project");
  for (const [label, value] of Object.entries({
    From: "Customer <customer@example.invalid>", Date: "Tue, 06 Oct 2026 14:12:58 GMT",
    Subject: original.subject, To: original.to.join(", "), Cc: original.cc.join(", "),
  })) {
    assert.ok(payload.text.includes(`${label}: ${value}`));
    assert.ok(payload.html.includes(`${label}: ${value.replace(/</g, "&lt;").replace(/>/g, "&gt;")}`));
  }
  assert.ok(payload.text.includes(content.plainText));
  assert.ok(payload.html.includes(content.html));
  assert.ok(payload.text.includes(`Original Message-ID: ${original.message_id}`));
  assert.ok(payload.html.includes("Original Message-ID: &lt;original-message@example.invalid&gt;"));
  assert.ok(payload.text.includes(`Received at: ${original.created_at}`));
  assert.ok(payload.text.includes(content.attachmentNotice));
  assert.ok(payload.html.includes("Cabinet &lt;plans&gt;.pdf"));
});

test("both provider receiving addresses remain the original To in the CRM copy", () => {
  for (const address of ["replies@reply.boisecabinet.co", "hello@outreach.boisecabinet.co"]) {
    const payload = buildHubSpotForward({ ...original, to: [address] }, content);
    assert.ok(payload.text.includes(`To: ${address}`));
    assert.ok(payload.html.includes(`To: ${address}`));
  }
});

test("missing or malformed original Date uses only the documented provider receipt time", () => {
  for (const headers of [{}, { date: "not-a-date" }, { date: '"not-a-date"' }, { date: '"2026-10-06T14:12:58.000Z' }]) {
    const payload = buildHubSpotForward({ ...original, headers }, content);
    assert.match(payload.text, /Date: Tue, 06 Oct 2026 14:13:00 GMT/);
    assert.match(payload.text, /Forwarded Date uses the provider receipt time/);
    assert.match(payload.html, /Forwarded Date uses the provider receipt time/);
    assert.deepEqual(buildHubSpotForward({ ...original, headers }, content), payload);
  }
});

test("Resend's JSON-quoted original Date is preserved in both forwarded MIME bodies", () => {
  const payload = buildHubSpotForward({
    ...original, headers: { dAtE: JSON.stringify("2026-10-08T18:38:04.000Z") },
    created_at: "2026-10-08T18:38:05.996Z",
  }, content);
  assert.ok(payload.text.includes("Date: Thu, 08 Oct 2026 18:38:04 GMT"));
  assert.ok(payload.html.includes("Date: Thu, 08 Oct 2026 18:38:04 GMT"));
  assert.ok(payload.text.includes("Received at: 2026-10-08T18:38:05.996Z"));
  assert.ok(!payload.text.includes("Forwarded Date uses the provider receipt time"));
  assert.ok(!payload.html.includes("Forwarded Date uses the provider receipt time"));
});

test("unusable receipt dates and missing participants fail without inventing message metadata", () => {
  for (const created_at of ["", "not-a-date"]) {
    assert.throws(() => buildHubSpotForward({ ...original, created_at }, content), /date is missing or invalid/);
  }
  assert.throws(() => buildHubSpotForward({ ...original, to: [] }, content), /no original recipients/);
  assert.throws(() => buildHubSpotForward({ ...original, from: "not-an-email" }, content));
});

test("plain-text replies still contain both MIME alternatives and escaped header values", () => {
  const payload = buildHubSpotForward({ ...original, subject: "Plans <review>\r\nSubject: injected" }, {
    plainText: "Use <alder> & oak.\nEnd of message.", html: "", attachmentNotice: "",
  });
  assert.equal(payload.subject, "Fwd: Plans <review> Subject: injected");
  assert.match(payload.html, /Subject: Plans &lt;review&gt; Subject: injected/);
  assert.match(payload.html, /Use &lt;alder&gt; &amp; oak\.\nEnd of message\./);
  assert.match(payload.text, /Use <alder> & oak\.\nEnd of message\./);
});
