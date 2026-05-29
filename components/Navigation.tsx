"use client";

import { useState } from "react";
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

function Logo() {
  return (
    <Link href="/" className="flex flex-col leading-none">
      <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
        Boise Remodeling Co
      </span>
      <span className="text-[11px] text-muted-foreground tracking-widest uppercase font-sans">
        Design &amp; Build
      </span>
    </Link>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPortal = pathname?.startsWith("/admin") || pathname?.startsWith("/subcontractor");

  if (isPortal) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/98 backdrop-blur supports-[backdrop-filter]:bg-background/95">
        <nav className="container flex h-16 items-center justify-between gap-4 px-6">
          <Logo />
        </nav>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-[100] w-full border-b bg-background/98 backdrop-blur supports-[backdrop-filter]:bg-background/95">
        <nav className="container flex h-16 items-center justify-between gap-4 px-4 md:px-6">
          <Logo />

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-md hover-elevate ${
                  pathname === link.href
                    ? "text-primary"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop right: phone + CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href={PHONE_HREF}
              className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              data-testid="link-phone-desktop"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="pulse-green absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              {PHONE}
            </a>
            <Button size="sm" asChild>
              <a href="/#consult">Book a free visit</a>
            </Button>
          </div>

          {/* Mobile: hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-[360px]">
                <div className="flex items-center justify-between mb-8">
                  <Logo />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 text-base font-medium rounded-md hover-elevate active-elevate-2 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="mt-6 pt-6 border-t space-y-3">
                    <a
                      href={PHONE_HREF}
                      className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-md hover-elevate"
                    >
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="pulse-green absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                      </span>
                      {PHONE}
                    </a>
                    <Button className="w-full" asChild>
                      <a href="/#consult" onClick={() => setMobileOpen(false)}>
                        Book a free visit
                      </a>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden border-t bg-background/98 backdrop-blur supports-[backdrop-filter]:bg-background/95 pb-safe">
        <div className="grid grid-cols-2 divide-x">
          <a
            href={PHONE_HREF}
            className="flex items-center justify-center gap-2 py-4 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            data-testid="button-call-mobile"
          >
            <Phone className="h-4 w-4" />
            Call
          </a>
          <a
            href="/#consult"
            className="flex items-center justify-center gap-2 py-4 text-sm font-semibold text-primary hover:bg-muted transition-colors"
            data-testid="button-begin-conversation-mobile"
          >
            Begin a conversation
          </a>
        </div>
      </div>
    </>
  );
}
