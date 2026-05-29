import { expect, test } from "@playwright/test";

async function openCalculator(page: import("@playwright/test").Page) {
  await page.goto("/#calculator");
  await page.locator("#calculator").scrollIntoViewIfNeeded();
  await expect(page.locator('[data-testid="estimate-range"]:visible')).toBeVisible();
}

test.describe("Project Estimator", () => {
  test("shows default planning range on load", async ({ page }) => {
    await openCalculator(page);
    await expect(page.getByTestId("button-project-kitchen")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("slider-size")).toBeVisible();
  });

  test("updates range when project type changes", async ({ page }) => {
    await openCalculator(page);
    await page.getByTestId("button-project-whole-home").click();
    await expect(page.getByTestId("button-project-whole-home")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-testid="estimate-range"]:visible')).toBeVisible();
    const slider = page.getByTestId("slider-size");
    const wholeHomeSqft = await slider.inputValue();
    expect(Number(wholeHomeSqft)).toBeGreaterThanOrEqual(800);
  });

  test("refine panel expands and tracks detail level", async ({ page }) => {
    await openCalculator(page);
    const toggle = page.getByTestId("button-refine-toggle");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.getByTestId("city-treasure-valley").click();
    await page.getByTestId("timeline-standard").click();
    await expect(page.locator('[data-testid="estimate-range"]:visible')).toBeVisible();
  });

  test("consultation CTA is available", async ({ page }) => {
    await openCalculator(page);
    await expect(page.locator('[data-testid="button-book-visit"]:visible')).toBeVisible();
  });
});
