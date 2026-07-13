import { Metadata } from "next";
import { ObfuscatedEmail } from "@/components/ObfuscatedEmail";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import { buildCanonical } from "@/lib/page-metadata";

export const metadata: Metadata = {
  title: { absolute: "Terms of Service | Boise Cabinet Co" },
  description: "Terms of service for Boise Cabinet Co. Your rights when using our custom cabinet design, fabrication, and installation services in Meridian & Boise, Idaho.",
  alternates: {
    canonical: buildCanonical("/terms-of-service"),
  },
  openGraph: {
    title: "Terms of Service | Boise Cabinet Co",
    description: "Your rights when using Boise Cabinet Co custom cabinet services in Idaho's Treasure Valley.",
    url: buildCanonical("/terms-of-service"),
    type: "website",
    siteName: "Boise Cabinet Co",
    locale: "en_US",
    images: [{ url: "/images/marketing/og-default.webp", width: 1200, height: 630, alt: "Boise Cabinet Co custom cabinets" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | Boise Cabinet Co",
    description: "Your rights when using Boise Cabinet Co custom cabinet services in Idaho's Treasure Valley.",
    images: ["/images/marketing/og-default.webp"],
  },
};

export default function TermsOfServicePage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Terms of Service", url: "/terms-of-service" },
  ]);
  const webPageSchema = generateWebPageSchema({
    title: "Terms of Service",
    description: "Terms of service for Boise Cabinet Co. Your rights and responsibilities when using our services.",
    url: "/terms-of-service",
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
          <div className="max-w-3xl mx-auto blog-content prose-measure">
            <h1>Terms of Service for Boise Cabinet Co</h1>
            <p className="lead text-muted-foreground">
              Last updated: January 2024
            </p>

            <h2>Agreement to Terms</h2>
            <p>
              By accessing or using the services provided by Boise Cabinet Co ("Company," "we," "us," or "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>

            <h2>Services</h2>
            <p>
              Boise Cabinet Co provides custom cabinet design, fabrication, and installation services to residential and commercial customers in the Treasure Valley area of Idaho.
            </p>

            <h2>Estimates and Pricing</h2>
            <ul>
              <li>Online and in-home estimates are planning ranges based on the information available at the time, not a binding quote</li>
              <li>Final pricing is set in a written scope and proposal before fabrication begins</li>
              <li>Final pricing may vary based on field measurements, selected door styles, finishes, and accessories</li>
              <li>Any significant change to the approved scope is documented in a written change order before work proceeds</li>
            </ul>

            <h2>Payment Terms</h2>
            <ul>
              <li>A deposit is typically required to confirm your order and begin fabrication</li>
              <li>The remaining balance is due according to the milestones set out in your written proposal</li>
              <li>We accept major credit cards, checks, and electronic payments</li>
              <li>Late payments may incur additional fees as described in your proposal</li>
            </ul>

            <h2>Fabrication and Installation Scheduling</h2>
            <ul>
              <li>Custom cabinets are built to order, so lead times are estimated and may shift based on material availability and order volume</li>
              <li>We will make reasonable efforts to keep you informed of your fabrication and installation timeline</li>
              <li>Installation dates are scheduled in advance; please let us know promptly if you need to reschedule</li>
            </ul>

            <h2>Property Access</h2>
            <p>
              By engaging our services, you grant us permission to access your home as necessary to take field measurements and complete installation. Please ensure the work area is clear and accessible on scheduled measurement and installation days.
            </p>

            <h2>Installation Partners</h2>
            <p>
              Boise Cabinet Co may use qualified installation partners to complete certain work. We remain accountable for the quality and warranty of the cabinetry we design, build, and install.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              While we take great care in providing our services, Boise Cabinet Co's liability for any claims arising from our services is limited to the amount paid for the specific service in question. We are not liable for pre-existing conditions, normal wear, or conditions outside our control.
            </p>

            <h2>Workmanship Guarantee</h2>
            <p>
              We stand behind our cabinetry and installation. If you have a concern with your completed project, please contact us and we will work to address it under the terms of your written workmanship warranty.
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
              <li>Email: <ObfuscatedEmail user="hello" domain="boisecabinet.co" className="text-primary hover:underline inline-flex items-center gap-1" showIcon={false} /></li>
              <li>Phone: <a href={SITE_CONFIG.phoneHref} className="text-primary hover:underline">{SITE_CONFIG.phone}</a></li>
              <li>{SITE_CONFIG.name}, {SITE_CONFIG.address.city}, {SITE_CONFIG.address.state}</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
