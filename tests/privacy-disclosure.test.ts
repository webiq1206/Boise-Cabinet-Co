import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = new URL("..", import.meta.url);
const privacy = readFileSync(new URL("../app/privacy-policy/page.tsx", import.meta.url), "utf8").replace(
  /&apos;/g,
  "'",
);

test("the privacy page states the approved analytics disclosures", () => {
  assert.match(
    privacy,
    /When you successfully submit a form or finish the estimator with your contact details, our site passes whichever of these you provide \(your email address, phone number, first name, last name and ZIP code\) to Google's advertising tag, which converts them into a scrambled code \(a SHA-256 hash\) before sending them to Google\. Google matches that code against its own records to tell us which of our ads lead to inquiries\. We do not send your street address or your project description to Google\. Google Analytics receives only the type of project you choose \(for example, cabinet installation or new cabinets\) when you use the estimator\. Google Ads receives a random reference number for your inquiry so each lead is counted only once\./,
  );
  assert.doesNotMatch(privacy, /We do not currently send your name, email, phone number, address or project description to Google/);
  assert.match(
    privacy,
    /Calls from our site or ads may be routed through a Google forwarding number so we can measure which ads lead to calls\./,
  );
  assert.match(
    privacy,
    /We also use Microsoft Clarity to see how visitors use our pages through heatmaps and session recordings; form fields are masked so what you type is not recorded\. Microsoft processes this under its own privacy statement/,
  );
  assert.match(privacy, /https:\/\/privacy\.microsoft\.com\/privacystatement/);
  assert.match(
    privacy,
    /Meta's pixel may also record which buttons you click and basic information about the page, such as its title\./,
  );
  assert.match(
    privacy,
    /hashed email, a hashed phone number, a hashed first name, a hashed last name, a hashed ZIP code/,
  );
  assert.doesNotMatch(privacy, /advanced matching/i);
  assert.doesNotMatch(privacy, /or send an inquiry/);
});

test("Google Ads reference number is stated immediately after the Google Analytics sentence", () => {
  assert.match(
    privacy,
    /when you use the estimator\. Google Ads receives a random reference number for your inquiry so each lead is counted only once\./,
  );
});

test("the consultation success screen is masked on every page that renders it", () => {
  const source = readFileSync(new URL("../components/consultation/ConsultationFields.tsx", import.meta.url), "utf8");
  const successAt = source.indexOf('data-testid="consultation-success"');
  assert.ok(successAt !== -1);
  const opening = source.slice(Math.max(0, successAt - 180), successAt + 80);
  assert.match(opening, /data-clarity-mask="True"/);
  assert.match(source, /consultationReferenceId\(\)/);
  assert.doesNotMatch(source, /lead-\$\{Date\.now\(\)/);
  for (const page of ["app/page.tsx", "app/contact/page.tsx", "app/services/cabinet-installation/page.tsx"]) {
    const pageSource = readFileSync(new URL(`../${page}`, import.meta.url), "utf8");
    assert.match(pageSource, /<ConsultationForm\s*\/>/, page);
  }
});

test("the live assistant transcript is masked", () => {
  const source = readFileSync(new URL("../components/assistant/AssistantWidget.tsx", import.meta.url), "utf8");
  assert.match(source, /<div ref=\{listRef\}[^>]*data-clarity-mask="True"/);
});

function nativeTags(text: string): string[] {
  const tags: string[] = [];
  const re = /<(input|textarea|select)\b/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    let j = match.index;
    let depth = 0;
    let quote: string | null = null;
    while (j < text.length) {
      const c = text[j];
      if (quote) {
        if (c === "\\") {
          j += 2;
          continue;
        }
        if (c === quote) quote = null;
        j += 1;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") {
        quote = c;
        j += 1;
        continue;
      }
      if (c === "{") depth += 1;
      else if (c === "}" && depth) depth -= 1;
      else if (c === ">" && depth === 0) {
        j += 1;
        break;
      }
      j += 1;
    }
    tags.push(text.slice(match.index, j));
  }
  return tags;
}

