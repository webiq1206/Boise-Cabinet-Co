import { ROOM_BY_SLUG } from "@/shared/catalog/roomCategories";

/**
 * Primary navigation: homeowner-first entry points (no supplier/brand names).
 * A top-level "Catalog" link opens the unified browse-everything page at
 * /catalog, which also hosts the downloadable full-catalog PDF. The same page
 * is surfaced as the "Full catalog" link inside the Shop by Room menu and the
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

const SHOP_BY_ROOM_CHILDREN = SHOP_BY_ROOM_SLUGS.map((slug) => ROOM_BY_SLUG[slug])
  .filter(Boolean)
  .map((room) => ({ label: room.name, href: `/cabinets/${room.slug}` }));

export const PRIMARY_NAV = [
  {
    label: "Shop by Room",
    href: "/cabinets",
    children: SHOP_BY_ROOM_CHILDREN,
    footerLink: { label: "Full catalog", href: "/catalog" },
  },
  { label: "Catalog", href: "/catalog" },
  {
    label: "How It Works",
    href: "/about",
    children: [
      { label: "About us", href: "/about" },
      { label: "How we build", href: "/construction" },
      { label: "Cabinet installation", href: "/services/cabinet-installation" },
      { label: "Why choose us", href: "/#why-choose-us" },
      { label: "Projects & reviews", href: "/testimonials" },
    ],
  },
  { label: "For Builders", href: "/builders" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_CABINET_LINKS = SHOP_BY_ROOM_CHILDREN;
