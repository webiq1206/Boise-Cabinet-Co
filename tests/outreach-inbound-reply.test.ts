import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { handleInboundReply } from "../lib/outreach/inboundReply";
import { HUBSPOT_FORWARD_ADDRESS } from "../lib/outreach/hubspotForward";
import { db } from "../lib/db";
import { getUncachableResendClient } from "../server/resend";
import { SITE_CONFIG } from "../shared/siteConfig";
import { Webhook } from "svix";
import { NextRequest } from "next/server";

const event = { email_id: "received-test-123", from: "Zach <Zach@example.invalid>", subject: "Re: Cabinet project" };
const message = {
  id: event.email_id, from: event.from, subject: event.subject,
  to: ["replies@reply.boisecabinet.co"], cc: [],
  created_at: "2026-10-06T14:13:00.000Z", headers: { date: "Tue, 6 Oct 2026 08:12:58 -0600" },
  message_id: "<original-reply@example.invalid>", attachments: [],
  text: "Please call me about the walnut cabinets.", html: "<p>Please call me about the <strong>walnut cabinets</strong>.</p>",
};

async function fixture(t: TestContext, matched = true) {
  const pg = new PGlite();
  t.after(() => pg.close());
  await pg.exec(`
    CREATE TABLE leads (id varchar PRIMARY KEY, email text, email_status text NOT NULL DEFAULT 'contacted', updated_at timestamp DEFAULT now());
    CREATE TABLE lead_activities (id varchar PRIMARY KEY DEFAULT gen_random_uuid(), lead_id varchar NOT NULL REFERENCES leads(id), type text NOT NULL,
      message text NOT NULL, detail jsonb, actor_id varchar, actor_name text, created_at timestamp NOT NULL DEFAULT now());
    CREATE TABLE sequence_enrollments (id varchar PRIMARY KEY, lead_id varchar NOT NULL, status text, next_due_at timestamp);
    CREATE TABLE outreach_prospects (id varchar PRIMARY KEY, email text, status text, replied_at timestamp, updated_at timestamp);
    CREATE TABLE site_settings (key varchar PRIMARY KEY, value text NOT NULL, updated_at timestamp NOT NULL DEFAULT now(), updated_by varchar);
    INSERT INTO outreach_prospects VALUES ('legacy', 'ZACH@example.invalid', 'sent', NULL, now());
  `);
  if (matched) await pg.exec(`
    INSERT INTO leads (id,email) VALUES ('lead-1','ZACH@example.invalid');
    INSERT INTO sequence_enrollments VALUES ('enrollment','lead-1','active',now());
  `);
  let reads = 0;
  let sends = 0;
  let failRead = false;
  let failSend = false;
  const failedDestinations = new Set<string>();
  const sentDestinations: string[] = [];
  let receivedMessage: Record<string, unknown> = message;
  const accepted = new Map<string, { payload: unknown; id: string }>();
  const getClient = async () => ({
    fromEmail: SITE_CONFIG.email,
    client: { emails: {
      receiving: { get: async (id: string) => {
        reads++;
        assert.equal(id, event.email_id);
        return failRead ? { data: null, error: { message: "temporary read failure" } } : { data: receivedMessage, error: null };
      } },
      send: async (payload: Record<string, unknown>, options: { idempotencyKey: string }) => {
        sends++;
        sentDestinations.push(String(payload.to));
        if (failSend || failedDestinations.has(String(payload.to))) return { data: null, error: { message: "temporary send failure" } };
        const previous = accepted.get(options.idempotencyKey);
        if (previous) assert.deepEqual(payload, previous.payload, "retry keeps the provider payload identical");
        const saved = previous || { payload, id: payload.to === HUBSPOT_FORWARD_ADDRESS ? "accepted-hubspot-forward-123" : "accepted-forward-123" };
        accepted.set(options.idempotencyKey, saved);
        return { data: { id: saved.id }, error: null };
      },
    } },
  }) as unknown as ReturnType<typeof getUncachableResendClient>;
  const options = { database: drizzle(pg) as unknown as NonNullable<typeof db>, getClient };
  return { pg, options, accepted, reads: () => reads,
    sends: (destination?: string) => destination ? sentDestinations.filter((value) => value === destination).length : sends,
    message: (value: Record<string, unknown>) => { receivedMessage = value; },
    failRead: (value: boolean) => { failRead = value; }, failSend: (value: boolean) => { failSend = value; },
    failDestination: (destination: string, value: boolean) => { if (value) failedDestinations.add(destination); else failedDestinations.delete(destination); },
    activities: async () => (await pg.query<{ detail: Record<string, unknown> }>("SELECT detail FROM lead_activities")).rows,
  };
}

