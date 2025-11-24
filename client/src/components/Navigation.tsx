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
import { Menu, FileText, Scissors, TreeDeciduous, Sparkles, Droplets, Building2, ArrowRight, Snowflake } from "lucide-react";
import logoUrlPng from "@assets/Lawn Care Kuna Logo_1763734387982.png";
import logoUrlWebp from "@assets/Lawn Care Kuna Logo_400x100.webp";
import { PRIORITY_SERVICES } from "@shared/contentData";
import { SearchBar } from "@/components/SearchBar";

// Menu grouping configuration - organizes all services into logical categories
interface MenuGroup {
  title: string;
  icon: typeof Scissors;
  serviceSlugs: string[];
}

const MENU_GROUPS: MenuGroup[] = [
  {
    title: "Lawn Care",
    icon: Scissors,
    serviceSlugs: [
      'lawn-mowing',
      'aeration',
      'fertilization',
      'weed-control',
      'dethatching',
      'overseeding',
      'lawn-edging',
      'lawn-renovation',
    ]
  },
  {
    title: "Landscaping",
    icon: TreeDeciduous,
    serviceSlugs: [
      'patio-installation',
      'retaining-walls',
      'fire-pit-installation',
      'hedge-trimming',
      'mulch-installation',
      'sod-installation',
    ]
  },
  {
    title: "Seasonal & Specialty",
    icon: Snowflake,
    serviceSlugs: [
      'spring-cleanup',
      'fall-cleanup',
      'snow-removal',
      'christmas-light-installation',
      'tree-trimming',
      'tree-removal',
      'stump-grinding',
    ]
  },
  {
    title: "Irrigation & Lighting",
    icon: Droplets,
    serviceSlugs: [
      'sprinkler-system-installation',
      'sprinkler-repair',
      'irrigation-repair',
      'irrigation-maintenance',
      'sprinkler-blowout',
      'landscape-lighting',
    ]
  },
];

// Build menu items from PRIORITY_SERVICES using the slug-based grouping
const menuGroups = MENU_GROUPS.map(group => ({
  ...group,
  services: group.serviceSlugs
    .map(slug => {
      const service = PRIORITY_SERVICES.find(s => s.slug === slug);
      return service ? { name: service.name, href: `/services/${service.slug}` } : null;
    })
    .filter((s): s is { name: string; href: string } => s !== null)
}));

const commercialServices = [
  { name: "HOA Services", href: "/commercial/hoa-services" },
  { name: "Commercial Services", href: "/commercial" },
  { name: "Municipal Services", href: "/commercial/municipal-services" },
];

export function Navigation() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/98 backdrop-blur supports-[backdrop-filter]:bg-background/95">
      <nav className="container flex h-20 items-center justify-between gap-4 px-8 md:px-12">
        <Link href="/" className="flex items-center flex-shrink-0">
          <picture>
            <source srcSet={logoUrlWebp} type="image/webp" />
            <img 
              src={logoUrlPng} 
              alt="Lawn Care Kuna - Professional Lawn Care and Landscaping Services in Kuna Idaho" 
              className="h-10 w-auto"
              width="200"
              height="40"
              loading="eager"
              data-testid="logo-image"
            />
          </picture>
        </Link>

        {/* Desktop Search */}
        <div className="hidden lg:flex flex-1 max-w-md">
          <SearchBar />
        </div>

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
                  <div className="w-[900px] p-6">
                    <div className="grid gap-4 md:grid-cols-4">
                      {/* Service Columns */}
                      {menuGroups.map((group) => (
                        <div key={group.title} className="bg-muted/30 rounded-lg p-5 space-y-3 border border-border/50">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 rounded-md bg-primary/10">
                              <group.icon className="h-4 w-4 text-primary" />
                            </div>
                            <h3 className="text-sm font-bold text-foreground">{group.title}</h3>
                          </div>
                          <ul className="space-y-1">
                            {group.services.map((service) => (
                              <li key={service.href}>
                                <Link href={service.href}>
                                  <span className="group flex items-center gap-2 select-none rounded-md px-3 py-2 text-sm leading-tight transition-colors hover-elevate cursor-pointer" data-testid={`link-${service.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                    <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                                    <span className="group-hover:text-primary transition-colors">{service.name}</span>
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* View All Services CTA */}
                    <div className="mt-4 pt-4 border-t">
                      <Link href="/services">
                        <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary/5 hover-elevate active-elevate-2 transition-all cursor-pointer group" data-testid="link-view-all-services">
                          <span className="text-sm font-medium text-primary">View All Services</span>
                          <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
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
                <Link href="/blog">
                  <span
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                      location.startsWith("/blog") ? "text-primary" : "text-foreground/80 hover:text-foreground"
                    }`}
                    data-testid="nav-blog"
                  >
                    Blog
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
          <Button variant="ghost" size="icon" asChild data-testid="button-quote-mobile" aria-label="Get free quote">
            <Link href="/get-quote">
              <FileText className="h-4 w-4" />
            </Link>
          </Button>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-menu-mobile" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[400px] overflow-y-auto">
              <nav className="flex flex-col gap-1 mt-8">
                {/* Mobile Search */}
                <div className="mb-6 px-2">
                  <SearchBar onClose={() => setMobileOpen(false)} />
                </div>

                {/* Home */}
                <Link href="/" onClick={() => setMobileOpen(false)}>
                  <div className="px-4 py-3 text-base font-medium rounded-md hover-elevate active-elevate-2 transition-colors" data-testid="link-home-mobile">
                    Home
                  </div>
                </Link>
                
                {/* All Service Groups */}
                {menuGroups.map((group) => (
                  <div key={group.title} className="mt-4">
                    <h3 className="px-4 py-2 text-sm font-semibold text-foreground tracking-wide uppercase">{group.title}</h3>
                    <div className="mt-1 space-y-0.5">
                      {group.services.map((service) => (
                        <Link key={service.href} href={service.href} onClick={() => setMobileOpen(false)}>
                          <div className="px-6 py-2.5 text-sm rounded-md hover-elevate active-elevate-2 transition-colors">
                            {service.name}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Commercial Services */}
                <div className="mt-4">
                  <h3 className="px-4 py-2 text-sm font-semibold text-foreground tracking-wide uppercase">Commercial</h3>
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

                  <Link href="/blog" onClick={() => setMobileOpen(false)}>
                    <div className="px-4 py-3 text-base font-medium rounded-md hover-elevate active-elevate-2 transition-colors" data-testid="link-blog-mobile">
                      Blog
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
                    Get Free Estimate
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
