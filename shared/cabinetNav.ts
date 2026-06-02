import { ROOM_CATEGORIES } from "@/shared/catalog/roomCategories";
import { COLLECTIONS } from "@/shared/catalog/collections";

export const PRIMARY_NAV = [
  {
    label: "Cabinets",
    href: "/cabinets",
    children: ROOM_CATEGORIES.map((room) => ({
      label: room.name,
      href: `/cabinets/${room.slug}`,
    })),
  },
  {
    label: "Collections",
    href: "/collections",
    children: COLLECTIONS.map((c) => ({
      label: c.name,
      href: `/collections/${c.slug}`,
    })),
  },
  { label: "Finishes", href: "/finishes" },
  { label: "Design Studio", href: "/design-studio" },
  { label: "Areas", href: "/areas" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_CABINET_LINKS = ROOM_CATEGORIES.slice(0, 8).map((room) => ({
  label: room.name,
  href: `/cabinets/${room.slug}`,
}));

export const FOOTER_COLLECTION_LINKS = COLLECTIONS.map((c) => ({
  label: c.name,
  href: `/collections/${c.slug}`,
}));
