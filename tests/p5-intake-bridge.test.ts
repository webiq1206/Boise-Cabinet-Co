import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SITE_CONFIG } from "../shared/siteConfig";
import {
  MAX_TEAM_NOTES,
  MAX_TEAM_NOTE_LENGTH,
  P5_CABINET_BRAND,
  P5_CONSULTATION_FORM,
  P5_INTAKE_TIMEOUT_MS,
  P5_INTAKE_URL,
  P5_PROJECT_TYPE_BY_VISITOR_LABEL,
  UNMAPPED_P5_PROJECT_TYPES,
  buildP5DetailsBody,
  buildP5IntakeBody,
  cleanTeamNotes,
  forwardConsultationToP5Intake,
  p5ProjectType,
  readP5TeamAlert,
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

// Live form check, 2 November 2026: /estimate sent "cabinet-project: <the visitor's
// message>" and the whole message became the HubSpot deal name. The words already
// reach p5 as the summary; the project type carries only a real project.
test("the visitor's own words never become the project type", () => {
  const words = "TEST, please ignore. Form check by Claude, will be deleted.";
  assert.equal(p5ProjectType(`cabinet-project: ${words}`), null);
  assert.equal(p5ProjectType(`builder-contractor: ${words}`), null);
  assert.equal(p5ProjectType(`built-ins: ${words}`), "Built-ins or storage");
  assert.equal(p5ProjectType("cabinet-project: kitchen"), "Kitchen cabinets");
  assert.equal(p5ProjectType("built-ins: Pantry"), "Built-ins or storage");
  assert.equal(p5ProjectType("cabinet-project: Callback request"), null);
  assert.equal(p5ProjectType(words), null);
  assert.equal(p5ProjectType("New doors\nand a pantry"), null);
  assert.equal(p5ProjectType("Pantry refresh"), "Pantry refresh");

  const body = buildP5IntakeBody({
    name: "Ada Example",
    email: "ada@example.com",
    projectType: `cabinet-project: ${words}`,
    message: words,
  });
  assert.equal(body.projectType, undefined);
  assert.equal(body.summary, words);
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
    // One team email per request: p5 sends its email before it answers and says how it went.
    team_alert: "confirm",
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

test("bridge posts once, swallows transport and HTTP failures, and reports what p5 said", async () => {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const ok = async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ ok: true, accepted: true, alert: "sent" }), { status: 201 });
  };
  const sentResult = await forwardConsultationToP5Intake(
    { name: "Ada Example", email: "ada@example.com", projectType: "cabinet-install" },
    ok,
  );
  assert.deepEqual(sentResult, { forwarded: true, alert: "sent" });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, P5_INTAKE_URL);
  assert.equal(calls[0].init.method, "POST");
  const sent = JSON.parse(String(calls[0].init.body));
  assert.equal(sent.brand, "Boise Cabinet Co");
  assert.equal(sent.projectType, "cabinet-install");
  assert.equal(sent.form, "Cabinet consultation");
  assert.equal(sent.sourceDetail, "boisecabinet.co consultation");
  assert.equal(sent.team_alert, "confirm");
  const signal = calls[0].init.signal as AbortSignal | undefined;
  assert.ok(signal, "request uses a timeout signal");
  // p5 can take about 25 seconds in confirm mode.
  assert.equal(P5_INTAKE_TIMEOUT_MS, 30_000);

  const input = { name: "Ada Example", email: "ada@example.com", projectType: "other" };
  assert.deepEqual(
    await forwardConsultationToP5Intake(input, async () => {
      throw new Error("network down");
    }),
    { forwarded: false, alert: "unknown" },
    "a thrown fetch is not a confirmation",
  );
  assert.deepEqual(
    await forwardConsultationToP5Intake(input, async () => new Response("no", { status: 500 })),
    { forwarded: false, alert: "unknown" },
    "an HTTP error is not a confirmation",
  );
  // An HTTP error that claims the email went is still an error.
  assert.deepEqual(
    await forwardConsultationToP5Intake(input, async () => new Response(JSON.stringify({ alert: "sent" }), { status: 502 })),
    { forwarded: false, alert: "unknown" },
  );
});

