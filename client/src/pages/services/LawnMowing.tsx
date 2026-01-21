import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SimpleQuoteWizard } from "@/components/SimpleQuoteWizard";
import { RelatedBlogPosts } from "@/components/RelatedBlogPosts";
import { CheckCircle2, Calendar, DollarSign, Shield, Clock } from "lucide-react";

export default function LawnMowing() {
  return (
    <div className="flex flex-col">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/services/lawn-care">Lawn Care</Link>
            <span>/</span>
            <span className="text-foreground">Lawn Mowing</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Professional Lawn Mowing Services</h1>
            <p className="text-lg text-primary-foreground/90">
              Weekly and bi-weekly lawn mowing for beautiful, healthy lawns in Kuna, Boise, Meridian, and surrounding areas
            </p>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar */}
      <section className="py-16">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                <div className="prose prose-lg max-w-none">
                  <h2>Expert Lawn Mowing in the Treasure Valley</h2>
                  <p>
                    A well-maintained lawn enhances your property's curb appeal and provides a beautiful outdoor space for your family. Our professional lawn mowing services ensure your grass stays healthy, evenly cut, and looking its best throughout the growing season.
                  </p>
                  <p>
                    We understand Idaho's unique climate challenges, from scorching summer heat to variable spring and fall weather. Our experienced crews know exactly when and how to mow for optimal lawn health in the Treasure Valley's high-desert environment.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Our Lawn Mowing Process</h2>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Professional Assessment</h3>
                        <p className="text-muted-foreground">
                          We assess your lawn's current condition and determine the optimal mowing height for your grass type
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Precision Mowing</h3>
                        <p className="text-muted-foreground">
                          Using commercial-grade equipment, we mow in alternating patterns to prevent soil compaction and ensure even growth
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Edge Trimming</h3>
                        <p className="text-muted-foreground">
                          We edge along sidewalks, driveways, and landscape beds for a clean, professional finish
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        4
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Cleanup</h3>
                        <p className="text-muted-foreground">
                          All clippings are blown off hard surfaces, leaving your property looking immaculate
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Benefits of Professional Lawn Mowing</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      'Consistent, healthy lawn growth',
                      'Enhanced curb appeal',
                      'Professional-quality results',
                      'Save your weekends',
                      'Commercial-grade equipment',
                      'Reliable, scheduled service',
                    ].map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/50 p-6 rounded-md">
                  <h2 className="text-2xl font-bold mb-4">Service Areas</h2>
                  <p className="mb-4 text-muted-foreground">
                    We provide professional lawn mowing services throughout the Treasure Valley:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Kuna', 'Boise', 'Meridian', 'Eagle', 'Star', 'Middleton'].map((city) => (
                      <Button key={city} variant="outline" size="sm" asChild>
                        <Link href={`/services/lawn-mowing/${city.toLowerCase()}`}>{city}</Link>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="sticky top-20">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Service Highlights</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Weekly or Bi-Weekly</div>
                            <div className="text-muted-foreground">Flexible scheduling</div>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <DollarSign className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Affordable Rates</div>
                            <div className="text-muted-foreground">Transparent pricing</div>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Fully Insured</div>
                            <div className="text-muted-foreground">Licensed & bonded</div>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Since 2017</div>
                            <div className="text-muted-foreground">7+ years experience</div>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-4 border-t space-y-3">
                      <Button size="lg" asChild>
                        <a href="tel:2083522011" className="block">
                          Call (208) 352-2011
                        </a>
                      </Button>
                      <Button variant="outline" size="lg" asChild>
                        <a href="#quote" className="block">
                          Get Free Quote
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3">Related Services</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/services/fertilization">
                          <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer">
                            Fertilization Programs →
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/services/weed-control">
                          <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer">
                            Weed Control →
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/services/aeration">
                          <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer">
                            Aeration & Overseeding →
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/services/hedge-trimming">
                          <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer">
                            Hedge Trimming →
                          </span>
                        </Link>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <RelatedBlogPosts serviceSlug="lawn-mowing" />
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
              <h2 className="text-3xl font-bold mb-4">Request Your Free Quote</h2>
              <p className="text-lg text-muted-foreground">
                Get a customized quote for your property
              </p>
            </div>
            <SimpleQuoteWizard preselectedService="lawn-mowing" />
          </div>
        </div>
      </section>
    </div>
  );
}
