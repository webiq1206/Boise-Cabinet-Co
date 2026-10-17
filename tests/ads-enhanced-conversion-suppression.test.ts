import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  normalizedEnhancedConversionEmail,
  normalizedEnhancedConversionPhone,
} from "../lib/ads/enhancedConversionContact";
import {
  addEnhancedConversionSuppression,
  allowEnhancedConversions,
  enhancedConversionHash,
  withEnhancedConversionAllowance,
} from "../lib/ads/enhancedConversionSuppression";
import {
  GOOGLE_ADS_LEAD_LABEL,
  noteEnhancedConversionAllowance,
  peekEnhancedConversionAllowance,
  trackGoogleAdsLeadConversion,
} from "../lib/googleAdsConversion";

type Query = (statement: string, values?: unknown[]) => Promise<Record<string, unknown>[]>;
type Call = unknown[];

function memoryQuery(rows: { kind: string; hash: string }[]): Query {
  return async (statement, values = []) => {
    if (statement.startsWith("CREATE TABLE")) return [];
    if (statement.startsWith("INSERT")) {
      const hash = String(values[0]);
      assert.equal(hash.includes("@"), false);
      assert.equal(hash.includes("+"), false);
      assert.match(hash, /^[a-f0-9]{64}$/);
      const kind = statement.includes("'email'") ? "email" : "phone";
      if (!rows.some((row) => row.kind === kind && row.hash === hash)) rows.push({ kind, hash });
      return [];
    }
    return rows.filter((row) => values.includes(row.hash)).slice(0, 1);
  };
}

function installWindow() {
  const store = new Map<string, string>();
  const win = {
    sessionStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    },
    setTimeout: (fn: TimerHandler, ms?: number) => setTimeout(fn, ms),
    location: { pathname: "/" },
    gtag: undefined as ((...args: unknown[]) => void) | undefined,
  };
  (globalThis as { window?: typeof win }).window = win;
  return win;
}

test("suppression stores only hashes of a trimmed email and an E.164 phone", async () => {
  const rows: { kind: string; hash: string }[] = [];
  const stored = await addEnhancedConversionSuppression(
    { email: "  Ada@Example.com ", phone: "(208) 555-0148" },
    memoryQuery(rows),
  );
  assert.deepEqual(stored, { email: true, phone: true });
  assert.equal(rows.length, 2);
  assert.equal(rows[0].hash, enhancedConversionHash(normalizedEnhancedConversionEmail("  Ada@Example.com ")!));
  assert.equal(rows[1].hash, enhancedConversionHash("+12085550148"));
  assert.equal(JSON.stringify(rows).includes("Ada"), false);
  assert.equal(JSON.stringify(rows).includes("555"), false);

  const skipped = await addEnhancedConversionSuppression({ phone: "+1 208 555 0148" }, memoryQuery(rows));
  assert.deepEqual(skipped, { email: false, phone: false });
  assert.equal(normalizedEnhancedConversionPhone("+1 208 555 0148"), undefined);
});

test("either matching hash blocks enhanced conversions without changing the lead body", async () => {
  const rows: { kind: string; hash: string }[] = [];
  const query = memoryQuery(rows);
  await addEnhancedConversionSuppression({ email: "ada@example.com" }, query);
  assert.equal(await allowEnhancedConversions({ email: " Ada@Example.com ", phone: "2085550100" }, query), false);
  assert.equal(await allowEnhancedConversions({ email: "other@example.com", phone: "2085550100" }, query), true);

  rows.push({ kind: "phone", hash: enhancedConversionHash("+12085550199") });
  assert.equal(await allowEnhancedConversions({ email: "other@example.com", phone: "208-555-0199" }, query), false);

  const lead = { accepted: true, id: "draft-1", result: { range: { low: 100, high: 200 } }, duplicate: false };
  const response = await withEnhancedConversionAllowance(lead, { email: "ada@example.com" }, query);
  assert.equal(response.allowEnhancedConversions, false);
  assert.equal(response.accepted, true);
  assert.equal(response.id, "draft-1");
  assert.deepEqual(response.result, lead.result);
  assert.equal("allowEnhancedConversions" in lead, false);
});

test("a suppressed contact skips user_data and still fires the conversion", () => {
  const win = installWindow();
  const calls: Call[] = [];
  win.gtag = (...args: unknown[]) => {
    calls.push(args);
  };
  noteEnhancedConversionAllowance(undefined);
  const id = "consultation-suppressed";
  assert.equal(
    trackGoogleAdsLeadConversion({ projectType: "kitchen" }, id, 0, {
      email: "ada@example.com",
      phone: "2085550100",
      name: "Ada Lovelace",
      postalCode: "83702",
      allowEnhancedConversions: false,
    }),
    true,
  );
  assert.equal(calls.some((call) => call[0] === "set"), false);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], "event");
  assert.equal(calls[0][1], "conversion");
  assert.equal((calls[0][2] as { send_to: string }).send_to, GOOGLE_ADS_LEAD_LABEL);
  assert.equal((calls[0][2] as { transaction_id: string }).transaction_id, id);
  assert.equal(JSON.stringify(calls[0][2]).includes("ada@example.com"), false);

  calls.length = 0;
  noteEnhancedConversionAllowance(false);
  assert.equal(
    trackGoogleAdsLeadConversion({ service: "kitchen" }, "estimator:draft-suppressed", 0, {
      email: "ada@example.com",
      name: "Ada Lovelace",
    }),
    true,
  );
  assert.equal(peekEnhancedConversionAllowance(), false);
  assert.equal(calls.some((call) => call[0] === "set"), false);
  assert.equal(calls.filter((call) => call[1] === "conversion").length, 2);
  noteEnhancedConversionAllowance(undefined);
  delete (globalThis as { window?: unknown }).window;
});

test("submit responses carry the allowance and the consultation lead still returns its id", () => {
  const consultation = readFileSync(new URL("../app/api/consultation/route.ts", import.meta.url), "utf8");
  const submit = readFileSync(new URL("../lib/p5/submitEndpoint.ts", import.meta.url), "utf8");
  const intake = readFileSync(new URL("../lib/p5/intakeEndpoint.ts", import.meta.url), "utf8");
  const form = readFileSync(new URL("../components/consultation/ConsultationFields.tsx", import.meta.url), "utf8");
  const saved = consultation.indexOf(".insert(leads)");
  const mailed = consultation.indexOf("client.emails.send");
  const flag = consultation.indexOf("allowEnhancedConversions");
  assert.ok(saved !== -1 && mailed > saved && flag > mailed);
  assert.match(consultation, /submissionId: data\.metaEventId/);
  assert.match(submit, /allowEnhancedConversions:await allowEnhancedConversions\(contact\)/);
  assert.match(submit, /allowEnhancedConversions:await allowEnhancedConversions\(draft\.contact\)/);
  assert.match(intake, /allowEnhancedConversions:await allowEnhancedConversions\(contact\)/);
  assert.match(form, /allowEnhancedConversions: result\.allowEnhancedConversions !== false/);
  assert.doesNotMatch(
    readFileSync(new URL("../app/privacy-policy/page.tsx", import.meta.url), "utf8"),
    /opt out of enhanced conversions/i,
  );
});
