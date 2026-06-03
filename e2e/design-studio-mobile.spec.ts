import { expect, test } from "@playwright/test";

test.describe("Design Studio mobile paths", () => {
  test("manual room fixture advances to layout", async ({ page }) => {
    await page.goto("/design-studio?fixtureManual=1");
    await page.getByTestId("button-room-kitchen").click();
    await expect(page.getByText("Room size saved").first()).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText(/Kitchen shape|Pick a layout/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("primary manual dimensions path", async ({ page }) => {
    await page.goto("/design-studio");
    await page.getByTestId("button-room-kitchen").click();
    await page.getByTestId("input-manual-width").fill("120");
    await page.getByTestId("input-manual-depth").fill("144");
    await page.getByTestId("button-apply-manual-dims").click();
    await expect(page.getByText(/Room size saved/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: "Continue" })).toBeEnabled();
  });

  test("typical kitchen preset enables continue", async ({ page }) => {
    await page.goto("/design-studio");
    await page.getByTestId("button-room-kitchen").click();
    await page.getByTestId("button-typical-kitchen-size").click();
    await expect(page.getByRole("button", { name: "Continue" })).toBeEnabled({
      timeout: 10_000,
    });
  });
});
