"use client";

import { isEstimatorPath } from "@/lib/p5/estimatorRoutes";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Footer } from "@/components/Footer";

function FunnelFooter() {
  return (
    <footer className="border-t border-border bg-background px-6 py-8 pb-24 text-sm text-muted-foreground md:pb-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex gap-4">
          <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms-of-service" className="underline underline-offset-2 hover:text-foreground">
            Terms
          </Link>
        </p>
      </div>
    </footer>
  );
}

export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname === "/kitchen-cabinets") return <FunnelFooter />;
  const hideFooter =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/portal") ||
    pathname?.startsWith("/design-studio");

  // The estimator owns the whole screen as a one-page app; a footer below it
  // would be the one thing on the page that forces a scroll.
  if (hideFooter || isEstimatorPath(pathname)) return null;
  return <Footer />;
}
