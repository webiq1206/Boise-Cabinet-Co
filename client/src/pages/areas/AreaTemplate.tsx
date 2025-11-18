import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QuoteForm } from "@/components/QuoteForm";
import { CheckCircle2, MapPin, Leaf, Sprout, Lightbulb } from "lucide-react";

interface AreaTemplateProps {
  cityName: string;
  citySlug: string;
}

export default function AreaTemplate({ cityName, citySlug }: AreaTemplateProps) {
  const services = [
    { icon: Leaf, title: "Lawn Care", href: `/services/lawn-mowing/${citySlug}`, features: ["Weekly mowing", "Edging & trimming", "Weed control"] },
    { icon: Sprout, title: "Landscaping", href: `/services/patio-installation/${citySlug}`, features: ["Patio installation", "Sod & seeding", "Retaining walls"] },
    { icon: Lightbulb, title: "Christmas Lights", href: `/services/christmas-lights/${citySlug}`, features: ["Professional installation", "Takedown service", "Custom designs"] },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MapPin className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold" data-testid="heading-main">Lawn Care & Landscaping in {cityName}, ID</h1>
            <p className="text-lg text-primary-foreground/90" data-testid="text-subtitle">
              Professional lawn care, landscaping, and Christmas light installation serving {cityName} since 2017
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4" data-testid="heading-services">Services We Provide in {cityName}</h2>
              <p className="text-lg text-muted-foreground" data-testid="text-services">
                Comprehensive lawn care and landscaping solutions for {cityName} homeowners and businesses
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <Card key={index} className="hover-elevate transition-all duration-200" data-testid={`card-service-${index}`}>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle data-testid={`title-service-${index}`}>{service.title}</CardTitle>
                    <CardDescription data-testid={`desc-service-${index}`}>Available in {cityName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm" data-testid={`feature-${index}-${i}`}>
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" asChild data-testid={`button-learn-${index}`}>
                      <Link href={service.href}>
                        Learn More
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-muted/50 p-8 rounded-md">
              <h3 className="text-2xl font-bold mb-4" data-testid="heading-local">Why {cityName} Residents Choose Lawn Care Kuna</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Local Idaho business serving the Treasure Valley since 2017',
                  'Understanding of {cityName}\'s unique climate and soil conditions',
                  'Free quotes with no hidden fees or obligations',
                  'Fully insured and reliable service',
                  'Flexible scheduling to fit your needs',
                  'Professional equipment and trained staff',
                ].map((reason, i) => (
                  <div key={i} className="flex items-start gap-2" data-testid={`reason-${i}`}>
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{reason.replace('{cityName}', cityName)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4" data-testid="heading-coverage">We Also Serve Nearby Areas</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {['Kuna', 'Boise', 'Meridian', 'Nampa', 'Caldwell', 'Eagle']
                  .filter(city => city !== cityName)
                  .map((city) => (
                    <Button key={city} variant="outline" size="sm" asChild data-testid={`button-city-${city.toLowerCase()}`}>
                      <Link href={`/areas/${city.toLowerCase()}`}>{city}</Link>
                    </Button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="quote" className="py-16 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4" data-testid="heading-quote">Get Your Free {cityName} Quote</h2>
              <p className="text-lg text-muted-foreground" data-testid="text-quote">
                Tell us about your lawn care or landscaping project
              </p>
            </div>
            <QuoteForm preselectedCity={citySlug} />
          </div>
        </div>
      </section>
    </div>
  );
}
