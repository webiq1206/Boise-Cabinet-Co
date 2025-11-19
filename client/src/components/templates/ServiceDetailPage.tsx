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
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="heading-hero">
              {service.name} in Idaho
            </h1>
            <p className="text-xl mb-8 opacity-90" data-testid="text-hero-description">
              {service.shortDescription}
            </p>
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
                  <h2 className="text-3xl font-bold mb-4">Professional {service.name} Services</h2>
                  <p className="text-lg leading-relaxed">{service.longDescription}</p>
                </div>

                {/* Benefits */}
                <div data-testid="section-benefits">
                  <h2 className="text-3xl font-bold mb-6">Benefits of Professional {service.name}</h2>
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
                  <h2 className="text-3xl font-bold mb-6">Our {service.name} Process</h2>
                  <div className="space-y-4">
                    {service.process.map((step) => (
                      <Card key={step.step} data-testid={`process-step-${step.step}`}>
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                              {step.step}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold mb-2">{step.title}</h3>
                              <p className="text-muted-foreground">{step.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Pricing Guidance */}
                {service.pricingGuidance && (
                  <div data-testid="section-pricing">
                    <h2 className="text-3xl font-bold mb-4">{service.name} Pricing</h2>
                    <Card>
                      <CardContent className="p-6">
                        <p className="leading-relaxed">{service.pricingGuidance}</p>
                        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                          <p className="font-semibold">✓ Free, no-obligation quotes</p>
                          <p className="font-semibold">✓ No hidden fees</p>
                          <p className="font-semibold">✓ Competitive pricing</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* FAQs */}
                <div data-testid="section-faqs">
                  <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions About {service.name}</h2>
                  <div className="space-y-4">
                    {service.faqs.map((faq, index) => (
                      <Card key={index} data-testid={`faq-${index}`}>
                        <CardContent className="p-6">
                          <h3 className="font-semibold mb-2 text-lg">{faq.question}</h3>
                          <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Service Areas */}
                <div data-testid="section-service-areas">
                  <h2 className="text-3xl font-bold mb-4">We Serve the Entire Treasure Valley</h2>
                  <p className="mb-4">
                    Lawn Care Kuna proudly provides professional {service.name.toLowerCase()} services throughout the Treasure Valley, including:
                  </p>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {['Kuna', 'Boise', 'Meridian', 'Nampa', 'Caldwell', 'Eagle'].map(city => (
                      <Link key={city} href={`/services/${service.slug}/${city.toLowerCase()}`}>
                        <span className="text-primary hover:underline cursor-pointer">
                          {service.name} in {city} →
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Related Services */}
                {service.relatedServices.length > 0 && (
                  <div data-testid="section-related-services">
                    <h2 className="text-3xl font-bold mb-4">Related Services</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {service.relatedServices.map(slug => (
                        <Link key={slug} href={`/services/${slug}`}>
                          <Card className="hover-elevate cursor-pointer">
                            <CardContent className="p-4">
                              <span className="text-primary font-medium">
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

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Contact Card */}
                <Card data-testid="card-contact">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Get Started Today</h3>
                    <div className="space-y-3">
                      <Button size="lg" className="w-full" asChild>
                        <a href="tel:2083522011">
                          <Phone className="h-4 w-4 mr-2" />
                          Call (208) 352-2011
                        </a>
                      </Button>
                      <Button size="lg" variant="outline" className="w-full" asChild>
                        <a href="#quote">Get Free Quote</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Why Choose Us */}
                <Card data-testid="card-why-choose-us">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Why Choose Lawn Care Kuna</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium">Since 2017</div>
                          <div className="text-muted-foreground">7+ years serving Idaho</div>
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
                        <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium">Local Experts</div>
                          <div className="text-muted-foreground">Idaho climate specialists</div>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Seasonality */}
                {service.seasonality && (
                  <Card data-testid="card-seasonality">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">Best Time for Service</h3>
                      <p className="text-sm text-muted-foreground">{service.seasonality}</p>
                    </CardContent>
                  </Card>
                )}
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
              <h2 className="text-3xl font-bold mb-4">Request Your Free {service.name} Quote</h2>
              <p className="text-lg text-muted-foreground">
                Get a customized quote for your property. No obligation, no hidden fees.
              </p>
            </div>
            <QuoteForm preselectedService={service.slug} />
          </div>
        </div>
      </section>
    </div>
  );
}
