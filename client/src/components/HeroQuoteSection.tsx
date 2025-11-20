import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { QuoteWizard } from "./QuoteWizard";

interface HeroQuoteSectionProps {
  label: string;
  heading: string;
  subheading: string;
  defaultService?: string;
  defaultCity?: string;
}

export function HeroQuoteSection({
  label,
  heading,
  subheading,
  defaultService,
  defaultCity,
}: HeroQuoteSectionProps) {
  const [address, setAddress] = useState("");
  const [showFullWizard, setShowFullWizard] = useState(false);

  const handleGetStarted = () => {
    // Open full quote wizard
    setShowFullWizard(true);
  };

  return (
    <>
      <section className="bg-muted py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Label */}
          <p className="text-primary text-sm sm:text-base font-medium text-center mb-4">
            {label}
          </p>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-foreground leading-tight mb-4">
            {heading}
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-center text-muted-foreground mb-8 sm:mb-10 md:mb-12">
            {subheading}
          </p>

          {/* Quote Card */}
          <Card className="bg-white p-6 sm:p-8 shadow-lg max-w-md mx-auto">
            {/* Schedule CTA Button */}
            <Button
              onClick={handleGetStarted}
              className="w-full mb-6 text-base font-medium"
              size="lg"
              data-testid="button-schedule-now"
            >
              SCHEDULE NOW AND SAVE
            </Button>

            {/* Address Input */}
            <div className="mb-6">
              <Input
                type="text"
                placeholder="Start typing an address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onFocus={handleGetStarted}
                className="w-full text-base"
                data-testid="input-hero-address"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleGetStarted}
              className="w-full mb-6 text-base font-medium"
              size="lg"
              data-testid="button-hero-submit"
            >
              Submit
            </Button>

            {/* Progress Indicator */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="h-2 flex-1 bg-primary rounded-full"></div>
                <div className="h-2 flex-1 bg-muted rounded-full"></div>
                <div className="h-2 flex-1 bg-muted rounded-full"></div>
                <div className="h-2 flex-1 bg-muted rounded-full"></div>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Step 1 of 4
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Full Quote Wizard Dialog */}
      <Dialog open={showFullWizard} onOpenChange={setShowFullWizard}>
        <DialogContent className="max-w-2xl">
          <QuoteWizard
            defaultService={defaultService}
            defaultCity={defaultCity}
            defaultAddress={address}
            onClose={() => setShowFullWizard(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
