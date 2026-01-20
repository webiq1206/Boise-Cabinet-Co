import { ChevronUp, ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  calculateTotalPriceRange, 
  formatPriceRange,
  type ServiceMeasurements 
} from "@/lib/pricingUtils";

interface StickyQuoteSummaryProps {
  selectedServices: string[];
  serviceData: Record<string, any>;
  sharedMeasurements: ServiceMeasurements;
  propertyType?: string;
  frequency?: string;
  usingTypicalAssumptions?: boolean;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  showContinue?: boolean;
}

export function StickyQuoteSummary({
  selectedServices,
  serviceData,
  sharedMeasurements,
  propertyType = "residential",
  frequency = "one-time",
  usingTypicalAssumptions = false,
  onContinue,
  continueLabel = "Continue",
  continueDisabled = false,
  showContinue = true,
}: StickyQuoteSummaryProps) {
  const [expanded, setExpanded] = useState(false);

  // Calculate total price range
  const priceRange = calculateTotalPriceRange(
    selectedServices,
    serviceData,
    sharedMeasurements,
    propertyType,
    frequency
  );

  // Don't show if no services selected
  if (selectedServices.length === 0) {
    return null;
  }

  const hasValidPrice = priceRange.min > 0 || priceRange.max > 0;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg"
      data-testid="sticky-quote-summary"
    >
      {/* Expandable breakdown */}
      {expanded && priceRange.breakdown.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="space-y-2">
            {priceRange.breakdown.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">{item.serviceName}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatPriceRange(item.min, item.max)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main summary bar */}
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left side: Price range and service count */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-3 text-left hover-elevate rounded-lg px-2 py-1 -ml-2"
            data-testid="toggle-price-breakdown"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                  Estimated Range
                </span>
                {expanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span 
                  className="text-xl font-bold text-primary"
                  data-testid="price-range-display"
                >
                  {hasValidPrice ? formatPriceRange(priceRange.min, priceRange.max) : "Calculating..."}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {frequency === "one-time" ? "" : `/${frequency === "weekly" ? "week" : frequency === "bi-weekly" ? "2 weeks" : "month"}`}
                </span>
              </div>
              {usingTypicalAssumptions && hasValidPrice && (
                <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  Ballpark estimate (using typical measurements). Add measurements for a tighter range.
                </div>
              )}
            </div>
          </button>

          {/* Right side: Service count badge + Continue button */}
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-full"
              data-testid="service-count-badge"
            >
              <span className="text-sm font-semibold text-primary">
                {selectedServices.length}
              </span>
              <span className="text-xs text-primary/80">
                {selectedServices.length === 1 ? "service" : "services"}
              </span>
            </div>

            {showContinue && (
              <Button
                onClick={onContinue}
                disabled={continueDisabled}
                className="whitespace-nowrap"
                data-testid="summary-continue-button"
              >
                {continueLabel}
              </Button>
            )}
          </div>
        </div>

        {/* Frequency discount indicator */}
        {frequency !== "one-time" && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              {frequency === "weekly" ? "15%" : frequency === "bi-weekly" ? "10%" : "5%"} recurring discount applied
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
