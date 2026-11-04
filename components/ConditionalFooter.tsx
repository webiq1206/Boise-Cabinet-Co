"use client";

import { isEstimatorPath } from "@/lib/p5/estimatorRoutes";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** `footer` is the full site footer, rendered on the server by the root layout. */
export function ConditionalFooter({footer}: {footer: ReactNode}) {
  const pathname = usePathname();
  const hideFooter =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/portal") ||
    pathname?.startsWith("/design-studio");

  // The estimator owns the whole screen as a one-page app; a footer below it
  // would be the one thing on the page that forces a scroll.
  if (hideFooter || isEstimatorPath(pathname)) return null;
  return <>{footer}</>;
}
