"use client";

import { useState, useEffect } from "react";
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
import { Menu, X, ChevronDown, Search, Phone, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTA_CONSULT_SHORT, CTA_PORTAL_SHORT } from "@/shared/ctaCopy";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { PRIMARY_NAV } from "@/shared/cabinetNav";
import { useModals } from "@/components/modals/ModalProvider";
import { useAuth } from "@/hooks/useAuth";

function Logo() {
  return (
    <Link href="/" className="flex items-center leading-none" aria-label="Boise Cabinet Co - home">
      {/* Reverse (white) wordmark for the dark ground. eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/boise-cabinet-co-wordmark-reverse.svg"
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
  const [mobileOpen, setMobileOpen] = useState(false);
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
      "px-3 py-2 text-[13px] font-medium transition-colors rounded-sm hover-elevate",
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
      <header className="sticky top-0 z-[100] w-full bg-background border-b border-border">
        <nav className="container flex h-[60px] items-center justify-between gap-4 px-4 md:px-6">
          <Logo />

          <div className="hidden xl:flex items-center">
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

          <div className="hidden xl:flex items-center gap-3 shrink-0">
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
            <Button variant="brand" size="sm" onClick={openEstimate}>
              {CTA_CONSULT_SHORT}
            </Button>
          </div>

          <div className="flex xl:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </nav>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-[200] bg-background flex flex-col xl:hidden",
          "transition-opacity duration-200",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
        // When closed, `inert` removes the menu's links/buttons from the tab
        // order and the a11y tree, fixing aria-hidden-focus without unmounting.
        {...({ inert: mobileOpen ? undefined : "" } as Record<string, unknown>)}
      >
        <div className="flex items-center justify-between px-6 h-[60px] border-b border-border/40 shrink-0">
          <Logo />
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </Button>
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
                        className="block py-2 text-sm font-medium text-foreground"
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
                          className="block py-2 text-sm text-muted-foreground"
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

        <div className="shrink-0 border-t border-border/40 px-6 py-6 space-y-3">
          <a href={SITE_CONFIG.phoneHref} className="flex items-center gap-3 text-base font-medium">
            <Phone className="h-5 w-5" strokeWidth={1.5} />
            Call {SITE_CONFIG.phone}
          </a>
          <a href={SITE_CONFIG.phoneSmsHref} className="flex items-center gap-3 text-base font-medium">
            <MessageSquare className="h-5 w-5" strokeWidth={1.5} />
            Text {SITE_CONFIG.phone}
          </a>
          <Button
            variant="brand"
            className="w-full"
            onClick={() => {
              setMobileOpen(false);
              openEstimate();
            }}
          >
            {CTA_CONSULT_SHORT}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "fixed left-0 right-0 bottom-0 z-[100] xl:hidden pb-safe border-t",
          "bg-background border-border transition-opacity duration-200",
          wizardBarActive && "pointer-events-none opacity-0",
        )}
      >
        <div className="grid grid-cols-3 divide-x divide-border">
          <a
            href={SITE_CONFIG.phoneHref}
            aria-label={`Call us at ${SITE_CONFIG.phone}`}
            className="flex items-center justify-center gap-2 py-4 text-sm font-medium text-foreground"
          >
            <Phone className="h-4 w-4" strokeWidth={1.5} />
            Call
          </a>
          <a
            href={SITE_CONFIG.phoneSmsHref}
            aria-label={`Text us at ${SITE_CONFIG.phone}`}
            className="flex items-center justify-center gap-2 py-4 text-sm font-medium text-foreground"
          >
            <MessageSquare className="h-4 w-4" strokeWidth={1.5} />
            Text
          </a>
          <button
            type="button"
            onClick={openEstimate}
            aria-label={CTA_CONSULT_SHORT}
            className="flex items-center justify-center gap-2 py-4 text-sm font-medium text-foreground"
          >
            {CTA_CONSULT_SHORT}
          </button>
        </div>
      </div>
    </>
  );
}
