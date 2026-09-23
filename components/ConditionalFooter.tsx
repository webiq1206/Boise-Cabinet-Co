"use client";

import { isEstimatorPath } from "@/lib/p5/estimatorRoutes";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  const hideFooter =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/portal") ||
    pathname?.startsWith("/design-studio");

  // The estimator owns the whole screen as a one-page app; a footer below it
  // would be the one thing on the page that forces a scroll.
  if (hideFooter || isEstimatorPath(pathname)) return null;
  return <Footer />;
}
