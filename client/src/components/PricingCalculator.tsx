import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { DollarSign, Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  SERVICE_PRICING_CONFIG,
  calculateServicePriceRange,
  formatPriceRange,
  type ServiceMeasurements,
} from "@/lib/pricingUtils";

/**
 * PricingCalculator - Client-side pricing estimation tool
 * 
 * This component is intentionally client-side only (no backend persistence)
 * as it provides instant estimates for user convenience. Estimates are not
 * stored or used elsewhere in the application - they serve only to give
 * customers a quick ballpark figure before requesting an official quote.
 */

const services: { value: keyof typeof SERVICE_PRICING_CONFIG; label: string }[] = [
  // Lawn Care
  { value: "lawn-mowing", label: "Lawn Mowing & Edging" },
  { value: "aeration", label: "Core Aeration" },
  { value: "fertilization", label: "Fertilization" },
  { value: "weed-control", label: "Weed Control" },
  { value: "overseeding", label: "Overseeding" },
  { value: "dethatching", label: "Dethatching" },
  { value: "lawn-edging", label: "Lawn Edging" },
  { value: "lawn-renovation", label: "Lawn Renovation" },
  // Landscaping & Installation
  { value: "sod-installation", label: "Sod Installation" },
  { value: "mulch-installation", label: "Mulch Installation" },
  { value: "patio-installation", label: "Patio Installation" },
  { value: "retaining-walls", label: "Retaining Walls" },
  { value: "fire-pit-installation", label: "Fire Pit Installation" },
  { value: "hedge-trimming", label: "Hedge & Shrub Trimming" },
  // Irrigation
  { value: "sprinkler-system-installation", label: "Sprinkler System Installation" },
  { value: "sprinkler-blowout", label: "Sprinkler Winterization" },
  { value: "sprinkler-repair", label: "Sprinkler Repair" },
  { value: "irrigation-repair", label: "Irrigation Repair" },
  { value: "irrigation-maintenance", label: "Irrigation Maintenance" },
  // Tree Services
  { value: "tree-trimming", label: "Tree Trimming & Pruning" },
  { value: "tree-removal", label: "Tree Removal" },
  { value: "stump-grinding", label: "Stump Grinding" },
  // Seasonal
  { value: "spring-cleanup", label: "Spring Cleanup" },
  { value: "fall-cleanup", label: "Fall Cleanup" },
  { value: "seasonal-cleanup", label: "Seasonal Cleanup" },
  { value: "snow-removal", label: "Snow Removal" },
  // Lighting
  { value: "christmas-light-installation", label: "Christmas Light Installation" },
  { value: "landscape-lighting", label: "Landscape Lighting" },
];

const defaultSqFtByTier: Record<string, number> = {
  small: 4000,
  medium: 7500,
  large: 12000,
  xlarge: 18000,
};

const propertySizeTiers = [
  { value: "small", label: "Small (about 4,000 sq ft)" },
  { value: "medium", label: "Medium (about 7,500 sq ft)" },
  { value: "large", label: "Large (about 12,000 sq ft)" },
  { value: "xlarge", label: "Extra Large (about 18,000 sq ft)" },
] as const;

const frequencies = [
  { value: "one-time", label: "One-Time Service", discount: 0 },
  { value: "weekly", label: "Weekly", discount: 0.15 },
  { value: "bi-weekly", label: "Bi-Weekly", discount: 0.10 },
  { value: "monthly", label: "Monthly", discount: 0.05 },
];

