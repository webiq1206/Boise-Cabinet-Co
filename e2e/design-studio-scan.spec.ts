import { expect, test } from "@playwright/test";

test.describe("Design Studio scan-first flow", () => {
  test("requires scan before layout step advances", async ({ page }) => {
    await page.goto("/design-studio?fixtureScan=1");
    await expect(page.getByTestId("room-scan-panel")).toBeVisible();

    await page.getByTestId("button-room-kitchen").click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText(/Scan your space/i)).toBeVisible();
    await expect(page.getByText(/Room captured|Scan your room first/i)).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole("button", { name: "Continue" }).click();
    await expect(
      page.getByText(/Choose a layout|layout that fits/i),
    ).toBeVisible({ timeout: 10_000 });

    const layoutBtn = page.getByTestId("button-layout-l-shape").or(
      page.getByTestId(/^button-layout-/).first(),
    );
    if (await layoutBtn.isEnabled()) {
      await layoutBtn.click();
    }
  });

  test("layout step blocks without scan when fixture omitted", async ({ page }) => {
    await page.goto("/design-studio");
    await page.getByTestId("button-room-kitchen").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText(/Scan your room first/i)).toBeVisible();
    await expect(page.getByTestId("button-layout-l-shape")).toHaveCount(0);
  });
});
