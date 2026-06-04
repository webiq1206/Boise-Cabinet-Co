import { expect, test } from "@playwright/test";

test.describe("Design Studio save payload", () => {
  test("save includes roomMeta in layoutJson", async ({ page }) => {
    let savedBody: Record<string, unknown> | null = null;

    await page.route("**/api/designs", async (route) => {
      if (route.request().method() === "POST") {
        savedBody = route.request().postDataJSON() as Record<string, unknown>;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "test-design-1",
            shareToken: "test-share-token",
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto("/design-studio?fixtureManual=1");
    await page.getByTestId("button-room-kitchen").click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByTestId(/^button-layout-/).first().click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByTestId(/^button-door-style-/).first().click();
    await page.getByTestId(/^button-finish-/).first().click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Go to pricing form" }).click();
    await page.getByRole("button", { name: "Save design" }).click();

    await expect.poll(() => savedBody !== null, { timeout: 15_000 }).toBe(true);
    const layoutJson = savedBody!.layoutJson as Record<string, unknown>;
    const roomMeta = layoutJson.roomMeta as { widthIn: number; userConfirmed: boolean };
    expect(roomMeta.widthIn).toBeGreaterThanOrEqual(48);
    expect(roomMeta.userConfirmed).toBe(true);
  });
});
