import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuoteForm } from "@/components/QuoteForm";
import { CheckCircle2, Droplets, Shield, Award } from "lucide-react";

export default function PondInstallation() {
  return (
    <div className="flex flex-col">
      <div className="border-b bg-muted/30">
        <div className="container px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" data-testid="breadcrumb-home">Home</Link>
            <span>/</span>
            <Link href="/services/landscaping" data-testid="breadcrumb-landscaping">Landscaping</Link>
            <span>/</span>
            <span className="text-foreground" data-testid="breadcrumb-current">Pond Installation</span>
          </div>
        </div>
      </div>

      <section className="bg-primary text-primary-foreground py-16">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold" data-testid="heading-main">Pond Installation in Kuna & Boise</h1>
            <p className="text-lg text-primary-foreground/90" data-testid="text-subtitle">
              Professional pond, fountain, and water feature installation across the Treasure Valley
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
                  <h2 data-testid="heading-intro">Expert Water Feature Installation</h2>
                  <p data-testid="text-intro-1">
                    Transform your backyard into a tranquil retreat with a professionally installed pond or water feature. Whether you're dreaming of a koi pond, ecosystem pond, fountain, or waterfall, we have the expertise to bring your vision to life.
                  </p>
                  <p data-testid="text-intro-2">
                    Since 2017, we've designed and installed beautiful water features throughout the Treasure Valley. We understand Idaho's climate and use only materials and techniques proven to withstand our freeze-thaw cycles.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4" data-testid="heading-types">Types of Water Features We Install</h2>
                  <div className="space-y-4">
                    <Card className="hover-elevate" data-testid="card-koi-ponds">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-2" data-testid="title-koi-ponds">Koi Ponds</h3>
                        <p className="text-muted-foreground mb-3" data-testid="desc-koi-ponds">
                          Beautiful koi ponds with proper filtration, circulation, and depth for healthy fish year-round in Idaho's climate.
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li data-testid="feature-koi-0">• Custom pond design and sizing</li>
                          <li data-testid="feature-koi-1">• Professional filtration systems</li>
                          <li data-testid="feature-koi-2">• Proper depth for winter survival</li>
                          <li data-testid="feature-koi-3">• Water quality management</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="hover-elevate" data-testid="card-ecosystem-ponds">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-2" data-testid="title-ecosystem-ponds">Ecosystem Ponds</h3>
                        <p className="text-muted-foreground mb-3" data-testid="desc-ecosystem-ponds">
                          Natural-looking ponds that balance beauty with ecological sustainability and low maintenance.
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li data-testid="feature-ecosystem-0">• Natural filtration systems</li>
                          <li data-testid="feature-ecosystem-1">• Aquatic plant integration</li>
                          <li data-testid="feature-ecosystem-2">• Wildlife-friendly design</li>
                          <li data-testid="feature-ecosystem-3">• Low maintenance operation</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="hover-elevate" data-testid="card-waterfalls">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-2" data-testid="title-waterfalls">Waterfalls & Fountains</h3>
                        <p className="text-muted-foreground mb-3" data-testid="desc-waterfalls">
                          Stunning water features that add the soothing sound of flowing water to your outdoor space.
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li data-testid="feature-waterfall-0">• Custom waterfall design</li>
                          <li data-testid="feature-waterfall-1">• Fountain installation</li>
                          <li data-testid="feature-waterfall-2">• Natural stone construction</li>
                          <li data-testid="feature-waterfall-3">• Energy-efficient pumps</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="bg-muted/50 p-6 rounded-md">
                  <h2 className="text-2xl font-bold mb-4" data-testid="heading-areas">Service Areas</h2>
                  <p className="mb-4 text-muted-foreground" data-testid="text-areas">
                    Professional pond installation available in:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Kuna', 'Boise', 'Meridian', 'Nampa', 'Caldwell', 'Eagle'].map((city) => (
                      <Button key={city} variant="outline" size="sm" asChild data-testid={`button-city-${city.toLowerCase()}`}>
                        <Link href={`/services/pond-installation/${city.toLowerCase()}`}>{city}</Link>
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
                        <li className="flex items-start gap-2" data-testid="why-expertise">
                          <Droplets className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Water Feature Experts</div>
                            <div className="text-muted-foreground">7+ years experience</div>
                          </div>
                        </li>
                        <li className="flex items-start gap-2" data-testid="why-quality">
                          <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Quality Materials</div>
                            <div className="text-muted-foreground">Idaho weather-rated</div>
                          </div>
                        </li>
                        <li className="flex items-start gap-2" data-testid="why-warranty">
                          <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Warranty</div>
                            <div className="text-muted-foreground">Satisfaction guaranteed</div>
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

                <Card data-testid="card-related-services">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3" data-testid="heading-related">Related Services</h3>
                    <ul className="space-y-2">
                      <li data-testid="link-patio">
                        <Link href="/services/patio-installation">
                          <a className="text-sm text-muted-foreground hover:text-primary">
                            Patio Installation →
                          </a>
                        </Link>
                      </li>
                      <li data-testid="link-lighting">
                        <Link href="/services/landscape-lighting">
                          <a className="text-sm text-muted-foreground hover:text-primary">
                            Landscape Lighting →
                          </a>
                        </Link>
                      </li>
                      <li data-testid="link-firepit">
                        <Link href="/services/fire-pit-installation">
                          <a className="text-sm text-muted-foreground hover:text-primary">
                            Fire Pit Installation →
                          </a>
                        </Link>
                      </li>
                    </ul>
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
              <h2 className="text-3xl font-bold mb-4" data-testid="heading-quote">Get Your Free Pond Quote</h2>
              <p className="text-lg text-muted-foreground" data-testid="text-quote">
                Tell us about your water feature project
              </p>
            </div>
            <QuoteForm preselectedService="pond" />
          </div>
        </div>
      </section>
    </div>
  );
}
