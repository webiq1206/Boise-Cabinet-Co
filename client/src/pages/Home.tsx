import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Leaf,
  Scissors,
  Lightbulb,
  Building2,
  Phone,
  CheckCircle2,
  Shield,
  Award,
  Clock,
  DollarSign,
  Users,
  Sprout,
} from "lucide-react";

const services = [
  {
    icon: Leaf,
    title: "Lawn Care",
    description: "Professional lawn mowing, aeration, fertilization, and weed control services.",
    features: ["Weekly/Bi-weekly Mowing", "Fertilization Programs", "Weed Control", "Seasonal Cleanup"],
    href: "/services/lawn-care",
  },
  {
    icon: Sprout,
    title: "Landscaping",
    description: "Complete landscaping services from patios to ponds, retaining walls to lighting.",
    features: ["Patio Installation", "Retaining Walls", "Water Features", "Landscape Lighting"],
    href: "/services/landscaping",
  },
  {
    icon: Lightbulb,
    title: "Christmas Lights",
    description: "Professional holiday lighting installation, maintenance, and removal.",
    features: ["Custom Design", "Professional Installation", "Seasonal Maintenance", "Complete Removal"],
    href: "/services/christmas-lights",
  },
];

const commercialServices = [
  {
    icon: Building2,
    title: "HOA Services",
    description: "Complete HOA common area maintenance and landscape management.",
    href: "/commercial/hoa-services",
  },
  {
    icon: Users,
    title: "Property Management",
    description: "Multi-unit property maintenance and apartment complex landscaping.",
    href: "/commercial/property-management",
  },
];

const trustIndicators = [
  {
    icon: Award,
    title: "Since 2017",
    description: "Over 7 years serving Treasure Valley homeowners and businesses",
  },
  {
    icon: Shield,
    title: "Licensed & Insured",
    description: "Fully insured with general liability and workers compensation",
  },
  {
    icon: DollarSign,
    title: "Free Quotes",
    description: "No-obligation quotes with transparent, honest pricing",
  },
  {
    icon: Clock,
    title: "Reliable Service",
    description: "Consistent, professional service you can count on year-round",
  },
];

const serviceAreas = [
  { name: "Kuna", href: "/areas/kuna" },
  { name: "Boise", href: "/areas/boise" },
  { name: "Meridian", href: "/areas/meridian" },
  { name: "Nampa", href: "/areas/nampa" },
  { name: "Caldwell", href: "/areas/caldwell" },
  { name: "Eagle", href: "/areas/eagle" },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <div className="relative container px-4 py-24 md:py-32 lg:py-40">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="mb-4">
              Serving Idahoans Since 2017
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Most Trusted Lawn Care Services In Kuna
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Professional lawn care, landscaping, and Christmas light installation for residential and commercial properties across the Treasure Valley.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/contact">
                <Button size="lg" variant="secondary" className="text-base" data-testid="button-hero-quote">
                  Get Free Quote
                </Button>
              </Link>
              <a href="tel:2083522011">
                <Button size="lg" variant="outline" className="text-base border-primary-foreground/20 hover:bg-primary-foreground/10" data-testid="button-hero-call">
                  <Phone className="mr-2 h-5 w-5" />
                  (208) 352-2011
                </Button>
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-4 text-sm">
              {serviceAreas.map((area) => (
                <span key={area.name} className="text-primary-foreground/80">
                  {area.name}
                </span>
              )).reduce((prev, curr, i) => 
                i === 0 ? [curr] : [...prev, <span key={`sep-${i}`} className="text-primary-foreground/60">•</span>, curr], 
                [] as React.ReactNode[]
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-muted/30 border-b">
        <div className="container px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustIndicators.map((indicator, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <indicator.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{indicator.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{indicator.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive lawn care and landscaping solutions for homes and businesses throughout the Treasure Valley.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover-elevate transition-all duration-200" data-testid={`card-service-${service.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4" data-testid={`icon-service-${service.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl" data-testid={`title-service-${service.title.toLowerCase().replace(/\s+/g, '-')}`}>{service.title}</CardTitle>
                  <CardDescription data-testid={`desc-service-${service.title.toLowerCase().replace(/\s+/g, '-')}`}>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm" data-testid={`feature-${service.title.toLowerCase().replace(/\s+/g, '-')}-${i}`}>
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={service.href}>
                    <Button variant="outline" className="w-full" data-testid={`button-learn-${service.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Commercial Services Callout */}
      <section className="py-16 bg-accent">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Commercial & HOA Services</h2>
              <p className="text-lg text-muted-foreground">
                Professional landscaping for businesses, HOAs, property managers, and municipal contracts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {commercialServices.map((service, index) => (
                <Card key={index} className="hover-elevate transition-all duration-200">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={service.href}>
                      <Button variant="outline" className="w-full">
                        View Services
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Link href="/commercial/commercial-services">
                <Button size="lg" data-testid="button-commercial">
                  View All Commercial Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Serving the Treasure Valley</h2>
            <p className="text-lg text-muted-foreground">
              Professional lawn care and landscaping services throughout Southwest Idaho
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {serviceAreas.map((area) => (
              <Link key={area.name} href={area.href}>
                <Card className="hover-elevate transition-all duration-200 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold text-lg">{area.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Idaho</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Lawn Care Kuna?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Local Expertise</h3>
                    <p className="text-muted-foreground">
                      We understand Idaho's unique climate, soil conditions, and seasonal requirements for optimal lawn and landscape health.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Honest & Fair</h3>
                    <p className="text-muted-foreground">
                      We value ourselves in staying honest and fair towards our customers. No hidden charges or gotchas.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Quality Guaranteed</h3>
                    <p className="text-muted-foreground">
                      Highest level of customer service and expertise with relentlessly consistent lawn care services.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Affordable Pricing</h3>
                    <p className="text-muted-foreground">
                      Competitive rates with transparent pricing. We offer free quotes with no obligations.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Fully Insured</h3>
                    <p className="text-muted-foreground">
                      General liability and workers compensation coverage for your complete peace of mind.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Proven Track Record</h3>
                    <p className="text-muted-foreground">
                      Serving Idahoans since 2017 with hundreds of satisfied customers across the Treasure Valley.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link href="/about">
                <Button variant="outline" size="lg" data-testid="button-about">
                  Learn More About Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Transform Your Property?
            </h2>
            <p className="text-lg text-primary-foreground/90">
              Get your free, no-obligation quote today. We'll respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/contact">
                <Button size="lg" variant="secondary" className="text-base" data-testid="button-cta-quote">
                  Get Free Quote
                </Button>
              </Link>
              <a href="tel:2083522011">
                <Button size="lg" variant="outline" className="text-base border-primary-foreground/20 hover:bg-primary-foreground/10" data-testid="button-cta-call">
                  <Phone className="mr-2 h-5 w-5" />
                  (208) 352-2011
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
