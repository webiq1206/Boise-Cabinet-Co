import { expect, test } from "@playwright/test";

test("portal smoke: quote → admin → subcontractor (no Stripe)", async ({ page }) => {
  // Dev login + seed
  await page.goto("/__dev__/login");
  await expect(page.getByTestId("page-dev-login")).toBeVisible();

  await page.getByTestId("button-dev-login-admin").click();
  await expect(page.getByText(/Compliance Dashboard/i)).toBeVisible();

  await page.goto("/__dev__/login");
  await page.getByTestId("button-dev-seed").click();

  // Admin leads: tab counts remain stable across tab switching
  await page.goto("/admin/leads");
  await expect(page.getByTestId("count-pending")).toBeVisible();

  const pendingCountBefore = await page.getByTestId("count-pending").textContent();
  const acceptedCountBefore = await page.getByTestId("count-accepted").textContent();
  const availableCountBefore = await page.getByTestId("count-available").textContent();
  const purchasedCountBefore = await page.getByTestId("count-purchased").textContent();

  await page.getByTestId("tab-available").click();
  await page.getByTestId("tab-pending").click();

  await expect(page.getByTestId("count-pending")).toHaveText((pendingCountBefore || "").trim());
  await expect(page.getByTestId("count-accepted")).toHaveText((acceptedCountBefore || "").trim());
  await expect(page.getByTestId("count-available")).toHaveText((availableCountBefore || "").trim());
  await expect(page.getByTestId("count-purchased")).toHaveText((purchasedCountBefore || "").trim());

  // Consultation form on contact page (replaces legacy /get-quote redirect)
  await page.goto("/contact#consult");
  await page.getByTestId("input-name").fill("Playwright Test");
  await page.getByTestId("input-phone").fill("(208) 555-0101");
  await page.getByTestId("input-email").fill("playwright@example.com");
  await page.getByTestId("select-project-type").click();
  await page.getByRole("option", { name: /Kitchen Cabinets/i }).click();
  await page.getByTestId("button-submit-consultation").click();
  await page.getByTestId("button-confirm-consultation").click();
  await expect(page.getByTestId("consultation-success")).toBeVisible({
    timeout: 15000,
  });

  // Subcontractor portal: loads lead marketplace and shows masked leads (no Stripe required)
  await page.goto("/__dev__/login");
  await page.getByTestId("button-dev-login-sub").click();
  await page.goto("/subcontractor/leads");
  await expect(page.getByTestId("page-subcontractor-portal")).toBeVisible();

  const firstCard = page.locator("[data-testid^='card-lead-']").first();
  await expect(firstCard).toBeVisible();
  await expect(firstCard).toContainText("***");
});

