"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTA_PRIMARY, CTA_PRIMARY_SHORT } from "@/shared/ctaCopy";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { useModals } from "@/components/modals/ModalProvider";

const NAV_LINKS = [
  { label: "Services", href: "/#services" },
  { label: "Our Work", href: "/testimonials" },
  { label: "Areas", href: "/areas" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

function Logo({ hero }: { hero: boolean }) {
  return (
    <Link href="/" className="flex flex-col leading-none">
      <span
        className={cn(
          "font-sans text-[1.05rem] font-light tracking-tight transition-colors duration-300",
          hero ? "text-inverse-foreground" : "text-foreground"
        )}
      >
        Boise{" "}
        <em className={cn("brc-accent transition-colors duration-300", hero ? "text-inverse-muted" : "text-accent")}>
          Remodeling
        </em>{" "}
        Co
      </span>
      <span
        className={cn(
          "text-[9px] tracking-[0.15em] uppercase font-sans font-medium mt-0.5 transition-colors duration-300",
          hero ? "text-inverse-muted/80" : "text-muted-foreground"
        )}
      >
        Design &amp; Build
      </span>
    </Link>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { openConsult } = useModals();

  const isPortal =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/subcontractor/portal") ||
    pathname?.startsWith("/subcontractor/purchases");
  const isHome = pathname === "/";
  const isHeroMode = isHome && !scrolled && !isPortal;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 72);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isPortal) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
        <nav className="container flex h-16 items-center justify-between gap-4 px-6">
          <Logo hero={false} />
        </nav>
      </header>
    );
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-[100] w-full transition-all duration-300",
          isHeroMode
            ? "bg-transparent border-b border-transparent"
            : "bg-background/97 backdrop-blur border-b border-border"
        )}
      >
        <nav className="container flex h-[60px] items-center justify-between gap-4 px-4 md:px-6">
          <Logo hero={isHeroMode} />

          <div className="hidden md:flex items-center gap-0">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-[13px] font-medium transition-colors rounded-sm hover-elevate",
                  isHeroMode
                    ? "text-inverse-muted hover:text-inverse-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a
              href={SITE_CONFIG.phoneHref}
              className={cn(
                "flex items-center gap-2 text-[13px] font-medium transition-colors",
                isHeroMode ? "text-inverse-muted hover:text-inverse-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              data-testid="link-phone-desktop"
            >
              <span className="relative flex h-2 w-2">
                <span className="pulse-accent absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              {SITE_CONFIG.phone}
            </a>
            {isHome ? (
              <Button variant="brand" size="sm" asChild>
                <a href="/#consult">{CTA_PRIMARY_SHORT}</a>
              </Button>
            ) : (
              <Button variant="brand" size="sm" onClick={openConsult}>
                {CTA_PRIMARY_SHORT}
              </Button>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open navigation menu"
                  className={isHeroMode ? "text-inverse-foreground" : undefined}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-[360px] bg-card">
                <div className="flex items-center justify-between mb-8">
                  <Logo hero={false} />
                  <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 text-base font-medium rounded-sm text-foreground hover:bg-muted transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="mt-6 pt-6 border-t border-border space-y-3">
                    <a
                      href={SITE_CONFIG.phoneHref}
                      className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-sm text-foreground"
                    >
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="pulse-accent absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
                      </span>
                      {SITE_CONFIG.phone}
                    </a>
                    {isHome ? (
                      <Button variant="brand" className="w-full" asChild>
                        <a href="/#consult" onClick={() => setMobileOpen(false)}>
                          {CTA_PRIMARY}
                        </a>
                      </Button>
                    ) : (
                      <Button
                        variant="brand"
                        className="w-full"
                        onClick={() => { openConsult(); setMobileOpen(false); }}
                      >
                        {CTA_PRIMARY}
                      </Button>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden pb-safe bg-background/97 backdrop-blur border-t border-border">
        <div className="grid grid-cols-2 divide-x divide-border">
          <a
            href={SITE_CONFIG.phoneHref}
            className="flex items-center justify-center gap-2 py-4 text-sm font-medium text-foreground"
            data-testid="button-call-mobile"
          >
            <Phone className="h-4 w-4" />
            Call
          </a>
          {isHome ? (
            <a
              href="/#consult"
              className="flex items-center justify-center gap-2 py-4 text-sm font-medium text-foreground"
              data-testid="button-begin-conversation-mobile"
            >
              {CTA_PRIMARY_SHORT}
            </a>
          ) : (
            <button
              onClick={openConsult}
              className="flex items-center justify-center gap-2 py-4 text-sm font-medium text-foreground"
              data-testid="button-begin-conversation-mobile"
            >
              {CTA_PRIMARY_SHORT}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
