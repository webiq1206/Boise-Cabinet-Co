import {isolateFixtureRequests} from './guided-fixture';
import { expect, test } from "@playwright/test";
test.beforeEach(async ({page}) => isolateFixtureRequests(page));

test.describe("Consultation form", () => {
  test("shows validation for invalid phone and succeeds with valid submission", async ({
    page,
  }) => {
    // Test form behavior against an explicit synthetic delivery receipt.
    // Production persistence/delivery requires separately configured services.
    // The contact page runs the family two-step form: one short screen, then
    // optional details (project type moved there) on the success screen.
    const clientErrors: string[] = [];
    page.on("pageerror", error => clientErrors.push(error.message));
    let submissions = 0;
    const attempts: string[] = [];
    const details: Array<Record<string, any>> = [];
    await page.route('**/api/consultation', async route => {
      const body = route.request().postDataJSON();
      expect(body.phone.replace(/\D/g, '').length).toBeGreaterThanOrEqual(10);
      submissions++;
      attempts.push(route.request().postData()!);
      if (submissions === 1) return route.fulfill({json:{accepted:true,submissionId:'synthetic-consultation'}});
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({accepted:true,persisted:true,requestId:'consultation:synthetic-consultation',submissionId:'synthetic-consultation',notificationStatus:'unconfirmed',detailsToken:'synthetic-details-token'})});
    });
    await page.route('**/api/consultation/details', async route => {
      details.push(route.request().postDataJSON());
      await route.fulfill({json:{ok:true,saved:['projectType'],files:0}});
    });
    await page.goto("/contact#consult");

    // First dev hit compiles the route; allow generous time for the form mount.
    await expect(page.getByTestId("input-name")).toBeVisible({ timeout: 30_000 });

    await page.getByTestId("input-project").fill("Kitchen cabinets and a pantry wall.");
    await page.getByTestId("input-name").fill("Playwright Test");
    await page.getByTestId("input-phone").fill("abc");
    await page.getByTestId("button-estimate-quote-continue").click();
    await expect(page.getByText(/at least 10 digits/i)).toBeVisible();
    expect(submissions).toBe(0);
    await page.getByTestId("input-phone").fill("(208) 555-0101");
    // Email is optional, so it sits in the closed dropdown until opened.
    await expect(page.getByTestId("input-email")).toBeHidden();
    await page.getByTestId("quote-options").locator("summary").click();
    await page.getByTestId("input-email").fill("playwright@example.invalid");
    await page.getByTestId("button-estimate-quote-submit").click();

    await expect(page.getByText(/We could not confirm that your request was saved/)).toBeVisible();
    await expect(page.getByTestId("quote-form-success")).toHaveCount(0);
    expect(JSON.parse(attempts[0]).name).toBe("Playwright Test");
    expect(submissions).toBe(1);
    await page.getByTestId("button-estimate-quote-submit").click();
    await expect(page.getByTestId("quote-form-success")).toBeVisible({
      timeout: 15000,
    });
    expect(submissions).toBe(2);
    expect(attempts[1]).toBe(attempts[0]);

    // The project type, asked on the success screen, adds to the same request.
    // The request is plainly finished, and the optional details stay closed until asked for.
    await expect(page.getByTestId("quote-all-set")).toBeVisible();
    const panel = page.getByTestId("quote-details-panel");
    await expect(panel.getByTestId("button-save-details")).toBeHidden();
    await panel.getByTestId("quote-details-disclosure").locator("summary").click();
    await panel.getByText("Kitchen", { exact: true }).click();
    await panel.getByTestId("button-save-details").click();
    await expect(page.getByTestId("quote-details-saved")).toBeVisible();
    expect(details).toHaveLength(1);
    expect(details[0].requestId).toBe("consultation:synthetic-consultation");
    expect(details[0].token).toBe("synthetic-details-token");
    expect(details[0].fields.projectType).toBe("kitchen");
    expect(submissions).toBe(2);
    expect(clientErrors).toEqual([]);
  });
});
