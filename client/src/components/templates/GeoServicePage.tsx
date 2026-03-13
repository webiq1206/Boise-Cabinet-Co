import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Phone, MapPin, ArrowRight, Leaf, Sprout, Heart, Shield, Target, Zap } from "lucide-react";
import { HeroQuoteSection } from "@/components/HeroQuoteSection";
import { FactsSection } from "@/components/FactsSection";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedServices } from "@/components/RelatedServices";
import { CityCrosslinks } from "@/components/CityCrosslinks";
import type { ServiceData, CityData } from "@shared/contentData";
import { generateSEOMetadata, generateLogoAltTag, CITY_SEO_DATA } from "@/lib/seo";
import { 
  generateServiceSchema, 
  generateLocalBusinessSchema, 
  generateBreadcrumbSchema, 
  generateFAQSchema 
} from "@/lib/schema";
import { getServiceBackground } from "@shared/serviceBackgrounds";

interface GeoServicePageProps {
  service: ServiceData;
  city: CityData;
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

export function GeoServicePage({ service, city }: GeoServicePageProps) {
  // SEO parameters for metadata generation
  const seoParams = {
    serviceName: service.name,
    serviceSlug: service.slug,
    city: city.name,
    citySlug: city.slug,
  };
  
  // Generate comprehensive SEO metadata
  const seoMetadata = generateSEOMetadata(seoParams);
  const logoAlt = generateLogoAltTag(seoParams);

  // Get city coordinates for geo tags
  const cityData = CITY_SEO_DATA[city.name as keyof typeof CITY_SEO_DATA];
  const coordinates = cityData?.coordinates;

  // Generate JSON-LD schemas
  const localBusinessSchema = generateLocalBusinessSchema(city.name);
  const serviceSchema = generateServiceSchema(service.name, service.longDescription, city.name);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services/lawn-care' },
    { name: service.name, url: `/services/${service.slug}` },
    { name: city.name, url: `/services/${service.slug}/${city.slug}` },
  ]);
  const faqSchema = generateFAQSchema(service.faqs);

  // Semantic variations for natural content
  const propertyType = service.category.includes('lawn') ? 'lawn' : 'landscape';
  const serviceCategory = service.category.includes('lawn') ? 'lawn care' : 'landscaping';

  return (
    <div className="pb-20">
      <Helmet>
        <title>{seoMetadata.title}</title>
        <meta name="description" content={seoMetadata.description} />
        <link rel="canonical" href={seoMetadata.canonical} />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={seoMetadata.ogTitle} />
        <meta property="og:description" content={seoMetadata.ogDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={seoMetadata.canonical} />
        <meta property="og:image" content={seoMetadata.ogImage} />
        <meta property="og:image:alt" content={logoAlt} />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:site_name" content="Lawn Care Kuna" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content={seoMetadata.twitterCard} />
        <meta name="twitter:title" content={seoMetadata.ogTitle} />
        <meta name="twitter:description" content={seoMetadata.ogDescription} />
        <meta name="twitter:image" content={seoMetadata.ogImage} />
        <meta name="twitter:image:alt" content={logoAlt} />

        {/* Geo tags for local SEO */}
        <meta name="geo.region" content="US-ID" />
        <meta name="geo.placename" content={city.name} />
        {coordinates && (
          <>
            <meta name="geo.position" content={`${coordinates.lat};${coordinates.lng}`} />
            <meta name="ICBM" content={`${coordinates.lat}, ${coordinates.lng}`} />
          </>
        )}
        
        {/* Robots */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        
        {/* JSON-LD Schemas */}
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(serviceSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { name: 'Home', href: '/' },
        { name: 'Services', href: '/services' },
        { name: service.name, href: `/services/${service.slug}` },
        { name: city.name },
      ]} />

      {/* Hero Section with Primary Keyword (1 of 2-3 strategic placements) */}
      <HeroQuoteSection
        label={`Treasure Valley ${serviceCategory}`}
        heading={`Professional ${service.name} in ${city.name}, Idaho`}
        subheading={`Trusted by local homeowners and businesses since 2017`}
        backgroundImage={getServiceBackground(service.slug)}
        defaultCity={city.name}
      />

      {/* City-Specific Introduction - Uses Unique extendedDescription */}
      <section className="py-12 md:py-16 lg:py-24 bg-primary">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-4 md:space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl text-primary-foreground tracking-tight">
              Why Local Expertise Matters
            </h2>
            <p className="text-primary-foreground/90 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
              {city.extendedDescription ? city.extendedDescription.split('.').slice(0, 3).join('.') + '.' : 'We understand the unique conditions and requirements for properties in the Treasure Valley region.'}
            </p>
            <Button size="lg" variant="secondary" asChild data-testid="button-service-cta" className="mt-4">
              <Link href="/get-quote">
                Get Free Quote
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Detailed Service Description - Light Background */}
      <section className="py-12 md:py-16 lg:py-24">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
                What Sets Our {service.name} Apart
              </h3>
              <div className="space-y-4 text-base md:text-lg leading-relaxed">
                {service.longDescription.split('. ').reduce((acc: string[][], sentence: string, idx: number, arr: string[]) => {
                  const chunkSize = Math.ceil(arr.length / 3);
                  const chunkIndex = Math.floor(idx / chunkSize);
                  if (!acc[chunkIndex]) acc[chunkIndex] = [];
                  acc[chunkIndex].push(sentence);
                  return acc;
                }, []).map((chunk: string[], idx: number) => (
                  <p key={idx}>
                    {chunk.join('. ')}{chunk[chunk.length - 1].endsWith('.') ? '' : '.'}
                  </p>
                ))}
              </div>
              
              {/* City-Specific Service Considerations */}
              <div className="mt-8 p-6 bg-muted rounded-lg border">
                <h4 className="text-lg md:text-xl font-semibold text-foreground mb-3">
                  Local Property Considerations
                </h4>
                <p className="text-base md:text-lg">
                  {city.serviceConsiderations}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Local Facts & Recommendations */}
      <section className="py-12 md:py-16 lg:py-24 bg-muted/30">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
            <div className="text-center space-y-3 md:space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                Local Property Care Guide
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Key recommendations for maintaining a healthy {propertyType} in the Treasure Valley region.
              </p>
            </div>

            {/* Facts Section */}
            {(city.facts || service.facts) && (
              <FactsSection
                title={`Local ${serviceCategory} recommendations`}
                facts={city.facts || service.facts || []}
              />
            )}

            <div className="prose prose-lg max-w-none text-muted-foreground text-center">
              <p>
                These guidelines are based on {city.localFactors.climate.toLowerCase()} and {city.localFactors.soil.toLowerCase()}.
              </p>
            </div>

            <div className="text-center">
              <Button size="lg" asChild data-testid="button-service-details">
                <Link href="/get-quote">
                  Schedule Service
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Neighborhoods & Landmarks Served */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Neighborhoods We Serve
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                From established neighborhoods to new developments, we understand the unique needs of each area.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {city.neighborhoods && city.neighborhoods.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Neighborhoods We Serve</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our team regularly works in these local communities:
                  </p>
                  <ul className="space-y-3">
                    {city.neighborhoods.map((neighborhood, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{neighborhood}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {city.landmarks && city.landmarks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Local Landmarks</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We're proud to serve properties near these well-known local landmarks:
                  </p>
                  <ul className="space-y-3">
                    {city.landmarks.slice(0, 6).map((landmark, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{landmark}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="text-center pt-4">
              <Button size="lg" asChild data-testid="button-local-expertise">
                <Link href="/about">
                  Learn More About Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Service Process & Benefits */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                How We Deliver Results
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Our proven process ensures consistent, high-quality outcomes for every property.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Our Process</h3>
                <div className="space-y-4">
                  {service.process.slice(0, 4).map((step) => (
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
                  {service.benefits.slice(0, 6).map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center pt-4">
              <Button size="lg" asChild data-testid="button-our-services">
                <Link href={`/services/${service.slug}`}>
                  View Complete Service Details
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Transparent Pricing
              </h2>
              <p className="text-lg text-muted-foreground">
                {service.pricingGuidance || `Every quote includes a detailed breakdown with no hidden fees or surprise charges.`}
              </p>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {service.process.map((step, index) => (
                    <div 
                      key={index} 
                      className="p-6 hover-elevate"
                      data-testid={`pricing-item-${index}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">{step.title}</h4>
                          <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-sm text-muted-foreground">
              Prices vary based on property size and specific requirements. 
              Contact us for a free, detailed quote.
            </p>

            <div className="text-center">
              <Button size="lg" asChild data-testid="button-pricing-quote">
                <Link href="/get-quote">
                  Get Your Custom Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services CTA */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Complete Property Care Solutions
            </h2>
            <p className="text-xl text-primary-foreground/90 leading-relaxed">
              Beyond {service.name.toLowerCase()}, we offer comprehensive lawn care and landscaping to keep your outdoor spaces beautiful year-round.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="secondary" asChild data-testid="button-additional-services">
                <Link href="/services/lawn-care">
                  View All Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" 
                asChild 
                data-testid="button-additional-quote"
              >
                <Link href="/get-quote">
                  Get Free Quote
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Our Commitment to You
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The values and principles that guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {coreValues.map((value, index) => (
                <Card key={index} className="hover-elevate bg-gradient-to-br from-primary/5 to-white dark:from-primary/10 dark:to-background" data-testid={`card-value-${index}`}>
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

      {/* FAQs - Secondary Keyword Placement (2 of 2-3) */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
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
              {service.faqs.slice(0, 5).map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`} 
                  className="border rounded-lg px-6 hover-elevate"
                  data-testid={`faq-${index}`}
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

            {service.faqs.length > 5 && (
              <div className="text-center pt-4">
                <Button variant="outline" size="lg" asChild data-testid="link-view-all-faqs">
                  <Link href={`/services/${service.slug}`}>
                    View All FAQs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Services */}
      <RelatedServices currentServiceSlug={service.slug} city={city.name} limit={4} />

      {/* City Crosslinks - Same Service in Other Cities */}
      <CityCrosslinks 
        currentCity={city.name}
        serviceSlug={service.slug}
        serviceName={service.name}
      />

    </div>
  );
}
