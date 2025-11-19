import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Menu, FileText } from "lucide-react";
import logoUrl from "@assets/Lawn Care Kuna Logo_1763512021933.png";

const lawnCareServices = [
  { name: "Lawn Mowing", href: "/services/lawn-mowing" },
  { name: "Lawn Maintenance", href: "/services/lawn-maintenance" },
  { name: "Aeration", href: "/services/aeration" },
  { name: "Fertilization", href: "/services/fertilization" },
  { name: "Weed Control", href: "/services/weed-control" },
  { name: "Hedge Trimming", href: "/services/hedge-trimming" },
  { name: "Seasonal Cleanup", href: "/services/seasonal-cleanup" },
  { name: "Sprinkler Blowout", href: "/services/sprinkler-blowout" },
];

const landscapingServices = [
  { name: "Sod Installation", href: "/services/sod-installation" },
  { name: "Patio Installation", href: "/services/patio-installation" },
  { name: "Retaining Walls", href: "/services/retaining-walls" },
  { name: "Pond Installation", href: "/services/pond-installation" },
  { name: "Fence Installation", href: "/services/fence-installation" },
  { name: "Landscape Lighting", href: "/services/landscape-lighting" },
  { name: "Irrigation Systems", href: "/services/irrigation-installation" },
  { name: "View All Landscaping", href: "/services/landscaping" },
];

const commercialServices = [
  { name: "HOA Services", href: "/commercial/hoa-services" },
  { name: "Commercial", href: "/commercial" },
  { name: "Municipal Services", href: "/commercial/municipal-services" },
  { name: "Commercial Lawn Care", href: "/commercial/commercial-lawn-care" },
];

export function Navigation() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/98 backdrop-blur supports-[backdrop-filter]:bg-background/95">
      <nav className="container flex h-20 items-center justify-between px-8 md:px-12">
        <Link href="/" className="flex items-center">
          <img 
            src={logoUrl} 
            alt="Lawn Care Kuna" 
            className="h-10 w-auto"
            data-testid="logo-image"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <Link href="/">
                  <span
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                      location === "/" ? "text-primary" : "text-foreground/80 hover:text-foreground"
                    }`}
                    data-testid="nav-home"
                  >
                    Home
                  </span>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-foreground/80 hover:text-foreground" data-testid="nav-services">
                  Services
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[800px] gap-6 p-8 md:grid-cols-3">
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase mb-3">Lawn Care</h3>
                      <ul className="space-y-1.5">
                        {lawnCareServices.map((service) => (
                          <li key={service.href}>
                            <Link href={service.href}>
                              <span className="block select-none rounded-md px-3 py-2 text-sm leading-none transition-colors hover-elevate cursor-pointer" data-testid={`link-${service.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                {service.name}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase mb-3">Landscaping</h3>
                      <ul className="space-y-1.5">
                        {landscapingServices.map((service) => (
                          <li key={service.href}>
                            <Link href={service.href}>
                              <span className="block select-none rounded-md px-3 py-2 text-sm leading-none transition-colors hover-elevate cursor-pointer" data-testid={`link-${service.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                {service.name}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase mb-3">Specialty</h3>
                      <ul className="space-y-1.5 mb-6">
                        <li>
                          <Link href="/services/christmas-lights">
                            <span className="block select-none rounded-md px-3 py-2 text-sm leading-none transition-colors hover-elevate cursor-pointer" data-testid="link-christmas-lights">
                              Christmas Lights
                            </span>
                          </Link>
                        </li>
                      </ul>
                      <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase mb-3">Commercial</h3>
                      <ul className="space-y-1.5">
                        {commercialServices.map((service) => (
                          <li key={service.href}>
                            <Link href={service.href}>
                              <span className="block select-none rounded-md px-3 py-2 text-sm leading-none transition-colors hover-elevate cursor-pointer" data-testid={`link-${service.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                {service.name}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/about">
                  <span
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                      location === "/about" ? "text-primary" : "text-foreground/80 hover:text-foreground"
                    }`}
                    data-testid="nav-about"
                  >
                    About
                  </span>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/contact">
                  <span
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                      location === "/contact" ? "text-primary" : "text-foreground/80 hover:text-foreground"
                    }`}
                    data-testid="nav-contact"
                  >
                    Contact
                  </span>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-3 border-l pl-8">
            <Button 
              variant="ghost" 
              size="sm" 
              asChild 
              data-testid="button-pricing-desktop"
            >
              <Link href="/pricing">
                View Pricing
              </Link>
            </Button>

            <Button 
              size="sm" 
              onClick={() => window.location.href = "/get-quote"}
              data-testid="button-quote-desktop"
            >
              Get Free Quote
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex lg:hidden items-center gap-2">
          <Button variant="ghost" size="icon" asChild data-testid="button-quote-mobile">
            <Link href="/get-quote">
              <FileText className="h-4 w-4" />
            </Link>
          </Button>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-menu-mobile">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[400px] overflow-y-auto">
              <nav className="flex flex-col gap-1 mt-8">
                {/* Home */}
                <Link href="/" onClick={() => setMobileOpen(false)}>
                  <div className="px-4 py-3 text-base font-medium rounded-md hover-elevate active-elevate-2 transition-colors" data-testid="link-home-mobile">
                    Home
                  </div>
                </Link>
                
                {/* Lawn Care Services */}
                <div className="mt-4">
                  <h3 className="px-4 py-2 text-sm font-semibold text-foreground tracking-wide uppercase">Lawn Care Services</h3>
                  <div className="mt-1 space-y-0.5">
                    {lawnCareServices.map((service) => (
                      <Link key={service.href} href={service.href} onClick={() => setMobileOpen(false)}>
                        <div className="px-6 py-2.5 text-sm rounded-md hover-elevate active-elevate-2 transition-colors">
                          {service.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Landscaping */}
                <div className="mt-4">
                  <h3 className="px-4 py-2 text-sm font-semibold text-foreground tracking-wide uppercase">Landscaping</h3>
                  <div className="mt-1 space-y-0.5">
                    {landscapingServices.map((service) => (
                      <Link key={service.href} href={service.href} onClick={() => setMobileOpen(false)}>
                        <div className="px-6 py-2.5 text-sm rounded-md hover-elevate active-elevate-2 transition-colors">
                          {service.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Commercial Services */}
                <div className="mt-4">
                  <h3 className="px-4 py-2 text-sm font-semibold text-foreground tracking-wide uppercase">Commercial Services</h3>
                  <div className="mt-1 space-y-0.5">
                    {commercialServices.map((service) => (
                      <Link key={service.href} href={service.href} onClick={() => setMobileOpen(false)}>
                        <div className="px-6 py-2.5 text-sm rounded-md hover-elevate active-elevate-2 transition-colors">
                          {service.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Main Pages */}
                <div className="mt-6 pt-6 border-t space-y-0.5">
                  <Link href="/about" onClick={() => setMobileOpen(false)}>
                    <div className="px-4 py-3 text-base font-medium rounded-md hover-elevate active-elevate-2 transition-colors" data-testid="link-about-mobile">
                      About
                    </div>
                  </Link>

                  <Link href="/contact" onClick={() => setMobileOpen(false)}>
                    <div className="px-4 py-3 text-base font-medium rounded-md hover-elevate active-elevate-2 transition-colors" data-testid="link-contact-mobile">
                      Contact
                    </div>
                  </Link>

                  <Button 
                    className="w-full mt-4" 
                    onClick={() => {
                      window.location.href = "/contact";
                      setMobileOpen(false);
                    }}
                    data-testid="button-quote-mobile"
                  >
                    Free Consultation
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