test("matched replies forward full content, stop both sequences, and survive duplicate events", async (t) => {
  const f = await fixture(t);
  assert.equal(await handleInboundReply(event, f.options), 1);
  const [forward] = [...f.accepted.values()];
  const payload = forward.payload as Record<string, unknown>;
  assert.equal(payload.to, SITE_CONFIG.email);
  assert.equal(payload.from, `${SITE_CONFIG.senderDisplayName} <${SITE_CONFIG.email}>`);
  assert.equal(payload.replyTo, "zach@example.invalid");
  assert.match(String(payload.text), /walnut cabinets/);
  assert.match(String(payload.html), /<strong>walnut cabinets<\/strong>/);
  assert.deepEqual((await f.pg.query("SELECT status,next_due_at FROM sequence_enrollments")).rows, [{ status: "replied", next_due_at: null }]);
  assert.equal((await f.pg.query<{ status: string }>("SELECT status FROM outreach_prospects")).rows[0].status, "replied");
  assert.equal((await f.activities())[0].detail.forwardedMessageId, "accepted-forward-123");
  assert.equal(await handleInboundReply(event, f.options), 0);
  assert.equal(f.sends(), 2);
  assert.equal(f.reads(), 1);
  assert.equal((await f.activities()).length, 1);
});

test("unmatched senders retain their complete reply and deduplicate beyond the provider key lifetime", async (t) => {
  const f = await fixture(t, false);
  assert.equal(await handleInboundReply(event, f.options), 0);
  assert.equal(await handleInboundReply(event, f.options), 0);
  assert.equal(f.accepted.size, 2);
  assert.equal(f.sends(), 2);
  assert.equal(f.reads(), 1);
  assert.equal([...f.accepted.keys()][0], `outreach-reply/${event.email_id}`);
  assert.match(String((f.accepted.values().next().value!.payload as Record<string, unknown>).text), /walnut cabinets/);
  assert.equal((await f.activities()).length, 0);
  const receipts = (await f.pg.query<{ key: string; value: string }>("SELECT key,value FROM site_settings")).rows;
  assert.equal(receipts.length, 2);
  for (const receipt of receipts) {
    assert.equal(JSON.parse(receipt.value).status, "accepted");
    assert.doesNotMatch(receipt.value, /zach|example.invalid|walnut/);
  }
  const crmReceipt = JSON.parse(receipts.find((row) => row.key.startsWith("outreach_reply_hubspot_receipt:"))!.value);
  assert.equal(crmReceipt.destination, HUBSPOT_FORWARD_ADDRESS);
  assert.equal(crmReceipt.providerId, "accepted-hubspot-forward-123");
});

test("body retrieval failures remain retryable while follow-ups are already stopped", async (t) => {
  const f = await fixture(t);
  f.failRead(true);
  await assert.rejects(handleInboundReply(event, f.options), /retrieve received email/);
  assert.equal(f.sends(), 0);
  assert.equal((await f.activities())[0].detail.forwarding, "pending");
  assert.equal((await f.pg.query<{ status: string }>("SELECT status FROM sequence_enrollments")).rows[0].status, "replied");
  f.failRead(false);
  await handleInboundReply(event, f.options);
  assert.equal(f.accepted.size, 2);
  assert.equal((await f.activities()).length, 1);
});

