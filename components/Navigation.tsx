"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTA_PRIMARY, CTA_PRIMARY_SHORT, CTA_PORTAL_SHORT } from "@/shared/ctaCopy";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { PRIMARY_NAV } from "@/shared/cabinetNav";
import { useModals } from "@/components/modals/ModalProvider";
import { useAuth } from "@/hooks/useAuth";
import { useAdaptiveGlassTheme } from "@/hooks/useAdaptiveGlassTheme";
import {
  ADAPTIVE_GLASS_ATTR,
  ADAPTIVE_GLASS_BAR_BASE,
  getAdaptiveGlassClasses,
} from "@/components/marketing/adaptiveGlassTheme";

function Logo({ hero }: { hero: boolean }) {
  return (
    <Link href="/" className="flex flex-col leading-none">
      <span
        className={cn(
          "font-sans text-[1.05rem] font-light tracking-tight transition-colors duration-300",
          hero ? "text-inverse-foreground" : "text-foreground",
        )}
      >
        Boise Cabinet{" "}
        <em
          className={cn(
            "brc-accent transition-colors duration-300",
            hero ? "text-inverse-muted" : "text-accent",
          )}
        >
          Co
        </em>
      </span>
      <span
        className={cn(
          "text-[9px] tracking-[0.15em] uppercase font-sans font-medium mt-0.5 transition-colors duration-300",
          hero ? "text-inverse-muted/80" : "text-muted-foreground",
        )}
      >
        Custom Cabinetry
      </span>
    </Link>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const { openConsult } = useModals();
  const { isAuthenticated, isCustomer } = useAuth();
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const bottomBarTheme = useAdaptiveGlassTheme(bottomBarRef);
  const bottomBarClasses = getAdaptiveGlassClasses(bottomBarTheme);

  const isPortal =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/portal") ||
    pathname?.startsWith("/partner") ||
    pathname?.startsWith("/subcontractor");
  const isHome = pathname === "/";
  const isHeroMode = isHome && !scrolled && !isPortal;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 72);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  if (isPortal) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
        <nav className="container flex h-16 items-center justify-between gap-4 px-6">
          <Logo hero={false} />
        </nav>
      </header>
    );
  }

  const linkClass = (href: string) =>
    cn(
      "px-3 py-2 text-[13px] font-medium transition-colors rounded-sm hover-elevate",
      pathname === href || pathname?.startsWith(href + "/")
        ? isHeroMode
          ? "text-inverse-foreground"
          : "text-foreground"
        : isHeroMode
          ? "text-inverse-muted hover:text-inverse-foreground"
          : "text-muted-foreground hover:text-foreground",
    );

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-[100] w-full transition-all duration-300",
          isHeroMode
            ? "bg-transparent border-b border-transparent"
            : "bg-background/97 backdrop-blur border-b border-border",
        )}
      >
        <nav className="container flex h-[60px] items-center justify-between gap-4 px-4 md:px-6">
          <Logo hero={isHeroMode} />

          <div className="hidden lg:flex items-center">
            <NavigationMenu>
              <NavigationMenuList>
                {PRIMARY_NAV.map((item) =>
                  "children" in item && item.children ? (
                    <NavigationMenuItem key={item.label}>
                      <NavigationMenuTrigger
                        className={cn(
                          "bg-transparent h-auto px-3 py-2 text-[13px] font-medium",
                          isHeroMode
                            ? "text-inverse-muted hover:text-inverse-foreground data-[state=open]:text-inverse-foreground"
                            : "text-muted-foreground hover:text-foreground data-[state=open]:text-foreground",
                        )}
                      >
                        {item.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[320px] gap-1 p-3 md:w-[400px] md:grid-cols-2">
                          <li className="col-span-full mb-1">
                            <NavigationMenuLink asChild>
                              <Link
                                href={item.href}
                                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                              >
                                View all {item.label.toLowerCase()}
                              </Link>
                            </NavigationMenuLink>
                          </li>
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={child.href}
                                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                  {child.label}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuItem key={item.label}>
                      <Link href={item.href} className={linkClass(item.href)}>
                        {item.label}
                      </Link>
                    </NavigationMenuItem>
                  ),
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated && isCustomer && (
              <Button variant="brandOutline" size="sm" asChild>
                <Link href="/portal">{CTA_PORTAL_SHORT}</Link>
              </Button>
            )}
            <a
              href={SITE_CONFIG.phoneHref}
              className={cn(
                "flex items-center gap-2 text-[13px] font-medium transition-colors",
                isHeroMode
                  ? "text-inverse-muted hover:text-inverse-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="relative flex h-2 w-2">
                <span className="pulse-accent absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              {SITE_CONFIG.phone}
            </a>
            <Button variant="brand" size="sm" asChild>
              <Link href="/design-studio">{CTA_PRIMARY_SHORT}</Link>
            </Button>
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation menu"
              className={isHeroMode ? "text-inverse-foreground" : undefined}
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </nav>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-[200] bg-background flex flex-col lg:hidden",
          "transition-opacity duration-200",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="flex items-center justify-between px-6 h-[60px] border-b border-border/40 shrink-0">
          <Logo hero={false} />
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          {PRIMARY_NAV.map((item) => (
            <div key={item.label} className="border-b border-border/40">
              {"children" in item && item.children ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedMobile(expandedMobile === item.label ? null : item.label)
                    }
                    className="flex w-full items-center justify-between px-6 py-5 text-xl font-medium text-muted-foreground"
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 transition-transform",
                        expandedMobile === item.label && "rotate-180",
                      )}
                    />
                  </button>
                  {expandedMobile === item.label && (
                    <div className="pb-3 px-6 space-y-1">
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="block py-2 text-sm font-medium text-foreground"
                      >
                        All {item.label}
                      </Link>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block py-2 text-sm text-muted-foreground"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-6 py-5 text-xl font-medium text-muted-foreground"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-border/40 px-6 py-6 space-y-3">
          <a href={SITE_CONFIG.phoneHref} className="flex items-center gap-3 text-base font-medium">
            {SITE_CONFIG.phone}
          </a>
          <Button variant="brand" className="w-full" asChild>
            <Link href="/design-studio" onClick={() => setMobileOpen(false)}>
              {CTA_PRIMARY}
            </Link>
          </Button>
        </div>
      </div>

      <div
        ref={bottomBarRef}
        {...{ [ADAPTIVE_GLASS_ATTR]: "" }}
        className={cn(ADAPTIVE_GLASS_BAR_BASE, "bottom-0 z-[100] lg:hidden", bottomBarClasses.bar)}
      >
        <div className={cn("grid grid-cols-2 divide-x", bottomBarClasses.divide)}>
          <a
            href={SITE_CONFIG.phoneHref}
            className={cn("flex items-center justify-center gap-2 py-4 text-sm font-medium", bottomBarClasses.text)}
          >
            Call
          </a>
          <Link
            href="/design-studio"
            className={cn("flex items-center justify-center gap-2 py-4 text-sm font-medium", bottomBarClasses.text)}
          >
            {CTA_PRIMARY_SHORT}
          </Link>
        </div>
      </div>
    </>
  );
}
