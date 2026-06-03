import { expect, test } from "@playwright/test";

test.describe("Design Studio performance", () => {
  test("room step loads within budget", async ({ page }) => {
    const start = Date.now();
    await page.goto("/design-studio?fixtureManual=1");
    await expect(page.getByTestId("room-scan-panel")).toBeVisible();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(15_000);
  });
});
