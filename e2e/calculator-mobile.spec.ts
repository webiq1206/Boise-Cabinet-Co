import { expect, test } from "@playwright/test";

async function openCalculator(page: import("@playwright/test").Page) {
  await page.goto("/#calculator");
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
    await page.getByRole("button", { name: "Continue" }).first().click();

    // 2. Size & quality - move both runs (kitchen has uppers); construction
    // defaults to "Better", so no extra tap is needed.
    await page.getByTestId("slider-size").fill("24");
    await page.getByTestId("slider-size-upper").fill("18");
    await page.getByRole("button", { name: "Continue" }).first().click();

    // 3. Door & finish - pick a door and skip the optional finishes.
    await page.getByTestId("button-door-modern-shaker").click();
    await page.getByRole("button", { name: "See your range" }).first().click();

    // 4. Range reveal - the estimate is stored for the contact step.
    await expect(page.getByTestId("estimate-result-panel")).toBeVisible({
      timeout: 10_000,
    });
    const stored = await page.evaluate(() => sessionStorage.getItem("brc_estimate"));
    expect(stored).toBeTruthy();
    await page.getByRole("button", { name: "Book your free visit" }).first().click();

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
