import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, MapPin, CheckCircle2, Calendar, DollarSign } from "lucide-react";
import { MapMeasureTool } from "@/components/MapMeasureTool";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Utility to safely coerce values to numbers
function coerceNumber(value: unknown, options: { min?: number; fallback?: number } = {}): number {
  const { min, fallback = 0 } = options;
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return fallback;
  if (min !== undefined && num < min) return fallback;
  return num;
}

// Step 1: Address & Property
const step1Schema = z.object({
  address: z.string().min(5, "Please enter your full address"),
  city: z.string().min(1, "Please select your city"),
  propertySize: z.number().min(500, "Property must be at least 500 sq ft"),
  propertyType: z.enum(["residential", "commercial", "hoa"]),
});

// Step 2: Services
const step2Schema = z.object({
  serviceType: z.string().min(1, "Please select a primary service"),
  frequency: z.enum(["one-time", "weekly", "bi-weekly", "monthly"]),
  selectedServices: z.array(z.string()).optional(),
});

// Step 3: Contact Info
const step3Schema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  preferredDate: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

interface QuoteData {
  baseCost: number;
  adjustedCost: number;
  finalQuote: number;
  complexityScore?: number;
  aiAnalysis: any;
  lineItems: Array<{
    service: string;
    description: string;
    basePrice: number;
    adjustedPrice: number;
  }>;
  breakdown: {
    laborCost: number;
    materialsCost: number;
    overhead: number;
    profit: number;
  };
}

const CITIES = ["Kuna", "Boise", "Meridian", "Nampa", "Caldwell", "Eagle"];

const SERVICES = [
  { id: "lawn-mowing", name: "Lawn Mowing & Edging", description: "Regular cutting and trimming" },
  { id: "lawn-maintenance", name: "Full Lawn Maintenance", description: "Complete care package" },
  { id: "aeration", name: "Core Aeration", description: "Improve soil and grass health" },
  { id: "fertilization", name: "Fertilization", description: "Seasonal nutrient application" },
  { id: "weed-control", name: "Weed Control", description: "Pre and post-emergent treatment" },
  { id: "seasonal-cleanup", name: "Seasonal Cleanup", description: "Spring/fall yard cleanup" },
  { id: "patio", name: "Patio Installation", description: "Custom patio design & build" },
  { id: "fence", name: "Fence Installation", description: "Wood, vinyl, or chain link" },
  { id: "christmas-lights", name: "Christmas Lights", description: "Holiday lighting installation" },
];

const ADDON_SERVICES = [
  { id: "hedge-trimming", name: "Hedge Trimming" },
  { id: "dethatching", name: "Dethatching" },
  { id: "sprinkler-blowout", name: "Sprinkler Winterization" },
  { id: "sod-installation", name: "Sod Installation" },
];

