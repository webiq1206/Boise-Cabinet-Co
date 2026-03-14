import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Scissors, TreeDeciduous, Snowflake, Droplets } from "lucide-react";
import { PRIORITY_SERVICES } from "@/shared/contentData";

export const metadata: Metadata = {
  title: "Lawn Care & Landscaping in Kuna, Idaho",
  description: "All lawn care, landscaping & seasonal services in Kuna, Boise & Treasure Valley. Mowing, patios, fencing, lights & more. Free quotes!",
  alternates: {
    canonical: "https://lawncarekuna.com/services",
  },
  openGraph: {
    title: "Lawn Care & Landscaping Services | Lawn Care Kuna",
    description: "Full range of lawn care, landscaping, irrigation, and seasonal services for the Treasure Valley. Free quotes!",
    url: "https://lawncarekuna.com/services",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Lawn Care & Landscaping Services | Lawn Care Kuna",
    description: "All lawn care, landscaping & seasonal services in Kuna, Boise & Treasure Valley. Free quotes!",
  },
};

// Group services by category
const serviceCategories = [
  {
    title: "Lawn Care",
    icon: Scissors,
    description: "Keep your lawn healthy and beautiful year-round",
    services: PRIORITY_SERVICES.filter(s => 
      ['lawn-mowing', 'aeration', 'fertilization', 'weed-control', 'dethatching', 'overseeding', 'lawn-edging', 'lawn-renovation'].includes(s.slug)
    ),
  },
  {
    title: "Landscaping",
    icon: TreeDeciduous,
    description: "Transform your outdoor space with professional landscaping",
    services: PRIORITY_SERVICES.filter(s => 
      ['patio-installation', 'retaining-walls', 'fire-pit-installation', 'hedge-trimming', 'mulch-installation', 'sod-installation'].includes(s.slug)
    ),
  },
  {
    title: "Seasonal & Specialty",
    icon: Snowflake,
    description: "Seasonal services to keep your property pristine",
    services: PRIORITY_SERVICES.filter(s => 
      ['spring-cleanup', 'fall-cleanup', 'snow-removal', 'christmas-light-installation', 'tree-trimming', 'tree-removal', 'stump-grinding'].includes(s.slug)
    ),
  },
  {
    title: "Irrigation & Lighting",
    icon: Droplets,
    description: "Efficient irrigation and beautiful landscape lighting",
    services: PRIORITY_SERVICES.filter(s => 
      ['sprinkler-system-installation', 'sprinkler-repair', 'irrigation-repair', 'irrigation-maintenance', 'sprinkler-blowout', 'landscape-lighting'].includes(s.slug)
    ),
  },
];

export default function ServicesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Lawn Care &amp; Landscaping Services in Kuna, Idaho</h1>
            <p className="text-lg text-muted-foreground">
              Professional lawn mowing, landscaping, irrigation, and seasonal services for the Treasure Valley
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto space-y-16">
            {serviceCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold">{category.title}</h2>
                    <p className="text-muted-foreground">{category.description}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.services.map((service) => (
                    <Card key={service.slug} className="hover-elevate">
                      <CardHeader>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <CardDescription>{service.shortDescription}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full bg-gradient-to-br from-primary/10 to-white border-primary/20 text-primary" asChild>
                          <Link href={`/services/${service.slug}`}>
                            Explore {service.name}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-br from-green-950 via-primary to-green-700 text-white p-10 md:p-16 text-center space-y-8 shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Need Help Choosing a Service?
            </h2>
            <p className="text-lg text-white/85 leading-relaxed max-w-2xl mx-auto">
              Contact us for a free consultation. We'll assess your property and recommend the best services for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="bg-white text-green-900 hover:bg-white/90 border-0" asChild>
                <Link href="/get-quote">
                  Get Your Free Lawn Care Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 text-white bg-white/10 backdrop-blur-sm" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
