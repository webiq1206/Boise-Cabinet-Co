import { test } from "node:test";
import assert from "node:assert/strict";
import { getOutreachReplyTo, getOutreachFromEmail, isOutreachInboundReplyRoutingEnabled } from "../lib/outreach/config";
import { SITE_CONFIG } from "../shared/siteConfig";

function withEnv(values: Record<string, string | undefined>, run: () => void) {
  const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  try {
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    run();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
}

test("a stale reply subdomain cannot divert replies away from the working inbox", () => {
  for (const enabled of [undefined, "false", "TRUE"]) {
    withEnv({ OUTREACH_INBOUND_REPLY_ROUTING_ENABLED: enabled,
      OUTREACH_REPLY_TO: "replies@reply.boisecabinet.co",
      OUTREACH_FROM_EMAIL: "hello@outreach.boisecabinet.co",
      RESEND_WEBHOOK_SECRET: "synthetic-secret" }, () => {
      assert.equal(getOutreachReplyTo(), SITE_CONFIG.email);
      assert.equal(isOutreachInboundReplyRoutingEnabled(), false);
      assert.equal(getOutreachFromEmail(), "hello@outreach.boisecabinet.co");
    });
  }
});

test("inbound routing requires deliberate opt-in, an owned receiving subdomain and a webhook secret", () => {
  for (const reply of [undefined, "", "hello@boisecabinet.co", "replies@other.example", "replies@reply.boisecabinet.co\r\nBcc: x@example.com"]) {
    withEnv({ OUTREACH_INBOUND_REPLY_ROUTING_ENABLED: "true", OUTREACH_REPLY_TO: reply,
      RESEND_WEBHOOK_SECRET: "synthetic-secret" }, () => {
      assert.equal(getOutreachReplyTo(), SITE_CONFIG.email);
      assert.equal(isOutreachInboundReplyRoutingEnabled(), false);
    });
  }
  withEnv({ OUTREACH_INBOUND_REPLY_ROUTING_ENABLED: "true",
    OUTREACH_REPLY_TO: "replies@reply.boisecabinet.co", RESEND_WEBHOOK_SECRET: undefined }, () => {
    assert.equal(getOutreachReplyTo(), SITE_CONFIG.email);
    assert.equal(isOutreachInboundReplyRoutingEnabled(), false);
  });
  withEnv({ OUTREACH_INBOUND_REPLY_ROUTING_ENABLED: "true",
    OUTREACH_REPLY_TO: "Replies <Replies@reply.boisecabinet.co>", RESEND_WEBHOOK_SECRET: "synthetic-secret" }, () => {
    assert.equal(getOutreachReplyTo(), "replies@reply.boisecabinet.co");
    assert.equal(isOutreachInboundReplyRoutingEnabled(), true);
  });
});
