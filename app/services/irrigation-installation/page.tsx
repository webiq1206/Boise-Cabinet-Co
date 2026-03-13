import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Testimonials } from "@/components/Testimonials";
import { SimpleQuoteWizard } from "@/components/SimpleQuoteWizard";
import { CheckCircle2, Droplets, Shield, Award } from "lucide-react";
import { generateServiceSchema, generateBreadcrumbSchema, generateLocalBusinessSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Sprinkler & Irrigation Systems Kuna & Boise Idaho | Install & Repair",
  description: "Irrigation system installation, repair & maintenance in Kuna, Boise, Meridian & Treasure Valley. Sprinkler systems, smart controllers, winterization. Licensed. Call (208) 352-2011!",
  openGraph: {
    title: "Irrigation & Sprinkler Systems | Lawn Care Kuna",
    description: "Sprinkler system design, installation, and repair across the Treasure Valley. Free quotes!",
    url: "https://lawncarekuna.com/services/irrigation-installation",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Irrigation & Sprinkler Systems | Lawn Care Kuna",
    description: "Sprinkler system design, installation, and repair across the Treasure Valley.",
  },
  alternates: {
    canonical: "https://lawncarekuna.com/services/irrigation-installation",
  },
};

export default function IrrigationInstallationPage() {
  const serviceSchema = generateServiceSchema(
    "Irrigation Systems",
    "Professional sprinkler system design, installation, repair, and maintenance for residential and commercial properties in Kuna, Boise, Meridian, and the Treasure Valley."
  );
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
    { name: "Landscaping", url: "/services/landscaping" },
    { name: "Irrigation Installation", url: "/services/irrigation-installation" },
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
              <span className="text-foreground">Irrigation Installation</span>
            </div>
          </div>
        </div>

        <section className="relative py-16 bg-gradient-to-b from-primary/10 to-background">
          <div className="container px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">Irrigation Systems in Kuna & Boise</h1>
              <p className="text-lg text-muted-foreground">
                Professional sprinkler system design, installation, and repair across the Treasure Valley
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
                    <h2>Expert Irrigation System Services</h2>
                    <p>
                      Keep your lawn green and healthy all summer long with a professionally installed and maintained irrigation system. We design, install, repair, and maintain sprinkler systems tailored to Idaho&apos;s unique climate and soil conditions.
                    </p>
                    <p>
                      Our irrigation systems deliver the right amount of water to every zone of your lawn and landscape, reducing waste while ensuring optimal plant health. From simple residential sprinkler systems to complex multi-zone commercial installations, we handle it all.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-4">Irrigation Services We Offer</h2>
                    <div className="space-y-4">
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg mb-2">New System Installation</h3>
                          <p className="text-muted-foreground mb-3">
                            Complete irrigation system design and installation customized for your property&apos;s specific needs.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Custom zone design</li>
                            <li>• Hunter and Rain Bird systems</li>
                            <li>• Smart controller installation</li>
                            <li>• Water-efficient sprinkler heads</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg mb-2">System Repair & Maintenance</h3>
                          <p className="text-muted-foreground mb-3">
                            Keep your irrigation system running efficiently with professional repairs and seasonal maintenance.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Broken pipe and head repair</li>
                            <li>• Valve replacement</li>
                            <li>• Controller programming</li>
                            <li>• Leak detection and repair</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg mb-2">Winterization & Spring Startup</h3>
                          <p className="text-muted-foreground mb-3">
                            Protect your investment with proper fall blowouts and spring system activation.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Complete system blowout</li>
                            <li>• Backflow testing & certification</li>
                            <li>• Spring system startup</li>
                            <li>• Zone-by-zone testing</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg mb-2">Smart Controller Upgrades</h3>
                          <p className="text-muted-foreground mb-3">
                            Reduce water waste and lower costs with WiFi-enabled smart irrigation controllers.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Rachio and Rain Bird WiFi controllers</li>
                            <li>• Weather-based watering adjustments</li>
                            <li>• Mobile app control</li>
                            <li>• Water usage tracking</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-6 rounded-md">
                    <h2 className="text-2xl font-bold mb-4">Service Areas</h2>
                    <p className="mb-4 text-muted-foreground">
                      Professional irrigation services available in:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Kuna', 'Boise', 'Meridian', 'Eagle', 'Star', 'Middleton'].map((city) => (
                        <Button key={city} variant="outline" size="sm" className="bg-gradient-to-br from-primary/10 to-white border-primary/20 text-primary" asChild>
                          <Link href={`/services/irrigation-installation/${city.toLowerCase()}`}>{city}</Link>
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
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <Award className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium">Irrigation Experts</p>
                              <p className="text-sm text-muted-foreground">7+ years experience</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium">Quality Equipment</p>
                              <p className="text-sm text-muted-foreground">Hunter & Rain Bird systems</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium">Warranty</p>
                              <p className="text-sm text-muted-foreground">Satisfaction guaranteed</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-2">Get a Free Quote</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Call us for a free irrigation consultation and quote.
                        </p>
                        <Button className="w-full" size="lg" asChild>
                          <a href="tel:2083522011">(208) 352-2011</a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">Benefits of Professional Irrigation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Droplets className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-2">Water Efficiency</h3>
                    <p className="text-sm text-muted-foreground">
                      Smart irrigation systems use 30-50% less water than manual watering while keeping your lawn healthier.
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <CheckCircle2 className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-2">Time Savings</h3>
                    <p className="text-sm text-muted-foreground">
                      Set it and forget it. Your lawn gets watered automatically on the optimal schedule.
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Award className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-2">Healthier Lawns</h3>
                    <p className="text-sm text-muted-foreground">
                      Consistent, deep watering promotes stronger root systems and more drought-resistant turf.
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Shield className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-2">Property Value</h3>
                    <p className="text-sm text-muted-foreground">
                      A well-designed irrigation system is a valuable asset that increases your home&apos;s market value.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

          {/* Testimonials */}
          <section className="py-16 md:py-24 bg-muted/30">
            <div className="container px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12 space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-irrigation-reviews-heading">
                    What Our Customers Say
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Real reviews from irrigation customers in the Treasure Valley
                  </p>
                </div>
                <Testimonials serviceType="irrigation-maintenance" limit={16} />
              </div>
            </div>
          </section>
  
        <section id="quote" className="py-16">
          <div className="container px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Get Your Free Irrigation Quote</h2>
                <p className="text-lg text-muted-foreground">
                  Tell us about your irrigation needs
                </p>
              </div>
              <SimpleQuoteWizard preselectedService="irrigation" />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
