import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test, { mock } from "node:test";
import { trackGoogleAdsLeadOnce } from "../lib/analytics/track";
import {
  buildGoogleAdsUserData,
  GOOGLE_ADS_ESTIMATOR_COMPLETED_LABEL,
  GOOGLE_ADS_LEAD_LABEL,
  GTAG_RETRY_MS,
  trackGoogleAdsLeadConversion,
  type GoogleAdsUserData,
  type GoogleAdsUserInput,
} from "../lib/googleAdsConversion";

type Call = unknown[];

function installWindow(session: Map<string, string>, local = new Map<string, string>()) {
  const localStorage = {
    get length() {
      return local.size;
    },
    key(index: number) {
      return Array.from(local.keys())[index] ?? null;
    },
    getItem(key: string) {
      return local.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      local.set(key, value);
    },
  };
  const win = {
    sessionStorage: {
      getItem: (key: string) => session.get(key) ?? null,
      setItem: (key: string, value: string) => {
        session.set(key, value);
      },
    },
    localStorage,
    setTimeout: (fn: TimerHandler, ms?: number) => setTimeout(fn, ms),
    location: { pathname: "/" },
    gtag: undefined as ((...args: unknown[]) => void) | undefined,
  };
  (globalThis as { window?: typeof win }).window = win;
  return win;
}

function userDataCall(calls: Call[]): GoogleAdsUserData | undefined {
  const call = calls.find((item) => item[0] === "set" && item[1] === "user_data");
  return call?.[2] as GoogleAdsUserData | undefined;
}

function conversionCalls(calls: Call[]): Call[] {
  return calls.filter((item) => item[0] === "event" && item[1] === "conversion");
}

const allowedAddressKeys = new Set(["first_name", "last_name", "postal_code", "country"]);

function assertNoFreeText(data: GoogleAdsUserData) {
  const top = Object.keys(data);
  assert.deepEqual(top.filter((key) => !["email", "phone_number", "address"].includes(key)), []);
  if (data.address) {
    for (const key of Object.keys(data.address)) assert.equal(allowedAddressKeys.has(key), true);
    assert.equal(data.address.country, "US");
  }
  const flat = JSON.stringify(data);
  assert.equal(flat.includes("Main"), false);
  assert.equal(flat.includes("description"), false);
  assert.equal(flat.includes("kitchen remodel"), false);
}

test("email is trimmed and lowercased and a 10-digit phone becomes E.164", () => {
  const data = buildGoogleAdsUserData({
    email: "  Ada@Example.COM ",
    phone: "(208) 555-0199",
    name: "Ada Lovelace",
    postalCode: "83702",
  });
  assert.ok(data);
  assert.equal(data.email, "ada@example.com");
  assert.equal(data.phone_number, "+12085550199");
  assert.deepEqual(data.address, {
    first_name: "Ada",
    last_name: "Lovelace",
    postal_code: "83702",
    country: "US",
  });
  assertNoFreeText(data);
});

test("phone is omitted unless it has exactly 10 digits, and free text is dropped", () => {
  const omitted = buildGoogleAdsUserData({
    email: "ada@example.com",
    phone: "+1 208 555 0199",
    name: "Ada",
    postalCode: "1 Main Street, Boise ID 83702",
  });
  assert.ok(omitted);
  assert.equal(omitted.phone_number, undefined);
  assert.equal(omitted.address?.postal_code, undefined);
  assert.equal(omitted.address?.first_name, "Ada");
  assert.equal(omitted.address?.last_name, undefined);
  assertNoFreeText(omitted);

  const eleven = buildGoogleAdsUserData({ phone: "12085550199" });
  assert.equal(eleven, null);
  const zip4 = buildGoogleAdsUserData({ postalCode: " 83702-1234 " });
  assert.equal(zip4?.address?.postal_code, "83702-1234");
  assert.equal(zip4?.address?.country, "US");
});

