import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { generateLocalBusinessSchema } from "../lib/schema.ts";
import { BUSINESS_INFO } from "../lib/seo.ts";
import { schemaTime } from "../lib/schemaTime.ts";
import { GBP_PROFILE, GBP_COMPLETENESS_CHECKLIST } from "../shared/gbpConfig.ts";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const CONTACT_HOURS = "Mon-Fri 9 AM-6 PM and Sat 9 AM-4 PM Mountain, closed Sunday";

test("contact page hours match LocalBusiness openingHoursSpecification", () => {
  const contact = readFileSync(new URL("../app/contact/page.tsx", import.meta.url), "utf8");
  assert.equal(contact.includes(CONTACT_HOURS), true);
  assert.equal(contact.includes("7 am"), false);
  assert.equal(contact.includes("8 am"), false);

  const specs = generateLocalBusinessSchema().openingHoursSpecification as Array<{
    dayOfWeek: string;
    opens?: string;
    closes?: string;
  }>;
  const byDay = new Map(specs.map((spec) => [spec.dayOfWeek, spec]));

  for (const day of WEEKDAYS) {
    assert.equal(byDay.get(day)?.opens, schemaTime("9 AM"));
    assert.equal(byDay.get(day)?.closes, schemaTime("6 PM"));
    assert.equal(byDay.get(day)?.opens, "09:00");
    assert.equal(byDay.get(day)?.closes, "18:00");
  }
  assert.equal(byDay.get("Saturday")?.opens, schemaTime("9 AM"));
  assert.equal(byDay.get("Saturday")?.closes, schemaTime("4 PM"));
  assert.equal(byDay.get("Saturday")?.opens, "09:00");
  assert.equal(byDay.get("Saturday")?.closes, "16:00");
  assert.equal(byDay.has("Sunday"), false);

  for (const day of ["monday", "tuesday", "wednesday", "thursday", "friday"] as const) {
    assert.equal(BUSINESS_INFO.hours[day], "9:00 AM - 6:00 PM");
  }
  assert.equal(BUSINESS_INFO.hours.saturday, "9:00 AM - 4:00 PM");
  assert.equal(BUSINESS_INFO.hours.sunday, "Closed");
  assert.deepEqual(GBP_PROFILE.hours, {
    monday: "9:00 AM - 6:00 PM",
    tuesday: "9:00 AM - 6:00 PM",
    wednesday: "9:00 AM - 6:00 PM",
    thursday: "9:00 AM - 6:00 PM",
    friday: "9:00 AM - 6:00 PM",
    saturday: "9:00 AM - 4:00 PM",
    sunday: "Closed",
  });
  assert.equal(
    GBP_COMPLETENESS_CHECKLIST.includes("Hours set (Mon-Fri 9 AM-6 PM, Sat 9 AM-4 PM, Sun closed)"),
    true,
  );
});
