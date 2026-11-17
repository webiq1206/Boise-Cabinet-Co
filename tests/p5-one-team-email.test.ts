/**
 * One team email per request (owner decision, 17 November 2026).
 *
 * p5homeco.com sends the team its "New lead" / "Details added" email. This
 * site's own team email is the fallback: it goes to the shared family inbox
 * only when p5 does not confirm that its email went. A lead must never end
 * with zero team emails, and the visitor never waits on p5.
 *
 * The two routes are run here for real (transpiled, with every import that
 * touches a database, a mail server, an ad platform or the network replaced
 * by a fake). Nothing is posted to the live form or the live p5 intake.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import * as consultationDetails from "../server/services/consultationDetails";
import * as consultationRequest from "../server/services/consultationRequest";
import * as emailLayout from "../server/services/emailLayout";
import * as leadConfirmationEmail from "../server/services/leadConfirmationEmail";
import * as p5IntakeBridge from "../server/services/p5IntakeBridge";
import * as teamEmail from "../server/services/teamEmail";
import * as propertyProfile from "../shared/propertyProfile";
import * as siteConfig from "../shared/siteConfig";
import {
  SHARED_FAMILY_INBOX_DOMAINS,
  consultationTeamNotes,
  detailsTeamNotes,
  isSharedFamilyInbox,
  sendTeamEmailAfterBridge,
  teamEmailRecipients,
} from "../server/services/teamEmail";
import {
  MAX_TEAM_NOTES,
  MAX_TEAM_NOTE_LENGTH,
  buildP5IntakeBody,
  cleanTeamNotes,
  namesInternalFigure,
  type P5BridgeResult,
} from "../server/services/p5IntakeBridge";

const SHARED = "hello@boisecabinet.co";
const OTHER = "owner@example.invalid";
const CUSTOMER = "ada@example.com";
const REQUEST_ID = "consultation:44444444-4444-4444-8444-444444444444";

/* ------------------------------------------------------------------ */
/* The shared-inbox helper and the decision                            */
/* ------------------------------------------------------------------ */

test("the shared family inbox is hello@ at every family domain, in any letter case", () => {
  assert.deepEqual([...SHARED_FAMILY_INBOX_DOMAINS].sort(), [
    "boiseadu.co",
    "boisecabinet.co",
    "boiseconstruction.co",
    "boisehandyman.co",
    "boiseremodeling.co",
    "p5homeco.com",
  ]);
  for (const domain of SHARED_FAMILY_INBOX_DOMAINS) {
    assert.equal(isSharedFamilyInbox(`hello@${domain}`), true, domain);
    assert.equal(isSharedFamilyInbox(`  HELLO@${domain.toUpperCase()} `), true, domain);
    assert.equal(isSharedFamilyInbox(`Boise Cabinet Co <Hello@${domain}>`), true, domain);
  }
  assert.equal(isSharedFamilyInbox(siteConfig.SITE_CONFIG.email), true, "this site's own team address is the shared inbox");
  for (const other of [
    OTHER,
    "nick@boisecabinet.co",
    "hello@example.com",
    "hello@mail.boisecabinet.co",
    "hello@boisecabinet.com",
    "hello+leads@boisecabinet.co",
    "sayhello@boisecabinet.co",
    "hello",
    "@boisecabinet.co",
    "",
    null,
    undefined,
  ]) {
    assert.equal(isSharedFamilyInbox(other), false, String(other));
  }
});

test("only a confirmed p5 email takes the shared inbox off the list", () => {
  const everyone = [SHARED, OTHER, "Hello@P5HomeCo.com"];
  assert.deepEqual(teamEmailRecipients(everyone, "sent"), [OTHER]);
  assert.deepEqual(teamEmailRecipients([SHARED], "sent"), []);
  for (const alert of ["failed", "none", "unknown"] as const) {
    assert.deepEqual(teamEmailRecipients(everyone, alert), everyone, alert);
  }
});

test("sendTeamEmailAfterBridge: sent skips the shared inbox; every doubt emails everyone", async () => {
  const run = async (bridge: Parameters<typeof sendTeamEmailAfterBridge>[0]["bridge"], maxWaitMs?: number) => {
    const to: string[] = [];
    const outcome = await sendTeamEmailAfterBridge({
      label: "test",
      bridge,
      recipients: async () => [SHARED, OTHER],
      send: async (address) => {
        to.push(address);
      },
      maxWaitMs,
    });
    return { to, outcome };
  };

  const sent = await run(Promise.resolve({ forwarded: true, alert: "sent" }));
  assert.deepEqual(sent.to, [OTHER]);
  assert.deepEqual(sent.outcome, { alert: "sent", sent: [OTHER], skipped: [SHARED], failed: [] });

  for (const alert of ["failed", "none", "unknown"] as const) {
    const result = await run(Promise.resolve({ forwarded: true, alert }));
    assert.deepEqual(result.to, [SHARED, OTHER], alert);
    assert.equal(result.outcome.alert, alert);
  }
  // No bridge at all, a bridge that rejects, a malformed result, a bridge that never settles.
  assert.deepEqual((await run(null)).to, [SHARED, OTHER]);
  assert.deepEqual((await run(undefined)).to, [SHARED, OTHER]);
  assert.deepEqual((await run(Promise.reject(new Error("bridge threw")))).to, [SHARED, OTHER]);
  assert.deepEqual((await run(Promise.resolve({ alert: "Sent" } as unknown as P5BridgeResult))).to, [SHARED, OTHER]);
  assert.deepEqual((await run(Promise.resolve(undefined as unknown as P5BridgeResult))).to, [SHARED, OTHER]);
  const stuck = await run(new Promise<P5BridgeResult>(() => {}), 20);
  assert.deepEqual(stuck.to, [SHARED, OTHER], "a bridge that never answers does not hold the team email forever");
  assert.equal(stuck.outcome.alert, "unknown");
});