test("the p5 answer is read defensively: only the three contract values count", async () => {
  assert.equal(readP5TeamAlert({ alert: "sent" }), "sent");
  assert.equal(readP5TeamAlert({ alert: "failed" }), "failed");
  assert.equal(readP5TeamAlert({ alert: "none" }), "none");
  for (const payload of [
    null,
    undefined,
    "sent",
    ["sent"],
    {},
    { alert: "Sent" },
    { alert: " sent" },
    { alert: true },
    { alert: 1 },
    { alert: { status: "sent" } },
    { alert: ["sent"] },
    { team_alert: "sent" },
  ]) {
    assert.equal(readP5TeamAlert(payload), "unknown", JSON.stringify(payload));
  }

  const input = { name: "Ada Example", email: "ada@example.com", projectType: "other" };
  const answer = (body: string, status = 200) => forwardConsultationToP5Intake(input, async () => new Response(body, { status }));
  assert.deepEqual(await answer(JSON.stringify({ ok: true, alert: "failed" })), { forwarded: true, alert: "failed" });
  assert.deepEqual(await answer(JSON.stringify({ ok: true, alert: "none" })), { forwarded: true, alert: "none" });
  // An older p5 that does not know the contract: forwarded, not confirmed.
  assert.deepEqual(await answer(JSON.stringify({ ok: true, accepted: true }), 201), { forwarded: true, alert: "unknown" });
  assert.deepEqual(await answer("<html>ok</html>"), { forwarded: true, alert: "unknown" });
  assert.deepEqual(await answer(""), { forwarded: true, alert: "unknown" });
  assert.deepEqual(await answer("null"), { forwarded: true, alert: "unknown" });
});

test("a p5 that does not answer in time is not a confirmation, and the bridge still does not throw", async () => {
  let aborted = false;
  const never = (_url: string, init: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      // AbortSignal.timeout does not hold the event loop open; a real socket would.
      const socket = setTimeout(() => reject(new Error("the timeout signal never fired")), 4_000);
      init.signal?.addEventListener("abort", () => {
        clearTimeout(socket);
        aborted = true;
        reject(init.signal?.reason ?? new Error("aborted"));
      });
    });
  const started = Date.now();
  const result = await forwardConsultationToP5Intake({ name: "Ada Example", email: "ada@example.com" }, never, 25);
  assert.deepEqual(result, { forwarded: false, alert: "unknown" });
  assert.equal(aborted, true, "the timeout signal fired");
  assert.ok(Date.now() - started < 5_000);
});

