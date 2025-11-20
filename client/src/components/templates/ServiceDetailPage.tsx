import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Phone, MapPin, ArrowRight, Leaf, Sprout, Heart, Shield, Target, Zap } from "lucide-react";
import { HeroQuoteSection } from "@/components/HeroQuoteSection";
import { FactsSection } from "@/components/FactsSection";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedServices } from "@/components/RelatedServices";
import type { ServiceData } from "@shared/contentData";
import { generateSEOMetadata } from "@/lib/seo";
import { generateServiceSchema, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/schema";
import { getServiceBackground } from "@shared/serviceBackgrounds";

interface ServiceDetailPageProps {
  service: ServiceData;
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

export function ServiceDetailPage({ service }: ServiceDetailPageProps) {
  // Generate comprehensive SEO metadata
  const seoMetadata = generateSEOMetadata({
    serviceName: service.name,
    serviceSlug: service.slug,
  });

  // Generate JSON-LD schemas
  const serviceSchema = generateServiceSchema(service.name, service.longDescription);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services/lawn-care' },
    { name: service.name, url: `/services/${service.slug}` },
  ]);
  const faqSchema = service.faqs && service.faqs.length > 0 
    ? generateFAQSchema(service.faqs) 
    : null;

  return (
    <div className="pb-20">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{seoMetadata.title}</title>
        <meta name="description" content={seoMetadata.description} />
        <link rel="canonical" href={seoMetadata.canonical} />

        {/* Open Graph Tags */}
        <meta property="og:title" content={seoMetadata.ogTitle} />
        <meta property="og:description" content={seoMetadata.ogDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={seoMetadata.canonical} />
        <meta property="og:image" content={seoMetadata.ogImage} />
        <meta property="og:site_name" content="Lawn Care Kuna" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content={seoMetadata.twitterCard} />
        <meta name="twitter:title" content={seoMetadata.ogTitle} />
        <meta name="twitter:description" content={seoMetadata.ogDescription} />
        <meta name="twitter:image" content={seoMetadata.ogImage} />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(serviceSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
        {faqSchema && (
          <script type="application/ld+json">
            {JSON.stringify(faqSchema)}
          </script>
        )}
      </Helmet>

      {/* Breadcrumbs */}
      <div className="container px-4 md:px-8">
        <Breadcrumbs 
          items={[
            { name: 'Home', href: '/' },
            { name: 'Services', href: '/services/lawn-care' },
            { name: service.name },
          ]}
        />
      </div>

      {/* Hero Section with Integrated Quote Feature */}
      <HeroQuoteSection 
        label="Lawn Care Kuna"
        heading={`${service.name} services`}
        subheading={service.shortDescription}
        defaultService={service.slug}
        backgroundAlt={`Professional ${service.name.toLowerCase()} services with healthy green lawn in Idaho`}
        backgroundImage={getServiceBackground(service.slug)}
      />

      {/* Service Introduction - Dark Green Header */}
      <section className="py-12 md:py-16 lg:py-24 bg-primary">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-4 md:space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl text-primary-foreground tracking-tight">
              Professional {service.name} in Idaho's Treasure Valley
            </h2>
            <p className="text-primary-foreground/90 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
              {service.shortDescription}
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
                Why Choose Our {service.name} Services?
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
              
              <div className="mt-8 p-6 bg-muted rounded-lg border">
                <h4 className="text-lg md:text-xl font-semibold text-foreground mb-3">
                  Service Coverage Area
                </h4>
                <p className="text-base md:text-lg">
                  We provide professional {service.name.toLowerCase()} services throughout Idaho's Treasure Valley, 
                  including Kuna, Boise, Meridian, Nampa, Caldwell, and Eagle. Our experienced team delivers 
                  exceptional results tailored to Idaho's unique climate and soil conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Details Section */}
      <section className="py-12 md:py-16 lg:py-24">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
            <div className="text-center space-y-3 md:space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                {service.name} services
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                At Lawn Care Kuna, we've been providing expert {service.name.toLowerCase()} services throughout the Treasure Valley since 2017. 
                Our professional approach ensures outstanding results for your property.
              </p>
            </div>

            {/* Facts Section */}
            {service.facts && service.facts.length > 0 && (
              <FactsSection
                title={`Idaho ${service.category.includes('lawn') ? 'lawn care' : service.name.toLowerCase()} facts`}
                facts={service.facts}
              />
            )}

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                We understand Idaho's unique climate challenges and deliver {service.name.toLowerCase()} solutions 
                that help your property thrive. Our team has the expertise and equipment to handle any project, 
                big or small.
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

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Benefits of Professional {service.name}
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Why homeowners throughout the Treasure Valley choose Lawn Care Kuna
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {service.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3" data-testid={`benefit-${index}`}>
                  <Check className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-base leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="text-center pt-4">
              <Button size="lg" asChild data-testid="button-benefits">
                <Link href="/about">
                  Learn More About Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Our {service.name.toLowerCase()} services
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Our systematic approach ensures consistent, high-quality results for every project
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {service.process.map((step) => (
                <div key={step.step} className="flex gap-4" data-testid={`process-step-${step.step}`}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-4">
              <Button size="lg" asChild data-testid="button-process">
                <Link href="/contact">
                  Schedule Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Lawn care feels in Idaho
              </h2>
              <p className="text-lg text-muted-foreground">
                {service.pricingGuidance || `Transparent pricing for ${service.name.toLowerCase()} services throughout the Treasure Valley`}
              </p>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {service.process.map((step, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 hover-elevate"
                      data-testid={`pricing-item-${index}`}
                    >
                      <span className="font-medium">{step.title}</span>
                      <span className="text-muted-foreground text-sm">{step.description.substring(0, 50)}...</span>
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

      {/* Service Areas Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Looking for additional lawn care services in Idaho?
            </h2>
            <p className="text-xl text-primary-foreground/90 leading-relaxed">
              We serve homeowners throughout the Treasure Valley including Kuna, Boise, Meridian, Nampa, Caldwell, and Eagle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="secondary" asChild data-testid="button-service-areas">
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
                data-testid="button-service-areas-quote"
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
                Lawn Care Idaho Values
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {coreValues.map((value, index) => (
                <Card key={index} className="hover-elevate" data-testid={`card-value-${index}`}>
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
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Common questions about {service.name.toLowerCase()} services
              </p>
            </div>

            <div className="space-y-6">
              {service.faqs.map((faq, index) => (
                <Card key={index} data-testid={`faq-${index}`}>
                  <CardContent className="p-8">
                    <h3 className="font-semibold mb-3 text-lg">{faq.question}</h3>
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Services */}
      <RelatedServices currentServiceSlug={service.slug} limit={4} />

      {/* City Links Section */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                We Serve the Entire Treasure Valley
              </h2>
              <p className="text-lg text-muted-foreground">
                Professional {service.name.toLowerCase()} services in your city
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {['Kuna', 'Boise', 'Meridian', 'Nampa', 'Caldwell', 'Eagle'].map(city => (
                <Link key={city} href={`/services/${service.slug}/${city.toLowerCase()}`} data-testid={`link-service-area-${city.toLowerCase()}`}>
                  <Card className="hover-elevate cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
                      <span className="font-medium">
                        {service.name} in {city}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t shadow-lg">
        <div className="container px-4 py-3">
          <Button size="lg" className="w-full" asChild data-testid="button-mobile-sticky-quote">
            <Link href="/get-quote">
              Get Free Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
