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

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: entry.width >= 1200 ? "1792x1024" : "1024x1024",
      response_format: "b64_json",
    }),
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

async function main() {
  console.log(`Processing ${entries.length} entries...`);
  for (const entry of entries) {
    try {
      await generate(entry);
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    } catch (err) {
      console.error(err.message);
    }
  }
  console.log("Done.");
}

main();
