import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SITE_CONFIG } from "../shared/siteConfig";
import {
  P5_CABINET_BRAND,
  P5_CONSULTATION_FORM,
  P5_INTAKE_URL,
  P5_PROJECT_TYPE_BY_VISITOR_LABEL,
  UNMAPPED_P5_PROJECT_TYPES,
  buildP5IntakeBody,
  forwardConsultationToP5Intake,
  p5ProjectType,
} from "../server/services/p5IntakeBridge";

/** Values p5 hubspotProjectType keeps at tip 8a33b28c (enum or alias key). */
const ACCEPTED_BY_P5 = new Set([
  "Kitchen cabinets",
  "Bathroom vanity",
  "Built-ins or storage",
  "Whole-home cabinetry",
  "cabinet-product",
  "cabinet-install",
]);

const FORM_SLUGS: Record<string, string> = {
  kitchen: "Kitchen cabinets",
  bathroom: "Bathroom vanity",
  laundry: "Built-ins or storage",
  closet: "Built-ins or storage",
  "built-ins": "Built-ins or storage",
  pantry: "Built-ins or storage",
  "home-office": "Built-ins or storage",
  entertainment: "Built-ins or storage",
  mudroom: "Built-ins or storage",
  "cabinet-install": "cabinet-install",
  "cabinet-product": "cabinet-product",
  "whole-home": "Whole-home cabinetry",
  other: "other",
};

test("brand string is the p5 BRANDS value and the live site name", () => {
  assert.equal(P5_CABINET_BRAND, "Boise Cabinet Co");
  assert.equal(SITE_CONFIG.name, P5_CABINET_BRAND);
  assert.equal(P5_CONSULTATION_FORM, "Cabinet consultation");
  assert.equal(P5_INTAKE_URL, "https://p5homeco.com/api/leads/intake");
});

test("known consultation choices map onto p5 project types, and unknown ones pass through", () => {
  for (const [slug, expected] of Object.entries(FORM_SLUGS)) {
    assert.equal(p5ProjectType(slug), expected, slug);
  }
  assert.equal(p5ProjectType("Kitchen Cabinets"), "Kitchen cabinets");
  assert.equal(p5ProjectType("Bathroom Vanities"), "Bathroom vanity");
  assert.equal(p5ProjectType("Laundry / Mudroom"), "Built-ins or storage");
  assert.equal(p5ProjectType("Closet & Storage"), "Built-ins or storage");
  assert.equal(p5ProjectType("Built-Ins"), "Built-ins or storage");
  assert.equal(p5ProjectType("Custom cabinets or built-ins"), "Built-ins or storage");
  for (const label of UNMAPPED_P5_PROJECT_TYPES) {
    assert.equal(p5ProjectType(label), label);
    assert.equal(P5_PROJECT_TYPE_BY_VISITOR_LABEL[label], undefined);
  }
  for (const [from, to] of Object.entries(P5_PROJECT_TYPE_BY_VISITOR_LABEL)) {
    assert.ok(ACCEPTED_BY_P5.has(to), `${from} -> ${to} is not a p5 alias or HubSpot option`);
  }
  assert.equal(p5ProjectType("  kitchen  "), "Kitchen cabinets");
  assert.equal(p5ProjectType("Kitchen cabinets"), "Kitchen cabinets");
  assert.equal(p5ProjectType(""), null);
});

test("intake body uses the fields the p5 route already reads", () => {
  const body = buildP5IntakeBody({
    name: "  Ada Example  ",
    email: "ada@example.com",
    phone: "(208) 555-0100",
    address: "123 Main St",
    city: "Boise",
    zip: "83702",
    projectType: "kitchen",
    message: "Shaker doors and a pantry.",
    inquiryId: "11111111-1111-4111-8111-111111111111",
  });
  assert.deepEqual(body, {
    brand: "Boise Cabinet Co",
    name: "Ada Example",
    form: P5_CONSULTATION_FORM,
    source: "Organic Website",
    sourceDetail: "boisecabinet.co consultation",
    projectType: "Kitchen cabinets",
    email: "ada@example.com",
    phone: "(208) 555-0100",
    address: "123 Main St, 83702",
    city: "Boise",
    summary: "Visitor project: kitchen\n\nShaker doors and a pantry.",
    externalLeadId: "boisecabinet-consultation:11111111-1111-4111-8111-111111111111",
    // The family quote form contract: the same id under the contract name, and Step 1.
    external_id: "boisecabinet-consultation:11111111-1111-4111-8111-111111111111",
    submission_kind: "initial",
  });
});

