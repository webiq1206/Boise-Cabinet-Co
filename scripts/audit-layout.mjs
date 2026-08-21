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

  return { overflow: [...new Set(overflow)].slice(0,5), overflowCount: overflow.length,
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
    page.on("requestfailed", r => failed.push(`${r.url().split("/").slice(3).join("/").slice(0,60)}`));
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
  (f.failed && f.failed.length) || (f.status && f.status >= 400));

console.log(`\n=== audited ${findings.length} page/viewport combos ===`);
console.log(`clean: ${findings.length - problems.length}   with findings: ${problems.length}\n`);
for (const p of problems) {
  console.log(`[${p.vp}] ${p.route}${p.status && p.status>=400 ? ` HTTP ${p.status}` : ""}`);
  if (p.error) console.log(`   ERROR ${p.error}`);
  if (p.hOverflow) console.log(`   H-OVERFLOW  offenders=${p.overflowCount} ${p.overflow.join(" | ")}`);
  if (p.clippedCount) console.log(`   CLIPPED(${p.clippedCount}) ${p.clipped.join(" | ")}`);
  if (p.smallestPx < 12) console.log(`   TINY TEXT ${p.smallestPx}px "${p.smallestText}"`);
  if (p.errors?.length) console.log(`   CONSOLE(${p.errors.length}) ${p.errors.slice(0,2).join(" | ")}`);
  if (p.failed?.length) console.log(`   REQ-FAILED(${p.failed.length}) ${[...new Set(p.failed)].slice(0,3).join(" | ")}`);
}
// touch targets reported separately (advisory, mobile only)
const tt = findings.filter(f => f.vp.startsWith("phone-") && f.smallTargetCount > 0);
if (tt.length) {
  console.log(`\n--- mobile touch targets <44px (advisory) ---`);
  for (const t of tt) console.log(`  ${t.route}: ${t.smallTargetCount}  ${t.smallTargets.slice(0,3).join(" | ")}`);
}
