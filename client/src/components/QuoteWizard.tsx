import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MapPin, CheckCircle2, Calendar, DollarSign, Package, Info, ChevronDown, AlertCircle } from "lucide-react";
import { IntelligentPropertyCalculator } from "@/components/IntelligentPropertyCalculator";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { ServiceFieldsRenderer, validateServiceData } from "@/components/ServiceFieldsRenderer";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SERVICE_FIELD_CONFIGS, requiresPropertySize } from "@shared/serviceFieldConfig";
import { PRIORITY_SERVICES, CITIES } from "@shared/contentData";

// Step 1: Basic Property Info
const step1Schema = z.object({
  address: z.string().optional(),
  city: z.string().min(1, "Please select your city"),
  propertyType: z.enum(["residential", "commercial", "hoa"]).optional(),
});

// Step 2: Service Selection
const step2Schema = z.object({
  selectedServices: z.array(z.string()).min(1, "Please select at least one service"),
});

// Step 3: Contact Info
const step3Schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  preferredDate: z.string().optional(),
  message: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

interface QuoteLineItem {
  serviceId: string;
  serviceName: string;
  basePrice: number;
  adjustedPrice: number;
  description: string;
  calculationExplanation?: string;
}

interface QuoteData {
  lineItems: QuoteLineItem[];
  subtotal: number;
  tax?: number;
  total: number;
  aiAnalysis?: any;
}

interface QuoteWizardProps {
  onClose?: () => void;
  preselectedService?: string;
  preselectedCity?: string;
  defaultService?: string;
  defaultCity?: string;
  defaultAddress?: string;
}

