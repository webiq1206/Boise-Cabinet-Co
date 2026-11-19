import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getManifestLinks } from "@/lib/internal-links";
import { getBlogHeroImage, getBlogImageAlt } from "@/shared/blogImages";
import { ROOM_CATEGORIES } from "@/shared/catalog";
import { CITY_HERO_IMAGES, getCityServiceImageAlt } from "@/shared/cityServiceImages";
import { localAlt } from "@/shared/localAlt";

/**
 * One closing block of onward links for room, location and product pages
 * (owner, 19 November 2026: separate "Related cabinet pages", "Guides for ..."
 * and "Where we work" lists read as clutter). Rooms and cities are photo cards:
 * a swipe row on phones, balanced rows from tablet up, each with the photograph
 * of the page it opens. Guides and other pages are one list with thumbnails. A
 * link appears once. Cards keep their full anchor text for search and screen
 * readers and show only the part that differs.
 */
export interface ExploreCell {
  href: string;
  label: string;
  /** Read before the label by search engines and screen readers, not shown. */
  context?: string;
}

export interface ExploreGroup {
  label: string;
  cells: ExploreCell[];
  action?: ExploreCell;
}

interface KeepExploringProps {
  groups?: ExploreGroup[];
  /** Extra links for the reading list, shown before the page's related pages. */
  links?: { href: string; label: string }[];
  readingLabel?: string;
  /** Page path whose related pages (data/internal-links.json) join the reading list. */
  manifestPath?: string;
  /** Links the page already shows elsewhere. They are not repeated here. */
  exclude?: readonly string[];
}

const MAX_READING = 6;

/** Photographs for pages that are not a post, a room or a city, so every row in a list has one. */
const STATIC_PAGE_IMAGE: Record<string, { src: string; description: string }> = {
  "/services/cabinet-installation": { src: "/images/marketing/hero-construction.webp", description: "Oak cabinet boxes clamped together during cabinet installation" },
  "/catalog": { src: "/images/marketing/catalog-default.webp", description: "Cabinet door samples and finish chips laid out on a wood floor" },
  "/compare": { src: "/images/marketing/cabinet-door-samples.webp", description: "Cabinet door samples, a finish fan deck and hardware pulls on a table" },
  "/warranty": { src: "/images/marketing/warranty-hardware.webp", description: "Oak and walnut drawer fronts with brass and black knobs" },
  "/design-studio": { src: "/images/marketing/hero-design-studio.webp", description: "Laptop on a kitchen counter showing a cabinet design" },
  "/kitchen-cabinets": { src: "/images/marketing/kitchen-farmhouse-shaker.webp", description: "White shaker kitchen cabinets with an oak island of drawers" },
  "/cabinets": { src: "/images/marketing/kitchen-farmhouse-shaker.webp", description: "White shaker kitchen cabinets with an oak island of drawers" },
  "/shaker-cabinets": { src: "/images/marketing/hero-hardware.webp", description: "Cream shaker cabinet drawer fronts with brass pulls" },
  "/accessories": { src: "/images/approved/drawer-oak.webp", description: "Open oak drawer with a wood utensil organizer" },
  "/about": { src: "/images/marketing/great-room-oak-built-ins.webp", description: "Oak built-in shelves and cabinets on both sides of a plaster fireplace" },
  "/contact": { src: "/images/marketing/bath-white-oak-vanity.webp", description: "Bathroom with a long oak vanity, two black-framed mirrors and a freestanding tub" },
  "/design-ideas": { src: "/images/marketing/kitchen-wood-island.webp", description: "Open kitchen with a long oak island of drawers and a wall of oak tall cabinets" },
};
/** Any other page: drawer fronts, the plainest picture of the work. */
const DEFAULT_PAGE_IMAGE = { src: "/images/marketing/drawers-black-pulls-oak.webp", description: "Oak drawer fronts with black bar pulls beside a white cabinet door" };

