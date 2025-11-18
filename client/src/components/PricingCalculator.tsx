import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { DollarSign, Calculator } from "lucide-react";

/**
 * PricingCalculator - Client-side pricing estimation tool
 * 
 * This component is intentionally client-side only (no backend persistence)
 * as it provides instant estimates for user convenience. Estimates are not
 * stored or used elsewhere in the application - they serve only to give
 * customers a quick ballpark figure before requesting an official quote.
 */

const services = [
  { value: "lawn-mowing", label: "Lawn Mowing", basePrice: 35 },
  { value: "aeration", label: "Core Aeration", basePrice: 75 },
  { value: "fertilization", label: "Fertilization", basePrice: 65 },
  { value: "edging", label: "Edging & Trimming", basePrice: 25 },
  { value: "cleanup", label: "Yard Cleanup", basePrice: 85 },
];

const propertySizes = [
  { value: "small", label: "Small (< 5,000 sq ft)", multiplier: 1 },
  { value: "medium", label: "Medium (5,000 - 10,000 sq ft)", multiplier: 1.5 },
  { value: "large", label: "Large (10,000 - 15,000 sq ft)", multiplier: 2 },
  { value: "xlarge", label: "Extra Large (> 15,000 sq ft)", multiplier: 2.5 },
];

const frequencies = [
  { value: "one-time", label: "One-Time Service", discount: 0 },
  { value: "weekly", label: "Weekly", discount: 0.15 },
  { value: "bi-weekly", label: "Bi-Weekly", discount: 0.10 },
  { value: "monthly", label: "Monthly", discount: 0.05 },
];

export function PricingCalculator() {
  const [selectedService, setSelectedService] = useState<string>("");
  const [propertySize, setPropertySize] = useState<string>("");
  const [frequency, setFrequency] = useState<string>("one-time");
  const [showEstimate, setShowEstimate] = useState(false);

  const calculatePrice = () => {
    const service = services.find(s => s.value === selectedService);
    const size = propertySizes.find(s => s.value === propertySize);
    const freq = frequencies.find(f => f.value === frequency);

    if (!service || !size || !freq) return 0;

    const basePrice = service.basePrice * size.multiplier;
    const discountedPrice = basePrice * (1 - freq.discount);
    return Math.round(discountedPrice);
  };

  const estimate = calculatePrice();
  const freq = frequencies.find(f => f.value === frequency);
  const discount = freq ? freq.discount * 100 : 0;

  const handleCalculate = () => {
    if (selectedService && propertySize) {
      setShowEstimate(true);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto" data-testid="card-pricing-calculator">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          <CardTitle>Service Pricing Calculator</CardTitle>
        </div>
        <CardDescription>
          Get an instant estimate for your lawn care needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Service Selection */}
        <div className="space-y-2">
          <Label htmlFor="service" data-testid="label-service">Select Service</Label>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger id="service" data-testid="select-service">
              <SelectValue placeholder="Choose a service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.value} value={service.value}>
                  {service.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Property Size */}
        <div className="space-y-2">
          <Label htmlFor="property-size" data-testid="label-property-size">Property Size</Label>
          <Select value={propertySize} onValueChange={setPropertySize}>
            <SelectTrigger id="property-size" data-testid="select-property-size">
              <SelectValue placeholder="Select property size" />
            </SelectTrigger>
            <SelectContent>
              {propertySizes.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Service Frequency */}
        <div className="space-y-3">
          <Label data-testid="label-frequency">Service Frequency</Label>
          <RadioGroup value={frequency} onValueChange={setFrequency}>
            {frequencies.map((freq) => (
              <div key={freq.value} className="flex items-center space-x-2">
                <RadioGroupItem value={freq.value} id={freq.value} data-testid={`radio-${freq.value}`} />
                <Label htmlFor={freq.value} className="font-normal cursor-pointer flex-1">
                  {freq.label}
                  {freq.discount > 0 && (
                    <span className="ml-2 text-sm text-primary font-medium">
                      Save {freq.discount * 100}%
                    </span>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Calculate Button */}
        <Button 
          onClick={handleCalculate} 
          className="w-full"
          disabled={!selectedService || !propertySize}
          data-testid="button-calculate"
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Calculate Estimate
        </Button>

        {/* Price Estimate */}
        {showEstimate && estimate > 0 && (
          <div className="mt-6 p-6 bg-primary/10 rounded-md border-2 border-primary" data-testid="result-estimate">
            <div className="text-center space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Estimated Price</div>
              <div className="text-4xl font-bold text-primary" data-testid="text-price">
                ${estimate}
              </div>
              <div className="text-sm text-muted-foreground">
                per {frequency === "one-time" ? "service" : frequency.replace("-", " ")} visit
              </div>
              {discount > 0 ? (
                <div className="text-sm font-medium text-primary">
                  Includes {discount}% recurring service discount!
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Select recurring service to save up to 15%
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Ready to get started?
              </p>
              <Button asChild data-testid="button-get-quote">
                <a href="/contact">Get Free Quote</a>
              </Button>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">
          Prices are estimates only. Final pricing may vary based on property condition and specific requirements.
          Contact us for an accurate quote.
        </p>
      </CardContent>
    </Card>
  );
}
