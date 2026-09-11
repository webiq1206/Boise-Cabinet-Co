"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFormInView } from "@/hooks/use-form-in-view";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Menu, X, ChevronDown, Search, Phone, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTA_ESTIMATE, CTA_PORTAL_SHORT } from "@/shared/ctaCopy";
import { track } from "@/lib/analytics/track";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { PRIMARY_NAV } from "@/shared/cabinetNav";
import { useModals } from "@/components/modals/ModalProvider";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

function Logo() {
  return (
    <Link href="/" className="tap-target flex items-center leading-none" aria-label="Boise Cabinet Co - home">
      {/* Bone (reverse) wordmark for the dark ground. eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/svg/wordmark/dark/boise-cabinet-co-wordmark-bone.svg"
        alt="Boise Cabinet Co"
        width={190}
        height={28}
        className="h-[26px] w-auto md:h-7"
      />
    </Link>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const formInView = useFormInView(pathname);
  // Solid contrast over every hero; a shadow separates the header while scrolling.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1440px)");
    const closeOnDesktop = () => { if (desktop.matches) setMobileOpen(false); };
    closeOnDesktop();
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const { openEstimate } = useModals();
  const { isAuthenticated, isCustomer } = useAuth();
  // While a guided-flow wizard shows its own contextual mobile bar, the generic
  // Call / Book-consult bar steps aside so the two never stack on phones.
  const [wizardBarActive, setWizardBarActive] = useState(false);

  useEffect(() => {
    const sync = () =>
      setWizardBarActive(
        ((window as unknown as { __wizardMobileBars?: number }).__wizardMobileBars ?? 0) > 0,
      );
    sync();
    window.addEventListener("wizardmobilebar", sync);
    return () => window.removeEventListener("wizardmobilebar", sync);
  }, []);

  // Hide the sticky bar until the hero scrolls out of view. Pages with no
  // hero (most interior pages) never find the sentinel, so they keep the
  // bar visible from first paint, same as today.
  const [pastHero, setPastHero] = useState(true);
  useEffect(() => {
    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel || typeof IntersectionObserver === "undefined") {
      setPastHero(true);
      return;
    }
    setPastHero(false);
    const ob = new IntersectionObserver(([entry]) => setPastHero(!entry.isIntersecting), {
      threshold: 0,
    });
    ob.observe(sentinel);
    return () => ob.disconnect();
  }, [pathname]);

  // Hide the sticky bar while an on-page final CTA (marked
  // data-suppress-sticky-cta) is in view, so the two never compete.
  const [ctaSuppressed, setCtaSuppressed] = useState(false);
  useEffect(() => {
    const targets = document.querySelectorAll("[data-suppress-sticky-cta]");
    if (!targets.length || typeof IntersectionObserver === "undefined") {
      setCtaSuppressed(false);
      return;
    }
    const ob = new IntersectionObserver(
      (entries) => setCtaSuppressed(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.3 },
    );
    targets.forEach((t) => ob.observe(t));
    return () => ob.disconnect();
  }, [pathname]);

  const isPortalRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/portal");

  const isPortalAppShell =
    pathname?.startsWith("/design-studio") ||
    pathname?.startsWith("/portal") ||
    pathname?.startsWith("/admin/dashboard") ||
    pathname?.startsWith("/admin/projects") ||
    pathname?.startsWith("/admin/leads") ||
    pathname?.startsWith("/admin/outreach");

  if (isPortalAppShell) return null;

  if (isPortalRoute) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
        <nav className="container flex h-16 items-center justify-between gap-4 px-6">
          <Logo />
        </nav>
      </header>
    );
  }

  const linkClass = (href: string) =>
    cn(
      "px-3 py-2 text-[13px] font-medium transition-colors rounded-sm brc-lift",
      pathname === href || pathname?.startsWith(href + "/")
        ? "text-foreground"
        : "text-muted-foreground hover:text-foreground",
    );

  const navItemActive = (
    href: string,
    children?: readonly { href: string }[],
  ) => {
    const match = (h: string) =>
      !h.startsWith("/#") && (pathname === h || pathname?.startsWith(h + "/"));
    return match(href) || (children?.some((c) => match(c.href)) ?? false);
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-[100] w-full transition-[background-color,border-color] duration-300",
          "bg-background/95 backdrop-blur border-b border-border",
          scrolled && "shadow-sm",
        )}
      >
        <nav className="container flex h-[60px] items-center justify-between gap-4 px-4 md:px-6">
          <Logo />

          <div className="hidden min-[1440px]:flex items-center">
            <NavigationMenu>
              <NavigationMenuList>
                {PRIMARY_NAV.map((item) =>
                  "children" in item && item.children ? (
                    <NavigationMenuItem key={item.label}>
                      <NavigationMenuTrigger
                        className={cn(
                          "bg-transparent h-auto px-3 py-2 text-[13px] font-medium",
                          navItemActive(item.href, item.children)
                            ? "text-foreground"
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
                          {"footerLink" in item && item.footerLink && (
                            <li className="col-span-full mt-1 border-t border-border/60 pt-2">
                              <NavigationMenuLink asChild>
                                <Link
                                  href={item.footerLink.href}
                                  className="block rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                  {item.footerLink.label}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          )}
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

          <div className="hidden min-[1440px]:flex items-center gap-3 shrink-0">
            {isAuthenticated && isCustomer && (
              <Button variant="brandOutline" size="sm" asChild>
                <Link href="/portal">{CTA_PORTAL_SHORT}</Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search catalog"
              asChild
            >
              <Link href="/search">
                <Search className="h-4 w-4" />
              </Link>
            </Button>
            <a
              href={SITE_CONFIG.phoneHref}
              className="flex items-center gap-2 text-[13px] font-medium transition-colors whitespace-nowrap text-muted-foreground hover:text-foreground"
            >
              <span className="relative flex h-2 w-2">
                <span className="pulse-accent absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              {SITE_CONFIG.phone}
            </a>
            <Button
              variant="brand"
              size="sm"
              onClick={() => {
                track("primary_cta_clicked", { intent: "estimate", placement: "header" });
                openEstimate();
              }}
            >
              {CTA_ESTIMATE}
            </Button>
          </div>

          <div className="flex min-[1440px]:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 shrink-0"
              aria-label="Open navigation menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </nav>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="right"
          showClose={false}
          className="w-full sm:max-w-full h-full max-h-none border-0 p-0 gap-0 flex flex-col min-[1440px]:hidden z-[200] rounded-none"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation menu</SheetTitle>
          </SheetHeader>
          <div className="flex items-center justify-between gap-3 px-4 h-[60px] border-b border-border/40 shrink-0 [&_img]:max-w-[65vw] [&_img]:object-contain [&_img]:object-left">
            <Logo />
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0" aria-label="Close menu">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>

          <nav className="flex-1 overflow-y-auto">
            <div className="border-b border-border/40">
              <Link
                href="/search"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-6 py-5 text-xl font-medium text-muted-foreground"
              >
                <Search className="h-5 w-5" />
                Search
              </Link>
            </div>
            {PRIMARY_NAV.map((item) => (
              <div key={item.label} className="border-b border-border/40">
                {"children" in item && item.children ? (
                  <>
                    <button
                      type="button"
                      aria-expanded={expandedMobile === item.label}
                      onClick={() =>
                        setExpandedMobile(expandedMobile === item.label ? null : item.label)
                      }
                      className={cn(
                        "flex w-full items-center justify-between px-6 py-5 text-xl font-medium",
                        navItemActive(item.href, item.children)
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
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
                          className="flex min-h-11 items-center py-2 text-sm font-medium text-foreground"
                        >
                          All {item.label}
                        </Link>
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "block py-2 text-sm",
                              pathname === child.href
                                ? "text-foreground font-medium"
                                : "text-muted-foreground",
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                        {"footerLink" in item && item.footerLink && (
                          <Link
                            href={item.footerLink.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex min-h-11 items-center py-2 text-sm text-muted-foreground"
                          >
                            {item.footerLink.label}
                          </Link>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block px-6 py-5 text-xl font-medium",
                      navItemActive(item.href)
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="shrink-0 border-t border-border/40 px-6 py-4 pb-safe space-y-3">
            <a href={SITE_CONFIG.phoneHref} className="flex min-h-11 items-center gap-3 text-base font-medium">
              <Phone className="h-5 w-5" strokeWidth={1.5} />
              Call {SITE_CONFIG.phone}
            </a>
            <a href={SITE_CONFIG.phoneSmsHref} className="flex min-h-11 items-center gap-3 text-base font-medium">
              <MessageSquare className="h-5 w-5" strokeWidth={1.5} />
              Text {SITE_CONFIG.phone}
            </a>
            <Button
              variant="brand"
              className="w-full"
              onClick={() => {
                track("primary_cta_clicked", { intent: "estimate", placement: "mobile_menu" });
                setMobileOpen(false);
                openEstimate();
              }}
            >
              {CTA_ESTIMATE}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <div
        data-mobile-nav-bar=""
        className={cn(
          "fixed left-0 right-0 bottom-0 z-[100] xl:hidden pb-safe border-t",
          "bg-background border-border transition-opacity duration-200",
          (wizardBarActive || ctaSuppressed || formInView || mobileOpen || !pastHero || pathname?.startsWith("/estimate")) && "invisible pointer-events-none opacity-0",
        )}
      >
        <div className="flex items-stretch gap-2 p-2">
          <a
            href={SITE_CONFIG.phoneHref}
            aria-label={`Call us at ${SITE_CONFIG.phone}`}
            className="flex min-h-14 w-14 shrink-0 items-center justify-center rounded-sm border border-border text-foreground hover-elevate active-elevate-2"
          >
            <Phone className="h-5 w-5" strokeWidth={1.5} />
          </a>
          <button
            type="button"
            onClick={() => {
              track("mobile_sticky_cta_clicked", { intent: "estimate" });
              openEstimate();
            }}
            aria-label={CTA_ESTIMATE}
            className="flex min-h-14 flex-1 items-center justify-center rounded-sm bg-accent text-accent-foreground px-4 text-base font-medium"
          >
            {CTA_ESTIMATE}
          </button>
        </div>
      </div>
    </>
  );
}
