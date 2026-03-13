import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SimpleQuoteWizard } from "@/components/SimpleQuoteWizard";
import { Building2, CheckCircle2, Shield, Clock, ArrowRight } from "lucide-react";
import { Testimonials } from "@/components/Testimonials";
import { generateWebPageSchema, generateBreadcrumbSchema, generateLocalBusinessSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Commercial Lawn Care & Landscaping in Kuna & Boise",
  description: "Commercial landscaping for businesses, office parks & retail in Kuna, Boise & Treasure Valley. Licensed & insured. Free quote!",
  alternates: {
    canonical: "https://lawncarekuna.com/commercial",
  },
  openGraph: {
    title: "Commercial Lawn Care & Landscaping | Lawn Care Kuna",
    description: "Professional landscaping services for businesses across the Treasure Valley.",
    url: "https://lawncarekuna.com/commercial",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Commercial Lawn Care & Landscaping | Lawn Care Kuna",
    description: "Professional landscaping services for businesses across the Treasure Valley.",
  },
};

const webPageSchema = generateWebPageSchema({
  title: "Commercial Lawn Care & Landscaping",
  description: "Professional commercial landscaping services for businesses across the Treasure Valley.",
  url: "/commercial",
});

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Commercial", url: "/commercial" },
]);

const localBusinessSchema = generateLocalBusinessSchema();

export default function CommercialPage() {
  return (
    <>
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
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
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Commercial Lawn Care & Landscaping</h1>
              <p className="text-lg text-primary-foreground/90">
                Professional landscaping services for businesses, office parks, retail centers, and commercial properties across the Treasure Valley
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="prose prose-lg max-w-none">
                    <h2>Elevate Your Business with Professional Landscaping</h2>
                    <p className="text-muted-foreground">
                      First impressions matter in business. Our commercial lawn care and landscaping services ensure your property always looks professional, welcoming, and well-maintained. We specialize in serving office buildings, retail centers, industrial parks, restaurants, medical facilities, and other commercial properties throughout the Treasure Valley.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-4">Commercial Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { title: "Commercial Lawn Maintenance", desc: "Weekly mowing, edging, trimming, and blowing for a pristine appearance", href: "/services/lawn-mowing" },
                        { title: "Landscape Design & Installation", desc: "Custom designs that enhance your brand and property value", href: "/services/patio-installation" },
                        { title: "Seasonal Color Programs", desc: "Year-round color with flowers, plants, and seasonal displays", href: "/services/spring-cleanup" },
                        { title: "Irrigation System Management", desc: "Design, installation, maintenance, and water management", href: "/services/sprinkler-system-installation" },
                        { title: "Snow & Ice Management", desc: "Winter snow removal, plowing, and de-icing services", href: "/services/snow-removal" },
                        { title: "Grounds Cleanup & Maintenance", desc: "Spring/fall cleanup, leaf removal, and debris management", href: "/services/fall-cleanup" },
                      ].map((service, index) => (
                        <Link key={index} href={service.href} data-testid={`link-commercial-service-${index}`}>
                          <Card className="hover-elevate h-full">
                            <CardContent className="p-6">
                              <h3 className="font-semibold mb-2">{service.title}</h3>
                              <p className="text-sm text-muted-foreground">{service.desc}</p>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="bg-muted/50 p-6 rounded-md">
                    <h3 className="text-xl font-bold mb-4">Why Choose Commercial Landscaping?</h3>
                    <ul className="space-y-2">
                      {[
                        "Enhance curb appeal and attract more customers",
                        "Increase property value and tenant satisfaction",
                        "Create a professional image for your business",
                        "Reduce liability with proper maintenance",
                        "Flexible scheduling around business hours",
                        "Customized service plans for your budget",
                      ].map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-4">Industries We Serve</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { name: "Office Buildings", href: null },
                        { name: "Retail Centers", href: null },
                        { name: "Restaurants", href: null },
                        { name: "Medical Facilities", href: null },
                        { name: "Industrial Parks", href: null },
                        { name: "Hotels & Resorts", href: null },
                        { name: "Apartment Complexes", href: null },
                        { name: "HOA Communities", href: "/commercial/hoa-services" },
                        { name: "Schools & Universities", href: null },
                      ].map((industry, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          {industry.href ? (
                            <Link href={industry.href} className="text-primary hover:underline" data-testid={`link-industry-${industry.name.toLowerCase().replace(/\s+/g, '-')}`}>{industry.name}</Link>
                          ) : (
                            <span>{industry.name}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Specialized Services Links */}
                  <div className="bg-primary/5 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Specialized Commercial Services</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button asChild variant="outline" className="bg-gradient-to-br from-primary/10 to-white border-primary/20 text-primary">
                        <Link href="/commercial/hoa-services">
                          HOA Services
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="bg-gradient-to-br from-primary/10 to-white border-primary/20 text-primary">
                        <Link href="/commercial/municipal-services">
                          Municipal Services
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <Card className="sticky top-20">
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Why Businesses Choose Us</h3>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <div className="font-medium">Reliable Service</div>
                              <div className="text-muted-foreground">Consistent, on-time maintenance</div>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <div className="font-medium">Fully Licensed & Insured</div>
                              <div className="text-muted-foreground">$2M liability coverage</div>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <Building2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <div className="font-medium">Commercial Expertise</div>
                              <div className="text-muted-foreground">Serving businesses since 2017</div>
                            </div>
                          </li>
                        </ul>
                      </div>
                      <div className="pt-4 border-t space-y-3">
                        <Link href="#quote" className="block">
                          <Button className="w-full" size="lg">Get Commercial Quote</Button>
                        </Link>
                        <Link href="/pricing" className="block">
                          <Button className="w-full bg-gradient-to-br from-primary/10 to-white border-primary/20 text-primary" variant="outline" size="lg">View Pricing</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-commercial-reviews-heading">
                  Trusted by Local Businesses
                </h2>
                <p className="text-lg text-muted-foreground">
                  See why commercial properties choose Lawn Care Kuna
                </p>
              </div>
              <Testimonials limit={16} />
            </div>
          </div>
        </section>

        {/* Quote Form */}
        <section id="quote" className="py-16 bg-muted/30">
          <div className="container px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Get Your Commercial Landscaping Quote</h2>
                <p className="text-muted-foreground">
                  Tell us about your commercial property and we'll provide a customized quote for your landscaping needs.
                </p>
              </div>
              <SimpleQuoteWizard />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
