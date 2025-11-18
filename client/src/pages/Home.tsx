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
  ArrowRight,
} from "lucide-react";
import { ServiceAreaMap } from "@/components/ServiceAreaMap";
import { BeforeAfterGallery } from "@/components/BeforeAfterGallery";
import { Testimonials } from "@/components/Testimonials";
import heroImage from "@assets/stock_images/wide_angle_estate_la_6bc0e847.jpg";

const services = [
  {
    icon: Leaf,
    title: "Lawn Care",
    description: "Meticulous lawn maintenance services designed to elevate your property's natural beauty.",
    features: ["Weekly & Bi-weekly Service", "Precision Fertilization", "Comprehensive Weed Control", "Seasonal Preparation"],
    href: "/services/lawn-care",
  },
  {
    icon: Sprout,
    title: "Landscaping",
    description: "Sophisticated outdoor living spaces crafted with exceptional attention to detail.",
    features: ["Custom Patio Design", "Structural Retaining Walls", "Water Feature Installation", "Architectural Lighting"],
    href: "/services/landscaping",
  },
  {
    icon: Lightbulb,
    title: "Christmas Lights",
    description: "Elegant holiday lighting installations that transform your property into a winter showcase.",
    features: ["Bespoke Design Consultation", "Professional Installation", "Seasonal Maintenance", "Complete Removal Service"],
    href: "/services/christmas-lights",
  },
];

const commercialServices = [
  {
    icon: Building2,
    title: "HOA Services",
    description: "Comprehensive common area management for planned communities.",
    href: "/commercial/hoa-services",
  },
  {
    icon: Users,
    title: "Property Management",
    description: "Multi-unit property solutions for professional property managers.",
    href: "/commercial/property-management",
  },
];

