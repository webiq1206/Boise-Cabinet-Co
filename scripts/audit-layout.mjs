/**
 * Layout / readability audit across every public route at both breakpoints.
 * Catches regressions from the sitewide type-scale change: horizontal overflow,
 * visually clipped text, sub-12px copy, small touch targets, console errors and
 * failed requests.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:4321";
const ROUTES = [
  "/", "/about", "/accessories", "/blog", "/builders", "/cabinets",
  "/cabinets/kitchen", "/cabinets/bathroom", "/catalog", "/compare",
  "/construction", "/contact", "/dealer", "/estimate", "/guides",
  "/guides/boise-cabinet-cost-guide", "/installer", "/locations/boise",
  "/login", "/privacy-policy", "/resources", "/search", "/shaker-cabinets",
  "/terms-of-service", "/testimonials", "/warranty",
];
// Default to one representative phone + desktop so the routine run stays quick.
// Override for a wider sweep, e.g.
//   AUDIT_WIDTHS=360,375,390,414,768,1440 npm run audit:layout
// Anything under 768 is treated as a touch device so (pointer: coarse) rules
// (the .tap-target sizing) are exercised the way a real phone would.
const DEFAULT_WIDTHS = [375, 1440];
const WIDTHS = (process.env.AUDIT_WIDTHS || "")
  .split(",").map(w => parseInt(w.trim(), 10)).filter(Boolean);
const VIEWPORTS = (WIDTHS.length ? WIDTHS : DEFAULT_WIDTHS).map(width => ({
  name: width < 768 ? `phone-${width}` : width < 1200 ? `tablet-${width}` : `desktop-${width}`,
  width,
  height: width < 768 ? 812 : width < 1200 ? 1024 : 900,
  isMobile: width < 768,
}));

const AUDIT = () => {
  const de = document.documentElement, vw = de.clientWidth;
  const isFixed = el => getComputedStyle(el).position === "fixed";

  const overflow = [];
  document.querySelectorAll("body *").forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || isFixed(el)) return;
    if (r.right > vw + 2) overflow.push(`${el.tagName}.${(el.className||"").toString().trim().split(/\s+/).slice(0,3).join(".")}`);
  });

  // Text visually cut off: overflows its box AND an ancestor hides the spill,
  // with no intentional ellipsis/line-clamp.
  const clipped = [];
  document.querySelectorAll("p,li,span,h1,h2,h3,h4,button,a,td,label").forEach(el => {
    if (el.children.length) return;
    const t = (el.textContent || "").trim();
    if (t.length < 3) return;
    // sr-only content (skip links, live regions) is clipped to a 1px box on
    // purpose - counting it made every page look like it had clipped text.
    if (el.clientWidth <= 1 || el.clientHeight <= 1) return;
    if (/\bsr-only\b/.test((el.className || "").toString())) return;
    if (!(el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1)) return;
    const cs = getComputedStyle(el);
    if (cs.textOverflow === "ellipsis" || cs.webkitLineClamp.match(/\d/)) return;
    let n = el, hidden = false;
    while (n && n !== document.body) {
      const o = getComputedStyle(n);
      if (o.overflow === "hidden" || o.overflowX === "hidden") { hidden = true; break; }
      n = n.parentElement;
    }
    if (hidden) clipped.push(`"${t.slice(0,26)}" ${el.scrollWidth}>${el.clientWidth}`);
  });

  let min = 99, minText = "";
  document.querySelectorAll("p,li,span,a,button,label,div,td,h1,h2,h3").forEach(el => {
    const t = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join("");
    if (t.length < 8) return;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 5) return;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs < min) { min = fs; minText = t.slice(0, 26); }
  });

  const smallTargets = [];
  document.querySelectorAll("a,button,input,select,textarea,[role=button]").forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width < 3 || r.height < 3) return;           // sr-only / honeypot
    const inProse = el.closest("p,li") && getComputedStyle(el).display.includes("inline");
    if (inProse) return;                                // WCAG 2.5.8 exemption
    if (r.height < 44 || r.width < 44)
      smallTargets.push(`${el.tagName}"${(el.textContent||"").trim().slice(0,16)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
  });

  // ─── Structure / wayfinding ───
  // Does the page answer "where am I", "what is this", and "what do I do next"?
  const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")]
    .filter(h => h.getBoundingClientRect().height > 0 || h.closest("main"))
    .map(h => ({ level: +h.tagName[1], text: (h.textContent||"").trim().slice(0,40) }));
  const h1s = headings.filter(h => h.level === 1);
  // A skipped level (h2 -> h4) makes the outline unreadable to screen readers.
  const skips = [];
  for (let i = 1; i < headings.length; i++) {
    const jump = headings[i].level - headings[i-1].level;
    if (jump > 1) skips.push(`h${headings[i-1].level}->h${headings[i].level} @"${headings[i].text}"`);
  }
  const breadcrumb = !!document.querySelector('nav[aria-label="Breadcrumb" i]');
  // Primary next action: the site's canonical conversion CTAs.
  const ctaRe = /get an estimate|book|consult|start estimating|send my request|contact/i;
  const ctas = [...document.querySelectorAll("a,button")]
    .filter(el => el.getBoundingClientRect().height > 0 && ctaRe.test((el.textContent||"")));
  const title = document.title || "";
  const desc = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";

  return { h1Count: h1s.length, h1Text: h1s[0]?.text ?? null,
    headingSkips: skips.slice(0,3), headingSkipCount: skips.length,
    hasBreadcrumb: breadcrumb, ctaCount: ctas.length,
    titleLen: title.length, descLen: desc.length,
    overflow: [...new Set(overflow)].slice(0,5), overflowCount: overflow.length,
    clipped: [...new Set(clipped)].slice(0,5), clippedCount: clipped.length,
    smallestPx: min, smallestText: minText,
    smallTargets: [...new Set(smallTargets)].slice(0,5), smallTargetCount: smallTargets.length,
    hOverflow: de.scrollWidth > vw + 1 };
};

const browser = await chromium.launch();
const findings = [];
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile, hasTouch: vp.isMobile,
    userAgent: vp.isMobile ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" : undefined });
  for (const route of ROUTES) {
    const page = await ctx.newPage();
    const errors = [], failed = [];
    page.on("console", m => { if (m.type() === "error") errors.push(m.text().slice(0,110)); });
    page.on("requestfailed", r => {
      // Large assets the page merely prefetches (e.g. an 11MB catalog PDF) get
      // cancelled when we close the page. That is our teardown, not a broken
      // link, so record the reason and skip aborts.
      const reason = r.failure()?.errorText || "";
      if (/ERR_ABORTED|NS_BINDING_ABORTED/i.test(reason)) return;
      failed.push(`${r.url().split("/").slice(3).join("/").slice(0,60)} (${reason})`);
    });
    let res;
    try {
      res = await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 90000 });
      await page.waitForTimeout(700);
      const a = await page.evaluate(AUDIT);
      findings.push({ vp: vp.name, route, status: res?.status(), ...a, errors, failed });
    } catch (e) {
      findings.push({ vp: vp.name, route, error: String(e).slice(0, 120) });
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();

const problems = findings.filter(f => f.error || f.hOverflow || f.clippedCount > 0 ||
  (f.smallestPx !== undefined && f.smallestPx < 12) || (f.errors && f.errors.length) ||
  (f.failed && f.failed.length) || (f.status && f.status >= 400) ||
  (f.h1Count !== undefined && f.h1Count !== 1) || f.headingSkipCount > 0 ||
  (f.hasBreadcrumb === false && f.route !== "/") || f.ctaCount === 0 ||
  (f.titleLen !== undefined && (f.titleLen < 10 || f.titleLen > 70)) ||
  (f.descLen !== undefined && (f.descLen < 50 || f.descLen > 165)));

console.log(`\n=== audited ${findings.length} page/viewport combos ===`);
console.log(`clean: ${findings.length - problems.length}   with findings: ${problems.length}\n`);
for (const p of problems) {
  console.log(`[${p.vp}] ${p.route}${p.status && p.status>=400 ? ` HTTP ${p.status}` : ""}`);
  if (p.error) console.log(`   ERROR ${p.error}`);
  if (p.hOverflow) console.log(`   H-OVERFLOW  offenders=${p.overflowCount} ${p.overflow.join(" | ")}`);
  if (p.clippedCount) console.log(`   CLIPPED(${p.clippedCount}) ${p.clipped.join(" | ")}`);
  if (p.smallestPx < 12) console.log(`   TINY TEXT ${p.smallestPx}px "${p.smallestText}"`);
  if (p.errors?.length) console.log(`   CONSOLE(${p.errors.length}) ${p.errors.slice(0,2).join(" | ")}`);
  if (p.h1Count !== undefined && p.h1Count !== 1) console.log(`   H1 COUNT ${p.h1Count} (expected 1)`);
  if (p.headingSkipCount) console.log(`   HEADING SKIPS(${p.headingSkipCount}) ${p.headingSkips.join(" | ")}`);
  if (p.hasBreadcrumb === false && p.route !== "/") console.log(`   NO BREADCRUMB`);
  if (p.ctaCount === 0) console.log(`   NO PRIMARY CTA`);
  if (p.titleLen !== undefined && (p.titleLen < 10 || p.titleLen > 70)) console.log(`   TITLE LEN ${p.titleLen}`);
  if (p.descLen !== undefined && (p.descLen < 50 || p.descLen > 165)) console.log(`   DESC LEN ${p.descLen}`);
  if (p.failed?.length) console.log(`   REQ-FAILED(${p.failed.length}) ${[...new Set(p.failed)].slice(0,3).join(" | ")}`);
}
// touch targets reported separately (advisory, mobile only)
const tt = findings.filter(f => f.vp.startsWith("phone-") && f.smallTargetCount > 0);
if (tt.length) {
  console.log(`\n--- mobile touch targets <44px (advisory) ---`);
  for (const t of tt) console.log(`  ${t.route}: ${t.smallTargetCount}  ${t.smallTargets.slice(0,3).join(" | ")}`);
}
