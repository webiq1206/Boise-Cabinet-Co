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
    await page.getByRole("button", { name: /I know my wall measurements/i }).click();
    await page.getByTestId("input-manual-width").fill("120");
    await page.getByTestId("input-manual-depth").fill("144");
    await page.getByTestId("button-apply-manual-dims").click();
    await expect(page.getByTestId("room-scan-panel").getByText(/Room size saved/i)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole("button", { name: "Continue" })).toBeEnabled();
  });

  test("size bucket enables continue without exact measurements", async ({ page }) => {
    await page.goto("/design-studio");
    await page.getByTestId("button-room-kitchen").click();
    await page.getByTestId("button-bucket-kitchen-average").click();
    await expect(page.getByTestId("room-scan-panel").getByText(/Room size saved/i)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole("button", { name: "Continue" })).toBeEnabled({
      timeout: 10_000,
    });
  });

  test("change size re-gates Continue until a new size is set", async ({ page }) => {
    // No fixture here: the fixture loader would re-apply a size as soon as it is
    // cleared, masking the re-gate behaviour we want to verify.
    await page.goto("/design-studio");
    await page.getByTestId("button-room-kitchen").click();
    await page.getByTestId("button-bucket-kitchen-average").click();
    await expect(page.getByRole("button", { name: "Continue" })).toBeEnabled({
      timeout: 10_000,
    });
    // Changing the size clears the measurement, so Continue is disabled again.
    await page.getByTestId("button-change-room-size").click();
    await expect(page.getByRole("button", { name: "Continue" })).toBeDisabled();
    // Re-pick a rough size and Continue comes back.
    await page.getByTestId("button-bucket-kitchen-average").click();
    await expect(page.getByRole("button", { name: "Continue" })).toBeEnabled({
      timeout: 10_000,
    });
  });
});
