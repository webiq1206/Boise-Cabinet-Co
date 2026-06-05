import { expect, test } from "@playwright/test";

async function openCalculator(page: import("@playwright/test").Page) {
  await page.goto("/#calculator");
  await page.locator("#calculator").scrollIntoViewIfNeeded();
  await expect(page.getByText(/Step 1 of/i).first()).toBeVisible();
}

test.describe("Project Estimator", () => {
  test("shows wizard on load", async ({ page }) => {
    await openCalculator(page);
    await expect(page.getByTestId("button-project-kitchen")).toHaveAttribute("aria-pressed", "true");
  });

  test("updates range when project type changes", async ({ page }) => {
    await openCalculator(page);
    await page.getByTestId("button-project-laundry").click();
    await expect(page.getByTestId("button-project-laundry")).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Continue" }).click();
    const slider = page.getByTestId("slider-size");
    const laundryFeet = Number(await slider.inputValue());
    expect(laundryFeet).toBeGreaterThanOrEqual(4);
    expect(laundryFeet).toBeLessThanOrEqual(20);
  });

  test("guided selections reach detailed planning range", async ({ page }) => {
    await openCalculator(page);
    // project -> size -> layout (kitchen) -> style -> quality -> result
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByTestId("button-layout-island").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByTestId("button-door-modern-shaker").click();
    await page.getByTestId("button-finish-tier-premium").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByTestId("button-construction-best").click();
    await page.getByTestId("button-accessory-rollout-tray").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByTestId("estimate-result-panel").getByText("Detailed planning range")).toBeVisible();
    await expect(page.getByTestId("estimate-result-panel")).toBeVisible();
  });

  test("sticky mobile bar appears with live range", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/#calculator");
    await page.locator("#calculator").scrollIntoViewIfNeeded();
    await page.getByTestId("button-project-bathroom").click();
    await page.getByRole("button", { name: "Continue" }).click();
    // The shell's sticky mobile bar shows the live planning range + Continue
    // while the wizard is on screen.
    await expect(page.getByTestId("wizard-mobile-bar")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("wizard-mobile-summary")).toBeVisible();
  });
});
