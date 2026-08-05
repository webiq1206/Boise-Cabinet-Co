/**
 * Assembles the downloadable "full catalog" PDF entirely from the catalog SSOT,
 * so the document always reflects the live product data. Hybrid layout: image
 * thumbnails for small visual sets (collections, door styles, rooms, hardware,
 * accessories, one swatch per finish family) plus full text tables for the long
 * lists (all finishes, all cabinets).
 *
 * Image bytes are supplied by an injected resolver so this module stays free of
 * Node/`fs`/`sharp` concerns; the build script provides the resolver.
 *
 * Never renders internal-only tokens (oscCode / oscName) - customer-facing only.
 */
import type { PdfBlock, PdfImageCell } from "@/lib/pdf/drawResourcePdf";
import { SITE_CONFIG } from "@/shared/siteConfig";
import {
  DOOR_STYLES,
  FINISHES,
  FINISHES_BY_CATEGORY,
  CABINET_PRODUCTS,
  CABINET_PRODUCTS_BY_CATEGORY,
  HARDWARE_OPTIONS,
  ACCESSORY_FAMILIES,
  ROOM_CATEGORIES,
  COLOR_FAMILIES,
  deriveColorFamily,
  getDoorStyleImages,
  getFinishImages,
  getProductImages,
  getHardwareImagePath,
  getAccessoryFamilyImagePath,
  type Finish,
  type FinishCategory,
  type CabinetProductCategory,
} from "@/shared/catalog";
import type { CabinetDimension } from "@/shared/catalog/types";

export const CATALOG_PDF_FOOTER = `${SITE_CONFIG.name} | ${SITE_CONFIG.siteUrl} | Full product catalog - planning reference, not a contract or quote`;

/**
 * Resolves a public image path (e.g. `/images/catalog/rooms/kitchen.webp`) to
 * embeddable JPEG bytes, or `null` when the file is missing/undecodable.
 */
export type CatalogImageResolver = (publicPath: string) => Promise<Uint8Array | null>;

const FINISH_CATEGORY_LABEL: Record<FinishCategory, string> = {
  matte: "Matte",
  gloss: "Gloss",
  woodgrain: "Woodgrain",
};

const CABINET_CATEGORY_LABEL: Record<CabinetProductCategory, string> = {
  base: "Base cabinets",
  wall: "Wall cabinets",
  tall: "Tall cabinets",
  vanity: "Vanity cabinets",
  "end-panel": "End panels",
  filler: "Fillers",
  hood: "Hoods",
  "floating-shelf": "Floating shelves",
  panel: "Panels",
};

const CABINET_CATEGORY_ORDER: CabinetProductCategory[] = [
  "base",
  "wall",
  "tall",
  "vanity",
  "hood",
  "floating-shelf",
  "filler",
  "end-panel",
  "panel",
];

