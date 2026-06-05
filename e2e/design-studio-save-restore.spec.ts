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
    // Room
    await page.getByTestId("button-room-kitchen").click();
    await page.getByTestId("wizard-next").first().click();
    // Layout
    await page.getByTestId(/^button-layout-/).first().click();
    await page.getByTestId("wizard-next").first().click();
    // Door style (auto-advances to the finish step)
    await page.getByTestId(/^button-door-style-/).first().click();
    // Finish (auto-advances to the hardware step)
    await page.getByTestId(/^button-finish-/).first().click();

    // Advance through the optional hardware/add-ons and review steps to the
    // pricing CTA. Loop on the button label so the auto-advance behaviour on the
    // door/finish steps cannot make the click count flaky.
    const nextBtn = page.getByTestId("wizard-next").first();
    for (let i = 0; i < 8; i += 1) {
      await expect(nextBtn).toBeVisible();
      const label = ((await nextBtn.textContent()) ?? "").trim();
      await nextBtn.click();
      if (/Go to pricing form/i.test(label)) break;
      await page.waitForTimeout(250);
    }

    // Save is now behind the optional "manage versions" disclosure.
    await page
      .getByRole("button", { name: /Save, name & manage versions/i })
      .click();
    await page.getByRole("button", { name: "Save design" }).click();

    await expect.poll(() => savedBody !== null, { timeout: 15_000 }).toBe(true);
    const layoutJson = savedBody!.layoutJson as Record<string, unknown>;
    const roomMeta = layoutJson.roomMeta as { widthIn: number; userConfirmed: boolean };
    expect(roomMeta.widthIn).toBeGreaterThanOrEqual(48);
    expect(roomMeta.userConfirmed).toBe(true);
  });
});
