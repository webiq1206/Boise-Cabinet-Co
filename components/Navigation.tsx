"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Menu, FileText, Scissors, TreeDeciduous, Droplets, ArrowRight, Snowflake, ChevronDown } from "lucide-react";
import { PRIORITY_SERVICES } from "@/shared/contentData";

// Menu grouping configuration
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

// Static pages with custom URLs that differ from PRIORITY_SERVICES slugs
const STATIC_SERVICE_OVERRIDES: Record<string, { name: string; href: string }> = {
  'christmas-light-installation': { name: 'Christmas Lights', href: '/services/christmas-lights' },
};

// Build menu items from PRIORITY_SERVICES
const menuGroups = MENU_GROUPS.map(group => ({
  ...group,
  services: group.serviceSlugs
    .map(slug => {
      // Check for static page overrides first
      if (STATIC_SERVICE_OVERRIDES[slug]) {
        return STATIC_SERVICE_OVERRIDES[slug];
      }
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
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/98 backdrop-blur supports-[backdrop-filter]:bg-background/95">
      <nav className="container flex h-20 items-center justify-between gap-4 px-8 md:px-12">
        <Link href="/" className="flex items-center flex-shrink-0">
          <Image 
            src="/images/lawn-care-kuna-logo.png" 
            alt="Lawn Care Kuna - Professional Lawn Care and Landscaping Services in Kuna Idaho" 
            className="h-10 w-auto"
            width={200}
            height={40}
            priority
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
                      pathname === "/" ? "text-primary" : "text-foreground/80 hover:text-foreground"
                    }`}
                  >
                    Home
                  </span>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-foreground/80 hover:text-foreground">
                  Services
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[900px] p-6">
                    <div className="grid gap-4 md:grid-cols-4">
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
                                  <span className="group flex items-center gap-2 select-none rounded-md px-3 py-2 text-sm leading-tight transition-colors hover-elevate cursor-pointer">
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

                    <div className="mt-4 pt-4 border-t">
                      <Link href="/services">
                        <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary/5 hover-elevate active-elevate-2 transition-all cursor-pointer group">
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
                      pathname === "/about" ? "text-primary" : "text-foreground/80 hover:text-foreground"
                    }`}
                  >
                    About
                  </span>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/blog">
                  <span
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                      pathname?.startsWith("/blog") ? "text-primary" : "text-foreground/80 hover:text-foreground"
                    }`}
                  >
                    Blog
                  </span>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/contact">
                  <span
                    className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                      pathname === "/contact" ? "text-primary" : "text-foreground/80 hover:text-foreground"
                    }`}
                  >
                    Contact
                  </span>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-3 border-l pl-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/get-quote">Get Free Quote</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex lg:hidden items-center gap-2">
          <Button variant="ghost" size="icon" asChild aria-label="Get free quote">
            <Link href="/get-quote">
              <FileText className="h-4 w-4" />
            </Link>
          </Button>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[400px] overflow-y-auto">
              <nav className="flex flex-col gap-1 mt-8">
                {/* Home */}
                <Link href="/" onClick={() => setMobileOpen(false)}>
                  <div className="px-4 py-3 text-base font-medium rounded-md hover-elevate active-elevate-2 transition-colors">
                    Home
                  </div>
                </Link>
                
                {/* All Service Groups - Collapsible */}
                {menuGroups.map((group) => (
                  <div key={group.title} className="mt-2">
                    <button
                      onClick={() => toggleCategory(group.title)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground tracking-wide uppercase hover-elevate active-elevate-2 rounded-md transition-colors"
                    >
                      <span>{group.title}</span>
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform duration-200 ${
                          expandedCategory === group.title ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    <div 
                      className={`overflow-hidden transition-all duration-200 ${
                        expandedCategory === group.title ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="mt-1 space-y-0.5 pb-2">
                        {group.services.map((service) => (
                          <Link key={service.href} href={service.href} onClick={() => setMobileOpen(false)}>
                            <div className="px-6 py-2.5 text-sm rounded-md hover-elevate active-elevate-2 transition-colors">
                              {service.name}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Commercial Services - Collapsible */}
                <div className="mt-2">
                  <button
                    onClick={() => toggleCategory('Commercial')}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground tracking-wide uppercase hover-elevate active-elevate-2 rounded-md transition-colors"
                  >
                    <span>Commercial</span>
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform duration-200 ${
                        expandedCategory === 'Commercial' ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  <div 
                    className={`overflow-hidden transition-all duration-200 ${
                      expandedCategory === 'Commercial' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="mt-1 space-y-0.5 pb-2">
                      {commercialServices.map((service) => (
                        <Link key={service.href} href={service.href} onClick={() => setMobileOpen(false)}>
                          <div className="px-6 py-2.5 text-sm rounded-md hover-elevate active-elevate-2 transition-colors">
                            {service.name}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Main Pages */}
                <div className="mt-6 pt-6 border-t space-y-0.5">
                  <Link href="/about" onClick={() => setMobileOpen(false)}>
                    <div className="px-4 py-3 text-base font-medium rounded-md hover-elevate active-elevate-2 transition-colors">
                      About
                    </div>
                  </Link>

                  <Link href="/blog" onClick={() => setMobileOpen(false)}>
                    <div className="px-4 py-3 text-base font-medium rounded-md hover-elevate active-elevate-2 transition-colors">
                      Blog
                    </div>
                  </Link>

                  <Link href="/contact" onClick={() => setMobileOpen(false)}>
                    <div className="px-4 py-3 text-base font-medium rounded-md hover-elevate active-elevate-2 transition-colors">
                      Contact
                    </div>
                  </Link>

                  <Button className="w-full mt-4" asChild>
                    <Link href="/get-quote" onClick={() => setMobileOpen(false)}>
                      Get Free Estimate
                    </Link>
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
