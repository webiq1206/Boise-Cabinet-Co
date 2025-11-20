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
  backgroundAlt?: string;
  backgroundImage?: string; // Optional custom background image
}

export function HeroQuoteSection({
  label,
  heading,
  subheading,
  defaultService,
  defaultCity,
  backgroundAlt = "Professional lawn care services in Kuna Idaho",
  backgroundImage,
}: HeroQuoteSectionProps) {
  const [address, setAddress] = useState("");
  const [showFullWizard, setShowFullWizard] = useState(false);

  const handleGetStarted = () => {
    // Open full quote wizard
    setShowFullWizard(true);
  };

  const heroContent = (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Column - Heading Content */}
          <div className="text-center md:text-left space-y-4">
            {/* Label */}
            <p className="text-primary text-sm sm:text-base font-medium">
              {label}
            </p>

            {/* Main Heading - Dark Text with Montserrat */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground leading-tight tracking-tight">
              {heading}
            </h1>

            {/* Subheading - Green Text */}
            <p className="text-base sm:text-lg md:text-xl text-primary">
              {subheading}
            </p>
          </div>

          {/* Right Column - Quote Card */}
          <div>
            <Card className="bg-white p-6 sm:p-8 shadow-lg">
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
        </div>
      </div>
    </section>
  );

  return (
    <>
      {backgroundImage ? (
        <div className="relative overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src={backgroundImage} 
              alt={backgroundAlt}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content Container */}
          <div className="relative z-10">
            {heroContent}
          </div>
        </div>
      ) : (
        heroContent
      )}

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
