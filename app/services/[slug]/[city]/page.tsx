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
  MapPin, 
  ArrowRight, 
  Phone, 
  Shield, 
  Award,
  Star,
  ThumbsUp,
  Clock,
  Users,
  Leaf,
  Droplets,
  Sun,
  Snowflake,
  DollarSign,
  Calendar,
  FileText,
  Home,
  Mountain,
  ThermometerSun,
  TrendingUp
} from "lucide-react";
import { PRIORITY_SERVICES, CITIES } from "@/shared/contentData";
import { splitIntoParagraphs } from "@/lib/textUtils";
import { generateSEOMetadata, CITY_SEO_DATA, BUSINESS_INFO } from "@/lib/seo";
import {
  generateServiceSchema,
  generateLocalBusinessSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateSpeakableSchema,
} from "@/lib/schema";
import { Testimonials } from "@/components/Testimonials";
import { RelatedBlogPosts } from "@/components/RelatedBlogPosts";

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
    title: `${service.name} in ${city.name}, Idaho | Licensed Pros | Free Quote`,
    description: `Top-rated ${service.name.toLowerCase()} in ${city.name}, ID. ${service.shortDescription}. ${city.neighborhoods && city.neighborhoods.length > 0 ? `Serving ${city.neighborhoods.slice(0, 2).join(", ")} & all ${city.name} areas.` : `Serving all ${city.name} areas.`} Licensed & insured. Call (208) 352-2011!`,
    openGraph: {
      title: `${service.name} in ${city.name}, ID | Lawn Care Kuna`,
      description: `Professional ${service.name.toLowerCase()} for ${city.name} homes and businesses. ${city.population} residents trust us. Free estimates!`,
      url: `/services/${service.slug}/${city.slug}`,
      type: "website",
      locale: "en_US",
      images: [{ url: seoMetadata.ogImage || "/images/lawn-care-kuna-logo.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.name} ${city.name}, ID | Free Quote`,
      description: `Top-rated ${service.name.toLowerCase()} in ${city.name}. Licensed, insured, locally owned.`,
    },
    alternates: {
      canonical: `/services/${service.slug}/${city.slug}`,
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

const getCategoryIcon = (category?: string) => {
  switch (category) {
    case 'lawn-care': return Leaf;
    case 'landscaping': return Sun;
    case 'seasonal': return Snowflake;
    case 'irrigation': return Droplets;
    default: return Leaf;
  }
};

const getCategoryColor = (category?: string) => {
  switch (category) {
    case 'lawn-care': return "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary";
    case 'landscaping': return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    case 'seasonal': return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case 'irrigation': return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    default: return "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary";
  }
};

const getCategoryLabel = (category?: string) => {
  switch (category) {
    case 'lawn-care': return "Lawn Care";
    case 'landscaping': return "Landscaping";
    case 'seasonal': return "Seasonal Service";
    case 'irrigation': return "Irrigation";
    default: return "Professional Service";
  }
};

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

  const CategoryIcon = getCategoryIcon(service.category);
  const categoryColor = getCategoryColor(service.category);
  const categoryLabel = getCategoryLabel(service.category);

  const cityData = CITY_SEO_DATA[city.name as keyof typeof CITY_SEO_DATA];

  const localBusinessSchema = generateLocalBusinessSchema(city.name);
  const serviceSchema = generateServiceSchema(
    `${service.name} in ${city.name}, Idaho`,
    service.shortDescription,
    city.name
  );
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
    { name: service.name, url: `/services/${service.slug}` },
    { name: city.name, url: `/services/${service.slug}/${city.slug}` },
  ]);

  const cityServiceFaqs = [
    {
      question: `How much does ${service.name.toLowerCase()} cost in ${city.name}?`,
      answer: service.pricingGuidance 
        ? `${service.pricingGuidance} Prices in ${city.name} may vary slightly based on property size and accessibility. Contact us at ${BUSINESS_INFO.phone} for a free, no-obligation quote for your ${city.name} property.`
        : `Pricing for ${service.name.toLowerCase()} in ${city.name} varies based on property size and specific requirements. Contact us at ${BUSINESS_INFO.phone} for a free, no-obligation quote tailored to your property.`,
    },
    {
      question: `When is the best time for ${service.name.toLowerCase()} in ${city.name}?`,
      answer: service.seasonality 
        ? `${service.seasonality} ${city.name}'s ${city.localFactors?.climate || 'semi-arid climate'} means timing is important for optimal results.`
        : `The best time for ${service.name.toLowerCase()} in ${city.name} depends on your specific needs. ${city.name}'s ${city.localFactors?.climate || 'semi-arid climate'} affects optimal timing. Our team will recommend the best schedule during your consultation.`,
    },
    {
      question: `Do you serve my neighborhood in ${city.name}?`,
      answer: `Yes! We serve all neighborhoods throughout ${city.name}, including ${city.neighborhoods?.slice(0, 4).join(", ") || 'all areas'}. We also cover the zip code${city.zipCodes && city.zipCodes.length > 1 ? 's' : ''} ${city.zipCodes?.join(", ") || ''}. Call us at ${BUSINESS_INFO.phone} to confirm service in your specific area.`,
    },
    {
      question: `Why should I choose you for ${service.name.toLowerCase()} in ${city.name}?`,
      answer: `We've been serving ${city.name} since 2017 and understand the unique challenges of ${city.localFactors?.soil || 'local soil conditions'} and ${city.localFactors?.climate || 'the local climate'}. We're fully licensed, insured with $2M coverage, and offer satisfaction guaranteed. Our team lives and works in the Treasure Valley.`,
    },
    {
      question: `How quickly can you start ${service.name.toLowerCase()} on my ${city.name} property?`,
      answer: `We typically provide quotes within 24 hours and can often schedule service within the same week. For urgent needs, call us directly at ${BUSINESS_INFO.phone} and we'll do our best to accommodate your timeline.`,
    },
  ];

  const serviceFaqs = service.faqs?.map(faq => ({
    ...faq,
    question: faq.question.includes(city.name) ? faq.question : faq.question.replace('?', ` in ${city.name}?`),
    answer: faq.answer.includes(city.name) ? faq.answer : `${faq.answer} This applies to ${city.name} properties as well.`,
  })) || [];

  const allFaqs = [...cityServiceFaqs, ...serviceFaqs.slice(0, 5)];
  const faqSchema = generateFAQSchema(allFaqs.slice(0, 10));

  const howToSchema = service.process && service.process.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How ${service.name} Works in ${city.name}`,
    "description": `Step-by-step process for our professional ${service.name.toLowerCase()} service in ${city.name}, Idaho.`,
    "step": service.process.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.title,
      "text": step.description,
    })),
    "provider": {
      "@type": "LocalBusiness",
      "name": BUSINESS_INFO.name,
      "telephone": BUSINESS_INFO.phone,
      "areaServed": city.name,
    },
  } : null;

  const benefits = service.benefits || [
    `Expert ${service.name.toLowerCase()} tailored to ${city.name}'s climate`,
    "Professional-grade equipment and materials",
    "Fully licensed and insured team",
    "Transparent, competitive pricing",
    "Satisfaction guaranteed on every job",
    "Flexible scheduling options",
  ];

  const process = service.process || [
    { step: 1, title: "Free Consultation", description: "We assess your property and discuss your specific needs and goals." },
    { step: 2, title: "Custom Quote", description: "Receive a detailed, transparent quote with no hidden fees." },
    { step: 3, title: "Professional Service", description: "Our experienced team delivers high-quality results." },
    { step: 4, title: "Follow-Up", description: "We ensure your complete satisfaction and address any questions." },
  ];

  const trustIndicators = [
    { icon: Award, label: "Est. 2017", desc: "7+ Years Experience" },
    { icon: Shield, label: "Licensed & Insured", desc: "$2M Coverage" },
    { icon: Star, label: "5-Star Rated", desc: "100+ Reviews" },
    { icon: ThumbsUp, label: "Satisfaction", desc: "Guaranteed" },
  ];

  const otherCities = CITIES.filter((c) => c.slug !== params.city);
  const relatedServices = service.relatedServices 
    ? PRIORITY_SERVICES.filter(s => service.relatedServices?.includes(s.slug)).slice(0, 4)
    : PRIORITY_SERVICES.filter(s => s.category === service.category && s.slug !== service.slug).slice(0, 4);

  return (
    <>
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
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSpeakableSchema({
          name: `${service.name} in ${city.name}`,
          url: `/services/${service.slug}/${city.slug}`,
        })) }}
      />

      <div className="flex flex-col">
        <nav className="container px-4 py-4" aria-label="Breadcrumb" data-testid="nav-breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover-elevate px-1 rounded" data-testid="link-breadcrumb-home">Home</Link></li>
            <li>/</li>
            <li><Link href="/services" className="hover-elevate px-1 rounded" data-testid="link-breadcrumb-services">Services</Link></li>
            <li>/</li>
            <li><Link href={`/services/${service.slug}`} className="hover-elevate px-1 rounded" data-testid="link-breadcrumb-service">{service.name}</Link></li>
            <li>/</li>
            <li><Link href={`/areas/${city.slug}`} className="hover-elevate px-1 rounded" data-testid="link-breadcrumb-area">{city.name}</Link></li>
          </ol>
        </nav>

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
                    {city.name}, Idaho
                  </Badge>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground" data-testid="text-hero-heading">
                  {service.name} in {city.name}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-hero-subtitle">
                  {service.shortDescription}. {city.neighborhoods && city.neighborhoods.length > 0 
                    ? `Serving ${city.neighborhoods.slice(0, 2).join(", ")} and all ${city.name} neighborhoods.`
                    : `Serving all ${city.name} neighborhoods.`}
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
                Lawn Care Kuna provides professional {service.name.toLowerCase()} in {city.name}, Idaho{city.zipCodes ? ` (${city.zipCodes.join(", ")})` : ""}. {city.name} lawns require specialized care due to {city.localFactors?.soil?.toLowerCase() || "local clay-heavy soil"} and {city.localFactors?.climate?.toLowerCase() || "the semi-arid climate with hot summers and cold winters"}. {service.shortDescription}. We serve {city.neighborhoods?.slice(0, 3).join(", ") || `all ${city.name} neighborhoods`} and surrounding areas. Licensed and insured with $2M coverage. Call (208) 352-2011 for a free estimate.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24" data-testid="section-about">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-6">
                  <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-about-heading">
                    Professional {service.name} for {city.name} Properties
                  </h2>
                  <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                    {service.longDescription ? (
                      splitIntoParagraphs(service.longDescription, 3).slice(0, 3).map((paragraph, idx) => (
                        <p key={idx} className="leading-relaxed">
                          {paragraph}
                        </p>
                      ))
                    ) : (
                      <p className="leading-relaxed">{service.shortDescription}</p>
                    )}
                    <p className="leading-relaxed">
                      {city.name} properties face unique challenges due to {city.localFactors?.climate || "Idaho's semi-arid climate"} and {city.localFactors?.soil || "local soil conditions"}. {city.localFactors?.commonNeeds && city.localFactors.commonNeeds.length > 0 ? `Common concerns for ${city.name} homeowners include ${city.localFactors.commonNeeds.slice(0, 3).join(", ").toLowerCase()}.` : ""}
                    </p>
                    {city.serviceConsiderations && (
                      <p className="leading-relaxed">
                        {city.serviceConsiderations}
                      </p>
                    )}
                    {city.facts && city.facts.length > 0 && (
                      <p className="leading-relaxed">
                        For {service.name.toLowerCase()} in {city.name}, we recommend maintaining a grass height of {city.facts.find(f => f.label.toLowerCase().includes("grass height"))?.value || "3 inches"}, watering {city.facts.find(f => f.label.toLowerCase().includes("watering"))?.value || "1-1.5 inches per week"}, and scheduling aeration in {city.facts.find(f => f.label.toLowerCase().includes("aerate"))?.value || "fall"}. The average lawn size in {city.name} is approximately {city.facts.find(f => f.label.toLowerCase().includes("lawn size"))?.value || "5,000 sq. ft."}.
                      </p>
                    )}
                    <p className="leading-relaxed">
                      Our team has extensive experience serving {city.name} homeowners{city.neighborhoods && city.neighborhoods.length > 0 ? `, from ${city.neighborhoods[0]} to ${city.neighborhoods[city.neighborhoods.length - 1]}` : ""}, and understands what it takes to achieve great results in this area. {city.zipCodes ? `We cover zip code${city.zipCodes.length > 1 ? "s" : ""} ${city.zipCodes.join(", ")} for all ${service.name.toLowerCase()} needs.` : ""}
                    </p>
                  </div>

                  <div className="pt-4">
                    <h3 className="font-semibold mb-3">Why {city.name} Residents Choose Us:</h3>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {benefits.slice(0, 8).map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  {service.facts && service.facts.length > 0 && (
                    <Card className="bg-gradient-to-br from-primary/5 to-white dark:from-primary/10 dark:to-background" data-testid="card-service-facts">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center flex-wrap gap-2">
                          <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                          {service.name} Facts
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {service.facts.slice(0, 5).map((fact, index) => (
                          <div key={index} className="flex items-center flex-wrap justify-between gap-2 text-sm">
                            <span className="text-muted-foreground">{fact.label}</span>
                            <span className="font-medium">{fact.value}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {city.facts && city.facts.length > 0 && (
                    <Card data-testid="card-city-facts">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center flex-wrap gap-2">
                          <ThermometerSun className="h-5 w-5 text-primary" aria-hidden="true" />
                          {city.name} Lawn Care Tips
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {city.facts.slice(0, 4).map((fact, index) => (
                          <div key={index} className="flex items-center flex-wrap justify-between gap-2 text-sm">
                            <span className="text-muted-foreground">{fact.label}</span>
                            <span className="font-medium">{fact.value}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {service.pricingGuidance && (
                    <Card data-testid="card-pricing">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center flex-wrap gap-2">
                          <DollarSign className="h-5 w-5 text-primary" aria-hidden="true" />
                          Pricing Info
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{service.pricingGuidance}</p>
                        <Button className="w-full mt-4" asChild>
                          <Link href="/get-quote" data-testid="link-pricing-quote">Get Your Quote</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {city.neighborhoods && city.neighborhoods.length > 0 && (
          <section className="py-16 md:py-24 bg-muted/30" data-testid="section-neighborhoods">
            <div className="container px-4">
              <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-neighborhoods-heading">
                      {service.name} in {city.name} Neighborhoods
                    </h2>
                    <p className="text-muted-foreground">
                      We provide {service.name.toLowerCase()} throughout {city.name}, including:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {city.neighborhoods.map((neighborhood, index) => (
                        <Badge key={index} variant="secondary" className="text-sm" data-testid={`badge-neighborhood-${index}`}>
                          <Home className="h-3 w-3 mr-1" aria-hidden="true" />
                          {neighborhood}
                        </Badge>
                      ))}
                    </div>
                    {city.zipCodes && (
                      <p className="text-sm text-muted-foreground">
                        Zip codes served: {city.zipCodes.join(", ")}
                      </p>
                    )}
                  </div>

                  {city.landmarks && city.landmarks.length > 0 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold flex items-center flex-wrap gap-2">
                        <Mountain className="h-5 w-5 text-primary" aria-hidden="true" />
                        Near {city.name} Landmarks
                      </h3>
                      <p className="text-muted-foreground">
                        We serve properties near these well-known locations:
                      </p>
                      <ul className="space-y-2">
                        {city.landmarks.slice(0, 6).map((landmark, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                            {landmark}
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

        {process.length > 0 && (
          <section className="py-16 md:py-24" data-testid="section-process">
            <div className="container px-4">
              <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-process-heading">
                    How Our {service.name} Process Works
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Our streamlined process ensures quality results for every {city.name} property
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

        <section className="py-16 md:py-24 bg-muted/30" data-testid="section-testimonials">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-testimonials-heading">
                  What {city.name} Customers Say
                </h2>
                <p className="text-muted-foreground">
                  Real reviews from homeowners and businesses in {city.name} and the Treasure Valley
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
                  {service.name} in {city.name}: FAQs
                </h2>
                <p className="text-muted-foreground">
                  Common questions about {service.name.toLowerCase()} for {city.name} properties
                </p>
              </div>

              <Accordion type="single" collapsible className="w-full" data-testid="accordion-faq">
                {allFaqs.slice(0, 10).map((faq, index) => (
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

        {relatedServices.length > 0 && (
          <section className="py-16 md:py-24 bg-muted/30" data-testid="section-related-services">
            <div className="container px-4">
              <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-related-heading">
                    Related Services in {city.name}
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
                            <Link href={`/services/${relatedService.slug}/${city.slug}`} data-testid={`link-related-${relatedService.slug}`}>
                              View in {city.name}
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

        <div data-testid="section-related-blog">
          <RelatedBlogPosts serviceSlug={service.slug} limit={3} />
        </div>

        <section className="py-16 md:py-24 bg-muted/30" data-testid="section-other-cities">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-other-cities-heading">
                {service.name} Also Available In
              </h2>
              <p className="text-muted-foreground">
                We provide {service.name.toLowerCase()} throughout the Treasure Valley
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {otherCities.map((otherCity) => (
                  <Link
                    key={otherCity.slug}
                    href={`/services/${service.slug}/${otherCity.slug}`}
                    className="flex items-center flex-wrap gap-2 px-4 py-2 rounded-md bg-background border hover-elevate"
                    data-testid={`link-city-${otherCity.slug}`}
                  >
                    <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span>{otherCity.name}, ID</span>
                    <span className="text-xs text-muted-foreground">({otherCity.population})</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24" data-testid="section-cta">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-br from-green-950 via-primary to-green-700 text-white p-10 md:p-16 text-center space-y-8 shadow-xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-cta-heading">
                Ready for Professional {service.name} in {city.name}?
              </h2>
              <p className="text-lg text-white/85 leading-relaxed max-w-2xl mx-auto">
                Get a free, no-obligation quote for your {city.name} property. We'll assess your needs and provide transparent pricing.
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
                    <Users className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="font-semibold text-sm">Local Team</div>
                  <div className="text-xs text-white/70">Serving {city.name}</div>
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