test("sendTeamEmailAfterBridge never throws, and one failed recipient does not stop the next", async () => {
  const to: string[] = [];
  const outcome = await sendTeamEmailAfterBridge({
    label: "test",
    bridge: Promise.resolve({ forwarded: false, alert: "unknown" }),
    recipients: () => [SHARED, OTHER],
    send: async (address) => {
      if (address === SHARED) throw new Error("mail server refused");
      to.push(address);
    },
  });
  assert.deepEqual(to, [OTHER]);
  assert.deepEqual(outcome.failed, [SHARED]);
  await assert.doesNotReject(() =>
    sendTeamEmailAfterBridge({
      label: "test",
      bridge: null,
      recipients: async () => {
        throw new Error("no recipients");
      },
      send: async () => {},
    }),
  );
});

test("the team email does not start until the bridge has answered", async () => {
  let answer!: (result: P5BridgeResult) => void;
  const bridge = new Promise<P5BridgeResult>((resolve) => {
    answer = resolve;
  });
  const to: string[] = [];
  const pending = sendTeamEmailAfterBridge({
    label: "test",
    bridge,
    recipients: () => [SHARED],
    send: async (address) => {
      to.push(address);
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.deepEqual(to, [], "nothing is sent while p5 is still answering");
  answer({ forwarded: true, alert: "sent" });
  await pending;
  assert.deepEqual(to, [], "p5 confirmed: the shared inbox gets one email, p5's");
});

/* ------------------------------------------------------------------ */
/* team_notes                                                          */
/* ------------------------------------------------------------------ */

const WIZARD_ESTIMATE = {
  project: "Kitchen + Primary bath",
  finish: "2 rooms",
  priceLow: 21400,
  priceHigh: 33900,
  roi: 0,
  confidenceLabel: "Planning range, 2 rooms",
  rooms: [
    { project: "Kitchen", finish: "Modern Shaker · Matte finish ($$) · Better construction", sizeLabel: "22 linear ft", priceLow: 16800, priceHigh: 26200 },
    { project: "Primary bath vanity", finish: "Slab · Stained oak ($$$) · Best construction", sizeLabel: "6 linear ft", priceLow: 4600, priceHigh: 7700 },
  ],
};
const PROPERTY = {
  formattedAddress: "123 N Main St, Boise, ID 83702",
  city: "Boise",
  state: "ID",
  zip: "83702",
  parcelId: "R1234567890",
  squareFootage: 2140,
  lotSizeSqFt: 7405,
  permittingAuthority: "City of Boise",
};

test("consultation team notes: the planning range per room, the property lookup and the dashboard link", () => {
  const notes = consultationTeamNotes({
    estimate: WIZARD_ESTIMATE,
    propertyProfile: PROPERTY,
    budget: "$25k to $40k",
    timeline: "1 to 3 months",
    source: "consultation",
    leadId: "lead-77",
  });
  assert.deepEqual(notes, [
    "Planning range: $21,400 to $33,900",
    "Planning confidence: Planning range, 2 rooms",
    "Budget: $25k to $40k",
    "Timeline: 1 to 3 months",
    "Room 1: Kitchen; $16,800 to $26,200; 22 linear ft; Modern Shaker · Matte finish ($$) · Better construction",
    "Room 2: Primary bath vanity; $4,600 to $7,700; 6 linear ft; Slab · Stained oak ($$$) · Best construction",
    "Parcel: R1234567890",
    "Home size: about 2,140 sq ft",
    "Lot: 7,405 sq ft",
    "Permits: City of Boise",
    `Lead dashboard: ${emailLayout.LEAD_DASHBOARD_URL}/?leadId=lead-77`,
  ]);
  for (const note of notes) assert.match(note, /^[A-Z][A-Za-z0-9 .]*: \S/, `${note} is "Label: value"`);
  assert.deepEqual(cleanTeamNotes(notes), notes, "already single lines within the contract limits");

  // A single-room range has no room table; its own fields are the lines.
  assert.deepEqual(
    consultationTeamNotes({
      estimate: { project: "Kitchen", finish: "Modern Shaker · Matte finish ($$)", priceLow: 16800, priceHigh: 26200, roi: 71.6, sizeLabel: "22 linear ft" },
      source: "assistant",
      leadId: null,
    }),
    [
      "Planning range: $16,800 to $26,200",
      "Planning project: Kitchen",
      "Planning size: 22 linear ft",
      "Planning selections: Modern Shaker · Matte finish ($$)",
      "Est. resale ROI: 72%",
      "Came in through: the estimating assistant chat",
      `Lead dashboard: ${emailLayout.LEAD_DASHBOARD_URL}`,
    ],
  );

  // A plain request or a callback: nothing to add but the link.
  assert.deepEqual(consultationTeamNotes({ estimate: null, propertyProfile: null, budget: "", timeline: "", leadId: "lead-1" }), [
    `Lead dashboard: ${emailLayout.LEAD_DASHBOARD_URL}/?leadId=lead-1`,
  ]);
  assert.deepEqual(detailsTeamNotes({ leadId: "lead-1" }), [`Lead dashboard: ${emailLayout.LEAD_DASHBOARD_URL}/?leadId=lead-1`]);

  // Never a field the bridge already sends.
  assert.doesNotMatch(notes.join("\n"), /123 N Main|ada@example|555-0100|Ada Example/);
});

test("consultation team notes stay inside the contract however many rooms there are", () => {
  const rooms = Array.from({ length: 60 }, (_, i) => ({
    project: `Room number ${i + 1}`,
    finish: "Shaker ".repeat(80),
    sizeLabel: "10 linear ft",
    priceLow: 1000 + i,
    priceHigh: 2000 + i,
  }));
  const notes = consultationTeamNotes({ estimate: { ...WIZARD_ESTIMATE, rooms }, propertyProfile: PROPERTY, leadId: "lead-77" });
  assert.equal(notes.length, MAX_TEAM_NOTES);
  assert.equal(notes.at(-1), `Lead dashboard: ${emailLayout.LEAD_DASHBOARD_URL}/?leadId=lead-77`, "the link survives the cap");
  assert.ok(notes.includes("Parcel: R1234567890"), "the property lookup survives the cap");
  assert.ok(notes.some((note) => /^More rooms: \d+ more in the lead dashboard$/.test(note)), "a cut room list says so");
  const cleaned = cleanTeamNotes(notes);
  assert.equal(cleaned.length, notes.length);
  for (const note of cleaned) {
    assert.ok(note.length <= MAX_TEAM_NOTE_LENGTH);
    assert.doesNotMatch(note, /[\r\n\t]/);
  }
  assert.match(cleaned[2], /^Room 1: Room number 1; \$1,000 to \$2,000; /, "the amount is never what gets cut");
});

// p5's "New lead" email is copied into HubSpot with its full body by p5's
// inbox sync, and costs and margins stay out of HubSpot (owner rule). So
// team_notes carry customer-facing figures only.
const INTERNAL_WORDS = /cost|margin|mark[- ]?up|profit|contingenc|overhead/i;

test("team notes never carry a cost, margin, markup, profit, contingency or overhead figure", () => {
  // A planning range as the wizard posts it: nothing internal comes out.
  const plain = consultationTeamNotes({ estimate: WIZARD_ESTIMATE, propertyProfile: PROPERTY, budget: "$25k to $40k", timeline: "1 to 3 months", leadId: "lead-77" });
  assert.equal(plain.length, 11);
  for (const note of plain) assert.doesNotMatch(note, INTERNAL_WORDS, note);

  // The same request with internal numbers attached to every object the
  // builder is handed: it reads only the customer-facing fields, so none of
  // them can reach a note whatever they are called.
  const internal = { cost: 9137, costLow: 9137, costHigh: 14853, margin: 0.3417, marginPercent: 34.17, markup: 1.5231, grossProfit: 7719, profit: 7719, contingency: 0.0817, overhead: 0.1217, pricingAlerts: ["margin below floor: 21.7%"] };
  const loaded = consultationTeamNotes({
    estimate: { ...WIZARD_ESTIMATE, ...internal, rooms: WIZARD_ESTIMATE.rooms.map((room) => ({ ...room, ...internal })) } as typeof WIZARD_ESTIMATE,
    propertyProfile: { ...PROPERTY, ...internal },
    budget: "$25k to $40k",
    timeline: "1 to 3 months",
    leadId: "lead-77",
    ...internal,
  } as Parameters<typeof consultationTeamNotes>[0]);
  assert.deepEqual(loaded, plain, "internal fields change nothing");
  const joined = loaded.join("\n");
  assert.doesNotMatch(joined, INTERNAL_WORDS);
  assert.doesNotMatch(joined, /9,?137|14,?853|7,?719|3417|34\.17|5231|0817|1217|21\.7/, "none of the internal numbers appear");

  // Free text that names one: the line is left out, not reworded.
  const wordy = consultationTeamNotes({
    estimate: {
      ...WIZARD_ESTIMATE,
      confidenceLabel: "Includes 8% contingency",
      rooms: [
        { ...WIZARD_ESTIMATE.rooms[0], finish: "Shaker, our cost $9,100, margin 34%" },
        WIZARD_ESTIMATE.rooms[1],
      ],
    },
    propertyProfile: { ...PROPERTY, permittingAuthority: "City of Boise (overhead lines)" },
    budget: "Cost plus 10% markup",
    timeline: "After profit sharing pays out",
    leadId: "lead-77",
  });
  assert.deepEqual(wordy, [
    "Planning range: $21,400 to $33,900",
    "Room 2: Primary bath vanity; $4,600 to $7,700; 6 linear ft; Slab · Stained oak ($$$) · Best construction",
    "Parcel: R1234567890",
    "Home size: about 2,140 sq ft",
    "Lot: 7,405 sq ft",
    `Lead dashboard: ${emailLayout.LEAD_DASHBOARD_URL}/?leadId=lead-77`,
  ]);

  // The backstop every note passes on its way into the bridge body.
  for (const line of [
    "Cost: $9,100",
    "Our costs: $9,100",
    "Margin: 34%",
    "Gross margin 34 percent",
    "Markup: 1.52",
    "Mark-up: 52%",
    "Gross profit: $7,700",
    "Profit: $7,700",
    "Contingency: 8%",
    "Overhead: 12%",
    "Pricing alert: margin below floor",
  ]) {
    assert.equal(namesInternalFigure(line), true, line);
    assert.deepEqual(cleanTeamNotes([line]), [], line);
  }
  for (const line of plain) assert.equal(namesInternalFigure(line), false, line);
  assert.deepEqual(cleanTeamNotes(plain), plain, "customer-facing lines are kept as they are");
  const body = buildP5IntakeBody({ name: "Ada Example", email: CUSTOMER, teamNotes: ["Planning range: $21,400 to $33,900", "Margin: 34%", "Cost: $9,100"] });
  assert.deepEqual(body.team_notes, ["Planning range: $21,400 to $33,900"]);
  assert.deepEqual(detailsTeamNotes({ leadId: "lead-1" }).filter(namesInternalFigure), []);
});

/* ------------------------------------------------------------------ */
/* The routes, run with fakes                                          */
/* ------------------------------------------------------------------ */

type Mail = { to: string; subject: string; html: string; replyTo?: string };
type P5Answer =
  | { kind: "json"; status?: number; body: unknown }
  | { kind: "text"; status?: number; body: string }
  | { kind: "throw" }
  | { kind: "hang" };

type Harness = {
  mail: Mail[];
  posts: Array<Record<string, unknown>>;
  deferred: Array<() => unknown>;
  counts: { capi: number; dashboard: number; notify: number; adminEmailSuppressed: number };
  /** Let p5 answer. Until then its fetch stays pending. */
  release: () => void;
  /** Run what the route handed to after(), as Next does once the response is out. */
  runDeferred: () => Promise<void>;
  modules: Record<string, unknown>;
};

function fakeDatabase(results: Record<string, unknown[]>) {
  const run = (op: string, table?: { __name: string }) => {
    let name = table?.__name ?? "";
    const chain: Record<string, unknown> = {};
    for (const method of ["values", "set", "where", "limit", "returning", "onConflictDoNothing"]) chain[method] = () => chain;
    chain.from = (source: { __name: string }) => {
      name = source.__name;
      return chain;
    };
    chain.then = (resolve: (rows: unknown[]) => unknown, reject: (err: unknown) => unknown) =>
      Promise.resolve(results[`${op}:${name}`] ?? []).then(resolve, reject);
    return chain;
  };
  const db: Record<string, unknown> = {
    select: () => run("select"),
    insert: (table: { __name: string }) => run("insert", table),
    update: (table: { __name: string }) => run("update", table),
  };
  db.transaction = async (work: (tx: unknown) => unknown) => work(db);
  return db;
}

function table(name: string) {
  return new Proxy({ __name: name } as Record<string, unknown>, { get: (target, key) => (key in target ? target[key as string] : String(key)) });
}

function harness(options: {
  p5: P5Answer;
  admins?: string[];
  rows?: Record<string, unknown[]>;
  replayed?: boolean;
  afterThrows?: boolean;
  bridgeThrows?: boolean;
  bridgeTimeoutMs?: number;
}): Harness {
  const mail: Mail[] = [];
  const posts: Array<Record<string, unknown>> = [];
  const deferred: Array<() => unknown> = [];
  const counts = { capi: 0, dashboard: 0, notify: 0, adminEmailSuppressed: 0 };
  let open!: () => void;
  const gate = new Promise<void>((resolve) => {
    open = resolve;
  });

  const fakeFetch = async (_url: string, init: RequestInit): Promise<Response> => {
    posts.push(JSON.parse(String(init.body)));
    await gate;
    const answer = options.p5;
    if (answer.kind === "throw") throw new Error("network down");
    if (answer.kind === "hang") {
      return new Promise<Response>((_resolve, reject) => {
        const socket = setTimeout(() => reject(new Error("the timeout signal never fired")), 4_000);
        init.signal?.addEventListener("abort", () => {
          clearTimeout(socket);
          reject(init.signal?.reason ?? new Error("aborted"));
        });
      });
    }
    const body = answer.kind === "json" ? JSON.stringify(answer.body) : answer.body;
    return new Response(body, { status: answer.status ?? 200 });
  };

  const tables = {
    consultationRequests: table("consultationRequests"),
    consultationFiles: table("consultationFiles"),
    leads: table("leads"),
    submissions: table("submissions"),
    leadQuotes: table("leadQuotes"),
  };

  const modules: Record<string, unknown> = {
    "drizzle-orm": { and: () => null, eq: () => null, inArray: () => null },
    "next/server": {
      after: (task: () => unknown) => {
        if (options.afterThrows) throw new Error("after() called outside a request scope");
        deferred.push(task);
      },
      NextResponse: { json: (body: unknown, init?: { status?: number }) => ({ body, status: init?.status ?? 200 }) },
    },
    "@/lib/db": { db: fakeDatabase(options.rows ?? {}) },
    "@/shared/schema": tables,
    "@/lib/consultationReplay": {
      saveConsultationOnce: async () => ({ requestId: REQUEST_ID, replayed: options.replayed === true }),
      ConsultationReplayConflict: class extends Error {},
      CONSULTATION_KEY: /^[A-Za-z0-9:_-]+$/,
    },
    "@/lib/crm/leads": { deriveEmailable: () => true, matchServiceArea: () => null },
    "@/lib/rateLimit": { rateLimit: () => ({ ok: true }), getClientIp: () => "203.0.113.7" },
    // Never the real ones: a server-side Meta Lead and the external lead dashboard.
    "@/lib/analytics/metaCapi": { sendCapiLead: async () => void counts.capi++ },
    "@/lib/leadDashboard": { forwardLeadToDashboard: () => void counts.dashboard++ },
    "@/server/services/leadNotifications": {
      notifyNewLead: async (_alert: unknown, opts?: { sendAdminEmail?: boolean }) => {
        counts.notify++;
        if (opts?.sendAdminEmail === false) counts.adminEmailSuppressed++;
      },
    },
    "@/server/resend": {
      getUncachableResendClient: async () => ({
        fromEmail: SHARED,
        client: {
          emails: {
            send: async (message: Mail) => {
              mail.push(message);
              return { data: { id: "fake-message" } };
            },
          },
        },
      }),
    },
    "@/shared/siteConfig": siteConfig,
    "@/shared/propertyProfile": propertyProfile,
    "@/server/services/emailLayout": {
      ...emailLayout,
      getAdminRecipientEmails: async () => options.admins ?? [SHARED],
    },
    "@/server/services/leadConfirmationEmail": leadConfirmationEmail,
    "@/server/services/consultationRequest": consultationRequest,
    "@/server/services/consultationDetails": {
      ...consultationDetails,
      issueDetailsToken: () => null,
      verifyDetailsToken: () => "ok",
    },
    "@/server/services/consultationFiles": { quoteSecret: () => "test-secret", signedFileUrl: () => null },
    "@/server/services/consultationFileStore": { ensureConsultationFilesTable: async () => {} },
    "@/server/services/p5IntakeBridge": {
      ...p5IntakeBridge,
      // The real bridge, with the network replaced.
      forwardConsultationToP5Intake: (input: Parameters<typeof p5IntakeBridge.forwardConsultationToP5Intake>[0]) => {
        if (options.bridgeThrows) throw new Error("bridge could not start");
        return p5IntakeBridge.forwardConsultationToP5Intake(input, fakeFetch, options.bridgeTimeoutMs);
      },
    },
    "@/server/services/teamEmail": teamEmail,
  };

  return {
    mail,
    posts,
    deferred,
    counts,
    release: open,
    runDeferred: async () => {
      await Promise.all(deferred.splice(0).map((task) => task()));
    },
    modules,
  };
}

type Handler = (request: unknown) => Promise<{ status: number; body: Record<string, unknown> }>;

function loadRoute(file: string, modules: Record<string, unknown>): Handler {
  const source = readFileSync(new URL(file, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports: { POST?: Handler } = {};
  const load = (name: string) => {
    assert.ok(name in modules, `${file} imports ${name}, which this test does not fake`);
    return modules[name];
  };
  new Function("exports", "require", outputText)(exports, load);
  assert.equal(typeof exports.POST, "function");
  return exports.POST!;
}

function request(body: unknown) {
  return {
    headers: { get: () => null },
    cookies: { get: () => undefined },
    json: async () => body,
  };
}

const quiet = async <T>(work: () => Promise<T>): Promise<T> => {
  const { info, error } = console;
  console.info = () => {};
  console.error = () => {};
  try {
    return await work();
  } finally {
    console.info = info;
    console.error = error;
  }
};

const STEP1_BODY = {
  name: "Ada Example",
  phone: "(208) 555-0100",
  email: CUSTOMER,
  address: "123 N Main St, Boise, ID 83702",
  zip: "83702",
  projectType: "kitchen",
  message: "Shaker doors and a pantry.",
  propertyProfile: PROPERTY,
  estimate: WIZARD_ESTIMATE,
  budget: "$25k to $40k",
  timeline: "1 to 3 months",
  metaEventId: "meta-event-1",
  companyWebsite: "",
  preferredContact: "text",
};
const STEP1_ROWS = { "insert:leads": [{ id: "lead-77" }] };

const teamMail = (mail: Mail[]) => mail.filter((message) => /^New (consultation|callback) request: /.test(message.subject));
const customerMail = (mail: Mail[]) => mail.filter((message) => message.to === CUSTOMER);

async function step1(options: Parameters<typeof harness>[0], body: Record<string, unknown> = STEP1_BODY) {
  const h = harness({ rows: STEP1_ROWS, ...options });
  const POST = loadRoute("../app/api/consultation/route.ts", h.modules);
  const response = await quiet(() => POST(request(body)));
  return { h, response };
}

test("Step 1: the visitor's response and the customer's confirmation do not wait on p5", async () => {
  const { h, response } = await step1({ p5: { kind: "json", body: { ok: true, alert: "sent" } }, admins: [SHARED, OTHER] });

  // p5 has been asked and has NOT answered: its fetch is still pending.
  assert.equal(h.posts.length, 1, "the bridge was started");
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.accepted, true);
  assert.equal(response.body.persisted, true);
  assert.equal(response.body.requestId, REQUEST_ID);
  assert.equal(response.body.submissionId, "meta-event-1");
  assert.equal(response.body.notificationStatus, "attempted");
  assert.equal(response.body.crmRoutingStatus, "unconfirmed");
  assert.equal(customerMail(h.mail).length, 1, "the customer's confirmation is already out");
  assert.equal(teamMail(h.mail).length, 0, "no team email on the visitor's path");
  assert.equal(h.mail.length, 1);
  assert.equal(h.deferred.length, 2, "the bridge and the team email are both handed to after()");
  assert.equal(h.counts.capi, 1);
  assert.equal(h.counts.dashboard, 1);
  assert.equal(h.counts.notify, 1);
  assert.equal(h.counts.adminEmailSuppressed, 1, 'the lead manager\'s own "New lead" email stays off for consultations');

  // p5 answers "sent": the shared inbox gets nothing from this site, the other admin still does.
  h.release();
  await quiet(() => h.runDeferred());
  const team = teamMail(h.mail);
  assert.deepEqual(team.map((message) => message.to), [OTHER]);
  assert.equal(team[0].subject, "New consultation request: Ada Example");
  assert.match(team[0].html, /\$16,800 to \$26,200/, "the fallback email is the same email as before, per-room amounts included");
  assert.match(team[0].html, /Parcel: R1234567890/);
  assert.match(team[0].html, /leadId=lead-77/);
  assert.equal(customerMail(h.mail).length, 1, "still one confirmation");
});

test("Step 1: the bridge body asks p5 to confirm and carries well-formed team_notes", async () => {
  const { h } = await step1({ p5: { kind: "json", body: { ok: true, alert: "sent" } } });
  const [post] = h.posts;
  assert.equal(post.team_alert, "confirm");
  assert.equal(post.submission_kind, "initial");
  assert.equal(post.external_id, `boisecabinet-consultation:${REQUEST_ID}`);
  const notes = post.team_notes as string[];
  assert.ok(Array.isArray(notes) && notes.length > 0 && notes.length <= MAX_TEAM_NOTES);
  for (const note of notes) {
    assert.equal(typeof note, "string");
    assert.ok(note.length <= MAX_TEAM_NOTE_LENGTH);
    assert.doesNotMatch(note, /[\u0000-\u001f\u007f]/);
    assert.match(note, /^[A-Z][A-Za-z0-9 .]*: \S/);
  }
  assert.deepEqual(notes, [
    "Planning range: $21,400 to $33,900",
    "Planning confidence: Planning range, 2 rooms",
    "Budget: $25k to $40k",
    "Timeline: 1 to 3 months",
    "Room 1: Kitchen; $16,800 to $26,200; 22 linear ft; Modern Shaker · Matte finish ($$) · Better construction",
    "Room 2: Primary bath vanity; $4,600 to $7,700; 6 linear ft; Slab · Stained oak ($$$) · Best construction",
    "Parcel: R1234567890",
    "Home size: about 2,140 sq ft",
    "Lot: 7,405 sq ft",
    "Permits: City of Boise",
    `Lead dashboard: ${emailLayout.LEAD_DASHBOARD_URL}/?leadId=lead-77`,
  ]);
  // The planning range stays out of the fields p5 stores on the lead: it
  // travels only in team_notes (the email) and estimate (QuickBooks).
  const { team_notes: _notes, estimate: _estimate, ...stored } = post;
  assert.doesNotMatch(JSON.stringify(stored), /Planning range|\$16,800|R1234567890/);
  // p5's email reaches HubSpot: no cost, margin or other internal figure in a note.
  for (const note of notes) assert.doesNotMatch(note, INTERNAL_WORDS, note);
  h.release();
  await quiet(() => h.runDeferred());
  assert.equal(teamMail(h.mail).length, 0, "p5 confirmed and the only recipient is the shared inbox: one team email, p5's");
});

// The planning range also travels as a structured `estimate`, so p5 can create
// the QuickBooks customer and an unsent estimate. Customer amounts only, never
// marked verified (the range comes from the browser), and nothing at all when
// the numbers do not hold up. Builder tests: tests/p5-site-estimate.test.ts.
test("Step 1: a request with a planning range carries the structured estimate", async () => {
  const { h, response } = await step1({ p5: { kind: "json", body: { ok: true, alert: "sent" } } });
  assert.equal(response.body.accepted, true);
  const [post] = h.posts;
  assert.deepEqual(post.estimate, {
    kind: "planning-range",
    low: 21400,
    high: 33900,
    label: "Cabinets for 2 rooms: Kitchen, Primary bath vanity",
    lines: [
      { title: "Kitchen", description: "Planning range $16,800 to $26,200. 22 linear ft, Modern Shaker · Matte finish ($$) · Better construction", amount: 21500 },
      { title: "Primary bath vanity", description: "Planning range $4,600 to $7,700. 6 linear ft, Slab · Stained oak ($$$) · Best construction", amount: 6150 },
    ],
  });
  const estimate = post.estimate as { lines: Array<{ amount: number }> };
  assert.equal("verified" in estimate, false, "the server did not recompute the range, so it does not say it did");
  assert.equal(estimate.lines.reduce((sum, line) => sum + line.amount, 0), (21400 + 33900) / 2, "the lines add up to the middle of the range shown");
  assert.doesNotMatch(JSON.stringify(post.estimate), INTERNAL_WORDS);
  // Everything else in the body is as it was.
  assert.equal(post.team_alert, "confirm");
  assert.equal((post.team_notes as string[])[0], "Planning range: $21,400 to $33,900");
  h.release();
  await quiet(() => h.runDeferred());
});

test("Step 1: numbers that do not hold up send no estimate, and the request goes through unchanged", async () => {
  const good = await step1({ p5: { kind: "json", body: { ok: true, alert: "sent" } } });
  const { estimate: _estimate, ...goodRest } = good.h.posts[0];

  const cases: Array<[string, Record<string, unknown>]> = [
    ["a room's low above its high", { ...WIZARD_ESTIMATE, rooms: [{ ...WIZARD_ESTIMATE.rooms[0], priceLow: 16800, priceHigh: 26200 }, { ...WIZARD_ESTIMATE.rooms[1], priceLow: 7700, priceHigh: 4600 }] }],
    ["rooms that do not add up to the total", { ...WIZARD_ESTIMATE, rooms: [WIZARD_ESTIMATE.rooms[0], { ...WIZARD_ESTIMATE.rooms[1], priceLow: 46000, priceHigh: 77000 }] }],
    ["a negative room", { ...WIZARD_ESTIMATE, rooms: [WIZARD_ESTIMATE.rooms[0], { ...WIZARD_ESTIMATE.rooms[1], priceLow: -4600 }] }],
  ];
  for (const [name, estimate] of cases) {
    const { h, response } = await step1({ p5: { kind: "json", body: { ok: true, alert: "sent" } } }, { ...STEP1_BODY, estimate });
    assert.equal(response.status, 200, name);
    assert.equal(response.body.accepted, true, name);
    assert.equal(h.posts.length, 1, `${name}: the request is still forwarded`);
    assert.equal("estimate" in h.posts[0], false, `${name}: no estimate`);
    assert.equal(h.posts[0].team_alert, "confirm", name);
    assert.equal(h.posts[0].external_id, goodRest.external_id, name);
    assert.equal(h.posts[0].summary, goodRest.summary, name);
    assert.equal(customerMail(h.mail).length, 1, `${name}: the customer is still confirmed`);
    h.release();
    await quiet(() => h.runDeferred());
  }

  // Low above high on the whole range: the same.
  const reversed = await step1({ p5: { kind: "json", body: { ok: true, alert: "sent" } } }, { ...STEP1_BODY, estimate: { ...WIZARD_ESTIMATE, priceLow: 40000, rooms: undefined } });
  assert.equal(reversed.response.body.accepted, true);
  assert.equal("estimate" in reversed.h.posts[0], false);
});

test("Step 1: no estimate for a request without a planning range", async () => {
  const { estimate: _estimate, ...plain } = STEP1_BODY;
  const { h, response } = await step1({ p5: { kind: "json", body: { ok: true, alert: "sent" } } }, plain);
  assert.equal(response.body.accepted, true);
  assert.equal("estimate" in h.posts[0], false);
});

const DOUBTS: Array<[string, Parameters<typeof harness>[0]]> = [
  ["p5 says failed", { p5: { kind: "json", body: { ok: true, alert: "failed" } } }],
  ["p5 says none", { p5: { kind: "json", body: { ok: true, alert: "none" } } }],
  ["an older p5 with no alert field", { p5: { kind: "json", status: 201, body: { ok: true, accepted: true } } }],
  ["an alert that is not a contract value", { p5: { kind: "json", body: { ok: true, alert: "SENT" } } }],
  ["an answer that is not JSON", { p5: { kind: "text", body: "<html>ok</html>" } }],
  ["an HTTP error", { p5: { kind: "json", status: 500, body: { error: "boom", alert: "sent" } } }],
  ["a thrown fetch", { p5: { kind: "throw" } }],
  ["a timeout", { p5: { kind: "hang" }, bridgeTimeoutMs: 25 }],
  ["a bridge that could not start", { p5: { kind: "throw" }, bridgeThrows: true }],
];

for (const [name, options] of DOUBTS) {
  test(`Step 1: ${name} sends the site's team email to everyone`, async () => {
    const { h, response } = await step1({ ...options, admins: [SHARED, OTHER] });
    assert.equal(response.status, 200);
    assert.equal(response.body.accepted, true);
    assert.equal(teamMail(h.mail).length, 0, "not on the visitor's path");
    h.release();
    await quiet(() => h.runDeferred());
    const team = teamMail(h.mail);
    assert.deepEqual(team.map((message) => message.to), [SHARED, OTHER]);
    for (const message of team) {
      assert.equal(message.subject, "New consultation request: Ada Example");
      assert.equal(message.replyTo, `Ada Example <${CUSTOMER}>`, "a reply still goes straight to the lead");
    }
    assert.equal(customerMail(h.mail).length, 1);
  });
}

test("Step 1: a callback with no email address follows the same rule", async () => {
  const callback = { name: "Jordan Sample", phone: "208-555-0177", requestKind: "callback", bestTime: "Morning", metaEventId: "meta-event-2", companyWebsite: "" };
  const confirmed = await step1({ p5: { kind: "json", body: { ok: true, alert: "sent" } } }, callback);
  assert.equal(confirmed.response.body.accepted, true);
  assert.equal(confirmed.h.mail.length, 0, "no address, no confirmation; no team email on the visitor's path");
  assert.equal(confirmed.h.posts[0].request_kind, "callback");
  assert.equal("estimate" in confirmed.h.posts[0], false, "a callback never carries an estimate");
  assert.deepEqual(confirmed.h.posts[0].team_notes, [`Lead dashboard: ${emailLayout.LEAD_DASHBOARD_URL}/?leadId=lead-77`]);
  confirmed.h.release();
  await quiet(() => confirmed.h.runDeferred());
  assert.equal(confirmed.h.mail.length, 0, "p5 confirmed: its email is the one team email");

  const doubt = await step1({ p5: { kind: "json", body: { ok: true, alert: "failed" } } }, callback);
  doubt.h.release();
  await quiet(() => doubt.h.runDeferred());
  assert.deepEqual(doubt.h.mail.map((message) => [message.to, message.subject]), [[SHARED, "New callback request: Jordan Sample"]]);
});

test("Step 1: a team email that cannot be deferred is sent anyway, never dropped", async () => {
  const { h, response } = await step1({ p5: { kind: "json", body: { ok: true, alert: "none" } }, afterThrows: true });
  assert.equal(response.status, 200);
  assert.equal(response.body.accepted, true);
  assert.equal(h.deferred.length, 0);
  h.release();
  await quiet(async () => {
    for (let i = 0; i < 200 && teamMail(h.mail).length === 0; i++) await new Promise((resolve) => setTimeout(resolve, 5));
  });
  assert.deepEqual(teamMail(h.mail).map((message) => message.to), [SHARED]);
});

test("Step 1: a replayed request forwards nothing and emails nobody, as before", async () => {
  const { h, response } = await step1({ p5: { kind: "json", body: { ok: true, alert: "sent" } }, replayed: true });
  assert.equal(response.body.replayed, true);
  assert.equal(h.posts.length, 0);
  assert.equal(h.deferred.length, 0);
  assert.equal(h.mail.length, 0);
});

const DETAILS_ROWS = {
  "select:consultationRequests": [
    { id: REQUEST_ID, name: "Ada Example", phone: "(208) 555-0100", email: CUSTOMER, projectType: "other", zip: "", address: "", city: "", message: "Pantry wall" },
  ],
  "select:submissions": [{ leadId: "lead-77", payload: { requestKind: "request", preferredContact: "text" } }],
  "insert:submissions": [{ id: "details-1" }],
  "select:leads": [{ id: "lead-77", message: "Pantry wall", serviceType: "other", zip: "", address: "", city: "Unknown", email: CUSTOMER, emailStatus: "new" }],
};
const DETAILS_BODY = { requestId: REQUEST_ID, token: "1.x", fields: { projectType: "kitchen", timing: "Soon", address: "123 N Main St, Boise, ID 83702" } };

async function step2(options: Parameters<typeof harness>[0], rows: Record<string, unknown[]> = DETAILS_ROWS) {
  const h = harness({ rows, ...options });
  const POST = loadRoute("../app/api/consultation/details/route.ts", h.modules);
  const response = await quiet(() => POST(request(DETAILS_BODY)));
  return { h, response };
}

const detailsMail = (mail: Mail[]) => mail.filter((message) => /^(Details|Files) added: /.test(message.subject));

test("Step 2: the response does not wait on p5, and a confirmed p5 email keeps this site's out of the shared inbox", async () => {
  const { h, response } = await step2({ p5: { kind: "json", body: { ok: true, merged: true, alert: "sent" } }, admins: [SHARED, OTHER] });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { ok: true, saved: ["projectType", "address", "timing"], files: 0 });
  assert.equal(h.posts.length, 1, "the bridge was started and has not answered");
  assert.equal(h.mail.length, 0, "no team email on the visitor's path");

  const [post] = h.posts;
  assert.equal(post.submission_kind, "details");
  assert.equal(post.external_id, `boisecabinet-consultation:${REQUEST_ID}`);
  assert.equal(post.team_alert, "confirm");
  assert.deepEqual(post.team_notes, [`Lead dashboard: ${emailLayout.LEAD_DASHBOARD_URL}/?leadId=lead-77`]);
  assert.equal("estimate" in post, false, "Step 2 never carries an estimate");

  h.release();
  await quiet(() => h.runDeferred());
  const team = detailsMail(h.mail);
  assert.deepEqual(team.map((message) => message.to), [OTHER]);
  assert.equal(team[0].subject, "Details added: Ada Example");
  assert.match(team[0].html, /Timing: Soon/);
  assert.equal(h.mail.length, 1, "Step 1 already confirmed the customer; nothing else is sent");
});

for (const [name, options] of DOUBTS) {
  test(`Step 2: ${name} sends the site's "Details added" email to everyone`, async () => {
    const { h, response } = await step2({ ...options, admins: [SHARED, OTHER] });
    assert.equal(response.status, 200);
    assert.equal(response.body.ok, true);
    assert.equal(h.mail.length, 0, "not on the visitor's path");
    h.release();
    await quiet(() => h.runDeferred());
    assert.deepEqual(detailsMail(h.mail).map((message) => message.to), [SHARED, OTHER]);
  });
}

test("Step 2: the customer's first confirmation does not depend on what p5 says", async () => {
  const rows = {
    ...DETAILS_ROWS,
    "select:consultationRequests": [{ ...DETAILS_ROWS["select:consultationRequests"][0], email: "" }],
  };
  const h = harness({ rows, p5: { kind: "throw" } });
  const POST = loadRoute("../app/api/consultation/details/route.ts", h.modules);
  const response = await quiet(() => POST(request({ requestId: REQUEST_ID, token: "1.x", fields: { email: CUSTOMER } })));
  assert.equal(response.body.ok, true);
  h.release();
  await quiet(() => h.runDeferred());
  assert.equal(customerMail(h.mail).length, 1, "the address Step 2 first recorded is confirmed");
  assert.deepEqual(detailsMail(h.mail).map((message) => message.to), [SHARED], "and the team is told by this site, since p5 could not be reached");
});

test("Step 2: a replayed post forwards nothing and emails nobody, as before", async () => {
  const { h, response } = await step2({ p5: { kind: "json", body: { ok: true, alert: "sent" } } }, { ...DETAILS_ROWS, "insert:submissions": [] });
  assert.deepEqual(response.body, { ok: true, replayed: true });
  assert.equal(h.posts.length, 0);
  assert.equal(h.deferred.length, 0);
  assert.equal(h.mail.length, 0);
});
