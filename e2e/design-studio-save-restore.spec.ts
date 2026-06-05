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
    // 6-step flow: room -> layout -> door -> finish -> extras -> review.
    // Each required step needs a selection, then an explicit Continue (no more
    // silent auto-advance).
    const next = page.getByTestId("wizard-next").first();

    // Room
    await page.getByTestId("button-room-kitchen").click();
    await next.click();
    // Layout
    await page.getByTestId(/^button-layout-/).first().click();
    await next.click();
    // Door style
    await page.getByTestId(/^button-door-style-/).first().click();
    await next.click();
    // Finish (Continue is labelled "Review & estimate" here)
    await page.getByTestId(/^button-finish-/).first().click();
    await next.click();
    // Finishing touches (optional) -> Review & estimate
    await next.click();

    // The merged review step owns the contact + save UI. Save is behind the
    // optional "manage versions" disclosure.
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

test.describe("Design Studio tablet CTA", () => {
  test("sticky Continue bar is reachable at tablet widths", async ({ page }) => {
    // Tablet portrait sits in the old "dead zone" (>=768, <1024). The sticky CTA
    // must remain visible there instead of only on phones.
    await page.setViewportSize({ width: 834, height: 1112 });
    await page.goto("/design-studio?fixtureManual=1");
    await page.getByTestId("button-room-kitchen").click();
    await expect(page.getByTestId("wizard-mobile-bar")).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByTestId("wizard-mobile-bar").getByTestId("wizard-next"),
    ).toBeVisible();
  });
});
