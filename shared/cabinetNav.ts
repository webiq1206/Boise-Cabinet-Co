import { ROOM_BY_SLUG } from "@/shared/catalog/roomCategories";

/**
 * Primary navigation: homeowner-first entry points (no supplier/brand names).
 * A top-level "Catalog" link opens the unified browse-everything page at
 * /catalog, which also hosts the downloadable full-catalog PDF. The same page
 * is surfaced as the "Full catalog" link inside the Shop by room menu and the
 * footer.
 */

const SHOP_BY_ROOM_SLUGS = [
  "kitchen",
  "bathroom",
  "laundry",
  "mudroom",
  "home-office",
  "entertainment",
  "built-ins",
  "pantry",
  "closet",
  "bedroom",
  "garage",
  "wet-bar",
  "outdoor",
] as const;

/**
 * Menu and heading label for a room name. Catalog room names are title case
 * ("Home Office", "Built-Ins", "Wet Bar"); labels are sentence case with the
 * same words (owner call C). Room names hold no proper nouns, so everything
 * after the first letter is lower case.
 */
export function roomLabel(name: string): string {
  return name.charAt(0) + name.slice(1).toLowerCase();
}

const SHOP_BY_ROOM_CHILDREN = SHOP_BY_ROOM_SLUGS.map((slug) => ROOM_BY_SLUG[slug])
  .filter(Boolean)
  .map((room) => ({ label: roomLabel(room.name), href: `/cabinets/${room.slug}` }));

export const PRIMARY_NAV = [
  {
    label: "Shop by room",
    href: "/cabinets",
    children: SHOP_BY_ROOM_CHILDREN,
    footerLink: { label: "Full catalog", href: "/catalog" },
  },
  { label: "Catalog", href: "/catalog" },
  {
    label: "How it works",
    href: "/about",
    children: [
      { label: "About us", href: "/about" },
      { label: "How we work", href: "/construction" },
      { label: "Cabinet installation", href: "/services/cabinet-installation" },
      { label: "Why choose us", href: "/#why-choose-us" },
    ],
  },
  { label: "For builders", href: "/builders" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_CABINET_LINKS = SHOP_BY_ROOM_CHILDREN;