test("provider rejection does not complete forwarding and a later retry repairs it", async (t) => {
  const f = await fixture(t);
  f.failSend(true);
  await assert.rejects(handleInboundReply(event, f.options), /did not accept/);
  assert.equal((await f.activities())[0].detail.forwardedMessageId, undefined);
  f.failSend(false);
  await handleInboundReply(event, f.options);
  assert.equal(f.sends(), 4);
  assert.equal(f.accepted.size, 2);
  assert.equal((await f.activities()).length, 1);
});

test("a failure saving the accepted forward retries with the same provider key", async (t) => {
  const f = await fixture(t);
  await f.pg.exec(`
    CREATE FUNCTION fail_forward_receipt() RETURNS trigger AS $$ BEGIN
      IF NEW.detail ? 'forwardedMessageId' THEN RAISE EXCEPTION 'temporary receipt write failure'; END IF;
      RETURN NEW;
    END; $$ LANGUAGE plpgsql;
    CREATE TRIGGER fail_forward_receipt BEFORE UPDATE ON lead_activities FOR EACH ROW EXECUTE FUNCTION fail_forward_receipt();
  `);
  await assert.rejects(handleInboundReply(event, f.options), /temporary receipt write failure/);
  assert.equal(f.accepted.size, 2);
  assert.equal((await f.activities())[0].detail.forwardedMessageId, undefined);
  await f.pg.exec("DROP TRIGGER fail_forward_receipt ON lead_activities");
  await handleInboundReply(event, f.options);
  assert.equal(f.sends(), 3);
  assert.equal(f.accepted.size, 2);
  assert.equal(f.sends(HUBSPOT_FORWARD_ADDRESS), 1);
  assert.equal((await f.activities())[0].detail.forwardedMessageId, "accepted-forward-123");
});

test("previously recorded replies without a forward receipt can be recovered", async (t) => {
  const f = await fixture(t);
  await f.pg.query("INSERT INTO lead_activities(lead_id,type,message,detail) VALUES($1,$2,$3,$4)",
    ["lead-1", "email_received", "Already recorded by the old handler", { emailId: event.email_id, snippet: "" }]);
  await handleInboundReply(event, f.options);
  assert.equal(f.accepted.size, 2);
  assert.equal((await f.activities()).length, 1);
});

test("receiving a reply never removes existing bounce or unsubscribe state", async (t) => {
  const f = await fixture(t);
  await f.pg.exec("UPDATE leads SET email_status='unsubscribed'; UPDATE outreach_prospects SET status='bounced'");
  await handleInboundReply(event, f.options);
  assert.equal((await f.pg.query<{ email_status: string }>("SELECT email_status FROM leads")).rows[0].email_status, "unsubscribed");
  assert.equal((await f.pg.query<{ status: string }>("SELECT status FROM outreach_prospects")).rows[0].status, "bounced");
});

test("a Gmail-only durable receipt backfills HubSpot without another inbox copy", async (t) => {
  const f = await fixture(t, false);
  await f.pg.query("INSERT INTO site_settings(key,value) VALUES($1,$2)", [
    `outreach_reply_receipt:${event.email_id}`,
    JSON.stringify({ status: "accepted", providerId: "prior-inbox-copy", acceptedAt: message.created_at }),
  ]);
  assert.equal(await handleInboundReply(event, f.options), 0);
  assert.equal(f.sends(SITE_CONFIG.email), 0);
  assert.equal(f.sends(HUBSPOT_FORWARD_ADDRESS), 1);
  assert.equal((await f.pg.query("SELECT key FROM site_settings")).rows.length, 2);
  assert.equal(await handleInboundReply(event, f.options), 0);
  assert.equal(f.sends(), 1);
});

