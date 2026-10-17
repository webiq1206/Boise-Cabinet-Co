import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { preferToTextLine, SITE_CONFIG } from "../shared/siteConfig";

const LINE =
  "Prefer to text? Text (208) 477-1169. We reply in minutes during business hours (Mon–Fri 9–6, Sat 9–4 MT).";

test("the Prefer to text line uses one hours constant, including Saturday", () => {
  assert.equal(SITE_CONFIG.textReplyHours, "Mon–Fri 9–6, Sat 9–4 MT");
  assert.equal(preferToTextLine(), LINE);
  assert.equal(preferToTextLine(SITE_CONFIG.phone), LINE);

  const contact = readFileSync("app/contact/page.tsx", "utf8");
  assert.equal(contact.includes("preferToTextLine()"), true);
  assert.equal(contact.includes("Mon–Fri 9–6 MT"), false);
  assert.equal(contact.includes("Sat 9–4"), false);

  const config = readFileSync("shared/siteConfig.ts", "utf8");
  assert.equal(config.split("Mon–Fri 9–6, Sat 9–4 MT").length, 2);
});
