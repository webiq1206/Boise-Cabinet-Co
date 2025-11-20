import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuoteForm } from "@/components/QuoteForm";
import { CheckCircle2, Fence, Shield } from "lucide-react";
import heroBackground from "@assets/Untitled design_1763639882299.png";

export default function FenceInstallation() {
  return (
    <div className="flex flex-col">
      <div className="border-b bg-muted/30">
        <div className="container px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" data-testid="breadcrumb-home">Home</Link>
            <span>/</span>
            <Link href="/services/landscaping" data-testid="breadcrumb-landscaping">Landscaping</Link>
            <span>/</span>
            <span className="text-foreground" data-testid="breadcrumb-current">Fence Installation</span>
          </div>
        </div>
      </div>

      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBackground} 
            alt="Professional fence installation services with beautiful lawn in Kuna and Boise Idaho"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60"></div>
        </div>
        <div className="container px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white" data-testid="heading-main">Fence Installation in Kuna & Boise</h1>
            <p className="text-lg text-white/90" data-testid="text-subtitle">
              Professional wood, vinyl, and chain link fence installation across the Treasure Valley
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
                  <h2 data-testid="heading-intro">Expert Fence Installation Services</h2>
                  <p data-testid="text-intro">
                    Enhance your property's privacy, security, and curb appeal with a professionally installed fence. We offer wood fences, vinyl fences, chain link fences, and decorative fencing options to meet your specific needs and budget.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4" data-testid="heading-types">Fence Types We Install</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: 'Wood Fences',
                        features: ['Cedar privacy fences', 'Picket fences', 'Split rail fences', 'Custom wood designs'],
                      },
                      {
                        title: 'Vinyl Fences',
                        features: ['Low maintenance', 'Won\'t rot or fade', 'Multiple colors', 'Lifetime durability'],
                      },
                      {
                        title: 'Chain Link Fences',
                        features: ['Affordable option', 'Security fencing', 'Commercial grade', 'Vinyl coated available'],
                      },
                      {
                        title: 'Decorative Fences',
                        features: ['Ornamental iron', 'Aluminum fencing', 'Garden fencing', 'Custom designs'],
                      },
                    ].map((type, index) => (
                      <Card key={index} className="hover-elevate" data-testid={`card-fence-type-${index}`}>
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg mb-3" data-testid={`title-fence-${index}`}>{type.title}</h3>
                          <ul className="space-y-1">
                            {type.features.map((feature, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm" data-testid={`feature-fence-${index}-${i}`}>
                                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/50 p-6 rounded-md">
                  <h2 className="text-2xl font-bold mb-4" data-testid="heading-areas">Service Areas</h2>
                  <div className="flex flex-wrap gap-2">
                    {['Kuna', 'Boise', 'Meridian', 'Nampa', 'Caldwell', 'Eagle'].map((city) => (
                      <Button key={city} variant="outline" size="sm" asChild data-testid={`button-city-${city.toLowerCase()}`}>
                        <Link href={`/services/fence-installation/${city.toLowerCase()}`}>{city}</Link>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="sticky top-20">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-3" data-testid="heading-why">Why Choose Us</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2" data-testid="why-expert">
                          <Fence className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Expert Installation</div>
                            <div className="text-muted-foreground">7+ years experience</div>
                          </div>
                        </li>
                        <li className="flex items-start gap-2" data-testid="why-insured">
                          <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Fully Insured</div>
                            <div className="text-muted-foreground">Licensed & bonded</div>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-4 border-t space-y-3">
                      <Button size="lg" asChild data-testid="button-call-sidebar">
                        <a href="tel:2083522011" className="block">
                          Call (208) 352-2011
                        </a>
                      </Button>
                      <Button variant="outline" size="lg" asChild data-testid="button-quote-sidebar">
                        <a href="#quote" className="block">
                          Get Free Quote
                        </a>
                      </Button>
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
              <h2 className="text-3xl font-bold mb-4" data-testid="heading-quote">Get Your Free Fence Quote</h2>
            </div>
            <QuoteForm preselectedService="fence" />
          </div>
        </div>
      </section>
    </div>
  );
}
