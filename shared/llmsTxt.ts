// Single source of truth for /llms.txt, served via app/llms.txt/route.ts, and
// the head of /llms-full.txt.
//
// Generated from the content layer, not hand-maintained. Both routes are
// force-static, so this runs once per build and the file always describes the
// pages that build ships. It used to be a template literal with its own dollar
// midpoints ("updated June 2026") that disagreed with the cost guide, a
// superlative the pages avoid, and a link to /testimonials, which has no
// route. Costs now link to the cost guide instead of restating figures.
// scripts/verify-llms.ts (prebuild) fails the build if any link here is not a
// public sitemap URL.
//
// Served through an app route (not public/) because static public/ files are
// not served by the standalone production deploy; app routes are.
//
// Follows the llms.txt spec (llmstxt.org): an H1, a blockquote summary, then
// sections of markdown links. Links MUST be markdown `[title](url)` form, not
// bare paths, or crawlers (and Lighthouse's llms-txt audit) see "no links".
import { CABINET_WORKMANSHIP_WARRANTY, IDAHO_REGISTERED_CONTRACTOR, MANUFACTURER_WARRANTY_PASS_THROUGH } from "@/shared/claims";
import { ACCESSORY_FAMILIES, CATALOG_CONTENT, DOOR_STYLES, FINISHES, HARDWARE_OPTIONS } from "@/shared/catalog";
import { ROOM_CATEGORIES } from "@/shared/catalog/roomCategories";
import { ROOM_SEO } from "@/shared/catalog/roomSeo";
import { CITIES, locationPath } from "@/shared/contentData";
import { CONTENT_HUBS, guidePath } from "@/shared/contentHubs";
import { GUIDE_PAGES } from "@/shared/guideContent";
import { SITE_CONFIG, showFoundingYear } from "@/shared/siteConfig";

const FOUNDED_LINE = "- Founded: 2020";

const BASE = SITE_CONFIG.siteUrl.replace(/\/$/, "");
const url = (path: string) => (path === "/" ? BASE : `${BASE}${path}`);
const link = (label: string, path: string) => `[${label}](${url(path)})`;
const sentenceStart = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const list = (items: string[]) =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;

/** Build date, so "Last updated" always matches the deploy that served it. */
export const LLMS_LAST_UPDATED = new Date().toISOString().slice(0, 10);

const name = SITE_CONFIG.name;
const cityNames = CITIES.map((city) => city.name);
const finishFamilies = ["matte", "gloss", "woodgrain"].map(
  (family) => `${FINISHES.filter((finish) => finish.category === family).length} ${family}`,
);

/** Pillar guides in hub order, then the Treasure Valley overview. */
const pillarGuides = CONTENT_HUBS.filter((hub) => hub.pillarSlug)
  .map((hub) => GUIDE_PAGES.find((guide) => guide.slug === hub.pillarSlug))
  .filter((guide): guide is NonNullable<typeof guide> => Boolean(guide));
const masterGuides = GUIDE_PAGES.filter((guide) => guide.guideType === "master");

