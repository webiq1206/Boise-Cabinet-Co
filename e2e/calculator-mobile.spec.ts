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

    // Size starts unset; move both the base and wall (upper) sliders before the
    // step can be completed (kitchen has uppers).
    await page.getByTestId("slider-size").fill("24");
    await page.getByTestId("slider-size-upper").fill("18");
    await page.getByTestId("button-construction-better").click();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByTestId("button-door-modern-shaker").click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByTestId("estimate-result-panel")).toBeVisible({
      timeout: 10_000,
    });

    const stored = await page.evaluate(() => sessionStorage.getItem("brc_estimate"));
    expect(stored).toBeTruthy();
  });
});
