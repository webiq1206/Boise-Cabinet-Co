import { ROOM_BY_SLUG } from "@/shared/catalog/roomCategories";

/**
 * Primary navigation: five homeowner-first entry points (no raw SKU catalog,
 * no "Collections", no supplier/brand names). The full SKU catalog is demoted
 * to a "Full catalog" link inside the Shop by Room menu and the footer.
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
] as const;

const SHOP_BY_ROOM_CHILDREN = SHOP_BY_ROOM_SLUGS.map((slug) => ROOM_BY_SLUG[slug])
  .filter(Boolean)
  .map((room) => ({ label: room.name, href: `/cabinets/${room.slug}` }));

export const PRIMARY_NAV = [
  {
    label: "Shop by Room",
    href: "/cabinets",
    children: SHOP_BY_ROOM_CHILDREN,
    footerLink: { label: "Full catalog", href: "/products" },
  },
  {
    label: "Finishes & Doors",
    href: "/finishes",
    children: [
      { label: "Finishes by color family", href: "/finishes" },
      { label: "Door styles", href: "/door-styles" },
      { label: "Not sure? Take the finder", href: "/finder" },
    ],
  },
  { label: "Design Studio", href: "/design-studio" },
  { label: "Get an Estimate", href: "/estimate" },
  {
    label: "How It Works",
    href: "/about",
    children: [
      { label: "About us", href: "/about" },
      { label: "How we build", href: "/construction" },
      { label: "Why choose us", href: "/#why-choose-us" },
      { label: "Projects & reviews", href: "/testimonials" },
    ],
  },
] as const;

export const FOOTER_CABINET_LINKS = SHOP_BY_ROOM_CHILDREN;
