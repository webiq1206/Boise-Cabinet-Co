import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, MapPin, ArrowRight, Phone, Heart, Shield, Target, Zap } from "lucide-react";
import { PRIORITY_SERVICES, CITIES } from "@/shared/contentData";
import { generateSEOMetadata, CITY_SEO_DATA, BUSINESS_INFO } from "@/lib/seo";
import {
  generateServiceSchema,
  generateLocalBusinessSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from "@/lib/schema";

// Generate static params for all service + city combinations
export async function generateStaticParams() {
  const params: { slug: string; city: string }[] = [];
  
  for (const service of PRIORITY_SERVICES) {
    for (const city of CITIES) {
      params.push({
        slug: service.slug,
        city: city.slug,
      });
    }
  }
  
  return params;
}

// Generate metadata for each city-specific service page
export async function generateMetadata({
  params,
}: {
  params: { slug: string; city: string };
}): Promise<Metadata> {
  const service = PRIORITY_SERVICES.find((s) => s.slug === params.slug);
  const city = CITIES.find((c) => c.slug === params.city);

  if (!service || !city) {
    return {
      title: "Page Not Found | Lawn Care Kuna",
    };
  }

  const seoMetadata = generateSEOMetadata({
    serviceName: service.name,
    serviceSlug: service.slug,
    city: city.name,
    citySlug: city.slug,
  });

  const cityData = CITY_SEO_DATA[city.name as keyof typeof CITY_SEO_DATA];
  const coordinates = cityData?.coordinates;

  return {
    title: seoMetadata.title,
    description: seoMetadata.description,
    keywords: seoMetadata.keywords,
    openGraph: {
      title: seoMetadata.ogTitle,
      description: seoMetadata.ogDescription,
      url: `/services/${service.slug}/${city.slug}`,
      type: "website",
      images: [{ url: seoMetadata.ogImage || "/images/lawn-care-kuna-logo.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: seoMetadata.ogTitle,
      description: seoMetadata.ogDescription,
    },
    alternates: {
      canonical: seoMetadata.canonical,
    },
    other: {
      "geo.region": "US-ID",
      "geo.placename": city.name,
      ...(coordinates && {
        "geo.position": `${coordinates.lat};${coordinates.lng}`,
        "ICBM": `${coordinates.lat}, ${coordinates.lng}`,
      }),
    },
  };
}

const coreValues = [
  {
    icon: Heart,
    title: "Quality First",
    description: "We never compromise on quality. Every job is done right the first time with attention to detail.",
  },
  {
    icon: Shield,
    title: "Integrity",
    description: "Honest pricing, transparent communication, and ethical business practices you can trust.",
  },
  {
    icon: Target,
    title: "Customer Focus",
    description: "Your satisfaction is our priority. We listen, deliver, and exceed expectations.",
  },
  {
    icon: Zap,
    title: "Excellence",
    description: "Continuous improvement and dedication to being the best in lawn care services.",
  },
];

export default function CityServicePage({
  params,
}: {
  params: { slug: string; city: string };
}) {
  const service = PRIORITY_SERVICES.find((s) => s.slug === params.slug);
  const city = CITIES.find((c) => c.slug === params.city);

  if (!service || !city) {
    notFound();
  }

  // Get city-specific data
  const cityData = CITY_SEO_DATA[city.name as keyof typeof CITY_SEO_DATA];

  // Generate schema markup
  const localBusinessSchema = generateLocalBusinessSchema(city.name);
  const serviceSchema = generateServiceSchema(
    service.name,
    service.longDescription || service.shortDescription,
    city.name
  );
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
    { name: service.name, url: `/services/${service.slug}` },
    { name: city.name, url: `/services/${service.slug}/${city.slug}` },
  ]);

  // Generate FAQ schema if available
  const faqs = service.faqs || [
    {
      question: `How much does ${service.name.toLowerCase()} cost in ${city.name}?`,
      answer: `Pricing varies based on property size and specific requirements. Contact us for a free, no-obligation quote tailored to your ${city.name} property.`,
    },
    {
      question: `How often should I schedule ${service.name.toLowerCase()}?`,
      answer: `The frequency depends on your specific needs and property conditions. Our team will recommend an optimal schedule during your free consultation.`,
    },
    {
      question: `Do you serve my neighborhood in ${city.name}?`,
      answer: `Yes! We serve all neighborhoods throughout ${city.name} and the greater Treasure Valley area. Call us at ${BUSINESS_INFO.phone} to confirm service in your area.`,
    },
    {
      question: `Are you licensed and insured?`,
      answer: `Absolutely. Lawn Care Kuna is fully licensed and insured with $2M liability coverage for your protection and peace of mind.`,
    },
  ];
  const faqSchema = generateFAQSchema(faqs);

  // Service category
  const serviceCategory = service.category?.includes("lawn") ? "lawn care" : "landscaping";

  // Define benefits
  const benefits = service.benefits || [
    `Expert ${service.name.toLowerCase()} tailored to ${city.name}'s climate`,
    "Professional-grade equipment and materials",
    "Fully licensed and insured team",
    "Transparent, competitive pricing",
    "Satisfaction guaranteed on every job",
    "Flexible scheduling options",
  ];

  // Define process steps
  const processSteps = service.process || [
    { step: 1, title: "Free Consultation", description: "We assess your property and discuss your specific needs and goals." },
    { step: 2, title: "Custom Quote", description: "Receive a detailed, transparent quote with no hidden fees." },
    { step: 3, title: "Professional Service", description: "Our experienced team delivers high-quality results." },
    { step: 4, title: "Follow-Up", description: "We ensure your complete satisfaction and address any questions." },
  ];

  return (
    <>
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="pb-20">
        {/* Breadcrumbs */}
        <nav className="container px-4 py-4">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/services" className="hover:text-primary transition-colors">
                Services
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href={`/services/${service.slug}`} className="hover:text-primary transition-colors">
                {service.name}
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">{city.name}</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/10 to-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Treasure Valley {serviceCategory}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                Professional {service.name} in {city.name}, Idaho
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Trusted by local homeowners and businesses since 2017. Licensed, insured, and committed to excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" asChild>
                  <Link href="/get-quote">
                    Get Free Quote
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href={`tel:${BUSINESS_INFO.phone.replace(/[^0-9]/g, "")}`}>
                    <Phone className="mr-2 h-5 w-5" />
                    {BUSINESS_INFO.phone}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* City-Specific Introduction */}
        <section className="py-12 md:py-16 lg:py-24 bg-primary">
          <div className="container px-4 md:px-8">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground tracking-tight">
                Why Local Expertise Matters in {city.name}
              </h2>
              <p className="text-primary-foreground/90 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
                {city.name} properties face unique challenges due to Idaho's {cityData?.climate || "semi-arid climate"}. 
                Our team understands these local conditions and provides {service.name.toLowerCase()} services specifically 
                tailored to help your property thrive year-round.
              </p>
              <Button size="lg" variant="secondary" asChild className="mt-4">
                <Link href="/get-quote">
                  Get Free Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Service Description */}
        <section className="py-16 md:py-24">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                  What Sets Our {service.name} Apart in {city.name}
                </h2>
                <p className="text-base md:text-lg leading-relaxed mb-6">
                  {service.longDescription || service.shortDescription}
                </p>
                <p className="text-base md:text-lg leading-relaxed">
                  At Lawn Care Kuna, we provide expert {service.name.toLowerCase()} services tailored to {city.name}'s 
                  unique climate and conditions. Our experienced team uses professional-grade equipment to deliver 
                  exceptional results every time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Neighborhoods Section */}
        {cityData?.neighborhoods && cityData.neighborhoods.length > 0 && (
          <section className="py-16 md:py-24 bg-muted">
            <div className="container px-4">
              <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                    {city.name} Neighborhoods We Serve
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    From established neighborhoods to new developments, we understand the unique needs of each area.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">Local Neighborhoods</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Our team regularly works in these {city.name} communities:
                    </p>
                    <ul className="space-y-3">
                      {cityData.neighborhoods.map((neighborhood, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{neighborhood}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {cityData.landmarks && cityData.landmarks.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold">Local Landmarks</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        We're proud to serve properties near these well-known {city.name} landmarks:
                      </p>
                      <ul className="space-y-3">
                        {cityData.landmarks.slice(0, 6).map((landmark, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span>{landmark}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Process & Benefits */}
        <section className="py-16 md:py-24">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  How We Deliver Results
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Our proven process ensures consistent, high-quality outcomes for every {city.name} property.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Our Process</h3>
                  <div className="space-y-4">
                    {processSteps.slice(0, 4).map((step) => (
                      <div key={step.step} className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {step.step}
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">{step.title}</h4>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Key Benefits</h3>
                  <ul className="space-y-3">
                    {benefits.slice(0, 6).map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Our Commitment to {city.name} Customers
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  The values and principles that guide everything we do
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {coreValues.map((value, index) => (
                  <Card key={index} className="hover-elevate">
                    <CardContent className="p-8 space-y-4">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground">
                        <value.icon className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 md:py-24">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-lg text-muted-foreground">
                  Common questions about {service.name.toLowerCase()} for {city.name} properties
                </p>
              </div>

              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqs.slice(0, 5).map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`faq-${index}`}
                    className="border rounded-lg px-6 hover-elevate"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-6">
                      <span className="font-semibold text-base md:text-lg pr-4">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-6 pt-2">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Other Cities */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-2xl md:text-3xl font-bold">
                {service.name} Also Available In
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                {CITIES.filter((c) => c.slug !== params.city).map((otherCity) => (
                  <Link
                    key={otherCity.slug}
                    href={`/services/${service.slug}/${otherCity.slug}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border hover:border-primary hover:text-primary transition-colors"
                  >
                    <MapPin className="h-4 w-4" />
                    {otherCity.name}, ID
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Ready for Professional {service.name} in {city.name}?
              </h2>
              <p className="text-xl text-primary-foreground/90 leading-relaxed">
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