test("a legacy activity forwarding receipt also backfills only HubSpot", async (t) => {
  const f = await fixture(t);
  await f.pg.query("INSERT INTO lead_activities(lead_id,type,message,detail) VALUES($1,$2,$3,$4)", [
    "lead-1", "email_received", "Previously forwarded",
    { emailId: event.email_id, forwardedMessageId: "prior-inbox-copy" },
  ]);
  assert.equal(await handleInboundReply(event, f.options), 0);
  assert.equal(f.sends(SITE_CONFIG.email), 0);
  assert.equal(f.sends(HUBSPOT_FORWARD_ADDRESS), 1);
  assert.equal((await f.activities()).length, 1);
  assert.equal((await f.activities())[0].detail.forwardedMessageId, "prior-inbox-copy");
  await handleInboundReply(event, f.options);
  assert.equal(f.sends(), 1);
});

test("a failed HubSpot submission retries independently of an accepted inbox copy", async (t) => {
  const f = await fixture(t);
  f.failDestination(HUBSPOT_FORWARD_ADDRESS, true);
  await assert.rejects(handleInboundReply(event, f.options), /did not accept/);
  assert.equal((await f.activities())[0].detail.forwardedMessageId, "accepted-forward-123");
  assert.equal((await f.pg.query("SELECT key FROM site_settings")).rows.length, 1);
  f.failDestination(HUBSPOT_FORWARD_ADDRESS, false);
  await handleInboundReply(event, f.options);
  assert.equal(f.sends(SITE_CONFIG.email), 1);
  assert.equal(f.sends(HUBSPOT_FORWARD_ADDRESS), 2);
  assert.equal(f.accepted.size, 2);
});

test("a rejected inbox copy does not prevent the independent HubSpot submission", async (t) => {
  const f = await fixture(t);
  f.failDestination(SITE_CONFIG.email, true);
  await assert.rejects(handleInboundReply(event, f.options), /did not accept/);
  assert.equal(f.accepted.size, 1);
  assert.equal(f.sends(HUBSPOT_FORWARD_ADDRESS), 1);
  assert.equal((await f.activities())[0].detail.forwardedMessageId, undefined);
  f.failDestination(SITE_CONFIG.email, false);
  await handleInboundReply(event, f.options);
  assert.equal(f.sends(SITE_CONFIG.email), 2);
  assert.equal(f.sends(HUBSPOT_FORWARD_ADDRESS), 1);
  assert.equal(f.accepted.size, 2);
});

test("invalid CRM date metadata never prevents delivery of the human inbox copy", async (t) => {
  const f = await fixture(t);
  f.message({ ...message, created_at: "not-a-date" });
  await assert.rejects(handleInboundReply(event, f.options), /date is missing or invalid/);
  await assert.rejects(handleInboundReply(event, f.options), /date is missing or invalid/);
  assert.equal(f.sends(SITE_CONFIG.email), 1);
  assert.equal(f.sends(HUBSPOT_FORWARD_ADDRESS), 0);
  assert.equal((await f.activities())[0].detail.forwardedMessageId, "accepted-forward-123");
  f.message(message);
  await handleInboundReply(event, f.options);
  assert.equal(f.sends(SITE_CONFIG.email), 1);
  assert.equal(f.sends(HUBSPOT_FORWARD_ADDRESS), 1);
});

