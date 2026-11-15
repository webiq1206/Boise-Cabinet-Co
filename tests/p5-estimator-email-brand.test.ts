/**
 * Boise Cabinet Co estimator mail. Renders HTML and text. Does not send mail.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PGlite} from "@electric-sql/pglite";
import type {IntakeRow} from "../lib/p5/intakeStore.ts";
import {ESTIMATOR_BRAND} from "../lib/p5/brand.ts";
import {assertCopy, ESTIMATE_DISCLAIMER, VALUE_TIERS, valueTier} from "../lib/p5/emailKit.ts";
import {emailSendShouldRetry, estimatorFromAddress} from "../lib/p5/deliveryAdapter.ts";
import {projectReviewHandler} from "../lib/p5/reviewRequest.ts";
import {
  CABINET_EMAIL_FIXTURES,
  EMAIL_FROM,
  LEGAL_LINE,
  renderCabinetDeliveryAlert,
  renderCabinetEstimate,
  renderCabinetIntake,
  sha256,
  storedRangeLabel,
} from "./cabinet-estimator-email-render.ts";

process.env.P5_LINK_SECRET = "synthetic-link-secret-for-render-only";

const LOGO = `https://${ESTIMATOR_BRAND.domain}${ESTIMATOR_BRAND.logo}`;
const PUBLISHED = {
  "lib/p5/emailKit.ts": "204a6c1fa6d6defa83738b26ac380ea78e209743cf4741764403c227baec0533",
  "lib/p5/estimateEmail.ts": "1c70c92dfa1c66ce77c0b451714b7c3d345c32e7aae43364f5e267d2f7ad5588",
  "lib/p5/intakeEmail.ts": "4373fab340c99c81f5cf6ca6ac32ba11705147b0036a05b2e285f78821aeaa61",
  "lib/p5/outbox.ts": "935e1ea1923f4de3af864de8fa944414fec4906dde93a19d1940d84547cf807d",
  "lib/p5/reviewRequest.ts": "02f86aa1a48a05e7a8f6ffc6cd7a64da2e30ac9e870febb52ce26c3ef0777a22",
  "lib/p5/phoneHref.ts": "acb0d1322aac2b4fbf97f007614107adf3b648612b41b867188c5260c26c0249",
} as const;

function assertThisBrand(html: string, text: string, options: {customerEstimate?: boolean; city?: boolean; companyPhone?: boolean} = {}) {
  const combined = `${html}\n${text}`;
  assert.match(html, new RegExp(ESTIMATOR_BRAND.name));
  assert.match(html, new RegExp(LOGO.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(combined, /boisecabinet\.co/);
  assert.match(html, new RegExp(ESTIMATOR_BRAND.accent));
  assert.match(html, /#383837/i);
  if (options.city) assert.match(combined, /Meridian, ID 83646/);
  if (options.companyPhone !== false) assert.match(combined, /\(208\) 477-1169/);
  assert.doesNotMatch(combined, /p5homeco\.com/i);
  assert.doesNotMatch(combined, /showroom|\bshop\b/i);
  assert.doesNotMatch(combined, /8381215/);
  assert.equal(combined.includes("P5 Home Co"), false, combined.match(/P5 Home Co/g)?.join("|"));
  assert.doesNotMatch(combined, /is a DBA of/);
  if (options.customerEstimate) assert.ok(combined.includes(LEGAL_LINE));
  assert.equal(estimatorFromAddress(), EMAIL_FROM);
  assert.equal(combined.includes(EMAIL_FROM), false);
}

test("shared kit hashes match p5-home-co b789c483 and the admin email uses this brand", () => {
  for (const [file, hash] of Object.entries(PUBLISHED)) {
    assert.equal(sha256(readFileSync(file)), hash, file);
  }
  const estimate = readFileSync("lib/p5/estimateEmail.ts", "utf8");
  assert.match(estimate, /function scopeEmailBrand\(source:\{name:string;domain:string;email:string;phone:string;accent:string;ink:string;logo:string\}=brand\)/);
  assert.match(estimate, /const mail=scopeEmailBrand\(doc\.brand\);/);
  const manifest = JSON.parse(readFileSync("lib/p5/shared-manifest.json", "utf8")) as {files: Record<string, string>};
  for (const [file, hash] of Object.entries(PUBLISHED)) assert.equal(manifest.files[file], hash, file);
});

test("From stays P5 Home Co at the P5 mailbox, and a dropped connection retries once", () => {
  assert.equal(estimatorFromAddress({}), EMAIL_FROM);
  assert.equal(estimatorFromAddress({SMTP_FROM: "Nick <estimates@p5homeco.com>"}), "P5 Home Co <estimates@p5homeco.com>");
  assert.equal(estimatorFromAddress({SMTP_FROM: "Boise Cabinet Co <hello@boisecabinet.co>"}), EMAIL_FROM);
  assert.equal(emailSendShouldRetry(Object.assign(new Error("timed out"), {code: "ETIMEDOUT"})), true);
  assert.equal(emailSendShouldRetry(new Error("421 try again")), true);
  assert.equal(emailSendShouldRetry(new Error("550 mailbox unavailable")), false);
  assert.equal(emailSendShouldRetry(new Error("Email provider rejected delivery")), false);
  assert.deepEqual(VALUE_TIERS, {smallUnder: 10_000, majorOver: 75_000});
});

test("every cabinet estimate email uses this brand and the stored range", () => {
  const roles = new Set<string>();
  for (const fixture of CABINET_EMAIL_FIXTURES) {
    const rendered = renderCabinetEstimate(fixture);
    for (const message of [rendered.customer, rendered.admin]) {
      assert.equal(message.from, EMAIL_FROM);
      assert.ok(message.html.startsWith("<!doctype html>"));
      assert.ok(message.text.trim().length > 0);
      assertThisBrand(message.html, message.text, {customerEstimate: message.kind === "customer", companyPhone: message.kind === "customer", city: message.kind === "customer"});
      assertCopy(message.html, message.text, {
        requireDisclaimer: message.kind === "customer" && fixture.high != null,
        customerAddresses: [],
      });
      assert.doesNotMatch(message.html, /<script>/);
    }
    const range = storedRangeLabel(fixture);
    if (range && fixture.high != null) {
      roles.add(valueTier(fixture.high));
      for (const message of [rendered.customer, rendered.admin]) {
        assert.ok(message.html.includes(range.low), `${fixture.id} html missing ${range.low}`);
        assert.ok(message.text.includes(range.high), `${fixture.id} text missing ${range.high}`);
      }
      assert.ok(rendered.customer.text.includes(ESTIMATE_DISCLAIMER));
      const tier = valueTier(fixture.high);
      if (tier === "small") assert.match(rendered.customer.text, /quick visit/);
      else if (tier === "major") assert.match(rendered.customer.text, /planning consultation/);
      else assert.match(rendered.customer.text, /home walkthrough/);
      if (fixture.contractPrice != null) {
        const contract = fixture.contractPrice.toLocaleString("en-US", {style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0});
        assert.equal(rendered.customer.text.includes(contract), false, `${fixture.id} customer mail must not show the internal contract price`);
        assert.ok(rendered.admin.text.includes(contract));
      }
      assert.match(rendered.customer.html, /Schedule now/);
      assert.equal(rendered.customer.text.includes("$1,000"), false);
    } else {
      roles.add("withheld");
      assert.doesNotMatch(rendered.customer.text, /\$\d/);
      assert.match(rendered.customer.text, /Pricing pending review|closer look/i);
    }
    if (fixture.uploads.length) assert.match(rendered.admin.html, /View uploaded files/);
    else assert.doesNotMatch(rendered.admin.html, /View uploaded files/);
    assert.doesNotMatch(rendered.admin.html, /Open in QuickBooks/);
    if (fixture.phone) assert.match(rendered.admin.html, /tel:\+1208555/);
    else assert.doesNotMatch(rendered.admin.html, /Call \(208\) 555/);
  }
  assert.ok(roles.has("small") && roles.has("standard") && roles.has("major") && roles.has("withheld"));
});

test("intake, review, and the delivery alert use this brand and keep P5 Home Co out of the body", async () => {
  const intake = renderCabinetIntake();
  for (const message of [intake.customer, intake.team]) {
    assert.match(message.subject, /^Boise Cabinet Co:/);
    assertThisBrand(message.html, message.text);
    assert.doesNotMatch(`${message.html}\n${message.text}`, /P5 Home Co/);
  }
  assert.match(intake.customer.html, /Schedule now/);
  assert.doesNotMatch(intake.team.html, /Schedule now/);
  assert.match(intake.customer.html, new RegExp(LOGO.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

  const alert = renderCabinetDeliveryAlert();
  assertThisBrand(alert.html, alert.text, {city: true});
  assert.doesNotMatch(`${alert.html}\n${alert.text}`, /P5 Home Co/);
  assert.match(alert.html, /Open the estimator admin/);

  const db = new PGlite();
  const id = "12345678-1234-4234-8234-123456789abc";
  await db.exec(`CREATE TABLE p5_estimator_work(draft_id uuid,work_key text,payload jsonb);CREATE TABLE p5_estimator_drafts(id uuid PRIMARY KEY,revision integer,status text);INSERT INTO p5_estimator_drafts VALUES('${id}',1,'draft')`);
  let sent: {subject: string; text: string; html?: string} | undefined;
  const handler = projectReviewHandler({
    readDraft: async () => ({id, brand: ESTIMATOR_BRAND.id, revision: 1, status: "draft" as const, updatedAt: "", text: "Replace the kitchen cabinets.", answers: {service: "cabinet-install"}, extraction: null, reviewed: null, uploads: [], contact: {name: "Ada Cabinet", email: "", phone: ""}}),
    query: async (sql: string, values: unknown[] = []) => (await db.query(sql, values)).rows as IntakeRow[],
    adminRecipients: async () => ["team@example.invalid"],
    sendEmail: async (input) => {
      sent = input;
      return "render-only";
    },
  });
  try {
    const response = await handler(new Request(`https://${ESTIMATOR_BRAND.domain}/api/p5-estimator/review`, {
      method: "POST",
      headers: {"x-p5-draft-id": id, "x-p5-draft-key": "a".repeat(64), "content-type": "application/json"},
      body: JSON.stringify({name: "Ada Cabinet", email: "cabinet.customer@example.com"}),
    }));
    assert.equal(response.status, 200);
    assert.ok(sent);
    assertThisBrand(sent.html || "", sent.text, {city: true});
    assert.match(sent.text, /Replace the kitchen cabinets/);
    assert.match(sent.html || "", /Project review requested/);
    assert.doesNotMatch(`${sent.html}\n${sent.text}`, /P5 Home Co/);
  } finally {
    await db.close();
  }
});
