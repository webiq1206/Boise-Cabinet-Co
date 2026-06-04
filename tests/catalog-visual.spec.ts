import { expect, test } from "@playwright/test";

test.describe("Catalog visuals", () => {
  test("Design Studio look step shows six door option images", async ({ page }) => {
    await page.goto("/design-studio?fixtureScan=1");
    await page.getByTestId("button-room-kitchen").click();
    await expect(page.getByTestId("room-scan-panel")).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: "Continue" }).click();
    const layoutBtn = page.getByTestId(/^button-layout-/).first();
    await expect(layoutBtn).toBeVisible({ timeout: 10_000 });
    if (await layoutBtn.isEnabled()) {
      await layoutBtn.click();
    }
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("Door style", { exact: true })).toBeVisible({ timeout: 10_000 });
    const doorTiles = page.locator('[data-testid^="button-door-style-"] img');
    await expect(doorTiles).toHaveCount(6, { timeout: 10_000 });
  });

  test("Search results render result thumbnails", async ({ page }) => {
    await page.goto("/search");
    await page.getByPlaceholder(/Search by name/i).fill("shaker");
    await expect(page.locator('[data-testid^="search-result-"]').first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator('[data-testid^="search-result-"] img').first()).toBeVisible();
  });

  test("Compare page includes door style comparison section", async ({ page }) => {
    await page.goto("/compare");
    await expect(page.getByRole("heading", { name: /Six door styles/i })).toBeVisible();
    const doorTable = page.getByRole("table").filter({ hasText: "Modern Shaker" });
    await expect(doorTable.getByText("Modern Shaker", { exact: true })).toBeVisible();
    await expect(doorTable.getByText("Alpha Shaker", { exact: true })).toBeVisible();
    await expect(doorTable.getByText("Beta Shaker", { exact: true })).toBeVisible();
  });
});
