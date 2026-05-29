"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  const hideFooter =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/subcontractor/portal") ||
    pathname?.startsWith("/subcontractor/purchases");

  if (hideFooter) return null;
  return <Footer />;
}
