import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { AFTER_FIRST_INTERACTION, THIRD_PARTY_FALLBACK_MS } from "../lib/analytics/afterFirstInteraction.ts";
import { buildPixelBootstrap } from "../lib/analytics/metaPixelBootstrap.ts";

// Owner rule (Phase 5 QA): no third-party script before interaction except gtag. Meta Pixel and
// Microsoft Clarity load after the first pointerdown, keydown, scroll or touchstart, or no sooner
// than 5 seconds after the load event, while Meta events queue from the start.

type Listener = () => void;
function fakeBrowser(readyState: "loading" | "complete") {
  const listeners = new Map<string, Listener[]>();
  const timers: { fn: Listener; ms: number }[] = [];
  const inserted: { src: string; async: boolean }[] = [];
  const anchor = { parentNode: { insertBefore: (node: { src: string; async: boolean }) => inserted.push(node) } };
  const document = {
    readyState,
    head: { appendChild: (node: { src: string; async: boolean }) => inserted.push(node) },
    createElement: () => ({ src: "", async: false }),
    getElementsByTagName: () => [anchor],
  };
  const window: Record<string, unknown> = {
    addEventListener: (type: string, fn: Listener) => listeners.set(type, [...(listeners.get(type) ?? []), fn]),
    removeEventListener: (type: string, fn: Listener) => listeners.set(type, (listeners.get(type) ?? []).filter((f) => f !== fn)),
    setTimeout: (fn: Listener, ms: number) => timers.push({ fn, ms }),
  };
  const context = vm.createContext({ window, document });
  const fire = (type: string) => [...(listeners.get(type) ?? [])].forEach((fn) => fn());
  return { context, window, document, timers, inserted, fire, listeners };
}

test("the gate runs its callback once, on the first interaction", () => {
  for (const event of ["pointerdown", "keydown", "scroll", "touchstart"]) {
    const b = fakeBrowser("complete");
    vm.runInContext(`window.runs=0;(${AFTER_FIRST_INTERACTION})(function(){window.runs++;});`, b.context);
    assert.equal(b.window.runs, 0, `${event}: nothing runs before interaction`);
    b.fire(event);
    assert.equal(b.window.runs, 1, event);
    b.fire("pointerdown");
    b.fire("keydown");
    b.timers.forEach((t) => t.fn());
    assert.equal(b.window.runs, 1, `${event}: runs exactly once`);
  }
});

test("without interaction the gate waits at least 5 seconds after the load event", () => {
  assert.ok(THIRD_PARTY_FALLBACK_MS >= 5000);
  const loading = fakeBrowser("loading");
  vm.runInContext(`window.runs=0;(${AFTER_FIRST_INTERACTION})(function(){window.runs++;});`, loading.context);
  assert.equal(loading.timers.length, 0, "no timer before the load event");
  loading.fire("load");
  assert.equal(loading.timers.length, 1);
  assert.ok(loading.timers[0].ms >= 5000);
  assert.equal(loading.window.runs, 0);
  loading.timers[0].fn();
  assert.equal(loading.window.runs, 1);
});

test("Meta queues init, PageView and Lead before fbevents.js, which loads only after interaction", () => {
  const b = fakeBrowser("complete");
  vm.runInContext(buildPixelBootstrap("123"), b.context);
  const fbq = b.window.fbq as ((...args: unknown[]) => void) & { queue: unknown[][] };
  assert.equal(typeof fbq, "function");
  assert.deepEqual(JSON.parse(JSON.stringify(fbq.queue.map((args) => Array.from(args)))), [["init", "123"], ["track", "PageView"]]);
  assert.equal(b.inserted.length, 0, "fbevents.js is not requested before interaction");
  fbq("track", "Lead", { content_name: "Consultation request" }, { eventID: "e1" });
  assert.equal(fbq.queue.length, 3, "Lead is queued, not lost");
  b.fire("touchstart");
  assert.equal(b.inserted.length, 1);
  assert.equal(b.inserted[0].src, "https://connect.facebook.net/en_US/fbevents.js");
  assert.equal(b.inserted[0].async, true);
  b.fire("scroll");
  assert.equal(b.inserted.length, 1, "inserted once");
  // A second bootstrap (remount) never adds a second stub or script.
  vm.runInContext(buildPixelBootstrap("123"), b.context);
  assert.equal(b.window.fbq, fbq);
  assert.equal(fbq.queue.length, 3);
});

test("Clarity's snippet, masking included, only runs behind the same gate", () => {
  const source = readFileSync(new URL("../components/seo/MicrosoftClarity.tsx", import.meta.url), "utf8");
  assert.match(source, /`\(\$\{AFTER_FIRST_INTERACTION\}\)\(function\(\)\{\$\{CLARITY_SNIPPET\}\}\);`/);
  const pixel = readFileSync(new URL("../components/seo/MetaPixel.tsx", import.meta.url), "utf8");
  assert.match(pixel, /buildPixelBootstrap\(PIXEL_ID\)/);
  assert.doesNotMatch(pixel, /fbevents\.js/, "the component no longer carries an eager copy of the loader");
});
