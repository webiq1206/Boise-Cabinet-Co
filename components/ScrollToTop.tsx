"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // A URL landing on a hash (e.g. /#calculator, /#consult) means the visitor
    // is being sent to a specific section - forcing scroll to the very top
    // here would fight that navigation. Let the browser's native hash-scroll
    // (which respects scroll-padding-top, see globals.css) handle it instead.
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return null;
}