test("a junk optional phone is left off when the email can still be stored", () => {
  const body = buildP5IntakeBody({
    name: "Ada Example",
    email: "ada@example.com",
    phone: "555",
    projectType: "other",
    message: "Not sure yet.",
  });
  assert.equal(body.email, "ada@example.com");
  assert.equal(body.phone, undefined);
  assert.equal(body.projectType, "other");
  assert.equal(body.summary, "Not sure yet.");
});

test("phone-only consultations omit an empty email", () => {
  const body = buildP5IntakeBody({
    name: "Ada Example",
    email: "",
    phone: "2085550100",
    projectType: "built-ins",
    address: "123 Main St, 83702",
    zip: "83702",
  });
  assert.equal(body.email, undefined);
  assert.equal(body.phone, "2085550100");
  assert.equal(body.address, "123 Main St, 83702");
  assert.equal(body.projectType, "Built-ins or storage");
  assert.match(body.summary, /Visitor project: built-ins/);
});

test("bridge posts once and swallows transport and HTTP failures", async () => {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const ok = async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ ok: true, accepted: true }), { status: 201 });
  };
  await forwardConsultationToP5Intake(
    { name: "Ada Example", email: "ada@example.com", projectType: "cabinet-install" },
    ok,
  );
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, P5_INTAKE_URL);
  assert.equal(calls[0].init.method, "POST");
  const sent = JSON.parse(String(calls[0].init.body));
  assert.equal(sent.brand, "Boise Cabinet Co");
  assert.equal(sent.projectType, "cabinet-install");
  assert.equal(sent.form, "Cabinet consultation");
  assert.equal(sent.sourceDetail, "boisecabinet.co consultation");
  const signal = calls[0].init.signal as AbortSignal | undefined;
  assert.ok(signal, "request uses a timeout signal");

  await assert.doesNotReject(() =>
    forwardConsultationToP5Intake(
      { name: "Ada Example", email: "ada@example.com", projectType: "other" },
      async () => {
        throw new Error("network down");
      },
    ),
  );
  await assert.doesNotReject(() =>
    forwardConsultationToP5Intake(
      { name: "Ada Example", email: "ada@example.com", projectType: "other" },
      async () => new Response("no", { status: 500 }),
    ),
  );
});

test("consultation success path schedules the bridge without awaiting it", () => {
  const source = readFileSync(new URL("../app/api/consultation/route.ts", import.meta.url), "utf8");
  const honeypot = source.indexOf("data.companyWebsite.trim().length > 0");
  const replayed = source.indexOf("if (savedRequest.replayed)");
  const saveFailure = source.indexOf("[consultation] DB insert failed");
  const accepted = source.indexOf("dbSaved = true");
  const bridge = source.indexOf("forwardConsultationToP5Intake(");
  const keptAlive = source.indexOf("after(() => bridge)");
  const resend = source.indexOf("await getUncachableResendClient");
  const dashboard = source.indexOf("forwardLeadToDashboard(");
  assert.ok(honeypot >= 0 && bridge > honeypot, "honeypot returns before the bridge");
  assert.ok(replayed >= 0 && bridge > replayed, "replayed requests return before the bridge");
  assert.ok(saveFailure >= 0 && bridge > saveFailure, "save failures return before the bridge");
  assert.ok(accepted >= 0 && bridge > accepted, "bridge runs only after a durable accept");
  assert.ok(keptAlive > bridge, "bridge is kept alive with after(), not awaited");
  assert.ok(dashboard > accepted, "BRC dashboard forward still runs on accept");
  assert.ok(resend > bridge, "Resend still runs and is not gated on the bridge");
  assert.match(source, /catch \(bridgeErr\)/);
  assert.doesNotMatch(source, /await\s+forwardConsultationToP5Intake/);
  assert.doesNotMatch(source, /HUBSPOT_TOKEN|@hubspot|HUBSPOT_/);
  const bridgeSource = readFileSync(new URL("../server/services/p5IntakeBridge.ts", import.meta.url), "utf8");
  assert.doesNotMatch(bridgeSource, /HUBSPOT_TOKEN|@hubspot\/|from ["']@hubspot|process\.env\.HUBSPOT/);
});
