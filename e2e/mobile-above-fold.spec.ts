import {isolateFixtureRequests} from './guided-fixture';
import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ timeout: 120_000 });

const PAGES = [
  { path: "/cabinets/kitchen", headline: "Kitchen cabinets in Boise, Idaho" },
  { path: "/cabinets/built-ins", headline: "Built-In cabinets" },
  { path: "/cabinets", headline: "Cabinets by room" },
  { path: "/estimate", headline: "Get an Estimate" },
] as const;

async function assertAboveFold(page: Page, width: number, height: number, headline: string, path: string) {
  await page.setViewportSize({ width, height });
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(response?.ok()).toBeTruthy();
  const html = await response!.text();
  expect(html).toContain("tel:+12084771169");
  expect(html).toContain("sms:+12084771169");
  expect(html.replace(/<[^>]*>/g, "").replace(/\s+/g," ")).toContain(headline);

  const h1 = page.getByRole("heading", { level: 1, name: headline });
  const call = page.locator("[data-above-fold-actions] a[href='tel:+12084771169']");
  const text = page.locator("[data-above-fold-actions] a[href='sms:+12084771169']");
  await expect(h1).toBeVisible();
  await expect(call).toBeVisible();
  await expect(text).toBeVisible();
  await expect(call).toHaveText("Call");
  await expect(text).toHaveText("Text");

  for (const locator of [h1, call, text]) {
    const box = await locator.boundingBox();
    expect(box, "element has a box").not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(height);
    const covered = await locator.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const x = Math.min(window.innerWidth - 2, Math.max(2, rect.left + rect.width / 2));
      const y = Math.min(window.innerHeight - 2, Math.max(2, rect.top + rect.height / 2));
      const hit = document.elementFromPoint(x, y);
      return !(hit === el || (hit !== null && (el.contains(hit) || hit.contains(el))));
    });
    expect(covered, "nothing covers the element").toBe(false);
  }

  if (path === "/estimate") {
    await expect(page.locator("#estimate-request")).toBeVisible();
    await expect(page.getByText("Prefer a step-by-step planning range?")).toBeVisible();

  }
}

test.describe("first screen at 390x844", () => {
  test.use({ viewport: { width: 390, height: 844 } });
  for (const entry of PAGES) {
    test(`${entry.path} shows the headline and call and text above the fold`, async ({ page }) => {
      await assertAboveFold(page, 390, 844, entry.headline, entry.path);
    });
  }
});

test.describe("first screen at 360x740", () => {
  test.use({ viewport: { width: 360, height: 740 } });
  for (const entry of PAGES) {
    test(`${entry.path} shows the headline and call and text above the fold`, async ({ page }) => {
      await assertAboveFold(page, 360, 740, entry.headline, entry.path);
    });
  }
});

test.beforeEach(async ({page}) => isolateFixtureRequests(page));
