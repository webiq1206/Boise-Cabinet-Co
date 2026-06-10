import { expect, test } from "@playwright/test";

test.describe("Estimator mobile sticky bar", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("shows expandable estimate drawer on mobile", async ({ page }) => {
    await page.goto("/estimate");

    await page.getByTestId("button-project-kitchen").click();
    await page.getByTestId("wizard-mobile-bar").getByTestId("wizard-next").click();

    const slider = page.getByTestId("slider-size");
    await expect(slider).toBeVisible();
    const box = await slider.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width * 0.6, box.y + box.height / 2);
    }

    await expect(page.getByTestId("wizard-mobile-bar")).toBeVisible();
    await page.getByTestId("button-open-estimate-sheet").click();
    const drawer = page.getByRole("dialog", { name: "Planning range summary" });
    await expect(drawer).toBeVisible({ timeout: 8000 });
    await expect(drawer.getByTestId("estimate-side-panel")).toBeVisible();
  });
});
