import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, FileText, Mail } from "lucide-react";
import heroBackground from "@assets/Untitled design_1763639882299.png";

export default function PrivacyPolicy() {
  const lastUpdated = "November 20, 2025";
  
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Privacy Policy | Lawn Care Kuna</title>
        <meta name="description" content="Learn how Lawn Care Kuna protects your privacy and handles your personal information. We're committed to safeguarding your data and providing transparent information practices." />
        <link rel="canonical" href="https://lawncarekuna.com/privacy-policy" />
        <meta property="og:title" content="Privacy Policy | Lawn Care Kuna" />
        <meta property="og:description" content="Learn how Lawn Care Kuna protects your privacy and handles your personal information." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBackground} 
            alt="Privacy Policy for Lawn Care Kuna professional services"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60"></div>
        </div>
        <div className="container px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white" data-testid="heading-privacy-policy">Privacy Policy</h1>
            <p className="text-lg text-white/90">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-white/80" data-testid="text-last-updated">
              Last Updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Introduction */}
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground">
                At Lawn Care Kuna, we are committed to protecting your privacy and handling your personal information with care and respect. This Privacy Policy explains how we collect, use, share, and protect your information when you use our website or services.
              </p>
            </div>

            {/* Information We Collect */}
            <Card className="hover-elevate transition-all duration-200" data-testid="card-information-collect">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Information We Collect</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We collect information that you voluntarily provide to us when you request a quote, schedule a service, or contact us. This may include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Contact Information:</strong> Name, email address, phone number, and property address</li>
                  <li><strong>Service Requests:</strong> Property details, lawn size, requested services, and project descriptions</li>
                  <li><strong>Communication Records:</strong> Messages, emails, and phone call records related to service inquiries</li>
                  <li><strong>Payment Information:</strong> Billing details when you engage our services (processed securely through third-party payment processors)</li>
                </ul>
                <p className="text-muted-foreground">
                  We also automatically collect certain information when you visit our website, including your IP address, browser type, device information, and pages visited. This helps us improve our website performance and user experience.
                </p>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card className="hover-elevate transition-all duration-200" data-testid="card-information-use">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>How We Use Your Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We use the information we collect for legitimate business purposes, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Quote Processing:</strong> To prepare and deliver accurate service quotes based on your property and needs</li>
                  <li><strong>Service Delivery:</strong> To schedule, perform, and complete the lawn care and landscaping services you request</li>
                  <li><strong>Communication:</strong> To respond to your inquiries, provide service updates, and send appointment reminders</li>
                  <li><strong>Payment Processing:</strong> To process payments and maintain billing records for services rendered</li>
                  <li><strong>Service Improvement:</strong> To understand customer needs and improve our service offerings</li>
                  <li><strong>Marketing Communications:</strong> To send you information about our services, seasonal promotions, and lawn care tips (you can opt out at any time)</li>
                  <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
                </ul>
              </CardContent>
            </Card>

            {/* Information Sharing */}
            <Card className="hover-elevate transition-all duration-200" data-testid="card-information-sharing">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Information Sharing and Disclosure</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>We do not sell your personal information to third parties.</strong> We only share your information in the following limited circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our business (e.g., payment processors, email service providers, website hosting). These providers are contractually obligated to protect your information.</li>
                  <li><strong>Subcontractors:</strong> When we subcontract services to ensure quality delivery, we may share necessary project details with licensed and insured subcontractors.</li>
                  <li><strong>Legal Requirements:</strong> We may disclose information when required by law, court order, or to protect our legal rights and property.</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, customer information may be transferred as part of the transaction.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Cookies and Tracking */}
            <Card className="hover-elevate transition-all duration-200" data-testid="card-cookies-tracking">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Cookies and Tracking Technologies</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Our website uses cookies and similar tracking technologies to enhance your browsing experience and analyze website traffic. Cookies are small text files stored on your device that help us:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Remember your preferences and settings</li>
                  <li>Understand how visitors use our website through analytics</li>
                  <li>Improve website functionality and user experience</li>
                  <li>Deliver relevant content and service recommendations</li>
                </ul>
                <p className="text-muted-foreground">
                  You can control cookie settings through your browser preferences. However, disabling cookies may limit your ability to use certain features of our website. We use basic analytics tools to understand website performance and do not engage in invasive tracking practices.
                </p>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card className="hover-elevate transition-all duration-200" data-testid="card-data-security">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Data Security</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We take the security of your personal information seriously and implement industry-standard security measures to protect your data, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Secure encrypted connections (SSL/TLS) for data transmission</li>
                  <li>Restricted access to personal information on a need-to-know basis</li>
                  <li>Regular security assessments and updates to our systems</li>
                  <li>Secure storage of customer records and data</li>
                  <li>Employee training on data privacy and security practices</li>
                </ul>
                <p className="text-muted-foreground">
                  While we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security but continuously work to maintain the highest standards of data protection.
                </p>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="hover-elevate transition-all duration-200" data-testid="card-your-rights">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Your Privacy Rights</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  You have certain rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Access:</strong> You can request a copy of the personal information we hold about you</li>
                  <li><strong>Correction:</strong> You can request that we correct inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> You can request deletion of your personal information, subject to legal and business requirements</li>
                  <li><strong>Opt-Out:</strong> You can unsubscribe from marketing emails at any time by clicking the unsubscribe link or contacting us</li>
                  <li><strong>Data Portability:</strong> You can request a copy of your data in a commonly used format</li>
                </ul>
                <p className="text-muted-foreground">
                  To exercise any of these rights, please contact us using the information provided below. We will respond to your request within a reasonable timeframe and in accordance with applicable laws.
                </p>
              </CardContent>
            </Card>

            {/* Contact Us */}
            <Card className="hover-elevate transition-all duration-200" data-testid="card-contact-privacy">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Contact Us About Privacy</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you have questions, concerns, or requests regarding this Privacy Policy or how we handle your personal information, please contact us:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> <a href="mailto:hello@lawncarekuna.com" className="text-primary hover:underline" data-testid="link-privacy-email">hello@lawncarekuna.com</a></p>
                  <p><strong>Phone:</strong> <a href="tel:2083522011" className="text-primary hover:underline" data-testid="link-privacy-phone">(208) 352-2011</a></p>
                  <p><strong>Subject Line:</strong> "Privacy Policy Inquiry"</p>
                </div>
                <p className="text-muted-foreground">
                  We will respond to all privacy-related inquiries within 7 business days.
                </p>
              </CardContent>
            </Card>

            {/* Updates to Policy */}
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-semibold mb-3">Changes to This Privacy Policy</h3>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will post the updated policy on this page with a revised "Last Updated" date. We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
              </p>
            </div>

            {/* Footer Note */}
            <div className="bg-muted/30 rounded-lg p-6">
              <p className="text-sm text-muted-foreground text-center">
                This Privacy Policy applies to information collected through our website and services. By using our website or engaging our services, you consent to the practices described in this Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
