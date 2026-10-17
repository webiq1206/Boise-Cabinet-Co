import assert from "node:assert/strict";
import test, { mock } from "node:test";
import { trackGoogleAdsLeadOnce } from "../lib/analytics/track";
import {
  GTAG_RETRY_LIMIT,
  GTAG_RETRY_MS,
  trackGoogleAdsLeadConversion,
} from "../lib/googleAdsConversion";

type Store = Map<string, string>;

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

test("a form lead waits for gtag and fires once", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const store: Store = new Map();
  const win = installWindow(store);
  const calls: unknown[][] = [];
  const id = "form-late-gtag";

  assert.equal(trackGoogleAdsLeadOnce(id, { projectType: "kitchen" }), false);
  assert.equal(store.get(`google_ads_lead:${id}`), undefined);
  assert.equal(trackGoogleAdsLeadOnce(id, { projectType: "kitchen" }), false);

  mock.timers.tick(GTAG_RETRY_MS * 3);
  assert.equal(calls.length, 0);
  assert.equal(store.get(`google_ads_lead:${id}`), undefined);

  win.gtag = (...args: unknown[]) => {
    calls.push(args);
  };
  mock.timers.tick(GTAG_RETRY_MS);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], "event");
  assert.equal(calls[0][1], "conversion");
  assert.equal(store.get(`google_ads_lead:${id}`), "sent");

  assert.equal(trackGoogleAdsLeadOnce(id, { projectType: "kitchen" }), false);
  mock.timers.tick(GTAG_RETRY_MS * GTAG_RETRY_LIMIT);
  assert.equal(calls.length, 1);

  mock.timers.reset();
  delete (globalThis as { window?: unknown }).window;
});

test("the estimator conversion waits for gtag and fires once", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const store: Store = new Map();
  const win = installWindow(store);
  const calls: unknown[][] = [];
  const key = "estimator:draft-1";

  assert.equal(trackGoogleAdsLeadConversion({ service: "kitchen" }, key), false);
  assert.equal(store.get(`google_ads_lead:${key}`), undefined);

  mock.timers.tick(GTAG_RETRY_MS * (GTAG_RETRY_LIMIT - 1));
  assert.equal(calls.length, 0);

  win.gtag = (...args: unknown[]) => {
    calls.push(args);
  };
  mock.timers.tick(GTAG_RETRY_MS);
  assert.equal(calls.length, 1);
  assert.equal(store.get(`google_ads_lead:${key}`), "sent");

  trackGoogleAdsLeadConversion({ service: "kitchen" }, key);
  mock.timers.tick(GTAG_RETRY_MS * 4);
  assert.equal(calls.length, 1);

  mock.timers.reset();
  delete (globalThis as { window?: unknown }).window;
});

test("a ready gtag fires on the first call and not again", () => {
  const store: Store = new Map();
  const win = installWindow(store);
  const calls: unknown[][] = [];
  win.gtag = (...args: unknown[]) => {
    calls.push(args);
  };
  const id = "form-ready-gtag";
  assert.equal(trackGoogleAdsLeadOnce(id, { projectType: "kitchen" }), true);
  assert.equal(trackGoogleAdsLeadOnce(id, { projectType: "kitchen" }), false);
  assert.equal(calls.length, 1);
  delete (globalThis as { window?: unknown }).window;
});

test("a conversion is dropped after about five seconds without gtag", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const store: Store = new Map();
  installWindow(store);
  const key = "intake:gone";

  assert.equal(trackGoogleAdsLeadConversion({ service: "kitchen" }, key), false);
  mock.timers.tick(GTAG_RETRY_MS * (GTAG_RETRY_LIMIT + 2));
  assert.equal(store.get(`google_ads_lead:${key}`), undefined);

  mock.timers.reset();
  delete (globalThis as { window?: unknown }).window;
});
