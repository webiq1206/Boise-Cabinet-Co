import { expect, test } from "@playwright/test";

test.describe("Design Studio photo room sizing", () => {
  test("mocked scan-room API completes room step", async ({ page }) => {
    await page.route("**/api/design-studio/scan-room", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          widthIn: 156,
          depthIn: 168,
          ceilingIn: 96,
          confidence: "medium",
        }),
      });
    });

    await page.goto("/design-studio");
    await page.getByTestId("button-room-kitchen").click();
    await page.getByTestId("button-estimate-from-photo").click();

    const fileInput = page.locator('input[type="file"][accept*="image"]');
    await fileInput.setInputFiles({
      name: "room.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64",
      ),
    });

    await expect(page.getByTestId("room-scan-panel").getByText(/Room size saved/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("button", { name: "Continue" })).toBeEnabled();
  });

  test("scan API failure uses client fallback estimate", async ({ page }) => {
    await page.route("**/api/design-studio/scan-room", async (route) => {
      await route.fulfill({ status: 503, body: JSON.stringify({ error: "unavailable" }) });
    });

    await page.goto("/design-studio");
    await page.getByTestId("button-room-kitchen").click();
    await page.getByTestId("button-estimate-from-photo").click();

    const fileInput = page.locator('input[type="file"][accept*="image"]');
    await fileInput.setInputFiles({
      name: "room.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64",
      ),
    });

    await expect(page.getByTestId("room-scan-panel").getByText(/Room size saved/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("status").getByText(/quick photo estimate/i).first()).toBeVisible();
  });
});
