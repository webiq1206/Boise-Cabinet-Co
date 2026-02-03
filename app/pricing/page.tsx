import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing | Lawn Care Kuna",
  description: "Transparent pricing for lawn care and landscaping services in Kuna, Idaho. View our service rates and get a free custom quote.",
  openGraph: {
    title: "Lawn Care Pricing | Lawn Care Kuna",
    description: "Transparent, competitive pricing for lawn care services in the Treasure Valley.",
    url: "/pricing",
    type: "website",
  },
};

const pricingCategories = [
  {
    title: "Lawn Care",
    description: "Regular maintenance services",
    services: [
      { name: "Lawn Mowing", price: "Starting at $35", note: "Based on lawn size" },
      { name: "Lawn Edging", price: "Starting at $15", note: "Add-on to mowing" },
      { name: "Fertilization", price: "Starting at $50", note: "Per application" },
      { name: "Weed Control", price: "Starting at $50", note: "Per treatment" },
      { name: "Aeration", price: "Starting at $75", note: "Annual service" },
      { name: "Overseeding", price: "Starting at $100", note: "Includes seed" },
    ],
  },
  {
    title: "Seasonal Services",
    description: "Spring, fall, and winter care",
    services: [
      { name: "Spring Cleanup", price: "Starting at $150", note: "Full yard cleanup" },
      { name: "Fall Cleanup", price: "Starting at $175", note: "Leaf removal included" },
      { name: "Snow Removal", price: "Starting at $50", note: "Per service" },
      { name: "Christmas Lights", price: "Custom Quote", note: "Design & install" },
    ],
  },
  {
    title: "Landscaping",
    description: "Design and installation",
    services: [
      { name: "Patio Installation", price: "Custom Quote", note: "Free consultation" },
      { name: "Retaining Walls", price: "Custom Quote", note: "Free consultation" },
      { name: "Sod Installation", price: "Starting at $1/sq ft", note: "Includes prep" },
      { name: "Mulch Installation", price: "Starting at $75/yard", note: "Delivery included" },
    ],
  },
  {
    title: "Irrigation",
    description: "System installation and repair",
    services: [
      { name: "Sprinkler Repair", price: "Starting at $75", note: "Plus parts" },
      { name: "Sprinkler Blowout", price: "Starting at $65", note: "Winterization" },
      { name: "New System Install", price: "Custom Quote", note: "Free design" },
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Pricing</h1>
            <p className="text-lg text-muted-foreground">
              Transparent, competitive pricing for all our lawn care services
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            {pricingCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">{category.title}</h2>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {category.services.map((service, index) => (
                        <div 
                          key={index} 
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2"
                        >
                          <div>
                            <span className="font-medium">{service.name}</span>
                            {service.note && (
                              <span className="text-sm text-muted-foreground ml-2">({service.note})</span>
                            )}
                          </div>
                          <span className="text-primary font-semibold">{service.price}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Prices shown are starting rates and may vary based on property size, 
                  condition, and specific requirements. Contact us for a detailed quote tailored to your property.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Get Your Custom Quote
            </h2>
            <p className="text-xl text-primary-foreground leading-relaxed">
              Every property is unique. Contact us for a free, detailed quote based on your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/get-quote">
                  Get Free Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" 
                asChild
              >
                <a href="tel:2083522011">Call (208) 352-2011</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
