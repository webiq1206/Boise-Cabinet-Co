import { expect, test } from "@playwright/test";

async function openCalculator(page: import("@playwright/test").Page) {
  await page.goto("/#calculator");
  await page.locator("#calculator").scrollIntoViewIfNeeded();
  await expect(page.getByText(/Step 1 of/i)).toBeVisible();
}

test.describe("Project Estimator", () => {
  test("shows wizard on load", async ({ page }) => {
    await openCalculator(page);
    await expect(page.getByTestId("button-project-kitchen")).toHaveAttribute("aria-pressed", "true");
  });

  test("updates range when project type changes", async ({ page }) => {
    await openCalculator(page);
    await page.getByTestId("button-project-whole-home").click();
    await expect(page.getByTestId("button-project-whole-home")).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Continue" }).click();
    const slider = page.getByTestId("slider-size");
    const wholeHomeRooms = Number(await slider.inputValue());
    expect(wholeHomeRooms).toBeGreaterThanOrEqual(2);
    expect(wholeHomeRooms).toBeLessThanOrEqual(10);
  });

  test("guided selections reach detailed planning range", async ({ page }) => {
    await openCalculator(page);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByTestId("button-layout-island").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByTestId("button-line-reserve").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByTestId("button-door-modern-shaker").click();
    await page.getByTestId("button-finish-tier-premium").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByTestId("button-construction-best").click();
    await page.getByTestId("button-storage-premium").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByTestId("estimate-result-panel").getByText("Detailed planning range")).toBeVisible();
    await expect(page.getByTestId("estimate-result-panel")).toBeVisible();
  });

  test("mobile estimate bar appears while scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/#calculator");
    await page.locator("#calculator").scrollIntoViewIfNeeded();
    await page.getByTestId("button-project-bathroom").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByTestId("mobile-estimate-bar")).toBeVisible({ timeout: 15_000 });
  });
});
