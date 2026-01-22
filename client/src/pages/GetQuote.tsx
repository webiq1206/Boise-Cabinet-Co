import { SimpleQuoteWizard } from "@/components/SimpleQuoteWizard";

export default function GetQuote() {
  return (
    <div className="min-h-screen">
      {/* Hero section with gradient */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Get Your Free Quote
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Enter your address and we'll automatically measure your property. 
              Choose your services and get an instant price estimate.
            </p>
          </div>

          <SimpleQuoteWizard />
        </div>
      </section>
    </div>
  );
}
