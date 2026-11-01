"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Back and Forward keep whatever position the browser restores; only new pages are re-asserted. */
let lastPopState = 0;
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    lastPopState = Date.now();
  });
}

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // A URL landing on a hash (e.g. /#calculator, /#consult) means the visitor
    // is being sent to a specific section - forcing scroll to the very top
    // here would fight that navigation. Let the browser's native hash-scroll
    // (which respects scroll-padding-top, see globals.css) handle it instead.
    if (window.location.hash) return;
    const top = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    top();
    // A client navigation from low on a long page could settle a few dozen
    // pixels down once the router's own segment scroll ran after this one,
    // which on /estimate pushed the form heading under the top edge. Re-assert
    // the top briefly, and stop the moment the visitor scrolls themselves.
    let moved = Date.now() - lastPopState < 1000;
    const markMoved = () => {
      moved = true;
    };
    const events = ["wheel", "touchstart", "keydown"] as const;
    for (const type of events) window.addEventListener(type, markMoved, { passive: true });
    const reassert = () => {
      if (!moved && !window.location.hash && window.scrollY > 0) top();
    };
    const frame = requestAnimationFrame(reassert);
    const timers = [150, 400].map((ms) => window.setTimeout(reassert, ms));
    return () => {
      cancelAnimationFrame(frame);
      timers.forEach((id) => window.clearTimeout(id));
      for (const type of events) window.removeEventListener(type, markMoved);
    };
  }, [pathname]);

  return null;
}