export function QuoteWizard({ onClose }: { onClose?: () => void }) {
  const [step, setStep] = useState(1);
  const [mapOpen, setMapOpen] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [formData, setFormData] = useState<Partial<Step1Data & Step2Data & Step3Data>>({});
  const { toast } = useToast();

  // Step 1 form
  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      city: "Kuna",
      propertyType: "residential",
    },
  });

  // Step 2 form
  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      frequency: "bi-weekly",
      selectedServices: [],
    },
  });

  // Step 3 form
  const form3 = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
  });

  // Get instant quote mutation
  const getQuoteMutation = useMutation({
    mutationFn: async (data: Step1Data & Step2Data) => {
      return apiRequest("POST", "/api/quotes/calculate", data);
    },
    onSuccess: (data: any) => {
      if (data.aiFallback) {
        toast({
          title: "Quote Generated (Fallback Mode)",
          description: "Using standard pricing. AI analysis temporarily unavailable.",
          variant: "default",
        });
      }
      setQuoteData(data);
      setStep(3);
      toast({
        title: "Quote Generated!",
        description: `Your personalized quote is ready: $${data.finalQuote.toLocaleString()}`,
      });
    },
    onError: (error: any) => {
      console.error("Quote calculation error:", error);
      const errorMsg = error?.message || "Failed to generate quote. Please try again.";
      const errors = error?.errors || [];
      
      toast({
        title: "Error Generating Quote",
        description: errors.length > 0 
          ? `${errors.map((e: any) => e.message).join(', ')}`
          : errorMsg,
        variant: "destructive",
      });
    },
  });

  // Final submission mutation
  const submitQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/quotes", data);
    },
    onSuccess: () => {
      setStep(4);
      toast({
        title: "Quote Request Submitted!",
        description: "We'll contact you shortly to confirm your service.",
      });
    },
    onError: (error: any) => {
      console.error("Quote submission error:", error);
      const errorMsg = error?.message || "Failed to submit quote request.";
      const errors = error?.errors || [];
      
      // Show detailed error message
      toast({
        title: "Submission Failed",
        description: errors.length > 0
          ? `Please fix: ${errors.map((e: any) => `${e.field}: ${e.message}`).join(', ')}`
          : errorMsg,
        variant: "destructive",
      });
      
      // Set form errors if available
      if (errors.length > 0) {
        errors.forEach((err: any) => {
          const field = err.field;
          if (field in form3.control._fields) {
            form3.setError(field as any, {
              type: "server",
              message: err.message,
            });
          }
        });
      }
    },
  });

  const handleStep1Submit = async (data: Step1Data) => {
    // Preserve complete Step 1 data
    const completeStep1 = {
      address: data.address,
      city: data.city,
      propertySize: data.propertySize,
      propertyType: data.propertyType,
    };
    setFormData({ ...formData, ...completeStep1 });
    setStep(2);
  };

  const handleStep2Submit = async (data: Step2Data) => {
    // Merge Step 1 and Step 2 data - formData should already have all Step 1 fields from handleStep1Submit
    const combined = { 
      // Step 1 data (must be present from previous step)
      address: formData.address!,
      city: formData.city!,
      propertySize: formData.propertySize!,
      propertyType: formData.propertyType!,
      // Step 2 data
      ...data 
    };
    setFormData({ ...formData, ...combined });
    getQuoteMutation.mutate(combined);
  };

  const handleStep3Submit = async (data: Step3Data) => {
    // Build submission payload with explicit field mapping and numeric coercion
    const fullData = {
      // Customer info
      name: (data.name || '').trim(),
      email: (data.email || '').trim(),
      phone: (data.phone || '').trim(),
      
      // Property details
      address: (formData.address || '').trim(),
      city: formData.city!,
      propertyType: formData.propertyType!,
      propertySize: coerceNumber(formData.propertySize, { min: 0, fallback: 0 }),
      
      // Service details
      serviceType: formData.serviceType!,
      frequency: formData.frequency,
      selectedServices: formData.selectedServices || [],
      
      // AI analysis and pricing - with proper type coercion
      aiAnalysis: quoteData?.aiAnalysis || null,
      complexityScore: coerceNumber(quoteData?.complexityScore, { min: 1.0, fallback: 1.2 }),
      baseCost: coerceNumber(quoteData?.baseCost, { min: 0, fallback: 0 }),
      adjustedCost: coerceNumber(quoteData?.adjustedCost, { min: 0, fallback: 0 }),
      finalQuote: coerceNumber(quoteData?.finalQuote, { min: 0, fallback: 0 }),
      
      // Line items with numeric coercion
      lineItems: quoteData?.lineItems?.map(item => ({
        service: item.service,
        description: item.description,
        basePrice: coerceNumber(item.basePrice, { fallback: 0 }),
        adjustedPrice: coerceNumber(item.adjustedPrice ?? item.basePrice, { fallback: 0 }),
      })) || [],
      
      // Scheduling
      scheduledDate: data.preferredDate ? new Date(data.preferredDate).toISOString() : undefined,
      status: "pending" as const,
      message: `Quote request for ${formData.serviceType} - Generated via AI wizard`,
    };
    
    submitQuoteMutation.mutate(fullData);
  };

  const handleMeasurementComplete = (sqft: number) => {
    form1.setValue("propertySize", sqft);
    setMapOpen(false);
    toast({
      title: "Measurement Added",
      description: `Property size set to ${sqft.toLocaleString()} sq ft`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  s < step ? "bg-primary text-primary-foreground" : 
                  s === step ? "bg-primary text-primary-foreground" : 
                  "bg-muted text-muted-foreground"
                }`}
                data-testid={`step-indicator-${s}`}
              >
                {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              <span className={`text-sm font-medium ${s <= step ? "text-foreground" : "text-muted-foreground"}`}>
                {s === 1 ? "Property" : s === 2 ? "Services" : "Contact"}
              </span>
              {s < 3 && <div className="w-12 h-0.5 bg-muted" />}
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
            <CardDescription>Tell us about your property to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form1.handleSubmit(handleStep1Submit)} className="space-y-6">
              <div>
                <Label htmlFor="address">Street Address</Label>
                <AddressAutocomplete
                  id="address"
                  value={form1.watch("address")}
                  onChange={(value) => form1.setValue("address", value)}
                  city={form1.watch("city")}
                  onPropertySizeCalculated={(sqft) => {
                    form1.setValue("propertySize", sqft);
                  }}
                  placeholder="123 Main St"
                  data-testid="input-address"
                />
                {form1.formState.errors.address && (
                  <p className="text-sm text-destructive mt-1">{form1.formState.errors.address.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <select
                  id="city"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  {...form1.register("city")}
                  data-testid="select-city"
                >
                  {CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="propertySize">Property Size (sq ft)</Label>
                <div className="flex gap-2">
                  <Input
                    id="propertySize"
                    type="number"
                    placeholder="e.g., 5000"
                    {...form1.register("propertySize", { valueAsNumber: true })}
                    data-testid="input-property-size"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMapOpen(true)}
                    data-testid="button-measure-wizard"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Adjust
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Size is auto-calculated when you select an address. Click "Adjust" to manually measure.
                </p>
                {form1.formState.errors.propertySize && (
                  <p className="text-sm text-destructive mt-1">{form1.formState.errors.propertySize.message}</p>
                )}
              </div>

              <div>
                <Label>Property Type</Label>
                <RadioGroup
                  value={form1.watch("propertyType")}
                  onValueChange={(value) => form1.setValue("propertyType", value as any)}
                >
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: "residential", label: "Residential Home" },
                      { value: "commercial", label: "Commercial Property" },
                      { value: "hoa", label: "HOA/Community" },
                    ].map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={type.value} id={type.value} data-testid={`radio-${type.value}`} />
                        <Label htmlFor={type.value} className="cursor-pointer">{type.label}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full" data-testid="button-next-step-1">
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
            <CardTitle>Select Services</CardTitle>
            <CardDescription>Choose your primary service and any add-ons</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form2.handleSubmit(handleStep2Submit)} className="space-y-6">
              <div>
                <Label>Primary Service</Label>
                <RadioGroup
                  value={form2.watch("serviceType")}
                  onValueChange={(value) => form2.setValue("serviceType", value)}
                >
                  <div className="space-y-3">
                    {SERVICES.map((service) => (
                      <div key={service.id} className="flex items-start space-x-3 p-3 rounded-lg border hover-elevate">
                        <RadioGroupItem value={service.id} id={service.id} data-testid={`radio-service-${service.id}`} />
                        <div className="flex-1">
                          <Label htmlFor={service.id} className="cursor-pointer font-semibold">{service.name}</Label>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                {form2.formState.errors.serviceType && (
                  <p className="text-sm text-destructive mt-1">{form2.formState.errors.serviceType.message}</p>
                )}
              </div>

              <div>
                <Label>Service Frequency</Label>
                <RadioGroup
                  value={form2.watch("frequency")}
                  onValueChange={(value) => form2.setValue("frequency", value as any)}
                >
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: "one-time", label: "One-Time Service", discount: "" },
                      { value: "weekly", label: "Weekly", discount: "Save 15%" },
                      { value: "bi-weekly", label: "Bi-Weekly", discount: "Save 10%" },
                      { value: "monthly", label: "Monthly", discount: "Save 5%" },
                    ].map((freq) => (
                      <div key={freq.value} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={freq.value} id={freq.value} data-testid={`radio-freq-${freq.value}`} />
                          <Label htmlFor={freq.value} className="cursor-pointer">{freq.label}</Label>
                        </div>
                        {freq.discount && (
                          <span className="text-xs font-semibold text-primary">{freq.discount}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Add-On Services (Optional)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {ADDON_SERVICES.map((addon) => (
                    <div key={addon.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={addon.id}
                        checked={(form2.watch("selectedServices") || []).includes(addon.id)}
                        onCheckedChange={(checked) => {
                          const current = form2.watch("selectedServices") || [];
                          form2.setValue(
                            "selectedServices",
                            checked ? [...current, addon.id] : current.filter((s) => s !== addon.id)
                          );
                        }}
                        data-testid={`checkbox-addon-${addon.id}`}
                      />
                      <Label htmlFor={addon.id} className="cursor-pointer text-sm">{addon.name}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={getQuoteMutation.isPending} data-testid="button-get-quote">
                  {getQuoteMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Quote...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Get Instant Quote
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Quote & Contact */}
      {step === 3 && quoteData && (
        <div className="space-y-6">
          {/* Quote Display */}
          <Card className="border-primary">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-2xl">Your Personalized Quote</CardTitle>
              <CardDescription>AI-analyzed pricing based on your property</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="text-center py-4">
                <div className="text-5xl font-bold text-primary" data-testid="text-final-quote">
                  ${quoteData.finalQuote.toLocaleString()}
                </div>
                <p className="text-muted-foreground mt-2">
                  {formData.frequency === "one-time" ? "One-time service" : `Per ${formData.frequency} service`}
                </p>
              </div>

              {/* Line Items */}
              <div className="space-y-2 border-t pt-4">
                <h4 className="font-semibold text-sm">Included Services:</h4>
                {quoteData.lineItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.description}</span>
                    <span className="font-medium">${item.adjustedPrice.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* AI Analysis */}
              {quoteData.aiAnalysis && (
                <div className="border-t pt-4 space-y-2">
                  <h4 className="font-semibold text-sm">Property Analysis:</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>• Terrain: {quoteData.aiAnalysis.terrainDifficulty}</p>
                    <p>• Accessibility: {quoteData.aiAnalysis.accessibility}</p>
                    <p>• Complexity Score: {quoteData.aiAnalysis.complexityScore}x</p>
                    {quoteData.aiAnalysis.obstacles?.length > 0 && (
                      <p>• Considerations: {quoteData.aiAnalysis.obstacles.join(", ")}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Confirm & Schedule</CardTitle>
              <CardDescription>Enter your contact details to finalize your quote</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form3.handleSubmit(handleStep3Submit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    {...form3.register("name")}
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
                    placeholder="john@example.com"
                    {...form3.register("email")}
                    data-testid="input-email"
                  />
                  {form3.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">{form3.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(208) 555-1234"
                    {...form3.register("phone")}
                    data-testid="input-phone"
                  />
                  {form3.formState.errors.phone && (
                    <p className="text-sm text-destructive mt-1">{form3.formState.errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="preferredDate">Preferred Start Date (Optional)</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    {...form3.register("preferredDate")}
                    data-testid="input-preferred-date"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={submitQuoteMutation.isPending} data-testid="button-confirm-quote">
                    {submitQuoteMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 mr-2" />
                        Confirm & Book
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <Card className="border-primary">
          <CardContent className="pt-12 pb-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Quote Request Confirmed!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Thank you for choosing Lawn Care Kuna. We'll contact you within 24 hours to confirm your service and schedule.
            </p>
            <div className="pt-4">
              <Button onClick={onClose} data-testid="button-close-wizard">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Measurement Tool */}
      <MapMeasureTool
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        onMeasurementComplete={handleMeasurementComplete}
        initialAddress={`${formData.address || ""}, ${formData.city || "Kuna"}, Idaho`}
      />
    </div>
  );
}
