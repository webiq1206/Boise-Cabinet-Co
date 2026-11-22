import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * IndexNow for boisecabinet.co.
 *
 * Build (`node scripts/submit-indexnow.mjs --prepare`) writes the changed
 * URLs while git is available. It does not call the network.
 *
 * The production server, after the new build is serving, posts that list
 * once. Cold starts skip when the same commit was already accepted.
 * CI and pull-request builds never post.
 */

const HOST = "boisecabinet.co";
const ORIGIN = `https://${HOST}`;
const INDEXNOW_KEY = "bf5008c034e54394850021f302ce4416";
const KEY_LOCATION = `${ORIGIN}/${INDEXNOW_KEY}.txt`;
const INDEXNOW_API = "https://api.indexnow.org/indexnow";
const SUBMITTED_KEY = "indexnow_submitted_sha";

const LOCATION_SLUGS = [
  "boise",
  "meridian",
  "nampa",
  "eagle",
  "kuna",
  "caldwell",
  "star",
  "middleton",
  "garden-city",
];

const ROOM_SLUGS = [
  "kitchen",
  "bathroom",
  "laundry",
  "mudroom",
  "home-office",
  "entertainment",
  "built-ins",
  "pantry",
  "closet",
  "garage",
  "outdoor",
  "wet-bar",
  "bedroom",
];

export function deployPingAllowed(env = process.env) {
  if (env.CI || env.GITHUB_ACTIONS) return false;
  if (env.GITHUB_EVENT_NAME === "pull_request") return false;
  if (env.VERCEL_ENV && env.VERCEL_ENV !== "production") return false;
  if (env.NODE_ENV !== "production") return false;
  return env.REPLIT_DEPLOYMENT === "1";
}

function absolute(urlPath) {
  if (!urlPath || urlPath.includes(":") || urlPath.includes("*")) return null;
  if (urlPath.includes("adu") || urlPath.includes("boiseadu")) return null;
  const pathname = urlPath.startsWith("/") ? urlPath.split("?")[0].split("#")[0] : `/${urlPath}`;
  if (pathname.includes("..")) return null;
  return `${ORIGIN}${pathname === "/" ? "/" : pathname.replace(/\/$/, "")}`;
}

export function urlsForChangedFiles(files) {
  const paths = new Set();
  const add = (urlPath) => {
    const url = absolute(urlPath);
    if (url) paths.add(url);
  };
  for (const file of files) {
    const normalized = file.replace(/\\/g, "/");
    if (/adu|boiseadu/i.test(normalized)) continue;
    if (normalized === "app/page.tsx" || normalized === "lib/schema.ts" || normalized === "shared/parentProfiles.ts" || normalized === "shared/homepageFaqs.ts") {
      add("/");
    }
    if (normalized === "app/llms.txt/route.ts" || normalized === "app/llms-full.txt/route.ts" || normalized === "shared/llmsTxt.ts") {
      add("/llms.txt");
      add("/llms-full.txt");
    }
    if (normalized === "app/page.tsx") continue;
    const page = normalized.match(/^app\/(.+)\/page\.tsx$/);
    if (normalized === "app/page.tsx") add("/");
    else if (page && !page[1].includes("[")) add(`/${page[1]}`);
    else if (normalized === "app/locations/[city]/page.tsx" || normalized.startsWith("shared/content/bot05PageCopy") || normalized.startsWith("shared/content/cityCabinetGuides") || normalized === "shared/contentData.ts" || normalized === "shared/serviceArea.ts") {
      for (const slug of LOCATION_SLUGS) add(`/locations/${slug}`);
    } else if (normalized === "app/cabinets/[room]/page.tsx" || normalized.startsWith("shared/catalog/roomSeo")) {
      for (const slug of ROOM_SLUGS) add(`/cabinets/${slug}`);
    } else if (normalized.startsWith("shared/content/wave1/") || normalized === "shared/guideContent.ts") {
      add("/guides/boise-cabinet-cost-guide");
      add("/guides/treasure-valley-cabinet-guide");
    }
  }
  return [...paths];
}

export function redirectUrlsFromDiff(diffText) {
  const urls = new Set();
  const re = /source:\s*(['"`])(\/[^'"`\n]+)\1[\s\S]{0,160}?destination:\s*(['"`])(\/[^'"`\n]+)\3/g;
  for (const match of diffText.matchAll(re)) {
    if (match[2].includes(":") || match[4].includes(":")) continue;
    if (/adu/i.test(match[2]) || /adu/i.test(match[4])) continue;
    const source = absolute(match[2]);
    const destination = absolute(match[4]);
    if (source) urls.add(source);
    if (destination) urls.add(destination);
  }
  return [...urls];
}

