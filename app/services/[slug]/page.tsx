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
import { CheckCircle2, ArrowRight, Phone } from "lucide-react";
import { PRIORITY_SERVICES, CITIES } from "@/shared/contentData";
import { generateServiceSchema, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/schema";
import { BUSINESS_INFO } from "@/lib/seo";

// Generate static params for all services
export async function generateStaticParams() {
  return PRIORITY_SERVICES.map((service) => ({
    slug: service.slug,
  }));
}

// Generate metadata for each service
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const service = PRIORITY_SERVICES.find((s) => s.slug === params.slug);
  
  if (!service) {
    return {
      title: "Service Not Found | Lawn Care Kuna",
    };
  }

  return {
    title: `${service.name} Services in Kuna, Idaho | Lawn Care Kuna`,
    description: `Professional ${service.name.toLowerCase()} services in Kuna, Boise, Meridian, and the Treasure Valley. ${service.shortDescription}. Get a free quote today!`,
    openGraph: {
      title: `${service.name} Services | Lawn Care Kuna`,
      description: service.shortDescription,
      url: `/services/${service.slug}`,
      type: "website",
    },
  };
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const service = PRIORITY_SERVICES.find((s) => s.slug === params.slug);

  if (!service) {
    notFound();
  }

  // Define benefits based on service type
  const benefits = [
    `Professional ${service.name.toLowerCase()} by experienced technicians`,
    "Serving the entire Treasure Valley",
    "Competitive, transparent pricing",
    "Satisfaction guaranteed",
    "Fully licensed and insured",
    "Free estimates and consultations",
  ];

  // Get or generate FAQs for this service
  const faqs = service.faqs && service.faqs.length > 0 ? service.faqs : [
    {
      question: `How much does ${service.name.toLowerCase()} cost?`,
      answer: `Pricing for ${service.name.toLowerCase()} varies based on property size and specific requirements. Contact us at ${BUSINESS_INFO.phone} for a free, no-obligation quote tailored to your property.`,
    },
    {
      question: `How often should I schedule ${service.name.toLowerCase()}?`,
      answer: `The frequency depends on your specific needs and property conditions. Our team will recommend an optimal schedule during your free consultation.`,
    },
    {
      question: `Do you serve my area in the Treasure Valley?`,
      answer: `Yes! We serve Kuna, Boise, Meridian, Eagle, Star, Middleton, and surrounding areas. Call us at ${BUSINESS_INFO.phone} to confirm service in your area.`,
    },
    {
      question: `Are you licensed and insured?`,
      answer: `Absolutely. Lawn Care Kuna is fully licensed and insured with $2M liability coverage for your protection and peace of mind.`,
    },
  ];

  // Generate schema markup
  const serviceSchema = generateServiceSchema(
    service.name,
    service.shortDescription
  );
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
    { name: service.name, url: `/services/${service.slug}` },
  ]);

  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {/* JSON-LD Schema Markup */}
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
      
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {service.category || "Professional Service"}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                {service.name} Services in Kuna
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {service.shortDescription}
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

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Service Description */}
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold">
                  Professional {service.name} in the Treasure Valley
                </h2>
                <div className="prose prose-lg">
                  <p className="text-muted-foreground leading-relaxed">
                    {service.shortDescription}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    At Lawn Care Kuna, we provide expert {service.name.toLowerCase()} services tailored to Idaho's unique climate and conditions. Our experienced team uses professional-grade equipment to deliver exceptional results every time.
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold">Why Choose Us</h3>
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

      {/* Service Areas */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              {service.name} Available In
            </h2>
            <p className="text-muted-foreground">
              We provide professional {service.name.toLowerCase()} services throughout the Treasure Valley
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {CITIES.map((city) => (
                <Link
                  key={city.slug}
                  href={`/services/${params.slug}/${city.slug}`}
                  className="px-4 py-2 rounded-full bg-background border hover:border-primary hover:text-primary transition-colors"
                >
                  {city.name}, ID
                </Link>
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
                Common questions about our {service.name.toLowerCase()} services
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.slice(0, 5).map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="border rounded-lg px-6 hover:shadow-sm transition-shadow"
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

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready for Professional {service.name}?
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
