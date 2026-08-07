import { expect, test } from "@playwright/test";

async function openCalculator(page: import("@playwright/test").Page) {
  await page.goto("/#calculator");
  // Wait for the lazily-mounted estimator island before touching #calculator -
  // hydration replaces the node, detaching any earlier-resolved locator.
  await expect(page.getByText(/Step 1 of/i).first()).toBeVisible({ timeout: 30_000 });
  await page.locator("#calculator").scrollIntoViewIfNeeded();
}

test.describe("Unified quote flow", () => {
  test("builds a range, skips finishes, and submits the contact step", async ({ page }) => {
    await openCalculator(page);
    // The estimator is a lazily-mounted client island; in dev the first hit also
    // pays a route compile, so allow generous time for the first step to appear.
    await expect(page.getByText(/Step 1 of/i).first()).toBeVisible({ timeout: 30_000 });

    // 1. Project
    await page.getByTestId("button-project-kitchen").click();
    await page.getByRole("button", { name: "Start estimating" }).first().click();

    // 2. Size - move both runs (kitchen has uppers).
    await page.getByTestId("slider-size").fill("24");
    await page.getByTestId("slider-size-upper").fill("18");
    await page.getByRole("button", { name: "Continue" }).first().click();

    // 3. Quality - construction defaults to "Better", so continue straight on.
    await page.getByRole("button", { name: "Continue" }).first().click();

    // 4. Layout - required for kitchens.
    await page.getByTestId("button-layout-island").click();
    await page.getByRole("button", { name: "Continue" }).first().click();

    // 5. Door & finish - pick a door and skip the optional finishes.
    await page.getByTestId("button-door-modern-shaker").click();
    await page.getByRole("button", { name: "See your range" }).first().click();

    // 4. Range reveal - the estimate is stored for the contact step.
    await expect(page.getByTestId("estimate-result-panel")).toBeVisible({
      timeout: 10_000,
    });
    const stored = await page.evaluate(() => sessionStorage.getItem("brc_estimate"));
    expect(stored).toBeTruthy();
    // Both the inline footer and the sticky mobile bar render a next button;
    // either advances the flow.
    await page.getByTestId("wizard-next").first().click();

    // 5. Contact capture - the project is known, so only the 3 core fields show.
    await expect(page.getByTestId("input-name")).toBeVisible();
    await page.getByTestId("input-name").fill("Playwright Flow");
    await page.getByTestId("input-phone").fill("(208) 555-0102");
    await page.getByTestId("input-email").fill("flow@example.com");
    await page.getByRole("button", { name: /Send my request/i }).first().click();

    await expect(page.getByTestId("consultation-success")).toBeVisible({
      timeout: 15_000,
    });
  });
});
