/**
 * Generates unique blog hero PNGs via OpenAI Images API.
 *
 * Setup:
 *   export OPENAI_API_KEY=sk-...
 *
 * Usage:
 *   npm run images:generate              # all slugs in blog-image-prompts.json
 *   npm run images:generate -- slug-one  # single slug
 *
 * Output: public/images/blog/{slug}.png
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const blogDir = path.join(root, "public", "images", "blog");
const promptsPath = path.join(__dirname, "blog-image-prompts.json");

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_API_KEY environment variable.");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(promptsPath, "utf8"));
const styleSuffix = config.styleSuffix;
const allSlugs = Object.keys(config.images);
const requested = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const slugs = requested.length > 0 ? requested : allSlugs;

for (const slug of slugs) {
  if (!config.images[slug]) {
    console.error(`Unknown slug: ${slug}`);
    process.exit(1);
  }
}

fs.mkdirSync(blogDir, { recursive: true });

async function generateImage(slug, scenePrompt) {
  const prompt = `${scenePrompt}. ${styleSuffix}`;
  console.log(`Generating ${slug}...`);

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
      size: "1792x1024",
      response_format: "b64_json",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error for ${slug}: ${response.status} ${err}`);
  }

  const data = await response.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error(`No image data returned for ${slug}`);
  }

  const dest = path.join(blogDir, `${slug}.png`);
  fs.writeFileSync(dest, Buffer.from(b64, "base64"));
  console.log(`  Wrote ${dest}`);
}

let generated = 0;
let skipped = 0;

for (const slug of slugs) {
  const dest = path.join(blogDir, `${slug}.png`);
  if (fs.existsSync(dest) && !process.env.FORCE_REGENERATE) {
    console.log(`Skipping ${slug} (exists; set FORCE_REGENERATE=1 to overwrite)`);
    skipped++;
    continue;
  }

  await generateImage(slug, config.images[slug]);
  generated++;

  await new Promise((r) => setTimeout(r, 1500));
}

console.log(`Done: ${generated} generated, ${skipped} skipped.`);
