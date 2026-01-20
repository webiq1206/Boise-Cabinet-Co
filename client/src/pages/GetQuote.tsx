import { SimpleQuoteWizard } from "@/components/SimpleQuoteWizard";

export default function GetQuote() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container max-w-3xl mx-auto">
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
    </div>
  );
}
