import type { LucideIcon } from "lucide-react";
import {
  Home,
  FolderKanban,
  User,
  LayoutDashboard,
  Inbox,
  Send,
} from "lucide-react";

export type PortalShellVariant = "admin" | "customer";

export interface PortalNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const PORTAL_VARIANT_LABEL: Record<PortalShellVariant, string> = {
  customer: "Client Portal",
  admin: "Admin",
};

export const CUSTOMER_MOBILE_TABS: PortalNavLink[] = [
  { href: "/portal", label: "Home", icon: Home, exact: true },
  { href: "/portal/account", label: "Account", icon: User, exact: true },
];

export const ADMIN_MOBILE_TABS: PortalNavLink[] = [
  { href: "/admin/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/leads", label: "Leads", icon: Inbox },
];

export const ADMIN_MOBILE_MORE: PortalNavLink[] = [
  { href: "/admin/outreach", label: "Outreach", icon: Send },
];

export function isNavLinkActive(pathname: string, item: PortalNavLink): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