const trustIndicators = [
  {
    icon: Award,
    title: "Established 2017",
    description: "Seven years of excellence serving Idaho's Treasure Valley",
  },
  {
    icon: Shield,
    title: "Fully Licensed & Insured",
    description: "Comprehensive liability and workers compensation coverage",
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description: "Complimentary consultations with straightforward estimates",
  },
  {
    icon: Clock,
    title: "Dependable Service",
    description: "Consistent, professional care throughout every season",
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
      {/* Cinematic Hero Section */}
      <section className="relative h-[70vh] md:h-[85vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        
        <div className="relative z-10 container px-8 md:px-12">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="border-white/20 bg-white/5 text-white backdrop-blur-md px-4 py-1.5">
              Serving Idaho Since 2017
            </Badge>
            <h1 className="text-white tracking-tight leading-[1.1]">
              Treasure Valley's Premier
              <br />
              Lawn Care Specialists
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed font-light">
              Exceptional lawn care, landscaping, and seasonal lighting for discerning homeowners and property managers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button size="lg" variant="default" asChild data-testid="button-hero-quote">
                <Link href="/contact">
                  Request Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-hero-call">
                <a href="tel:2083522011">
                  <Phone className="mr-2 h-5 w-5" />
                  (208) 352-2011
                </a>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-6 text-sm text-white/70 font-light">
              {serviceAreas.map((area, index) => (
                <span key={area.name}>
                  {area.name}
                  {index < serviceAreas.length - 1 && <span className="ml-3 text-white/40">·</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators - Refined */}
      <section className="py-16 md:py-20 border-b">
        <div className="container px-8 md:px-12">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {trustIndicators.map((indicator, index) => (
              <div key={index} className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-md border border-border bg-card">
                  <indicator.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1">{indicator.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{indicator.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Introduction */}
      <section className="py-24 md:py-32 lg:py-40">
        <div className="container px-8 md:px-12">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="tracking-tight">
              Elevating Idaho Properties Since 2017
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              At Lawn Care Kuna, we understand that exceptional outdoor spaces require more than routine maintenance. 
              Our comprehensive approach combines horticultural expertise with meticulous attention to detail, 
              delivering results that enhance your property's value and aesthetic appeal.
            </p>
          </div>
        </div>
      </section>

      {/* Main Services - 2-Column Grid */}
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="container px-8 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="tracking-tight mb-4">Our Services</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Comprehensive solutions tailored to your property's unique requirements
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {services.slice(0, 2).map((service, index) => (
              <Card key={index} className="hover-elevate transition-all duration-300 border-card-border" data-testid={`card-service-${service.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardHeader className="p-8 space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-md border border-border bg-background" data-testid={`icon-service-${service.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <service.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-serif" data-testid={`title-service-${service.title.toLowerCase().replace(/\s+/g, '-')}`}>{service.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed" data-testid={`desc-service-${service.title.toLowerCase().replace(/\s+/g, '-')}`}>{service.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-6">
                  <ul className="space-y-3">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm" data-testid={`feature-${service.title.toLowerCase().replace(/\s+/g, '-')}-${i}`}>
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" asChild data-testid={`button-learn-${service.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Link href={service.href}>
                      Explore Service
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Third service - Christmas Lights */}
          <div className="max-w-2xl mx-auto">
            <Card className="hover-elevate transition-all duration-300 border-card-border" data-testid="card-service-christmas-lights">
              <CardHeader className="p-8 space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-md border border-border bg-background" data-testid="icon-service-christmas-lights">
                  <Lightbulb className="h-6 w-6 text-primary" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-serif" data-testid="title-service-christmas-lights">Christmas Lights</CardTitle>
                  <CardDescription className="text-base leading-relaxed" data-testid="desc-service-christmas-lights">{services[2].description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-6">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services[2].features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm" data-testid={`feature-christmas-lights-${i}`}>
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" asChild data-testid="button-learn-christmas-lights">
                  <Link href={services[2].href}>
                    Explore Service
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Commercial Services - Refined */}
      <section className="py-24 md:py-32">
        <div className="container px-8 md:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="tracking-tight mb-4">Commercial & HOA Solutions</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Professional landscape management for businesses, homeowner associations, and property managers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {commercialServices.map((service, index) => (
                <Card key={index} className="hover-elevate transition-all duration-300 border-card-border">
                  <CardHeader className="p-8 space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-md border border-border bg-background">
                      <service.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-2xl font-serif">{service.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed">{service.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <Button variant="outline" asChild>
                      <Link href={service.href}>
                        View Services
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button size="lg" asChild data-testid="button-commercial">
                <Link href="/commercial/commercial-services">
                  View All Commercial Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Gallery - Refined */}
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="container px-8 md:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="tracking-tight mb-4">Recent Projects</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Exceptional transformations across the Treasure Valley
              </p>
            </div>
            <BeforeAfterGallery limit={3} />
          </div>
        </div>
      </section>

      {/* Testimonials - Refined */}
      <section className="py-24 md:py-32">
        <div className="container px-8 md:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="tracking-tight mb-4">Client Testimonials</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Trusted by discerning homeowners throughout Idaho
              </p>
            </div>
            <Testimonials limit={3} />
          </div>
        </div>
      </section>

      {/* Why Choose Us - Editorial Grid */}
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="container px-8 md:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="tracking-tight mb-4">Why Choose Lawn Care Kuna</h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Our commitment to excellence sets us apart in every aspect of service delivery
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-serif">Local Expertise</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Comprehensive understanding of Idaho's unique climate, soil composition, and seasonal requirements ensures optimal results for your landscape.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-serif">Transparent Practices</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Straightforward communication and honest pricing without hidden fees or unexpected charges.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-serif">Quality Assurance</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Meticulous attention to detail and consistent service delivery backed by comprehensive quality standards.
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-serif">Competitive Rates</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Professional service at fair market rates with complimentary consultations and transparent estimates.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-serif">Fully Insured</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Comprehensive liability and workers compensation coverage provides complete peace of mind.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-serif">Proven Excellence</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Seven years of consistent service excellence with hundreds of satisfied clients across the Treasure Valley.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button variant="outline" size="lg" asChild data-testid="button-about">
                <Link href="/about">
                  Learn More About Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area Map */}
      <section className="py-24 md:py-32">
        <div className="container px-8 md:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="tracking-tight mb-4">Service Coverage</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Professional landscape services throughout Southwest Idaho
              </p>
            </div>
            <ServiceAreaMap />
          </div>
        </div>
      </section>

      {/* Final CTA - Refined Cinematic */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/70 to-black/75" />
        
        <div className="relative z-10 container px-8 md:px-12">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-white tracking-tight">
              Ready to Elevate Your Property?
            </h2>
            <p className="text-xl text-white/90 leading-relaxed font-light">
              Schedule your complimentary consultation today. We respond to all inquiries within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="default" asChild data-testid="button-cta-quote">
                <Link href="/contact">
                  Request Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-cta-call">
                <a href="tel:2083522011">
                  <Phone className="mr-2 h-5 w-5" />
                  (208) 352-2011
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
