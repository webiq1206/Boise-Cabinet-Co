import type { LucideIcon } from "lucide-react";
import {
  Home,
  FolderKanban,
  MessageSquare,
  User,
  LayoutDashboard,
  ShoppingBag,
  ShieldCheck,
  FileSignature,
  History,
  Users,
} from "lucide-react";

export type PortalShellVariant = "admin" | "subcontractor" | "customer" | "partner";

export interface PortalNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const PORTAL_VARIANT_LABEL: Record<PortalShellVariant, string> = {
  customer: "Client Portal",
  admin: "Admin",
  partner: "Partner Portal",
  subcontractor: "Partner Portal",
};

export const CUSTOMER_MOBILE_TABS: PortalNavLink[] = [
  { href: "/portal", label: "Home", icon: Home, exact: true },
  { href: "/portal/account", label: "Account", icon: User, exact: true },
];

export const ADMIN_MOBILE_TABS: PortalNavLink[] = [
  { href: "/admin/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/leads", label: "Leads", icon: ShoppingBag },
];

export const ADMIN_MOBILE_MORE: PortalNavLink[] = [
  { href: "/admin/contracts", label: "Contracts", icon: FileSignature },
  { href: "/admin/contractors", label: "Contractors", icon: Users },
  { href: "/partner", label: "Partner Portal", icon: ShieldCheck },
];

export const PARTNER_MOBILE_TABS: PortalNavLink[] = [
  { href: "/partner", label: "Home", icon: Home, exact: true },
  { href: "/subcontractor/projects", label: "Projects", icon: FolderKanban },
  { href: "/subcontractor/leads", label: "Leads", icon: ShoppingBag },
];

export const PARTNER_MOBILE_MORE: PortalNavLink[] = [
  { href: "/subcontractor/compliance", label: "Compliance", icon: ShieldCheck },
  { href: "/subcontractor/contracts", label: "Contracts", icon: FileSignature },
  { href: "/subcontractor/purchases", label: "Purchases", icon: History },
];

export function isNavLinkActive(pathname: string, item: PortalNavLink): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
