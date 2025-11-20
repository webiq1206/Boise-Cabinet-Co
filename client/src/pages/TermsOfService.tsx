import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, Calendar, DollarSign, Shield, AlertTriangle, Wrench, Users, Scale, RefreshCw, Phone } from "lucide-react";

export default function TermsOfService() {
  const lastUpdated = "November 20, 2025";
  
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Terms of Service | Lawn Care Kuna</title>
        <meta name="description" content="Review the terms and conditions for Lawn Care Kuna's professional lawn care and landscaping services. Clear, fair terms for residential and commercial customers." />
        <link rel="canonical" href="https://lawncarekuna.com/terms-of-service" />
        <meta property="og:title" content="Terms of Service | Lawn Care Kuna" />
        <meta property="og:description" content="Review the terms and conditions for Lawn Care Kuna's professional lawn care and landscaping services." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold" data-testid="heading-terms-of-service">Terms of Service</h1>
            <p className="text-lg text-primary-foreground/90">
              Clear, fair terms for our lawn care and landscaping services
            </p>
            <p className="text-sm text-primary-foreground/80" data-testid="text-last-updated">
              Last Updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Terms of Service Content */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Introduction */}
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground">
                Welcome to Lawn Care Kuna. These Terms of Service govern your use of our services and website. By engaging our services or using our website, you agree to these terms. Please read them carefully.
              </p>
            </div>

            {/* Acceptance of Terms */}
            <Card className="hover-elevate transition-all duration-200" data-testid="card-acceptance-terms">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileCheck className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Acceptance of Terms</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  By requesting a quote, scheduling a service, or engaging Lawn Care Kuna for any lawn care or landscaping work, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
                <p className="text-muted-foreground">
                  These terms constitute a legally binding agreement between you (the "Customer" or "you") and Lawn Care Kuna (the "Company," "we," or "us").
                </p>
              </CardContent>
            </Card>

            {/* Services Provided */}
            <Card className="hover-elevate transition-all duration-200" data-testid="card-services-provided">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Wrench className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Services Provided</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Lawn Care Kuna provides professional lawn care and landscaping services to residential and commercial properties in the Treasure Valley, Idaho, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Lawn Care Services:</strong> Lawn mowing, edging, trimming, fertilization, aeration, dethatching, overseeding, and weed control</li>
                  <li><strong>Landscaping Services:</strong> Landscape design, installation, mulch installation, hedge trimming, tree trimming, and seasonal cleanup</li>
                  <li><strong>Hardscaping Services:</strong> Patio installation, retaining walls, fire pit installation, and pond installation</li>
                  <li><strong>Irrigation Services:</strong> Sprinkler system installation, irrigation repair, irrigation maintenance, and sprinkler blowouts</li>
                  <li><strong>Seasonal Services:</strong> Spring and fall cleanup, leaf removal, Christmas light installation, and snow removal (seasonal availability)</li>
                </ul>
                <p className="text-muted-foreground">
                  Services are performed by our professional crews or trusted licensed and insured subcontractors as needed to ensure quality service delivery.
                </p>
              </CardContent>
            </Card>

            {/* Quote Estimates */}
            <Card className="hover-elevate transition-all duration-200" data-testid="card-quote-estimates">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Quote Estimates and Pricing</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>Quotes are estimates only</strong> and are subject to on-site property inspection. Final pricing may vary based on:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Actual property conditions and square footage</li>
                  <li>Obstacles, terrain difficulty, and site access</li>
                  <li>Scope changes or additional work requested</li>
                  <li>Material costs and availability</li>
                  <li>Unforeseen conditions discovered during service</li>
                </ul>
                <p className="text-muted-foreground">
                  We will notify you of any significant pricing adjustments before proceeding with the work. All quotes are valid for 30 days from the date issued unless otherwise specified. We reserve the right to adjust pricing for seasonal services based on market conditions.
                </p>
                <p className="text-muted-foreground">
                  <strong>No hidden fees:</strong> Our quotes are transparent and comprehensive. Any additional charges will be discussed and approved before work begins.
                </p>
              </CardContent>
            </Card>

            {/* Service Scheduling & Cancellation */}
            <Card className="hover-elevate transition-all duration-200" data-testid="card-scheduling-cancellation">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Service Scheduling and Cancellation</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>Scheduling:</strong> We schedule services based on weather conditions, crew availability, and service area routing. While we strive to accommodate your preferred dates, specific appointment times cannot always be guaranteed. We will notify you in advance of scheduled service dates.
                </p>
                <p className="text-muted-foreground">
                  <strong>Cancellation by Customer:</strong> You may cancel or reschedule services with at least 24 hours notice without penalty. Cancellations with less than 24 hours notice may be subject to a cancellation fee, particularly for scheduled one-time services or consultations.
                </p>
                <p className="text-muted-foreground">
                  <strong>Cancellation by Company:</strong> We reserve the right to cancel or reschedule services due to severe weather, equipment failure, crew illness, or other unforeseen circumstances. We will make reasonable efforts to notify you as soon as possible and reschedule at your convenience.
                </p>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card className="hover-elevate transition-all duration-200" data-testid="card-payment-terms">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Payment Terms</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>Payment is due upon completion of services</strong> unless other arrangements have been made in writing. We accept the following payment methods:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Cash, check, or money order</li>
                  <li>Major credit cards (Visa, Mastercard, American Express, Discover)</li>
                  <li>ACH bank transfer or online payment portals</li>
                </ul>
                <p className="text-muted-foreground">
                  <strong>For large projects:</strong> A deposit may be required before work begins. The deposit amount will be specified in your service agreement. The remaining balance is due upon project completion.
                </p>
                <p className="text-muted-foreground">
                  <strong>Recurring services:</strong> Monthly or seasonal service packages may be billed on a recurring basis via automatic payment or invoicing. Payment is due within 15 days of invoice date.
                </p>
                <p className="text-muted-foreground">
                  <strong>Late payments:</strong> Accounts not paid within 30 days may be subject to a late fee of 1.5% per month (18% annually) and may result in suspension of services until the account is current.
                </p>
              </CardContent>
            </Card>

            {/* Liability Limitations */}
            <Card className="hover-elevate transition-all duration-200" data-testid="card-liability-limitations">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Liability Limitations</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Lawn Care Kuna carries general liability insurance and workers' compensation coverage. However, our liability is limited as follows:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Normal Wear and Tear:</strong> We are not responsible for normal wear, aging, or deterioration of plants, lawns, or landscaping materials</li>
                  <li><strong>Pre-existing Conditions:</strong> We are not liable for damage to property that existed prior to our services</li>
                  <li><strong>Underground Utilities:</strong> Customer must identify and mark underground utilities (sprinkler lines, gas, electric, cable). We are not responsible for damage to unmarked utilities</li>
                  <li><strong>Hidden Objects:</strong> We are not liable for damage to objects hidden in grass or landscaping (toys, decorations, pet items) unless properly marked</li>
                  <li><strong>Property Access:</strong> Customer must provide safe, clear access to work areas. We are not liable for damage resulting from obstructed or hazardous access</li>
                  <li><strong>Acts of Nature:</strong> We are not responsible for damage caused by weather, disease, pests, or other natural events beyond our control</li>
                </ul>
                <p className="text-muted-foreground">
                  Any claims for damage must be reported within 48 hours of service completion. Our maximum liability for any claim shall not exceed the total amount paid for the specific service in question.
                </p>
              </CardContent>
            </Card>

            {/* Weather-Related Delays */}
            <Card className="hover-elevate transition-all duration-200" data-testid="card-weather-delays">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Weather-Related Delays</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Outdoor services are subject to weather conditions. We may delay or reschedule services due to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Heavy rain, snow, or ice that makes work unsafe or ineffective</li>
                  <li>Extreme heat advisories that pose safety risks to our crew</li>
                  <li>High winds that prevent safe operation of equipment</li>
                  <li>Frozen ground conditions that prevent certain services (aeration, installation work)</li>
                </ul>
                <p className="text-muted-foreground">
                  We will make reasonable efforts to complete services in a timely manner while prioritizing safety and service quality. Weather delays do not constitute a breach of contract, and no refunds will be issued for weather-related rescheduling.
                </p>
              </CardContent>
            </Card>

            {/* Customer Responsibilities */}
            <Card className="hover-elevate transition-all duration-200" data-testid="card-customer-responsibilities">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Customer Responsibilities</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  To ensure safe and efficient service delivery, customers agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Property Access:</strong> Provide clear, safe access to work areas and unlock gates as needed</li>
                  <li><strong>Pets:</strong> Secure all pets indoors or in a safe location away from work areas during service</li>
                  <li><strong>Obstacles:</strong> Remove or clearly mark toys, decorations, hoses, and other items from lawn and work areas</li>
                  <li><strong>Underground Utilities:</strong> Mark all underground utilities, sprinkler lines, and buried cables before service</li>
                  <li><strong>Parking:</strong> Ensure adequate parking and access for service vehicles and equipment</li>
                  <li><strong>Communication:</strong> Notify us of any property hazards, special instructions, or access requirements</li>
                  <li><strong>Payment:</strong> Make timely payment for services as outlined in the payment terms</li>
                </ul>
                <p className="text-muted-foreground">
                  Failure to meet these responsibilities may result in service delays, rescheduling fees, or inability to complete services as quoted.
                </p>
              </CardContent>
            </Card>

            {/* Warranty & Guarantees */}
            <Card className="hover-elevate transition-all duration-200" data-testid="card-warranty-guarantees">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Warranty and Service Guarantees</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>Service Satisfaction Guarantee:</strong> We stand behind our work with a 100% satisfaction guarantee. If you're not satisfied with our service, contact us within 48 hours and we'll make it right at no additional charge.
                </p>
                <p className="text-muted-foreground">
                  <strong>Workmanship Warranty:</strong> Hardscaping projects (patios, retaining walls, fire pits) include a workmanship warranty. The warranty period and coverage will be specified in your project agreement. This warranty covers defects in installation but does not cover damage from misuse, neglect, or natural events.
                </p>
                <p className="text-muted-foreground">
                  <strong>Plant and Sod Guarantees:</strong> Living materials (sod, plants, trees) are guaranteed for a limited period with proper care. Warranty terms vary by material and season and will be provided with installation services. Warranty does not cover damage from improper watering, extreme weather, or customer neglect.
                </p>
                <p className="text-muted-foreground">
                  All warranty claims must be submitted in writing with photographic documentation. We reserve the right to inspect claimed defects before providing warranty service.
                </p>
              </CardContent>
            </Card>

            {/* Dispute Resolution */}
            <Card className="hover-elevate transition-all duration-200" data-testid="card-dispute-resolution">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Scale className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Dispute Resolution</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We value our customer relationships and strive to resolve any concerns promptly and fairly. If you have a dispute or complaint:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Contact us directly at (208) 352-2011 or hello@lawncarekuna.com to discuss the issue</li>
                  <li>We will investigate and respond within 7 business days</li>
                  <li>If the issue cannot be resolved informally, we agree to attempt mediation before pursuing legal action</li>
                </ol>
                <p className="text-muted-foreground">
                  Any legal disputes shall be governed by the laws of the State of Idaho and resolved in Ada County, Idaho courts. Both parties agree to attempt good-faith resolution before initiating legal proceedings.
                </p>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card className="hover-elevate transition-all duration-200" data-testid="card-changes-terms">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Changes to These Terms</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We reserve the right to modify these Terms of Service at any time. Changes will be posted on this page with an updated "Last Updated" date. Continued use of our services after changes are posted constitutes acceptance of the modified terms.
                </p>
                <p className="text-muted-foreground">
                  For significant changes affecting existing contracts or service agreements, we will make reasonable efforts to notify affected customers via email or phone.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="hover-elevate transition-all duration-200" data-testid="card-contact-terms">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Contact Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Lawn Care Kuna</strong></p>
                  <p><strong>Phone:</strong> <a href="tel:2083522011" className="text-primary hover:underline" data-testid="link-terms-phone">(208) 352-2011</a></p>
                  <p><strong>Email:</strong> <a href="mailto:hello@lawncarekuna.com" className="text-primary hover:underline" data-testid="link-terms-email">hello@lawncarekuna.com</a></p>
                  <p><strong>Service Areas:</strong> Kuna, Boise, Meridian, Nampa, Caldwell, Eagle, and surrounding Treasure Valley communities</p>
                </div>
              </CardContent>
            </Card>

            {/* Footer Note */}
            <div className="bg-muted/30 rounded-lg p-6">
              <p className="text-sm text-muted-foreground text-center">
                By engaging Lawn Care Kuna for services, you acknowledge that you have read, understood, and agree to these Terms of Service. These terms are effective as of the date services are requested or scheduled.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