test("user_data is set only after a successful send, and the conversion keeps transaction_id", () => {
  const win = installWindow(new Map());
  const calls: Call[] = [];
  win.gtag = (...args: unknown[]) => {
    calls.push(args);
  };
  const user: GoogleAdsUserInput = {
    email: " Ada@Example.com ",
    phone: "208-555-0100",
    name: "Mary Ann Smith",
    postalCode: "83702",
  };
  const id = "consultation-accepted-1";

  assert.equal(trackGoogleAdsLeadOnce(id, { projectType: "kitchen" }, 0, user), true);
  assert.equal(calls[0]?.[0], "set");
  assert.equal(calls[0]?.[1], "user_data");
  const data = calls[0]?.[2] as GoogleAdsUserData;
  assert.equal(data.email, "ada@example.com");
  assert.equal(data.phone_number, "+12085550100");
  assert.equal(data.address?.first_name, "Mary");
  assert.equal(data.address?.last_name, "Ann Smith");
  assert.equal(data.address?.postal_code, "83702");
  assertNoFreeText(data);

  const conversion = conversionCalls(calls);
  assert.equal(conversion.length, 1);
  assert.equal((conversion[0][2] as { send_to: string }).send_to, GOOGLE_ADS_LEAD_LABEL);
  assert.equal((conversion[0][2] as { transaction_id: string }).transaction_id, id);
  assert.equal(JSON.stringify(conversion[0][2]).includes("ada@example.com"), false);
  assert.ok(calls.indexOf(calls[0]) < calls.indexOf(conversion[0]));

  calls.length = 0;
  assert.equal(trackGoogleAdsLeadOnce(id, { projectType: "kitchen" }, 0, user), false);
  assert.equal(calls.length, 0);

  delete (globalThis as { window?: unknown }).window;
});

test("user_data is not set when gtag is not already available", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const win = installWindow(new Map());
  const calls: Call[] = [];
  assert.equal(
    trackGoogleAdsLeadConversion({ service: "kitchen" }, "estimator:waiting", 0, {
      email: "ada@example.com",
      phone: "2085550100",
      name: "Ada Lovelace",
    }),
    false,
  );
  assert.equal(calls.length, 0);
  mock.timers.tick(GTAG_RETRY_MS);
  assert.equal(calls.length, 0);

  win.gtag = (...args: unknown[]) => {
    calls.push(args);
  };
  mock.timers.tick(GTAG_RETRY_MS);
  assert.equal(calls[0]?.[0], "set");
  assert.equal(userDataCall(calls)?.email, "ada@example.com");
  const conversions = conversionCalls(calls);
  assert.equal(conversions.length, 2);
  assert.ok(calls.indexOf(calls[0]) < calls.indexOf(conversions[0]));
  assert.equal(
    (conversions.find((call) => (call[2] as { send_to: string }).send_to === GOOGLE_ADS_ESTIMATOR_COMPLETED_LABEL)?.[2] as {
      transaction_id: string;
    }).transaction_id,
    "estimator:waiting",
  );

  mock.timers.reset();
  delete (globalThis as { window?: unknown }).window;
});