test("ambiguous HubSpot receipts never block a pending inbox copy or resend to the CRM", async (t) => {
  for (const [name, value] of Object.entries({
    malformed: "not-json",
    incomplete: JSON.stringify({ status: "pending", providerId: "ambiguous-prior-copy", destination: HUBSPOT_FORWARD_ADDRESS }),
    differentDestination: JSON.stringify({ status: "accepted", providerId: "ambiguous-prior-copy", destination: "other@example.invalid" }),
  })) await t.test(name, async (t) => {
    const f = await fixture(t, false);
    const key = `outreach_reply_hubspot_receipt:${event.email_id}`;
    await f.pg.query("INSERT INTO site_settings(key,value) VALUES($1,$2)", [key, value]);
    await assert.rejects(handleInboundReply(event, f.options), /Invalid HubSpot reply delivery receipt/);
    assert.equal(f.sends(SITE_CONFIG.email), 1);
    assert.equal(f.sends(HUBSPOT_FORWARD_ADDRESS), 0);
    assert.equal((await f.pg.query<{ value: string }>("SELECT value FROM site_settings WHERE key=$1", [key])).rows[0].value, value);
    await assert.rejects(handleInboundReply(event, f.options), /Invalid HubSpot reply delivery receipt/);
    assert.equal(f.sends(), 1);
    assert.equal(f.reads(), 1);
  });
});

test("a lost HubSpot delivery receipt reuses only its own provider key and exact payload", async (t) => {
  const f = await fixture(t, false);
  await f.pg.exec(`
    CREATE FUNCTION fail_hubspot_receipt() RETURNS trigger AS $$ BEGIN
      IF NEW.key LIKE 'outreach_reply_hubspot_receipt:%' THEN RAISE EXCEPTION 'temporary CRM receipt write failure'; END IF;
      RETURN NEW;
    END; $$ LANGUAGE plpgsql;
    CREATE TRIGGER fail_hubspot_receipt BEFORE INSERT ON site_settings FOR EACH ROW EXECUTE FUNCTION fail_hubspot_receipt();
  `);
  await assert.rejects(handleInboundReply(event, f.options), /temporary CRM receipt write failure/);
  assert.equal(f.accepted.size, 2);
  await f.pg.exec("DROP TRIGGER fail_hubspot_receipt ON site_settings");
  await handleInboundReply(event, f.options);
  assert.equal(f.sends(SITE_CONFIG.email), 1);
  assert.equal(f.sends(HUBSPOT_FORWARD_ADDRESS), 2);
  assert.equal(f.accepted.size, 2);
  assert.equal((await f.pg.query("SELECT key FROM site_settings")).rows.length, 2);
});

test("concurrent events retain one activity and one accepted copy per destination", async (t) => {
  const f = await fixture(t);
  await Promise.all([handleInboundReply(event, f.options), handleInboundReply(event, f.options)]);
  assert.equal(f.accepted.size, 2);
  assert.equal((await f.activities()).length, 1);
  assert.equal((await f.pg.query("SELECT key FROM site_settings")).rows.length, 2);
  const sends = f.sends();
  await handleInboundReply(event, f.options);
  assert.equal(f.sends(), sends);
});

test("missing storage or malformed inbound identifiers never acknowledge processing", async (t) => {
  const f = await fixture(t);
  await assert.rejects(handleInboundReply(event, { ...f.options, database: null }), /database unavailable/);
  await assert.rejects(handleInboundReply({ ...event, email_id: "../other" }, f.options), /ID is missing or invalid/);
  await assert.rejects(handleInboundReply({ ...event, from: "not an email" }, f.options));
  assert.equal(f.sends(), 0);
  assert.equal(f.reads(), 0);
});

test("received-message identity is cross-checked and its subject is authoritative", async (t) => {
  const f = await fixture(t);
  for (const changed of [{ id: "different-email" }, { from: "another@example.invalid" }]) {
    f.message({ ...message, ...changed });
    await assert.rejects(handleInboundReply(event, f.options), /does not match the signed webhook/);
    assert.equal(f.sends(), 0);
  }
  f.message({ ...message, subject: "The actual received subject" });
  await handleInboundReply(event, f.options);
  const payload = f.accepted.values().next().value!.payload as Record<string, unknown>;
  assert.equal(payload.subject, "[Outreach reply] The actual received subject");
  assert.equal((await f.activities())[0].detail.subject, "The actual received subject");
});