test("team_notes are well formed: single lines, capped in length and count, and absent when empty", () => {
  const base = { name: "Ada Example", email: "ada@example.com", projectType: "kitchen" };
  assert.equal(buildP5IntakeBody(base).team_notes, undefined, "no notes, no key");
  assert.equal(buildP5IntakeBody({ ...base, teamNotes: [] }).team_notes, undefined);
  assert.equal(buildP5IntakeBody({ ...base, teamNotes: ["   ", "\n"] }).team_notes, undefined);

  const body = buildP5IntakeBody({
    ...base,
    teamNotes: ["Planning range: $18,400 to $27,900", "  Parcel:\tR1234567\n(second line)  ", `Room 1: ${"x".repeat(400)}`],
  });
  assert.equal(body.team_alert, "confirm");
  const notes = body.team_notes as string[];
  assert.deepEqual(notes.slice(0, 2), ["Planning range: $18,400 to $27,900", "Parcel: R1234567 (second line)"]);
  assert.equal(notes[2].length, MAX_TEAM_NOTE_LENGTH);
  assert.match(notes[2], /\.\.\.$/);
  for (const note of notes) {
    assert.equal(typeof note, "string");
    assert.doesNotMatch(note, /[\u0000-\u001f\u007f]/, "one line, no control characters");
    assert.ok(note.length > 0 && note.length <= MAX_TEAM_NOTE_LENGTH);
  }

  const many = cleanTeamNotes(Array.from({ length: 90 }, (_, i) => `Line ${i + 1}: value`));
  assert.equal(many.length, MAX_TEAM_NOTES);
  assert.equal(MAX_TEAM_NOTES, 40);
  assert.equal(MAX_TEAM_NOTE_LENGTH, 300);
  assert.deepEqual(cleanTeamNotes([1, null, { a: 1 }, "Kept: yes"] as unknown[]), ["Kept: yes"]);

  // Step 2 carries the contract too.
  const details = buildP5DetailsBody({
    name: "Ada Example",
    phone: "(208) 555-0100",
    inquiryId: "11111111-1111-4111-8111-111111111111",
    lines: ["Timing: Soon"],
    teamNotes: ["Lead dashboard: https://leads.boiseremodeling.co/?leadId=lead-1"],
  });
  assert.equal(details.submission_kind, "details");
  assert.equal(details.team_alert, "confirm");
  assert.deepEqual(details.team_notes, ["Lead dashboard: https://leads.boiseremodeling.co/?leadId=lead-1"]);
});