function buildLlmsTxt(): string {
  const out: string[] = [];
  const push = (...lines: string[]) => out.push(...lines);

  push(`# ${name}`, "");
  push(
    `> ${name} designs custom cabinets to your measurements, builds each order to your layout, and installs it with our own crew: kitchen cabinets, bathroom vanities, and built-in storage for Boise and the Treasure Valley, Idaho.`,
    "",
  );
  push(`Last updated: ${LLMS_LAST_UPDATED}`, "");
  push(
    `${SITE_CONFIG.phone}. ${SITE_CONFIG.email}.`,
    "",
  );
  push(
    `Full content export for LLMs (every guide answer, article answer, and the complete FAQ corpus in one file): ${link("llms-full.txt", "/llms-full.txt")}`,
    "",
  );

  push("## Business facts", "");
  push(`- Company: ${name}, a DBA of ${SITE_CONFIG.legalName}`);
  if (showFoundingYear()) push(FOUNDED_LINE);
  push(`- Registration: ${IDAHO_REGISTERED_CONTRACTOR}`);
  push(`- Service area: ${list(cityNames)} (Ada and Canyon Counties, Treasure Valley)`);
  push(`- Catalog: ${DOOR_STYLES.length} door styles, ${FINISHES.length} finishes (${list(finishFamilies)}), ${HARDWARE_OPTIONS.length} hardware options, ${ACCESSORY_FAMILIES.length} accessory families`);
  push("- Construction: frameless cabinet boxes built to order, soft-close hinge and drawer-slide options");
  push(`- Lead time: typically ${CATALOG_CONTENT.leadTime} from approved design`);
  push(`- Warranty: ${CABINET_WORKMANSHIP_WARRANTY}; ${MANUFACTURER_WARRANTY_PASS_THROUGH.toLowerCase()}`);
  push("- Free in-home design consultation; a written proposal with drawings before anything is ordered");
  push("- Also serve builders, general contractors, and multi-family developers with volume pricing");
  push(`- Phone: ${SITE_CONFIG.phone}`);
  push(`- Email: ${SITE_CONFIG.email}`, "");

  push("## Cost planning", "");
  push(
    `Cost ranges change with layout, door style, finish, and linear footage, so they are published in one place rather than repeated here. Firm quotes follow measurement and approved drawings.`,
    "",
  );
  push(`- ${link("Boise cabinet cost guide", "/guides/boise-cabinet-cost-guide")}: planning ranges for kitchens, vanities, built-ins, and whole-home programs`);
  push(`- ${link("Request a quote", "/estimate")}: share your project for a written estimate`, "");

  push("## Cabinets by room", "");
  push(`- ${link("All rooms", "/cabinets")}`);
  for (const room of ROOM_CATEGORIES) {
    const seo = ROOM_SEO[room.slug];
    push(`- ${link(sentenceStart(seo?.phrase ?? `${room.name.toLowerCase()} cabinets`), `/cabinets/${room.slug}`)}`);
  }
  push("");

  push("## Cabinets by city", "");
  for (const city of CITIES) push(`- ${link(`Custom cabinets in ${city.name}, Idaho`, locationPath(city.slug))}`);
  push("");

  push("## Catalog", "");
  push(`- ${link("Cabinet catalog and downloadable PDF", "/catalog")}: ${list(DOOR_STYLES.map((style) => style.name))} door styles; ${FINISHES.length} finishes`);
  push(`- ${link("Shaker cabinets", "/shaker-cabinets")}: ${list(DOOR_STYLES.filter((style) => /shaker/i.test(style.name)).map((style) => style.name))}`);
  push(`- ${link("Cabinet accessories", "/accessories")}: ${list(ACCESSORY_FAMILIES.map((family) => family.name.toLowerCase()))}`);
  push(`- ${link("Frameless cabinet construction", "/construction")}`);
  push(`- ${link("Custom cabinet comparison", "/compare")}: stock, semi-custom, and our custom cabinets; door styles and finish families side by side`, "");

  push("## Services", "");
  push(`- ${link("Cabinet installation", "/services/cabinet-installation")}: installation by our own crew, including cabinets you already own`);
  push(`- ${link("Builder and trade program", "/builders")}: volume pricing for multi-family, apartments, and condos; consistent specs across units`, "");

  push("## Guides and content", "");
  for (const guide of [...pillarGuides, ...masterGuides]) push(`- ${link(guide.title, guidePath(guide.slug))}`);
  push(`- ${link("All cabinet guides", "/guides")}`);
  push(`- ${link("Blog", "/blog")}: planning, costs, timelines, finishes, and selection advice, organized into topic hubs`);
  push(`- ${link("Planning downloads and checklists", "/resources")}`, "");

  push("## Trust and company", "");
  push(`- ${link("About the company and team", "/about")}`);
  push(`- ${link("Warranty details", "/warranty")}`);
  push(`- ${link("Contact page", "/contact")}`, "");

  push("## Contact", "");
  push(`- ${link("Website", "/")}`);
  push(`- ${link("Contact page", "/contact")}`);
  push(`- Phone: ${SITE_CONFIG.phone}`);
  push(`- Email: ${SITE_CONFIG.email}`);

  return `${out.join("\n")}\n`;
}

export const LLMS_TXT = buildLlmsTxt();
