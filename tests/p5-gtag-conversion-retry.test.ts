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

test("an estimator key fires both labels once and a repeat fires nothing", () => {
  const store: Store = new Map();
  const win = installWindow(store);
  const calls: Call[] = [];
  win.gtag = (...args: unknown[]) => {
    calls.push(args);
  };
  const key = "estimator:draft-1";

  assert.equal(trackGoogleAdsLeadConversion({ service: "kitchen" }, key), true);
  assert.deepEqual(calls.map(sendTo).sort(), [GOOGLE_ADS_ESTIMATOR_COMPLETED_LABEL, GOOGLE_ADS_LEAD_LABEL].sort());
  for (const call of calls) {
    assert.equal(call[0], "event");
    assert.equal(call[1], "conversion");
    assert.equal((call[2] as { transaction_id: string }).transaction_id, key);
  }

  assert.equal(trackGoogleAdsLeadConversion({ service: "kitchen" }, key), false);
  assert.equal(calls.length, 2);

  delete (globalThis as { window?: unknown }).window;
});

test("an intake key fires both labels once and a repeat fires nothing", () => {
  const store: Store = new Map();
  const win = installWindow(store);
  const calls: Call[] = [];
  win.gtag = (...args: unknown[]) => {
    calls.push(args);
  };
  const key = "intake:project-9";

  assert.equal(trackGoogleAdsLeadConversion({ service: "kitchen" }, key), true);
  assert.deepEqual(calls.map(sendTo).sort(), [GOOGLE_ADS_ESTIMATOR_COMPLETED_LABEL, GOOGLE_ADS_LEAD_LABEL].sort());
  for (const call of calls) {
    assert.equal((call[2] as { transaction_id: string }).transaction_id, key);
  }
  assert.equal(trackGoogleAdsLeadConversion({ service: "kitchen" }, key), false);
  assert.equal(calls.length, 2);

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
  assert.equal((calls[0][2] as { transaction_id: string }).transaction_id, id);
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
  assert.deepEqual(calls.map(sendTo).sort(), [GOOGLE_ADS_ESTIMATOR_COMPLETED_LABEL, GOOGLE_ADS_LEAD_LABEL].sort());
  assert.equal(store.get(`google_ads_estimator:${key}`), "sent");
  assert.equal(store.get(`google_ads_lead:${key}`), "sent");

  trackGoogleAdsLeadConversion({ service: "kitchen" }, key);
  mock.timers.tick(GTAG_RETRY_MS * 4);
  assert.equal(calls.length, 2);

  mock.timers.reset();
  delete (globalThis as { window?: unknown }).window;
});

test("a conversion is dropped after about five seconds without gtag", () => {
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
  delete (globalThis as { window?: unknown }).window;
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
