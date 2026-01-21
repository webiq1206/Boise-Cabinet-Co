import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SimpleQuoteWizard } from "@/components/SimpleQuoteWizard";
import { Landmark, CheckCircle2, Shield, Award } from "lucide-react";
import heroBackground from "@assets/Untitled design_1763639882299.png";

export default function MunicipalServices() {
  return (
    <div className="flex flex-col">
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBackground} 
            alt="Professional municipal lawn care and grounds maintenance for government facilities in Idaho"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground" data-testid="heading-main">Municipal Lawn Care & Landscaping Services</h1>
            <p className="text-lg text-muted-foreground" data-testid="text-subtitle">
              Professional grounds maintenance for parks, government facilities, and public spaces
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
                  <h2 data-testid="heading-intro">Trusted Municipal Grounds Maintenance</h2>
                  <p data-testid="text-intro">
                    We provide comprehensive lawn care and landscaping services for municipalities, government agencies, schools, and public facilities throughout the Treasure Valley. Our team understands the importance of maintaining public spaces that reflect community pride and serve residents well.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4" data-testid="heading-services">Municipal Services</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: 'Park Maintenance', desc: 'Regular mowing, edging, and care for public parks' },
                      { title: 'Government Facilities', desc: 'Grounds keeping for city buildings and offices' },
                      { title: 'Sports Fields', desc: 'Athletic field maintenance and turf management' },
                      { title: 'School Grounds', desc: 'Campus lawn care and landscape services' },
                      { title: 'Public Gardens', desc: 'Ornamental bed maintenance and planting' },
                      { title: 'Trail Maintenance', desc: 'Walking path and greenway upkeep' },
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
                  <h3 className="text-xl font-bold mb-4" data-testid="heading-qualifications">Municipal Qualifications</h3>
                  <ul className="space-y-2">
                    {['Licensed and bonded contractor', 'Comprehensive liability insurance', 'Public works experience', 'Background-checked employees', 'OSHA safety compliance', 'Contract bidding experience'].map((qual, i) => (
                      <li key={i} className="flex items-center gap-2" data-testid={`qualification-${i}`}>
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{qual}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="sticky top-20">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-3" data-testid="heading-why">Why Municipalities Choose Us</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2" data-testid="why-compliant">
                          <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Fully Compliant</div>
                            <div className="text-muted-foreground">All certifications & insurance</div>
                          </div>
                        </li>
                        <li className="flex items-start gap-2" data-testid="why-experience">
                          <Landmark className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Public Works Experience</div>
                            <div className="text-muted-foreground">Serving since 2017</div>
                          </div>
                        </li>
                        <li className="flex items-start gap-2" data-testid="why-reliable">
                          <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Dependable Service</div>
                            <div className="text-muted-foreground">On schedule, on budget</div>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-4 border-t space-y-3">
                      <a href="#quote" className="block">
                        <Button size="lg" data-testid="button-quote-sidebar">Request Bid Information</Button>
                      </a>
                      <Link href="/pricing" className="block">
                        <Button variant="outline" size="lg" data-testid="button-pricing-sidebar">View Pricing</Button>
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
              <h2 className="text-3xl font-bold mb-4" data-testid="heading-quote">Request Municipal Services Information</h2>
            </div>
            <SimpleQuoteWizard />
          </div>
        </div>
      </section>
    </div>
  );
}
