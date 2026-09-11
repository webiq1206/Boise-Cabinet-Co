import { expect, test } from "@playwright/test";

test.describe("Consultation form", () => {
  test("shows validation for invalid phone and succeeds with valid submission", async ({
    page,
  }) => {
    // Test form behavior against an explicit synthetic delivery receipt.
    // Production persistence/delivery requires separately configured services.
    let submissions = 0;
    await page.route('**/api/consultation', async route => {
      const body = route.request().postDataJSON();
      expect(body.phone.replace(/\D/g, '').length).toBeGreaterThanOrEqual(10);
      submissions++;
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,accepted:true,submissionId:'synthetic-consultation'})});
    });
    await page.goto("/contact#consult");

    // First dev hit compiles the route; allow generous time for the form mount.
    await expect(page.getByTestId("input-name")).toBeVisible({ timeout: 30_000 });

    await page.getByTestId("input-name").fill("Playwright Test");
    await page.getByTestId("input-phone").fill("abc");
    await page.getByTestId("input-email").fill("playwright@example.com");
    await page.getByTestId("select-project-type").click();
    await page.getByRole("option", { name: /Kitchen Cabinets/i }).click();
    await page.getByTestId("button-submit-consultation").click();

    await expect(page.getByText(/at least 10 digits/i)).toBeVisible();

    expect(submissions).toBe(0);
    await page.getByTestId("input-phone").fill("(208) 555-0101");
    await page.getByTestId("button-submit-consultation").click();

    await expect(page.getByTestId("consultation-success")).toBeVisible({
      timeout: 15000,
    });
    expect(submissions).toBe(1);
  });
});
