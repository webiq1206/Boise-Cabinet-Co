import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  MapPin, 
  Leaf,
  Droplets,
  Sun,
  Snowflake,
  Shield,
  Award,
  Clock,
  Star,
  DollarSign,
  Calendar,
  Users,
  ThumbsUp,
  Wrench,
  FileText,
  TrendingUp,
  HelpCircle
} from "lucide-react";
import { PRIORITY_SERVICES, CITIES } from "@/shared/contentData";
import { splitIntoParagraphs } from "@/lib/textUtils";
import { 
  generateServiceSchema, 
  generateBreadcrumbSchema, 
  generateFAQSchema,
  generateLocalBusinessSchema,
  generateSpeakableSchema 
} from "@/lib/schema";
import { BUSINESS_INFO } from "@/lib/seo";
import { Testimonials } from "@/components/Testimonials";
import { RelatedBlogPosts } from "@/components/RelatedBlogPosts";

export async function generateStaticParams() {
  return PRIORITY_SERVICES.map((service) => ({
    slug: service.slug,
  }));
}

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

  const cityNames = CITIES.map(c => c.name.toLowerCase()).join(", ");

  return {
    title: `${service.name} Services in Kuna & Boise, Idaho | Free Quote | Lawn Care Kuna`,
    description: `Professional ${service.name.toLowerCase()} in Kuna, Boise, Meridian, Eagle & Treasure Valley, ID. ${service.shortDescription}. Licensed & insured. Free estimates. Call (208) 352-2011!`,
    openGraph: {
      title: `${service.name} Services in Kuna & Boise, ID | Lawn Care Kuna`,
      description: `Expert ${service.name.toLowerCase()} for homes and businesses in ${cityNames}. ${service.shortDescription}`,
      url: `/services/${service.slug}`,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.name} in Kuna, ID | Free Quote`,
      description: `Top-rated ${service.name.toLowerCase()} in the Treasure Valley. Licensed, insured, locally owned.`,
    },
    alternates: {
      canonical: `/services/${service.slug}`,
    },
  };
}

const getCategoryIcon = (category?: string) => {
  switch (category) {
    case 'lawn-care':
      return Leaf;
    case 'landscaping':
      return Sun;
    case 'seasonal':
      return Snowflake;
    case 'irrigation':
      return Droplets;
    default:
      return Leaf;
  }
};

const getCategoryColor = (category?: string) => {
  switch (category) {
    case 'lawn-care':
      return "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary";
    case 'landscaping':
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    case 'seasonal':
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case 'irrigation':
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    default:
      return "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary";
  }
};

const getCategoryLabel = (category?: string) => {
  switch (category) {
    case 'lawn-care':
      return "Lawn Care";
    case 'landscaping':
      return "Landscaping";
    case 'seasonal':
      return "Seasonal Service";
    case 'irrigation':
      return "Irrigation";
    default:
      return "Professional Service";
  }
};

export default function ServicePage({ params }: { params: { slug: string } }) {
  const service = PRIORITY_SERVICES.find((s) => s.slug === params.slug);

  if (!service) {
    notFound();
  }

  const CategoryIcon = getCategoryIcon(service.category);
  const categoryColor = getCategoryColor(service.category);
  const categoryLabel = getCategoryLabel(service.category);

  const defaultFaqs = [
    {
      question: `How much does ${service.name.toLowerCase()} cost in Kuna and the Treasure Valley?`,
      answer: `Pricing for ${service.name.toLowerCase()} varies based on property size and specific requirements. ${service.pricingGuidance || `Contact us at ${BUSINESS_INFO.phone} for a free, no-obligation quote tailored to your property.`}`,
    },
    {
      question: `How often should I schedule ${service.name.toLowerCase()}?`,
      answer: `The frequency depends on your specific needs and property conditions. ${service.seasonality || 'Our team will recommend an optimal schedule during your free consultation.'}`,
    },
    {
      question: `Do you offer ${service.name.toLowerCase()} in my area?`,
      answer: `Yes! We serve Kuna, Boise, Meridian, Eagle, Star, Middleton, and surrounding Treasure Valley communities. Call us at ${BUSINESS_INFO.phone} to confirm service availability in your specific neighborhood.`,
    },
    {
      question: `Are you licensed and insured for ${service.name.toLowerCase()}?`,
      answer: `Absolutely. Lawn Care Kuna is fully licensed and insured with $2M liability coverage for your protection and peace of mind. We carry comprehensive insurance on all our equipment and employees.`,
    },
    {
      question: `What makes your ${service.name.toLowerCase()} service different?`,
      answer: `We combine local expertise with professional-grade equipment and a commitment to quality. Our team understands Idaho's unique climate and soil conditions, ensuring optimal results. Plus, we offer transparent pricing with no hidden fees.`,
    },
  ];

  const faqs = service.faqs && service.faqs.length > 0 ? service.faqs : defaultFaqs;
  
  const benefits = service.benefits && service.benefits.length > 0 
    ? service.benefits 
    : [
        `Professional ${service.name.toLowerCase()} by experienced technicians`,
        "Serving the entire Treasure Valley",
        "Competitive, transparent pricing",
        "Satisfaction guaranteed",
        "Fully licensed and insured",
        "Free estimates and consultations",
      ];

  const process = service.process && service.process.length > 0 
    ? service.process 
    : [
        { step: 1, title: 'Free Consultation', description: 'Contact us for a no-obligation assessment of your property and needs.' },
        { step: 2, title: 'Custom Quote', description: 'We provide transparent pricing tailored to your specific property.' },
        { step: 3, title: 'Schedule Service', description: 'Choose a convenient time that works for your schedule.' },
        { step: 4, title: 'Expert Service', description: 'Our trained technicians complete the work to the highest standards.' },
        { step: 5, title: 'Quality Check', description: 'We ensure everything meets our quality standards before we leave.' },
        { step: 6, title: 'Follow-Up', description: 'We check in to make sure you\'re completely satisfied with our work.' },
      ];

  const relatedServices = service.relatedServices 
    ? PRIORITY_SERVICES.filter(s => service.relatedServices?.includes(s.slug)).slice(0, 4)
    : PRIORITY_SERVICES.filter(s => s.category === service.category && s.slug !== service.slug).slice(0, 4);

  const serviceSchema = generateServiceSchema(
    `${service.name} in Kuna, Idaho`,
    service.shortDescription
  );
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
    { name: service.name, url: `/services/${service.slug}` },
  ]);

  const faqSchema = generateFAQSchema(faqs.slice(0, 10));
  const localBusinessSchema = generateLocalBusinessSchema();

  const howToSchema = process.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How ${service.name} Works`,
    "description": `Step-by-step process for our professional ${service.name.toLowerCase()} service in the Treasure Valley.`,
    "step": process.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.title,
      "text": step.description,
    })),
    "provider": {
      "@type": "LocalBusiness",
      "name": BUSINESS_INFO.name,
      "telephone": BUSINESS_INFO.phone,
    },
  } : null;

  const trustIndicators = [
    { icon: Award, label: "Est. 2017", desc: "7+ Years Experience" },
    { icon: Shield, label: "Licensed & Insured", desc: "$2M Coverage" },
    { icon: Star, label: "5-Star Rated", desc: "100+ Reviews" },
    { icon: ThumbsUp, label: "Satisfaction", desc: "Guaranteed" },
  ];

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSpeakableSchema({
          name: `${service.name} Services`,
          url: `/services/${service.slug}`,
        })) }}
      />
      
      <div className="flex flex-col">
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/10 via-primary/5 to-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center space-y-6">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Badge className={categoryColor} data-testid="badge-category">
                    <CategoryIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                    {categoryLabel}
                  </Badge>
                  <Badge variant="secondary" className="gap-1" data-testid="badge-location">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    Treasure Valley, ID
                  </Badge>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground" data-testid="text-hero-heading">
                  {service.name} Services
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-hero-subtitle">
                  {service.shortDescription}. Serving Kuna, Boise, Meridian, Eagle, Star, and Middleton.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center pt-4">
                  <Button size="lg" asChild>
                    <Link href="/get-quote" data-testid="link-hero-quote">
                      Get Free Quote
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="bg-gradient-to-br from-primary/10 to-white border-primary/20 text-primary" asChild>
                    <a href="tel:2083522011" data-testid="link-hero-phone">
                      <Phone className="mr-2 h-5 w-5" />
                      (208) 352-2011
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 border-b" data-testid="section-trust-indicators">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {trustIndicators.map((item, index) => (
                  <div key={index} className="text-center space-y-1" data-testid={`trust-indicator-${index}`}>
                    <item.icon className="h-6 w-6 text-primary mx-auto" aria-hidden="true" />
                    <div className="font-semibold text-sm">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-6 bg-muted/20" data-testid="section-ai-summary">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <p className="text-base text-muted-foreground leading-relaxed text-center" data-speakable="summary" data-testid="text-ai-summary">
                Lawn Care Kuna offers professional {service.name.toLowerCase()} for residential and commercial properties in Kuna, Boise, Meridian, Eagle, Star, and Middleton, Idaho. {service.shortDescription}. We are licensed and insured with $2M coverage. {service.seasonality ? `Season: ${service.seasonality}` : ''} Call (208) 352-2011 for a free estimate.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24" data-testid="section-about-service">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-6">
                  <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-about-heading">
                    Professional {service.name} in the Treasure Valley
                  </h2>
                  <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                    {service.longDescription ? (
                      splitIntoParagraphs(service.longDescription, 3).slice(0, 4).map((paragraph, idx) => (
                        <p key={idx} className="leading-relaxed">
                          {paragraph}
                        </p>
                      ))
                    ) : (
                      <>
                        <p className="leading-relaxed">
                          {service.shortDescription}
                        </p>
                        <p className="leading-relaxed">
                          At Lawn Care Kuna, we provide expert {service.name.toLowerCase()} services tailored to Idaho's unique climate and conditions. Our experienced team uses professional-grade equipment to deliver exceptional results every time.
                        </p>
                        <p className="leading-relaxed">
                          We serve residential homes, commercial properties, and HOA communities throughout Kuna, Boise, Meridian, Eagle, Star, and Middleton.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {service.facts && service.facts.length > 0 && (
                    <Card className="bg-gradient-to-br from-primary/5 to-white dark:from-primary/10 dark:to-background" data-testid="card-service-facts">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center flex-wrap gap-2">
                          <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                          {service.name} Quick Facts
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {service.facts.slice(0, 6).map((fact, index) => (
                          <div key={index} className="flex items-center flex-wrap justify-between gap-2 text-sm">
                            <span className="text-muted-foreground">{fact.label}</span>
                            <span className="font-medium">{fact.value}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {service.pricingGuidance && (
                    <Card data-testid="card-pricing-info">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center flex-wrap gap-2">
                          <DollarSign className="h-5 w-5 text-primary" aria-hidden="true" />
                          Pricing Info
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{service.pricingGuidance}</p>
                        <Button className="w-full mt-4" asChild>
                          <Link href="/get-quote" data-testid="link-pricing-quote">
                            Get Your Quote
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {service.seasonality && (
                    <Card data-testid="card-seasonality">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center flex-wrap gap-2">
                          <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
                          Best Time for Service
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{service.seasonality}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-muted/30" data-testid="section-benefits">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-benefits-heading">
                  Why Choose Us for {service.name}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Benefits of our professional {service.name.toLowerCase()} service in the Treasure Valley
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {benefits.slice(0, 12).map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-md bg-background" data-testid={`benefit-${index}`}>
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {process.length > 0 && (
          <section className="py-16 md:py-24" data-testid="section-process">
            <div className="container px-4">
              <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-process-heading">
                    How Our {service.name} Service Works
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Our streamlined process ensures quality results every time
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {process.slice(0, 6).map((step, index) => (
                    <Card key={index} className="relative hover-elevate" data-testid={`process-step-${index}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center flex-wrap gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-primary-foreground font-bold text-lg">
                            {step.step}
                          </div>
                          <CardTitle className="text-base">{step.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="py-16 md:py-24 bg-muted/30" data-testid="section-service-areas">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-areas-heading">
                {service.name} Available Throughout the Treasure Valley
              </h2>
              <p className="text-muted-foreground">
                We provide professional {service.name.toLowerCase()} in these Idaho communities
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {CITIES.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/services/${params.slug}/${city.slug}`}
                    className="flex items-center flex-wrap gap-2 px-4 py-2 rounded-md bg-background border hover-elevate"
                    data-testid={`link-city-${city.slug}`}
                  >
                    <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span>{city.name}, ID</span>
                    <span className="text-xs text-muted-foreground">({city.population})</span>
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {CITIES.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/areas/${city.slug}`}
                    className="text-sm text-primary hover:underline"
                    data-testid={`link-area-${city.slug}`}
                  >
                    All services in {city.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {relatedServices.length > 0 && (
          <section className="py-16 md:py-24" data-testid="section-related-services">
            <div className="container px-4">
              <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-related-heading">
                    Related Services
                  </h2>
                  <p className="text-muted-foreground">
                    Complement your {service.name.toLowerCase()} with these additional services
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedServices.map((relatedService) => {
                    const RelatedIcon = getCategoryIcon(relatedService.category);
                    return (
                      <Card key={relatedService.slug} className="hover-elevate" data-testid={`card-related-${relatedService.slug}`}>
                        <CardHeader className="pb-3">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-md ${getCategoryColor(relatedService.category)} mb-2`}>
                            <RelatedIcon className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <CardTitle className="text-base">{relatedService.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {relatedService.shortDescription}
                          </p>
                          <Button variant="outline" size="sm" className="w-full bg-gradient-to-br from-primary/10 to-white border-primary/20 text-primary" asChild>
                            <Link href={`/services/${relatedService.slug}`} data-testid={`link-related-${relatedService.slug}`}>
                              Explore {relatedService.name} Services
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="py-16 md:py-24 bg-muted/30" data-testid="section-testimonials">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-testimonials-heading">
                  What Our Customers Say
                </h2>
                <p className="text-muted-foreground">
                  Real reviews from homeowners and businesses in the Treasure Valley
                </p>
              </div>
              <Testimonials limit={6} />
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24" data-testid="section-faq">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-faq-heading">
                  {service.name} FAQs
                </h2>
                <p className="text-muted-foreground">
                  Common questions about our {service.name.toLowerCase()} services
                </p>
              </div>

              <Accordion type="single" collapsible className="w-full" data-testid="accordion-faq">
                {faqs.slice(0, 10).map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left text-base font-semibold hover:text-primary" data-testid={`faq-question-${index}`}>
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground" data-testid={`faq-answer-${index}`}>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        <div data-testid="section-related-blog">
          <RelatedBlogPosts serviceSlug={service.slug} limit={3} />
        </div>

        <section className="py-12 md:py-16 bg-muted/30" data-testid="section-helpful-links">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-xl font-bold text-center" data-testid="text-helpful-links">Helpful Resources</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Link href="/faq" className="flex items-center gap-2 p-3 rounded-md border bg-background hover-elevate text-sm" data-testid="link-cross-faq">
                  <HelpCircle className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium">FAQ</span>
                </Link>
                <Link href="/seasonal-guide" className="flex items-center gap-2 p-3 rounded-md border bg-background hover-elevate text-sm" data-testid="link-cross-seasonal">
                  <Calendar className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium">Seasonal Guide</span>
                </Link>
                <Link href="/pricing" className="flex items-center gap-2 p-3 rounded-md border bg-background hover-elevate text-sm" data-testid="link-cross-pricing">
                  <DollarSign className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium">Pricing</span>
                </Link>
                <Link href="/blog" className="flex items-center gap-2 p-3 rounded-md border bg-background hover-elevate text-sm" data-testid="link-cross-blog">
                  <FileText className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium">Blog</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24" data-testid="section-cta">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-br from-green-950 via-primary to-green-700 text-white p-10 md:p-16 text-center space-y-8 shadow-xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-cta-heading">
                Ready for Professional {service.name}?
              </h2>
              <p className="text-lg text-white/85 leading-relaxed max-w-2xl mx-auto">
                Get a free, no-obligation quote for your property. We'll assess your needs and provide transparent pricing with no hidden fees.
              </p>
              <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto pt-2">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm">
                    <Clock className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="font-semibold text-sm">Fast Response</div>
                  <div className="text-xs text-white/70">Same-day quotes</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm">
                    <Shield className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="font-semibold text-sm">No Obligation</div>
                  <div className="text-xs text-white/70">Free estimates</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm">
                    <TrendingUp className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="font-semibold text-sm">Results Driven</div>
                  <div className="text-xs text-white/70">Quality guaranteed</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center pt-4">
                <Button size="lg" className="bg-white text-green-900 hover:bg-white/90 border-0" asChild>
                  <Link href="/get-quote" data-testid="link-cta-quote">
                    Get Free Quote
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/40 text-white bg-white/10 backdrop-blur-sm" asChild>
                  <a href="tel:2083522011" data-testid="link-cta-phone">
                    <Phone className="mr-2 h-5 w-5" />
                    (208) 352-2011
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