test("estimator and intake submits use the saved contact and not project text", () => {
  const draftId = "11111111-1111-4111-8111-111111111111";
  const projectId = `p5:${draftId}`;
  const local = new Map<string, string>([
    [
      "p5-project-draft-v2",
      JSON.stringify({
        id: draftId,
        text: "Remodel the kitchen at 1 Main Street. Project description stays here.",
        answers: { service: "kitchen", address: "1 Main Street", location: "Boise 83702" },
        contact: { name: "Grace Hopper", email: " Grace@Example.com ", phone: "(208) 555-0148" },
        intake: { projectId },
      }),
    ],
  ]);
  const win = installWindow(new Map(), local);
  const calls: Call[] = [];
  win.gtag = (...args: unknown[]) => {
    calls.push(args);
  };

  assert.equal(trackGoogleAdsLeadConversion({ service: "kitchen" }, `estimator:${draftId}`), true);
  const estimatorUser = userDataCall(calls);
  assert.ok(estimatorUser);
  assert.equal(estimatorUser.email, "grace@example.com");
  assert.equal(estimatorUser.phone_number, "+12085550148");
  assert.equal(estimatorUser.address?.first_name, "Grace");
  assert.equal(estimatorUser.address?.last_name, "Hopper");
  assert.equal(estimatorUser.address?.postal_code, undefined);
  assertNoFreeText(estimatorUser);
  assert.equal(
    (conversionCalls(calls)[0][2] as { transaction_id: string }).transaction_id,
    `estimator:${draftId}`,
  );

  calls.length = 0;
  assert.equal(trackGoogleAdsLeadConversion({ service: "kitchen" }, `intake:${projectId}`), true);
  const intakeUser = userDataCall(calls);
  assert.ok(intakeUser);
  assert.equal(intakeUser.email, "grace@example.com");
  assert.equal(intakeUser.phone_number, "+12085550148");
  assert.equal(intakeUser.address?.postal_code, undefined);
  assertNoFreeText(intakeUser);
  assert.equal((conversionCalls(calls)[0][2] as { transaction_id: string }).transaction_id, `intake:${projectId}`);

  delete (globalThis as { window?: unknown }).window;
});

test("the consultation form sends Ads user_data only after an accepted submit", () => {
  const source = readFileSync(new URL("../components/consultation/ConsultationFields.tsx", import.meta.url), "utf8");
  const fnStart = source.indexOf("mutationFn:");
  const successStart = source.indexOf("onSuccess:");
  const errorStart = source.indexOf("onError:");
  const fn = source.slice(fnStart, successStart);
  const success = source.slice(successStart, errorStart);
  const accepted = success.indexOf("if (result.accepted)");
  const ads = success.indexOf("trackGoogleAdsLeadOnce");
  assert.ok(fnStart !== -1 && successStart > fnStart && errorStart > successStart);
  assert.match(fn, /adsUserRef\.current = \{/);
  assert.match(fn, /email: data\.email/);
  assert.match(fn, /phone: data\.phone/);
  assert.match(fn, /name: data\.name/);
  assert.match(fn, /postalCode: data\.zip/);
  const assignment = fn.slice(fn.indexOf("adsUserRef.current = {"), fn.indexOf("};") + 2);
  assert.doesNotMatch(assignment, /address:|message:|description:/);
  assert.equal(fn.includes("trackGoogleAdsLeadOnce"), false);
  assert.ok(accepted !== -1 && ads > accepted);
  assert.match(success.slice(0, accepted), /const adsUser = adsUserRef\.current/);
  assert.match(success.slice(0, accepted), /adsUserRef\.current = null/);
  assert.match(success.slice(ads), /adsUser \?\? undefined/);
  assert.equal(source.slice(errorStart).includes("trackGoogleAdsLeadOnce"), false);
  assert.match(source.slice(errorStart, errorStart + 180), /adsUserRef\.current = null/);
});

test("the shared estimator still fires Ads only after the server accepts", () => {
  const source = readFileSync(new URL("../components/P5Estimator.tsx", import.meta.url), "utf8");
  const intakeAt = source.indexOf(
    "trackGoogleAdsLeadConversion({service:latest.answers.service},`intake:${receipt.projectId}`)",
  );
  const submitAt = source.indexOf(
    "trackGoogleAdsLeadConversion({service:d.answers.service},`estimator:${d.id}`)",
  );
  const rejectedAt = source.lastIndexOf("if(!response.ok)throw", intakeAt);
  assert.ok(rejectedAt !== -1 && rejectedAt < intakeAt && intakeAt < submitAt);
  assert.equal(source.includes("user_data"), false);
  assert.equal(source.includes("postalCode"), false);
});
