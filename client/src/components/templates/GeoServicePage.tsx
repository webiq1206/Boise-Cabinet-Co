import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Phone, MapPin, Clock, Award, Home } from "lucide-react";
import { QuoteForm } from "@/components/QuoteForm";
import type { ServiceData, CityData } from "@shared/contentData";

interface GeoServicePageProps {
  service: ServiceData;
  city: CityData;
}

export function GeoServicePage({ service, city }: GeoServicePageProps) {
  const metaTitle = `${service.name} in ${city.name}, Idaho | Lawn Care Kuna`;
  const metaDescription = `Professional ${service.name.toLowerCase()} in ${city.name}, ID. ${service.shortDescription}. Serving ${city.name} since 2017. Free quotes. Call (208) 352-2011 today!`;

  return (
    <div>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Breadcrumb */}
      <section className="py-4 bg-muted/30">
        <div className="container px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/">
              <span className="hover:text-foreground cursor-pointer">Home</span>
            </Link>
            <span>/</span>
            <Link href="/services">
              <span className="hover:text-foreground cursor-pointer">Services</span>
            </Link>
            <span>/</span>
            <Link href={`/services/${service.slug}`}>
              <span className="hover:text-foreground cursor-pointer">{service.name}</span>
            </Link>
            <span>/</span>
            <span className="text-foreground">{city.name}</span>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="heading-hero">
              {service.name} in {city.name}, Idaho
            </h1>
            <p className="text-xl mb-6 opacity-90">
              Professional {service.name.toLowerCase()} services for {city.name} homeowners and businesses
            </p>
            {city.population && (
              <p className="text-lg mb-8 opacity-80">
                Serving {city.population} residents in {city.name} and surrounding areas
              </p>
            )}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild data-testid="button-quote-hero">
                <a href="#quote">Get Free Quote</a>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-call-hero">
                <a href="tel:2083522011">Call (208) 352-2011</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Main Content Column */}
              <div className="md:col-span-2 space-y-8">
                {/* Introduction */}
                <div data-testid="section-intro">
                  <h2 className="text-3xl font-bold mb-4">{service.name} Services in {city.name}</h2>
                  <p className="text-lg leading-relaxed mb-4">{service.longDescription}</p>
                  <p className="leading-relaxed">
                    At Lawn Care Kuna, we've been providing expert {service.name.toLowerCase()} services to {city.name} residents since 2017. 
                    We understand the unique challenges of maintaining {service.category.includes('lawn') ? 'lawns' : 'landscapes'} in {city.name}, including {city.localFactors.soil.toLowerCase()} and {city.localFactors.climate.toLowerCase()}.
                  </p>
                </div>

                {/* Local Expertise */}
                <div data-testid="section-local-expertise">
                  <h2 className="text-3xl font-bold mb-4">Why {city.name} Chooses Lawn Care Kuna</h2>
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Local Expertise for {city.name}</h3>
                          <p className="text-muted-foreground">
                            We specialize in {service.name.toLowerCase()} solutions tailored for {city.name}'s specific conditions:
                          </p>
                          <ul className="mt-3 space-y-2">
                            {city.localFactors.commonNeeds.map((need, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <span>{need}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {city.neighborhoods && city.neighborhoods.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-2">We Serve All {city.name} Neighborhoods</h3>
                            <p className="text-sm text-muted-foreground">
                              Including {city.neighborhoods.slice(0, 4).join(', ')}{city.neighborhoods.length > 4 ? ', and more' : ''}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Benefits */}
                <div data-testid="section-benefits">
                  <h2 className="text-3xl font-bold mb-6">Benefits of Our {service.name} in {city.name}</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {service.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-2" data-testid={`benefit-${index}`}>
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Process */}
                <div data-testid="section-process">
                  <h2 className="text-3xl font-bold mb-6">How We Deliver {service.name} in {city.name}</h2>
                  <div className="space-y-3">
                    {service.process.map((step) => (
                      <Card key={step.step} data-testid={`process-step-${step.step}`}>
                        <CardContent className="p-5">
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                              {step.step}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1 text-base">{step.title}</h3>
                              <p className="text-sm text-muted-foreground">{step.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                {service.pricingGuidance && (
                  <div data-testid="section-pricing">
                    <h2 className="text-3xl font-bold mb-4">{service.name} Cost in {city.name}</h2>
                    <Card>
                      <CardContent className="p-6">
                        <p className="leading-relaxed mb-4">{service.pricingGuidance}</p>
                        <div className="p-4 bg-muted/30 rounded-lg space-y-1">
                          <p className="font-semibold text-sm">✓ Free quotes for {city.name} properties</p>
                          <p className="font-semibold text-sm">✓ Transparent pricing - no hidden fees</p>
                          <p className="font-semibold text-sm">✓ Serving {city.name} since 2017</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* FAQs - Top 5 */}
                <div data-testid="section-faqs">
                  <h2 className="text-3xl font-bold mb-6">{service.name} FAQs for {city.name} Residents</h2>
                  <div className="space-y-3">
                    {service.faqs.slice(0, 5).map((faq, index) => (
                      <Card key={index} data-testid={`faq-${index}`}>
                        <CardContent className="p-5">
                          <h3 className="font-semibold mb-2">{faq.question}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <Link href={`/services/${service.slug}`}>
                      <span className="text-primary hover:underline cursor-pointer">
                        View all {service.name} FAQs →
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Nearby Cities */}
                <div data-testid="section-nearby-cities">
                  <h2 className="text-3xl font-bold mb-4">We Also Serve Nearby Cities</h2>
                  <p className="mb-4">
                    Looking for {service.name.toLowerCase()} in other Treasure Valley cities? We serve:
                  </p>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {['Kuna', 'Boise', 'Meridian', 'Nampa', 'Caldwell', 'Eagle']
                      .filter(c => c !== city.name)
                      .map(nearbyCity => (
                        <Link key={nearbyCity} href={`/services/${service.slug}/${nearbyCity.toLowerCase()}`}>
                          <span className="text-primary hover:underline cursor-pointer text-sm">
                            {service.name} in {nearbyCity} →
                          </span>
                        </Link>
                      ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Contact Card */}
                <Card data-testid="card-contact">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Contact Us in {city.name}</h3>
                    <div className="space-y-3">
                      <Button size="lg" className="w-full" asChild>
                        <a href="tel:2083522011">
                          <Phone className="h-4 w-4 mr-2" />
                          (208) 352-2011
                        </a>
                      </Button>
                      <Button size="lg" variant="outline" className="w-full" asChild>
                        <a href="#quote">Free Quote</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Service Area Info */}
                <Card data-testid="card-service-area">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Service Area
                    </h3>
                    <div className="text-sm space-y-2">
                      <p className="font-medium">{city.name}, Idaho</p>
                      {city.zipCodes && (
                        <p className="text-muted-foreground">ZIP Codes: {city.zipCodes.join(', ')}</p>
                      )}
                      {city.isPrimary && (
                        <p className="text-primary text-xs font-medium">★ Primary Service Area</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Why Choose Us */}
                <Card data-testid="card-why-choose-us">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Why Choose Us</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium">Since 2017</div>
                          <div className="text-muted-foreground">7+ years in {city.name}</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium">Fully Insured</div>
                          <div className="text-muted-foreground">Licensed & professional</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Home className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium">Local Experts</div>
                          <div className="text-muted-foreground">{city.name} specialists</div>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Form */}
      <section id="quote" className="py-16 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Get Your Free {service.name} Quote in {city.name}</h2>
              <p className="text-lg text-muted-foreground">
                Fill out the form below for a customized quote. No obligation, no hidden fees.
              </p>
            </div>
            <QuoteForm preselectedService={service.slug} />
          </div>
        </div>
      </section>
    </div>
  );
}
