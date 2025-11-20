import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { QuoteWizard } from "./QuoteWizard";
import heroBackground from "@assets/Untitled design_1763639882299.png";

interface HeroQuoteSectionProps {
  label: string;
  heading: string;
  subheading: string;
  defaultService?: string;
  defaultCity?: string;
  backgroundAlt?: string;
}

export function HeroQuoteSection({
  label,
  heading,
  subheading,
  defaultService,
  defaultCity,
  backgroundAlt = "Professional lawn care services in Kuna Idaho",
}: HeroQuoteSectionProps) {
  const [address, setAddress] = useState("");
  const [showFullWizard, setShowFullWizard] = useState(false);

  const handleGetStarted = () => {
    // Open full quote wizard
    setShowFullWizard(true);
  };

  return (
    <>
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBackground} 
            alt={backgroundAlt}
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60"></div>
        </div>

        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          {/* Label */}
          <p className="text-white text-sm sm:text-base font-medium text-center mb-4">
            {label}
          </p>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-white leading-tight mb-4">
            {heading}
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-center text-white/90 mb-8 sm:mb-10 md:mb-12">
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