function git(args) {
  try {
    return execSync(`git ${args}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

export function buildDeployManifest(options = {}) {
  const sha = options.sha || git("rev-parse HEAD") || "unknown";
  const files = options.files || (git("diff --name-only HEAD~1 HEAD").split("\n").filter(Boolean));
  const diff = options.diffText ?? (files.includes("next.config.js") ? git("diff -U3 HEAD~1 HEAD -- next.config.js") : "");
  const urls = [...new Set([...urlsForChangedFiles(files), ...redirectUrlsFromDiff(diff)])];
  return { sha, host: HOST, urls, postDeploy: true };
}

export function manifestPaths() {
  return [
    path.join(process.cwd(), "indexnow-deploy.json"),
    path.join(process.cwd(), ".next", "standalone", "indexnow-deploy.json"),
    path.join(process.cwd(), ".next", "indexnow-deploy.json"),
  ];
}

export function writeDeployManifest(manifest, destinations = manifestPaths().slice(1)) {
  const body = `${JSON.stringify(manifest, null, 2)}\n`;
  for (const destination of destinations) {
    mkdirSync(path.dirname(destination), { recursive: true });
    writeFileSync(destination, body);
  }
  return destinations;
}

export function readDeployManifest() {
  for (const candidate of manifestPaths()) {
    if (!existsSync(candidate)) continue;
    try {
      return JSON.parse(readFileSync(candidate, "utf8"));
    } catch {
      return null;
    }
  }
  return null;
}

async function storedSha(env) {
  const dbUrl = env.DATABASE_URL || env.PGDATABASE_URL || env.REPLIT_DB_URL;
  if (!dbUrl) return null;
  const pg = await import("pg");
  const Pool = pg.Pool || pg.default?.Pool;
  if (!Pool) return null;
  const pool = new Pool({ connectionString: dbUrl, max: 1, connectionTimeoutMillis: 5000 });
  try {
    const result = await pool.query("SELECT value FROM site_settings WHERE key = $1", [SUBMITTED_KEY]);
    return result.rows[0]?.value ?? null;
  } catch {
    return null;
  } finally {
    await pool.end().catch(() => {});
  }
}

async function rememberSha(env, sha) {
  const dbUrl = env.DATABASE_URL || env.PGDATABASE_URL || env.REPLIT_DB_URL;
  if (!dbUrl) return;
  const pg = await import("pg");
  const Pool = pg.Pool || pg.default?.Pool;
  if (!Pool) return;
  const pool = new Pool({ connectionString: dbUrl, max: 1, connectionTimeoutMillis: 5000 });
  try {
    await pool.query(
      `INSERT INTO site_settings (key, value, updated_at) VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [SUBMITTED_KEY, sha],
    );
  } catch {
    // A missed write only means the next cold start may try again.
  } finally {
    await pool.end().catch(() => {});
  }
}

function logLine(sha, submitted, status) {
  console.log(`[IndexNow] sha=${sha} submitted=${submitted} status=${status}`);
}

/**
 * Post the build's changed URLs once the deployment is serving.
 * @returns {Promise<{submitted: number, status: number | string, sha: string}>}
 */
export async function submitDeployed(options = {}) {
  const env = options.env ?? process.env;
  if (!deployPingAllowed(env)) return { submitted: 0, status: "skipped", sha: "" };
  const manifest = options.manifest ?? readDeployManifest();
  const sha = manifest?.sha || "unknown";
  const urls = Array.isArray(manifest?.urls) ? manifest.urls.filter((url) => typeof url === "string" && url.startsWith(ORIGIN)) : [];
  const already = options.alreadySubmitted ? await options.alreadySubmitted(sha) : (await storedSha(env)) === sha;
  if (already) {
    logLine(sha, 0, "skipped");
    return { submitted: 0, status: "skipped", sha };
  }
  if (urls.length === 0) {
    logLine(sha, 0, "skipped");
    return { submitted: 0, status: "skipped", sha };
  }
  const fetchImpl = options.fetchImpl ?? fetch;
  const response = await fetchImpl(INDEXNOW_API, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: KEY_LOCATION, urlList: urls }),
  });
  const status = response.status;
  logLine(sha, urls.length, status);
  if (status === 200 || status === 202) {
    if (options.recordSubmitted) await options.recordSubmitted(sha);
    else await rememberSha(env, sha);
  }
  return { submitted: urls.length, status, sha };
}

export default submitDeployed;

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(entry).href;
}

if (isDirectRun()) {
  if (process.argv.includes("--prepare")) {
    const manifest = buildDeployManifest();
    const written = writeDeployManifest(manifest);
    console.log(`[IndexNow] prepared sha=${manifest.sha} urls=${manifest.urls.length} file=${written[0] ?? ""}`);
  } else if (process.env.CI || process.env.GITHUB_ACTIONS || process.env.GITHUB_EVENT_NAME === "pull_request") {
    console.log("[IndexNow] sha=unknown submitted=0 status=skipped");
  } else {
    submitDeployed().catch((error) => {
      console.error("[IndexNow] sha=unknown submitted=0 status=error");
      console.error(error instanceof Error ? error.message : error);
    });
  }
}
