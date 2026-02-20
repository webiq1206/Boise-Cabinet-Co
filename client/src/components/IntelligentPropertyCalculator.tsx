import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MapPin, Home, CheckCircle2, Edit3, AlertCircle } from "lucide-react";
import { queryAssessor, getCountyFromCity } from "@/lib/assessors";
import type { PropertyData } from "@/lib/adaCountyAssessor";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapMeasureTool } from "@/components/MapMeasureTool";

interface IntelligentPropertyCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onMeasurementComplete?: (measurements: {
    lawnSqFt: number;
    lotPerimeterFt?: number;
    lawnPerimeterFt?: number;
    rooflineWithOverhangFt?: number;
    estimatedHedgeFt?: number;
  }) => void;
  initialAddress?: string;
  measurementType?: 'area' | 'linear' | 'both';
  cityContext?: string; // City from wizard (e.g., "Kuna")
}

export function IntelligentPropertyCalculator({
  isOpen,
  onClose,
  onMeasurementComplete,
  initialAddress,
  measurementType = 'area',
  cityContext,
}: IntelligentPropertyCalculatorProps) {
  const [address, setAddress] = useState(initialAddress || "");
  const [isSearching, setIsSearching] = useState(false);
  const [multipleProperties, setMultipleProperties] = useState<PropertyData[]>([]);
  const [selectedPropertyIndex, setSelectedPropertyIndex] = useState<number>(0);
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);
  const [mapMeasureOpen, setMapMeasureOpen] = useState(false);
  const [mapAreaSqFt, setMapAreaSqFt] = useState<number | null>(null);
  const [mapLinearFt, setMapLinearFt] = useState<number | null>(null);
  
  // Manual adjustment values
  const [manualLawnSqFt, setManualLawnSqFt] = useState<string>("");
  const [manualRoofLineFt, setManualRoofLineFt] = useState<string>("");

  // Sync address when initial address changes (auto-populate from wizard)
  useEffect(() => {
    if (initialAddress && initialAddress !== address) {
      setAddress(initialAddress);
    }
  }, [initialAddress]);

  const handleSearch = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    console.log('[IntelligentPropertyCalculator] handleSearch called with address:', address);
    
    if (!address.trim()) {
      setError("Please enter an address");
      setSuggestion(null);
      return;
    }

    setIsSearching(true);
    setError(null);
    setSuggestion(null);
    setPropertyData(null);
    setMultipleProperties([]);

    try {
      // Determine county from city context or address
      const county = getCountyFromCity(cityContext);
      console.log('[IntelligentPropertyCalculator] Using county:', county, 'from cityContext:', cityContext);
      
      // Query assessor with multi-county fallback
      const result = await queryAssessor({
        county,
        address,
        cityContext,
        enableFallback: true,
      });
      
      if (result.success && result.properties.length > 0) {
        if (result.properties.length === 1) {
          // Single match - auto-select
          const data = result.properties[0];
          setPropertyData(data);
          setManualLawnSqFt(data.estimatedLawnSqFt?.toString() || "");
          setManualRoofLineFt(data.estimatedRoofLineFt?.toString() || "");
        } else {
          // Multiple matches - show selection UI
          setMultipleProperties(result.properties);
          setSelectedPropertyIndex(0);
        }
        setError(null);
        setSuggestion(null);
      } else {
        setError(result.error || "Property not found.");
        setSuggestion(result.suggestion || null);
      }
    } catch (err) {
      console.error('[IntelligentPropertyCalculator] Search error:', err);
      setError("Unable to fetch property data. Please try again.");
      setSuggestion("Check your internet connection or try entering measurements manually.");
    } finally {
      setIsSearching(false);
    }
  };

  const handlePropertySelection = (index: number) => {
    setSelectedPropertyIndex(index);
  };

  const handleConfirmSelection = () => {
    if (multipleProperties.length > 0) {
      const selected = multipleProperties[selectedPropertyIndex];
      setPropertyData(selected);
      setManualLawnSqFt(selected.estimatedLawnSqFt?.toString() || "");
      setManualRoofLineFt(selected.estimatedRoofLineFt?.toString() || "");
      setMultipleProperties([]);
      // Clear error and suggestion states after successful selection
      setError(null);
      setSuggestion(null);
    }
  };

  const resetState = () => {
    // Reset all state to initial values when dialog closes
    setError(null);
    setSuggestion(null);
    setMultipleProperties([]);
    setPropertyData(null);
    setIsManualMode(false);
    setManualLawnSqFt("");
    setManualRoofLineFt("");
    setMapMeasureOpen(false);
    setMapAreaSqFt(null);
    setMapLinearFt(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleApply = () => {
    const lawnSqFt =
      parseInt(manualLawnSqFt) ||
      mapAreaSqFt ||
      propertyData?.estimatedLawnSqFt ||
      0;
    const roofLineFt =
      parseInt(manualRoofLineFt) ||
      mapLinearFt ||
      propertyData?.estimatedRoofLineFt ||
      0;
    
    // Validate based on measurement type
    if (measurementType === 'both' || measurementType === 'area') {
      if (lawnSqFt === 0) {
        setError("Please provide lawn area measurement.");
        return;
      }
    }

    // Pass all measurements to callback - including manual overrides
    if (onMeasurementComplete) {
      onMeasurementComplete({
        lawnSqFt: lawnSqFt,
        lotPerimeterFt: propertyData?.lotPerimeterFt,
        lawnPerimeterFt: propertyData?.lawnPerimeterFt,
        rooflineWithOverhangFt: roofLineFt || propertyData?.rooflineWithOverhangFt, // Use manual override!
        estimatedHedgeFt: propertyData?.estimatedHedgeFt,
      });
    }

    handleClose();
  };

  const needsLawnArea = measurementType === 'area' || measurementType === 'both';
  const needsRoofLine = measurementType === 'linear' || measurementType === 'both';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Intelligent Property Calculator</DialogTitle>
          <DialogDescription>
            Enter your address and we'll estimate property measurements using county parcel lookup when available, plus intelligent calculations. You can always adjust manually for accuracy.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-6 px-6 pb-6 overflow-y-auto">
          {/* Address Search */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="property-address">Property Address</Label>
              <div className="flex gap-2">
                <Input
                  id="property-address"
                  placeholder="e.g., 1234 Main St, Kuna, ID"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isSearching}
                  data-testid="input-property-address"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleSearch}
                  disabled={isSearching}
                  data-testid="button-search-property"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Find Property
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Error Message with Suggestion */}
          {error && (
            <Alert variant="destructive" data-testid="alert-error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">{error}</p>
                {suggestion && (
                  <p className="text-sm mt-2 opacity-90">{suggestion}</p>
                )}
                <div className="mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMapMeasureOpen(true)}
                    data-testid="button-open-map-measurement"
                  >
                    Use Map Measurement Tool
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Multiple Property Selection */}
          {multipleProperties.length > 0 && (
            <div className="space-y-4">
              <Alert data-testid="alert-multiple-matches">
                <AlertDescription>
                  <p className="font-medium mb-3">
                    We found {multipleProperties.length} properties matching your address. Please select the correct one:
                  </p>
                </AlertDescription>
              </Alert>

              <RadioGroup 
                value={selectedPropertyIndex.toString()} 
                onValueChange={(value) => handlePropertySelection(parseInt(value))}
              >
                <div className="space-y-2">
                  {multipleProperties.map((property, index) => (
                    <div
                      key={property.parcel}
                      className="flex items-center space-x-3 border rounded-lg p-3 hover-elevate"
                      data-testid={`radio-property-${index}`}
                    >
                      <RadioGroupItem value={index.toString()} id={`property-${index}`} />
                      <Label
                        htmlFor={`property-${index}`}
                        className="flex-1 cursor-pointer"
                        data-testid={`label-property-${index}`}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{property.address}</span>
                          <span className="text-sm text-muted-foreground">
                            {property.city}, Idaho • Parcel: {property.parcel}
                          </span>
                          {property.estimatedLawnSqFt && (
                            <span className="text-xs text-muted-foreground">
                              Est. Lawn: {property.estimatedLawnSqFt.toLocaleString()} sq ft
                            </span>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <Button
                onClick={handleConfirmSelection}
                className="w-full"
                data-testid="button-confirm-selection"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Use Selected Property
              </Button>
            </div>
          )}

          {/* Property Results */}
          {propertyData && (
            <div className="space-y-6">
              {/* Property Info */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm" data-testid="text-property-address">
                      {propertyData.address}
                    </p>
                    <p className="text-sm text-muted-foreground" data-testid="text-property-city">
                      {propertyData.city}, Idaho
                    </p>
                    <p className="text-xs text-muted-foreground mt-1" data-testid="text-property-parcel">
                      Parcel: {propertyData.parcel}
                    </p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* Auto-Calculated Measurements */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Calculated Measurements</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsManualMode(!isManualMode)}
                    data-testid="button-toggle-manual-mode"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isManualMode ? "Use Auto Values" : "Adjust Manually"}
                  </Button>
                </div>

                <Alert data-testid="alert-calculation-info">
                  <AlertDescription className="text-sm">
                    <strong>How we calculated this:</strong>
                    <ul className="mt-2 space-y-1 text-xs">
                      {propertyData.lotSizeSqFt && (
                        <li>• Estimated lot size: {propertyData.lotSizeSqFt.toLocaleString()} sq ft</li>
                      )}
                      {propertyData.buildingSqFt && (
                        <li>• Estimated building: {propertyData.buildingSqFt.toLocaleString()} sq ft</li>
                      )}
                      <li>
                        • Based on typical {propertyData.city} property characteristics
                      </li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {/* Lawn Area */}
                {needsLawnArea && (
                  <div className="space-y-2">
                    <Label htmlFor="lawn-area">Lawn Area (Square Feet)</Label>
                    {isManualMode ? (
                      <Input
                        id="lawn-area"
                        type="number"
                        value={manualLawnSqFt}
                        onChange={(e) => setManualLawnSqFt(e.target.value)}
                        placeholder="Enter lawn sq ft"
                        data-testid="input-manual-lawn-area"
                      />
                    ) : (
                      <div className="bg-primary/10 border border-primary/20 rounded-md p-3 flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary" data-testid="text-auto-lawn-area">
                          {(mapAreaSqFt || propertyData.estimatedLawnSqFt)?.toLocaleString() || "N/A"}
                        </span>
                        <span className="text-sm text-muted-foreground">sq ft</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Roof Line */}
                {needsRoofLine && (
                  <div className="space-y-2">
                    <Label htmlFor="roof-line">Roof Line / Perimeter (Linear Feet)</Label>
                    {isManualMode ? (
                      <Input
                        id="roof-line"
                        type="number"
                        value={manualRoofLineFt}
                        onChange={(e) => setManualRoofLineFt(e.target.value)}
                        placeholder="Enter linear feet"
                        data-testid="input-manual-roof-line"
                      />
                    ) : (
                      <div className="bg-primary/10 border border-primary/20 rounded-md p-3 flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary" data-testid="text-auto-roof-line">
                          {(mapLinearFt || propertyData.estimatedRoofLineFt)?.toLocaleString() || "N/A"}
                        </span>
                        <span className="text-sm text-muted-foreground">linear ft</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setMapMeasureOpen(true)}
                    data-testid="button-open-map-measurement-secondary"
                  >
                    Use Map Measurement Tool
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Draw your lawn area and/or roofline for the most accurate estimate.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* No Results State */}
          {!isSearching && !propertyData && !error && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">
                Enter your address above to get started
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports Ada and Canyon County properties
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-2 border-t">
          <Button variant="outline" onClick={handleClose} data-testid="button-cancel">
            Cancel
          </Button>
          {propertyData && (
            <Button
              onClick={handleApply}
              data-testid="button-apply-measurements"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Use These Measurements
            </Button>
          )}
        </div>
      </DialogContent>

      <MapMeasureTool
        isOpen={mapMeasureOpen}
        onClose={() => setMapMeasureOpen(false)}
        initialAddress={address}
        measurementType={measurementType === "both" ? "both" : measurementType}
        onMeasurementComplete={(sqft) => {
          setMapAreaSqFt(sqft);
          setManualLawnSqFt(String(sqft));
        }}
        onLinearMeasurementComplete={(feet) => {
          setMapLinearFt(feet);
          setManualRoofLineFt(String(feet));
        }}
      />
    </Dialog>
  );
}
