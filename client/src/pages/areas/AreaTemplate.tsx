import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HeroQuoteSection } from "@/components/HeroQuoteSection";
import { SimpleQuoteWizard } from "@/components/SimpleQuoteWizard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CheckCircle2, MapPin, Leaf, Sprout, Lightbulb, TreeDeciduous, ArrowRight } from "lucide-react";
import { generateSEOMetadata, generateLogoAltTag, CITY_SEO_DATA } from "@/lib/seo";
import { generateLocalBusinessSchema, generateBreadcrumbSchema } from "@/lib/schema";
import { CITIES } from "@shared/contentData";

interface AreaTemplateProps {
  cityName: string;
  citySlug: string;
}

export default function AreaTemplate({ cityName, citySlug }: AreaTemplateProps) {
  // Get city data from contentData
  const cityData = CITIES.find(c => c.slug === citySlug);
  
  const services = [
    { icon: Leaf, title: "Lawn Care Services", href: `/services/lawn-mowing/${citySlug}`, features: ["Weekly & bi-weekly mowing", "Professional edging & trimming", "Comprehensive weed control", "Fertilization programs", "Core aeration", "Seasonal cleanup"] },
    { icon: Sprout, title: "Landscaping Services", href: `/services/patio-installation/${citySlug}`, features: ["Custom patio design & installation", "Professional sod installation", "Retaining wall construction", "Irrigation system installation", "Landscape lighting", "Water feature installation"] },
    { icon: Lightbulb, title: "Christmas Lights", href: `/services/christmas-lights/${citySlug}`, features: ["Custom holiday lighting design", "Professional installation & setup", "Seasonal maintenance service", "Complete takedown & storage", "LED energy-efficient options", "Commercial & residential"] },
  ];

  // Unique content per city - avoiding repetitive templates
  const cityContent: Record<string, { intro: string; climate: string; approach: string }> = {
    kuna: {
      intro: "As a locally-based company, we understand the unique challenges of maintaining lawns in our high-desert climate. From the intense summer heat to unpredictable spring weather, we've been helping homeowners achieve beautiful, healthy lawns since 2017.",
      climate: "The alkaline soil conditions and hot, dry summers require specialized knowledge that only comes from years of local experience.",
      approach: "Our approach combines efficient irrigation practices with drought-tolerant solutions that thrive in Idaho's semi-arid environment."
    },
    boise: {
      intro: "Serving diverse neighborhoods from the North End to the Bench, we understand how Idaho's capital city's microclimates affect lawn care. The foothills create unique wind patterns and varying sun exposure that impact your landscape.",
      climate: "From shaded areas near the Boise River to exposed hillside properties, each zone requires a tailored maintenance strategy.",
      approach: "Our team adapts service plans to match your specific area's needs, whether you're in a historic district or newer subdivision."
    },
    meridian: {
      intro: "Rapid growth means more homeowners need reliable lawn care services they can trust. We've been serving expanding communities since 2017, from established neighborhoods to brand new developments.",
      climate: "The mix of older, established landscapes and newly installed yards presents diverse maintenance requirements.",
      approach: "We specialize in both nurturing mature lawns and helping new landscapes establish strong root systems."
    },
    eagle: {
      intro: "Premium properties require exceptional lawn care and landscaping services. We deliver the high-quality results that homeowners expect, with attention to detail that matches your community's standards.",
      climate: "Larger lot sizes and custom landscapes demand more comprehensive care plans and specialized equipment.",
      approach: "Our team focuses on enhancing your property's curb appeal while maintaining the natural beauty of the surrounding foothills."
    },
    star: {
      intro: "A growing community deserves lawn care services that understand both rural properties and suburban neighborhoods. We help homeowners manage larger lots and unique property challenges.",
      climate: "The mix of agricultural land and residential development creates varied soil conditions and water availability.",
      approach: "Our reliable, professional service respects the area's small-town character while delivering modern results."
    },
    middleton: {
      intro: "Homeowners value honest, reliable lawn care at fair prices. We've been serving diverse neighborhoods since 2017, from established properties near the Boise River to newer developments.",
      climate: "Proximity to the river creates microclimates that can benefit or challenge your lawn depending on proper care.",
      approach: "Consistent quality and transparent communication define our approach to every property we maintain."
    },
  };

  const content = cityContent[citySlug] || cityContent.kuna;

  // Generate SEO metadata
  const seoParams = { city: cityName, citySlug };
  const seoMetadata = generateSEOMetadata(seoParams);
  const logoAlt = generateLogoAltTag(seoParams);
  
  // Get city coordinates for geo tags
  const cityCoords = CITY_SEO_DATA[cityName as keyof typeof CITY_SEO_DATA];
  const coordinates = cityCoords?.coordinates;

  // Generate JSON-LD schemas
  const localBusinessSchema = generateLocalBusinessSchema(cityName);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Service Areas', url: '/areas' },
    { name: cityName, url: `/areas/${citySlug}` },
  ]);

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>{`Lawn Care in ${cityName}, ID | Lawn Care Kuna | Free Quotes`}</title>
        <meta name="description" content={`Professional lawn care & landscaping in ${cityName}, Idaho. Licensed, insured, locally owned. Call 208-629-1195 for your free quote. Serving all of ${cityName}!`} />
        <link rel="canonical" href={`https://lawncarekuna.com/areas/${citySlug}`} />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={`Lawn Care in ${cityName}, ID | Lawn Care Kuna`} />
        <meta property="og:description" content={`Professional lawn care & landscaping in ${cityName}, Idaho. Licensed, insured. Call 208-629-1195 for your free quote!`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://lawncarekuna.com/areas/${citySlug}`} />
        <meta property="og:image" content="https://lawncarekuna.com/images/lawn-care-kuna-logo.png" />
        <meta property="og:image:alt" content={logoAlt} />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Lawn Care in ${cityName}, ID | Lawn Care Kuna`} />
        <meta name="twitter:description" content={`Professional lawn care & landscaping in ${cityName}, Idaho. Licensed, insured. Call 208-629-1195 for your free quote!`} />

        {/* Geo tags for local SEO */}
        <meta name="geo.region" content="US-ID" />
        <meta name="geo.placename" content={cityName} />
        {coordinates && (
          <>
            <meta name="geo.position" content={`${coordinates.lat};${coordinates.lng}`} />
            <meta name="ICBM" content={`${coordinates.lat}, ${coordinates.lng}`} />
          </>
        )}
        
        {/* Robots */}
        <meta name="robots" content="index, follow" />
        
        {/* JSON-LD Schemas */}
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { name: 'Home', href: '/' },
        { name: 'Service Areas', href: '/areas' },
        { name: cityName },
      ]} />

      {/* Hero Section - Primary Keyword Placement (1 of 2-3) */}
      <HeroQuoteSection 
        label="Treasure Valley Lawn Care"
        heading={`Professional Lawn Care in ${cityName}, Idaho`}
        subheading="Trusted by local homeowners and businesses since 2017"
        defaultCity={cityName}
      />

      {/* Local Expertise Section */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif tracking-tight mb-6 text-center">
              Local Expertise That Makes a Difference
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-lg leading-relaxed">
                {content.intro}
              </p>
              <p className="text-lg leading-relaxed mt-4">
                {content.climate} {content.approach}
              </p>
              {cityData?.extendedDescription && (
                <p className="text-lg leading-relaxed mt-4">
                  {cityData.extendedDescription.split('.').slice(0, 2).join('.')}.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-8">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif tracking-tight mb-6" data-testid="heading-services">
                Complete Property Care Solutions
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-services">
                From weekly lawn maintenance to complete landscape transformations, we provide comprehensive services tailored to your property's specific needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <Card key={index} className="hover-elevate transition-all duration-300" data-testid={`card-service-${index}`}>
                  <CardHeader className="space-y-4">
                    <div className="w-14 h-14 rounded-md border border-border bg-background flex items-center justify-center">
                      <service.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2" data-testid={`title-service-${index}`}>{service.title}</CardTitle>
                      <CardDescription data-testid={`desc-service-${index}`}>Professional results you can count on</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2.5">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" data-testid={`feature-${index}-${i}`}>
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="w-full" asChild data-testid={`button-learn-${index}`}>
                      <Link href={service.href}>
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container px-4 md:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif tracking-tight mb-8 text-center" data-testid="heading-local">
              Why Local Homeowners Trust Us
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[
                { 
                  title: 'Local Expertise Since 2017', 
                  description: 'Established Idaho business with deep understanding of regional climate, soil conditions, and seasonal lawn care requirements.' 
                },
                { 
                  title: 'Transparent Pricing', 
                  description: 'Free, no-obligation quotes with clear pricing. No hidden fees or surprise charges—just honest, upfront estimates.' 
                },
                { 
                  title: 'Fully Licensed & Insured', 
                  description: 'Complete liability and workers compensation coverage for your peace of mind. Professional service you can trust.' 
                },
                { 
                  title: 'Flexible Scheduling', 
                  description: 'Weekly, bi-weekly, or customized service plans designed around your schedule and lawn care needs.' 
                },
                { 
                  title: 'Professional Equipment', 
                  description: 'Commercial-grade mowers, trimmers, and landscaping equipment maintained to deliver superior results every visit.' 
                },
                { 
                  title: 'Experienced Team', 
                  description: 'Trained lawn care professionals who understand proper mowing heights, fertilization timing, and Idaho-specific horticultural practices.' 
                },
              ].map((reason, i) => (
                <div key={i} className="flex gap-4 p-6 rounded-md border bg-card" data-testid={`reason-${i}`}>
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2">{reason.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Neighborhoods Section - Uses City Data */}
      {cityData?.neighborhoods && cityData.neighborhoods.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif tracking-tight mb-6 text-center">
                Communities We Serve
              </h2>
              <p className="text-lg text-muted-foreground text-center mb-8">
                Our team regularly works in these neighborhoods and surrounding areas.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {cityData.neighborhoods.map((neighborhood, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-2 px-4 py-2 rounded-full border bg-card text-sm"
                  >
                    <MapPin className="h-4 w-4 text-primary" />
                    {neighborhood}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Other Service Areas */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif tracking-tight mb-6" data-testid="heading-coverage">
              Serving the Greater Treasure Valley
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              We proudly serve homeowners and businesses throughout the region, providing consistent, professional lawn care and landscaping services.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Kuna', 'Boise', 'Meridian', 'Eagle', 'Star', 'Middleton']
                .filter(city => city !== cityName)
                .map((city) => (
                  <Button key={city} variant="outline" asChild data-testid={`button-city-${city.toLowerCase()}`}>
                    <Link href={`/areas/${city.toLowerCase()}`}>{city}, ID</Link>
                  </Button>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quote Form Section */}
      <section id="quote" className="py-16 md:py-20">
        <div className="container px-4 md:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-serif tracking-tight mb-4" data-testid="heading-quote">
                Get Your Free Quote Today
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-quote">
                Tell us about your property and we'll provide a detailed, customized estimate for your lawn care or landscaping project. No obligation, completely free.
              </p>
            </div>
            <SimpleQuoteWizard preselectedCity={citySlug} />
          </div>
        </div>
      </section>
    </div>
  );
}
