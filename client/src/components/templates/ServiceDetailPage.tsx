import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Phone, MapPin, Clock, Award } from "lucide-react";
import { QuoteForm } from "@/components/QuoteForm";
import type { ServiceData } from "@shared/contentData";

interface ServiceDetailPageProps {
  service: ServiceData;
}

export function ServiceDetailPage({ service }: ServiceDetailPageProps) {
  const metaTitle = `${service.name} in Idaho | Lawn Care Kuna`;
  const metaDescription = `${service.shortDescription}. Professional ${service.name.toLowerCase()} services in Kuna, Boise, Meridian, Nampa, Caldwell, and Eagle. Free quotes. Call (208) 352-2011.`;

  return (
    <div>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
      </Helmet>

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
                  Most trusted {service.name.toLowerCase()} services in Idaho
                </h1>
                <p className="text-primary text-lg md:text-xl font-medium" data-testid="text-hero-description">
                  {service.shortDescription}
                </p>
              </div>

              {/* Right: CTA Card */}
              <div className="lg:ml-auto lg:max-w-md w-full">
                <Card className="shadow-xl bg-white">
                  <CardContent className="p-6 md:p-8 space-y-4">
                    <h3 className="text-xl font-semibold text-center mb-2">Get Your Free Quote</h3>
                    <p className="text-sm text-muted-foreground text-center mb-6">Professional service. No obligation.</p>
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
                      Fast response • Licensed & Insured • Since 2017
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
                <div className="text-xs text-muted-foreground">7+ Years</div>
              </div>
              <div>
                <Award className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="font-semibold text-sm">Fully Insured</div>
                <div className="text-xs text-muted-foreground">Licensed</div>
              </div>
              <div>
                <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="font-semibold text-sm">Local Experts</div>
                <div className="text-xs text-muted-foreground">Idaho Climate</div>
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
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">Professional {service.name} Services</h2>
                  <p className="text-lg leading-relaxed text-foreground/90">{service.longDescription}</p>
                </div>

                {/* Benefits */}
                <div data-testid="section-benefits" className="bg-secondary/40 -mx-6 px-6 py-12 md:-mx-0 md:px-12 md:py-16 md:rounded-lg">
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Benefits of Professional {service.name}</h2>
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
                <div data-testid="section-process">
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Our {service.name} Process</h2>
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

                {/* Pricing Guidance */}
                {service.pricingGuidance && (
                  <div data-testid="section-pricing" className="bg-secondary/40 -mx-6 px-6 py-12 md:-mx-0 md:px-12 md:py-16 md:rounded-lg">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">{service.name} Pricing</h2>
                    <p className="text-lg leading-relaxed mb-8">{service.pricingGuidance}</p>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="flex items-start gap-3">
                        <Check className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <span className="font-medium">Free quotes</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <span className="font-medium">No hidden fees</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <span className="font-medium">Competitive rates</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* FAQs */}
                <div data-testid="section-faqs">
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Frequently Asked Questions About {service.name}</h2>
                  <div className="space-y-6">
                    {service.faqs.map((faq, index) => (
                      <Card key={index} data-testid={`faq-${index}`} className="hover-elevate">
                        <CardContent className="p-8">
                          <h3 className="font-semibold mb-3 text-xl">{faq.question}</h3>
                          <p className="text-muted-foreground leading-relaxed text-base">{faq.answer}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Service Areas */}
                <div data-testid="section-service-areas" className="bg-secondary/40 -mx-6 px-6 py-12 md:-mx-0 md:px-12 md:py-16 md:rounded-lg">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">We Serve the Entire Treasure Valley</h2>
                  <p className="text-lg mb-8 leading-relaxed">
                    Lawn Care Kuna proudly provides professional {service.name.toLowerCase()} services throughout the Treasure Valley, including:
                  </p>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {['Kuna', 'Boise', 'Meridian', 'Nampa', 'Caldwell', 'Eagle'].map(city => (
                      <Link key={city} href={`/services/${service.slug}/${city.toLowerCase()}`} data-testid={`link-service-area-${city.toLowerCase()}`}>
                        <Card className="hover-elevate cursor-pointer">
                          <CardContent className="p-6">
                            <span className="text-primary font-medium text-lg">
                              {service.name} in {city} →
                            </span>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Related Services */}
                {service.relatedServices.length > 0 && (
                  <div data-testid="section-related-services">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Related Services</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {service.relatedServices.map(slug => (
                        <Link key={slug} href={`/services/${slug}`} data-testid={`link-related-service-${slug}`}>
                          <Card className="hover-elevate cursor-pointer">
                            <CardContent className="p-6">
                              <span className="text-primary font-medium text-lg">
                                {slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} →
                              </span>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Sidebar */}
              <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
                {/* Quote Form Card */}
                <Card data-testid="card-contact" className="bg-primary text-primary-foreground">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-2">Get Started Today</h3>
                    <p className="mb-6 opacity-90">Free, no-obligation quote for your property</p>
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

                {/* Why Choose Us */}
                <Card data-testid="card-why-choose-us">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold mb-6">Why Choose Lawn Care Kuna</h3>
                    <ul className="space-y-6">
                      <li className="flex items-start gap-3">
                        <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold mb-1">Since 2017</div>
                          <div className="text-sm text-muted-foreground">7+ years serving Idaho</div>
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
                        <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold mb-1">Local Experts</div>
                          <div className="text-sm text-muted-foreground">Idaho climate specialists</div>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Seasonality */}
                {service.seasonality && (
                  <Card data-testid="card-seasonality">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-3 text-lg">Best Time for Service</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{service.seasonality}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mid-Content CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-6 md:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Transform Your Property?</h2>
            <p className="text-xl mb-10 opacity-90">
              Join hundreds of satisfied Idaho homeowners who trust Lawn Care Kuna for professional {service.name.toLowerCase()} services.
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
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Request Your Free {service.name} Quote</h2>
              <p className="text-xl text-muted-foreground">
                Get a customized quote for your property. No obligation, no hidden fees.
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
