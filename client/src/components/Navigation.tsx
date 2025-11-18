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
import { Menu, Phone } from "lucide-react";

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
  { name: "Property Management", href: "/commercial/property-management" },
  { name: "Municipal Services", href: "/commercial/municipal-services" },
  { name: "Commercial Lawn Care", href: "/commercial/commercial-lawn-care" },
];

export function Navigation() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl md:text-2xl font-bold text-primary">
            Lawn Care Kuna
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-6">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/">
                  <NavigationMenuLink
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                      location === "/" ? "text-primary" : "text-foreground"
                    }`}
                    data-testid="nav-home"
                  >
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger data-testid="nav-services">Services</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[800px] gap-3 p-6 md:grid-cols-3">
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-foreground">Lawn Care</h3>
                      <ul className="space-y-1">
                        {lawnCareServices.map((service) => (
                          <li key={service.href}>
                            <Link href={service.href}>
                              <a className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover-elevate text-sm" data-testid={`link-${service.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                {service.name}
                              </a>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-foreground">Landscaping</h3>
                      <ul className="space-y-1">
                        {landscapingServices.map((service) => (
                          <li key={service.href}>
                            <Link href={service.href}>
                              <a className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover-elevate text-sm" data-testid={`link-${service.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                {service.name}
                              </a>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-foreground">Specialty</h3>
                      <ul className="space-y-1">
                        <li>
                          <Link href="/services/christmas-lights">
                            <a className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover-elevate text-sm" data-testid="link-christmas-lights">
                              Christmas Lights
                            </a>
                          </Link>
                        </li>
                      </ul>
                      <h3 className="mb-2 mt-4 text-sm font-semibold text-foreground">Commercial</h3>
                      <ul className="space-y-1">
                        {commercialServices.map((service) => (
                          <li key={service.href}>
                            <Link href={service.href}>
                              <a className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover-elevate text-sm" data-testid={`link-${service.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                {service.name}
                              </a>
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
                  <NavigationMenuLink
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                      location === "/about" ? "text-primary" : "text-foreground"
                    }`}
                    data-testid="nav-about"
                  >
                    About
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/contact">
                  <NavigationMenuLink
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                      location === "/contact" ? "text-primary" : "text-foreground"
                    }`}
                    data-testid="nav-contact"
                  >
                    Contact
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <a href="tel:2083522011" className="flex items-center gap-2">
            <Button variant="outline" size="sm" data-testid="button-call-desktop">
              <Phone className="h-4 w-4" />
              <span className="hidden xl:inline">(208) 352-2011</span>
            </Button>
          </a>

          <Link href="/contact">
            <Button size="sm" data-testid="button-quote-desktop">Get Free Quote</Button>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="flex lg:hidden items-center gap-2">
          <a href="tel:2083522011">
            <Button variant="outline" size="icon" data-testid="button-call-mobile">
              <Phone className="h-4 w-4" />
            </Button>
          </a>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" data-testid="button-menu-mobile">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-4 mt-8">
                <Link href="/" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start" data-testid="link-home-mobile">
                    Home
                  </Button>
                </Link>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm px-4 text-muted-foreground">Lawn Care Services</h3>
                  {lawnCareServices.map((service) => (
                    <Link key={service.href} href={service.href} onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start pl-8" size="sm">
                        {service.name}
                      </Button>
                    </Link>
                  ))}
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm px-4 text-muted-foreground">Landscaping</h3>
                  {landscapingServices.map((service) => (
                    <Link key={service.href} href={service.href} onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start pl-8" size="sm">
                        {service.name}
                      </Button>
                    </Link>
                  ))}
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm px-4 text-muted-foreground">Commercial Services</h3>
                  {commercialServices.map((service) => (
                    <Link key={service.href} href={service.href} onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start pl-8" size="sm">
                        {service.name}
                      </Button>
                    </Link>
                  ))}
                </div>

                <Link href="/about" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start" data-testid="link-about-mobile">
                    About
                  </Button>
                </Link>

                <Link href="/contact" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start" data-testid="link-contact-mobile">
                    Contact
                  </Button>
                </Link>

                <Link href="/contact" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full mt-4" data-testid="button-quote-mobile">
                    Get Free Quote
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
