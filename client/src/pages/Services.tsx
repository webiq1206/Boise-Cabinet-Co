import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Scissors, 
  Sprout, 
  Droplets, 
  Shield, 
  Trees, 
  Fence, 
  Sparkles,
  Mountain,
  Waves,
  Flame,
  Lightbulb,
  Building2,
  ArrowRight
} from "lucide-react";
import { PRIORITY_SERVICES } from "@shared/contentData";

// Service icons mapping
const serviceIcons: Record<string, React.ElementType> = {
  'lawn-mowing': Scissors,
  'aeration': Sprout,
  'fertilization': Droplets,
  'weed-control': Shield,
  'lawn-maintenance': Scissors,
  'hedge-trimming': Trees,
  'seasonal-cleanup': Trees,
  'landscaping': Trees,
  'fence-installation': Fence,
  'patio-installation': Mountain,
  'pond-installation': Waves,
  'irrigation-installation': Droplets,
  'christmas-lights': Sparkles,
};

// Default icon if not found
const DefaultIcon = Trees;

export default function Services() {
  // Organize services by category
  const lawnCareServices = PRIORITY_SERVICES.filter(s => s.category === 'lawn-care');
  const landscapingServices = PRIORITY_SERVICES.filter(s => s.category.startsWith('landscaping-'));
  const christmasServices = PRIORITY_SERVICES.filter(s => s.category === 'christmas-lights');
  const commercialServices = [
    {
      slug: 'commercial',
      name: 'Commercial Lawn Care',
      category: 'commercial',
      shortDescription: 'Professional landscape maintenance for businesses, offices, and retail centers'
    },
    {
      slug: 'commercial/hoa-services',
      name: 'HOA Services',
      category: 'commercial',
      shortDescription: 'Comprehensive landscape management for homeowner associations'
    },
  ];

  const ServiceCard = ({ service }: { service: { slug: string; name: string; shortDescription: string } }) => {
    const Icon = serviceIcons[service.slug] || DefaultIcon;
    
    return (
      <Link href={`/services/${service.slug}`}>
        <Card className="hover-elevate transition-all duration-200 cursor-pointer h-full" data-testid={`service-card-${service.slug}`}>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">{service.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {service.shortDescription}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </Link>
    );
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Professional Lawn Care & Landscaping Services | Lawn Care Kuna</title>
        <meta 
          name="description" 
          content="Comprehensive lawn care and landscaping services in Kuna, Boise, and Meridian, Idaho. From weekly mowing to landscape design, irrigation, hardscaping, and Christmas lights - we do it all." 
        />
        <meta property="og:title" content="Professional Lawn Care & Landscaping Services | Lawn Care Kuna" />
        <meta property="og:description" content="Comprehensive lawn care and landscaping services in Kuna, Boise, and Meridian, Idaho. From weekly mowing to landscape design, irrigation, hardscaping, and Christmas lights - we do it all." />
      </Helmet>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-2">
              Our Services
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Complete Lawn Care & Landscaping Solutions
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              From routine lawn maintenance to complete landscape transformations, we provide professional services throughout Idaho's Treasure Valley. Serving Kuna, Boise, Meridian, Nampa, Caldwell, and Eagle with reliable, high-quality results.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button size="lg" asChild data-testid="button-get-quote">
                <Link href="/get-quote">
                  Get Free Estimate
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-contact">
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Lawn Care Services */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Lawn Care Services
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Keep your lawn healthy, green, and beautiful year-round with our professional lawn care services tailored to Idaho's unique climate and soil conditions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {lawnCareServices.map((service) => (
                <ServiceCard key={service.slug} service={service} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Landscaping Services */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Landscaping & Installation Services
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Transform your outdoor spaces with professional landscaping, hardscaping, irrigation, and specialty installations designed to enhance your property's beauty and value.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {landscapingServices.map((service) => (
                <ServiceCard key={service.slug} service={service} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Christmas Lights */}
      {christmasServices.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-8">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Holiday Lighting Services
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Make your home shine this holiday season with professional Christmas light installation and removal services. We handle everything from design to takedown.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {christmasServices.map((service) => (
                  <ServiceCard key={service.slug} service={service} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Commercial Services */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Commercial & HOA Services
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Professional landscape maintenance solutions for businesses, property managers, and homeowner associations. Reliable service that keeps your commercial properties looking their best.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {commercialServices.map((service) => (
                <Link key={service.slug} href={`/${service.slug}`}>
                  <Card className="hover-elevate transition-all duration-200 cursor-pointer h-full" data-testid={`service-card-${service.slug}`}>
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <Building2 className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{service.name}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {service.shortDescription}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Serving Idaho's Treasure Valley
            </h2>
            <p className="text-lg text-muted-foreground">
              We proudly provide professional lawn care and landscaping services to homeowners and businesses throughout the greater Boise area.
            </p>
            <div className="flex flex-wrap gap-3 justify-center text-sm">
              {['Kuna', 'Boise', 'Meridian', 'Nampa', 'Caldwell', 'Eagle'].map((city) => (
                <Link key={city} href={`/areas/${city.toLowerCase()}`}>
                  <div className="px-4 py-2 bg-card border rounded-md hover-elevate cursor-pointer" data-testid={`city-link-${city.toLowerCase()}`}>
                    {city}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to Transform Your Outdoor Space?
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Get a free, no-obligation estimate for any of our services. We'll assess your property and provide a detailed quote tailored to your specific needs.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button size="lg" variant="secondary" asChild data-testid="button-cta-quote">
                <Link href="/get-quote">
                  Get Free Estimate
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" data-testid="button-cta-contact">
                <Link href="/contact">
                  Contact Us Today
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
