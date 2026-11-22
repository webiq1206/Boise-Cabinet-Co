"use client";

import { isEstimatorPath } from "@/lib/p5/estimatorRoutes";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Picks a server-rendered footer. The path is read here, in the browser and
 * during static render, so the layout never calls headers() and the routes
 * stay static.
 */
export function ConditionalFooter({
  footer,
  kitchenFooter,
  pantryFooter,
}: {
  footer: ReactNode;
  kitchenFooter?: ReactNode;
  pantryFooter?: ReactNode;
}) {
  const pathname = usePathname();
  const hideFooter =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/portal") ||
    pathname?.startsWith("/design-studio");

  // The estimator owns the whole screen as a one-page app; a footer below it
  // would be the one thing on the page that forces a scroll.
  if (hideFooter || isEstimatorPath(pathname)) return null;
  if (pathname === "/kitchen-cabinets" && kitchenFooter) return <>{kitchenFooter}</>;
  if (pathname === "/cabinets/pantry" && pantryFooter) return <>{pantryFooter}</>;
  return <>{footer}</>;
}