export function QuoteWizard({ 
  onClose, 
  preselectedService, 
  preselectedCity,
  defaultService,
  defaultCity,
  defaultAddress 
}: QuoteWizardProps) {
  const [step, setStep] = useState(1);
  const [mapOpen, setMapOpen] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [serviceData, setServiceData] = useState<Record<string, Record<string, any>>>({});
  const [calculatedPropertySize, setCalculatedPropertySize] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const { toast } = useToast();

  // Step forms
  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      city: defaultCity || preselectedCity || "Kuna",
      address: defaultAddress || "",
      propertyType: "residential",
    },
  });

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      selectedServices: preselectedService || defaultService ? [preselectedService || defaultService!] : [],
    },
  });

  const form3 = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      preferredDate: "",
      message: "",
    },
  });

  // Watch selected services to show/hide map tool
  const selectedServices = form2.watch("selectedServices") || [];
  const needsPropertySize = requiresPropertySize(selectedServices);

  // Auto-select preselected service on mount
  useEffect(() => {
    if (preselectedService || defaultService) {
      const serviceToSelect = preselectedService || defaultService!;
      form2.setValue("selectedServices", [serviceToSelect]);
    }
  }, [preselectedService, defaultService]);

  // Scroll to top of form when step changes (but not on initial page load)
  useEffect(() => {
    if (isInitialMount.current) {
      // Skip scroll on initial mount
      isInitialMount.current = false;
      return;
    }
    
    // Only scroll when user navigates between steps
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [step]);

  // Quote generation mutation
  const getQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/quotes/calculate", data);
      return await res.json();
    },
    onSuccess: (data) => {
      setQuoteData(data);
      setStep(4);
      setErrorMessage(null);
      // Popup disabled per user request - quote results are already visible on page
      // toast({
      //   title: "Quote Generated!",
      //   description: `Your itemized quote is ready: $${data.total?.toLocaleString() || '0'}`,
      // });
    },
    onError: (error: any) => {
      console.error("Quote calculation error:", error);
      setErrorMessage(error?.message || "Failed to generate quote. Please try again.");
      // Popup disabled per user request - error will be shown inline on the form
      // toast({
      //   title: "Error Generating Quote",
      //   description: error?.message || "Failed to generate quote. Please try again.",
      //   variant: "destructive",
      // });
    },
  });

  // Final submission mutation
  const submitQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      // First, save the quote
      const quoteRes = await apiRequest("POST", "/api/quotes", data);
      const quoteResult = await quoteRes.json();
      
      // Wait 4 seconds before creating lead to avoid Resend rate limit
      // Quote emails: T=0s (admin), T=2s (customer)
      // Lead email: T=4s (admin lead notification)
      // This ensures 2+ seconds between each email
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Then, create a lead from the quote
      // Note: The backend will automatically calculate pricing via POST /api/leads route
      try {
        const leadData = {
          quoteId: quoteResult.id,
          name: data.name,
          email: data.email,
          phone: data.phone || "",
          address: data.address,
          city: data.city,
          propertyType: data.propertyType || "residential",
          serviceType: data.serviceType || (data.selectedServices && data.selectedServices[0]) || "lawn-care",
          selectedServices: data.selectedServices || [],
          frequency: data.frequency || "one-time",
          finalQuote: data.quote?.toString() || quoteData?.total?.toString() || "0",
          lineItems: data.lineItems || [],
          serviceData: data.serviceData || {},
          message: data.message || "",
        };
        
        await apiRequest("POST", "/api/leads", leadData);
      } catch (leadError) {
        console.error("Failed to create lead:", leadError);
        // Don't fail the whole submission if lead creation fails
      }
      
      return quoteResult;
    },
    onSuccess: () => {
      setErrorMessage(null);
      // Popup disabled per user request - quote submission is already visible on page
      // toast({
      //   title: "Quote Request Submitted!",
      //   description: "We'll contact you shortly to confirm your service.",
      // });
    },
    onError: (error: any) => {
      console.error("Quote submission error:", error);
      setErrorMessage(error?.message || "Failed to submit quote request. Please try again.");
      // Popup disabled per user request - error will be shown inline on the form
      // toast({
      //   title: "Submission Failed",
      //   description: error?.message || "Failed to submit quote request.",
      //   variant: "destructive",
      // });
    },
  });

  // Step handlers
  const handleStep1Submit = (data: Step1Data) => {
    // Auto-populate property size for all services if calculated from address
    if (calculatedPropertySize) {
      const updatedServiceData: Record<string, Record<string, any>> = { ...serviceData };
      
      // Find services that need property size and auto-populate
      selectedServices.forEach(serviceId => {
        const config = SERVICE_FIELD_CONFIGS.find(c => c.serviceId === serviceId);
        if (config?.fields?.some((f: any) => f.name === 'propertySize')) {
          if (!updatedServiceData[serviceId]) {
            updatedServiceData[serviceId] = {};
          }
          // Only set if not already manually set
          if (!updatedServiceData[serviceId].propertySize) {
            updatedServiceData[serviceId].propertySize = calculatedPropertySize;
          }
        }
      });
      
      setServiceData(updatedServiceData);
    }
    
    setStep(2);
  };

  const handleStep2Submit = (data: Step2Data) => {
    // Validate service-specific data
    const validation = validateServiceData(data.selectedServices, serviceData);
    if (!validation.valid) {
      setErrorMessage(validation.errors[0]);
      // Popup disabled per user request - validation errors shown inline in the form
      // toast({
      //   title: "Missing Information",
      //   description: validation.errors[0],
      //   variant: "destructive",
      // });
      console.warn("Validation failed:", validation.errors[0]);
      return;
    }
    setErrorMessage(null);
    setStep(3);
  };

  const handleStep3Submit = async (data: Step3Data) => {
    // Build submission payload
    const step1Data = form1.getValues();
    const step2Data = form2.getValues();

    // Extract property size from serviceData if available (using Number.isFinite guard)
    let extractedPropertySize: number | undefined = undefined;
    for (const serviceId of step2Data.selectedServices) {
      const serviceInfo = serviceData[serviceId];
      const size = serviceInfo?.propertySize;
      
      // Only use if it's a valid finite number
      if (typeof size === 'number' && Number.isFinite(size) && size > 0) {
        extractedPropertySize = size;
        break;
      }
    }

    // Build payload - only include propertySize if we have a valid number
    const fullData: any = {
      // Customer info
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      
      // Property details
      address: step1Data.address || "",
      city: step1Data.city,
      propertyType: step1Data.propertyType || "residential",
      
      // Service details
      serviceType: step2Data.selectedServices[0], // Primary service
      selectedServices: step2Data.selectedServices,
      serviceData: serviceData,
      frequency: "one-time", // Can be made dynamic later
      
      // Scheduling
      scheduledDate: data.preferredDate ? new Date(data.preferredDate).toISOString() : undefined,
      message: data.message || `Multi-service quote request for: ${step2Data.selectedServices.join(", ")}`,
      status: "pending",
    };

    // Only add propertySize if we extracted a valid number
    if (extractedPropertySize !== undefined) {
      fullData.propertySize = extractedPropertySize;
    }

    // Generate quote first
    await getQuoteMutation.mutateAsync(fullData);
    
    // Then submit with quote data
    const submissionData = {
      ...fullData,
      aiAnalysis: quoteData?.aiAnalysis,
      baseCost: quoteData?.subtotal || 0,
      adjustedCost: quoteData?.subtotal || 0,
      finalQuote: quoteData?.total || 0,
      lineItems: quoteData?.lineItems || [],
    };

    submitQuoteMutation.mutate(submissionData);
  };

  const handleServiceDataChange = (serviceId: string, fieldName: string, value: any) => {
    // Update the field for the specific service only
    setServiceData(prev => ({
      ...prev,
      [serviceId]: {
        ...(prev[serviceId] || {}),
        [fieldName]: value,
      },
    }));
  };

  const handleMeasurementComplete = (measurements: {
    lawnSqFt: number;
    lotPerimeterFt?: number;
    lawnPerimeterFt?: number;
    rooflineWithOverhangFt?: number;
    estimatedHedgeFt?: number;
  }) => {
    // Generic mapping using SERVICE_FIELD_CONFIGS - no hard-coded service IDs
    selectedServices.forEach(serviceId => {
      const config = SERVICE_FIELD_CONFIGS.find(c => c.serviceId === serviceId);
      if (!config) return;

      // Find the field that needs auto-population
      const measurementField = config.fields.find(f => 
        f.unit === 'linear feet' || f.unit === 'sq ft'
      );
      
      if (!measurementField) return;

      // Map measurement based on field unit and service type
      if (measurementField.unit === 'sq ft' && measurements.lawnSqFt) {
        handleServiceDataChange(serviceId, measurementField.name, measurements.lawnSqFt);
      } else if (measurementField.unit === 'linear feet') {
        // Determine which linear measurement to use based on service type
        let linearValue: number | undefined;
        
        if (serviceId.includes('fence')) {
          linearValue = measurements.lotPerimeterFt;
        } else if (serviceId.includes('christmas') || serviceId.includes('light')) {
          linearValue = measurements.rooflineWithOverhangFt;
        } else if (serviceId.includes('hedge')) {
          linearValue = measurements.estimatedHedgeFt;
        } else if (serviceId.includes('edging')) {
          linearValue = measurements.lawnPerimeterFt;
        } else if (serviceId.includes('retaining')) {
          linearValue = measurements.lotPerimeterFt;
        }
        
        if (linearValue) {
          handleServiceDataChange(serviceId, measurementField.name, linearValue);
        }
      }
    });

    setMapOpen(false);
    // Popup disabled per user request - measurements are applied silently
    // toast({
    //   title: "Measurements Applied",
    //   description: "Property measurements have been calculated and applied to your services.",
    // });
  };

  // Determine measurement type based on selected services
  const getMeasurementType = (): 'area' | 'linear' | 'both' | null => {
    const hasAreaService = selectedServices.some(id => {
      const config = SERVICE_FIELD_CONFIGS.find(c => c.serviceId === id);
      return config?.requiresPropertySize;
    });

    const hasLinearService = selectedServices.some(id => {
      const config = SERVICE_FIELD_CONFIGS.find(c => c.serviceId === id);
      return config?.fields.some(f => f.name === "linearFeet");
    });

    if (hasAreaService && hasLinearService) return 'both';
    if (hasAreaService) return 'area';
    if (hasLinearService) return 'linear';
    return null;
  };

  const toggleService = (serviceId: string) => {
    const current = form2.getValues("selectedServices") || [];
    const updated = current.includes(serviceId)
      ? current.filter(id => id !== serviceId)
      : [...current, serviceId];
    form2.setValue("selectedServices", updated);
  };

  return (
    <div ref={formRef} className="max-w-4xl mx-auto p-4">
      {/* Inline Error Display */}
      {errorMessage && (
        <Alert variant="destructive" className="mb-6" data-testid="inline-error-message">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-1 sm:gap-2">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base ${
                  s < step ? "bg-primary text-primary-foreground" : 
                  s === step ? "bg-primary text-primary-foreground" : 
                  "bg-muted text-muted-foreground"
                }`}
                data-testid={`step-indicator-${s}`}
              >
                {s < step ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : s}
              </div>
              <span className={`text-xs sm:text-sm font-medium hidden sm:inline ${s <= step ? "text-foreground" : "text-muted-foreground"}`}>
                {s === 1 ? "Property" : s === 2 ? "Services" : "Quote"}
              </span>
              {s < 3 && <div className="w-8 sm:w-12 h-0.5 bg-muted" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Property Details */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Property Details
            </CardTitle>
            <CardDescription>Tell us about your property</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form1.handleSubmit(handleStep1Submit)} className="space-y-6">
              <div>
                <Label htmlFor="address">
                  Street Address <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
                </Label>
                <AddressAutocomplete
                  id="address"
                  value={form1.watch("address") || ""}
                  onChange={(value) => form1.setValue("address", value)}
                  city={form1.watch("city")}
                  placeholder="123 Main St"
                  data-testid="input-address"
                  onPropertySizeCalculated={(sqft) => {
                    setCalculatedPropertySize(sqft);
                  }}
                  onAddressSelect={(result) => {
                    // Helper function to normalize city names
                    const normalizeCity = (cityName: string): string => {
                      return cityName
                        .trim()
                        .toLowerCase()
                        .replace(/\s+(city|town|village)$/i, '') // Remove common suffixes
                        .trim();
                    };

                    // Helper function to find matching city in CITIES array
                    // useExact: if true, only exact matches are allowed (prevents street name false positives)
                    const findMatchingCity = (cityName: string, useExact: boolean = false) => {
                      const normalized = normalizeCity(cityName);
                      return CITIES.find(c => {
                        const cityNormalized = normalizeCity(c.name);
                        if (useExact) {
                          // Exact match only (for fallback label parsing)
                          return cityNormalized === normalized;
                        } else {
                          // Flexible matching for structured address fields
                          return cityNormalized === normalized || 
                                 normalized.includes(cityNormalized) ||
                                 cityNormalized.includes(normalized);
                        }
                      });
                    };
                    
                    // Extract city from Nominatim result and auto-populate the city dropdown
                    let extractedCity: string | undefined;
                    let cityMatch: typeof CITIES[0] | undefined;
                    
                    // 1. Try from result.raw.address (Nominatim format)
                    if (result.raw?.address) {
                      const rawCity = result.raw.address.city || result.raw.address.town || result.raw.address.village;
                      if (rawCity) {
                        cityMatch = findMatchingCity(rawCity);
                        if (cityMatch) {
                          extractedCity = rawCity;
                        }
                      }
                    }
                    
                    // 2. Try from result.raw directly (some providers)
                    if (!cityMatch && result.raw) {
                      const rawCity = result.raw.city || result.raw.town || result.raw.village;
                      if (rawCity) {
                        cityMatch = findMatchingCity(rawCity);
                        if (cityMatch) {
                          extractedCity = rawCity;
                        }
                      }
                    }
                    
                    // 3. Try parsing from the label - scan all tokens (fallback)
                    if (!cityMatch && result.label) {
                      // Label format: "2283, East Kuna Road, Kuna, Ada County, Idaho..."
                      const parts = result.label.split(',').map(p => p.trim());
                      // Scan through all parts to find a matching city
                      // Use exact matching to avoid false positives (e.g., "West Meridian Road" shouldn't match "Meridian")
                      for (const part of parts) {
                        const match = findMatchingCity(part, true); // true = exact match only
                        if (match) {
                          cityMatch = match;
                          extractedCity = part;
                          break;
                        }
                      }
                    }
                    
                    if (cityMatch) {
                      // Set the city in the form using the canonical city name
                      form1.setValue("city", cityMatch.name);
                    }
                  }}
                />
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <select
                  id="city"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  {...form1.register("city")}
                  defaultValue={form1.getValues("city")}
                  data-testid="select-city"
                >
                  {CITIES.map((city) => (
                    <option key={city.slug} value={city.name}>{city.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="propertyType">Property Type <span className="text-muted-foreground text-sm font-normal">(Optional)</span></Label>
                <RadioGroup
                  value={form1.watch("propertyType") || "residential"}
                  onValueChange={(value: any) => form1.setValue("propertyType", value)}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                  <Label
                    htmlFor="residential"
                    className="flex items-center gap-2 rounded-md border border-input p-4 cursor-pointer hover-elevate"
                  >
                    <RadioGroupItem value="residential" id="residential" data-testid="radio-residential" />
                    <span>Residential</span>
                  </Label>
                  <Label
                    htmlFor="commercial"
                    className="flex items-center gap-2 rounded-md border border-input p-4 cursor-pointer hover-elevate"
                  >
                    <RadioGroupItem value="commercial" id="commercial" data-testid="radio-commercial" />
                    <span>Commercial</span>
                  </Label>
                  <Label
                    htmlFor="hoa"
                    className="flex items-center gap-2 rounded-md border border-input p-4 cursor-pointer hover-elevate"
                  >
                    <RadioGroupItem value="hoa" id="hoa" data-testid="radio-hoa" />
                    <span>HOA</span>
                  </Label>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full" size="lg" data-testid="button-continue-step1">
                Continue to Services
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Service Selection */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Select Services
            </CardTitle>
            <CardDescription>Choose one or more services (select multiple to get an itemized quote)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form2.handleSubmit(handleStep2Submit)} className="space-y-6">
              {/* Service Categories with Accordions */}
              <Accordion type="multiple" className="w-full">
                {[
                  { category: "lawn", title: "Lawn Care Services" },
                  { category: "hardscape", title: "Hardscape & Patio" },
                  { category: "irrigation", title: "Irrigation & Sprinklers" },
                  { category: "lighting", title: "Lighting Services" },
                  { category: "trees", title: "Tree Services" },
                  { category: "seasonal", title: "Seasonal Services" },
                ].map(({ category, title }) => {
                  const categoryServices = SERVICE_FIELD_CONFIGS.filter(c => c.category === category);
                  if (categoryServices.length === 0) return null;

                  return (
                    <AccordionItem key={category} value={category} data-testid={`accordion-${category}`}>
                      <AccordionTrigger className="text-sm font-medium uppercase tracking-wide hover:no-underline">
                        {title}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-3 sm:grid-cols-2 pt-2">
                          {categoryServices.map((service) => {
                            const isSelected = selectedServices.includes(service.serviceId);
                            const serviceContent = PRIORITY_SERVICES.find((s) => s.slug === service.serviceId);
                            const hasPricing = serviceContent?.pricingGuidance;
                            
                            return (
                              <div
                                key={service.serviceId}
                                className={`rounded-md border ${
                                  isSelected ? "border-primary bg-primary/5" : "border-input"
                                }`}
                              >
                                <Label
                                  htmlFor={`service-${service.serviceId}`}
                                  className="flex items-start gap-3 p-4 cursor-pointer hover-elevate"
                                >
                                  <Checkbox
                                    id={`service-${service.serviceId}`}
                                    checked={isSelected}
                                    onCheckedChange={() => toggleService(service.serviceId)}
                                    data-testid={`checkbox-service-${service.serviceId}`}
                                  />
                                  <div className="flex-1">
                                    <div className="font-medium">{service.serviceName}</div>
                                  </div>
                                </Label>
                                
                                {hasPricing && (
                                  <div className="px-4 pb-3">
                                    <Collapsible>
                                      <CollapsibleTrigger 
                                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        data-testid={`pricing-toggle-${service.serviceId}`}
                                        asChild
                                      >
                                        <button type="button" className="flex items-center gap-1">
                                          <ChevronDown className="w-3 h-3" />
                                          <span>Typical Pricing</span>
                                        </button>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent className="mt-2">
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                          {serviceContent.pricingGuidance}
                                        </p>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>

              {/* Intelligent Property Calculator (service-aware) */}
              {getMeasurementType() && (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="default"
                    className="w-full"
                    onClick={() => setMapOpen(true)}
                    data-testid="button-open-calculator"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {getMeasurementType() === 'linear' 
                      ? 'Measure Linear Features'
                      : getMeasurementType() === 'both'
                      ? 'Calculate Property Size'
                      : 'Calculate Property Size'
                    }
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    {getMeasurementType() === 'linear' 
                      ? 'Trace roof lines, fence lines, or other linear features'
                      : getMeasurementType() === 'both'
                      ? 'Auto-calculate lawn area from address and measure linear features'
                      : 'Enter your address to get automatic property measurements'
                    }
                  </p>
                </div>
              )}

              {/* Service-Specific Fields */}
              {selectedServices.length > 0 && (
                <ServiceFieldsRenderer
                  selectedServices={selectedServices}
                  serviceData={serviceData}
                  onChange={handleServiceDataChange}
                />
              )}

              {form2.formState.errors.selectedServices && (
                <p className="text-sm text-destructive">{form2.formState.errors.selectedServices.message}</p>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                  data-testid="button-back-step2"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={selectedServices.length === 0}
                  data-testid="button-continue-step2"
                >
                  Continue to Quote
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Contact Info */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Quote Information
            </CardTitle>
            <CardDescription>How can we reach you?</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form3.handleSubmit(handleStep3Submit)} className="space-y-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  {...form3.register("name")}
                  placeholder="John Doe"
                  data-testid="input-name"
                />
                {form3.formState.errors.name && (
                  <p className="text-sm text-destructive mt-1">{form3.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form3.register("email")}
                  placeholder="john@example.com"
                  data-testid="input-email"
                />
                {form3.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">{form3.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...form3.register("phone")}
                  placeholder="(208) 352-2011"
                  data-testid="input-phone"
                />
                {form3.formState.errors.phone && (
                  <p className="text-sm text-destructive mt-1">{form3.formState.errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="preferredDate">Preferred Start Date <span className="text-muted-foreground text-sm font-normal">(Optional)</span></Label>
                <Input
                  id="preferredDate"
                  type="date"
                  {...form3.register("preferredDate")}
                  data-testid="input-preferred-date"
                />
              </div>

              <div>
                <Label htmlFor="message">Additional Notes <span className="text-muted-foreground text-sm font-normal">(Optional)</span></Label>
                <Input
                  id="message"
                  {...form3.register("message")}
                  placeholder="Any special requests or details..."
                  data-testid="input-message"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                  data-testid="button-back-step3"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={getQuoteMutation.isPending || submitQuoteMutation.isPending}
                  data-testid="button-submit-quote"
                >
                  {getQuoteMutation.isPending || submitQuoteMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Quote...
                    </>
                  ) : (
                    "Get My Quote"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Quote Results */}
      {step === 4 && quoteData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Your Itemized Quote
            </CardTitle>
            <CardDescription>Here's your personalized pricing breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Line Items */}
            <div className="space-y-3">
              {quoteData.lineItems.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-md border border-border"
                  data-testid={`quote-line-item-${index}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium">{item.serviceName}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">${item.adjustedPrice.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  {/* Collapsible Calculation Explanation */}
                  {item.calculationExplanation && (
                    <Collapsible className="mt-3">
                      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid={`calculation-toggle-${index}`}>
                        <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                        <span>How is this calculated?</span>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 pl-6">
                        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border border-border/50">
                          {item.calculationExplanation}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              ))}
            </div>

            {/* Estimated Total */}
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Estimated Total</span>
                <span className="text-primary" data-testid="text-quote-total">${quoteData.total.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground italic">
                * This is an estimated price based on typical property conditions. Final pricing will be confirmed after site assessment.
              </p>
            </div>

            {/* Pricing Guidance for Selected Services */}
            {selectedServices.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Typical Pricing for Your Services
                </h3>
                {selectedServices.map((serviceId) => {
                  const service = PRIORITY_SERVICES.find(s => s.slug === serviceId);
                  if (!service?.pricingGuidance) return null;
                  
                  return (
                    <div
                      key={serviceId}
                      className="p-4 rounded-md bg-muted/30 border border-border/50"
                      data-testid={`pricing-guidance-${serviceId}`}
                    >
                      <div className="font-medium text-sm mb-1">{service.name}</div>
                      <div className="text-sm text-muted-foreground">{service.pricingGuidance}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quote Validity & Important Terms */}
            <div className="space-y-4 border-t border-border pt-4">
              <h3 className="text-sm font-semibold">Important Information</h3>
              
              <Alert className="bg-muted/50 border-border">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm space-y-2">
                  <p className="font-medium">Quote Validity & Terms:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li><strong>Quote Valid:</strong> This estimate is valid for 30 days from today</li>
                    <li><strong>Not a Contract:</strong> This quote is an estimate only and does not constitute a binding agreement until confirmed in writing</li>
                    <li><strong>Final Pricing:</strong> Actual pricing will be confirmed after our site assessment based on specific property conditions</li>
                    <li><strong>Site Assessment:</strong> We'll visit your property to verify measurements and identify any site-specific factors</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Alert className="bg-muted/50 border-border">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm space-y-2">
                  <p className="font-medium">What's Included:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>All labor and equipment for the selected services</li>
                    <li>Lawn mowing services include trimming, blowing, and clipping removal</li>
                    <li>Debris removal and disposal (where applicable)</li>
                    <li>Professional-grade materials and supplies</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Alert className="bg-muted/50 border-border">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm space-y-2">
                  <p className="font-medium">Potential Additional Costs:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Excessive overgrowth or neglected properties may require additional labor</li>
                    <li>Difficult terrain, steep slopes, or limited accessibility</li>
                    <li>Tree/stump removal for trees larger than estimated</li>
                    <li>Damage to underground utilities (sprinkler lines, etc.) not marked prior to service</li>
                    <li>Weather delays or seasonal conditions requiring specialized equipment</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm font-medium">Next Steps:</p>
              <p className="text-sm text-muted-foreground">
                We'll contact you within 24 hours to schedule a free site assessment and finalize your quote
              </p>
            </div>

            {onClose && (
              <Button onClick={onClose} className="w-full" size="lg" data-testid="button-close-quote">
                Close
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Intelligent Property Calculator */}
      <IntelligentPropertyCalculator
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        onMeasurementComplete={handleMeasurementComplete}
        initialAddress={form1.watch("address") || ""}
        measurementType={getMeasurementType() || 'area'}
        cityContext={form1.watch("city") || ""}
      />
    </div>
  );
}
