"use client";

import { useEffect, useState, type RefObject } from "react";
import { measureBarTheme } from "@/lib/backdropContrast";
import type { GlassTheme } from "@/components/marketing/adaptiveGlassTheme";

const MOBILE_MAX_WIDTH = 767;

interface UseAdaptiveGlassThemeOptions {
  enabled?: boolean;
}

export function useAdaptiveGlassTheme(
  ref: RefObject<HTMLElement | null>,
  options: UseAdaptiveGlassThemeOptions = {}
): GlassTheme {
  const { enabled = true } = options;
  const [theme, setTheme] = useState<GlassTheme>("onLight");

  useEffect(() => {
    if (!enabled) return;

    const barEl = ref.current;
    if (!barEl) return;

    const mobileQuery = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
    let rafId = 0;
    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      if (!mobileQuery.matches) {
        setTheme("onLight");
        return;
      }

      const nextTheme = measureBarTheme(barEl);
      setTheme((prev) => (prev === nextTheme ? prev : nextTheme));
    };

    const scheduleMeasure = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    mobileQuery.addEventListener("change", scheduleMeasure);

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(barEl);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      mobileQuery.removeEventListener("change", scheduleMeasure);
      resizeObserver.disconnect();
    };
  }, [enabled, ref]);

  return theme;
}
