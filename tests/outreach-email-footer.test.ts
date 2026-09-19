import { test } from "node:test";
import assert from "node:assert/strict";
import { renderOutreachEmail } from "../server/services/outreachRender";
import { getOutreachFromEmail, isOutreachTrackingEnabled } from "../lib/outreach/config";

test("commercial email retains its full postal address and a usable plain-text unsubscribe URL", () => {
  const previous = process.env.OUTREACH_MAILING_ADDRESS;
  process.env.OUTREACH_MAILING_ADDRESS = "123 Test Street, Boise, ID 83702";
  try {
    const url = "https://boisecabinet.co/api/outreach/unsubscribe?token=test-only";
    const email = renderOutreachEmail({ template: { subject: "Test", body: "Test message" }, tokens: {}, unsubscribeUrl: url });
    assert.ok(email.html.includes("123 Test Street, Boise, ID 83702"));
    assert.ok(email.text.includes("123 Test Street, Boise, ID 83702"));
    assert.ok(email.text.includes(url));
    assert.ok(!email.html.includes('width="1" height="1"'));
  } finally {
    if (previous === undefined) delete process.env.OUTREACH_MAILING_ADDRESS;
    else process.env.OUTREACH_MAILING_ADDRESS = previous;
  }
});

test("outreach requires a separate owned sender domain and tracking requires explicit opt-in", () => {
  const from = process.env.OUTREACH_FROM_EMAIL;
  const tracking = process.env.OUTREACH_TRACKING_ENABLED;
  try {
    for (const invalid of ["hello@boisecabinet.co", "other@boisecabinet.co", "a@evilboisecabinet.co", "a@outreach.boisecabinet.co\r\nBcc: b@example.com"]) {
      process.env.OUTREACH_FROM_EMAIL = invalid;
      assert.equal(getOutreachFromEmail(), null);
    }
    process.env.OUTREACH_FROM_EMAIL = "hello@outreach.boisecabinet.co";
    assert.equal(getOutreachFromEmail(), "hello@outreach.boisecabinet.co");
    delete process.env.OUTREACH_TRACKING_ENABLED;
    assert.equal(isOutreachTrackingEnabled(), false);
    process.env.OUTREACH_TRACKING_ENABLED = "true";
    assert.equal(isOutreachTrackingEnabled(), true);
  } finally {
    if (from === undefined) delete process.env.OUTREACH_FROM_EMAIL; else process.env.OUTREACH_FROM_EMAIL = from;
    if (tracking === undefined) delete process.env.OUTREACH_TRACKING_ENABLED; else process.env.OUTREACH_TRACKING_ENABLED = tracking;
  }
});
