import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertQuoteSchema, type InsertQuote } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2, DollarSign, Info, Map, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MapMeasureTool } from "@/components/MapMeasureTool";
import { normalizePropertySize, useDebounce, getQuoteCacheKey, aiQuoteCache } from "@/lib/quoteUtils";
import { config } from "@/lib/config";
import { Skeleton } from "@/components/ui/skeleton";

interface QuoteFormProps {
  className?: string;
  compact?: boolean;
  preselectedService?: string;
  preselectedCity?: string;
  enableAi?: boolean; // Override global AI flag
}

interface AiQuoteResult {
  total: number;
  complexity: number;
  lineItems: Array<{
    service: string;
    basePrice: number;
    finalPrice: number;
  }>;
  aiAnalysis?: {
    terrainDifficulty: string;
    obstacles: string;
    grassCondition: string;
    accessibility: string;
  };
  fallbackUsed?: boolean;
}

// Pricing estimation logic based on property size and service type
function calculateEstimate(propertySize: string, serviceType: string, propertyType: string) {
  if (!propertySize) return null;
  
  let sqft = 0;
  
  // Remove commas and normalize input
  const normalized = propertySize.toLowerCase().replace(/,/g, '');
  
  // Handle dimension format: "50x100" or "50 x 100"
  const dimensionMatch = normalized.match(/(\d+\.?\d*)\s*[x×]\s*(\d+\.?\d*)/);
  if (dimensionMatch) {
    const length = parseFloat(dimensionMatch[1]);
    const width = parseFloat(dimensionMatch[2]);
    sqft = Math.round(length * width);
  } else if (normalized.includes('acre')) {
    // Handle acres: "0.5 acres" or "1/2 acre"
    const acreMatch = normalized.match(/(\d+\.?\d*|\d+\/\d+)/);
    if (acreMatch) {
      let acres = 0;
      if (acreMatch[1].includes('/')) {
        const [num, den] = acreMatch[1].split('/').map(Number);
        acres = num / den;
      } else {
        acres = parseFloat(acreMatch[1]);
      }
      sqft = Math.round(acres * 43560); // 1 acre = 43,560 sq ft
    }
  } else {
    // Handle plain numbers: "5000" or "5000 sq ft"
    const numberMatch = normalized.match(/(\d+\.?\d*)/);
    if (numberMatch) {
      sqft = Math.round(parseFloat(numberMatch[1]));
    }
  }
  
  // Validate reasonable size range
  if (sqft < 500 || sqft > 100000) return null;

  // Base rates per service type (monthly for lawn care, one-time for landscaping)
  const serviceRates = {
    'lawn-mowing': 0.02,
    'lawn-maintenance': 0.025,
    'aeration': 0.015,
    'fertilization': 0.018,
    'weed-control': 0.012,
    'landscaping': 0.5,
    'patio': 15,
    'retaining-walls': 25,
    'pond': 50,
    'fence': 20,
    'irrigation': 0.8,
    'christmas-lights': 1.2,
  };

  const rate = serviceRates[serviceType as keyof typeof serviceRates] || 0.02;
  let baseEstimate = sqft * rate;

  // Property type multipliers
  const typeMultipliers = {
    'residential': 1,
    'commercial': 1.3,
    'hoa': 1.2,
  };

  const multiplier = typeMultipliers[propertyType as keyof typeof typeMultipliers] || 1;
  baseEstimate *= multiplier;

  return {
    low: Math.round(baseEstimate * 0.8),
    high: Math.round(baseEstimate * 1.2),
    isMonthly: ['lawn-mowing', 'lawn-maintenance', 'aeration', 'fertilization', 'weed-control'].includes(serviceType),
  };
}

