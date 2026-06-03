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
    // Whole-home is scoped by number of rooms, not square footage.
    const slider = page.getByTestId("slider-size");
    const wholeHomeRooms = Number(await slider.inputValue());
    expect(wholeHomeRooms).toBeGreaterThanOrEqual(2);
    expect(wholeHomeRooms).toBeLessThanOrEqual(10);
  });

  test("guided selections raise the planning detail level", async ({ page }) => {
    await openCalculator(page);
    // Touch every step in the kitchen guided flow to reach the most detailed range.
    await page.getByTestId("button-layout-island").click();
    const slider = page.getByTestId("slider-size");
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await page.getByTestId("button-line-reserve").click();
    await page.getByTestId("button-door-shaker").click();
    await page.getByTestId("button-finish-tier-premium").click();
    await page.getByTestId("button-construction-best").click();
    await page.getByTestId("button-storage-premium").click();
    await expect(page.getByText("Detailed planning range")).toBeVisible();
    await expect(page.locator('[data-testid="estimate-range"]:visible')).toBeVisible();
  });

  test("consultation CTA is available", async ({ page }) => {
    await openCalculator(page);
    await expect(page.locator('[data-testid="button-book-visit"]:visible')).toBeVisible();
  });

  test("sticky glass bars use light text over dark estimate panel on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/#calculator");
    await page.locator("#calculator").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("mobile-estimate-bar")).toBeVisible();

    const resultPanel = page.locator('[data-testid="estimate-result-panel"]:visible');
    await expect(resultPanel).toBeVisible();

    await resultPanel.evaluate((panel) => {
      const rect = panel.getBoundingClientRect();
      const targetBottom = window.innerHeight - 30;
      window.scrollBy(0, rect.bottom - targetBottom);
    });

    await expect(page.getByTestId("mobile-estimate-bar")).toBeVisible();
    await expect(page.getByTestId("mobile-estimate-range")).toHaveClass(/text-inverse-foreground/, {
      timeout: 15_000,
    });
    await expect(page.getByTestId("button-call-mobile")).toHaveClass(/text-inverse-foreground/);
  });
});