function titleCase(value: string): string {
  return value
    .split(/[-\s]+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** Combined width range across a group of configurations that share a drawing. */
function groupWidthLabel(
  products: { dimensions?: { width?: CabinetDimension } }[],
): string {
  let min = Infinity;
  let max = -Infinity;
  let variable = false;
  for (const p of products) {
    const w = p.dimensions?.width;
    if (!w) continue;
    if (w.variable) variable = true;
    if (w.min != null) min = Math.min(min, w.min);
    if (w.max != null) max = Math.max(max, w.max);
  }
  if (min === Infinity && max === -Infinity) return variable ? "Variable" : "-";
  const lo = min === Infinity ? max : min;
  const hi = max === -Infinity ? min : max;
  const base = lo === hi ? `${lo}"` : `${lo}-${hi}"`;
  return variable ? `${base} (variable)` : base;
}

/** First finish in a color family that has a usable swatch image. */
function representativeFinish(family: string): Finish | undefined {
  const inFamily = FINISHES.filter((f) => deriveColorFamily(f) === family);
  return inFamily.find((f) => Boolean(f.imagePath)) ?? inFamily[0];
}

export async function buildCatalogPdfBlocks(
  resolveImage: CatalogImageResolver,
): Promise<PdfBlock[]> {
  const blocks: PdfBlock[] = [];

  const imageCell = async (
    publicPath: string | undefined,
    caption: string,
    sub: string | undefined,
    fallbackHex?: string,
  ): Promise<PdfImageCell> => {
    const jpeg = publicPath ? await resolveImage(publicPath) : null;
    return { jpeg: jpeg ?? undefined, fallbackHex, caption, sub };
  };

  const generatedOn = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── Cover ──────────────────────────────────────────────────────────────────
  const logoBytes = await resolveImage("/images/brc-logo.png");
  blocks.push({
    type: "cover",
    title: "Full Catalog",
    subtitle: SITE_CONFIG.tagline,
    logo: logoBytes ?? undefined,
    metaLines: [
      `Generated ${generatedOn}`,
      `${DOOR_STYLES.length} door styles  -  ${FINISHES.length} finishes  -  ${CABINET_PRODUCTS.length} cabinet configurations`,
      `${HARDWARE_OPTIONS.length} hardware options  -  ${ACCESSORY_FAMILIES.length} accessory families`,
      `${SITE_CONFIG.phone}  -  ${SITE_CONFIG.siteUrl}`,
    ],
  });

  // ── Table of contents ────────────────────────────────────────────────────
  // Targets must match the numbered `heading` texts below exactly, so the
  // renderer can resolve the page each section starts on.
  blocks.push({
    type: "toc",
    eyebrow: "FULL CATALOG",
    title: "Contents",
    entries: [
      { label: `Door styles (${DOOR_STYLES.length})`, target: "Door styles" },
      { label: `Rooms we build for (${ROOM_CATEGORIES.length})`, target: "Rooms we build for" },
      { label: `Finishes by color family`, target: "Finishes by color family" },
      { label: `All finishes (${FINISHES.length})`, target: "All finishes" },
      { label: `Cabinets by category (${CABINET_PRODUCTS.length})`, target: "Cabinets by category" },
      { label: `Hardware (${HARDWARE_OPTIONS.length})`, target: "Hardware" },
      { label: `Accessories (${ACCESSORY_FAMILIES.length})`, target: "Accessories" },
    ],
  });
  blocks.push({
    type: "paragraph",
    text: "All counts and listings are generated directly from our live product catalog, so this document stays in sync with what we currently offer.",
  });

  // ── Door styles ────────────────────────────────────────────────────────────
  // Small sections (door styles, rooms, finishes-by-family) flow onto shared
  // pages; keep-with-next still prevents orphaned headings and split cards.
  blocks.push({ type: "heading", text: "Door styles" });
  const doorCells = await Promise.all(
    DOOR_STYLES.map((d) =>
      imageCell(
        getDoorStyleImages(d.slug, d.imagePath).primary,
        d.name,
        d.compatibleFinishCategories.map((c) => FINISH_CATEGORY_LABEL[c]).join(", "),
      ),
    ),
  );
  blocks.push({ type: "image-grid", columns: 3, cells: doorCells });

  // ── Rooms ──────────────────────────────────────────────────────────────────
  blocks.push({ type: "heading", text: "Rooms we build for" });
  const roomCells = await Promise.all(
    ROOM_CATEGORIES.map((r) => imageCell(r.heroImage, r.name, undefined)),
  );
  blocks.push({ type: "image-grid", columns: 4, cells: roomCells });

  // ── Finishes: representative swatch per color family ─────────────────────────
  blocks.push({ type: "heading", text: "Finishes by color family" });
  blocks.push({
    type: "paragraph",
    text: `We offer ${FINISHES.length} finishes across matte, gloss, and woodgrain. One representative swatch per color family is shown below; the complete list follows.`,
  });
  const familyCells: PdfImageCell[] = [];
  for (const family of COLOR_FAMILIES) {
    const rep = representativeFinish(family);
    if (!rep) continue;
    const count = FINISHES.filter((f) => deriveColorFamily(f) === family).length;
    familyCells.push(
      await imageCell(
        getFinishImages(rep.slug, rep.imagePath).swatch,
        family,
        `${count} finishes`,
        rep.hexColor,
      ),
    );
  }
  blocks.push({ type: "image-grid", columns: 4, cells: familyCells });

  // ── Finishes: every swatch, grouped by category ─────────────────────────────
  // Every numbered section opens on a fresh page (handled by the renderer).
  blocks.push({ type: "heading", text: "All finishes" });
  for (const category of ["matte", "gloss", "woodgrain"] as FinishCategory[]) {
    const list = FINISHES_BY_CATEGORY[category] ?? [];
    if (list.length === 0) continue;
    blocks.push({
      type: "subtitle",
      text: `${FINISH_CATEGORY_LABEL[category]} (${list.length})`,
    });
    const cells = await Promise.all(
      list.map((f) =>
        imageCell(
          getFinishImages(f.slug, f.imagePath).swatch,
          f.name,
          `${titleCase(f.sheen)} - ${deriveColorFamily(f)}`,
          f.hexColor,
        ),
      ),
    );
    blocks.push({ type: "image-grid", columns: 5, cells });
  }

  // ── Cabinets: grouped by category, deduped by shared family drawing ─────────
  // Many configurations share one supplier "family" line drawing (the drawing
  // itself enumerates the variants + shelf options). Showing that drawing once,
  // large, keeps the page legible instead of repeating a tiny composite per SKU.
  blocks.push({ type: "heading", text: "Cabinets by category" });
  blocks.push({
    type: "paragraph",
    text: `Every cabinet is built to order (${CABINET_PRODUCTS.length} configurations). Configurations that share a family drawing are shown together; the width range and number of configurations appear beneath each drawing.`,
  });
  for (const category of CABINET_CATEGORY_ORDER) {
    const list = CABINET_PRODUCTS_BY_CATEGORY[category] ?? [];
    if (list.length === 0) continue;
    blocks.push({
      type: "subtitle",
      text: `${CABINET_CATEGORY_LABEL[category]} (${list.length})`,
    });
    // Group by the resolved family drawing, preserving first-seen order.
    const groupOrder: string[] = [];
    const byThumb = new Map<string, Array<(typeof list)[number]>>();
    for (const p of list) {
      const thumb = getProductImages(p).thumb;
      let members = byThumb.get(thumb);
      if (!members) {
        members = [];
        byThumb.set(thumb, members);
        groupOrder.push(thumb);
      }
      members.push(p);
    }
    const cells = await Promise.all(
      groupOrder.map((thumb) => {
        const members = byThumb.get(thumb)!;
        const rep = members[0];
        const widthLabel = `${groupWidthLabel(members)} W`;
        const sub =
          members.length > 1
            ? `${widthLabel} - ${members.length} configurations`
            : widthLabel;
        return imageCell(thumb, rep.name, sub);
      }),
    );
    blocks.push({ type: "image-grid", columns: 2, cells });
  }

  // ── Hardware ────────────────────────────────────────────────────────────────
  blocks.push({ type: "heading", text: "Hardware" });
  const hardwareCells = await Promise.all(
    HARDWARE_OPTIONS.map((h) =>
      imageCell(getHardwareImagePath(h.slug), h.name, titleCase(h.finish)),
    ),
  );
  blocks.push({ type: "image-grid", columns: 4, cells: hardwareCells });

  // ── Accessories ─────────────────────────────────────────────────────────────
  blocks.push({ type: "heading", text: "Accessories" });
  const accessoryCells = await Promise.all(
    ACCESSORY_FAMILIES.map((a) =>
      imageCell(getAccessoryFamilyImagePath(a.slug), a.name, titleCase(a.category)),
    ),
  );
  blocks.push({ type: "image-grid", columns: 4, cells: accessoryCells });

  // ── Before you finalize: finish, material, and availability disclaimers ──────
  blocks.push({ type: "heading", text: "Before you finalize" });
  blocks.push({
    type: "paragraph",
    text: "Finish swatches and product images in this catalog are a guide only. Screen and print settings, lighting, and photography can shift how a color reads, and wood and other natural materials carry expected grain and tone variation. Review physical samples in your home before finalizing a finish.",
  });
  blocks.push({
    type: "paragraph",
    text: "Product availability, lead times, and pricing change over time and are confirmed in writing during your design consultation. Cabinet configurations and accessories are built to order. This catalog is a planning reference, not a contract or quote.",
  });

  // ── Plan your project (contact + CTA back matter) ────────────────────────────
  blocks.push({ type: "heading", text: "Plan your project with us" });
  blocks.push({
    type: "paragraph",
    text: `Ready to choose door styles, finishes, and storage for your home? Book a free design consultation with ${SITE_CONFIG.name}. Call ${SITE_CONFIG.phone}, email ${SITE_CONFIG.email}, or visit ${SITE_CONFIG.siteUrl}. We serve Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell across Idaho's Treasure Valley.`,
  });

  return blocks;
}