export function PricingCalculator() {
  const [selectedService, setSelectedService] = useState<string>("");
  const [propertySizeTier, setPropertySizeTier] = useState<string>("medium");
  const [frequency, setFrequency] = useState<string>("one-time");
  const [linearFeet, setLinearFeet] = useState<string>("100");
  const [zones, setZones] = useState<string>("6");
  const [count, setCount] = useState<string>("1");
  const [fixtureCount, setFixtureCount] = useState<string>("10");
  const [shrubCount, setShrubCount] = useState<string>("5");
  const [stumpDiameter, setStumpDiameter] = useState<string>("12");
  const [cubicYards, setCubicYards] = useState<string>("3");
  const [lightingType, setLightingType] = useState<string>("Traditional Seasonal");
  const [showEstimate, setShowEstimate] = useState(false);

  // Check URL params for pre-selected service
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const serviceParam = params.get("service");
    if (serviceParam && SERVICE_PRICING_CONFIG[serviceParam as keyof typeof SERVICE_PRICING_CONFIG]) {
      setSelectedService(serviceParam);
    }
  }, []);

  const serviceId = selectedService as keyof typeof SERVICE_PRICING_CONFIG | "";
  const config = serviceId ? SERVICE_PRICING_CONFIG[serviceId] : undefined;

  const sqFt = defaultSqFtByTier[propertySizeTier] || 7500;
  const asPositiveNumber = (v: string): number | undefined => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };

  const measurements: ServiceMeasurements = (() => {
    if (!config) return {};
    switch (config.unit) {
      case "sqft":
      case "per_sqft":
        return { propertySize: sqFt };
      case "linear_ft":
        return { linearFeet: asPositiveNumber(linearFeet) || 100, lightingType };
      case "per_zone":
        return { zones: asPositiveNumber(zones) || 6 };
      case "per_tree":
        return { treeCount: asPositiveNumber(count) || 1 };
      case "per_inch":
        return { treeCount: asPositiveNumber(stumpDiameter) || 12 };
      case "per_shrub":
        return { treeCount: asPositiveNumber(shrubCount) || 5 };
      case "per_fixture":
        return { fixtureCount: asPositiveNumber(fixtureCount) || 10 };
      case "per_cubic_yard":
        return { propertySize: (asPositiveNumber(cubicYards) || 3) * 100 };
      case "base_service":
      case "base_project":
        return {};
      default:
        return {};
    }
  })();

  const range = serviceId
    ? calculateServicePriceRange(serviceId, measurements, "residential", frequency)
    : null;

  const freq = frequencies.find(f => f.value === frequency);
  const discount = freq ? freq.discount * 100 : 0;

  const handleCalculate = () => {
    if (selectedService) {
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

        {/* Measurement inputs (simple, based on selected service) */}
        {config?.unit === "sqft" || config?.unit === "per_sqft" ? (
          <div className="space-y-2">
            <Label htmlFor="property-size" data-testid="label-property-size">Approximate Lawn/Area Size</Label>
            <Select value={propertySizeTier} onValueChange={setPropertySizeTier}>
              <SelectTrigger id="property-size" data-testid="select-property-size">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {propertySizeTiers.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">This is used to produce a ballpark estimate. Exact pricing depends on measurements and complexity.</p>
          </div>
        ) : null}

        {config?.unit === "linear_ft" ? (
          <div className="space-y-3">
            {serviceId === "christmas-light-installation" && (
              <div className="space-y-2">
                <Label htmlFor="lighting-type">Lighting Type</Label>
                <Select value={lightingType} onValueChange={setLightingType}>
                  <SelectTrigger id="lighting-type" data-testid="select-lighting-type">
                    <SelectValue placeholder="Select lighting type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Traditional Seasonal">Traditional Seasonal</SelectItem>
                    <SelectItem value="Permanent Lighting">Permanent Lighting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="linear-feet">Linear Feet</Label>
              <Input
                id="linear-feet"
                type="number"
                inputMode="numeric"
                value={linearFeet}
                onChange={(e) => setLinearFeet(e.target.value)}
                placeholder="e.g., 100"
                data-testid="input-linear-feet"
              />
            </div>
          </div>
        ) : null}

        {config?.unit === "per_zone" ? (
          <div className="space-y-2">
            <Label htmlFor="zones">Number of Zones</Label>
            <Input
              id="zones"
              type="number"
              inputMode="numeric"
              value={zones}
              onChange={(e) => setZones(e.target.value)}
              placeholder="e.g., 6"
              data-testid="input-zones"
            />
          </div>
        ) : null}

        {config?.unit === "per_tree" ? (
          <div className="space-y-2">
            <Label htmlFor="count">Number of Trees</Label>
            <Input
              id="count"
              type="number"
              inputMode="numeric"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder="e.g., 1"
              data-testid="input-count"
            />
          </div>
        ) : null}

        {config?.unit === "per_fixture" ? (
          <div className="space-y-2">
            <Label htmlFor="fixture-count">Number of Fixtures</Label>
            <Input
              id="fixture-count"
              type="number"
              inputMode="numeric"
              value={fixtureCount}
              onChange={(e) => setFixtureCount(e.target.value)}
              placeholder="e.g., 10"
              data-testid="input-fixture-count"
            />
          </div>
        ) : null}

        {config?.unit === "per_shrub" ? (
          <div className="space-y-2">
            <Label htmlFor="shrub-count">Number of Shrubs</Label>
            <Input
              id="shrub-count"
              type="number"
              inputMode="numeric"
              value={shrubCount}
              onChange={(e) => setShrubCount(e.target.value)}
              placeholder="e.g., 5"
              data-testid="input-shrub-count"
            />
          </div>
        ) : null}

        {config?.unit === "per_inch" ? (
          <div className="space-y-2">
            <Label htmlFor="stump-diameter">Stump Diameter (inches)</Label>
            <Input
              id="stump-diameter"
              type="number"
              inputMode="numeric"
              value={stumpDiameter}
              onChange={(e) => setStumpDiameter(e.target.value)}
              placeholder="e.g., 12"
              data-testid="input-stump-diameter"
            />
          </div>
        ) : null}

        {config?.unit === "per_cubic_yard" ? (
          <div className="space-y-2">
            <Label htmlFor="cubic-yards">Cubic Yards of Mulch</Label>
            <Input
              id="cubic-yards"
              type="number"
              inputMode="numeric"
              value={cubicYards}
              onChange={(e) => setCubicYards(e.target.value)}
              placeholder="e.g., 3"
              data-testid="input-cubic-yards"
            />
            <p className="text-xs text-muted-foreground">1 cubic yard covers approximately 100 sq ft at 3" depth</p>
          </div>
        ) : null}

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
          disabled={!selectedService}
          data-testid="button-calculate"
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Calculate Estimate
        </Button>

        {/* Price Estimate */}
        {showEstimate && range && (
          <div className="mt-6 p-6 bg-primary/10 rounded-md border-2 border-primary" data-testid="result-estimate">
            <div className="text-center space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Estimated Range</div>
              <div className="text-3xl md:text-4xl font-bold text-primary" data-testid="text-price-range">
                {formatPriceRange(range.min, range.max)}
              </div>
              <div className="text-sm text-muted-foreground">
                Typical estimate: <span className="font-medium text-foreground">${range.typical.toLocaleString()}</span>
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
                <a href="/get-quote">Get Free Quote</a>
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
