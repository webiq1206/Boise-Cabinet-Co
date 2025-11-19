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
            <Link href="/" className="hover-elevate cursor-pointer" data-testid="link-breadcrumb-home">
              Home
            </Link>
            <span>/</span>
            <Link href="/services" className="hover-elevate cursor-pointer" data-testid="link-breadcrumb-services">
              Services
            </Link>
            <span>/</span>
            <Link href={`/services/${service.slug}`} className="hover-elevate cursor-pointer" data-testid="link-breadcrumb-service">
              {service.name}
            </Link>
            <span>/</span>
            <span className="text-foreground">{city.name}</span>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-secondary/40 py-16 md:py-24 lg:py-32 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 text-primary/30">
            <svg viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 10 L30 40 Q50 35 70 40 Z" />
            </svg>
          </div>
          <div className="absolute bottom-20 right-10 w-48 h-48 text-primary/20">
            <svg viewBox="0 0 100 100" fill="currentColor">
              <path d="M20 50 L10 20 Q50 40 90 20 L80 50 Q50 30 20 50 Z" />
            </svg>
          </div>
        </div>

        <div className="container px-6 md:px-12 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Heading Content */}
              <div className="space-y-6">
                <p className="text-primary font-medium text-sm tracking-wide uppercase">
                  Lawn Care Kuna
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight" data-testid="heading-hero">
                  Most trusted {service.name.toLowerCase()} services in {city.name}
                </h1>
                <p className="text-primary text-lg md:text-xl font-medium">
                  Professional {service.name} Services in {city.name}
                </p>
                {city.population && (
                  <p className="text-muted-foreground text-base">
                    Serving {city.population} residents in {city.name} and surrounding areas
                  </p>
                )}
              </div>

              {/* Right: CTA Card */}
              <div className="lg:ml-auto lg:max-w-md w-full">
                <Card className="shadow-xl bg-white">
                  <CardContent className="p-6 md:p-8 space-y-4">
                    <h3 className="text-xl font-semibold text-center mb-2">Get Your Free Quote</h3>
                    <p className="text-sm text-muted-foreground text-center mb-6">Professional service in {city.name}. No obligation.</p>
                    <Button size="lg" className="w-full" asChild data-testid="button-hero-schedule">
                      <Link href="/get-quote">
                        SCHEDULE NOW AND SAVE
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="w-full" asChild data-testid="button-hero-call">
                      <a href="tel:2083522011">
                        <Phone className="h-5 w-5 mr-2" />
                        Call (208) 352-2011
                      </a>
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-4">
                      Fast response • Licensed & Insured • Serving {city.name} since 2017
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-8 border-b bg-secondary/30">
        <div className="container px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="font-semibold text-sm">Since 2017</div>
                <div className="text-xs text-muted-foreground">in {city.name}</div>
              </div>
              <div>
                <Award className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="font-semibold text-sm">Fully Insured</div>
                <div className="text-xs text-muted-foreground">Licensed</div>
              </div>
              <div>
                <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="font-semibold text-sm">Local to {city.name}</div>
                <div className="text-xs text-muted-foreground">ID Experts</div>
              </div>
              <div>
                <Phone className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="font-semibold text-sm">Free Quotes</div>
                <div className="text-xs text-muted-foreground">No Obligation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 md:py-32">
        <div className="container px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Main Content Column */}
              <div className="lg:col-span-2 space-y-16">
                {/* Introduction */}
                <div data-testid="section-intro">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">{service.name} Services in {city.name}</h2>
                  <p className="text-lg leading-relaxed text-foreground/90 mb-6">{service.longDescription}</p>
                  <p className="text-lg leading-relaxed">
                    At Lawn Care Kuna, we've been providing expert {service.name.toLowerCase()} services to {city.name} residents since 2017. 
                    We understand the unique challenges of maintaining {service.category.includes('lawn') ? 'lawns' : 'landscapes'} in {city.name}, including {city.localFactors.soil.toLowerCase()} and {city.localFactors.climate.toLowerCase()}.
                  </p>
                </div>

                {/* Local Expertise */}
                <div data-testid="section-local-expertise" className="bg-secondary/40 -mx-6 px-6 py-12 md:-mx-0 md:px-12 md:py-16 md:rounded-lg">
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Why {city.name} Chooses Lawn Care Kuna</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Local Expertise for {city.name}</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        We specialize in {service.name.toLowerCase()} solutions tailored for {city.name}'s specific conditions:
                      </p>
                      <ul className="space-y-3">
                        {city.localFactors.commonNeeds.map((need, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <Check className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-base leading-relaxed">{need}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {city.neighborhoods && city.neighborhoods.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold mb-3">We Serve All {city.name} Neighborhoods</h3>
                        <p className="text-muted-foreground">
                          Including {city.neighborhoods.slice(0, 4).join(', ')}{city.neighborhoods.length > 4 ? ', and more' : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Benefits */}
                <div data-testid="section-benefits">
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Benefits of Our {service.name} in {city.name}</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {service.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3" data-testid={`benefit-${index}`}>
                        <Check className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-base leading-relaxed">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Process */}
                <div data-testid="section-process" className="bg-secondary/40 -mx-6 px-6 py-12 md:-mx-0 md:px-12 md:py-16 md:rounded-lg">
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">How We Deliver {service.name} in {city.name}</h2>
                  <div className="space-y-6">
                    {service.process.map((step) => (
                      <Card key={step.step} data-testid={`process-step-${step.step}`} className="hover-elevate">
                        <CardContent className="p-8">
                          <div className="flex gap-6">
                            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                              {step.step}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
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
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">{service.name} Cost in {city.name}</h2>
                    <p className="text-lg leading-relaxed mb-8">{service.pricingGuidance}</p>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="flex items-start gap-3">
                        <Check className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <span className="font-medium">Free {city.name} quotes</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <span className="font-medium">No hidden fees</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <span className="font-medium">Since 2017</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* FAQs - Top 5 */}
                <div data-testid="section-faqs">
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">{service.name} FAQs for {city.name} Residents</h2>
                  <div className="space-y-6">
                    {service.faqs.slice(0, 5).map((faq, index) => (
                      <Card key={index} data-testid={`faq-${index}`} className="hover-elevate">
                        <CardContent className="p-8">
                          <h3 className="font-semibold mb-3 text-xl">{faq.question}</h3>
                          <p className="text-muted-foreground leading-relaxed text-base">{faq.answer}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="mt-8 text-center">
                    <Link href={`/services/${service.slug}`} data-testid="link-view-all-faqs">
                      <Card className="hover-elevate cursor-pointer inline-block">
                        <CardContent className="p-6">
                          <span className="text-primary font-medium text-lg">
                            View all {service.name} FAQs →
                          </span>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                </div>

                {/* Nearby Cities */}
                <div data-testid="section-nearby-cities" className="bg-secondary/40 -mx-6 px-6 py-12 md:-mx-0 md:px-12 md:py-16 md:rounded-lg">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">We Also Serve Nearby Cities</h2>
                  <p className="text-lg mb-8 leading-relaxed">
                    Looking for {service.name.toLowerCase()} in other Treasure Valley cities? We serve:
                  </p>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {['Kuna', 'Boise', 'Meridian', 'Nampa', 'Caldwell', 'Eagle']
                      .filter(c => c !== city.name)
                      .map(nearbyCity => (
                        <Link key={nearbyCity} href={`/services/${service.slug}/${nearbyCity.toLowerCase()}`} data-testid={`link-nearby-city-${nearbyCity.toLowerCase()}`}>
                          <Card className="hover-elevate cursor-pointer">
                            <CardContent className="p-6">
                              <span className="text-primary font-medium text-lg">
                                {service.name} in {nearbyCity} →
                              </span>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                  </div>
                </div>
              </div>

              {/* Sticky Sidebar */}
              <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
                {/* Quote Form Card */}
                <Card data-testid="card-contact" className="bg-primary text-primary-foreground">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-2">Serving {city.name}</h3>
                    <p className="mb-6 opacity-90">Get your free, no-obligation quote today</p>
                    <div className="space-y-4">
                      <Button size="lg" className="w-full bg-white text-primary" asChild data-testid="button-sidebar-call">
                        <a href="tel:2083522011">
                          <Phone className="h-5 w-5 mr-2" />
                          Call (208) 352-2011
                        </a>
                      </Button>
                      <Button size="lg" variant="outline" className="w-full border-white text-white" asChild data-testid="button-sidebar-quote">
                        <Link href="/get-quote">Get Free Quote</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Service Area Info */}
                <Card data-testid="card-service-area">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <MapPin className="h-6 w-6 text-primary" />
                      Service Area
                    </h3>
                    <div className="space-y-3">
                      <p className="font-semibold text-lg">{city.name}, Idaho</p>
                      {city.zipCodes && (
                        <p className="text-sm text-muted-foreground">ZIP Codes: {city.zipCodes.join(', ')}</p>
                      )}
                      {city.isPrimary && (
                        <p className="text-primary font-semibold">★ Primary Service Area</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Why Choose Us */}
                <Card data-testid="card-why-choose-us">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold mb-6">Why Choose Us</h3>
                    <ul className="space-y-6">
                      <li className="flex items-start gap-3">
                        <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold mb-1">Since 2017</div>
                          <div className="text-sm text-muted-foreground">7+ years in {city.name}</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <Award className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold mb-1">Fully Insured</div>
                          <div className="text-sm text-muted-foreground">Licensed & professional</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <Home className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold mb-1">Local Experts</div>
                          <div className="text-sm text-muted-foreground">{city.name} specialists</div>
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

      {/* Mid-Content CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-6 md:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready for Professional {service.name} in {city.name}?</h2>
            <p className="text-xl mb-10 opacity-90">
              Join your {city.name} neighbors who trust Lawn Care Kuna for expert {service.name.toLowerCase()} services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary" asChild data-testid="button-midcta-quote">
                <Link href="/get-quote">Get Free Quote</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white" asChild data-testid="button-midcta-call">
                <a href="tel:2083522011">Call (208) 352-2011</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Form */}
      <section id="quote" className="py-24 md:py-32 bg-secondary/30">
        <div className="container px-6 md:px-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Get Your Free {service.name} Quote in {city.name}</h2>
              <p className="text-xl text-muted-foreground">
                Fill out the form below for a customized quote. No obligation, no hidden fees.
              </p>
            </div>
            <QuoteForm preselectedService={service.slug} />
          </div>
        </div>
      </section>

      {/* Mobile Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t shadow-lg">
        <div className="container px-4 py-3">
          <div className="flex gap-2">
            <Button size="lg" variant="outline" className="flex-1" asChild data-testid="button-mobile-sticky-call">
              <a href="tel:2083522011">
                <Phone className="h-5 w-5" />
                <span className="ml-2">Call</span>
              </a>
            </Button>
            <Button size="lg" className="flex-1" asChild data-testid="button-mobile-sticky-quote">
              <Link href="/get-quote">Get Quote</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
