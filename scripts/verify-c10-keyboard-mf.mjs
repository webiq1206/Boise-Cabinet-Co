/**
 * C10 keyboard-open verification for Cabinet MF1.
 * Emulates Sam: pin form under sticky header, ~40% vh keyboard overlay via visualViewport mock.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL || "http://127.0.0.1:3012";
const OUT = process.env.OUT_DIR ||
  "/cursor/stores/bc-fa516634-edf2-495a-8bfc-8fbd19e4966b/media/boise-cabinet-co/design-review/v2-3-mf";

const VIEWPORTS = [
  { name: "320x568", width: 320, height: 568 },
  { name: "360x640", width: 360, height: 640 },
  { name: "390x844", width: 390, height: 844 },
  { name: "768x1024", width: 768, height: 1024 },
];

fs.mkdirSync(OUT, { recursive: true });

async function installKeyboardMock(page, vh) {
  const kbH = Math.round(vh * 0.4);
  const usable = vh - kbH;
  await page.evaluate(({ usable }) => {
    const vv = {
      height: usable,
      width: window.innerWidth,
      offsetTop: 0,
      offsetLeft: 0,
      scale: 1,
      addEventListener(type, fn) {
        this._fns = this._fns || {};
        (this._fns[type] = this._fns[type] || []).push(fn);
      },
      removeEventListener(type, fn) {
        this._fns = this._fns || {};
        this._fns[type] = (this._fns[type] || []).filter((f) => f !== fn);
      },
      dispatch(type) {
        for (const fn of this._fns?.[type] || []) fn();
      },
    };
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      get: () => vv,
    });
    document.body.dataset.estimateKeyboard = "true";
    vv.dispatch("resize");
    window.dispatchEvent(new Event("resize"));
    document.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    window.__kbMock = { usable, vv };
  }, { usable });
  // Wait until the fixed action bar has ridden the inset (or fallback).
  await page.waitForFunction(() => {
    const el = document.querySelector("[data-wizard-action-bar]");
    if (!el) return false;
    const bottom = getComputedStyle(el).bottom;
    const px = Number.parseFloat(bottom);
    return Number.isFinite(px) && px > 40;
  }, { timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(100);
  return { usable, kbH };
}

function behind(rect, usable) {
  return rect.bottom > usable + 1;
}

async function measureControls(page, selectors, usable) {
  return page.evaluate(({ selectors, usable }) => {
    return selectors.map(({ label, sel }) => {
      const el = document.querySelector(sel);
      if (!el) return { label, missing: true, behind: true };
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return {
        label,
        top: r.top,
        bottom: r.bottom,
        height: r.height,
        position: style.position,
        behind: r.bottom > usable + 1 || r.top >= usable,
        barBottom: style.bottom,
      };
    });
  }, { selectors, usable });
}

async function disableSmoothScroll(page) {
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
    history.scrollRestoration = "manual";
  });
}

async function pinUnderHeader(page, sel) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const header = document.querySelector("header, .site-header, [data-site-header]");
    const headerH = header ? header.getBoundingClientRect().height : 64;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, top - headerH - 8), behavior: "instant" });
  }, sel);
}

/** Keep the focused field inside the keyboard-open usable band (C10). */
async function fitFieldInBand(page, usable) {
  await page.evaluate((usable) => {
    document.documentElement.style.scrollBehavior = "auto";
    const header = document.querySelector("header, .site-header, [data-site-header]");
    const headerH = header ? header.getBoundingClientRect().height : 64;
    const active = document.activeElement;
    const field =
      active instanceof HTMLElement && active.matches("input, textarea, select")
        ? active
        : document.querySelector(
            "[data-c10-contact-compact] input:not([type=hidden]):not([tabindex='-1']), [data-c10-estimate-quote] input:not([type=hidden]):not([tabindex='-1']), [data-testid=input-name]",
          );
    if (!(field instanceof HTMLElement)) return;
    const abs = field.getBoundingClientRect().top + window.scrollY;
    const targetTop = headerH + 12;
    window.scrollTo({ top: Math.max(0, abs - targetTop), behavior: "instant" });
    const rect2 = field.getBoundingClientRect();
    const maxBottom = usable - 108;
    if (rect2.bottom > maxBottom) {
      window.scrollTo({ top: window.scrollY + (rect2.bottom - maxBottom), behavior: "instant" });
    }
  }, usable);
}

