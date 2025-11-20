import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuoteWizard } from "@/components/QuoteWizard";
import { Building2, CheckCircle2, FileCheck, Users, Calendar, Shield } from "lucide-react";
import heroBackground from "@assets/Untitled design_1763639882299.png";

export default function HOAServices() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBackground} 
            alt="Professional HOA landscaping and grounds maintenance services in Idaho"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60"></div>
        </div>
        <div className="container px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-white" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">HOA Landscaping Services</h1>
            <p className="text-lg text-white/90">
              Professional landscape maintenance and management for homeowners associations across the Treasure Valley
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a href="#quote">
                <Button size="lg" variant="secondary">Request Commercial Quote</Button>
              </a>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                  View Pricing
                </Button>
              </Link>
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
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Multi-Property Expertise</h3>
                  <p className="text-muted-foreground">
                    We have extensive experience managing multiple HOA properties simultaneously, ensuring consistent quality across all locations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Budget-Friendly Solutions</h3>
                  <p className="text-muted-foreground">
                    We work within your budget constraints while maintaining the highest quality standards. Detailed proposals and transparent pricing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Dedicated Account Management</h3>
                  <p className="text-muted-foreground">
                    Each HOA receives a dedicated account manager who serves as your single point of contact for all landscape needs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Detailed Reporting</h3>
                  <p className="text-muted-foreground">
                    Regular reports and photo documentation keep your board informed of all work performed and property conditions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Flexible Contracts</h3>
                  <p className="text-muted-foreground">
                    Monthly, seasonal, or annual contracts available. We work with your HOA's needs and budget cycle.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Emergency Response</h3>
                  <p className="text-muted-foreground">
                    24/7 emergency service for irrigation failures, storm damage, and other urgent landscape issues.
                  </p>
                </div>
              </div>
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
              We serve homeowners associations in Kuna, Boise, Meridian, Nampa, Caldwell, Eagle, and surrounding communities
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Kuna', 'Boise', 'Meridian', 'Nampa', 'Caldwell', 'Eagle'].map((city) => (
                <Button key={city} variant="outline" asChild>
                  <Link href={`/commercial/hoa-services/${city.toLowerCase()}`}>{city} HOA Services</Link>
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
            <QuoteWizard />
          </div>
        </div>
      </section>
    </div>
  );
}
