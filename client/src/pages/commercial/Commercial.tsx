import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuoteForm } from "@/components/QuoteForm";
import { Building2, CheckCircle2, Shield, Clock } from "lucide-react";

export default function Commercial() {
  return (
    <div className="flex flex-col">
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold" data-testid="heading-main">Commercial Lawn Care & Landscaping</h1>
            <p className="text-lg text-primary-foreground/90" data-testid="text-subtitle">
              Professional landscaping services for businesses, office parks, retail centers, and commercial properties across the Treasure Valley
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="prose prose-lg max-w-none">
                  <h2 data-testid="heading-intro">Elevate Your Business with Professional Landscaping</h2>
                  <p data-testid="text-intro">
                    First impressions matter in business. Our commercial lawn care and landscaping services ensure your property always looks professional, welcoming, and well-maintained. We specialize in serving office buildings, retail centers, industrial parks, restaurants, medical facilities, and other commercial properties throughout the Treasure Valley.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4" data-testid="heading-services">Commercial Services</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: 'Commercial Lawn Maintenance', desc: 'Weekly mowing, edging, trimming, and blowing for a pristine appearance' },
                      { title: 'Landscape Design & Installation', desc: 'Custom designs that enhance your brand and property value' },
                      { title: 'Seasonal Color Programs', desc: 'Year-round color with flowers, plants, and seasonal displays' },
                      { title: 'Irrigation System Management', desc: 'Design, installation, maintenance, and water management' },
                      { title: 'Snow & Ice Management', desc: 'Winter snow removal, plowing, and de-icing services' },
                      { title: 'Grounds Cleanup & Maintenance', desc: 'Spring/fall cleanup, leaf removal, and debris management' },
                    ].map((service, index) => (
                      <Card key={index} className="hover-elevate" data-testid={`card-service-${index}`}>
                        <CardContent className="p-6">
                          <h3 className="font-semibold mb-2" data-testid={`title-service-${index}`}>{service.title}</h3>
                          <p className="text-sm text-muted-foreground" data-testid={`desc-service-${index}`}>{service.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/50 p-6 rounded-md">
                  <h3 className="text-xl font-bold mb-4" data-testid="heading-benefits">Why Choose Commercial Landscaping?</h3>
                  <ul className="space-y-2">
                    {[
                      'Enhance curb appeal and attract more customers',
                      'Increase property value and tenant satisfaction',
                      'Create a professional image for your business',
                      'Reduce liability with proper maintenance',
                      'Flexible scheduling around business hours',
                      'Customized service plans for your budget'
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2" data-testid={`benefit-${i}`}>
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Industries We Serve</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      'Office Buildings',
                      'Retail Centers',
                      'Restaurants',
                      'Medical Facilities',
                      'Industrial Parks',
                      'Hotels & Resorts',
                      'Apartment Complexes',
                      'HOA Communities',
                      'Schools & Universities'
                    ].map((industry, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{industry}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="sticky top-20">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-3" data-testid="heading-why">Why Businesses Choose Us</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2" data-testid="why-reliable">
                          <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Reliable Service</div>
                            <div className="text-muted-foreground">Consistent, on-time maintenance</div>
                          </div>
                        </li>
                        <li className="flex items-start gap-2" data-testid="why-insured">
                          <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Fully Licensed & Insured</div>
                            <div className="text-muted-foreground">$2M liability coverage</div>
                          </div>
                        </li>
                        <li className="flex items-start gap-2" data-testid="why-experience">
                          <Building2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Commercial Expertise</div>
                            <div className="text-muted-foreground">Serving businesses since 2017</div>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-4 border-t space-y-3">
                      <a href="#quote" className="block">
                        <Button className="w-full" size="lg" data-testid="button-quote-sidebar">Get Commercial Quote</Button>
                      </a>
                      <Link href="/pricing" className="block">
                        <Button className="w-full" variant="outline" size="lg" data-testid="button-pricing-sidebar">View Pricing</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="quote" className="py-16 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4" data-testid="heading-quote">Get Your Commercial Landscaping Quote</h2>
              <p className="text-muted-foreground">
                Tell us about your commercial property and we'll provide a customized quote for your landscaping needs.
              </p>
            </div>
            <QuoteForm enableAi={true} />
          </div>
        </div>
      </section>
    </div>
  );
}
