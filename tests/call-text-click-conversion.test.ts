import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  GOOGLE_ADS_SMS_CLICK_LABEL,
  GOOGLE_ADS_TEL_CLICK_LABEL,
  bindDelegatedContactClicks,
  trackCallTextClickConversion,
} from "../lib/callTextClickConversion.ts";

type Call = unknown[];

function installBrowser(options: { host?: string; webdriver?: boolean; disabled?: boolean; gtag?: boolean } = {}) {
  const calls: Call[] = [];
  const store = new Map<string, string>();
  if (options.disabled) store.set("p5_analytics_disabled", "1");
  const listeners = new Set<(event: Event) => void>();
  const window = {
    location: { hostname: options.host ?? "boisecabinet.co", pathname: "/" },
    gtag: options.gtag === false ? undefined : (...args: unknown[]) => { calls.push(args); },
  };
  const document = {
    addEventListener: (_type: string, fn: (event: Event) => void) => { listeners.add(fn); },
    removeEventListener: (_type: string, fn: (event: Event) => void) => { listeners.delete(fn); },
  };
  (globalThis as { window?: typeof window; document?: typeof document; navigator?: { webdriver?: boolean } }).window = window;
  (globalThis as { document?: typeof document }).document = document;
  (globalThis as { navigator?: { webdriver?: boolean } }).navigator = { webdriver: options.webdriver === true };
  (globalThis as { sessionStorage?: { getItem: (key: string) => string | null } }).sessionStorage = {
    getItem: (key: string) => store.get(key) ?? null,
  };
  return {
    calls,
    listenerCount: () => listeners.size,
    click(href: string) {
      const link = {
        getAttribute: (name: string) => (name === "href" ? href : null),
        closest: (selector: string) => (selector === "a[href]" ? link : null),
      };
      const child = { closest: (selector: string) => (selector === "a[href]" ? link : null) };
      for (const fn of listeners) fn({ target: child } as unknown as Event);
    },
  };
}

function conversions(calls: Call[]) {
  return calls.filter((call) => call[0] === "event" && call[1] === "conversion");
}

function cleanupGlobals() {
  delete (globalThis as { window?: unknown }).window;
  delete (globalThis as { document?: unknown }).document;
  delete (globalThis as { navigator?: unknown }).navigator;
  delete (globalThis as { sessionStorage?: unknown }).sessionStorage;
}

test("one tel click and one sms click each send one conversion and one GA4 event", () => {
  const browser = installBrowser();
  const release = bindDelegatedContactClicks();
  try {
    browser.click("tel:+12084771169");
    browser.click("sms:+12084771169");
    const sent = conversions(browser.calls);
    assert.deepEqual(sent.map((call) => call[2]), [
      { send_to: GOOGLE_ADS_TEL_CLICK_LABEL },
      { send_to: GOOGLE_ADS_SMS_CLICK_LABEL },
    ]);
    assert.deepEqual(browser.calls.filter((call) => call[1] === "phone_clicked"), [["event", "phone_clicked", undefined]]);
    assert.deepEqual(browser.calls.filter((call) => call[1] === "text_clicked"), [["event", "text_clicked", undefined]]);
    assert.equal(browser.calls.length, 4);
  } finally {
    release();
    cleanupGlobals();
  }
});

test("analytics off sends no click conversion", () => {
  for (const options of [
    { disabled: true },
    { webdriver: true },
    { host: "localhost" },
    { gtag: false },
  ]) {
    const browser = installBrowser(options);
    const release = bindDelegatedContactClicks();
    try {
      browser.click("tel:+12084771169");
      browser.click("sms:+12084771169");
      assert.equal(conversions(browser.calls).length, 0, JSON.stringify(options));
      assert.equal(trackCallTextClickConversion("tel:+12084771169"), false);
    } finally {
      release();
      cleanupGlobals();
    }
  }
});

test("binding the click listener twice does not double fire the conversion or the GA4 event", () => {
  const browser = installBrowser();
  const first = bindDelegatedContactClicks();
  const second = bindDelegatedContactClicks();
  try {
    assert.equal(browser.listenerCount(), 1);
    browser.click("tel:+12084771169");
    assert.equal(conversions(browser.calls).length, 1);
    assert.equal(browser.calls.filter((call) => call[1] === "phone_clicked").length, 1);
    assert.equal((conversions(browser.calls)[0][2] as { send_to: string }).send_to, GOOGLE_ADS_TEL_CLICK_LABEL);
    second();
    browser.click("sms:+12084771169");
    assert.equal(conversions(browser.calls).length, 2);
    assert.equal(browser.calls.filter((call) => call[1] === "text_clicked").length, 1);
    assert.equal((conversions(browser.calls)[1][2] as { send_to: string }).send_to, GOOGLE_ADS_SMS_CLICK_LABEL);
  } finally {
    first();
    cleanupGlobals();
  }
});

test("the bridge registers that one listener and does not edit the estimator", () => {
  const bridge = readFileSync("components/seo/AnalyticsBridge.tsx", "utf8");
  const listener = readFileSync("lib/callTextClickConversion.ts", "utf8");
  assert.equal(bridge.split("bindDelegatedContactClicks()").length - 1, 1);
  assert.equal(bridge.includes('addEventListener("click"'), false);
  assert.equal(listener.split('addEventListener("click"').length - 1, 1);
  assert.equal(listener.includes('track("phone_clicked")'), true);
  assert.equal(listener.includes('track("text_clicked")'), true);
  assert.equal(listener.includes('track("email_clicked")'), true);
  const estimator = readFileSync("components/P5Estimator.tsx", "utf8");
  assert.equal(estimator.includes("ng9fCPiOhaAdEKzf-q9E"), false);
  assert.equal(estimator.includes("lTxsCOqahaAdEKzf-q9E"), false);
  const privacy = readFileSync("app/privacy-policy/page.tsx", "utf8");
  assert.equal(privacy.includes("ng9fCPiOhaAdEKzf-q9E"), false);
});

 test("throwing Ads tag preserves the contact action", () => {
  installBrowser();
  try {
    (window as unknown as {gtag: (...args: unknown[]) => void}).gtag = () => { throw new Error("tag unavailable"); };
    assert.equal(trackCallTextClickConversion("tel:+12084771169"), false);
  } finally { cleanupGlobals(); }
});