test("forwarded replies explicitly identify attachments that remain in the received message", async (t) => {
  const f = await fixture(t, false);
  f.message({ ...message, attachments: [{ filename: "Cabinet <plans>.pdf" }] });
  await handleInboundReply(event, f.options);
  const payload = f.accepted.values().next().value!.payload as Record<string, unknown>;
  assert.match(String(payload.text), /Cabinet <plans>\.pdf/);
  assert.match(String(payload.text), /Retrieve the original files/);
  assert.match(String(payload.html), /Cabinet &lt;plans&gt;\.pdf/);
});

test("connector credentials fetch the correct receiving endpoint and forward with idempotency", async (t) => {
  const f = await fixture(t);
  const keys = ["RESEND_API_KEY", "REPLIT_CONNECTORS_HOSTNAME", "REPL_IDENTITY", "WEB_REPL_RENEWAL"];
  const previous = keys.map((key) => process.env[key]);
  const oldFetch = globalThis.fetch;
  const calls: string[] = [];
  delete process.env.RESEND_API_KEY;
  process.env.REPLIT_CONNECTORS_HOSTNAME = "connector.example.invalid";
  process.env.REPL_IDENTITY = "synthetic-test-token";
  delete process.env.WEB_REPL_RENEWAL;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    calls.push(url);
    if (url.startsWith("https://connector.example.invalid/")) {
      return Response.json({ items: [{ settings: { api_key: "re_synthetic_test_key" } }] });
    }
    if (url === `https://api.resend.com/emails/receiving/${event.email_id}`) return Response.json(message);
    if (url === "https://api.resend.com/emails" && init?.method === "POST") {
      const payload = JSON.parse(String(init.body));
      const crm = payload.to === HUBSPOT_FORWARD_ADDRESS;
      assert.equal(new Headers(init.headers).get("Idempotency-Key"), `${crm ? "outreach-reply-hubspot" : "outreach-reply"}/${event.email_id}`);
      assert.match(payload.text, /walnut cabinets/);
      return Response.json({ id: crm ? "accepted-connector-hubspot-forward" : "accepted-connector-forward" });
    }
    throw new Error("Unexpected network request in test");
  };
  try {
    assert.equal(await handleInboundReply(event, { database: f.options.database }), 1);
    assert.equal(calls.length, 4);
    assert.equal((await f.activities())[0].detail.forwardedMessageId, "accepted-connector-forward");
  } finally {
    globalThis.fetch = oldFetch;
    keys.forEach((key, index) => { if (previous[index] === undefined) delete process.env[key]; else process.env[key] = previous[index]; });
  }
});

test("the actual webhook rejects forged events and returns a retryable status without a database", async () => {
  assert.equal(db, null, "run this regression with DATABASE_URL, PGDATABASE_URL and REPLIT_DB_URL unset");
  const previous = process.env.RESEND_WEBHOOK_SECRET;
  const secret = `whsec_${Buffer.from("synthetic-webhook-secret-for-tests").toString("base64")}`;
  process.env.RESEND_WEBHOOK_SECRET = secret;
  try {
    const { POST } = await import("../app/api/outreach/webhook/route");
    const payload = JSON.stringify({ type: "email.received", data: event });
    const url = "https://boisecabinet.co/api/outreach/webhook";
    assert.equal((await POST(new NextRequest(url, { method: "POST", body: payload }))).status, 401);
    const id = "msg_synthetic_reply_regression";
    const time = new Date();
    const response = await POST(new NextRequest(url, { method: "POST", body: payload, headers: {
      "svix-id": id, "svix-timestamp": String(Math.floor(time.getTime() / 1000)),
      "svix-signature": new Webhook(secret).sign(id, time, payload),
    } }));
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("Retry-After"), "60");
  } finally {
    if (previous === undefined) delete process.env.RESEND_WEBHOOK_SECRET; else process.env.RESEND_WEBHOOK_SECRET = previous;
  }
});
