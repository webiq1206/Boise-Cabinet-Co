import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test, { mock } from "node:test";
import { trackGoogleAdsLeadOnce } from "../lib/analytics/track";
import {
  GOOGLE_ADS_ESTIMATOR_COMPLETED_LABEL,
  GOOGLE_ADS_LEAD_LABEL,
  GTAG_RETRY_LIMIT,
  GTAG_RETRY_MS,
  trackGoogleAdsLeadConversion,
} from "../lib/googleAdsConversion";

type Store = Map<string, string>;
type Call = unknown[];

function installWindow(store: Store) {
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

function sendTo(call: Call): string {
  return (call[2] as { send_to: string }).send_to;
}

function transactionId(call: Call): string {
  return (call[2] as { transaction_id: string }).transaction_id;
}

test("an estimator key fires the estimator label once and a repeat fires nothing", () => {
  const store: Store = new Map();
  const win = installWindow(store);
  const calls: Call[] = [];
  win.gtag = (...args: unknown[]) => {
    calls.push(args);
  };
  const key = "estimator:draft-1";

  assert.equal(trackGoogleAdsLeadConversion({ service: "kitchen" }, key), true);
  assert.deepEqual(calls.map(sendTo), [GOOGLE_ADS_ESTIMATOR_COMPLETED_LABEL]);
  const estimatorCall = calls[0];
  assert.equal(estimatorCall[0], "event");
  assert.equal(estimatorCall[1], "conversion");
  assert.equal(transactionId(estimatorCall), key);
  assert.equal(store.get(`google_ads_estimator:${key}`), "sent");
  assert.equal(store.get(`google_ads_lead:${key}`), undefined);

  assert.equal(trackGoogleAdsLeadConversion({ service: "kitchen" }, key), false);
  assert.equal(calls.length, 1);

  delete (globalThis as { window?: unknown }).window;
});

test("an intake key fires the estimator label once and a repeat fires nothing", () => {
  const store: Store = new Map();
  const win = installWindow(store);
  const calls: Call[] = [];
  win.gtag = (...args: unknown[]) => {
    calls.push(args);
  };
  const key = "intake:project-9";

  assert.equal(trackGoogleAdsLeadConversion({ service: "kitchen" }, key), true);
  assert.deepEqual(calls.map(sendTo), [GOOGLE_ADS_ESTIMATOR_COMPLETED_LABEL]);
  assert.equal(transactionId(calls[0]), key);
  assert.equal(store.get(`google_ads_estimator:${key}`), "sent");
  assert.equal(store.get(`google_ads_lead:${key}`), undefined);
  assert.equal(trackGoogleAdsLeadConversion({ service: "kitchen" }, key), false);
  assert.equal(calls.length, 1);

  delete (globalThis as { window?: unknown }).window;
});

test("a form key fires the form label only", () => {
  const store: Store = new Map();
  const win = installWindow(store);
  const calls: Call[] = [];
  win.gtag = (...args: unknown[]) => {
    calls.push(args);
  };
  const id = "form-submission-1";

  assert.equal(trackGoogleAdsLeadOnce(id, { projectType: "kitchen" }), true);
  assert.equal(calls.length, 1);
  assert.equal(sendTo(calls[0]), GOOGLE_ADS_LEAD_LABEL);
  assert.equal(transactionId(calls[0]), id);
  assert.equal(
    calls.some((call) => sendTo(call) === GOOGLE_ADS_ESTIMATOR_COMPLETED_LABEL),
    false,
  );
  assert.equal(trackGoogleAdsLeadOnce(id, { projectType: "kitchen" }), false);
  assert.equal(calls.length, 1);

  delete (globalThis as { window?: unknown }).window;
});

test("an estimator key waits for gtag and does not mark sent early", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const store: Store = new Map();
  const win = installWindow(store);
  const calls: Call[] = [];
  const key = "estimator:draft-late";

  assert.equal(trackGoogleAdsLeadConversion({ service: "kitchen" }, key), false);
  assert.equal(store.get(`google_ads_estimator:${key}`), undefined);
  assert.equal(store.get(`google_ads_lead:${key}`), undefined);
  assert.equal(trackGoogleAdsLeadConversion({ service: "kitchen" }, key), false);

  mock.timers.tick(GTAG_RETRY_MS * 3);
  assert.equal(calls.length, 0);

  win.gtag = (...args: unknown[]) => {
    calls.push(args);
  };
  mock.timers.tick(GTAG_RETRY_MS);
  assert.deepEqual(calls.map(sendTo), [GOOGLE_ADS_ESTIMATOR_COMPLETED_LABEL]);
  assert.equal(store.get(`google_ads_estimator:${key}`), "sent");
  assert.equal(store.get(`google_ads_lead:${key}`), undefined);
  assert.equal(transactionId(calls[0]), key);

  trackGoogleAdsLeadConversion({ service: "kitchen" }, key);
  mock.timers.tick(GTAG_RETRY_MS * 4);
  assert.equal(calls.length, 1);

  mock.timers.reset();
  delete (globalThis as { window?: unknown }).window;
});

test("a conversion is dropped after about ten seconds without gtag", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const store: Store = new Map();
  installWindow(store);
  const key = "intake:gone";

  assert.equal(trackGoogleAdsLeadConversion({ service: "kitchen" }, key), false);
  mock.timers.tick(GTAG_RETRY_MS * (GTAG_RETRY_LIMIT + 2));
  assert.equal(store.get(`google_ads_estimator:${key}`), undefined);
  assert.equal(store.get(`google_ads_lead:${key}`), undefined);

  mock.timers.reset();
  delete (globalThis as { window?: unknown }).window;
});

