import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Testimonials } from "@/components/Testimonials";
import { SimpleQuoteWizard } from "@/components/SimpleQuoteWizard";
import { Droplets, Shield, Award } from "lucide-react";
import { generateServiceSchema, generateBreadcrumbSchema, generateLocalBusinessSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Pond & Water Feature Installation Kuna & Boise Idaho",
  description: "Pond, fountain & water feature installation in Kuna, Boise, Meridian & Treasure Valley. Koi ponds, waterfalls & fountains. Expert design for Idaho climate. Call (208) 352-2011!",
  openGraph: {
    title: "Pond & Water Feature Installation | Lawn Care Kuna",
    description: "Pond, fountain, and water feature installation across the Treasure Valley. Free quotes!",
    url: "https://lawncarekuna.com/services/pond-installation",
    type: "website",
  },
  alternates: {
    canonical: "https://lawncarekuna.com/services/pond-installation",
  },
};

export default function PondInstallationPage() {
  const serviceSchema = generateServiceSchema(
    "Pond Installation",
    "Professional pond, fountain, and water feature installation for residential and commercial properties in Kuna, Boise, Meridian, and the Treasure Valley."
  );
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
    { name: "Landscaping", url: "/services/landscaping" },
    { name: "Pond Installation", url: "/services/pond-installation" },
  ]);

  const localBusinessSchema = generateLocalBusinessSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <div className="flex flex-col">
        <div className="border-b bg-muted/30">
          <div className="container px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span>/</span>
              <Link href="/services/landscaping" className="hover:text-primary">Landscaping</Link>
              <span>/</span>
              <span className="text-foreground">Pond Installation</span>
            </div>
          </div>
        </div>

        <section className="relative py-16 bg-gradient-to-b from-primary/10 to-background">
          <div className="container px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">Pond Installation in Kuna & Boise</h1>
              <p className="text-lg text-muted-foreground">
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
                    <h2>Expert Water Feature Installation</h2>
                    <p>
                      Transform your backyard into a tranquil retreat with a professionally installed pond or water feature. Whether you&apos;re dreaming of a koi pond, ecosystem pond, fountain, or waterfall, we have the expertise to bring your vision to life.
                    </p>
                    <p>
                      Since 2017, we&apos;ve designed and installed beautiful water features throughout the Treasure Valley. We understand Idaho&apos;s climate and use only materials and techniques proven to withstand our freeze-thaw cycles.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-4">Types of Water Features We Install</h2>
                    <div className="space-y-4">
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg mb-2">Koi Ponds</h3>
                          <p className="text-muted-foreground mb-3">
                            Beautiful koi ponds with proper filtration, circulation, and depth for healthy fish year-round in Idaho&apos;s climate.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Custom pond design and sizing</li>
                            <li>• Professional filtration systems</li>
                            <li>• Proper depth for winter survival</li>
                            <li>• Water quality management</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg mb-2">Ecosystem Ponds</h3>
                          <p className="text-muted-foreground mb-3">
                            Natural-looking ponds that balance beauty with ecological sustainability and low maintenance.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Natural filtration systems</li>
                            <li>• Aquatic plant integration</li>
                            <li>• Wildlife-friendly design</li>
                            <li>• Low maintenance operation</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg mb-2">Waterfalls & Fountains</h3>
                          <p className="text-muted-foreground mb-3">
                            Stunning water features that add the soothing sound of flowing water to your outdoor space.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Custom waterfall design</li>
                            <li>• Fountain installation</li>
                            <li>• Natural stone construction</li>
                            <li>• Energy-efficient pumps</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-6 rounded-md">
                    <h2 className="text-2xl font-bold mb-4">Service Areas</h2>
                    <p className="mb-4 text-muted-foreground">
                      Professional pond installation available in:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Kuna', 'Boise', 'Meridian', 'Eagle', 'Star', 'Middleton'].map((city) => (
                        <Button key={city} variant="outline" size="sm" className="bg-gradient-to-br from-primary/10 to-white border-primary/20 text-primary" asChild>
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
                        <h3 className="font-semibold text-lg mb-3">Why Choose Us</h3>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <Droplets className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <div className="font-medium">Water Feature Experts</div>
                              <div className="text-muted-foreground">7+ years experience</div>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <div className="font-medium">Quality Materials</div>
                              <div className="text-muted-foreground">Idaho weather-rated</div>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <div className="font-medium">Warranty</div>
                              <div className="text-muted-foreground">Satisfaction guaranteed</div>
                            </div>
                          </li>
                        </ul>
                      </div>
                      <div className="pt-4 border-t space-y-3">
                        <Button size="lg" className="w-full" asChild>
                          <a href="tel:2083522011">
                            Call (208) 352-2011
                          </a>
                        </Button>
                        <Button variant="outline" size="lg" className="w-full bg-gradient-to-br from-primary/10 to-white border-primary/20 text-primary" asChild>
                          <a href="#quote">
                            Get a Free Pond Installation Quote
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-3">Related Services</h3>
                      <ul className="space-y-2">
                        <li>
                          <Link href="/services/patio-installation" className="text-sm text-muted-foreground hover:text-primary">
                            Patio Installation →
                          </Link>
                        </li>
                        <li>
                          <Link href="/services/landscape-lighting" className="text-sm text-muted-foreground hover:text-primary">
                            Landscape Lighting →
                          </Link>
                        </li>
                        <li>
                          <Link href="/services/fire-pit-installation" className="text-sm text-muted-foreground hover:text-primary">
                            Fire Pit Installation →
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

          {/* Testimonials */}
          <section className="py-16 md:py-24 bg-muted/30">
            <div className="container px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12 space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-pond-reviews-heading">
                    What Our Customers Say
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Real reviews from pond installation customers in the Treasure Valley
                  </p>
                </div>
                <Testimonials serviceType="pond-installation" limit={16} />
              </div>
            </div>
          </section>
  
        <section id="quote" className="py-16 bg-muted/30">
          <div className="container px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Get Your Free Pond Quote</h2>
                <p className="text-lg text-muted-foreground">
                  Tell us about your water feature project
                </p>
              </div>
              <SimpleQuoteWizard preselectedService="pond" />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
