"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  const hideFooter =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/portal") ||
    pathname?.startsWith("/partner") ||
    pathname?.startsWith("/subcontractor");

  if (hideFooter) return null;
  return <Footer />;
}
