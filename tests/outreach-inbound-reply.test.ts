import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { handleInboundReply } from "../lib/outreach/inboundReply";
import { db } from "../lib/db";
import { getUncachableResendClient } from "../server/resend";
import { SITE_CONFIG } from "../shared/siteConfig";
import { Webhook } from "svix";
import { NextRequest } from "next/server";

const event = { email_id: "received-test-123", from: "Zach <Zach@example.invalid>", subject: "Re: Cabinet project" };
const message = { id: event.email_id, from: event.from, subject: event.subject, attachments: [], text: "Please call me about the walnut cabinets.", html: "<p>Please call me about the <strong>walnut cabinets</strong>.</p>" };

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
        if (failSend) return { data: null, error: { message: "temporary send failure" } };
        const previous = accepted.get(options.idempotencyKey);
        if (previous) assert.deepEqual(payload, previous.payload, "retry keeps the provider payload identical");
        const saved = previous || { payload, id: "accepted-forward-123" };
        accepted.set(options.idempotencyKey, saved);
        return { data: { id: saved.id }, error: null };
      },
    } },
  }) as unknown as ReturnType<typeof getUncachableResendClient>;
  const options = { database: drizzle(pg) as unknown as NonNullable<typeof db>, getClient };
  return { pg, options, accepted, reads: () => reads, sends: () => sends,
    message: (value: Record<string, unknown>) => { receivedMessage = value; },
    failRead: (value: boolean) => { failRead = value; }, failSend: (value: boolean) => { failSend = value; },
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
  assert.equal(f.sends(), 1);
  assert.equal(f.reads(), 1);
  assert.equal((await f.activities()).length, 1);
});

test("unmatched senders retain their complete reply and deduplicate beyond the provider key lifetime", async (t) => {
  const f = await fixture(t, false);
  assert.equal(await handleInboundReply(event, f.options), 0);
  assert.equal(await handleInboundReply(event, f.options), 0);
  assert.equal(f.accepted.size, 1);
  assert.equal(f.sends(), 1);
  assert.equal(f.reads(), 1);
  assert.equal([...f.accepted.keys()][0], `outreach-reply/${event.email_id}`);
  assert.match(String((f.accepted.values().next().value!.payload as Record<string, unknown>).text), /walnut cabinets/);
  assert.equal((await f.activities()).length, 0);
  const [receipt] = (await f.pg.query<{ value: string }>("SELECT value FROM site_settings")).rows;
  assert.equal(JSON.parse(receipt.value).status, "accepted");
  assert.doesNotMatch(receipt.value, /zach|example.invalid|walnut/);
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
  assert.equal(f.accepted.size, 1);
  assert.equal((await f.activities()).length, 1);
});

test("provider rejection does not complete forwarding and a later retry repairs it", async (t) => {
  const f = await fixture(t);
  f.failSend(true);
  await assert.rejects(handleInboundReply(event, f.options), /did not accept/);
  assert.equal((await f.activities())[0].detail.forwardedMessageId, undefined);
  f.failSend(false);
  await handleInboundReply(event, f.options);
  assert.equal(f.sends(), 2);
  assert.equal(f.accepted.size, 1);
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
  assert.equal(f.accepted.size, 1);
  assert.equal((await f.activities())[0].detail.forwardedMessageId, undefined);
  await f.pg.exec("DROP TRIGGER fail_forward_receipt ON lead_activities");
  await handleInboundReply(event, f.options);
  assert.equal(f.sends(), 2);
  assert.equal(f.accepted.size, 1);
  assert.equal((await f.activities())[0].detail.forwardedMessageId, "accepted-forward-123");
});

test("previously recorded replies without a forward receipt can be recovered", async (t) => {
  const f = await fixture(t);
  await f.pg.query("INSERT INTO lead_activities(lead_id,type,message,detail) VALUES($1,$2,$3,$4)",
    ["lead-1", "email_received", "Already recorded by the old handler", { emailId: event.email_id, snippet: "" }]);
  await handleInboundReply(event, f.options);
  assert.equal(f.accepted.size, 1);
  assert.equal((await f.activities()).length, 1);
});

test("receiving a reply never removes existing bounce or unsubscribe state", async (t) => {
  const f = await fixture(t);
  await f.pg.exec("UPDATE leads SET email_status='unsubscribed'; UPDATE outreach_prospects SET status='bounced'");
  await handleInboundReply(event, f.options);
  assert.equal((await f.pg.query<{ email_status: string }>("SELECT email_status FROM leads")).rows[0].email_status, "unsubscribed");
  assert.equal((await f.pg.query<{ status: string }>("SELECT status FROM outreach_prospects")).rows[0].status, "bounced");
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
      assert.equal(new Headers(init.headers).get("Idempotency-Key"), `outreach-reply/${event.email_id}`);
      assert.match(JSON.parse(String(init.body)).text, /walnut cabinets/);
      return Response.json({ id: "accepted-connector-forward" });
    }
    throw new Error("Unexpected network request in test");
  };
  try {
    assert.equal(await handleInboundReply(event, { database: f.options.database }), 1);
    assert.equal(calls.length, 3);
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
