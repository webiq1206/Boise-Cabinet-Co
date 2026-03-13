import { Metadata } from "next";
import { ObfuscatedEmail } from "@/components/ObfuscatedEmail";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Lawn Care Kuna. How we collect, use, and protect your personal information when you use our services.",
  alternates: {
    canonical: "https://lawncarekuna.com/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | Lawn Care Kuna",
    description: "How Lawn Care Kuna collects, uses, and protects your personal information.",
    url: "https://lawncarekuna.com/privacy-policy",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Lawn Care Kuna",
    description: "How Lawn Care Kuna collects, uses, and protects your personal information.",
  },
};

export default function PrivacyPolicyPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Privacy Policy", url: "/privacy-policy" },
  ]);
  const webPageSchema = generateWebPageSchema({
    name: "Privacy Policy",
    description: "Privacy policy for Lawn Care Kuna. How we collect, use, and protect your personal information.",
    url: "https://lawncarekuna.com/privacy-policy",
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
            <h1>Privacy Policy</h1>
            <p className="lead text-muted-foreground">
              Last updated: January 2024
            </p>

            <h2>Introduction</h2>
            <p>
              Lawn Care Kuna ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
            </p>

            <h2>Information We Collect</h2>
            <p>We may collect information about you in various ways, including:</p>
            <ul>
              <li><strong>Personal Data:</strong> Name, email address, phone number, and mailing address when you request a quote or contact us.</li>
              <li><strong>Property Information:</strong> Address and details about your property for service estimates.</li>
              <li><strong>Payment Information:</strong> Payment details processed securely through our payment providers.</li>
              <li><strong>Usage Data:</strong> Information about how you use our website, including pages visited and features used.</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and maintain our services</li>
              <li>Process your requests and transactions</li>
              <li>Send you service-related communications</li>
              <li>Improve our website and services</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Send marketing communications (with your consent)</li>
            </ul>

            <h2>Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share your information with:
            </p>
            <ul>
              <li>Service providers who assist in our operations</li>
              <li>Professional advisors as needed</li>
              <li>Law enforcement when required by law</li>
            </ul>

            <h2>Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2>Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:
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
