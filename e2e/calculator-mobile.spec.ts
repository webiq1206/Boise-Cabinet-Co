import { expect, test } from "@playwright/test";

async function openCalculator(page: import("@playwright/test").Page) {
  await page.goto("/#calculator");
  await page.locator("#calculator").scrollIntoViewIfNeeded();
}

test.describe("Project Estimator wizard", () => {
  test("completes wizard and stores estimate", async ({ page }) => {
    await openCalculator(page);
    await expect(page.getByText(/Step 1 of/i)).toBeVisible();

    await page.getByTestId("button-project-kitchen").click();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByTestId("button-layout-island").click();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByTestId("button-line-custom").or(page.getByTestId(/^button-line-/).first()).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByTestId("button-door-modern-shaker").click();
    await page.getByTestId("button-finish-tier-standard").click();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByTestId("button-construction-better").click();
    await page.getByTestId("button-storage-essential").click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByTestId("estimate-result-panel")).toBeVisible({
      timeout: 10_000,
    });

    const stored = await page.evaluate(() => sessionStorage.getItem("brc_estimate"));
    expect(stored).toBeTruthy();
  });
});
