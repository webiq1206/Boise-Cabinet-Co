import { expect, test } from "@playwright/test";

/**
 * Covers the cloud-draft autosave + resume continuity and the shared
 * selections surfaced in the persistent summary.
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
    await expect(page.getByText("We restored your in-progress design.", { exact: true })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("summary carries selections without a competing guessed price", async ({ page }, testInfo) => {
    const isMobile =
      testInfo.project.name === "iPhone 14" ||
      testInfo.project.name === "Pixel 7";

    await page.goto("/design-studio?fixtureManual=1");
    await page.getByTestId("button-room-kitchen").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByTestId(/^button-layout-/).first().click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByTestId(/^button-door-style-/).first().click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByTestId(/^button-finish-/).first().click();

    // Mobile keeps the summary in a bottom sheet; desktop now shows the summary
    // panel inline (no Preview|Summary tab), so the range is already visible.
    if (isMobile) {
      await page.getByTestId("button-open-summary-sheet").click();
    }

    await expect(page.getByTestId("summary-estimate-range")).toHaveCount(0);
    await expect(page.getByText(/Your selections carry into the project estimator/).first()).toBeVisible();
  });
});
