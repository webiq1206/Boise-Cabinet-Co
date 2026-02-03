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
  Users,
  Shield,
  Award,
  Clock,
  Star,
  TreeDeciduous,
  Home,
  Building2,
  ThermometerSun,
  Mountain
} from "lucide-react";
import { CITIES, PRIORITY_SERVICES } from "@/shared/contentData";
import { 
  generateLocalBusinessSchema, 
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateServiceSchema
} from "@/lib/schema";
import { Testimonials } from "@/components/Testimonials";

export async function generateStaticParams() {
  return CITIES.map((city) => ({
    slug: city.slug,
  }));
}

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

  const primaryKeywords = [
    `lawn care ${city.name.toLowerCase()}`,
    `lawn care ${city.name.toLowerCase()} idaho`,
    `${city.name.toLowerCase()} lawn service`,
    `landscaping ${city.name.toLowerCase()} id`,
    `lawn mowing ${city.name.toLowerCase()}`,
    `lawn care near me ${city.name.toLowerCase()}`,
  ];

  return {
    title: `Lawn Care ${city.name}, Idaho | #1 Local Lawn Service | Free Quote`,
    description: `Top-rated lawn care in ${city.name}, ID. Professional lawn mowing, landscaping, irrigation & more. Serving ${city.neighborhoods?.slice(0, 3).join(", ")} & all ${city.name} neighborhoods. Licensed & insured. Call (208) 352-2011!`,
    keywords: primaryKeywords,
    openGraph: {
      title: `Best Lawn Care in ${city.name}, Idaho | Lawn Care Kuna`,
      description: `Professional lawn care and landscaping services in ${city.name}, ID. ${city.population} residents trust us for lawn mowing, fertilization, irrigation, and more.`,
      url: `/areas/${city.slug}`,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `Lawn Care ${city.name}, ID | Free Quote`,
      description: `Top-rated lawn care in ${city.name}. Licensed, insured, and locally owned. Call today!`,
    },
    alternates: {
      canonical: `/areas/${city.slug}`,
    },
  };
}

const cityFAQs = (cityName: string, cityData: typeof CITIES[0]) => [
  {
    question: `How much does lawn care cost in ${cityName}, Idaho?`,
    answer: `Lawn care in ${cityName} typically starts at $35 for basic lawn mowing. The average ${cityName} lawn is about ${cityData.facts?.find(f => f.label === 'Average lawn size')?.value || '5,000-7,000 sq. ft.'}, with weekly mowing ranging $35-75 depending on size and complexity. Fertilization starts at $50, aeration at $75, and seasonal cleanup at $150-175. We provide free, detailed quotes for all ${cityName} properties.`
  },
  {
    question: `What lawn care services do you offer in ${cityName}?`,
    answer: `We offer comprehensive lawn care services throughout ${cityName} including: lawn mowing and edging, fertilization programs, weed control, core aeration, overseeding, spring and fall cleanup, irrigation system repair and maintenance, sprinkler winterization, landscaping, patio installation, retaining walls, Christmas light installation, tree trimming, and snow removal. We serve all ${cityName} neighborhoods including ${cityData.neighborhoods?.join(", ")}.`
  },
  {
    question: `What is the best time to aerate lawns in ${cityName}?`,
    answer: `The best time to aerate lawns in ${cityName} is ${cityData.facts?.find(f => f.label === 'When to aerate')?.value || 'fall'}, typically September through early October. ${cityData.localFactors?.soil || "The soil in this area"} makes annual aeration essential for healthy grass. Fall aeration allows roots to recover before winter dormancy and promotes thicker spring growth. For severely compacted lawns, spring aeration (April-May) can also be beneficial.`
  },
  {
    question: `How often should I water my lawn in ${cityName}?`,
    answer: `${cityName} lawns need ${cityData.facts?.find(f => f.label === 'Recommended watering')?.value || '1-2 inches per week'} during the growing season. ${cityData.localFactors?.climate || "The local climate"} means deep, infrequent watering (2-3 times per week) is better than daily light watering. Early morning watering (before 10 AM) reduces evaporation. We can help optimize your irrigation system for maximum efficiency.`
  },
  {
    question: `Do you serve my neighborhood in ${cityName}?`,
    answer: `Yes! We serve all of ${cityName}, Idaho including ${cityData.neighborhoods?.join(", ")}, and surrounding areas. Our service area covers the entire ${cityName} zip code${cityData.zipCodes?.length > 1 ? 's' : ''} (${cityData.zipCodes?.join(", ")}). We provide the same high-quality service to residential homes, commercial properties, and HOA communities throughout ${cityName}.`
  },
  {
    question: `When should I winterize my sprinklers in ${cityName}?`,
    answer: `Sprinkler systems in ${cityName} should be winterized (blown out) in ${cityData.facts?.find(f => f.label === 'When to blow out sprinklers')?.value || 'October or November'}, before the first hard freeze. ${cityData.localFactors?.climate || "The local climate"} can damage unprotected irrigation systems. We use commercial air compressors to completely clear water from all zones, preventing costly freeze damage to pipes, valves, and sprinkler heads.`
  },
];

