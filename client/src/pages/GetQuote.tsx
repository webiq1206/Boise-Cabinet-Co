import { QuoteForm } from "@/components/QuoteForm";

export default function GetQuote() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Get Your Instant Quote
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered quoting system provides accurate, transparent pricing in under 2 minutes.
            No waiting for callbacks—get instant results!
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <QuoteForm enableAi={true} />
        </div>
      </div>
    </div>
  );
}
