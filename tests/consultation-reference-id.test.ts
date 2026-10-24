import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { consultationReferenceId } from "../lib/consultationReferenceId";

const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test("a consultation reference is a random UUID, including when randomUUID is missing", () => {
  const first = consultationReferenceId();
  const second = consultationReferenceId();
  assert.match(first, uuid);
  assert.match(second, uuid);
  assert.notEqual(first, second);

  const original = crypto.randomUUID;
  Object.defineProperty(crypto, "randomUUID", { configurable: true, value: undefined });
  try {
    const fallback = consultationReferenceId();
    assert.match(fallback, uuid);
    assert.equal(fallback.includes("lead-"), false);
  } finally {
    Object.defineProperty(crypto, "randomUUID", { configurable: true, value: original });
  }
});

test("Google Ads transaction ids are random draft or consultation ids, not lead fields", () => {
  const consultation = readFileSync(new URL("../components/consultation/ConsultationFields.tsx", import.meta.url), "utf8");
  const route = readFileSync(new URL("../app/api/consultation/route.ts", import.meta.url), "utf8");
  const estimator = readFileSync(new URL("../components/P5Estimator.tsx", import.meta.url), "utf8");
  const drafts = readFileSync(new URL("../lib/p5/browserDraft.ts", import.meta.url), "utf8");
  const ads = readFileSync(new URL("../lib/googleAdsConversion.ts", import.meta.url), "utf8");

  assert.match(consultation, /consultationSessionKey\(consultationReferenceId\)/);
  assert.match(consultation, /metaEventIdRef\.current = submission\.id/);
  assert.match(consultation, /result\.submissionId \|\| metaEventIdRef\.current/);
  assert.match(route, /submissionId: data\.metaEventId/);
  assert.match(drafts, /const uuidBytes=crypto\.getRandomValues\(new Uint8Array\(16\)\);uuidBytes\[6\]=\(uuidBytes\[6\]&15\)\|64;/);
  assert.match(estimator, /trackGoogleAdsLeadConversion\(\{service:d\.answers\.service\},`estimator:\$\{d\.id\}`\)/);
  assert.match(estimator, /trackGoogleAdsLeadConversion\(\{service:latest\.answers\.service\},`intake:\$\{receipt\.projectId\}`\)/);
  assert.match(ads, /if \(transactionId\) params\.transaction_id = transactionId/);
  assert.match(ads, /transaction_id: dedupeKey/);
  assert.doesNotMatch(ads, /transaction_id:.*(name|email|phone|address)/);
});