export default function AreaPage({ params }: { params: { slug: string } }) {
  const city = CITIES.find((c) => c.slug === params.slug);

  if (!city) {
    notFound();
  }

  const popularServices = PRIORITY_SERVICES.slice(0, 12);
  const faqs = cityFAQs(city.name, city);
  const otherCities = CITIES.filter(c => c.slug !== params.slug);

  const localBusinessSchema = generateLocalBusinessSchema(city.name);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Service Areas", url: "/areas" },
    { name: city.name, url: `/areas/${city.slug}` },
  ]);
  const faqSchema = generateFAQSchema(faqs);
  const serviceSchema = generateServiceSchema(
    `Lawn Care Services in ${city.name}, Idaho`,
    `Professional lawn care, landscaping, and property maintenance services in ${city.name}, ID`,
    city.name
  );

  const serviceCategories = [
    {
      title: "Lawn Care",
      icon: Leaf,
      services: ["Lawn Mowing", "Fertilization", "Weed Control", "Aeration", "Overseeding"],
      color: "bg-green-100 text-green-700"
    },
    {
      title: "Seasonal",
      icon: TreeDeciduous,
      services: ["Spring Cleanup", "Fall Cleanup", "Christmas Lights", "Snow Removal"],
      color: "bg-amber-100 text-amber-700"
    },
    {
      title: "Landscaping",
      icon: Sun,
      services: ["Patio Installation", "Retaining Walls", "Mulching", "Hedge Trimming"],
      color: "bg-orange-100 text-orange-700"
    },
    {
      title: "Irrigation",
      icon: Droplets,
      services: ["Sprinkler Repair", "System Installation", "Winterization", "Maintenance"],
      color: "bg-blue-100 text-blue-700"
    },
  ];

  const trustIndicators = [
    { icon: Award, label: "Est. 2017", desc: "7+ Years Serving Idaho" },
    { icon: Shield, label: "Licensed & Insured", desc: "$2M Liability Coverage" },
    { icon: Users, label: `${city.population}`, desc: `${city.name} Residents` },
    { icon: Star, label: "5-Star Rated", desc: "100+ Happy Customers" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      
      <div className="flex flex-col">
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/10 via-primary/5 to-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center space-y-6">
                <Badge variant="secondary" className="gap-2" data-testid="badge-location">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  {city.name}, Idaho
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground" data-testid="text-hero-heading">
                  Lawn Care Services in {city.name}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-hero-subtitle">
                  Professional lawn care and landscaping for {city.name} homes and businesses. 
                  Serving {city.neighborhoods?.slice(0, 3).join(", ")} and all {city.name} neighborhoods.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center pt-4">
                  <Button size="lg" asChild>
                    <Link href="/get-quote" data-testid="link-hero-quote">
                      Get Free Quote
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
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

        <section className="py-16 md:py-24" data-testid="section-about-area">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-5 gap-12">
                <div className="lg:col-span-3 space-y-6">
                  <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-about-heading">
                    Your Trusted Lawn Care Partner in {city.name}, Idaho
                  </h2>
                  <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                    <p className="leading-relaxed">
                      {city.extendedDescription}
                    </p>
                    <p className="leading-relaxed">
                      {city.serviceConsiderations}
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <h3 className="font-semibold mb-3">Why {city.name} Residents Choose Us:</h3>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {[
                        `Local expertise in ${city.name}'s climate and soil`,
                        "Same-day or next-day availability",
                        "Competitive pricing for the area",
                        "Residential and commercial service",
                        "Fully licensed and insured",
                        "Free estimates and consultations",
                        "Satisfaction guaranteed",
                        "Locally owned and operated",
                      ].map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-gradient-to-br from-primary/5 to-white dark:from-primary/10 dark:to-background" data-testid="card-local-facts">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center flex-wrap gap-2">
                        <ThermometerSun className="h-5 w-5 text-primary" aria-hidden="true" />
                        {city.name} Lawn Care Facts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {city.facts?.map((fact, index) => (
                        <div key={index} className="flex items-center flex-wrap justify-between gap-2 text-sm">
                          <span className="text-muted-foreground">{fact.label}</span>
                          <span className="font-medium">{fact.value}</span>
                        </div>
                      ))}
                      <div className="pt-3 border-t mt-4">
                        <div className="text-xs text-muted-foreground">
                          <strong>Climate:</strong> {city.localFactors?.climate}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <strong>Soil:</strong> {city.localFactors?.soil}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {city.neighborhoods && city.neighborhoods.length > 0 && (
                    <Card data-testid="card-neighborhoods">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center flex-wrap gap-2">
                          <Home className="h-5 w-5 text-primary" aria-hidden="true" />
                          Neighborhoods We Serve
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {city.neighborhoods.map((neighborhood, index) => (
                            <Badge key={index} variant="secondary" className="text-xs" data-testid={`badge-neighborhood-${index}`}>
                              {neighborhood}
                            </Badge>
                          ))}
                        </div>
                        {city.zipCodes && (
                          <div className="text-xs text-muted-foreground mt-3">
                            Zip codes: {city.zipCodes.join(", ")}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {city.landmarks && city.landmarks.length > 0 && (
                    <Card data-testid="card-landmarks">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center flex-wrap gap-2">
                          <Mountain className="h-5 w-5 text-primary" aria-hidden="true" />
                          Near {city.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {city.landmarks.slice(0, 5).map((landmark, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-primary flex-shrink-0" aria-hidden="true" />
                              {landmark}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-muted/30" data-testid="section-services">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-services-heading">
                  Lawn Care Services in {city.name}, Idaho
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Complete lawn care and landscaping solutions tailored to {city.name}'s unique climate and soil conditions
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {serviceCategories.map((category, catIndex) => (
                  <Card key={catIndex} className="hover-elevate" data-testid={`card-service-category-${catIndex}`}>
                    <CardHeader className="pb-3">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-md ${category.color} mb-2`}>
                        <category.icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <CardTitle className="text-base">{category.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        {category.services.map((service, svcIndex) => (
                          <li key={svcIndex} className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0" aria-hidden="true" />
                            {service}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">All Services Available in {city.name}</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {popularServices.map((service) => (
                    <Link
                      key={service.slug}
                      href={`/services/${service.slug}`}
                      className="text-sm px-3 py-1.5 rounded-full bg-card border hover-elevate transition-colors"
                      data-testid={`link-service-${service.slug}`}
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
                <Button variant="outline" asChild>
                  <Link href="/services" data-testid="link-view-all-services">
                    View All Services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24" data-testid="section-testimonials">
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

        <section className="py-16 md:py-24 bg-muted/30" data-testid="section-faq">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-faq-heading">
                  Lawn Care in {city.name}: Frequently Asked Questions
                </h2>
                <p className="text-muted-foreground">
                  Common questions about lawn care services in {city.name}, Idaho
                </p>
              </div>

              <Accordion type="single" collapsible className="w-full" data-testid="accordion-faq">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left" data-testid={`faq-question-${index}`}>
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

        <section className="py-16 md:py-24" data-testid="section-other-areas">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-other-areas-heading">
                Also Serving Nearby Treasure Valley Communities
              </h2>
              <p className="text-muted-foreground">
                In addition to {city.name}, we provide lawn care throughout the Treasure Valley
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {otherCities.map((otherCity) => (
                  <Link
                    key={otherCity.slug}
                    href={`/areas/${otherCity.slug}`}
                    className="flex items-center flex-wrap gap-2 px-4 py-2 rounded-md bg-card border hover-elevate transition-colors"
                    data-testid={`link-area-${otherCity.slug}`}
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

        <section className="py-16 md:py-24 bg-primary text-primary-foreground" data-testid="section-cta">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-cta-heading">
                Ready to Transform Your {city.name} Property?
              </h2>
              <p className="text-xl text-primary-foreground leading-relaxed">
                Get a free, no-obligation quote for your {city.name} home or business. 
                We'll assess your property and provide transparent pricing.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-4">
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2" aria-hidden="true" />
                  <div className="font-semibold">Fast Response</div>
                  <div className="text-sm text-primary-foreground/80">Same-day quotes</div>
                </div>
                <div className="text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2" aria-hidden="true" />
                  <div className="font-semibold">No Obligation</div>
                  <div className="text-sm text-primary-foreground/80">Free estimates</div>
                </div>
                <div className="text-center">
                  <Building2 className="h-8 w-8 mx-auto mb-2" aria-hidden="true" />
                  <div className="font-semibold">Local Company</div>
                  <div className="text-sm text-primary-foreground/80">Serving {city.name}</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center pt-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/get-quote" data-testid="link-cta-quote">
                    Get Free Quote
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-transparent border-primary-foreground text-primary-foreground" 
                  asChild
                >
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
