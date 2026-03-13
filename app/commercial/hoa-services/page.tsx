import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleQuoteWizard } from "@/components/SimpleQuoteWizard";
import { Building2, CheckCircle2, FileCheck, Users, Calendar, Shield } from "lucide-react";
import { generateWebPageSchema, generateBreadcrumbSchema, generateLocalBusinessSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "HOA Landscaping Services | Lawn Care Kuna",
  description: "Professional landscape maintenance and management for homeowners associations across the Treasure Valley. Multi-property expertise, budget-friendly solutions, and dedicated account management.",
  alternates: {
    canonical: "https://lawncarekuna.com/commercial/hoa-services",
  },
  openGraph: {
    title: "HOA Landscaping Services | Lawn Care Kuna",
    description: "Professional landscape maintenance for homeowners associations across the Treasure Valley.",
    url: "/commercial/hoa-services",
    type: "website",
  },
};

const webPageSchema = generateWebPageSchema({
  title: "HOA Landscaping Services",
  description: "Professional landscape maintenance for homeowners associations across the Treasure Valley.",
  url: "/commercial/hoa-services",
});

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Commercial", url: "/commercial" },
  { name: "HOA Services", url: "/commercial/hoa-services" },
]);

const localBusinessSchema = generateLocalBusinessSchema();

export default function HOAServicesPage() {
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
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/10 to-background">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">HOA Landscaping Services</h1>
              <p className="text-lg text-muted-foreground">
                Professional landscape maintenance and management for homeowners associations across the Treasure Valley
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" asChild>
                  <Link href="#quote">Request Commercial Quote</Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-gradient-to-br from-primary/10 to-white border-primary/20 text-primary" asChild>
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-muted-foreground">
                  Since 2017, Lawn Care Kuna has been the trusted landscaping partner for homeowners associations throughout the Treasure Valley. We understand the unique challenges of HOA landscape management - from maintaining consistent quality across multiple properties to staying within budget constraints while meeting community standards.
                </p>
                <p className="text-lg text-muted-foreground">
                  Our comprehensive HOA services are designed to keep your common areas beautiful, enhance property values, and ensure compliance with your community's landscape standards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">Complete HOA Landscape Solutions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover-elevate">
                  <CardHeader>
                    <CardTitle>Common Area Maintenance</CardTitle>
                    <CardDescription>
                      Complete maintenance of all HOA common areas including lawns, landscaping, and irrigation
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="hover-elevate">
                  <CardHeader>
                    <CardTitle>Entrance Monuments</CardTitle>
                    <CardDescription>
                      Specialized care for community entrance monuments and landscaping features
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="hover-elevate">
                  <CardHeader>
                    <CardTitle>Seasonal Programs</CardTitle>
                    <CardDescription>
                      Spring and fall cleanup, seasonal color installation, and holiday decorating
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="hover-elevate">
                  <CardHeader>
                    <CardTitle>Irrigation Management</CardTitle>
                    <CardDescription>
                      Complete irrigation system maintenance, repairs, and seasonal adjustments
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="hover-elevate">
                  <CardHeader>
                    <CardTitle>Covenant Compliance</CardTitle>
                    <CardDescription>
                      Landscape services designed to maintain CC&R compliance and community standards
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="hover-elevate">
                  <CardHeader>
                    <CardTitle>Board Consultation</CardTitle>
                    <CardDescription>
                      Expert consultation on landscape improvements, budgeting, and long-term planning
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">Why HOAs Choose Lawn Care Kuna</h2>
              <div className="space-y-6">
                {[
                  {
                    title: "Multi-Property Expertise",
                    description: "We have extensive experience managing multiple HOA properties simultaneously, ensuring consistent quality across all locations.",
                  },
                  {
                    title: "Budget-Friendly Solutions",
                    description: "We work within your budget constraints while maintaining the highest quality standards. Detailed proposals and transparent pricing.",
                  },
                  {
                    title: "Dedicated Account Management",
                    description: "Each HOA receives a dedicated account manager who serves as your single point of contact for all landscape needs.",
                  },
                  {
                    title: "Detailed Reporting",
                    description: "Regular reports and photo documentation keep your board informed of all work performed and property conditions.",
                  },
                  {
                    title: "Flexible Contracts",
                    description: "Monthly, seasonal, or annual contracts available. We work with your HOA's needs and budget cycle.",
                  },
                  {
                    title: "Emergency Response",
                    description: "24/7 emergency service for irrigation failures, storm damage, and other urgent landscape issues.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-accent">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">HOA Service Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Customized Schedules</h3>
                  <p className="text-sm text-muted-foreground">
                    Maintenance schedules tailored to your community's specific needs and budget
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <FileCheck className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Documentation</h3>
                  <p className="text-sm text-muted-foreground">
                    Detailed work logs and photo documentation for board review and records
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Professional Crews</h3>
                  <p className="text-sm text-muted-foreground">
                    Uniformed, background-checked crews with commercial equipment
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Fully Insured</h3>
                  <p className="text-sm text-muted-foreground">
                    General liability and workers comp coverage for complete protection
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Multi-Location</h3>
                  <p className="text-sm text-muted-foreground">
                    Capability to service multiple HOA properties and portfolio management
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <FileCheck className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Budget Planning</h3>
                  <p className="text-sm text-muted-foreground">
                    Annual budget forecasting and long-term landscape planning assistance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Areas */}
        <section className="py-16">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">HOA Services Across the Treasure Valley</h2>
              <p className="text-lg text-muted-foreground mb-8">
                We serve homeowners associations in <Link href="/areas/kuna" className="text-primary hover:underline">Kuna</Link>, <Link href="/areas/boise" className="text-primary hover:underline">Boise</Link>, <Link href="/areas/meridian" className="text-primary hover:underline">Meridian</Link>, <Link href="/areas/eagle" className="text-primary hover:underline">Eagle</Link>, <Link href="/areas/star" className="text-primary hover:underline">Star</Link>, <Link href="/areas/middleton" className="text-primary hover:underline">Middleton</Link>, and surrounding communities
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {["Kuna", "Boise", "Meridian", "Eagle", "Star", "Middleton"].map((city) => (
                  <Button key={city} variant="outline" className="bg-gradient-to-br from-primary/10 to-white border-primary/20 text-primary" asChild>
                    <Link href={`/areas/${city.toLowerCase()}`}>{city}</Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Quote Form */}
        <section id="quote" className="py-16 md:py-24 bg-muted/30">
          <div className="container px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Request Your Commercial Quote</h2>
                <p className="text-lg text-muted-foreground">
                  Tell us about your HOA's landscape needs and we'll provide a detailed proposal
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
