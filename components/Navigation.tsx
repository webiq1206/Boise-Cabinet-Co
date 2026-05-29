"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Phone, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Services", href: "/#services" },
  { label: "How We Build", href: "/#how-we-build" },
  { label: "Estimates", href: "/#calculator" },
  { label: "FAQ", href: "/#faq" },
  { label: "Blog", href: "/blog" },
];

const PHONE = "(208) 555-0100";
const PHONE_HREF = "tel:2085550100";

function Logo({ hero }: { hero: boolean }) {
  return (
    <Link href="/" className="flex flex-col leading-none">
      <span
        className="font-serif text-[1.05rem] font-light tracking-tight"
        style={{ color: hero ? "#fff" : "#3A3E3D", transition: "color 0.3s" }}
      >
        Boise{" "}
        <em
          style={{
            fontStyle: "italic",
            color: hero ? "rgba(255,255,255,0.65)" : "#3A3E3D",
            transition: "color 0.3s",
          }}
        >
          Remodeling
        </em>{" "}
        Co
      </span>
      <span
        className="text-[9px] tracking-[0.15em] uppercase font-sans font-medium mt-0.5"
        style={{ color: hero ? "rgba(255,255,255,0.4)" : "#6E736F", transition: "color 0.3s" }}
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

  const isPortal = pathname?.startsWith("/admin") || pathname?.startsWith("/subcontractor");
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
      <header className="sticky top-0 z-50 w-full border-b bg-background/98 backdrop-blur supports-[backdrop-filter]:bg-background/95">
        <nav className="container flex h-16 items-center justify-between gap-4 px-6">
          <Logo hero={false} />
        </nav>
      </header>
    );
  }

  return (
    <>
      <header
        className="sticky top-0 z-[100] w-full transition-all duration-300"
        style={{
          background: isHeroMode ? "transparent" : "rgba(255,255,255,0.97)",
          backdropFilter: isHeroMode ? "none" : "blur(12px)",
          borderBottom: isHeroMode ? "none" : "1px solid rgba(58,62,61,0.08)",
        }}
      >
        <nav className="container flex h-[60px] items-center justify-between gap-4 px-4 md:px-6">
          <Logo hero={isHeroMode} />

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-0">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-[13px] font-medium transition-colors rounded-sm hover-elevate"
                style={{
                  color: isHeroMode
                    ? pathname === link.href ? "#fff" : "rgba(255,255,255,0.75)"
                    : pathname === link.href ? "#3A3E3D" : "#5A5F5C",
                  transition: "color 0.3s",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop right: phone + CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href={PHONE_HREF}
              className="flex items-center gap-2 text-[13px] font-medium"
              style={{
                color: isHeroMode ? "rgba(255,255,255,0.8)" : "#5A5F5C",
                transition: "color 0.3s",
              }}
              data-testid="link-phone-desktop"
            >
              <span className="relative flex h-2 w-2">
                <span className="pulse-green absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              {PHONE}
            </a>
            <a
              href="/#consult"
              className="inline-flex items-center px-4 py-2 text-[13px] font-medium rounded-sm"
              style={{ background: "#3A3E3D", color: "#FFFFFF" }}
            >
              Book a free visit
            </a>
          </div>

          {/* Mobile: hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open navigation menu"
                  style={{ color: isHeroMode ? "#fff" : undefined }}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-[360px]" style={{ background: "#FFFFFF" }}>
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
                      className="px-4 py-3 text-base font-medium rounded-sm transition-colors"
                      style={{ color: "#3A3E3D" }}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="mt-6 pt-6 border-t space-y-3">
                    <a
                      href={PHONE_HREF}
                      className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-sm"
                      style={{ color: "#3A3E3D" }}
                    >
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="pulse-green absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                      </span>
                      {PHONE}
                    </a>
                    <a
                      href="/#consult"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center w-full py-3 text-base font-medium rounded-sm"
                      style={{ background: "#3A3E3D", color: "#FFFFFF" }}
                    >
                      Book a free visit
                    </a>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      {/* Mobile sticky bottom bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[100] md:hidden pb-safe"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(58,62,61,0.08)",
        }}
      >
        <div className="grid grid-cols-2 divide-x divide-[rgba(58,62,61,0.08)]">
          <a
            href={PHONE_HREF}
            className="flex items-center justify-center gap-2 py-4 text-sm font-medium"
            style={{ color: "#3A3E3D" }}
            data-testid="button-call-mobile"
          >
            <Phone className="h-4 w-4" />
            Call
          </a>
          <a
            href="/#consult"
            className="flex items-center justify-center gap-2 py-4 text-sm font-medium"
            style={{ color: "#3A3E3D" }}
            data-testid="button-begin-conversation-mobile"
          >
            Begin a conversation
          </a>
        </div>
      </div>
    </>
  );
}
