import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { IDAHO_REGISTERED_CONTRACTOR, REGISTERED_BONDED_INSURED } from "../shared/claims";

test("about and footer retain the current centralized contractor registration", () => {
  const about = readFileSync("app/about/page.tsx", "utf8");
  const footer = readFileSync("components/Footer.tsx", "utf8");
  assert.equal(IDAHO_REGISTERED_CONTRACTOR, "P5 Home Co LLC, Idaho Registered Contractor #8381215");
  assert.equal(
    REGISTERED_BONDED_INSURED,
    "P5 Home Co LLC, Idaho Registered Contractor #8381215. Insured; certificate on request",
  );
  assert.match(about, /REGISTERED_BONDED_INSURED|IDAHO_REGISTERED_CONTRACTOR/);
  assert.match(footer, /href="https:\/\/edopl\.idaho\.gov\/OnlineServices\/\?link=PubSearch"[\s\S]*?\{IDAHO_REGISTERED_CONTRACTOR\}[\s\S]*?<\/a>/);
  assert.doesNotMatch(about, /contractor license/);
  assert.doesNotMatch(footer, /Idaho license #|License details available upon request/);
  // Do not turn a municipality's permit requirement into a claim about this business.
  assert.match(readFileSync("shared/content/cityCabinetGuides.ts", "utf8"), /current Idaho license to apply/);
});
