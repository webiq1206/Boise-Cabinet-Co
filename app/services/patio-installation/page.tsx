import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Testimonials } from "@/components/Testimonials";
import { SimpleQuoteWizard } from "@/components/SimpleQuoteWizard";
import { Hammer, Shield, Award, DollarSign } from "lucide-react";
import { generateServiceSchema, generateBreadcrumbSchema, generateLocalBusinessSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Patio Installation in Kuna & Boise | Professional Paver & Concrete Patios",
  description: "Professional patio installation in Kuna, Boise, Meridian, Eagle & the Treasure Valley. Pavers, stamped concrete, natural stone patios. Expert design & installation for Idaho weather. Free quotes!",
  openGraph: {
    title: "Professional Patio Installation | Lawn Care Kuna",
    description: "Professional paver, stamped concrete, and natural stone patio installation across the Treasure Valley.",
    url: "/services/patio-installation",
    type: "website",
  },
  alternates: {
    canonical: "/services/patio-installation",
  },
};

export default function PatioInstallationPage() {
  const serviceSchema = generateServiceSchema(
    "Patio Installation",
    "Professional paver, stamped concrete, and natural stone patio installation for residential and commercial properties in Kuna, Boise, Meridian, and the Treasure Valley."
  );
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
    { name: "Landscaping", url: "/services/landscaping" },
    { name: "Patio Installation", url: "/services/patio-installation" },
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
              <span className="text-foreground">Patio Installation</span>
            </div>
          </div>
        </div>

        <section className="bg-primary text-primary-foreground py-16">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">Patio Installation in Kuna & Boise</h1>
              <p className="text-lg text-primary-foreground/90">
                Professional paver, stamped concrete, and natural stone patio installation across the Treasure Valley
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
                    <h2>Expert Patio Installation Services</h2>
                    <p>
                      Transform your backyard into a beautiful outdoor living space with a professionally installed patio. Whether you&apos;re looking for elegant pavers, durable stamped concrete, or timeless natural stone, we have the expertise to bring your vision to life.
                    </p>
                    <p>
                      Since 2017, we&apos;ve designed and installed hundreds of patios throughout the Treasure Valley. We understand Idaho&apos;s unique climate challenges - from freeze-thaw cycles to scorching summer heat - and use only materials and techniques proven to withstand our weather conditions.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-4">Types of Patios We Install</h2>
                    <div className="space-y-4">
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg mb-2">Paver Patios</h3>
                          <p className="text-muted-foreground mb-3">
                            Beautiful, durable pavers in a variety of colors, shapes, and patterns. Perfect for Idaho weather with excellent freeze-thaw resistance.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Concrete pavers</li>
                            <li>• Clay brick pavers</li>
                            <li>• Permeable pavers</li>
                            <li>• Custom patterns and designs</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg mb-2">Stamped Concrete Patios</h3>
                          <p className="text-muted-foreground mb-3">
                            Cost-effective option with the look of natural stone or pavers. Available in dozens of patterns and color options.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Stone patterns</li>
                            <li>• Brick patterns</li>
                            <li>• Wood plank patterns</li>
                            <li>• Custom colors and textures</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg mb-2">Natural Stone Patios</h3>
                          <p className="text-muted-foreground mb-3">
                            Elegant natural stone creates a timeless, upscale outdoor living space with unique character.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Flagstone</li>
                            <li>• Bluestone</li>
                            <li>• Slate</li>
                            <li>• Irregular or cut stone</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-4">Our Installation Process</h2>
                    <div className="space-y-4">
                      {[
                        {
                          title: 'Design Consultation',
                          description: 'We meet with you to discuss your vision, take measurements, and provide design recommendations based on your space and budget.',
                        },
                        {
                          title: 'Site Preparation',
                          description: 'Proper excavation and grading ensure long-lasting results. We create a solid base that can withstand Idaho\'s freeze-thaw cycles.',
                        },
                        {
                          title: 'Base Installation',
                          description: 'We install a compacted gravel base with proper drainage to prevent settling and water damage over time.',
                        },
                        {
                          title: 'Patio Installation',
                          description: 'Expert installation of your chosen materials with attention to detail and precise leveling for proper drainage.',
                        },
                        {
                          title: 'Finishing Touches',
                          description: 'Edge restraints, polymeric sand, or sealing (depending on material) to complete your beautiful new patio.',
                        },
                      ].map((step, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            {i + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">{step.title}</h3>
                            <p className="text-muted-foreground text-sm">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-muted/50 p-6 rounded-md">
                    <h2 className="text-2xl font-bold mb-4">Service Areas</h2>
                    <p className="mb-4 text-muted-foreground">
                      Professional patio installation available in:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Kuna', 'Boise', 'Meridian', 'Eagle', 'Star', 'Middleton'].map((city) => (
                        <Button key={city} variant="outline" size="sm" className="bg-gradient-to-br from-primary/10 to-white border-primary/20 text-primary" asChild>
                          <Link href={`/services/patio-installation/${city.toLowerCase()}`}>{city}</Link>
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
                            <Hammer className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <div className="font-medium">Expert Installation</div>
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
                          <li className="flex items-start gap-2">
                            <DollarSign className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <div className="font-medium">Fair Pricing</div>
                              <div className="text-muted-foreground">No hidden fees</div>
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
                            Get Free Quote
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
                          <Link href="/services/retaining-walls" className="text-sm text-muted-foreground hover:text-primary">
                            Retaining Walls →
                          </Link>
                        </li>
                        <li>
                          <Link href="/services/fire-pit-installation" className="text-sm text-muted-foreground hover:text-primary">
                            Fire Pit Installation →
                          </Link>
                        </li>
                        <li>
                          <Link href="/services/landscape-lighting" className="text-sm text-muted-foreground hover:text-primary">
                            Landscape Lighting →
                          </Link>
                        </li>
                        <li>
                          <Link href="/services/fence-installation" className="text-sm text-muted-foreground hover:text-primary">
                            Fence Installation →
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
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-patio-reviews-heading">
                    What Our Customers Say
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Real reviews from patio installation customers in the Treasure Valley
                  </p>
                </div>
                <Testimonials serviceType="patio-installation" limit={16} />
              </div>
            </div>
          </section>
  
        <section id="quote" className="py-16 bg-muted/30">
          <div className="container px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Get Your Free Patio Quote</h2>
                <p className="text-lg text-muted-foreground">
                  Tell us about your patio project
                </p>
              </div>
              <SimpleQuoteWizard preselectedService="patio" />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
