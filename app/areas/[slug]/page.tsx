import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Phone, MapPin } from "lucide-react";
import { CITIES, PRIORITY_SERVICES } from "@/shared/contentData";
import { generateLocalBusinessSchema, generateBreadcrumbSchema } from "@/lib/schema";

// Generate static params for all cities
export async function generateStaticParams() {
  return CITIES.map((city) => ({
    slug: city.slug,
  }));
}

// Generate metadata for each city
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const city = CITIES.find((c) => c.slug === params.slug);
  
  if (!city) {
    return {
      title: "Area Not Found | Lawn Care Kuna",
    };
  }

  return {
    title: `Lawn Care Services in ${city.name}, Idaho | Lawn Care Kuna`,
    description: `Professional lawn care and landscaping services in ${city.name}, Idaho. Serving ${city.name} with lawn mowing, landscaping, irrigation, and more. Get a free quote today!`,
    openGraph: {
      title: `Lawn Care in ${city.name}, ID | Lawn Care Kuna`,
      description: `Professional lawn care and landscaping services in ${city.name}, Idaho.`,
      url: `/areas/${city.slug}`,
      type: "website",
    },
  };
}

export default function AreaPage({ params }: { params: { slug: string } }) {
  const city = CITIES.find((c) => c.slug === params.slug);

  if (!city) {
    notFound();
  }

  const popularServices = PRIORITY_SERVICES.slice(0, 8);

  const benefits = [
    `Local expertise in ${city.name}'s climate and soil conditions`,
    "Same-day or next-day service availability",
    "Competitive pricing for the area",
    "Serving residential and commercial properties",
    "Fully licensed and insured",
    "Free estimates and consultations",
  ];

  // Generate schema markup
  const localBusinessSchema = generateLocalBusinessSchema(city.name);
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Service Areas", url: "/areas" },
    { name: city.name, url: `/areas/${city.slug}` },
  ]);

  return (
    <>
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <MapPin className="h-4 w-4" />
                {city.name}, Idaho
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Lawn Care Services in {city.name}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Professional lawn care and landscaping services serving {city.name} and the surrounding areas
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" asChild>
                  <Link href="/get-quote">
                    Get Free Quote
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="tel:2083522011">
                    <Phone className="mr-2 h-5 w-5" />
                    (208) 352-2011
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Area */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold">
                  Your Trusted Lawn Care Partner in {city.name}
                </h2>
                <div className="prose prose-lg">
                  <p className="text-muted-foreground leading-relaxed">
                    Lawn Care Kuna has been proudly serving {city.name}, Idaho since 2017. Our team understands the unique challenges of maintaining beautiful outdoor spaces in Idaho's climate, from hot, dry summers to cold winters.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Whether you need regular lawn maintenance, a complete landscape renovation, or seasonal services, we're here to help. Our experienced crew uses professional-grade equipment to deliver exceptional results on every job.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold">Why {city.name} Residents Choose Us</h3>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services in Area */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold">
                Services Available in {city.name}
              </h2>
              <p className="text-muted-foreground">
                We offer a complete range of lawn care and landscaping services
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularServices.map((service) => (
                <Card key={service.slug} className="hover-elevate">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{service.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" size="sm" className="p-0 h-auto text-primary" asChild>
                      <Link href={`/services/${service.slug}`}>
                        Learn more <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button variant="outline" asChild>
                <Link href="/services">
                  View All Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Other Areas */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              Also Serving Nearby Areas
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {CITIES.filter(c => c.slug !== params.slug).map((otherCity) => (
                <Link
                  key={otherCity.slug}
                  href={`/areas/${otherCity.slug}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  {otherCity.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to Transform Your {city.name} Property?
            </h2>
            <p className="text-xl text-primary-foreground leading-relaxed">
              Contact us today for a free consultation and quote. We'll assess your property and provide transparent pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/get-quote">
                  Get Free Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" 
                asChild
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
