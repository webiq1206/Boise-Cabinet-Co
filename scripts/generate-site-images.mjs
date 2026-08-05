/**
 * Generates site images via OpenAI Images API from site-image-manifest.json.
 *
 * Setup: export OPENAI_API_KEY=sk-...
 * Usage:
 *   node scripts/generate-site-images.mjs              # all pending
 *   node scripts/generate-site-images.mjs --catalog    # catalog only
 *   node scripts/generate-site-images.mjs img-0001     # single id
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const manifestPath = path.join(root, "scripts", "site-image-manifest.json");

const apiKey = process.env.OPENAI_API_KEY;
const args = process.argv.slice(2);
const catalogOnly = args.includes("--catalog");
const requestedIds = args.filter((a) => !a.startsWith("-"));

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
let entries = manifest.entries.filter((e) => e.status === "pending");

if (catalogOnly) {
  entries = entries.filter((e) =>
    (e.outputPath || "").includes("/catalog/") ||
    (e.placement || "").match(/hero|card-hero|swatch|profile/)
  );
}
if (requestedIds.length > 0) {
  entries = entries.filter((e) => requestedIds.includes(e.id));
}

if (!apiKey) {
  console.error("Missing OPENAI_API_KEY. Run scripts/sync-marketing-images.mjs and generate-finish-swatches.mjs for local assets.");
  process.exit(requestedIds.length > 0 ? 1 : 0);
}

async function generate(entry) {
  const prompt = `${entry.promptScene}. ${manifest.styleSuffix}`;
  console.log(`Generating ${entry.id}: ${entry.outputPath}`);

  const response = await requestWithRetry({
    // gpt-image-1 replaced dall-e-3's images API: it returns b64_json by
    // default (no `response_format`), supports `output_format`, and uses a
    // different size set (1536x1024 landscape / 1024x1024 square).
    model: "gpt-image-1",
    prompt,
    n: 1,
    size: entry.width >= 1200 ? "1536x1024" : "1024x1024",
    output_format: "webp",
  });

  if (!response.ok) {
    throw new Error(`OpenAI error ${entry.id}: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error(`No image for ${entry.id}`);

  const dest = path.join(root, "public", entry.outputPath.replace(/^\//, ""));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(b64, "base64"));
  entry.status = "generated";
  console.log(`  Wrote ${dest}`);
}

// Retries transient rate-limit (429) and server (5xx) responses with exponential
// backoff, so higher concurrency does not lose images to brief throttling.
async function requestWithRetry(body, attempt = 1) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if ((response.status === 429 || response.status >= 500) && attempt <= 5) {
    const waitMs = Math.min(30000, 2000 * 2 ** (attempt - 1));
    await new Promise((r) => setTimeout(r, waitMs));
    return requestWithRetry(body, attempt + 1);
  }
  return response;
}

// Bounded-concurrency worker pool. Default 6; override with IMAGE_GEN_CONCURRENCY.
// Completed images are saved and marked "generated" as they finish, so the run
// is safe to stop and resume (a re-run only processes the remaining pending).
const CONCURRENCY = Math.max(1, Number(process.env.IMAGE_GEN_CONCURRENCY) || 6);

async function main() {
  const total = entries.length;
  console.log(`Processing ${total} entries (concurrency ${CONCURRENCY})...`);
  let next = 0;
  let completed = 0;
  async function worker() {
    while (next < total) {
      const entry = entries[next++];
      try {
        await generate(entry);
      } catch (err) {
        console.error(err.message);
      }
      // Synchronous write is atomic relative to other workers (single thread).
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      completed++;
      if (completed % 10 === 0 || completed === total) {
        console.log(`  Progress: ${completed}/${total}`);
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, total) }, () => worker()),
  );
  console.log("Done.");
}

main();
