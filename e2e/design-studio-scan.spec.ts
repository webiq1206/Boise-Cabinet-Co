import { expect, test } from "@playwright/test";

test.describe("Design Studio scan-first flow", () => {
  test("requires scan before advancing from room step", async ({ page }) => {
    await page.goto("/design-studio?fixtureScan=1");
    await expect(page.getByTestId("room-scan-panel")).toBeVisible();

    await page.getByTestId("button-room-kitchen").click();
    await expect(page.getByText("Room size saved").first()).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText(/Kitchen shape|Pick a layout/i).first()).toBeVisible({
      timeout: 10_000,
    });

    await page.getByTestId(/^button-layout-/).first().click();
  });

  test("room step blocks continue without scan when fixture omitted", async ({
    page,
  }) => {
    await page.goto("/design-studio");
    await page.getByTestId("button-room-kitchen").click();
    await expect(page.getByRole("button", { name: "Continue" })).toBeDisabled();
    await expect(page.getByTestId("button-smart-scan")).toBeVisible();
  });
});