test("a throwing gtag does not escape the conversion helper", () => {
  const store: Store = new Map();
  const win = installWindow(store);
  win.gtag = () => {
    throw new Error("gtag failed");
  };
  assert.equal(trackGoogleAdsLeadConversion({ service: "kitchen" }, "estimator:throws"), false);
  assert.equal(store.get("google_ads_estimator:estimator:throws"), undefined);
  assert.equal(store.get("google_ads_lead:estimator:throws"), undefined);
  delete (globalThis as { window?: unknown }).window;
});

test("estimator keys keep the estimator label even when a lead was accepted", () => {
  const store: Store = new Map();
  const win = installWindow(store);
  const calls: Call[] = [];
  win.gtag = (...args: unknown[]) => {
    calls.push(args);
  };
  const id = "11111111-2222-4333-8444-555555555555";
  const intakeKey = `intake:cabinet:${id}`;
  const estimatorKey = `estimator:${id}`;

  assert.equal(trackGoogleAdsLeadConversion({ service: "kitchen", acceptedLead: true }, intakeKey), true);
  assert.equal(trackGoogleAdsLeadConversion({ service: "kitchen", acceptedLead: true }, estimatorKey), true);

  const formCalls = calls.filter((call) => sendTo(call) === GOOGLE_ADS_LEAD_LABEL);
  const completionCalls = calls.filter((call) => sendTo(call) === GOOGLE_ADS_ESTIMATOR_COMPLETED_LABEL);
  assert.deepEqual(formCalls, []);
  assert.deepEqual(completionCalls.map(transactionId), [intakeKey, estimatorKey]);
  assert.equal(store.get(`google_ads_lead:${intakeKey}`), undefined);
  assert.equal(store.get(`google_ads_lead:${estimatorKey}`), undefined);
  assert.equal(store.get(`google_ads_estimator:${intakeKey}`), "sent");
  assert.equal(store.get(`google_ads_estimator:${estimatorKey}`), "sent");

  assert.equal(trackGoogleAdsLeadConversion({ service: "kitchen", acceptedLead: true }, intakeKey), false);
  assert.equal(trackGoogleAdsLeadConversion({ service: "kitchen", acceptedLead: true }, estimatorKey), false);
  assert.equal(calls.length, 2);

  delete (globalThis as { window?: unknown }).window;
});

test("a submit replay fires only the estimator label", () => {
  const store: Store = new Map();
  const win = installWindow(store);
  const calls: Call[] = [];
  win.gtag = (...args: unknown[]) => {
    calls.push(args);
  };
  const key = "estimator:draft-replay";

  assert.equal(trackGoogleAdsLeadConversion({ service: "kitchen", acceptedLead: false }, key), true);
  assert.equal(calls.length, 1);
  assert.equal(sendTo(calls[0]), GOOGLE_ADS_ESTIMATOR_COMPLETED_LABEL);
  assert.equal(transactionId(calls[0]), key);
  assert.equal(store.get(`google_ads_estimator:${key}`), "sent");
  assert.equal(store.get(`google_ads_lead:${key}`), undefined);

  assert.equal(trackGoogleAdsLeadConversion({ service: "kitchen", acceptedLead: false }, key), false);
  assert.equal(calls.length, 1);

  delete (globalThis as { window?: unknown }).window;
});

test("the engine calls the helper without the accepted flag", () => {
  const source = readFileSync(new URL("../components/P5Estimator.tsx", import.meta.url), "utf8");
  const intakeAt = source.indexOf("trackGoogleAdsLeadConversion({service:latest.answers.service},`intake:${receipt.projectId}`)");
  const submitAt = source.indexOf("trackGoogleAdsLeadConversion({service:d.answers.service},`estimator:${d.id}`)");
  const rejectedAt = source.lastIndexOf("if(!response.ok)throw", intakeAt);
  assert.ok(rejectedAt !== -1 && rejectedAt < intakeAt);
  assert.equal(source.includes("acceptedLead"), false);
  assert.equal(source.includes("data.accepted"), false);
  assert.ok(submitAt > intakeAt);
});

test("the shared estimator engine is unchanged", () => {
  const source = readFileSync(new URL("../components/P5Estimator.tsx", import.meta.url), "utf8");
  assert.match(source, /import \{trackGoogleAdsLeadConversion\} from '@\/lib\/googleAdsConversion'/);
  assert.match(
    source,
    /trackGoogleAdsLeadConversion\(\{service:latest\.answers\.service\},`intake:\$\{receipt\.projectId\}`\)/,
  );
  assert.match(source, /trackGoogleAdsLeadConversion\(\{service:d\.answers\.service\},`estimator:\$\{d\.id\}`\)/);
  assert.equal(source.includes("trackEstimatorCompletion"), false);
  const manifest = JSON.parse(
    readFileSync(new URL("../lib/p5/shared-manifest.json", import.meta.url), "utf8"),
  ) as { files: Record<string, string> };
  const hash = createHash("sha256").update(source.replace(/\r\n/g, "\n")).digest("hex");
  assert.equal(hash, manifest.files["components/P5Estimator.tsx"]);
});