async function runContact(page, vp, results) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.goto(`${BASE}/contact`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await disableSmoothScroll(page);
  await page.evaluate(() => {
    try {
      sessionStorage.removeItem("brc_contact_compact_v2");
      sessionStorage.removeItem("brc_contact_compact_v1");
    } catch { /* ignore */ }
  });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
  await disableSmoothScroll(page);
  const name = page.locator("[data-testid=input-name]");
  await name.waitFor({ state: "visible", timeout: 30000 });
  await pinUnderHeader(page, "[data-testid=input-name]");
  const { usable, kbH } = await installKeyboardMock(page, vp.height);
  await name.focus();
  await fitFieldInBand(page, usable);
  await page.waitForTimeout(150);

  const step1 = await measureControls(page, [
    { label: "name", sel: "[data-testid=input-name]" },
    { label: "continue", sel: "[data-testid=button-contact-continue], [data-testid=wizard-continue]" },
  ], usable);

  await page.screenshot({
    path: path.join(OUT, `contact-step1-kb-${vp.name}.png`),
    fullPage: false,
  });

  // advance through name → phone → email → project/notes as needed for step2-like send
  // Fill and continue until last step or 8 presses
  for (let i = 0; i < 8; i++) {
    const progress = await page.locator("[data-testid=contact-compact-progress]").textContent();
    const continueBtn = page.locator("[data-testid=button-contact-continue]");
    const submitBtn = page.locator("[data-testid=button-submit-consultation]");
    if (await submitBtn.count()) break;
    if (!(await continueBtn.count())) break;
    const step = await page.getAttribute("form[data-c10-contact-compact]", "data-compact-step");
    if (step === "name") await page.fill("[data-testid=input-name]", "Jane Smith");
    if (step === "phone") await page.fill("[data-testid=input-phone]", "2085551212");
    if (step === "email") await page.fill("[data-testid=input-email]", "jane@example.com");
    if (step === "project") {
      await page.locator("[data-testid=select-project-type]").click();
      await page.locator('[role=option]').first().click();
    }
    await continueBtn.click();
    await page.waitForTimeout(150);
    await installKeyboardMock(page, vp.height);
  }

  await pinUnderHeader(page, "[data-c10-contact-form], form[data-c10-contact-compact]");
  const lastField = page.locator("form[data-c10-contact-compact] input, form[data-c10-contact-compact] textarea, form[data-c10-contact-compact] button[data-testid=button-toggle-details]").first();
  if (await lastField.count()) await lastField.focus().catch(() => {});
  await installKeyboardMock(page, vp.height);
  await fitFieldInBand(page, usable);
  await page.waitForTimeout(150);

  const stepLast = await measureControls(page, [
    { label: "back", sel: "[data-testid=button-contact-back], [data-testid=wizard-back]" },
    { label: "submit", sel: "[data-testid=button-submit-consultation]" },
  ], usable);

  await page.screenshot({
    path: path.join(OUT, `contact-last-kb-${vp.name}.png`),
    fullPage: false,
  });

  const behind1 = step1.filter((x) => x.behind && !x.missing);
  const behindL = stepLast.filter((x) => x.behind && !x.missing);
  results.contact.push({
    viewport: vp.name,
    usable,
    kbH,
    step1,
    stepLast,
    behindCount: behind1.length + behindL.length,
    pass: behind1.length === 0 && behindL.length === 0,
    progress: await page.locator("[data-testid=contact-compact-progress]").textContent().catch(() => null),
  });
}

async function runEstimateQuote(page, vp, results) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.goto(`${BASE}/estimate`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await disableSmoothScroll(page);
  await page.evaluate(() => {
    try {
      sessionStorage.removeItem("brc_estimate_quote_v1");
      sessionStorage.removeItem("brc_contact_compact_v2");
    } catch { /* ignore */ }
  });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
  await disableSmoothScroll(page);
  await page.locator("[data-c10-estimate-quote]").waitFor({ state: "visible", timeout: 30000 });
  await pinUnderHeader(page, "#kc-name, [data-c10-estimate-quote]");
  const { usable, kbH } = await installKeyboardMock(page, vp.height);

  // Walk all four quote steps with keyboard open
  const stepResults = [];
  for (let i = 0; i < 4; i++) {
    await installKeyboardMock(page, vp.height);
    const step = await page.getAttribute("[data-c10-estimate-quote]", "data-quote-step");
    if (step === "name") {
      await page.fill("#kc-name", "Jane Smith");
      await page.locator("#kc-name").focus();
    } else if (step === "phone") {
      await page.fill("#kc-phone", "2085551212");
      await page.locator("#kc-phone").focus();
    } else if (step === "email") {
      await page.fill("#kc-email", "jane@example.com");
      await page.locator("#kc-email").focus();
    } else if (step === "project") {
      await page.fill("#kc-project", "Full kitchen remodel");
      await page.locator("#kc-project").focus();
    }
    await fitFieldInBand(page, usable);
    // Re-fit once more after the dock spacer/inset settles.
    await page.waitForTimeout(200);
    await fitFieldInBand(page, usable);
    // Controls that must clear the keyboard: field + primary. Bar may sit on the usable edge.
    const measured = await measureControls(page, [
      { label: "field", sel: "[data-c10-estimate-quote] input:not([type=hidden]):not([tabindex='-1'])" },
      { label: "continue", sel: "[data-testid=button-estimate-quote-continue], [data-testid=button-estimate-quote-submit]" },
    ], usable);
    await page.screenshot({
      path: path.join(OUT, `estimate-quote-${step}-kb-${vp.name}.png`),
      fullPage: false,
    });
    stepResults.push({ step, measured, behind: measured.filter((m) => m.behind && !m.missing) });
    if (i < 3) {
      await page.locator("[data-testid=button-estimate-quote-continue]").click({ force: true });
      await page.waitForTimeout(200);
    }
  }

  const behindCount = stepResults.reduce((n, s) => n + s.behind.length, 0);
  results.estimateQuote.push({
    viewport: vp.name,
    usable,
    kbH,
    stepResults,
    behindCount,
    pass: behindCount === 0,
  });
}

