import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuoteForm } from "@/components/QuoteForm";
import { Building2, CheckCircle2, Shield, Clock } from "lucide-react";

export default function PropertyManagement() {
  return (
    <div className="flex flex-col">
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold" data-testid="heading-main">Property Management Lawn Care Services</h1>
            <p className="text-lg text-primary-foreground/90" data-testid="text-subtitle">
              Professional lawn care and landscaping for multi-family properties, apartments, and commercial complexes
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
                  <h2 data-testid="heading-intro">Reliable Lawn Care for Property Managers</h2>
                  <p data-testid="text-intro">
                    We understand the unique challenges property managers face keeping multiple properties looking their best. Our comprehensive lawn care and landscaping services help you maintain curb appeal, satisfy tenants, and protect property values across your entire portfolio.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4" data-testid="heading-services">Property Management Services</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: 'Weekly Lawn Maintenance', desc: 'Scheduled mowing, edging, and trimming for all properties' },
                      { title: 'Seasonal Cleanup', desc: 'Spring and fall cleanup services for common areas' },
                      { title: 'Snow Removal', desc: 'Winter snow plowing and de-icing services' },
                      { title: 'Irrigation Management', desc: 'System maintenance, repairs, and winterization' },
                      { title: 'Landscape Maintenance', desc: 'Pruning, mulching, and bed maintenance' },
                      { title: 'Common Area Care', desc: 'Maintain parks, playgrounds, and gathering spaces' },
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
                  <h3 className="text-xl font-bold mb-4" data-testid="heading-benefits">Benefits for Property Managers</h3>
                  <ul className="space-y-2">
                    {['Single point of contact for multiple properties', 'Consistent service quality across all locations', 'Flexible scheduling around tenant needs', 'Detailed service reports and documentation', 'Emergency response available', 'Competitive portfolio pricing'].map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2" data-testid={`benefit-${i}`}>
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="sticky top-20">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-3" data-testid="heading-why">Why Property Managers Choose Us</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2" data-testid="why-reliable">
                          <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Reliable Service</div>
                            <div className="text-muted-foreground">On-time, every time</div>
                          </div>
                        </li>
                        <li className="flex items-start gap-2" data-testid="why-insured">
                          <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Fully Insured</div>
                            <div className="text-muted-foreground">$2M liability coverage</div>
                          </div>
                        </li>
                        <li className="flex items-start gap-2" data-testid="why-experience">
                          <Building2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Multi-Property Experience</div>
                            <div className="text-muted-foreground">Trusted since 2017</div>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-4 border-t space-y-3">
                      <a href="tel:2083522011" className="block">
                        <Button size="lg" data-testid="button-call-sidebar">Call (208) 352-2011</Button>
                      </a>
                      <a href="#quote" className="block">
                        <Button variant="outline" size="lg" data-testid="button-quote-sidebar">Get Portfolio Quote</Button>
                      </a>
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
              <h2 className="text-3xl font-bold mb-4" data-testid="heading-quote">Get Your Property Management Quote</h2>
            </div>
            <QuoteForm preselectedService="property-management" />
          </div>
        </div>
      </section>
    </div>
  );
}
