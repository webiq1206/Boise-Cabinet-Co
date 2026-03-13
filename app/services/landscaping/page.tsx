import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Testimonials } from "@/components/Testimonials";
import { SimpleQuoteWizard } from "@/components/SimpleQuoteWizard";
import { Hammer, Fence, Droplets, Flame, Lightbulb, Mountain, TreeDeciduous } from "lucide-react";
import { generateServiceSchema, generateBreadcrumbSchema, generateLocalBusinessSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Professional Landscaping Services in Kuna & Boise | Lawn Care Kuna",
  description: "Complete landscaping solutions in Kuna, Boise, Meridian, Eagle & the Treasure Valley. Patios, retaining walls, irrigation, water features, fencing, landscape lighting & more. Transform your outdoor space today!",
  keywords: ["landscaping", "landscape design", "patio installation", "retaining walls", "irrigation systems", "water features", "Kuna landscaping", "Boise landscaping", "Meridian landscaping"],
  openGraph: {
    title: "Professional Landscaping Services | Lawn Care Kuna",
    description: "Complete landscaping solutions from design to installation across the Treasure Valley.",
    url: "/services/landscaping",
    type: "website",
  },
  alternates: {
    canonical: "/services/landscaping",
  },
};

const categories = [
  {
    icon: TreeDeciduous,
    title: "Softscaping",
    description: "Sod, plants, mulching, and garden bed installation",
    services: [
      { name: "Sod Installation", href: "/services/sod-installation" },
      { name: "Plant Installation", href: "/services/plant-installation" },
      { name: "Mulching Services", href: "/services/mulching" },
      { name: "Garden Beds", href: "/services/garden-bed-installation" },
    ],
  },
  {
    icon: Hammer,
    title: "Hardscaping",
    description: "Patios, walkways, retaining walls, and concrete work",
    services: [
      { name: "Patio Installation", href: "/services/patio-installation" },
      { name: "Retaining Walls", href: "/services/retaining-walls" },
      { name: "Walkways", href: "/services/walkway-installation" },
      { name: "Driveways", href: "/services/driveway-installation" },
    ],
  },
  {
    icon: Droplets,
    title: "Water Features",
    description: "Ponds, fountains, waterfalls, and streams",
    services: [
      { name: "Pond Installation", href: "/services/pond-installation" },
      { name: "Fountain Installation", href: "/services/fountain-installation" },
      { name: "Waterfall Construction", href: "/services/waterfall-installation" },
      { name: "Koi Ponds", href: "/services/koi-pond" },
    ],
  },
  {
    icon: Flame,
    title: "Fire Features",
    description: "Fire pits, outdoor fireplaces, and fire bowls",
    services: [
      { name: "Fire Pit Installation", href: "/services/fire-pit-installation" },
      { name: "Outdoor Fireplaces", href: "/services/outdoor-fireplace" },
      { name: "Gas Fire Pits", href: "/services/gas-fire-pit" },
      { name: "Fire Bowls", href: "/services/fire-bowl" },
    ],
  },
  {
    icon: Fence,
    title: "Outdoor Structures",
    description: "Fencing, gates, pergolas, and gazebos",
    services: [
      { name: "Fence Installation", href: "/services/fence-installation" },
      { name: "Gate Installation", href: "/services/gate-installation" },
      { name: "Pergola Installation", href: "/services/pergola-installation" },
      { name: "Gazebos", href: "/services/gazebo-installation" },
    ],
  },
  {
    icon: Lightbulb,
    title: "Landscape Lighting",
    description: "Pathway, accent, and security lighting",
    services: [
      { name: "Landscape Lighting", href: "/services/landscape-lighting" },
      { name: "Pathway Lighting", href: "/services/pathway-lighting" },
      { name: "LED Lighting", href: "/services/led-landscape-lighting" },
      { name: "Security Lighting", href: "/services/security-lighting" },
    ],
  },
  {
    icon: Droplets,
    title: "Irrigation Systems",
    description: "Sprinkler systems and drip irrigation",
    services: [
      { name: "Sprinkler Installation", href: "/services/sprinkler-system-installation" },
      { name: "Drip Irrigation", href: "/services/drip-irrigation" },
      { name: "Smart Controllers", href: "/services/smart-irrigation" },
      { name: "Irrigation Repair", href: "/services/irrigation-maintenance" },
    ],
  },
  {
    icon: Mountain,
    title: "Rock & Gravel",
    description: "Decorative rock, river rock, and gravel installation",
    services: [
      { name: "River Rock", href: "/services/river-rock" },
      { name: "Decorative Rock", href: "/services/decorative-rock" },
      { name: "Rock Gardens", href: "/services/rock-garden" },
      { name: "Dry Creek Beds", href: "/services/dry-creek-bed" },
    ],
  },
];

export default function LandscapingPage() {
  const serviceSchema = generateServiceSchema(
    "Landscaping Services",
    "Complete landscaping solutions including patios, retaining walls, irrigation systems, water features, fencing, and landscape lighting for residential and commercial properties in Kuna, Boise, Meridian, and the Treasure Valley."
  );
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
    { name: "Landscaping", url: "/services/landscaping" },
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
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">Professional Landscaping Services</h1>
              <p className="text-lg text-muted-foreground">
                Complete landscaping solutions from design to installation across the Treasure Valley
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" asChild>
                  <a href="#quote">
                    Get Free Quote
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="bg-gradient-to-br from-primary/10 to-white border-primary/20 text-primary" asChild>
                  <a href="tel:2083522011">
                    Call (208) 352-2011
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="py-16">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg text-muted-foreground">
                Transform your outdoor space with our comprehensive landscaping services. From beautiful patios and retaining walls to tranquil water features and stunning landscape lighting, we bring your vision to life.
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">Landscaping Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                        <category.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <CardDescription className="text-sm">{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.services.map((service) => (
                          <li key={service.href}>
                            <Link href={service.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                              {service.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Popular Services */}
        <section className="py-16 md:py-24">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">Popular Landscaping Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/services/patio-installation">
                  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle>Patio Installation</CardTitle>
                      <CardDescription>
                        Beautiful pavers, stamped concrete, and natural stone patios for outdoor living
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
                <Link href="/services/retaining-walls">
                  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle>Retaining Walls</CardTitle>
                      <CardDescription>
                        Functional and attractive retaining walls for slope management and landscaping
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
                <Link href="/services/pond-installation">
                  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle>Water Features</CardTitle>
                      <CardDescription>
                        Ponds, fountains, and waterfalls to create peaceful outdoor retreats
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </section>
          {/* Testimonials */}
          <section className="py-16 md:py-24 bg-muted/30">
            <div className="container px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12 space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-landscaping-reviews-heading">
                    What Our Customers Say
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Real reviews from landscaping customers in the Treasure Valley
                  </p>
                </div>
                <Testimonials serviceType="landscaping" limit={16} />
              </div>
            </div>
          </section>
  

        {/* Quote Form */}
        <section id="quote" className="py-16 md:py-24 bg-muted/30">
          <div className="container px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Get Your Free Landscaping Quote</h2>
                <p className="text-lg text-muted-foreground">
                  Tell us about your landscaping project and we&apos;ll provide a detailed estimate
                </p>
              </div>
              <SimpleQuoteWizard preselectedService="landscaping" />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
