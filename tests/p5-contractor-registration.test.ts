import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("the Idaho contractor credential is a registration on about and in the footer", () => {
  const about = readFileSync("app/about/page.tsx", "utf8");
  const footer = readFileSync("components/Footer.tsx", "utf8");

  assert.equal(
    about.includes("Idaho contractor registration #${SITE_CONFIG.trust.licenseNumber}. "),
    true,
  );
  assert.equal(
    about.includes("Idaho contractor registration information is available upon request."),
    true,
  );
  assert.equal(about.includes("contractor license"), false);
  assert.equal(about.includes("Is ${SITE_CONFIG.name} licensed and insured?"), true);

  assert.equal(
    footer.includes("Idaho contractor registration #${SITE_CONFIG.trust.licenseNumber}"),
    true,
  );
  assert.equal(
    footer.includes("Idaho contractor registration information is available upon request"),
    true,
  );
  assert.equal(footer.includes("Idaho license #"), false);
  assert.equal(footer.includes("License details available upon request"), false);

  const star = readFileSync("shared/content/cityCabinetGuides.ts", "utf8");
  assert.equal(star.includes("current Idaho license to apply"), true);
});
