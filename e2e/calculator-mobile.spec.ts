import { expect, test } from "@playwright/test";

async function openCalculator(page: import("@playwright/test").Page) {
  await page.goto("/#calculator");
  await page.locator("#calculator").scrollIntoViewIfNeeded();
}

test.describe("Project Estimator wizard", () => {
  test("completes wizard and stores estimate", async ({ page }) => {
    await openCalculator(page);
    await expect(page.getByText(/Step 1 of/i).first()).toBeVisible();

    await page.getByTestId("button-project-kitchen").click();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByTestId("button-layout-island").click();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByTestId("button-door-modern-shaker").click();
    await page.getByTestId("button-finish-tier-standard").click();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByTestId("button-construction-better").click();
    await page.getByTestId("button-accessory-rollout-tray").click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByTestId("estimate-result-panel")).toBeVisible({
      timeout: 10_000,
    });

    const stored = await page.evaluate(() => sessionStorage.getItem("brc_estimate"));
    expect(stored).toBeTruthy();
  });
});
