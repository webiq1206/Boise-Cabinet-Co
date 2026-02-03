import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SimpleQuoteWizard } from "@/components/SimpleQuoteWizard";
import { Landmark, CheckCircle2, Shield, Award } from "lucide-react";
import { generateWebPageSchema, generateBreadcrumbSchema, generateLocalBusinessSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Municipal Lawn Care & Landscaping Services | Lawn Care Kuna",
  description: "Professional grounds maintenance for parks, government facilities, schools, and public spaces across the Treasure Valley. Licensed, bonded, and fully insured.",
  openGraph: {
    title: "Municipal Lawn Care & Landscaping Services | Lawn Care Kuna",
    description: "Professional grounds maintenance for parks, government facilities, and public spaces.",
    url: "/commercial/municipal-services",
    type: "website",
  },
};

const webPageSchema = generateWebPageSchema({
  title: "Municipal Lawn Care & Landscaping Services",
  description: "Professional grounds maintenance for parks, government facilities, and public spaces.",
  url: "/commercial/municipal-services",
});

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Commercial", url: "/commercial" },
  { name: "Municipal Services", url: "/commercial/municipal-services" },
]);

const localBusinessSchema = generateLocalBusinessSchema();

export default function MunicipalServicesPage() {
  return (
    <>
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
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
        <section className="relative py-16 bg-gradient-to-b from-primary/10 to-background">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <Landmark className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">Municipal Lawn Care & Landscaping Services</h1>
              <p className="text-lg text-muted-foreground">
                Professional grounds maintenance for parks, government facilities, and public spaces
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="prose prose-lg max-w-none">
                    <h2>Trusted Municipal Grounds Maintenance</h2>
                    <p className="text-muted-foreground">
                      We provide comprehensive lawn care and landscaping services for municipalities, government agencies, schools, and public facilities throughout the Treasure Valley. Our team understands the importance of maintaining public spaces that reflect community pride and serve residents well.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-4">Municipal Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { title: "Park Maintenance", desc: "Regular mowing, edging, and care for public parks" },
                        { title: "Government Facilities", desc: "Grounds keeping for city buildings and offices" },
                        { title: "Sports Fields", desc: "Athletic field maintenance and turf management" },
                        { title: "School Grounds", desc: "Campus lawn care and landscape services" },
                        { title: "Public Gardens", desc: "Ornamental bed maintenance and planting" },
                        { title: "Trail Maintenance", desc: "Walking path and greenway upkeep" },
                      ].map((service, index) => (
                        <Card key={index} className="hover-elevate">
                          <CardContent className="p-6">
                            <h3 className="font-semibold mb-2">{service.title}</h3>
                            <p className="text-sm text-muted-foreground">{service.desc}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="bg-muted/50 p-6 rounded-md">
                    <h3 className="text-xl font-bold mb-4">Municipal Qualifications</h3>
                    <ul className="space-y-2">
                      {[
                        "Licensed and bonded contractor",
                        "Comprehensive liability insurance",
                        "Public works experience",
                        "Background-checked employees",
                        "OSHA safety compliance",
                        "Contract bidding experience",
                      ].map((qual, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                          <span>{qual}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <Card className="sticky top-20">
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Why Municipalities Choose Us</h3>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <div className="font-medium">Fully Compliant</div>
                              <div className="text-muted-foreground">All certifications & insurance</div>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <Landmark className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <div className="font-medium">Public Works Experience</div>
                              <div className="text-muted-foreground">Serving since 2017</div>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <div className="font-medium">Dependable Service</div>
                              <div className="text-muted-foreground">On schedule, on budget</div>
                            </div>
                          </li>
                        </ul>
                      </div>
                      <div className="pt-4 border-t space-y-3">
                        <Link href="#quote" className="block">
                          <Button className="w-full" size="lg">Request Bid Information</Button>
                        </Link>
                        <Link href="/pricing" className="block">
                          <Button className="w-full" variant="outline" size="lg">View Pricing</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quote Form */}
        <section id="quote" className="py-16 bg-muted/30">
          <div className="container px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Request Municipal Services Information</h2>
                <p className="text-muted-foreground">
                  Tell us about your municipal property needs and we'll provide a detailed proposal
                </p>
              </div>
              <SimpleQuoteWizard />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
