import {isolateFixtureRequests} from './guided-fixture';
import { expect, test } from "@playwright/test";
import { TESTIMONIALS } from "../shared/testimonialsData";

test.describe.configure({ timeout: 180_000 });

const ROUTES = [
  "/",
  "/testimonials",
  "/cabinets/kitchen",
  "/cabinets/bathroom",
  "/cabinets/mudroom",
  "/cabinets/pantry",
  "/locations/boise",
  "/locations/eagle",
  "/locations/meridian",
  "/locations/nampa",
] as const;

const NAMES = ["Sarah M.", "Mike R.", "Jennifer K.", "David L."];

test("live routes render no seed reviews, stars, counts, or review schema", async ({ page }) => {
  for (const path of ROUTES) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), path).toBeTruthy();
    const html = await response!.text();
    for (const name of NAMES) expect(html, `${path} name ${name}`).not.toContain(name);
    for (const item of TESTIMONIALS) {
      expect(html, `${path} quote`).not.toContain(item.testimonial);
    }
    expect(html, path).not.toContain("AggregateRating");
    expect(html, path).not.toContain("reviewBody");
    expect(html, path).not.toContain('"@type":"Review"');
    expect(html, path).not.toContain('"reviewCount"');
    expect(html, path).not.toContain("out of 5");
    expect(html, path).not.toContain("Homeowner reviews");
    expect(html, path).not.toContain("homeowners say");
    await expect(page.locator("header[data-family-header] a[href='/testimonials']"), path).toHaveCount(0);
    await expect(page.locator("footer a[href='/testimonials']"), path).toHaveCount(0);
    if (path === "/testimonials") {
      await expect(page).toHaveURL(/\/design-ideas$/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://boisecabinet.co/design-ideas");
      expect(html, path).toContain("they are not records of completed client projects.");
    }
  }
});

test.beforeEach(async ({page}) => isolateFixtureRequests(page));