test("every brand-owned form field sets data-clarity-mask=\"True\"", () => {
  const manifest = JSON.parse(readFileSync(new URL("../lib/p5/shared-manifest.json", import.meta.url), "utf8")) as {
    files: Record<string, string>;
  };
  const shared = new Set(Object.keys(manifest.files));
  const missing: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (name === "node_modules" || name === ".next" || name === "tests" || name === "e2e") continue;
      const info = statSync(path);
      if (info.isDirectory()) {
        walk(path);
        continue;
      }
      if (!/\.(tsx|ts|jsx|html)$/.test(name)) continue;
      const rel = path.slice(root.pathname.length).replace(/^\//, "");
      if (shared.has(rel)) continue;
      const text = readFileSync(path, "utf8");
      nativeTags(text).forEach((tag, index) => {
        if (!tag.includes('data-clarity-mask="True"')) missing.push(`${rel} #${index + 1}: ${tag.slice(0, 80)}`);
      });
    }
  };
  walk(root.pathname);
  assert.deepEqual(missing, []);

  for (const file of ["components/ui/input.tsx", "components/ui/textarea.tsx"]) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.match(source, /\{\.\.\.props\}\s*data-clarity-mask="True"/, file);
  }
});

test("clarity masks every form field before the tag loads", () => {
  const source = readFileSync(new URL("../components/seo/MicrosoftClarity.tsx", import.meta.url), "utf8");
  const snippet = source.match(/const CLARITY_SNIPPET = `([\s\S]*?)`/);
  assert.ok(snippet, "clarity snippet");
  const script = snippet[1].replace(/\$\{CLARITY_ID\}/g, "x5wv0z61ij");

  class El {
    tagName: string;
    children: El[] = [];
    parentElement: El | null = null;
    parentNode: El | null = null;
    attrs: Record<string, string> = {};
    src = "";
    constructor(tag: string) {
      this.tagName = tag.toUpperCase();
    }
    setAttribute(name: string, value: string) {
      this.attrs[name] = value;
      if (name === "src") this.src = value;
    }
    getAttribute(name: string) {
      return Object.prototype.hasOwnProperty.call(this.attrs, name) ? this.attrs[name] : null;
    }
    appendChild(child: El) {
      child.parentElement = this;
      child.parentNode = this;
      this.children.push(child);
      return child;
    }
    insertBefore(node: El, ref: El | null) {
      node.parentElement = this;
      node.parentNode = this;
      const index = ref ? this.children.indexOf(ref) : -1;
      if (index < 0) this.children.push(node);
      else this.children.splice(index, 0, node);
      return node;
    }
    querySelectorAll(selector: string): El[] {
      const found: El[] = [];
      const visit = (el: El) => {
        for (const child of el.children) {
          if (matches(child, selector)) found.push(child);
          visit(child);
        }
      };
      visit(this);
      return found;
    }
    querySelector(selector: string) {
      return this.querySelectorAll(selector)[0] ?? null;
    }
  }

  function matchSimple(el: El, part: string) {
    if (part.includes("src*=")) {
      const src = el.attrs.src || el.src || "";
      return el.tagName === "SCRIPT" && src.includes("clarity.ms/tag/");
    }
    const attr = part.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
    if (attr) {
      if (attr[2] === undefined) return el.getAttribute(attr[1]) !== null;
      return el.getAttribute(attr[1]) === attr[2];
    }
    if (/^[a-z]+$/i.test(part)) return el.tagName === part.toUpperCase();
    return false;
  }
  function splitOutsideQuotes(value: string, separator: string) {
    const parts: string[] = [];
    let current = "";
    let quote: string | null = null;
    for (const char of value) {
      if (quote) {
        current += char;
        if (char === quote) quote = null;
        continue;
      }
      if (char === '"' || char === "'") {
        quote = char;
        current += char;
        continue;
      }
      if (char === separator) {
        if (current.trim()) parts.push(current);
        current = "";
        continue;
      }
      current += char;
    }
    if (current.trim()) parts.push(current);
    return parts;
  }
  function matches(el: El, selector: string) {
    return splitOutsideQuotes(selector, ",").some((group) => {
      const parts = splitOutsideQuotes(group, " ").filter(Boolean);
      if (!parts.length || !matchSimple(el, parts[parts.length - 1])) return false;
      let node: El | null = el.parentElement;
      for (let index = parts.length - 2; index >= 0; index -= 1) {
        while (node && !matchSimple(node, parts[index])) node = node.parentElement;
        if (!node) return false;
        node = node.parentElement;
      }
      return true;
    });
  }

  const doc = new El("HTML");
  const head = new El("HEAD");
  const body = new El("BODY");
  doc.appendChild(head);
  doc.appendChild(body);
  const form = new El("FORM");
  const nested = new El("DIV");
  const nestedBox = new El("INPUT");
  nestedBox.setAttribute("type", "checkbox");
  nested.appendChild(nestedBox);
  form.appendChild(nested);
  const loose = new El("DIV");
  const looseBox = new El("INPUT");
  looseBox.setAttribute("type", "checkbox");
  loose.appendChild(looseBox);
  const rangeWrap = new El("DIV");
  const range = new El("INPUT");
  range.setAttribute("type", "range");
  rangeWrap.appendChild(range);
  const text = new El("INPUT");
  text.setAttribute("type", "text");
  const area = new El("TEXTAREA");
  const select = new El("SELECT");
  const thread = new El("DIV");
  thread.setAttribute("data-p5-thread", "");
  const userEcho = new El("DIV");
  userEcho.setAttribute("data-role", "user");
  const captured = new El("DD");
  const overview = new El("SECTION");
  overview.setAttribute("aria-label", "Project overview");
  const suggestions = new El("UL");
  suggestions.setAttribute("aria-label", "Address suggestions");
  const emailed = new El("DIV");
  emailed.setAttribute("data-testid", "p5-wait-choice");
  thread.appendChild(userEcho);
  thread.appendChild(captured);
  thread.appendChild(overview);
  thread.appendChild(suggestions);
  thread.appendChild(emailed);
  body.appendChild(form);
  body.appendChild(loose);
  body.appendChild(rangeWrap);
  body.appendChild(text);
  body.appendChild(area);
  body.appendChild(select);
  body.appendChild(thread);

  let scriptEl: El | null = null;
  const documentFake = {
    readyState: "complete",
    documentElement: doc,
    head,
    body,
    querySelector: (selector: string) => doc.querySelector(selector),
    querySelectorAll: (selector: string) => doc.querySelectorAll(selector),
    createElement: (tag: string) => {
      const el = new El(tag);
      if (tag.toLowerCase() === "script") scriptEl = el;
      return el;
    },
    getElementsByTagName: (tag: string) => doc.querySelectorAll(tag),
  };
  const windowFake = {
    addEventListener() {},
    document: documentFake,
  };
  let observer: { cb: (records: Array<Record<string, unknown>>) => void } | null = null;
  const PreviousObserver = globalThis.MutationObserver;
  globalThis.MutationObserver = class {
    cb: (records: Array<Record<string, unknown>>) => void;
    constructor(cb: (records: Array<Record<string, unknown>>) => void) {
      this.cb = cb;
      observer = this;
    }
    observe() {}
    disconnect() {}
  } as unknown as typeof MutationObserver;

  try {
    const run = new Function("window", "document", "MutationObserver", script);
    run(windowFake, documentFake, globalThis.MutationObserver);
  } finally {
    globalThis.MutationObserver = PreviousObserver;
  }

  for (const field of [form, nestedBox, looseBox, range, text, area, select, thread, userEcho, captured, overview, suggestions, emailed]) {
    assert.equal(field.getAttribute("data-clarity-mask"), "True", field.tagName);
  }
  assert.equal(loose.getAttribute("data-clarity-mask"), "True");
  assert.equal(rangeWrap.getAttribute("data-clarity-mask"), "True");
  assert.equal(nested.getAttribute("data-clarity-mask"), null);
  assert.ok(scriptEl);
  assert.match(scriptEl.src, /^https:\/\/www\.clarity\.ms\/tag\/x5wv0z61ij$/);
  assert.ok(observer);

  const added = new El("INPUT");
  added.setAttribute("type", "email");
  observer.cb([{ type: "childList", addedNodes: [added] }]);
  assert.equal(added.getAttribute("data-clarity-mask"), "True");

  delete text.attrs["data-clarity-mask"];
  observer.cb([{ type: "attributes", target: text, attributeName: "data-clarity-mask" }]);
  assert.equal(text.getAttribute("data-clarity-mask"), "True");

  const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /<MicrosoftClarity \/>/);
  assert.match(script, /function load\(\)\{\s*watchForms\(\);/);

  const lateEcho = new El("DIV");
  lateEcho.setAttribute("data-role", "user");
  const lateList = new El("UL");
  lateList.setAttribute("aria-label", "Address suggestions");
  observer.cb([{ type: "childList", addedNodes: [lateEcho, lateList] }]);
  assert.equal(lateEcho.getAttribute("data-clarity-mask"), "True");
  assert.equal(lateList.getAttribute("data-clarity-mask"), "True");
});
