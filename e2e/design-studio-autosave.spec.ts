import { expect, test } from "@playwright/test";

/**
 * Covers the cloud-draft autosave + resume continuity and the live tunable
 * dollar estimate surfaced in the persistent summary.
 */
test.describe("Design Studio autosave & summary", () => {
  test("autosaves progress and offers to restore after reload", async ({
    page,
  }) => {
    // Let the anonymous draft PUT succeed without a database.
    await page.route("**/api/designs/draft", async (route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ok: true, id: "draft-test", draftId: "draft-test" }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto("/design-studio?fixtureManual=1");
    await page.getByTestId("button-room-kitchen").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByTestId(/^button-layout-/).first().click();

    // The header autosave pill confirms the draft was saved.
    await expect(page.getByTestId("autosave-status")).toContainText(/Saved/i, {
      timeout: 15_000,
    });

    await page.reload();

    // The local mirror is restored and the visitor is told so.
    await expect(page.getByText(/restored your in-progress design/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("summary shows a tunable dollar estimate", async ({ page }, testInfo) => {
    const isMobile =
      testInfo.project.name === "iPhone 14" ||
      testInfo.project.name === "Pixel 7";

    await page.goto("/design-studio?fixtureManual=1");
    await page.getByTestId("button-room-kitchen").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByTestId(/^button-layout-/).first().click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByTestId(/^button-door-style-/).first().click();
    await page.getByTestId(/^button-finish-/).first().click();

    if (isMobile) {
      await page.getByTestId("button-open-summary-sheet").click();
    } else {
      await page.getByRole("tab", { name: "Summary" }).click();
    }

    const range = page.getByTestId("summary-estimate-range").first();
    await expect(range).toBeVisible({ timeout: 10_000 });
    await expect(range).toContainText("$");
  });
});
