import { test } from "node:test";
import assert from "node:assert/strict";
import { createUnsubscribeHandlers } from "../lib/outreach/unsubscribe";

const token = "2ab33d9d-a6a1-42df-8f0e-85779d9dca82";
const url = `https://boisecabinet.co/api/outreach/unsubscribe?token=${token}`;
const options = { businessName: "Boise Cabinet Co", siteUrl: "https://boisecabinet.co" };
const post = (body: BodyInit = new URLSearchParams({ "List-Unsubscribe": "One-Click" })) =>
  new Request(url, { method: "POST", body });

test("link scans display confirmation without touching suppression storage", async () => {
  let writes = 0;
  const handlers = createUnsubscribeHandlers({ ...options, suppress: async () => { writes++; return true; } });
  const response = await handlers.GET(new Request(url));
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<form method="post"/);
  assert.match(html, /Unsubscribe from outreach emails/);
  assert.doesNotMatch(html, /You are unsubscribed/);
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.match(response.headers.get("cache-control")!, /no-store/);
  assert.equal(writes, 0);
});

test("mailbox one-click requests suppress without cookies, redirects or login", async () => {
  const seen = new Set<string>();
  const handlers = createUnsubscribeHandlers({ ...options, suppress: async (value) => { seen.add(value); return true; } });
  for (let i = 0; i < 2; i++) {
    const response = await handlers.POST(post());
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true });
    assert.equal(response.headers.get("location"), null);
  }
  assert.deepEqual([...seen], [token]);
});

test("multipart one-click requests work and human confirmation returns a receipt", async () => {
  const handlers = createUnsubscribeHandlers({ ...options, suppress: async () => true });
  const form = new FormData();
  form.set("List-Unsubscribe", "One-Click");
  assert.equal((await handlers.POST(post(form))).status, 200);
  const response = await handlers.POST(post(new URLSearchParams({ "List-Unsubscribe": "One-Click", source: "manual" })));
  assert.equal(response.status, 200);
  assert.match(await response.text(), /You are unsubscribed/);
});

test("invalid or oversized requests never change recipient preferences", async () => {
  let writes = 0;
  const handlers = createUnsubscribeHandlers({ ...options, suppress: async () => { writes++; return true; } });
  for (const request of [post(""), post("List-Unsubscribe=One-Click"), post(new URLSearchParams({ "List-Unsubscribe": "Wrong" })),
    post(new URLSearchParams([["List-Unsubscribe", "One-Click"], ["List-Unsubscribe", "One-Click"]])),
    post(new URLSearchParams({ "List-Unsubscribe": "One-Click", extra: "x".repeat(20000) })),
    new Request(url + "&token=" + token, { method: "POST", body: new URLSearchParams({ "List-Unsubscribe": "One-Click" }) }),
    new Request(url.replace(token, "invalid"), { method: "POST", body: new URLSearchParams({ "List-Unsubscribe": "One-Click" }) }),
  ]) assert.equal((await handlers.POST(request)).status, 400);
  assert.equal(writes, 0);
});

test("unrecognized tokens and storage failures never claim success", async () => {
  const unknown = createUnsubscribeHandlers({ ...options, suppress: async () => false });
  assert.equal((await unknown.POST(post())).status, 404);
  const unavailable = createUnsubscribeHandlers({ ...options, suppress: async () => { throw new Error("database unavailable"); } });
  const response = await unavailable.POST(post());
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("retry-after"), "60");
  assert.deepEqual(await response.json(), { success: false });
  const human = await unavailable.POST(post(new URLSearchParams({ "List-Unsubscribe": "One-Click", source: "manual" })));
  assert.equal(human.status, 503);
  assert.doesNotMatch(await human.text(), /You are unsubscribed/);
});
