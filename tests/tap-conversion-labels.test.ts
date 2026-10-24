import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const TEL_TAP_SEND_TO = "AW-18354188204/ng9fCPiOhaAdEKzf-q9E";
const SMS_TAP_SEND_TO = "AW-18354188204/lTxsCOqahaAdEKzf-q9E";

test("call and text taps send the two Google Ads conversion labels", () => {
  const source = readFileSync(new URL("../lib/callTextClickConversion.ts", import.meta.url), "utf8");
  const bridge = readFileSync(new URL("../components/seo/AnalyticsBridge.tsx", import.meta.url), "utf8");
  const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");

  assert.equal(source.split(TEL_TAP_SEND_TO).length - 1, 1);
  assert.equal(source.split(SMS_TAP_SEND_TO).length - 1, 1);
  assert.match(source, /const GOOGLE_ADS_TEL_CLICK_LABEL = "AW-18354188204\/ng9fCPiOhaAdEKzf-q9E"/);
  assert.match(source, /const GOOGLE_ADS_SMS_CLICK_LABEL = "AW-18354188204\/lTxsCOqahaAdEKzf-q9E"/);
  assert.match(source, /value\.startsWith\("tel:"\)[\s\S]*GOOGLE_ADS_TEL_CLICK_LABEL/);
  assert.match(source, /value\.startsWith\("sms:"\)[\s\S]*GOOGLE_ADS_SMS_CLICK_LABEL/);
  assert.match(source, /"event",\s*"conversion",\s*\{\s*send_to:\s*sendTo\s*\}/);
  assert.equal(source.split("addEventListener(\"click\"").length - 1, 1);
  assert.equal(bridge.split("bindDelegatedContactClicks()").length - 1, 1);
  assert.equal(layout.split("<AnalyticsBridge />").length - 1, 1);
});
