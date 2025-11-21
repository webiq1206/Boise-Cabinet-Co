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
  // Normalize city to lowercase for QuoteWizard compatibility (Select uses lowercase values)
  const normalizedCity = defaultCity?.toLowerCase();

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

            {/* Main Heading - Dark Text with Montserrat weight 400 */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-tight tracking-tight">
              {heading}
            </h1>

            {/* Subheading - Green Text */}
            <p className="text-base sm:text-lg md:text-xl text-primary">
              {subheading}
            </p>
          </div>

          {/* Right Column - Quote Wizard */}
          <div>
            <QuoteWizard 
              preselectedService={defaultService}
              preselectedCity={normalizedCity}
              defaultService={defaultService}
              defaultCity={normalizedCity}
            />
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
    </>
  );
}