export function QuoteForm({ className, compact = false, preselectedService, preselectedCity, enableAi }: QuoteFormProps) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [estimate, setEstimate] = useState<{ low: number; high: number; isMonthly: boolean } | null>(null);
  const [aiQuote, setAiQuote] = useState<AiQuoteResult | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  // Determine if AI quotes should be enabled (global config or prop override)
  const useAiQuotes = enableAi !== undefined ? enableAi : config.enableAiQuotes;

  const form = useForm<InsertQuote>({
    resolver: zodResolver(insertQuoteSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      serviceType: preselectedService || "",
      propertyType: "",
      propertySize: "",
      city: preselectedCity || "",
      message: "",
    },
  });

  // Watch form values
  const watchedServiceType = form.watch("serviceType");
  const watchedPropertySize = form.watch("propertySize");
  const watchedPropertyType = form.watch("propertyType");
  const watchedCity = form.watch("city");
  
  // Debounce the watched values to prevent excessive API calls
  const debouncedServiceType = useDebounce(watchedServiceType, 1500);
  const debouncedPropertySize = useDebounce(watchedPropertySize, 1500);
  const debouncedPropertyType = useDebounce(watchedPropertyType, 1500);
  const debouncedCity = useDebounce(watchedCity, 1500);
  
  // AI quote calculation mutation
  const aiQuoteMutation = useMutation({
    mutationFn: async (params: { serviceType: string; propertyType: string; sqft: number; city: string }) => {
      const cacheKey = getQuoteCacheKey({ serviceType: params.serviceType, propertyType: params.propertyType, sqft: params.sqft });
      
      // Check cache first
      const cached = aiQuoteCache.get(cacheKey);
      if (cached) {
        return cached;
      }
      
      // Call AI quote calculation API with required address and city fields
      const response = await apiRequest("POST", "/api/quotes/calculate", {
        address: `Property in ${params.city}`, // Generic address since we don't collect full address in QuoteForm
        city: params.city,
        serviceType: params.serviceType,
        propertyType: params.propertyType,
        propertySize: params.sqft,
        frequency: "one-time"
      });
      
      // Parse JSON from response
      const data = await response.json();
      
      // Cache the parsed result
      aiQuoteCache.set(cacheKey, data);
      
      return data;
    },
    onSuccess: (data) => {
      console.log("[AI Quote] Received API response:", data);
      
      // Map API response to expected AiQuoteResult structure
      const mappedQuote: AiQuoteResult = {
        total: data.finalQuote || 0,
        complexity: data.complexityScore || 1.0,
        lineItems: data.lineItems || [],
        aiAnalysis: data.aiAnalysis,
        fallbackUsed: data.aiAnalysis?.reasoning?.includes("unavailable") || false
      };
      
      console.log("[AI Quote] Mapped quote:", mappedQuote);
      setAiQuote(mappedQuote);
      setEstimate(null); // Clear basic estimate when AI quote loads
    },
    onError: (error) => {
      console.error("AI quote calculation failed:", error);
      // Fall back to basic estimation on error
      if (debouncedServiceType && debouncedPropertySize && debouncedPropertyType) {
        const fallbackEstimate = calculateEstimate(debouncedPropertySize, debouncedServiceType, debouncedPropertyType);
        setEstimate(fallbackEstimate);
      }
    },
  });
  
  // Trigger AI quote calculation when inputs change (debounced)
  useEffect(() => {
    if (!useAiQuotes) {
      // Fall back to basic estimation if AI is disabled
      if (debouncedServiceType && debouncedPropertySize && debouncedPropertyType) {
        const newEstimate = calculateEstimate(debouncedPropertySize, debouncedServiceType, debouncedPropertyType);
        setEstimate(newEstimate);
        setAiQuote(null);
      } else {
        setEstimate(null);
        setAiQuote(null);
      }
      return;
    }
    
    // Only proceed with AI quote if all required fields are present (including city for AI analysis)
    if (debouncedServiceType && debouncedPropertyType && debouncedPropertySize && debouncedCity) {
      const sqft = normalizePropertySize(debouncedPropertySize);
      
      if (sqft && sqft >= 500) {
        // Valid input - trigger AI quote calculation
        aiQuoteMutation.mutate({
          serviceType: debouncedServiceType,
          propertyType: debouncedPropertyType,
          sqft,
          city: debouncedCity
        });
      } else {
        // Invalid size - clear quotes
        setAiQuote(null);
        setEstimate(null);
      }
    } else {
      // Missing required fields - clear quotes
      setAiQuote(null);
      setEstimate(null);
    }
  }, [debouncedServiceType, debouncedPropertySize, debouncedPropertyType, debouncedCity, useAiQuotes]);

  const submitQuoteMutation = useMutation({
    mutationFn: async (data: InsertQuote) => {
      const response = await apiRequest("POST", "/api/quotes", data);
      return response;
    },
    onSuccess: () => {
      setSubmitted(true);
      form.reset();
      toast({
        title: "Quote Requested!",
        description: "We'll contact you within 24 hours.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again or call us at (208) 352-2011",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: InsertQuote) => {
    submitQuoteMutation.mutate(data);
  };

  const handleMeasurementComplete = (sqft: number) => {
    form.setValue("propertySize", `${sqft.toLocaleString()} sq ft`);
    setIsMapOpen(false);
    toast({
      title: "Measurement Complete!",
      description: `Property size set to ${sqft.toLocaleString()} sq ft`,
    });
  };

  if (submitted) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
              <p className="text-muted-foreground">
                We've received your quote request and will contact you within 24 hours.
              </p>
            </div>
            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-2">Need immediate assistance?</p>
              <a href="tel:2083522011">
                <Button>Call (208) 352-2011</Button>
              </a>
            </div>
            <Button
              variant="outline"
              onClick={() => setSubmitted(false)}
              className="mt-4"
            >
              Submit Another Request
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-2xl">Get Your Free Quote</CardTitle>
        <CardDescription>
          No obligation. We'll get back to you within 24 hours.
        </CardDescription>
        <div className="flex items-center gap-2 pt-2">
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Free Quote
          </Badge>
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            No Hidden Fees
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Smith" {...field} data-testid="input-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(208) 555-1234" {...field} data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-service">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="lawn-mowing">Lawn Mowing</SelectItem>
                      <SelectItem value="lawn-maintenance">Lawn Maintenance</SelectItem>
                      <SelectItem value="aeration">Aeration & Overseeding</SelectItem>
                      <SelectItem value="fertilization">Fertilization</SelectItem>
                      <SelectItem value="weed-control">Weed Control</SelectItem>
                      <SelectItem value="landscaping">Landscaping</SelectItem>
                      <SelectItem value="patio">Patio Installation</SelectItem>
                      <SelectItem value="retaining-walls">Retaining Walls</SelectItem>
                      <SelectItem value="pond">Pond/Water Features</SelectItem>
                      <SelectItem value="fence">Fence Installation</SelectItem>
                      <SelectItem value="irrigation">Irrigation Systems</SelectItem>
                      <SelectItem value="christmas-lights">Christmas Lights</SelectItem>
                      <SelectItem value="hoa">HOA Services</SelectItem>
                      <SelectItem value="commercial">Commercial Services</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-property-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="hoa">HOA</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertySize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Size</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          placeholder="e.g., 5,000 sq ft or 50x100 or 0.25 acres" 
                          {...field}
                          value={field.value || ""}
                          data-testid="input-property-size" 
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsMapOpen(true)}
                        className="flex-shrink-0"
                        data-testid="button-measure-map"
                      >
                        <Map className="h-4 w-4 mr-2" />
                        Measure
                      </Button>
                    </div>
                    <FormDescription>Enter manually or use our map tool to measure</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-city">
                        <SelectValue placeholder="Select your city" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="kuna">Kuna</SelectItem>
                      <SelectItem value="boise">Boise</SelectItem>
                      <SelectItem value="meridian">Meridian</SelectItem>
                      <SelectItem value="nampa">Nampa</SelectItem>
                      <SelectItem value="caldwell">Caldwell</SelectItem>
                      <SelectItem value="eagle">Eagle</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!compact && (
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Details (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your project..."
                        className="resize-none"
                        rows={4}
                        {...field}
                        value={field.value || ""}
                        data-testid="textarea-message"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* AI Quote Display */}
            {aiQuoteMutation.isPending && (
              <Alert className="bg-primary/5 border-primary/20" data-testid="alert-calculating">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <p className="font-semibold text-foreground">Analyzing your property...</p>
                    </div>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {aiQuote && !aiQuoteMutation.isPending && (
              <Alert className="bg-primary/5 border-primary/20" data-testid="alert-ai-quote">
                <DollarSign className="h-5 w-5 text-primary" />
                <AlertDescription>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground">Instant AI Quote</p>
                          {aiQuote.fallbackUsed ? (
                            <Badge variant="outline" className="text-xs">
                              Estimated
                            </Badge>
                          ) : (
                            <Badge variant="default" className="text-xs bg-primary/10 text-primary border-primary/20">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI-Powered
                            </Badge>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-primary" data-testid="text-ai-quote-total">
                          ${aiQuote.total.toLocaleString()}
                        </p>
                      </div>
                      {aiQuote.complexity && !aiQuote.fallbackUsed && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Complexity</p>
                          <p className="text-sm font-semibold">{aiQuote.complexity.toFixed(1)}x</p>
                        </div>
                      )}
                    </div>
                    
                    {aiQuote.aiAnalysis && !aiQuote.fallbackUsed && (
                      <div className="space-y-1 pt-2 border-t border-primary/10">
                        <p className="text-xs font-medium text-muted-foreground">AI Property Analysis:</p>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div className="flex items-start gap-1">
                            <span className="text-muted-foreground">Terrain:</span>
                            <span className="text-foreground font-medium">{aiQuote.aiAnalysis.terrainDifficulty}</span>
                          </div>
                          <div className="flex items-start gap-1">
                            <span className="text-muted-foreground">Access:</span>
                            <span className="text-foreground font-medium">{aiQuote.aiAnalysis.accessibility}</span>
                          </div>
                          {aiQuote.aiAnalysis.obstacles && (
                            <div className="flex items-start gap-1 col-span-2">
                              <span className="text-muted-foreground">Obstacles:</span>
                              <span className="text-foreground font-medium">{aiQuote.aiAnalysis.obstacles}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground flex items-start gap-1 pt-2 border-t border-primary/10">
                      <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      {aiQuote.fallbackUsed 
                        ? "This is a preliminary estimate. Final pricing will be provided after property assessment."
                        : "AI-analyzed pricing based on your property characteristics. Lock in this quote by submitting the form."}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Fallback Basic Estimate (when AI disabled or unavailable) */}
            {estimate && !aiQuote && !aiQuoteMutation.isPending && (
              <Alert className="bg-primary/5 border-primary/20" data-testid="alert-basic-estimate">
                <DollarSign className="h-5 w-5 text-primary" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">Estimated Range:</p>
                    <p className="text-lg font-bold text-primary">
                      ${estimate.low.toLocaleString()} - ${estimate.high.toLocaleString()}
                      {estimate.isMonthly && <span className="text-sm font-normal text-muted-foreground">/month</span>}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-start gap-1 mt-2">
                      <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      This is a preliminary estimate. Final pricing will be provided after property assessment.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {submitQuoteMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to submit quote request. Please try again or call (208) 352-2011.
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={submitQuoteMutation.isPending}
              data-testid="button-submit-quote"
            >
              {submitQuoteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Request Free Quote"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By submitting this form, you agree to be contacted by Lawn Care Kuna
            </p>
          </form>
        </Form>
      </CardContent>

      {/* Map Measurement Tool */}
      <MapMeasureTool
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onMeasurementComplete={handleMeasurementComplete}
        initialAddress={`${form.watch("city") || "Kuna"}, Idaho`}
      />
    </Card>
  );
}
