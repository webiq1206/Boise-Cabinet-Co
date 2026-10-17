/**
 * GET-only live smoke for supplier names.
 * Not part of CI. Run by hand: LIVE_BASE_URL=https://boisecabinet.co node scripts/guards/live-supplier-smoke.mjs
 *
 * Fetches sitemap routes plus installer, testimonials, and the HTML sitemap;
 * robots, llms, both sitemaps, the feed, and the gallery and testimonials APIs;
 * then every same-origin JS chunk and image URL those responses reference.
 */
import { findHits, loadTerms, snippet } from "./supplier-scan.mjs";

const BASE = (process.env.LIVE_BASE_URL || "https://boisecabinet.co").replace(/\/$/, "");
const rules = loadTerms();
const origin = new URL(BASE).origin;

const EXTRA = [
  "/installer",
  "/testimonials",
  "/sitemap",
  "/robots.txt",
  "/llms.txt",
  "/llms-full.txt",
  "/sitemap.xml",
  "/image-sitemap.xml",
  "/feed.xml",
  "/api/gallery",
  "/api/testimonials",
];

function sameOrigin(raw, base) {
  if (!raw || raw.startsWith("data:") || raw.startsWith("mailto:") || raw.startsWith("javascript:") || raw.startsWith("#")) return null;
  let url;
  try {
    url = new URL(raw, base);
  } catch {
    return null;
  }
  if (url.origin !== origin) return null;
  url.hash = "";
  return url.toString();
}

function referencedAssets(text, pageUrl) {
  const found = new Set();
  const add = (raw) => {
    const url = sameOrigin(raw, pageUrl);
    if (!url) return;
    const path = new URL(url).pathname;
    if (path.includes("/_next/static/") && path.endsWith(".js")) found.add(url);
    if (/\.(webp|png|jpe?g|gif|avif|svg|ico)$/i.test(path)) found.add(url);
  };
  for (const match of text.matchAll(/(?:src|href)=["']([^"']+)["']/gi)) add(match[1]);
  for (const match of text.matchAll(/srcset=["']([^"']+)["']/gi)) {
    for (const part of match[1].split(",")) add(part.trim().split(/\s+/)[0]);
  }
  for (const match of text.matchAll(/\/_next\/static\/[^"'\\\s)>]+/g)) add(match[0]);
  for (const match of text.matchAll(/\/(?:images|generated|downloads)\/[^"'\\\s)>]+/g)) add(match[0]);
  return [...found];
}

async function get(url) {
  const response = await fetch(url, { method: "GET", redirect: "follow" });
  const buffer = Buffer.from(await response.arrayBuffer());
  return {
    url,
    status: response.status,
    type: response.headers.get("content-type") || "",
    buffer,
  };
}

async function pdfText(buffer) {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const task = getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    disableFontFace: true,
    isEvalSupported: false,
  });
  const doc = await task.promise;
  const parts = [];
  const meta = await doc.getMetadata();
  if (meta?.info) parts.push(JSON.stringify(meta.info));
  for (let index = 1; index <= doc.numPages; index++) {
    const page = await doc.getPage(index);
    const content = await page.getTextContent();
    parts.push(content.items.map((item) => ("str" in item ? item.str : "") || "").join(" "));
    page.cleanup();
  }
  await task.destroy();
  return parts.join("\n");
}

async function imageMetadata(buffer) {
  const sharp = (await import("sharp")).default;
  const meta = await sharp(buffer, { failOn: "none" }).metadata();
  return Object.values(meta)
    .map((value) => (Buffer.isBuffer(value) ? value.toString("utf8") : value == null ? "" : typeof value === "string" ? value : JSON.stringify(value)))
    .join("\n");
}

async function bodyText(item) {
  const path = new URL(item.url).pathname;
  if (item.type.includes("pdf") || path.endsWith(".pdf")) return pdfText(item.buffer);
  if (item.type.startsWith("image/") || /\.(webp|png|jpe?g|gif|avif|ico)$/i.test(path)) return imageMetadata(item.buffer);
  return item.buffer.toString("utf8");
}

async function mapPool(items, limit, worker) {
  const queue = [...items];
  const results = [];
  async function run() {
    while (queue.length) {
      const item = queue.shift();
      results.push(await worker(item));
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
  return results;
}

const hits = [];
const pages = new Map();

const sitemap = await get(`${BASE}/sitemap.xml`);
if (sitemap.status !== 200) hits.push(`${sitemap.url}: status ${sitemap.status}`);
const locs = [...sitemap.buffer.toString("utf8").matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((match) => sameOrigin(match[1].trim(), BASE)).filter(Boolean);
const pageUrls = [...new Set([...locs, ...EXTRA.map((path) => sameOrigin(path, BASE))])];

console.log(`live-supplier-smoke ${BASE}`);
console.log(`fetching ${pageUrls.length} routes`);

const pageResults = await mapPool(pageUrls, 6, async (url) => {
  try {
    return await get(url);
  } catch (error) {
    hits.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
});

for (const item of pageResults) {
  if (!item) continue;
  pages.set(item.url, item);
  if (item.status >= 400) hits.push(`${item.url}: status ${item.status}`);
}

const assets = new Set();
for (const item of pages.values()) {
  if (item.type.includes("pdf") || item.type.startsWith("image/")) continue;
  for (const url of referencedAssets(item.buffer.toString("utf8"), item.url)) assets.add(url);
}
for (const url of [...assets]) if (pages.has(url)) assets.delete(url);

console.log(`fetching ${assets.size} js chunks and images`);
const assetResults = await mapPool([...assets], 6, async (url) => {
  try {
    return await get(url);
  } catch (error) {
    hits.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
});

const documents = [...pages.values(), ...assetResults.filter(Boolean)];
for (const item of documents) {
  let text = "";
  try {
    text = await bodyText(item);
  } catch (error) {
    hits.push(`${item.url}: unreadable (${error instanceof Error ? error.message : String(error)})`);
    continue;
  }
  for (const hit of findHits(text, rules)) {
    hits.push(`${item.url}: ${hit.kind} ${JSON.stringify(snippet(text, hit.index, hit.match))}`);
  }
  for (const hit of findHits(item.url, rules)) {
    hits.push(`${item.url}: path ${hit.kind} ${JSON.stringify(hit.match)}`);
  }
}

const unique = [...new Set(hits)];
if (unique.length === 0) {
  console.log("0 hits");
  process.exit(0);
}
console.error(`${unique.length} hits`);
for (const line of unique.slice(0, 200)) console.error(line);
if (unique.length > 200) console.error(`... ${unique.length - 200} more`);
process.exit(1);
