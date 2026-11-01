import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { IDAHO_REGISTERED_CONTRACTOR, REGISTERED_BONDED_INSURED } from "../shared/claims";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Footer } from "../components/Footer.tsx";

(globalThis as typeof globalThis & { React: typeof React }).React = React;
/** The footer is the shared family SiteFooter (lib/familyBrand.ts), so its rendered HTML is what is checked. */
const renderFooter = () => renderToStaticMarkup(React.createElement(Footer));

test("about and footer retain the current centralized contractor registration", () => {
  const about = readFileSync("app/about/page.tsx", "utf8");
  const footer = renderFooter();
  assert.equal(IDAHO_REGISTERED_CONTRACTOR, "P5 Home Co LLC, Idaho Registered Contractor #8381215");
  assert.equal(
    REGISTERED_BONDED_INSURED,
    "P5 Home Co LLC, Idaho Registered Contractor #8381215. Insured; certificate on request",
  );
  assert.match(about, /\$\{REGISTERED_BONDED_INSURED\}/);
  assert.match(about, /\$\{IDAHO_REGISTERED_CONTRACTOR\}/);
  assert.match(footer, /href="https:\/\/edopl\.idaho\.gov\/OnlineServices\/\?link=PubSearch"[^>]*>P5 Home Co LLC, Idaho Registered Contractor #8381215<\/a>/);
  assert.doesNotMatch(about, /contractor license/);
  assert.doesNotMatch(footer, /Idaho license #|License details available upon request/);
  // Do not turn a municipality's permit requirement into a claim about this business.
  assert.match(readFileSync("shared/content/cityCabinetGuides.ts", "utf8"), /current Idaho license to apply/);
});
