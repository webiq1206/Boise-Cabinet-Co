import { Metadata } from "next";
import { ObfuscatedEmail } from "@/components/ObfuscatedEmail";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Terms of Service for Lawn Care & Landscaping",
  description: "Terms of service for Lawn Care Kuna. Your rights when using our lawn care and landscaping services in Kuna & Boise, Idaho.",
  alternates: {
    canonical: "https://lawncarekuna.com/terms-of-service",
  },
  openGraph: {
    title: "Terms of Service | Lawn Care Kuna",
    description: "Your rights when using Lawn Care Kuna lawn care and landscaping services in Idaho's Treasure Valley.",
    url: "https://lawncarekuna.com/terms-of-service",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Terms of Service | Lawn Care Kuna",
    description: "Your rights when using Lawn Care Kuna lawn care and landscaping services in Idaho's Treasure Valley.",
  },
};

export default function TermsOfServicePage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Terms of Service", url: "/terms-of-service" },
  ]);
  const webPageSchema = generateWebPageSchema({
    name: "Terms of Service",
    description: "Terms of service for Lawn Care Kuna. Your rights and responsibilities when using our services.",
    url: "https://lawncarekuna.com/terms-of-service",
  });

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <h1>Terms of Service for Lawn Care Kuna</h1>
            <p className="lead text-muted-foreground">
              Last updated: January 2024
            </p>

            <h2>Agreement to Terms</h2>
            <p>
              By accessing or using the services provided by Lawn Care Kuna ("Company," "we," "us," or "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>

            <h2>Services</h2>
            <p>
              Lawn Care Kuna provides lawn care, landscaping, and related outdoor property maintenance services to residential and commercial customers in the Treasure Valley area of Idaho.
            </p>

            <h2>Service Estimates and Pricing</h2>
            <ul>
              <li>All estimates are provided based on information available at the time of assessment</li>
              <li>Final pricing may vary based on actual conditions discovered during service</li>
              <li>Significant changes to scope will be communicated before proceeding</li>
              <li>Prices are subject to change with advance notice</li>
            </ul>

            <h2>Payment Terms</h2>
            <ul>
              <li>Payment is due upon completion of services unless otherwise arranged</li>
              <li>We accept major credit cards, checks, and electronic payments</li>
              <li>Late payments may incur additional fees</li>
              <li>Recurring service customers may set up automatic billing</li>
            </ul>

            <h2>Scheduling and Cancellation</h2>
            <ul>
              <li>Service schedules are weather-dependent and may be adjusted as needed</li>
              <li>We will make reasonable efforts to notify you of schedule changes</li>
              <li>Cancellation of scheduled services requires 24-hour advance notice</li>
              <li>Repeated cancellations may result in service termination</li>
            </ul>

            <h2>Property Access</h2>
            <p>
              By engaging our services, you grant us permission to access your property as necessary to perform the agreed-upon work. Please ensure gates are unlocked and pets are secured on service days.
            </p>

            <h2>Subcontracting</h2>
            <p>
              Lawn Care Kuna reserves the right to subcontract services as needed to ensure quality service delivery and timely completion of work.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              While we take great care in providing our services, Lawn Care Kuna's liability for any claims arising from our services is limited to the amount paid for the specific service in question. We are not liable for pre-existing conditions, normal wear, or conditions outside our control.
            </p>

            <h2>Satisfaction Guarantee</h2>
            <p>
              We stand behind our work. If you're not satisfied with a service, please contact us within 48 hours and we will work to address your concerns.
            </p>

            <h2>Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to our website.
            </p>

            <h2>Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us:
            </p>
            <ul>
              <li>Email: <ObfuscatedEmail user="hello" domain="lawncarekuna.com" className="text-primary hover:underline inline-flex items-center gap-1" showIcon={false} /></li>
              <li>Phone: <a href="tel:2083522011" className="text-primary hover:underline">(208) 352-2011</a></li>
              <li>Address: 2283 N Coopers Hawk Ave, Kuna, ID 83634</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
