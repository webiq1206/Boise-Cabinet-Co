import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CALL_NOW_HREF,
  CALL_TEXT_HOURS,
  TEXT_US_HREF,
} from "../components/marketing/CallTextActions.tsx";
import {
  GOOGLE_ADS_SMS_CLICK_LABEL,
  GOOGLE_ADS_TEL_CLICK_LABEL,
  bindDelegatedContactClicks,
  trackCallTextClickConversion,
} from "../lib/callTextClickConversion.ts";
import { SITE_CONFIG } from "../shared/siteConfig.ts";

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

test("one tel click and one sms click each send their own conversion", () => {
  const browser = installBrowser();
  const release = bindDelegatedContactClicks();
  try {
    browser.click("tel:+12084771169");
    browser.click("sms:+12084771169");
    browser.click("tel:+12084771169");
    const sent = conversions(browser.calls);
    assert.equal(sent.length, 3);
    assert.deepEqual(sent.map((call) => (call[2] as { send_to: string }).send_to), [
      GOOGLE_ADS_TEL_CLICK_LABEL,
      GOOGLE_ADS_SMS_CLICK_LABEL,
      GOOGLE_ADS_TEL_CLICK_LABEL,
    ]);
    assert.equal(browser.calls.filter((call) => call[1] === "phone_clicked").length, 2);
    assert.equal(browser.calls.filter((call) => call[1] === "text_clicked").length, 1);
    for (const call of sent) {
      assert.deepEqual(Object.keys(call[2] as object), ["send_to"]);
      assert.equal(JSON.stringify(call).includes("user_data"), false);
      assert.equal(JSON.stringify(call).includes("+12084771169"), false);
      assert.equal(JSON.stringify(call).includes("@"), false);
    }
    assert.equal(browser.calls.some((call) => call[0] === "set" || call[1] === "user_data"), false);
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

test("binding the click listener twice does not double fire", () => {
  const browser = installBrowser();
  const first = bindDelegatedContactClicks();
  const second = bindDelegatedContactClicks();
  try {
    assert.equal(browser.listenerCount(), 1);
    browser.click("tel:+12084771169");
    assert.equal(conversions(browser.calls).length, 1);
    assert.equal((conversions(browser.calls)[0][2] as { send_to: string }).send_to, GOOGLE_ADS_TEL_CLICK_LABEL);
    second();
    browser.click("sms:+12084771169");
    assert.equal(conversions(browser.calls).length, 2);
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
  assert.equal(listener.includes("user_data"), false);
  assert.equal(listener.includes("gtag(\"set\""), false);
  const estimator = readFileSync("components/P5Estimator.tsx", "utf8");
  assert.equal(estimator.includes("ng9fCPiOhaAdEKzf-q9E"), false);
  assert.equal(estimator.includes("lTxsCOqahaAdEKzf-q9E"), false);
});

test("call and text actions use the site phone on marketing and estimator routes", () => {
  const nav = readFileSync("components/Navigation.tsx", "utf8");
  assert.match(nav, /data-mobile-call-text=""/);
  assert.match(nav, /data-estimator-reach=""/);
  assert.match(nav, /href=\{SITE_CONFIG\.phoneHref\}/);
  assert.match(nav, /href=\{SITE_CONFIG\.phoneSmsHref\}/);
  assert.match(nav, /pathname === "\/estimate"\) return null/);
  assert.match(nav, /isEstimatorPath\(pathname\)\?<EstimatorReachBar \/>/);
  const bootstrap = readFileSync("lib/analyticsBootstrap.ts", "utf8");
  const tag = readFileSync("components/seo/GoogleAnalytics.tsx", "utf8");
  assert.match(bootstrap, /phone_conversion_number: config\.phoneNumber/);
  assert.match(tag, /phoneConversionLabel: 'YHR0CIaPz_ccEKzf-q9E'/);
  assert.match(tag, /phoneNumber: '\(208\) 477-1169'/);
  assert.equal(bootstrap.split("phone_conversion_number").length - 1, 1);
  assert.equal(SITE_CONFIG.phoneHref, CALL_NOW_HREF);
  assert.equal(SITE_CONFIG.phoneSmsHref, TEXT_US_HREF);
});

test("click conversions carry no user data or personal fields", () => {
  const browser = installBrowser();
  const release = bindDelegatedContactClicks();
  try {
    browser.click("tel:+12084771169");
    browser.click("sms:+12084771169?body=Call%20me%20at%20home");
    const sent = conversions(browser.calls);
    assert.equal(sent.length, 2);
    for (const call of browser.calls) {
      const packed = JSON.stringify(call);
      assert.equal(packed.includes("user_data"), false);
      assert.equal(packed.includes("email"), false);
      assert.equal(packed.includes("phone_number"), false);
      assert.equal(packed.includes("+12084771169"), false);
      assert.equal(packed.includes("body="), false);
    }
    assert.deepEqual(sent[0][2], { send_to: GOOGLE_ADS_TEL_CLICK_LABEL });
    assert.deepEqual(sent[1][2], { send_to: GOOGLE_ADS_SMS_CLICK_LABEL });
  } finally {
    release();
    cleanupGlobals();
  }
});

test("the estimate text button does not change pricing or intake", () => {
  const page = readFileSync("app/estimate/page.tsx", "utf8");
  const actions = readFileSync("components/marketing/CallTextActions.tsx", "utf8");
  assert.match(page, /Start your cabinet quote in a few minutes/);
  assert.match(page, /Share your scope, photos or plans/);
  assert.match(page, /CallTextActions/);
  assert.equal(page.includes("calculateEstimate"), false);
  assert.equal(page.includes("intakeEndpoint"), false);
  assert.equal(page.includes("P5Estimator"), false);
  assert.equal(TEXT_US_HREF, "sms:+12084771169");
  assert.match(actions, /TEXT_US_HREF = "sms:\+12084771169"/);
  assert.match(actions, />\s*Text us\s*</);
  assert.match(actions, new RegExp(CALL_TEXT_HOURS.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  const manifest = JSON.parse(readFileSync("lib/p5/shared-manifest.json", "utf8")) as { files: Record<string, string> };
  const hash = (file: string) => createHash("sha256").update(readFileSync(file, "utf8").replace(/\r\n/g, "\n")).digest("hex");
  for (const file of ["components/P5Estimator.tsx", "lib/p5/intakeEndpoint.ts", "lib/p5/pricing.ts"]) {
    assert.equal(hash(file), manifest.files[file], file);
    assert.equal(readFileSync(file, "utf8").includes("Text us"), false, file);
    assert.equal(readFileSync(file, "utf8").includes("sms:+12084771169"), false, file);
  }
});

test("Priya rev 2 headlines and the contractor line", () => {
  const kitchen = readFileSync("app/cabinets/[room]/page.tsx", "utf8");
  const hub = readFileSync("app/cabinets/page.tsx", "utf8");
  const estimate = readFileSync("app/estimate/page.tsx", "utf8");
  const footer = readFileSync("components/Footer.tsx", "utf8");
  assert.match(kitchen, /Kitchen cabinets in Boise, designed and installed/);
  assert.match(kitchen, /Six door styles, hundreds of finishes, soft-close hardware\. Free in-home design consultation\./);
  assert.match(kitchen, /Custom built-ins designed to fit your home/);
  assert.match(kitchen, /Window seats, bookcases and benches, sized for out-of-plumb walls and uneven floors\./);
  assert.match(hub, /Custom kitchen cabinets in Boise and beyond/);
  assert.match(hub, /Kitchens, baths, closets and built-ins\. Free in-home design consultation\./);
  assert.match(estimate, /Start your cabinet quote in a few minutes/);
  const registration = readFileSync("components/RegistrationLink.tsx", "utf8");
  const flags = readFileSync("shared/trustFlags.ts", "utf8");
  const about = readFileSync("app/about/page.tsx", "utf8");
  assert.match(footer, /<RegistrationLink/);
  assert.match(flags, /export const IDAHO_REGISTERED_CONTRACTOR = "Idaho Registered Contractor #8381215"/);
  assert.match(flags, /export const DOPL_LICENSE_SEARCH_URL = "https:\/\/edopl\.idaho\.gov\/OnlineServices\/\?link=PubSearch"/);
  assert.match(registration, /\{IDAHO_REGISTERED_CONTRACTOR\}/);
  assert.match(registration, /rel="noopener"/);
  assert.equal(registration.includes("noreferrer"), false);
  assert.equal(footer.includes("License details available upon request"), false);
  assert.equal(footer.includes("Verify with Idaho DOPL"), false);
  assert.equal(about.includes("Verify with Idaho DOPL"), false);
  assert.match(about, /<RegistrationLink/);
  assert.match(about, /linkifyRegistration\(faq\.answer/);
  for (const file of [kitchen, hub, estimate, readFileSync("components/marketing/CallTextActions.tsx", "utf8")]) {
    assert.equal(/cabinet makers|built to order|\bmade\b/i.test(file), false);
  }
});
