import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CALLBACK_PROJECT_TYPE,
  DEFAULT_PROJECT_TYPE,
  buildLeadNotes,
  consultationBodySchema,
  internalSubject,
  resolveProjectType,
} from "../server/services/consultationRequest.ts";

const key = "33333333-3333-4333-8333-333333333333";

test("the 'Have us call you' shape is accepted: name and phone only", () => {
  const parsed = consultationBodySchema.safeParse({
    name: "Avery Sample",
    phone: "(208) 555-0142",
    requestKind: "callback",
    preferredContact: "call",
    bestTime: "Morning",
    companyWebsite: "",
    metaEventId: key,
    source: "consultation",
  });
  assert.equal(parsed.success, true, JSON.stringify(parsed.success ? null : parsed.error.flatten()));
  if (!parsed.success) return;
  assert.equal(parsed.data.email, "");
  assert.equal(parsed.data.projectType, "");
  assert.equal(resolveProjectType(parsed.data), CALLBACK_PROJECT_TYPE);
  const notes = buildLeadNotes(parsed.data);
  assert.match(notes, /^CALLBACK REQUEST: please call \(208\) 555-0142\. Best time to call: Morning\.$/);
  assert.equal(internalSubject(parsed.data), "New callback request: Avery Sample");
});

test("a short request with no email is accepted when the visitor asked for a call or a text", () => {
  for (const preferredContact of ["call", "text"] as const) {
    const parsed = consultationBodySchema.safeParse({
      name: "Avery Sample",
      phone: "2085550142",
      projectType: "cabinet-project: Kitchen refresh",
      message: "Kitchen refresh, about 20 feet of cabinets",
      preferredContact,
      metaEventId: key,
    });
    assert.equal(parsed.success, true);
    if (!parsed.success) continue;
    assert.equal(parsed.data.requestKind, "request");
    const notes = buildLeadNotes(parsed.data);
    assert.match(notes, new RegExp(`^How to reach them: ${preferredContact === "call" ? "Call me" : "Text me"}\\.\\n\\nKitchen refresh`));
    assert.equal(internalSubject(parsed.data), "New consultation request: Avery Sample");
  }
});

test("email is required when 'Email me' is chosen, and a typed email must be valid", () => {
  const missing = consultationBodySchema.safeParse({
    name: "Avery Sample",
    phone: "2085550142",
    message: "Vanity",
    preferredContact: "email",
  });
  assert.equal(missing.success, false);
  if (!missing.success) assert.ok(missing.error.flatten().fieldErrors.email?.length);

  const invalid = consultationBodySchema.safeParse({
    name: "Avery Sample",
    phone: "2085550142",
    email: "not-an-email",
    preferredContact: "call",
  });
  assert.equal(invalid.success, false);
  if (!invalid.success) assert.ok(invalid.error.flatten().fieldErrors.email?.length);

  const ok = consultationBodySchema.safeParse({
    name: "Avery Sample",
    phone: "2085550142",
    email: "avery@example.invalid",
    preferredContact: "email",
  });
  assert.equal(ok.success, true);
});

test("the phone number is still required for every request, callback or not", () => {
  for (const requestKind of ["request", "callback"] as const) {
    const parsed = consultationBodySchema.safeParse({ name: "Avery Sample", phone: "123", requestKind });
    assert.equal(parsed.success, false);
  }
  assert.equal(consultationBodySchema.safeParse({ name: "A", phone: "2085550142" }).success, false);
});

test("older clients are unchanged: same notes, same project type, same subject", () => {
  const legacy = {
    name: "Playwright Test",
    phone: "(208) 555-0101",
    email: "playwright@example.invalid",
    address: "",
    zip: "",
    projectType: "kitchen",
    message: "From the finder - Style: Modern.",
    companyWebsite: "",
    metaEventId: key,
  };
  const parsed = consultationBodySchema.safeParse(legacy);
  assert.equal(parsed.success, true);
  if (!parsed.success) return;
  assert.equal(resolveProjectType(parsed.data), "kitchen");
  assert.equal(buildLeadNotes(parsed.data), legacy.message);
  assert.equal(internalSubject(parsed.data), "New consultation request: Playwright Test");
  assert.equal(resolveProjectType({ projectType: "", requestKind: "request" }), DEFAULT_PROJECT_TYPE);
});

test("the route stores the composed notes and project type at every destination", () => {
  const route = readFileSync(new URL("../app/api/consultation/route.ts", import.meta.url), "utf8");
  assert.match(route, /const bodySchema = consultationBodySchema;/);
  assert.match(route, /const projectType = resolveProjectType\(data\);/);
  assert.match(route, /const notes = buildLeadNotes\(data\);/);
  // The database row, the lead manager, the p5 intake bridge and the dashboard.
  assert.equal((route.match(/message: notes/g) ?? []).length >= 3, true);
  assert.match(route, /notes: notes \|\| undefined/);
  assert.doesNotMatch(route, /data\.message/);
  assert.doesNotMatch(route, /data\.projectType/);
  // The internal email names a callback in its subject; no customer email without an address.
  assert.match(route, /subject: internalSubject\(data\)/);
  assert.match(route, /if \(data\.email\) \{\s*await client\.emails\.send/);
});
