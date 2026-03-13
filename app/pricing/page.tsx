"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Testimonials } from "@/components/Testimonials";
import { 
  ArrowRight, 
  Leaf, 
  TreeDeciduous, 
  Hammer, 
  Droplets,
  Sparkles
} from "lucide-react";
import { QuoteLightbox } from "@/components/QuoteLightbox";

const pricingCategories = [
  {
    title: "Lawn Care",
    description: "Regular maintenance services",
    icon: Leaf,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    services: [
      { name: "Lawn Mowing", price: "$35", priceNote: "starting", note: "Based on lawn size", slug: "lawn-mowing" },
      { name: "Lawn Edging", price: "$15", priceNote: "starting", note: "Add-on to mowing", slug: "lawn-edging" },
      { name: "Fertilization", price: "$50", priceNote: "starting", note: "Per application", slug: "fertilization" },
      { name: "Weed Control", price: "$50", priceNote: "starting", note: "Per treatment", slug: "weed-control" },
      { name: "Aeration", price: "$75", priceNote: "starting", note: "Annual service", slug: "aeration" },
      { name: "Overseeding", price: "$100", priceNote: "starting", note: "Includes seed", slug: "overseeding" },
    ],
  },
  {
    title: "Seasonal Services",
    description: "Spring, fall, and winter care",
    icon: TreeDeciduous,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    services: [
      { name: "Spring Cleanup", price: "$150", priceNote: "starting", note: "Full yard cleanup", slug: "spring-cleanup" },
      { name: "Fall Cleanup", price: "$175", priceNote: "starting", note: "Leaf removal included", slug: "fall-cleanup" },
      { name: "Snow Removal", price: "$50", priceNote: "per service", note: "Driveways & walkways", slug: "snow-removal" },
      { name: "Christmas Lights", price: "Custom", priceNote: "quote", note: "Design & installation", slug: "christmas-light-installation" },
    ],
  },
  {
    title: "Landscaping",
    description: "Design and installation",
    icon: Hammer,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    services: [
      { name: "Patio Installation", price: "Custom", priceNote: "quote", note: "Free consultation", slug: "patio-installation" },
      { name: "Retaining Walls", price: "Custom", priceNote: "quote", note: "Free consultation", slug: "retaining-walls" },
      { name: "Sod Installation", price: "$1", priceNote: "/sq ft", note: "Includes prep work", slug: "sod-installation" },
      { name: "Mulch Installation", price: "$75", priceNote: "/yard", note: "Delivery included", slug: "mulch-installation" },
    ],
  },
  {
    title: "Irrigation",
    description: "System installation and repair",
    icon: Droplets,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    services: [
      { name: "Sprinkler Repair", price: "$75", priceNote: "starting", note: "Plus parts", slug: "sprinkler-repair" },
      { name: "Sprinkler Blowout", price: "$65", priceNote: "starting", note: "Winterization", slug: "sprinkler-blowout" },
      { name: "New System Install", price: "Custom", priceNote: "quote", note: "Free design consultation", slug: "sprinkler-system-installation" },
    ],
  },
];

export default function PricingPage() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<{ slug: string; name: string } | null>(null);

  const handleGetQuote = (service: { slug: string; name: string }) => {
    setSelectedService(service);
    setLightboxOpen(true);
  };

  return (
    <div className="flex flex-col">
      <QuoteLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        preselectedService={selectedService?.slug}
        serviceName={selectedService?.name}
      />

      <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="mb-4" data-testid="badge-pricing-label">
              <Sparkles className="h-3 w-3 mr-1" aria-hidden="true" />
              Transparent Pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground" data-testid="text-pricing-heading">
              Lawn Care Pricing in Kuna &amp; Boise, Idaho
            </h1>
            <p className="text-lg text-muted-foreground" data-testid="text-pricing-subtitle">
              No hidden fees. No surprises. Just quality lawn care at fair prices.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto space-y-16">
            {pricingCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-6" data-testid={`section-pricing-${category.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="flex items-center flex-wrap gap-4">
                  <div className={`p-3 rounded-md ${category.iconBg}`}>
                    <category.icon className={`h-6 w-6 ${category.iconColor}`} aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold" data-testid={`text-category-title-${categoryIndex}`}>
                      {category.title}
                    </h2>
                    <p className="text-muted-foreground">{category.description}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {category.services.map((service, index) => (
                    <Card 
                      key={index} 
                      className="group hover-elevate bg-gradient-to-br from-primary/5 to-white dark:from-primary/10 dark:to-background overflow-visible"
                      data-testid={`card-service-${service.slug}`}
                    >
                      <CardContent className="p-5 space-y-4">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg" data-testid={`text-service-name-${service.slug}`}>
                            {service.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{service.note}</p>
                        </div>
                        
                        <div className="flex items-baseline flex-wrap gap-1">
                          <span className="text-2xl font-bold" data-testid={`text-service-price-${service.slug}`}>
                            {service.price}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {service.priceNote}
                          </span>
                        </div>

                        <div className="flex items-center flex-wrap gap-2 pt-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleGetQuote({ slug: service.slug, name: service.name })}
                            data-testid={`button-quote-${service.slug}`}
                          >
                            Get Quote
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1 bg-gradient-to-br from-primary/10 to-white border-primary/20 text-primary"
                            asChild
                          >
                            <Link href={`/services/${service.slug}`} data-testid={`link-details-${service.slug}`}>
                              Details
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="p-6 text-center space-y-2">
                <p className="text-muted-foreground" data-testid="text-pricing-disclaimer">
                  Prices shown are starting rates and may vary based on property size, 
                  condition, and specific requirements. Contact us for a detailed quote tailored to your property.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-pricing-reviews-heading">
                Trusted by Homeowners Across the Valley
              </h2>
              <p className="text-lg text-muted-foreground">
                See what our customers have to say about our services and pricing
              </p>
            </div>
            <Testimonials limit={20} />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-br from-green-950 via-primary to-green-700 text-white p-10 md:p-16 text-center space-y-8 shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-cta-heading">
              Get Your Custom Quote
            </h2>
            <p className="text-lg text-white/85 leading-relaxed max-w-2xl mx-auto">
              Every property is unique. Contact us for a free, detailed quote based on your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center pt-4">
              <Button size="lg" className="bg-white text-green-900 hover:bg-white/90 border-0" asChild>
                <Link href="/get-quote" data-testid="link-cta-quote">
                  Get Your Free Lawn Care Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 text-white bg-white/10 backdrop-blur-sm" asChild>
                <a href="tel:2083522011" data-testid="link-cta-call">Call (208) 352-2011</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
