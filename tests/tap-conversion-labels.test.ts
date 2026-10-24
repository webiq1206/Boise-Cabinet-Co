import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const TEL_TAP_SEND_TO = "AW-18354188204/ng9fCPiOhaAdEKzf-q9E";
const SMS_TAP_SEND_TO = "AW-18354188204/lTxsCOqahaAdEKzf-q9E";

test("call and text taps send the two Google Ads conversion labels", () => {
  const source = readFileSync(new URL("../components/seo/AnalyticsBridge.tsx", import.meta.url), "utf8");
  const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");

  assert.equal(source.split(TEL_TAP_SEND_TO).length - 1, 1);
  assert.equal(source.split(SMS_TAP_SEND_TO).length - 1, 1);
  assert.match(source, /const TEL_TAP_SEND_TO = "AW-18354188204\/ng9fCPiOhaAdEKzf-q9E"/);
  assert.match(source, /const SMS_TAP_SEND_TO = "AW-18354188204\/lTxsCOqahaAdEKzf-q9E"/);
  assert.match(source, /href\.startsWith\("tel:"\)[\s\S]*fireTapConversion\(TEL_TAP_SEND_TO\)/);
  assert.match(source, /href\.startsWith\("sms:"\)[\s\S]*fireTapConversion\(SMS_TAP_SEND_TO\)/);
  assert.match(source, /"event",\s*"conversion",\s*\{\s*send_to:\s*sendTo\s*\}/);
  assert.equal(source.split("addEventListener(\"click\"").length - 1, 1);
  assert.equal(layout.split("<AnalyticsBridge />").length - 1, 1);
});
