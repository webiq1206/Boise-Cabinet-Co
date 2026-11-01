"use client";
/**
 * Boise Cabinet Co: while a final request section marked data-suppress-sticky-cta
 * (the homepage and contact consultation forms, the paid landing page's form) is
 * on screen, the family mobile action bar steps aside so the two never compete.
 * It sets document.body.dataset.suppressStickyCta, one of the body flags the bar
 * yields to (FAMILY_BRAND.bar.yieldToBodyFlags in lib/familyBrand.ts).
 */
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function StickyCtaYield() {
  const pathname = usePathname();
  useEffect(() => {
    const body = document.body;
    const targets = document.querySelectorAll("[data-suppress-sticky-cta]");
    if (!targets.length || typeof IntersectionObserver === "undefined") {
      delete body.dataset.suppressStickyCta;
      return;
    }
    const inView = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inView.add(entry.target);
          else inView.delete(entry.target);
        }
        if (inView.size > 0) body.dataset.suppressStickyCta = "true";
        else delete body.dataset.suppressStickyCta;
      },
      { threshold: 0.3 },
    );
    targets.forEach((target) => observer.observe(target));
    return () => {
      observer.disconnect();
      delete body.dataset.suppressStickyCta;
    };
  }, [pathname]);
  return null;
}
