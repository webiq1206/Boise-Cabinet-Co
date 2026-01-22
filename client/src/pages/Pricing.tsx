import { PricingCalculator } from "@/components/PricingCalculator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "wouter";

// Map service display names to their URL slugs
const serviceSlugMap: Record<string, string> = {
  "Lawn Mowing": "lawn-mowing",
  "Core Aeration": "aeration",
  "Fertilization": "fertilization",
  "Weed Control": "weed-control",
  "Patio Installation": "patio-installation",
  "Retaining Walls": "retaining-walls",
  "Fence Installation": "fence",
  "Irrigation Systems": "sprinkler-system-installation",
  "Spring Cleanup": "spring-cleanup",
  "Fall Cleanup": "fall-cleanup",
  "Christmas Lights": "christmas-light-installation",
  "Snow Removal": "snow-removal",
};

const servicePricing = [
  {
    category: "Lawn Care Services",
    services: [
      { name: "Lawn Mowing", description: "Regular cutting, edging, and cleanup" },
      { name: "Core Aeration", description: "Improve soil health and grass growth" },
      { name: "Fertilization", description: "Seasonal nutrient application" },
      { name: "Weed Control", description: "Pre and post-emergent treatments" },
    ],
  },
  {
    category: "Landscaping Services",
    services: [
      { name: "Patio Installation", description: "Pavers, concrete, or flagstone" },
      { name: "Retaining Walls", description: "Functional and decorative walls" },
      { name: "Fence Installation", description: "Wood, vinyl, or chain link" },
      { name: "Irrigation Systems", description: "Sprinkler design and installation" },
    ],
  },
  {
    category: "Seasonal Services",
    services: [
      { name: "Spring Cleanup", description: "Remove winter debris" },
      { name: "Fall Cleanup", description: "Leaf removal and winterization" },
      { name: "Christmas Lights", description: "Professional installation and removal" },
      { name: "Snow Removal", description: "Residential and commercial" },
    ],
  },
];

const benefits = [
  "Free on-site estimates",
  "Recurring service discounts up to 15%",
  "Licensed and insured",
  "Satisfaction guarantee",
  "Same-day service available",
  "No contracts required",
];

export default function Pricing() {
  return (
      <div className="min-h-screen">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                Transparent Pricing
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Quality lawn care and landscaping services at competitive rates. No hidden fees.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Calculator */}
        <section className="py-16 md:py-24" id="pricing-calculator">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Get an Instant Estimate</h2>
              <p className="text-lg text-muted-foreground">
                Use our calculator to estimate pricing for common services
              </p>
            </div>
            <PricingCalculator />
          </div>
        </section>

        {/* Service Pricing Tables */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Service Pricing Guide</h2>
                <p className="text-lg text-muted-foreground">
                  Browse services and jump to the calculator for an instant estimate
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {servicePricing.map((category) => (
                  <Card key={category.category} data-testid={`card-${category.category.toLowerCase().replace(/\s+/g, '-')}`}>
                    <CardHeader>
                      <CardTitle>{category.category}</CardTitle>
                      <CardDescription>Pick a service, then get an instant estimate</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {category.services.map((service) => {
                        const slug = serviceSlugMap[service.name];
                        const serviceNameTestId = `link-service-${service.name.toLowerCase().replace(/\s+/g, '-')}`;
                        
                        return (
                          <div key={service.name} className="border-b pb-3 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start mb-1">
                              {slug ? (
                                <Link 
                                  href={`/services/${slug}`}
                                  className="font-medium text-primary hover:underline transition-colors cursor-pointer group"
                                  data-testid={serviceNameTestId}
                                >
                                  <span className="flex items-center gap-1">
                                    {service.name}
                                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </span>
                                </Link>
                              ) : (
                                <div className="font-medium">{service.name}</div>
                              )}
                              <a
                                href={slug ? `/pricing?service=${slug}#pricing-calculator` : "#pricing-calculator"}
                                className="text-sm font-semibold text-primary whitespace-nowrap ml-2 hover:underline"
                                data-testid={`link-estimate-${service.name.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                Get estimate
                              </a>
                            </div>
                            <div className="text-sm text-muted-foreground">{service.description}</div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 md:py-24">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Lawn Care Kuna?</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-lg">{benefit}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-primary-foreground/90">
                Contact us today for a free, no-obligation quote on any service
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild data-testid="button-get-quote">
                  <a href="/get-quote">Get Free Quote</a>
                </Button>
                <Button size="lg" variant="outline" asChild data-testid="button-services">
                  <Link href="/services/lawn-care" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                    View All Services
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
  );
}
