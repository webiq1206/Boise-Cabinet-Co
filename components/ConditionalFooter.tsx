"use client";

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
  if (hideFooter || pathname === "/estimate") return null;
  return <Footer />;
}
