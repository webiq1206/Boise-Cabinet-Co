import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Testimonials } from "@/components/Testimonials";
import { SimpleQuoteWizard } from "@/components/SimpleQuoteWizard";
import { CheckCircle2, Fence, Shield } from "lucide-react";
import { generateServiceSchema, generateBreadcrumbSchema, generateLocalBusinessSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Fence Installation Kuna & Boise Idaho | Wood, Vinyl & Chain Link",
  description: "Fence installation in Kuna, Boise & Treasure Valley. Wood, vinyl, chain link options. Licensed & insured. Call (208) 352-2011 for a free quote!",
  openGraph: {
    title: "Fence Installation in Kuna & Boise | Lawn Care Kuna",
    description: "Wood, vinyl, and chain link fence installation across the Treasure Valley. Free quotes!",
    url: "https://lawncarekuna.com/services/fence-installation",
    type: "website",
  },
  alternates: {
    canonical: "https://lawncarekuna.com/services/fence-installation",
  },
};

export default function FenceInstallationPage() {
  const serviceSchema = generateServiceSchema(
    "Fence Installation",
    "Professional wood, vinyl, chain link, and decorative fence installation for residential and commercial properties in Kuna, Boise, Meridian, and the Treasure Valley."
  );
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
    { name: "Landscaping", url: "/services/landscaping" },
    { name: "Fence Installation", url: "/services/fence-installation" },
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
              <span className="text-foreground">Fence Installation</span>
            </div>
          </div>
        </div>

        <section className="relative py-16 bg-gradient-to-b from-primary/10 to-background">
          <div className="container px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">Fence Installation in Kuna & Boise</h1>
              <p className="text-lg text-muted-foreground">
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
                    <h2>Expert Fence Installation Services</h2>
                    <p>
                      Enhance your property&apos;s privacy, security, and curb appeal with a professionally installed fence. We offer wood fences, vinyl fences, chain link fences, and decorative fencing options to meet your specific needs and budget.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-4">Fence Types We Install</h2>
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
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <h3 className="font-semibold text-lg mb-3">{type.title}</h3>
                            <ul className="space-y-1">
                              {type.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm">
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
                    <h2 className="text-2xl font-bold mb-4">Service Areas</h2>
                    <div className="flex flex-wrap gap-2">
                      {['Kuna', 'Boise', 'Meridian', 'Eagle', 'Star', 'Middleton'].map((city) => (
                        <Button key={city} variant="outline" size="sm" className="bg-gradient-to-br from-primary/10 to-white border-primary/20 text-primary" asChild>
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
                        <h3 className="font-semibold text-lg mb-3">Why Choose Us</h3>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <Fence className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <div className="font-medium">Expert Installation</div>
                              <div className="text-muted-foreground">7+ years experience</div>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <div className="font-medium">Fully Insured</div>
                              <div className="text-muted-foreground">Licensed & bonded</div>
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
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-fence-reviews-heading">
                    What Our Customers Say
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Real reviews from fence installation customers in the Treasure Valley
                  </p>
                </div>
                <Testimonials serviceType="fence-installation" limit={16} />
              </div>
            </div>
          </section>
  
        <section id="quote" className="py-16 bg-muted/30">
          <div className="container px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Get Your Free Fence Quote</h2>
              </div>
              <SimpleQuoteWizard preselectedService="fence" />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
