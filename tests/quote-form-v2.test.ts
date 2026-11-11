/**
 * Quote form v2 (two steps, files, HubSpot by way of p5 intake): the parts
 * that decide whether a lead and what was added to it arrive intact.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { buildLeadNotes, consultationBodySchema, resolveProjectType } from "../server/services/consultationRequest.ts";
import {
  DETAILS_TOKEN_TTL_SECONDS,
  detailsBodySchema,
  detailsDigest,
  detailsSubmissionId,
  issueDetailsToken,
  mergeDetails,
  splitAddress,
  verifyDetailsToken,
} from "../server/services/consultationDetails.ts";
import {
  checkUploadedFile,
  cleanFileName,
  signedFileUrl,
  sniffContentType,
  verifyFileSignature,
} from "../server/services/consultationFiles.ts";
import { buildP5DetailsBody, buildP5IntakeBody } from "../server/services/p5IntakeBridge.ts";
import {
  QUOTE_FILE_HINT,
  QUOTE_FILE_MAX_BYTES,
  QUOTE_FILE_MAX_COUNT,
  checkQuoteFile,
  resolveQuoteFileType,
} from "../shared/quoteFiles.ts";

const SECRET = "test-session-secret-at-least-32-characters";
const REQUEST_ID = "consultation:33333333-3333-4333-8333-333333333333";
const key = "33333333-3333-4333-8333-333333333333";

test("Step 1: the short request with no email, a text reply and no project type is accepted", () => {
  const parsed = consultationBodySchema.safeParse({
    name: "Avery Sample",
    phone: "(208) 555-0142",
    email: "",
    zip: "",
    projectType: "cabinet-project: Pantry wall and a desk run",
    message: "Pantry wall and a desk run",
    companyWebsite: "",
    metaEventId: key,
    source: "consultation",
    requestKind: "request",
    preferredContact: "text",
    bestTime: "",
  });
  assert.equal(parsed.success, true, JSON.stringify(parsed.success ? null : parsed.error.flatten()));
  if (!parsed.success) return;
  assert.equal(buildLeadNotes(parsed.data), "How to reach them: Text me.\n\nPantry wall and a desk run");
  assert.equal(resolveProjectType({ projectType: "", requestKind: "request" }), "other");
});

test("Step 1: an optional project address is accepted, and its absence changes nothing", () => {
  const base = {
    name: "Avery Sample",
    phone: "(208) 555-0142",
    email: "",
    zip: "",
    projectType: "cabinet-project: Pantry wall",
    message: "Pantry wall",
    companyWebsite: "",
    metaEventId: key,
    source: "consultation",
    requestKind: "request",
    preferredContact: "text",
    bestTime: "",
  };
  const without = consultationBodySchema.safeParse(base);
  assert.equal(without.success, true);
  if (without.success) assert.equal(without.data.address, "", "no address is the blank the server always stored");
  const withAddress = consultationBodySchema.safeParse({ ...base, address: "123 Main St, Boise, ID 83702" });
  assert.equal(withAddress.success, true);
  if (!withAddress.success || !without.success) return;
  assert.equal(withAddress.data.address, "123 Main St, Boise, ID 83702");
  // The address travels in its own field, not in the notes.
  assert.equal(buildLeadNotes(withAddress.data), buildLeadNotes(without.data));
  // The route stores it, derives the ZIP from it and forwards it, as for the estimator's contact step.
  const route = readFileSync(new URL("../app/api/consultation/route.ts", import.meta.url), "utf8");
  assert.match(route, /const zip = data\.zip \|\| parts\.zip \|\| extractZipFromAddress\(data\.address\) \|\| "";/);
  assert.match(route, /address: data\.address \|\| null,/);
  assert.match(route, /<strong>Address:<\/strong> \$\{escapeHtml\(data\.address\)\}/);
});

test("Step 1: the form sends the same field names the route reads, and asks for no address or project type", () => {
  const source = readFileSync(new URL("../components/quote/QuoteRequestForm.tsx", import.meta.url), "utf8");
  for (const key of ["name:", "phone:", "email:", "projectType,", "message: notes", "companyWebsite,", "requestKind: kind", "preferredContact:", "bestTime:"]) {
    assert.ok(source.includes(key), `payload carries ${key}`);
  }
  // Visual order: the question first, then name and phone, then the one quiet
  // toggle that holds everything optional (email, how to reach you), then the
  // send button, the talk line and the legal line.
  const order = [
    "What can we help with?",
    "{nameField}",
    "{phoneField}",
    'data-testid="quote-options"',
    "Add address, email or contact preference (optional)",
    'htmlFor={ids.address}',
    "Project address",
    'htmlFor={ids.email}',
    "How should we reach you?",
    "</details>",
    "<WizardActionBar",
    "{dock ? null : quietLines}",
  ];
  const requestBranch = source.indexOf("<label id={ids.projectQuestion}");
  assert.ok(requestBranch > 0);
  const positions = order.map((text) => source.indexOf(text, requestBranch));
  for (let i = 1; i < positions.length; i += 1) assert.ok(positions[i] > positions[i - 1], `${order[i]} follows ${order[i - 1]}`);
  assert.doesNotMatch(source, /name="zip"|name="room"/);
  // The optional project address (owner, 11 November) is the toggle's first field: a
  // plain text input, never required or validated, sent as `address` only when given
  // (so a request without one is exactly what it was), never in callback mode, kept
  // in the tab's draft, and a restored one opens the toggle.
  assert.match(source, /name="address"\s+autoComplete="street-address"/);
  assert.match(source, /maxLength=\{300\}/);
  assert.match(source, /address: kind === "request" \? address\.trim\(\) : "",/);
  assert.match(source, /\.\.\.\(trimmed\.address \? \{ address: trimmed\.address \} : null\),/);
  assert.match(source, /zip: trimmed\.zip,/);
  assert.doesNotMatch(source, /next\.address|errors\.address/);
  assert.match(source, /const draft: Draft = \{ mode, name, phone, email, address, project, reach, bestTime \};/);
  assert.match(source, /early\.address \|\| draft\.address \|\| \(draft\.reach/);
  // The first screen shows nothing optional: no attachment tile, and the toggle starts closed.
  assert.doesNotMatch(source, /<AttachmentTile/);
  assert.match(source, /const \[optionsOpen, setOptionsOpen\] = useState\(false\);/);
  const followUp = readFileSync(new URL("../components/quote/QuoteFollowUp.tsx", import.meta.url), "utf8");
  const styles = readFileSync(new URL("../components/quote/quoteStyles.ts", import.meta.url), "utf8");

  // Clean layout (owner, 11 November: "It cannot look cluttered"): no step
  // indicator, no tabs, no footnote under the button, no Text or Chat links, no
  // "Prefer to text" sentence and no bordered dropdown anywhere in the form.
  assert.equal(existsSync(new URL("../components/quote/QuoteSteps.tsx", import.meta.url)), false, "the step indicator is gone");
  for (const [name, text] of [["QuoteRequestForm", source], ["QuoteFollowUp", followUp], ["quoteStyles", styles]] as const) {
    assert.doesNotMatch(text, /QuoteSteps|data-quote-steps|TAB_CLASS|DISCLOSURE_|ChevronDown|PreferToTextLine/, name);
    assert.doesNotMatch(text, /That is all we need|footnote=|button-quote-chat|phoneSmsHref\} className=\{talkLink/, name);
  }
  // The quiet toggle is text only: no border, no background, no padding box.
  const quiet = styles.slice(styles.indexOf("export const QUIET_TOGGLE_CLASS"), styles.indexOf("export const MUTED_LINE_CLASS"));
  assert.ok(quiet.length > 0);
  assert.doesNotMatch(quiet, /\bborder|\bbg-|\bp[xy]?-\d|shadow/);
  assert.match(quiet, /text-sm text-muted-foreground/);
  for (const text of [source, followUp]) {
    assert.match(text, /<details\s+className=\{QUIET_TOGGLE_CLASS\}|<details className=\{QUIET_TOGGLE_CLASS\}/);
    assert.match(text, /<summary className=\{QUIET_SUMMARY_CLASS\}>\s*<Plus className=\{QUIET_PLUS_CLASS\} aria-hidden="true" \/>/);
  }

  // One line under the button, which is also the mode control: the same two
  // native radios with the same names and test ids, of which only the mode the
  // visitor is NOT in shows (as a text link); the checked one is visually hidden.
  const modeSwitch = source.slice(source.indexOf("export function QuoteModeSwitch"), source.indexOf("export function QuoteRequestForm"));
  assert.match(modeSwitch, /"Prefer to talk\? " : "Rather write it down\? "/);
  assert.match(modeSwitch, /href=\{SITE_CONFIG\.phoneHref\}[^>]*>\s*Call \{SITE_CONFIG\.phone\}/);
  assert.match(modeSwitch, /option\("request", "Send a request", "button-estimate-quote-back"\)/);
  assert.match(modeSwitch, /option\("callback", "Have us call you", "button-quote-callback"\)/);
  assert.match(modeSwitch, /type="radio"/);
  assert.match(modeSwitch, /mode === value\s*\? "sr-only"/);
  assert.equal(source.match(/<QuoteModeSwitch/g)?.length, 1, "one mode control");
  assert.equal(source.match(/SITE_CONFIG\.phoneHref/g)?.length, 1, "one call link in the form");
  // One small legal line: "No obligation." and the Privacy Policy link.
  assert.match(source, /No obligation\.\{" "\}\s*<span className="whitespace-nowrap">\s*<Link href="\/privacy-policy"/);
  // The last link of each quiet line and its full stop stay together, so a stop never wraps alone.
  assert.match(modeSwitch, /<span className="whitespace-nowrap">\s*<fieldset[\s\S]*<\/fieldset>\s*\{mode === "request" \? "\." : null\}\s*<\/span>/);
  assert.match(followUp, /<span className="whitespace-nowrap">\s*<a href=\{SITE_CONFIG\.phoneHref\}[\s\S]*?<\/a>\s*\.\s*<\/span>/);
  // Nothing behind a toggle that already says "(optional)" repeats it: no "Optional" note
  // beside Email (only "Needed to reply by email" when that is the chosen reply), and the
  // only "(optional)" left are the two toggle summaries and "Best time to call" in callback mode.
  assert.match(source, /\{reach === "email" \? "Needed to reply by email" : ""\}/);
  assert.doesNotMatch(source, /"Optional"|>\s*Optional\s*</);
  assert.equal(source.slice(source.indexOf("return (\n    // data-family-bar-yield")).match(/\(optional\)/g)?.length, 2);
  assert.equal(followUp.slice(followUp.indexOf("return (\n    // data-family-bar-yield")).match(/optional/gi)?.length, 1);
  // One docked bar at a time on /estimate: the send bar gives up the dock while the planner
  // below the form is open and on screen, without moving anything (the spacer hands its room to the bar).
  assert.match(source, /document\.querySelector<HTMLElement>\("\[data-quote-dock-yield\]"\)/);
  assert.match(source, /suspendDock=\{dockYielded\}/);
  const bar = readFileSync(new URL("../components/estimate/wizard/WizardActionBar.tsx", import.meta.url), "utf8");
  assert.match(bar, /const docked = pinned && !suspendDock && /);
  assert.match(bar, /height: suspendDock \? 0 : barHeight/);
  assert.match(readFileSync(new URL("../app/estimate/page.tsx", import.meta.url), "utf8"), /className="estimate-planner[^"]*"[^>]*data-quote-dock-yield=""/);

  // After sending: the thanks, ONE sentence ending "Nothing else is needed.",
  // one quiet toggle that starts closed (a native details with no open
  // attribute) holding the attachment tile, no "Skip", and one call line.
  const disclosure = followUp.indexOf('<details className={QUIET_TOGGLE_CLASS} data-testid="quote-details-disclosure">');
  assert.ok(disclosure > 0, "the optional details sit behind a closed quiet toggle");
  assert.ok(followUp.indexOf("<AttachmentTile", disclosure) > disclosure && followUp.indexOf("<AttachmentTile", disclosure) < followUp.indexOf("</details>", disclosure));
  assert.match(followUp, /Add photos, plans or details \(optional\)/);
  assert.doesNotMatch(followUp, /button-skip-details/);
  // The details never re-ask what the first screen has: no address field when one was given.
  assert.match(followUp, /\{hasAddress \? null : \(\s*<div>\s*<label htmlFor=\{`\$\{idPrefix\}-d-address`\}/);
  assert.match(followUp, /if \(!hasAddress && address\.trim\(\)\) fields\.address = address\.trim\(\);/);
  const allSet = followUp.slice(followUp.indexOf('data-testid="quote-all-set"'));
  assert.match(allSet.slice(0, allSet.indexOf("</p>")), /Nothing else is needed\.\s*$/);
  assert.equal(followUp.slice(followUp.indexOf("return (\n    // data-family-bar-yield")).match(/Nothing else is needed\./g)?.length, 1);
  assert.doesNotMatch(followUp, /You are all set|Answer any of these|<ol|<ul/);
  assert.equal(followUp.match(/SITE_CONFIG\.phoneHref/g)?.length, 1, "one call line after sending");
  assert.doesNotMatch(followUp.slice(followUp.indexOf("return (\n    // data-family-bar-yield")), /border-t|border-b|bg-foreground/);
  // Default reply channel is a text (the site has a text line).
  assert.match(source, /const DEFAULT_REACH: Reach = "text";/);
});

test("details token: issued for one request, verified, and refused when tampered, moved or expired", () => {
  const now = Date.UTC(2026, 10, 1, 12, 0, 0);
  const issued = issueDetailsToken(REQUEST_ID, SECRET, now);
  assert.ok(issued);
  assert.match(issued!.token, /^\d{10}\.[A-Za-z0-9_-]{43}$/);
  assert.equal(new Date(issued!.expiresAt).getTime(), now + DETAILS_TOKEN_TTL_SECONDS * 1000);
  assert.equal(verifyDetailsToken(REQUEST_ID, issued!.token, SECRET, now), "ok");
  assert.equal(verifyDetailsToken(REQUEST_ID, issued!.token, SECRET, now + DETAILS_TOKEN_TTL_SECONDS * 1000 - 1), "ok");
  assert.equal(verifyDetailsToken(REQUEST_ID, issued!.token, SECRET, now + DETAILS_TOKEN_TTL_SECONDS * 1000 + 1), "expired");
  assert.equal(verifyDetailsToken("consultation:44444444-4444-4444-8444-444444444444", issued!.token, SECRET, now), "invalid");
  assert.equal(verifyDetailsToken(REQUEST_ID, issued!.token, "another-secret-of-enough-length-000", now), "invalid");
  const [exp, sig] = issued!.token.split(".");
  assert.equal(verifyDetailsToken(REQUEST_ID, `${Number(exp) + 3600}.${sig}`, SECRET, now), "invalid", "a longer expiry is not accepted");
  assert.equal(verifyDetailsToken(REQUEST_ID, "", SECRET, now), "invalid");
  assert.equal(issueDetailsToken(REQUEST_ID, null, now), null, "no secret, no Step 2");
  assert.equal(verifyDetailsToken(REQUEST_ID, issued!.token, null, now), "invalid");
});

test("the consultation route returns the details token on accept and on replay", () => {
  const source = readFileSync(new URL("../app/api/consultation/route.ts", import.meta.url), "utf8");
  assert.equal(source.match(/\.\.\.detailsKey\(/g)?.length, 2);
  assert.match(source, /submissionKind: "initial"/);
});

test("details merge never overwrites a Step 1 answer with a blank, and fills only defaults", () => {
  const existing = {
    projectType: "other",
    zip: "",
    address: null,
    city: null,
    email: "avery@example.com",
    message: "How to reach them: Text me.\n\nPantry wall",
  };
  const at = new Date(Date.UTC(2026, 10, 1, 18, 5));
  const merge = mergeDetails(
    existing,
    { projectType: "kitchen", address: "123 Main St, Boise, ID 83702", timing: "1 to 3 months", email: "other@example.com" },
    [],
    at,
  );
  assert.equal(merge.set.projectType, "kitchen", "a default project type is filled");
  assert.equal(merge.set.address, "123 Main St, Boise, ID 83702");
  assert.equal(merge.set.zip, "83702");
  assert.equal(merge.set.city, "Boise");
  assert.equal(merge.set.email, undefined, "the Step 1 email is kept");
  assert.equal(
    merge.set.message,
    "How to reach them: Text me.\n\nPantry wall\n\nDETAILS ADDED (2026-11-01 18:05 UTC):\nProject type: Kitchen\nAddress: 123 Main St, Boise, ID 83702\nTiming: 1 to 3 months\nEmail: other@example.com",
  );

  const chosen = mergeDetails({ ...existing, projectType: "cabinet-project: Pantry wall", zip: "83646", address: "9 Elm" }, { projectType: "closet", address: "", timing: undefined });
  assert.equal(chosen.set.projectType, undefined, "a visitor's own project type is not replaced");
  assert.equal(chosen.set.address, undefined);
  assert.equal(chosen.set.zip, undefined);
  assert.match(chosen.block, /Project type: Closet or storage/);

  const callback = mergeDetails({ ...existing, projectType: "Callback request", email: "" }, { email: "new@example.com" });
  assert.equal(callback.set.email, "new@example.com", "an empty Step 1 email is filled");

  const blank = mergeDetails(existing, { address: "   ", email: "" });
  assert.deepEqual(blank.set, {}, "blanks change nothing");
  assert.equal(blank.block, "");
});

test("details merge is idempotent: the same answers and files share one key", () => {
  const a = detailsDigest({ timing: "Soon", address: "83702" }, ["b", "a"]);
  const b = detailsDigest({ address: " 83702 ", timing: "Soon", email: "" }, ["a", "b", "a"]);
  assert.equal(a, b);
  assert.notEqual(a, detailsDigest({ timing: "Soon" }, ["a", "b"]));
  assert.equal(detailsSubmissionId(REQUEST_ID, a), detailsSubmissionId(REQUEST_ID, b));
  assert.match(detailsSubmissionId(REQUEST_ID, a), /^consultation-details:consultation:33333333-3333-4333-8333-333333333333:[0-9a-f]{32}$/);
  const route = readFileSync(new URL("../app/api/consultation/details/route.ts", import.meta.url), "utf8");
  assert.match(route, /onConflictDoNothing\(\{ target: submissions\.id \}\)/);
  assert.match(route, /if \(!inserted\.length\) return \{ status: "replayed" as const \}/);
  assert.ok(route.indexOf('status: "replayed"') < route.indexOf("forwardConsultationToP5Intake("), "a replay forwards nothing");
});

test("details body: only known fields and real file ids are accepted", () => {
  const ok = detailsBodySchema.safeParse({
    requestId: REQUEST_ID,
    token: "1.x",
    fields: { projectType: "kitchen", timing: "Soon", bestTime: "Morning", address: "83702", email: "" },
    fileIds: ["11111111-1111-4111-8111-111111111111"],
  });
  assert.equal(ok.success, true);
  assert.equal(detailsBodySchema.safeParse({ requestId: REQUEST_ID, token: "t", fields: { budget: "$1" } }).success, false);
  assert.equal(detailsBodySchema.safeParse({ requestId: REQUEST_ID, token: "t", fields: { timing: "Tomorrow" } }).success, false);
  assert.equal(detailsBodySchema.safeParse({ requestId: REQUEST_ID, token: "t", fileIds: ["../etc/passwd"] }).success, false);
  assert.equal(detailsBodySchema.safeParse({ requestId: REQUEST_ID, token: "t", fields: { email: "not an email" } }).success, false);
  assert.deepEqual(splitAddress("83702"), { address: "", zip: "83702", city: "" });
});

test("file rules: photos and PDFs within the real limits, HEIC by extension, plain refusals", () => {
  assert.equal(QUOTE_FILE_MAX_COUNT, 10);
  assert.equal(QUOTE_FILE_MAX_BYTES, 20 * 1024 * 1024);
  assert.equal(QUOTE_FILE_HINT, "Photos, PDFs or drawings. Up to 10 files, 20 MB each.");
  assert.deepEqual(checkQuoteFile({ name: "kitchen.jpg", type: "image/jpeg", size: 1000 }), { ok: true, contentType: "image/jpeg" });
  assert.equal(resolveQuoteFileType("IMG_0001.HEIC", ""), "image/heic");
  assert.equal(resolveQuoteFileType("plan.pdf", "application/octet-stream"), "application/pdf");
  assert.equal(resolveQuoteFileType("logo.svg", "image/svg+xml"), null);
  assert.equal(resolveQuoteFileType("bid.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"), null);
  const big = checkQuoteFile({ name: "scan.pdf", type: "application/pdf", size: QUOTE_FILE_MAX_BYTES + 1 });
  assert.equal(big.ok, false);
  assert.equal(!big.ok && big.reason, "size");
  assert.match(!big.ok ? big.message : "", /^scan\.pdf was not added\. It is 20 MB; the limit is 20 MB per file\.$/);
  const svg = checkQuoteFile({ name: "logo.svg", type: "image/svg+xml", size: 10 });
  assert.equal(!svg.ok && svg.message, "logo.svg was not added. Attach photos or PDFs only.");
  assert.equal(checkQuoteFile({ name: "empty.png", type: "image/png", size: 0 }).ok, false);
});

test("file bytes decide: a renamed page is refused, real photos and PDFs pass", () => {
  const pdf = new TextEncoder().encode("%PDF-1.7\n1 0 obj\n");
  const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10]);
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const heic = Uint8Array.from([0, 0, 0, 0x18, ...new TextEncoder().encode("ftypheic"), 0, 0, 0, 0]);
  const html = new TextEncoder().encode("<html><script>alert(1)</script>");
  assert.equal(sniffContentType(pdf), "application/pdf");
  assert.equal(sniffContentType(jpeg), "image/jpeg");
  assert.equal(sniffContentType(png), "image/png");
  assert.equal(sniffContentType(heic), "image/heic");
  assert.equal(sniffContentType(html), null);
  const passed = checkUploadedFile({ name: "plans.pdf", type: "application/pdf", size: pdf.length }, pdf);
  assert.equal(passed.ok, true);
  assert.equal(passed.ok && passed.contentType, "application/pdf");
  assert.equal(passed.ok && passed.sha256.length, 64);
  const renamed = checkUploadedFile({ name: "photo.jpg", type: "image/jpeg", size: html.length }, html);
  assert.equal(renamed.ok, false);
  assert.equal(!renamed.ok && renamed.status, 415);
  assert.equal(cleanFileName('../../a"b<c>.pdf'), "abc.pdf");
});

test("file links are signed and unguessable", () => {
  const id = "11111111-1111-4111-8111-111111111111";
  const url = signedFileUrl(id, SECRET, "https://boisecabinet.co");
  assert.match(url!, /^https:\/\/boisecabinet\.co\/api\/consultation\/files\/11111111-1111-4111-8111-111111111111\?sig=[A-Za-z0-9_-]{32}$/);
  const sig = new URL(url!).searchParams.get("sig");
  assert.equal(verifyFileSignature(id, sig, SECRET), true);
  assert.equal(verifyFileSignature("22222222-2222-4222-8222-222222222222", sig, SECRET), false);
  assert.equal(verifyFileSignature(id, null, SECRET), false);
  assert.equal(verifyFileSignature(id, sig, null), false);
  assert.equal(signedFileUrl(id, null), null);
});

test("p5 intake, Step 1: external_id, submission_kind, request_kind, contact_preference and best_time", () => {
  const request = buildP5IntakeBody({
    name: "Avery Sample",
    phone: "(208) 555-0142",
    email: "",
    projectType: "other",
    message: "How to reach them: Text me.\n\nPantry wall",
    inquiryId: REQUEST_ID,
    requestKind: "request",
    contactPreference: "text",
    bestTime: null,
    submissionKind: "initial",
  });
  assert.equal(request.external_id, `boisecabinet-consultation:${REQUEST_ID}`);
  assert.equal(request.externalLeadId, request.external_id, "today's p5 dedupes on the same id");
  assert.equal(request.submission_kind, "initial");
  assert.equal(request.request_kind, "quote");
  assert.equal(request.contact_preference, "text");
  assert.equal(request.best_time, undefined);
  assert.equal(request.files, undefined);

  const callback = buildP5IntakeBody({
    name: "Jordan Sample",
    phone: "208-555-0177",
    projectType: "Callback request",
    message: "CALLBACK REQUEST: please call 208-555-0177. Best time to call: Morning.",
    inquiryId: REQUEST_ID,
    requestKind: "callback",
    contactPreference: "call",
    bestTime: "Morning",
    submissionKind: "initial",
  });
  assert.equal(callback.request_kind, "callback");
  assert.equal(callback.best_time, "Morning");
  assert.match(String(callback.summary), /^CALLBACK REQUEST: please call/);
});

test("p5 intake, Step 2: submission_kind details, the same external_id, only what was given, and file links", () => {
  const body = buildP5DetailsBody({
    name: "Avery Sample",
    email: "avery@example.com",
    phone: "(208) 555-0142",
    inquiryId: REQUEST_ID,
    requestKind: "request",
    contactPreference: "text",
    projectType: "kitchen",
    address: "123 Main St, Boise, ID 83702",
    zip: "83702",
    city: "Boise",
    timeline: "1 to 3 months",
    bestTime: null,
    files: [{ name: "kitchen.jpg", url: "https://boisecabinet.co/api/consultation/files/x?sig=y", contentType: "image/jpeg", size: 2048 }],
    lines: ["Project type: Kitchen", "Timing: 1 to 3 months", "Files (1):", "- kitchen.jpg (2 KB): https://boisecabinet.co/api/consultation/files/x?sig=y"],
  });
  assert.equal(body.submission_kind, "details");
  assert.equal(body.external_id, `boisecabinet-consultation:${REQUEST_ID}`);
  assert.equal(body.brand, "Boise Cabinet Co");
  assert.equal(body.projectType, "Kitchen cabinets");
  assert.equal(body.address, "123 Main St, Boise, ID 83702");
  assert.equal(body.city, "Boise");
  assert.equal(body.timeline, "1 to 3 months");
  assert.equal(body.request_kind, "quote");
  assert.equal(body.contact_preference, "text");
  assert.deepEqual(body.files, [{ name: "kitchen.jpg", url: "https://boisecabinet.co/api/consultation/files/x?sig=y", contentType: "image/jpeg", size: 2048 }]);
  assert.match(String(body.summary), /^Details added\nProject type: Kitchen\nTiming: 1 to 3 months\nFiles \(1\):\n- kitchen\.jpg/);
  assert.ok(JSON.stringify(body).length < 32 * 1024, "fits the p5 intake body limit");
});

test("Step 2 analytics: one conversion at Step 1, lead_details_added with counts only", () => {
  for (const file of ["../components/ConsultationForm.tsx", "../components/marketing/KitchenCabinetsQuoteForm.tsx"]) {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.equal(source.match(/trackGoogleAdsLeadOnce\(/g)?.length, 1, `${file}: one lead conversion`);
    assert.match(source, /track\("lead_details_added", \{ form: "[a-z_]+", fields_count: fields, files_count: files \}\)/);
  }
  const followUp = readFileSync(new URL("../components/quote/QuoteFollowUp.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(followUp, /trackGoogleAdsLead|generate_lead|trackMetaLead/);
});

test("consultation_files: the runtime setup and the migration are the same additive statements", async () => {
  const { assertAdditiveSql } = await import("../scripts/p5-schema-safety.mjs");
  const normalize = (text: string) => text.replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")").trim();
  const migration = readFileSync(new URL("../migrations/0002_consultation_files.sql", import.meta.url), "utf8");
  assertAdditiveSql(migration, "0002_consultation_files.sql");
  const fromMigration = migration
    .replace(/--[^\n]*\n/g, "")
    .split(";")
    .map(normalize)
    .filter(Boolean);
  const runtime = readFileSync(new URL("../server/services/consultationFileStore.ts", import.meta.url), "utf8");
  const fromRuntime = [...runtime.matchAll(/sql`(CREATE[\s\S]*?)`/g)].map((m) => normalize(m[1]));
  assert.deepEqual(fromRuntime, fromMigration);
  for (const statement of fromRuntime) assertAdditiveSql(statement, "consultationFileStore");
});

test("Step 1 keeps a send problem on screen and lets the same request be sent again", () => {
  const source = readFileSync(new URL("../components/quote/QuoteRequestForm.tsx", import.meta.url), "utf8");
  // Only the missing-fields list clears itself once the fields are fixed.
  assert.match(source, /if \(summary && summaryKind === "check" && checked && ready && !submitting\) setSummary\(""\);/);
  // An unconfirmed receipt does not lock the form: the retry replays the same key and body.
  const receipt = source.slice(source.indexOf("receipt = requireConsultationReceipt(body);"), source.indexOf("attempt.confirmed();\n      if (persistKey)"));
  assert.doesNotMatch(receipt, /setLocked\(true\)/);
  // Blur errors wait a moment so the send click is not moved out from under the pointer.
  assert.match(source, /window\.setTimeout\(\(\) => setTouched/);
  assert.doesNotMatch(source, /onBlur=\{\(\) => setTouched/);
  // Typing done before hydration is kept.
  assert.match(source, /typed\(ids\.project\)/);
});
