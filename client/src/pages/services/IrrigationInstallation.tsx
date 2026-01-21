import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SimpleQuoteWizard } from "@/components/SimpleQuoteWizard";
import { CheckCircle2, Droplets, Shield, Award } from "lucide-react";
import heroBackground from "@assets/Untitled design_1763639882299.png";

export default function IrrigationInstallation() {
  return (
    <div className="flex flex-col">
      <div className="border-b bg-muted/30">
        <div className="container px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" data-testid="breadcrumb-home">Home</Link>
            <span>/</span>
            <Link href="/services/landscaping" data-testid="breadcrumb-landscaping">Landscaping</Link>
            <span>/</span>
            <span className="text-foreground" data-testid="breadcrumb-current">Irrigation Installation</span>
          </div>
        </div>
      </div>

      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBackground} 
            alt="Professional irrigation system installation with healthy lawn in Kuna and Boise Idaho"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground" data-testid="heading-main">Irrigation Systems in Kuna & Boise</h1>
            <p className="text-lg text-muted-foreground" data-testid="text-subtitle">
              Professional sprinkler system design, installation, and repair across the Treasure Valley
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
                  <h2 data-testid="heading-intro">Expert Irrigation System Services</h2>
                  <p data-testid="text-intro-1">
                    Keep your lawn green and healthy all summer long with a professionally installed and maintained irrigation system. We design, install, repair, and maintain sprinkler systems tailored to Idaho's unique climate and soil conditions.
                  </p>
                  <p data-testid="text-intro-2">
                    Our irrigation systems deliver the right amount of water to every zone of your lawn and landscape, reducing waste while ensuring optimal plant health. From simple residential sprinkler systems to complex multi-zone commercial installations, we handle it all.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4" data-testid="heading-services">Irrigation Services We Offer</h2>
                  <div className="space-y-4">
                    <Card className="hover-elevate" data-testid="card-new-installation">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-2" data-testid="title-new-installation">New System Installation</h3>
                        <p className="text-muted-foreground mb-3" data-testid="desc-new-installation">
                          Complete irrigation system design and installation customized for your property's specific needs.
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li data-testid="feature-install-0">• Custom zone design</li>
                          <li data-testid="feature-install-1">• Hunter and Rain Bird systems</li>
                          <li data-testid="feature-install-2">• Smart controller installation</li>
                          <li data-testid="feature-install-3">• Water-efficient sprinkler heads</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="hover-elevate" data-testid="card-repair">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-2" data-testid="title-repair">System Repair & Maintenance</h3>
                        <p className="text-muted-foreground mb-3" data-testid="desc-repair">
                          Keep your irrigation system running efficiently with professional repairs and seasonal maintenance.
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li data-testid="feature-repair-0">• Broken pipe and head repair</li>
                          <li data-testid="feature-repair-1">• Valve replacement</li>
                          <li data-testid="feature-repair-2">• Controller programming</li>
                          <li data-testid="feature-repair-3">• Leak detection and repair</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="hover-elevate" data-testid="card-winterization">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-2" data-testid="title-winterization">Winterization & Spring Startup</h3>
                        <p className="text-muted-foreground mb-3" data-testid="desc-winterization">
                          Protect your investment with proper fall blowouts and spring system activation.
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li data-testid="feature-winter-0">• Complete system blowout</li>
                          <li data-testid="feature-winter-1">• Backflow testing & certification</li>
                          <li data-testid="feature-winter-2">• Spring system startup</li>
                          <li data-testid="feature-winter-3">• Zone-by-zone testing</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="hover-elevate" data-testid="card-upgrades">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-2" data-testid="title-upgrades">Smart Controller Upgrades</h3>
                        <p className="text-muted-foreground mb-3" data-testid="desc-upgrades">
                          Reduce water waste and lower costs with WiFi-enabled smart irrigation controllers.
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li data-testid="feature-upgrade-0">• Rachio and Rain Bird WiFi controllers</li>
                          <li data-testid="feature-upgrade-1">• Weather-based watering adjustments</li>
                          <li data-testid="feature-upgrade-2">• Mobile app control</li>
                          <li data-testid="feature-upgrade-3">• Water usage tracking</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="bg-muted/50 p-6 rounded-md">
                  <h2 className="text-2xl font-bold mb-4" data-testid="heading-areas">Service Areas</h2>
                  <p className="mb-4 text-muted-foreground" data-testid="text-areas">
                    Professional irrigation services available in:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Kuna', 'Boise', 'Meridian', 'Eagle', 'Star', 'Middleton'].map((city) => (
                      <Button key={city} variant="outline" size="sm" asChild data-testid={`button-city-${city.toLowerCase()}`}>
                        <Link href={`/services/irrigation-installation/${city.toLowerCase()}`}>{city}</Link>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="sticky top-20">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-3" data-testid="heading-why">Why Choose Us</h3>
                      <div className="space-y-3">
                        <div className="flex gap-3" data-testid="feature-experience">
                          <Award className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium" data-testid="label-experience">Irrigation Experts</p>
                            <p className="text-sm text-muted-foreground" data-testid="value-experience">7+ years experience</p>
                          </div>
                        </div>
                        <div className="flex gap-3" data-testid="feature-quality">
                          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium" data-testid="label-quality">Quality Equipment</p>
                            <p className="text-sm text-muted-foreground" data-testid="value-quality">Hunter & Rain Bird systems</p>
                          </div>
                        </div>
                        <div className="flex gap-3" data-testid="feature-warranty">
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium" data-testid="label-warranty">Warranty</p>
                            <p className="text-sm text-muted-foreground" data-testid="value-warranty">Satisfaction guaranteed</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-2" data-testid="heading-contact">Get a Free Quote</h3>
                      <p className="text-sm text-muted-foreground mb-4" data-testid="text-contact">
                        Call us for a free irrigation consultation and quote.
                      </p>
                      <Button className="w-full" size="lg" asChild data-testid="button-call">
                        <a href="tel:2083522011">(208) 352-2011</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <SimpleQuoteWizard className="sticky top-[440px]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8" data-testid="heading-benefits">Benefits of Professional Irrigation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover-elevate" data-testid="card-water-efficiency">
                <CardContent className="p-6">
                  <Droplets className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2" data-testid="title-water">Water Efficiency</h3>
                  <p className="text-sm text-muted-foreground" data-testid="desc-water">
                    Smart irrigation systems use 30-50% less water than manual watering while keeping your lawn healthier.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-time-savings">
                <CardContent className="p-6">
                  <CheckCircle2 className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2" data-testid="title-time">Time Savings</h3>
                  <p className="text-sm text-muted-foreground" data-testid="desc-time">
                    Set it and forget it. Your lawn gets watered automatically on the optimal schedule.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-healthier">
                <CardContent className="p-6">
                  <Award className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2" data-testid="title-healthier">Healthier Lawns</h3>
                  <p className="text-sm text-muted-foreground" data-testid="desc-healthier">
                    Consistent, deep watering promotes stronger root systems and more drought-resistant turf.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-property-value">
                <CardContent className="p-6">
                  <Shield className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2" data-testid="title-value">Property Value</h3>
                  <p className="text-sm text-muted-foreground" data-testid="desc-value">
                    A well-designed irrigation system is a valuable asset that increases your home's market value.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
