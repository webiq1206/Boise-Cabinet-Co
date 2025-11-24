import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HeroQuoteSection } from "@/components/HeroQuoteSection";
import { QuoteWizard } from "@/components/QuoteWizard";
import { CheckCircle2, MapPin, Leaf, Sprout, Lightbulb } from "lucide-react";

interface AreaTemplateProps {
  cityName: string;
  citySlug: string;
}

export default function AreaTemplate({ cityName, citySlug }: AreaTemplateProps) {
  const services = [
    { icon: Leaf, title: "Lawn Care Services", href: `/services/lawn-mowing/${citySlug}`, features: ["Weekly & bi-weekly mowing", "Professional edging & trimming", "Comprehensive weed control", "Fertilization programs", "Core aeration", "Seasonal cleanup"] },
    { icon: Sprout, title: "Landscaping Services", href: `/services/patio-installation/${citySlug}`, features: ["Custom patio design & installation", "Professional sod installation", "Retaining wall construction", "Irrigation system installation", "Landscape lighting", "Water feature installation"] },
    { icon: Lightbulb, title: "Christmas Lights", href: `/services/christmas-lights/${citySlug}`, features: ["Custom holiday lighting design", "Professional installation & setup", "Seasonal maintenance service", "Complete takedown & storage", "LED energy-efficient options", "Commercial & residential"] },
  ];

  const citySpecificContent = {
    kuna: "As a locally-based company in Kuna, we understand the unique challenges of maintaining lawns in our high-desert climate. From the intense summer heat to unpredictable spring weather, we've been helping Kuna homeowners achieve beautiful, healthy lawns since 2017.",
    boise: "Serving Boise's diverse neighborhoods from the North End to the Bench, we understand how Idaho's capital city's microclimates affect lawn care. Our team has been maintaining Boise properties since 2017, adapting our services to your specific area's needs.",
    meridian: "Meridian's rapid growth means more homeowners need reliable lawn care services they can trust. Since 2017, we've been serving Meridian's expanding communities, from established neighborhoods to brand new developments across the city.",
    eagle: "Eagle's premium properties require exceptional lawn care and landscaping services. Since 2017, we've been delivering the high-quality results that Eagle homeowners expect, with attention to detail that matches your community's standards.",
    star: "Star's growing community deserves lawn care services that understand both rural properties and suburban neighborhoods. Since 2017, we've been helping Star homeowners manage larger lots and unique property challenges with reliable, professional service that respects the area's small-town character.",
    middleton: "Middleton homeowners value honest, reliable lawn care at fair prices. Since 2017, we've been serving Middleton's diverse neighborhoods, from established properties near the Boise River to newer developments, with consistent quality and transparent communication.",
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section with Integrated Quote Feature */}
      <HeroQuoteSection 
        label={`${cityName} Lawn Care`}
        heading={`Professional Lawn Care & Landscaping in ${cityName}, Idaho`}
        subheading={`Trusted by ${cityName} homeowners and businesses since 2017`}
        defaultCity={cityName}
      />

      {/* Local Expertise Section - Mint */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif tracking-tight mb-6 text-center">Local {cityName} Lawn Care Experts</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-lg leading-relaxed">
                {citySpecificContent[citySlug as keyof typeof citySpecificContent]}
              </p>
              <p className="text-lg leading-relaxed mt-4">
                Our comprehensive lawn care and landscaping services are designed specifically for {cityName} properties. We understand the local soil composition, optimal grass varieties for Idaho's climate, and the seasonal care requirements that keep your lawn looking its best year-round. From routine maintenance to complete landscape transformations, our experienced team delivers results that enhance your property's curb appeal and value.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - White */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-8">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif tracking-tight mb-6" data-testid="heading-services">
                Complete Lawn & Landscape Services in {cityName}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-services">
                From weekly lawn maintenance to complete landscape transformations, we provide comprehensive services tailored to {cityName}'s unique environment and your property's specific needs.
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
                      <CardDescription data-testid={`desc-service-${index}`}>Professional services throughout {cityName}</CardDescription>
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
                        Learn More →
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - Mint */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container px-4 md:px-8">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-serif tracking-tight mb-8 text-center" data-testid="heading-local">
              Why {cityName} Homeowners Trust Lawn Care Kuna
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[
                { 
                  title: 'Local Expertise Since 2017', 
                  description: `Established Idaho business with deep understanding of ${cityName}'s climate, soil conditions, and seasonal lawn care requirements.` 
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

      {/* Service Areas Section - White */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-serif tracking-tight mb-6" data-testid="heading-coverage">
              Serving {cityName} and the Greater Treasure Valley
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              In addition to {cityName}, we proudly serve homeowners and businesses throughout the Treasure Valley, providing consistent, professional lawn care and landscaping services across all major communities.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Kuna', 'Boise', 'Meridian', 'Nampa', 'Caldwell', 'Eagle']
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

      {/* Quote Form Section - Mint */}
      <section id="quote" className="py-16 md:py-20 bg-muted">
        <div className="container px-4 md:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-serif tracking-tight mb-4" data-testid="heading-quote">
                Get Your Free {cityName} Quote
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-quote">
                Tell us about your property and we'll provide a detailed, customized estimate for your lawn care or landscaping project. No obligation, completely free.
              </p>
            </div>
            <QuoteWizard preselectedCity={citySlug} defaultCity={citySlug} />
          </div>
        </div>
      </section>
    </div>
  );
}
