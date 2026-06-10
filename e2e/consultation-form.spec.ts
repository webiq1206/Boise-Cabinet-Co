import { expect, test } from "@playwright/test";

test.describe("Consultation form", () => {
  test("shows validation for invalid phone and succeeds with valid submission", async ({
    page,
  }) => {
    await page.goto("/contact#consult");

    await expect(page.getByTestId("input-name")).toBeVisible();

    await page.getByTestId("input-name").fill("Playwright Test");
    await page.getByTestId("input-phone").fill("abc");
    await page.getByTestId("input-email").fill("playwright@example.com");
    await page.getByTestId("select-project-type").click();
    await page.getByRole("option", { name: /Kitchen Cabinets/i }).click();
    await page.getByTestId("button-submit-consultation").click();

    await expect(page.getByText(/at least 10 digits/i)).toBeVisible();

    await page.getByTestId("input-phone").fill("(208) 555-0101");
    await page.getByTestId("button-submit-consultation").click();

    await expect(page.getByTestId("confirm-consultation")).toBeVisible();
    await page.getByTestId("button-confirm-consultation").click();

    await expect(page.getByTestId("consultation-success")).toBeVisible({
      timeout: 15000,
    });
  });
});
