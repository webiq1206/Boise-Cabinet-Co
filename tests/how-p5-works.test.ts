import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { CABINET_LEAD_TIME_LINE, HOW_P5_WORKS, HOW_P5_WORKS_TITLE } from "../shared/siteContent";

test("How P5 works uses the seven shared lines and a separate lead-time line", () => {
  assert.equal(HOW_P5_WORKS_TITLE, "How P5 works");
  assert.deepEqual(HOW_P5_WORKS, [
    "Own install crew",
    "Bonded & insured",
    "Manufacturer warranties passed through",
    "Install dates confirmed in writing",
    "Written update every week",
    "Free in-home consultation, no pressure",
    "Public representative: Nick Perkins",
  ]);
  assert.equal(
    CABINET_LEAD_TIME_LINE,
    "Lead time: typically 4\u20138 weeks, often faster for ready-to-assemble lines",
  );
  const inclusions = readFileSync("shared/siteContent.ts", "utf8");
  const standard = inclusions.slice(inclusions.indexOf("export const STANDARD_INCLUSIONS"));
  assert.equal(standard.includes("CABINET_LEAD_TIME_LINE"), false);
  assert.equal(standard.includes("typically 4"), false);
});

test("the lead-time line renders on homeowner and room pages only", () => {
  for (const file of ["app/page.tsx", "app/about/page.tsx", "app/contact/page.tsx", "app/cabinets/[room]/page.tsx"]) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /<HowP5Works showLeadTime/, file);
  }
  for (const file of ["app/builders/page.tsx", "app/dealer/page.tsx", "app/installer/page.tsx"]) {
    const source = readFileSync(file, "utf8");
    assert.equal(source.includes("HowP5Works"), false, file);
    assert.equal(source.includes("CABINET_LEAD_TIME_LINE"), false, file);
  }
});
