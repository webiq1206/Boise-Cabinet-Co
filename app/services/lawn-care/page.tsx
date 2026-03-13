import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Testimonials } from "@/components/Testimonials";
import { SimpleQuoteWizard } from "@/components/SimpleQuoteWizard";
import { CheckCircle2, Scissors, Sprout, Droplets, Shield, Leaf, Sun } from "lucide-react";
import { generateServiceSchema, generateBreadcrumbSchema, generateLocalBusinessSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Lawn Care Services in Kuna & Boise Idaho | Free Quote",
  description: "Full lawn care in Kuna, Boise, Meridian, Eagle & Treasure Valley. Mowing, fertilization, aeration, weed control & more. Licensed & insured. Call (208) 352-2011 for a free quote!",
  openGraph: {
    title: "Lawn Care Services in Kuna & Boise | Lawn Care Kuna",
    description: "Expert lawn maintenance for beautiful, healthy lawns across the Treasure Valley. Free quotes!",
    url: "https://lawncarekuna.com/services/lawn-care",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Lawn Care Services in Kuna & Boise | Lawn Care Kuna",
    description: "Expert lawn maintenance for beautiful, healthy lawns across the Treasure Valley.",
  },
  alternates: {
    canonical: "https://lawncarekuna.com/services/lawn-care",
  },
};

const services = [
  {
    icon: Scissors,
    title: "Lawn Mowing",
    description: "Weekly and bi-weekly professional lawn mowing services",
    href: "/services/lawn-mowing",
  },
  {
    icon: Sprout,
    title: "Aeration & Overseeding",
    description: "Core aeration and fall overseeding for healthier lawns",
    href: "/services/aeration",
  },
  {
    icon: Leaf,
    title: "Fertilization",
    description: "Custom fertilization programs for lush, green lawns",
    href: "/services/fertilization",
  },
  {
    icon: Shield,
    title: "Weed Control",
    description: "Comprehensive weed management and prevention",
    href: "/services/weed-control",
  },
  {
    icon: Scissors,
    title: "Hedge Trimming",
    description: "Professional bush and shrub trimming services",
    href: "/services/hedge-trimming",
  },
  {
    icon: Sun,
    title: "Seasonal Cleanup",
    description: "Spring and fall cleanup services",
    href: "/services/seasonal-cleanup",
  },
  {
    icon: Droplets,
    title: "Sprinkler Blowout",
    description: "Winterization services for irrigation systems",
    href: "/services/sprinkler-blowout",
  },
  {
    icon: Sprout,
    title: "Dethatching",
    description: "Thatch layer removal for better lawn health",
    href: "/services/dethatching",
  },
];

export default function LawnCarePage() {
  const serviceSchema = generateServiceSchema(
    "Lawn Care Services",
    "Comprehensive lawn care and maintenance services including mowing, fertilization, aeration, weed control, and more for residential and commercial properties in Kuna, Boise, Meridian, and the Treasure Valley."
  );
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
    { name: "Lawn Care", url: "/services/lawn-care" },
  ]);

  const localBusinessSchema = generateLocalBusinessSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <div className="flex flex-col">
        {/* Hero */}
        <section className="bg-primary text-primary-foreground py-16 md:py-24">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">Professional Lawn Care Services</h1>
              <p className="text-lg text-primary-foreground/90">
                Expert lawn maintenance for beautiful, healthy lawns across Kuna, Boise, Meridian, and surrounding areas
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" variant="secondary" asChild>
                  <a href="#quote">Get a Free Lawn Care Quote</a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="tel:2083522011">
                    Call (208) 352-2011
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 md:py-24">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Lawn Care Services</h2>
                <p className="text-lg text-muted-foreground">
                  Comprehensive lawn maintenance solutions to keep your property looking its best year-round
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {services.map((service, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                        <service.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      <CardDescription className="text-sm">{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="bg-gradient-to-br from-primary/10 to-white border-primary/20 text-primary" asChild>
                        <Link href={service.href}>
                          {service.name} Details
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Professional Lawn Care?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Consistent Results</h3>
                    <p className="text-muted-foreground">
                      Regular maintenance ensures your lawn stays healthy and beautiful week after week
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Save Time</h3>
                    <p className="text-muted-foreground">
                      Spend your weekends enjoying your yard instead of working on it
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Professional Equipment</h3>
                    <p className="text-muted-foreground">
                      Commercial-grade equipment provides superior results compared to homeowner mowers
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Expert Knowledge</h3>
                    <p className="text-muted-foreground">
                      We understand Idaho&apos;s unique climate and know exactly what your lawn needs
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Increased Property Value</h3>
                    <p className="text-muted-foreground">
                      Well-maintained lawns significantly boost curb appeal and property value
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Reliable Service</h3>
                    <p className="text-muted-foreground">
                      Scheduled maintenance ensures your lawn is always maintained on time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
          {/* Testimonials */}
          <section className="py-16 md:py-24 bg-muted/30">
            <div className="container px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12 space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-lawn-maintenance-reviews-heading">
                    What Our Customers Say
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Real reviews from lawn care customers in the Treasure Valley
                  </p>
                </div>
                <Testimonials serviceType="lawn-maintenance" limit={16} />
              </div>
            </div>
          </section>
  

        {/* Quote Form */}
        <section id="quote" className="py-16 md:py-24">
          <div className="container px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Get Your Free Lawn Care Quote</h2>
                <p className="text-lg text-muted-foreground">
                  Tell us about your property and we&apos;ll provide a customized quote
                </p>
              </div>
              <SimpleQuoteWizard preselectedService="lawn-maintenance" />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
