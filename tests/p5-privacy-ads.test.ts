import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("app/privacy-policy/page.tsx", "utf8");

test("privacy policy states Google enhanced conversions are off and remarketing is on", () => {
  assert.equal(
    page.includes("We do not currently send your name, email, phone number or project details to Google."),
    true,
  );
  assert.equal(
    page.includes(
      "Google's tag also adds visitors to remarketing lists, and Google may use this data to show you relevant ads on other websites (remarketing).",
    ),
    true,
  );
  assert.equal(
    page.includes("Google may also use information collected by its tags to personalise ads."),
    false,
  );
  assert.equal(page.includes("https://tools.google.com/dlpage/gaoptout"), true);
  assert.equal(page.includes("https://adssettings.google.com/"), true);
});

test("privacy policy lists the Meta Lead fields the pixel and Conversions API send", () => {
  assert.equal(
    page.includes(
      "We also use the Meta Pixel and Meta's Conversions API to measure visits and inquiries from our Facebook and Instagram ads.",
    ),
    true,
  );
  for (const field of [
    "hashed email",
    "hashed phone number",
    "hashed first name",
    "hashed last name",
    "hashed ZIP code",
    "IP address",
    "browser user agent",
    "fbp",
    "fbc",
    "Consultation request",
    "https://www.facebook.com/privacy/policy",
  ]) {
    assert.equal(page.includes(field), true, field);
  }
  assert.equal(page.includes("\u2014"), false);
});
