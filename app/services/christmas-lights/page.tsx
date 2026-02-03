import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SimpleQuoteWizard } from "@/components/SimpleQuoteWizard";
import { CheckCircle2, Lightbulb, Home, Trees, Sparkles, Clock, Shield } from "lucide-react";
import { generateServiceSchema, generateBreadcrumbSchema, generateLocalBusinessSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Christmas Light Installation in Kuna & Boise | Professional Holiday Lighting",
  description: "Professional Christmas light installation, design, and removal services in Kuna, Boise, Meridian, Eagle & the Treasure Valley. Commercial-grade LED lights, full-service installation, maintenance & storage included. Book early!",
  keywords: ["Christmas lights", "holiday lighting", "Christmas light installation", "holiday decorations", "Kuna Christmas lights", "Boise Christmas lights", "professional light installation"],
  openGraph: {
    title: "Professional Christmas Light Installation | Lawn Care Kuna",
    description: "Professional holiday lighting design, installation, and maintenance for homes and businesses in the Treasure Valley.",
    url: "/services/christmas-lights",
    type: "website",
  },
  alternates: {
    canonical: "/services/christmas-lights",
  },
};

export default function ChristmasLightsPage() {
  const serviceSchema = generateServiceSchema(
    "Christmas Light Installation",
    "Professional Christmas light installation, design, maintenance, and removal services for residential and commercial properties in Kuna, Boise, Meridian, and the Treasure Valley."
  );
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
    { name: "Christmas Lights", url: "/services/christmas-lights" },
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
        {/* Hero */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/10 to-background">
          <div className="container px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">Christmas Light Installation</h1>
              <p className="text-lg text-muted-foreground">
                Professional holiday lighting design, installation, and maintenance for homes and businesses
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" asChild>
                  <a href="#quote">Get Free Quote</a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="tel:2083522011">
                    Call (208) 352-2011
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl font-bold mb-4">Complete Holiday Lighting Services</h2>
                <p className="text-lg text-muted-foreground">
                  From design to installation, maintenance, and removal - we handle everything
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Custom Design</h3>
                        <p className="text-sm text-muted-foreground">
                          We create custom lighting designs to match your vision and property style
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Home className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Roofline Lighting</h3>
                        <p className="text-sm text-muted-foreground">
                          Professional roofline installation with commercial-grade LED lights
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Trees className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Tree Wrapping</h3>
                        <p className="text-sm text-muted-foreground">
                          Beautiful tree wrapping and trunk lighting for stunning displays
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">LED Technology</h3>
                        <p className="text-sm text-muted-foreground">
                          Energy-efficient commercial-grade LED lights that last for years
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Maintenance</h3>
                        <p className="text-sm text-muted-foreground">
                          Bulb replacement and repair throughout the season at no extra charge
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Full Service</h3>
                        <p className="text-sm text-muted-foreground">
                          Complete installation, maintenance, removal, and storage included
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Consultation & Design</h3>
                    <p className="text-muted-foreground">
                      We meet with you to discuss your vision and create a custom lighting design for your property
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Professional Installation</h3>
                    <p className="text-muted-foreground">
                      Our experienced crew installs your lights safely and efficiently, typically within a day
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Enjoy the Season</h3>
                    <p className="text-muted-foreground">
                      Sit back and enjoy your beautiful holiday display. We handle any maintenance needed
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Complete Removal</h3>
                    <p className="text-muted-foreground">
                      After the holidays, we carefully remove and store your lights for next year
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Professional Installation?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Save Time & Hassle</h3>
                    <p className="text-sm text-muted-foreground">
                      No climbing ladders, untangling lights, or storage headaches
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Safety First</h3>
                    <p className="text-sm text-muted-foreground">
                      Professional installation eliminates dangerous ladder work and electrical hazards
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Professional Results</h3>
                    <p className="text-sm text-muted-foreground">
                      Beautiful, even displays that enhance your home&apos;s holiday appeal
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Commercial Quality</h3>
                    <p className="text-sm text-muted-foreground">
                      LED lights are brighter, more durable, and more energy-efficient
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Maintenance Included</h3>
                    <p className="text-sm text-muted-foreground">
                      We fix any issues throughout the season at no additional cost
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Full Service</h3>
                    <p className="text-sm text-muted-foreground">
                      Installation, maintenance, removal, and storage all included
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Areas */}
        <section className="py-16 bg-accent">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Serving the Treasure Valley</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Professional Christmas light installation available in Kuna, Boise, Meridian, Eagle, Star, Middleton, and surrounding areas
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {['Kuna', 'Boise', 'Meridian', 'Eagle', 'Star', 'Middleton'].map((city) => (
                  <Button key={city} variant="outline" asChild>
                    <Link href={`/services/christmas-lights/${city.toLowerCase()}`}>{city}</Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Quote Form */}
        <section id="quote" className="py-16 md:py-24">
          <div className="container px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Get Your Free Quote Today</h2>
                <p className="text-lg text-muted-foreground">
                  Book early for the holiday season! Available October through January
                </p>
              </div>
              <SimpleQuoteWizard preselectedService="christmas-lights" />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
