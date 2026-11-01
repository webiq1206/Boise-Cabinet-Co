"use client";
/**
 * Site chrome routing for Boise Cabinet Co. The header and the mobile action bar
 * themselves are the shared family components (components/family/), set up by
 * lib/familyBrand.ts; this file only decides where they render.
 *
 * - Estimator routes (every /estimate path): no marketing header or bar. The
 *   estimator is a one-page app with its own brand bar, step progress and exit
 *   control (owner report 2026-09-23).
 * - Portal app shells (design studio, customer portal, admin workspaces): no
 *   marketing chrome at all; other admin routes get a plain lockup bar.
 */
import { ApprovedBrand } from "@/components/approved/ApprovedBrand";
import { MobileActionBar } from "@/components/family/MobileActionBar";
import { SiteHeader } from "@/components/family/SiteHeader";
import { isEstimatorPath } from "@/lib/p5/estimatorRoutes";
import Link from "next/link";
import { usePathname } from "next/navigation";

function isPortalAppShell(pathname: string | null): boolean {
  return Boolean(
    pathname?.startsWith("/design-studio") ||
      pathname?.startsWith("/portal") ||
      pathname?.startsWith("/admin/dashboard") ||
      pathname?.startsWith("/admin/projects") ||
      pathname?.startsWith("/admin/leads") ||
      pathname?.startsWith("/admin/outreach"),
  );
}

function isPortalRoute(pathname: string | null): boolean {
  return Boolean(pathname?.startsWith("/admin") || pathname?.startsWith("/portal"));
}

export function Navigation() {
  const pathname = usePathname();
  if (isEstimatorPath(pathname) || isPortalAppShell(pathname)) return null;
  if (isPortalRoute(pathname)) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
        <nav className="container flex h-16 items-center justify-between gap-4 px-6">
          <Link href="/" className="tap-target flex items-center leading-none" aria-label="Boise Cabinet Co, home">
            <ApprovedBrand />
          </Link>
        </nav>
      </header>
    );
  }
  return <SiteHeader />;
}

/** Rendered after the footer so the bar's clearance spacer sits at the end of the page. */
export function SiteActionBar() {
  const pathname = usePathname();
  if (isEstimatorPath(pathname) || isPortalRoute(pathname) || isPortalAppShell(pathname)) return null;
  return <MobileActionBar />;
}