async function runEstimateD2Contact(page, vp, results) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.goto(`${BASE}/estimate`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.locator("[data-testid=estimate-d2-details]").waitFor({ state: "attached", timeout: 30000 });
  // Seed a complete kitchen room and jump to contact (last step).
  await page.evaluate(() => {
    const rooms = [{
      project: "kitchen",
      size: 144,
      sizeUpper: 144,
      construction: "framed",
      doorStyle: "shaker",
      colorFamily: "white",
      layout: "l-shape",
    }];
    localStorage.setItem("brc_estimate_wizard", JSON.stringify({
      rooms,
      currentIndex: 6,
    }));
  });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
  const details = page.locator("[data-testid=estimate-d2-details]");
  await details.locator("summary").click();
  await page.waitForTimeout(500);
  // Click through until contact name field appears
  for (let i = 0; i < 24; i++) {
    if (await page.locator("form[data-c10-contact-compact] [data-testid=input-name]").isVisible().catch(() => false)) break;
    const book = page.getByRole("button", { name: /book|visit|continue|send|start/i });
    const next = page.locator("[data-testid=wizard-next]");
    if (await next.isVisible().catch(() => false) && await next.isEnabled().catch(() => false)) {
      await next.click({ force: true }).catch(() => {});
    } else if (await book.count()) {
      await book.first().click({ force: true }).catch(() => {});
    }
    await page.waitForTimeout(250);
  }

  const name = page.locator("[data-estimate-contact-step] [data-testid=input-name]");
  await name.waitFor({ state: "visible", timeout: 20000 });
  await disableSmoothScroll(page);
  await pinUnderHeader(page, "[data-estimate-contact-step] [data-testid=input-name]");
  const { usable, kbH } = await installKeyboardMock(page, vp.height);
  await name.focus();
  await fitFieldInBand(page, usable);
  await page.waitForTimeout(200);
  await fitFieldInBand(page, usable);

  const measured = await measureControls(page, [
    { label: "name", sel: "[data-estimate-contact-step] [data-testid=input-name]" },
    { label: "continue", sel: "[data-estimate-contact-step] [data-testid=button-contact-continue], [data-testid=button-submit-consultation]" },
  ], usable);

  await page.screenshot({
    path: path.join(OUT, `estimate-d2-contact-kb-${vp.name}.png`),
    fullPage: false,
  });

  const behindList = measured.filter((m) => m.behind && !m.missing);
  const barOk = await page.evaluate((usable) => {
    const el = document.querySelector("[data-wizard-action-bar]");
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const bottom = Number.parseFloat(getComputedStyle(el).bottom);
    return r.bottom <= usable + 2 && Number.isFinite(bottom) && bottom > 40;
  }, usable);
  results.estimateD2Contact.push({
    viewport: vp.name,
    usable,
    kbH,
    measured,
    behindCount: behindList.length,
    barOk,
    pass: behindList.length === 0 && barOk,
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = { contact: [], estimateQuote: [], estimateD2Contact: [], sha: null };

  for (const vp of VIEWPORTS) {
    await runContact(page, vp, results);
    await runEstimateQuote(page, vp, results);
  }
  // D2 contact focus: required fail was @390
  await runEstimateD2Contact(page, VIEWPORTS[2], results);
  await runEstimateD2Contact(page, VIEWPORTS[0], results);

  const summary = {
    contactPass: results.contact.every((r) => r.pass),
    estimateQuotePass: results.estimateQuote.every((r) => r.pass),
    estimateD2Pass: results.estimateD2Contact.every((r) => r.pass),
  };
  summary.pass = summary.contactPass && summary.estimateQuotePass && summary.estimateD2Pass;

  const out = { capturedAt: new Date().toISOString(), base: BASE, summary, ...results };
  fs.writeFileSync(path.join(OUT, "measurements.json"), JSON.stringify(out, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  await browser.close();
  if (!summary.pass) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