// One team email per request (owner, 17 November 2026). The rule this guard
// keeps: the VISITOR RESPONSE and the CUSTOMER email are never gated on the
// bridge; the TEAM email waits for the bridge answer inside after().
// tests/p5-one-team-email.test.ts runs both routes and proves the behaviour.
test("consultation success path: the bridge is never awaited, and only the team email waits on it, inside after()", () => {
  const source = readFileSync(new URL("../app/api/consultation/route.ts", import.meta.url), "utf8");
  const honeypot = source.indexOf("data.companyWebsite.trim().length > 0");
  const replayed = source.indexOf("if (savedRequest.replayed)");
  const saveFailure = source.indexOf("[consultation] DB insert failed");
  const accepted = source.indexOf("dbSaved = true");
  const bridge = source.indexOf("forwardConsultationToP5Intake(");
  const keptAlive = source.indexOf("after(() => pending)");
  const dashboard = source.indexOf("forwardLeadToDashboard(");
  const teamEmail = source.indexOf("sendTeamEmailAfterBridge({");
  const teamDeferred = source.indexOf("after(sendTeamEmail)");
  const customer = source.indexOf("let emailSent = false;");
  const customerSend = source.indexOf("to: data.email,");
  const response = source.indexOf("notificationStatus: emailSent");
  assert.ok(honeypot >= 0 && bridge > honeypot, "honeypot returns before the bridge");
  assert.ok(replayed >= 0 && bridge > replayed, "replayed requests return before the bridge");
  assert.ok(saveFailure >= 0 && bridge > saveFailure, "save failures return before the bridge");
  assert.ok(accepted >= 0 && bridge > accepted, "bridge runs only after a durable accept");
  assert.ok(keptAlive > bridge, "bridge is kept alive with after(), not awaited");
  assert.ok(dashboard > accepted, "BRC dashboard forward still runs on accept");

  // The team email: built and sent only inside the function handed to after(),
  // which is the one place that waits for the bridge answer.
  assert.ok(teamEmail > bridge && teamDeferred > teamEmail, "the team email is decided after the bridge, inside after()");
  const teamBlock = source.slice(teamEmail, teamDeferred);
  assert.match(teamBlock, /\bbridge,/, "the team email is handed the pending bridge");
  assert.match(teamBlock, /recipients: \(\) => getAdminRecipientEmails\(SITE_CONFIG\.email\)/);
  assert.match(teamBlock, /subject: internalSubject\(data\)/);
  assert.match(teamBlock, /buildEstimateDetailHtml\(data\.estimate\)/, "the fallback email is the same email as before");
  assert.match(teamBlock, /buildLeadDashboardButton\(capturedLeadId\)/);
  assert.equal(source.match(/getAdminRecipientEmails\(/g)?.length, 1, "no team email outside the deferred one");
  assert.equal(source.match(/to: adminEmail/g)?.length, 1);
  assert.equal(source.match(/internalSubject\(data\)/g)?.length, 1);
  assert.match(source, /catch \(afterErr\) \{[^}]*void sendTeamEmail\(\);/, "a team email that cannot be deferred is sent, not dropped");

  // The customer's confirmation and the response: after the deferral, on the
  // visitor's path, with no reference to the bridge or the team email.
  assert.ok(customer > teamDeferred && customerSend > customer && response > customerSend);
  const visitorPath = source.slice(customer);
  assert.doesNotMatch(visitorPath, /bridge|pending|sendTeamEmail|P5BridgeResult|alert/, "nothing on the visitor's path reads the bridge");
  assert.match(visitorPath, /if \(data\.email\) \{\s*await client\.emails\.send/);

  assert.match(source, /catch \(bridgeErr\)/);
  assert.doesNotMatch(source, /await\s+forwardConsultationToP5Intake/);
  assert.doesNotMatch(source, /await\s+(bridge|pending)\b/);
  assert.doesNotMatch(source, /await\s+sendTeamEmail/);
  assert.doesNotMatch(source, /\.then\(/, "the bridge result is not chained on the visitor's path");
  assert.doesNotMatch(source, /HUBSPOT_TOKEN|@hubspot|HUBSPOT_/);
  const bridgeSource = readFileSync(new URL("../server/services/p5IntakeBridge.ts", import.meta.url), "utf8");
  assert.doesNotMatch(bridgeSource, /HUBSPOT_TOKEN|@hubspot\/|from ["']@hubspot|process\.env\.HUBSPOT/);
});

test("details path: the bridge is never awaited, and only the team email waits on it, inside after()", () => {
  const source = readFileSync(new URL("../app/api/consultation/details/route.ts", import.meta.url), "utf8");
  const replayed = source.indexOf('if (outcome.status === "replayed")');
  const bridge = source.indexOf("forwardConsultationToP5Intake(");
  const keptAlive = source.indexOf("after(() => pending)");
  const teamEmail = source.indexOf("sendTeamEmailAfterBridge({");
  const teamDeferred = source.indexOf("after(sendTeamEmail)");
  const response = source.indexOf("return NextResponse.json({ ok: true, saved: Object.keys(fields), files: files.length });");
  assert.ok(replayed >= 0 && bridge > replayed, "a replay forwards nothing and emails nobody");
  assert.ok(keptAlive > bridge, "bridge is kept alive with after(), not awaited");
  assert.ok(teamEmail > bridge && teamDeferred > teamEmail && response > teamDeferred);
  const teamBlock = source.slice(teamEmail, teamDeferred);
  assert.match(teamBlock, /\bbridge,/);
  assert.match(teamBlock, /recipients: \(\) => getAdminRecipientEmails\(SITE_CONFIG\.email\)/);
  assert.match(teamBlock, /"Files added" : "Details added"\}: \$\{name\}/);
  assert.equal(source.match(/getAdminRecipientEmails\(/g)?.length, 1, "no team email outside the deferred one");
  assert.match(source, /catch \(afterErr\) \{[^}]*void sendTeamEmail\(\);/);
  // The customer's confirmation is scheduled before the bridge exists and cannot read it.
  const confirmation = source.indexOf("to: confirmationEmail,");
  assert.ok(confirmation >= 0 && confirmation < source.indexOf("let bridge:"), "the customer email does not depend on the bridge");
  assert.doesNotMatch(source, /await\s+forwardConsultationToP5Intake/);
  assert.doesNotMatch(source, /await\s+(bridge|pending)\b/);
  assert.doesNotMatch(source, /await\s+sendTeamEmail/);
  assert.doesNotMatch(source, /\.then\(/);
});