/** The photograph that belongs to the page a link opens, with its alt. Internal links always get one. */
export function pageImage(href: string): { src: string; alt: string } | undefined {
  const pathOnly = href.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
  const [section, slug] = pathOnly.split("/").filter(Boolean);
  if ((section === "blog" || section === "guides") && slug) {
    return { src: getBlogHeroImage(slug), alt: localAlt(getBlogImageAlt(slug)) };
  }
  if (section === "cabinets" && slug) {
    const room = ROOM_CATEGORIES.find((r) => r.slug === slug);
    if (room?.heroImage) return { src: room.heroImage, alt: localAlt(room.imageAlt ?? `${room.name} cabinets`) };
  }
  if (section === "locations" && slug && CITY_HERO_IMAGES[slug]) {
    return { src: CITY_HERO_IMAGES[slug], alt: getCityServiceImageAlt(href) ?? localAlt("Kitchen with custom cabinets") };
  }
  if (!pathOnly.startsWith("/")) return undefined;
  const fixed = STATIC_PAGE_IMAGE[pathOnly] ?? DEFAULT_PAGE_IMAGE;
  return { src: fixed.src, alt: localAlt(fixed.description) };
}

/** Columns that leave no short last row, or undefined when no option divides the count. */
function balancedColumns(count: number, singleRowMax: number, options: number[]): number | undefined {
  if (count <= singleRowMax) return count;
  return options.find((columns) => count % columns === 0);
}

export function ExploreCells({ cells }: { cells: ExploreCell[] }) {
  return (
    <ul
      className="lx-cells"
      // Rows are always full: a count that fits one row takes one row, a count that
      // divides evenly takes rows of that width, and any other count stays a swipe
      // row at that width instead of leaving a short last row.
      data-tablet={balancedColumns(cells.length, 4, [4, 3]) ? "grid" : "swipe"}
      data-desktop={balancedColumns(cells.length, 7, [4, 5, 3, 6]) ? "grid" : "swipe"}
      style={{
        ["--lx-cols" as string]: balancedColumns(cells.length, 7, [4, 5, 3, 6]) ?? 4,
        ["--lx-cols-tablet" as string]: balancedColumns(cells.length, 4, [4, 3]) ?? 4,
      }}
    >
      {cells.map((cell) => {
        const image = pageImage(cell.href);
        return (
          <li key={cell.href + cell.label}>
            <Link href={cell.href} className="lx-cell">
              {image ? (
                <span className="lx-cell-photo">
                  <Image src={image.src} alt={image.alt} fill sizes="(max-width: 700px) 46vw, 300px" className="object-cover" />
                </span>
              ) : null}
              <span className="lx-cell-label">
                <span>
                  {cell.context ? <span className="sr-only">{cell.context} </span> : null}
                  {cell.label}
                </span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function KeepExploring({ groups = [], links = [], readingLabel = "Guides and planning", manifestPath, exclude = [] }: KeepExploringProps) {
  const taken = new Set<string>(exclude);
  const shownGroups = groups
    .map((group) => ({ ...group, cells: group.cells.filter((cell) => !taken.has(cell.href)) }))
    .filter((group) => group.cells.length > 0);
  for (const group of shownGroups) {
    group.cells.forEach((cell) => taken.add(cell.href));
    if (group.action) taken.add(group.action.href);
  }
  const related = manifestPath ? getManifestLinks(manifestPath).map((link) => ({ href: link.url, label: link.anchor })) : [];
  const reading: { href: string; label: string }[] = [];
  for (const link of [...links, ...related]) {
    if (taken.has(link.href)) continue;
    taken.add(link.href);
    reading.push(link);
    if (reading.length === MAX_READING) break;
  }
  if (shownGroups.length === 0 && reading.length === 0) return null;

  return (
    <div className="lx-explore">
      <h2 className="ed-h2-sm ed-statement-wide">Keep exploring</h2>
      <div className="lx-explore-grid">
        {shownGroups.map((group) => (
          <div className="lx-explore-group" key={group.label}>
            <div className="lx-explore-head">
              <h3 className="lx-explore-label">{group.label}</h3>
              {group.action ? (
                <Link href={group.action.href} className="lx-explore-all">
                  {group.action.context ? <span className="sr-only">{group.action.context} </span> : null}
                  {group.action.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
            <ExploreCells cells={group.cells} />
          </div>
        ))}
        {reading.length > 0 ? (
          <div className="lx-explore-group">
            <h3 className="lx-explore-label">{readingLabel}</h3>
            <ul className="lx-reading">
              {reading.map((link) => {
                const image = pageImage(link.href);
                return (
                  <li key={link.href}>
                    <Link href={link.href} className="lx-reading-link">
                      {image ? (
                        <span className="lx-reading-photo">
                          <Image src={image.src} alt={image.alt} fill sizes="72px" className="object-cover" />
                        </span>
                      ) : null}
                      <span className="lx-reading-title">{link.label}</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
