"use client";

import { usePathname } from "next/navigation";

/**
 * True when the estimator already lives inline on this page (the homepage's
 * #calculator section), so estimate CTAs should anchor-scroll there instead
 * of opening the modal on top of it.
 */
export function useEstimateInline() {
  return usePathname() === "/";
}
