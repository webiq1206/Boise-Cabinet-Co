import { expect, test } from "@playwright/test";

test.describe("Design Studio planner", () => {
  test("planner renders after layout with touch hint on mobile", async ({ page }, testInfo) => {
    const isMobile =
      testInfo.project.name === "iPhone 14" || testInfo.project.name === "Pixel 7";
    await page.goto("/design-studio?fixtureManual=1");
    await page.getByTestId("button-room-kitchen").click();
    await page.getByRole("button", { name: "Continue" }).click();
    const layoutBtn = page
      .locator('[data-testid^="button-layout-"]:not([disabled])')
      .first();
    await layoutBtn.click();
    // The 2D planner renders inline within the layout step once a layout is
    // chosen (no Continue needed).
    if (isMobile) {
      await expect(page.getByTestId("planner-touch-hint")).toBeVisible();
    }
    await expect(page.getByTestId("svg-room-planner")).toBeVisible();
  });
});
