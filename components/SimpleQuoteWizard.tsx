"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, MapPin, CheckCircle2, Home, Leaf, Snowflake, 
  Sun, Droplets, TreeDeciduous, Lightbulb, ChevronRight,
  Edit2, AlertCircle, X, Plus, Check, Star
} from "lucide-react";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { queryAssessor, getCountyFromCity } from "@/lib/assessors";
import { 
  createMeasurementBundleFromAssessor, 
  createDefaultMeasurementBundle,
  getMeasurementSummary,
  getConfidenceLabel,
  type MeasurementBundle 
} from "@/shared/measurementBundle";
import { 
  calculateTotalPriceRange, 
  formatPriceRange,
  type ServiceMeasurements 
} from "@/lib/pricingUtils";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { PRIORITY_SERVICES } from "@/shared/contentData";
import {
  getRecurringEligibleServices,
  getServiceMaxFrequency,
  getServiceDefaultFrequency,
  hasAnyRecurringService,
} from "@/shared/serviceSeasonality";

// Service intent categories with primary (auto-added) and upsell (suggested) services
const SERVICE_INTENTS = [
  {
    id: "lawn-care",
    label: "Lawn Care",
    icon: Leaf,
    description: "Mowing, aeration, fertilization",
    color: "bg-primary/10 text-primary border-primary/20",
    primaryServices: ["lawn-mowing"],
    upsellServices: ["aeration", "fertilization", "weed-control"],
    upsellPrompt: "Boost your lawn's health",
  },
  {
    id: "cleanup",
    label: "Seasonal Cleanup",
    icon: TreeDeciduous,
    description: "Spring or fall cleanup",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    primaryServices: ["spring-cleanup"],
    upsellServices: ["fall-cleanup"],
    upsellPrompt: "Complete seasonal care",
  },
  {
    id: "irrigation",
    label: "Irrigation",
    icon: Droplets,
    description: "Sprinkler repair & winterization",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    primaryServices: ["sprinkler-blowout"],
    upsellServices: ["sprinkler-repair", "irrigation-maintenance"],
    upsellPrompt: "Keep your system running smoothly",
  },
  {
    id: "lighting",
    label: "Outdoor Lighting",
    icon: Lightbulb,
    description: "Christmas lights & landscape lighting",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    primaryServices: ["christmas-light-installation"],
    upsellServices: ["landscape-lighting"],
    upsellPrompt: "Enhance your outdoor ambiance",
  },
  {
    id: "snow",
    label: "Snow Removal",
    icon: Snowflake,
    description: "Driveway & walkway clearing",
    color: "bg-sky-100 text-sky-700 border-sky-200",
    primaryServices: ["snow-removal"],
    upsellServices: [],
    upsellPrompt: "",
  },
  {
    id: "landscaping",
    label: "Landscaping",
    icon: Sun,
    description: "Patios, hedges, trees & more",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    primaryServices: ["hedge-trimming"],
    upsellServices: ["tree-trimming", "mulch-installation", "patio-installation"],
    upsellPrompt: "Transform your outdoor space",
  },
];

// All available services for manual selection
const ALL_SERVICES = PRIORITY_SERVICES.map(s => ({
  id: s.slug,
  name: s.name,
  category: s.category,
}));

// Frequency options
const FREQUENCY_OPTIONS = [
  { value: "one-time", label: "One-time", description: "Single service visit" },
  { value: "monthly", label: "Monthly", description: "5% discount" },
  { value: "bi-weekly", label: "Every 2 Weeks", description: "10% discount" },
  { value: "weekly", label: "Weekly", description: "15% discount" },
];

// Contact form schema
const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  message: z.string().optional(),
});

type ContactData = z.infer<typeof contactSchema>;

interface SimpleQuoteWizardProps {
  defaultCity?: string;
  defaultAddress?: string;
  preselectedService?: string;
  preselectedCity?: string;
  className?: string;
  onClose?: () => void;
}

export function SimpleQuoteWizard({
  defaultCity = "Kuna",
  defaultAddress = "",
  preselectedService,
  preselectedCity,
  className,
  onClose,
}: SimpleQuoteWizardProps) {
  // Normalize city name
  const normalizeCity = (city: string) => {
    if (!city) return "Kuna";
    return city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
  };
  
  const initialCity = normalizeCity(preselectedCity || defaultCity);
  const [phase, setPhase] = useState(1);
  
  const formContainerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (formContainerRef.current) {
      formContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [phase]);
  
  const SUPPORTED_CITIES = ["kuna", "boise", "meridian", "eagle", "star", "middleton"];
  
  const extractCityFromAddress = (rawAddress: any): string | null => {
    if (!rawAddress?.address) return null;
    const addr = rawAddress.address;
    const cityValue = addr.city || addr.town || addr.village || addr.hamlet || addr.municipality || addr.county;
    if (!cityValue) return null;
    
    const normalizedCity = cityValue.toLowerCase().trim();
    const matchedCity = SUPPORTED_CITIES.find(c => normalizedCity.includes(c));
    if (matchedCity) {
      return matchedCity.charAt(0).toUpperCase() + matchedCity.slice(1);
    }
    return null;
  };
  
  const parseCityFromAddressString = (addressStr: string): string | null => {
    if (!addressStr) return null;
    
    const lowerAddr = addressStr.toLowerCase();
    
    for (const cityName of SUPPORTED_CITIES) {
      const lowerCityName = cityName.toLowerCase();
      const patterns = [
        new RegExp(`\\b${lowerCityName}\\b`, 'i'),
        new RegExp(`,\\s*${lowerCityName}`, 'i'),
      ];
      
      if (patterns.some(p => p.test(lowerAddr))) {
        return cityName.charAt(0).toUpperCase() + cityName.slice(1);
      }
    }
    
    return null;
  };
  
  // Property state
  const [address, setAddress] = useState(defaultAddress);
  const [city, setCity] = useState(initialCity);
  const [propertyType, setPropertyType] = useState<"residential" | "commercial">("residential");
  const [measurementBundle, setMeasurementBundle] = useState<MeasurementBundle | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  
  // Service state
  const [selectedIntents, setSelectedIntents] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>(
    preselectedService ? [preselectedService] : []
  );
  const [serviceFrequencies, setServiceFrequencies] = useState<Record<string, string>>({});
  const [showAllServices, setShowAllServices] = useState(false);

  const RECURRING_ELIGIBLE = getRecurringEligibleServices();
  
  // Submission state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [finalQuote, setFinalQuote] = useState<any>(null);
  
  // Contact form
  const contactForm = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });
  
  // Auto-lookup property when address changes
  const handleAddressSelect = async (selectedAddress: string, rawAddressData?: any) => {
    setAddress(selectedAddress);
    setLookupError(null);
    setIsLookingUp(true);
    
    let extractedCity: string | null = null;
    
    if (rawAddressData) {
      extractedCity = extractCityFromAddress(rawAddressData);
    }
    
    if (!extractedCity) {
      extractedCity = parseCityFromAddressString(selectedAddress);
    }
    
    if (extractedCity) {
      setCity(extractedCity);
    }
    
    const lookupCity = extractedCity || city;
    
    try {
      const county = getCountyFromCity(lookupCity);
      const result = await queryAssessor({ county, address: selectedAddress, cityContext: lookupCity });
      
      if (result.success && result.properties.length > 0) {
        const property = result.properties[0];
        const bundle = createMeasurementBundleFromAssessor(property);
        setMeasurementBundle(bundle);
        setTimeout(() => setPhase(2), 500);
      } else {
        const bundle = createDefaultMeasurementBundle(selectedAddress, lookupCity);
        setMeasurementBundle(bundle);
        setLookupError("Couldn't find exact property data. Using typical estimates.");
        setTimeout(() => setPhase(2), 800);
      }
    } catch (error) {
      console.error("Property lookup error:", error);
      const bundle = createDefaultMeasurementBundle(selectedAddress, lookupCity);
      setMeasurementBundle(bundle);
      setLookupError("Property lookup failed. Using typical estimates.");
      setTimeout(() => setPhase(2), 800);
    } finally {
      setIsLookingUp(false);
    }
  };
  
  // Update selected services when intents change, and auto-assign default frequencies
  useEffect(() => {
    if (selectedIntents.length === 0) return;
    
    const primaryServices: string[] = [];
    for (const intentId of selectedIntents) {
      const intent = SERVICE_INTENTS.find(i => i.id === intentId);
      if (intent) {
        intent.primaryServices.forEach(s => {
          if (!primaryServices.includes(s)) {
            primaryServices.push(s);
          }
        });
      }
    }
    
    setSelectedServices(prev => {
      const combined = [...prev];
      primaryServices.forEach(s => {
        if (!combined.includes(s)) {
          combined.push(s);
        }
      });
      return combined;
    });

    setServiceFrequencies(prev => {
      const updated = { ...prev };
      for (const s of primaryServices) {
        if (RECURRING_ELIGIBLE.has(s) && !updated[s]) {
          updated[s] = getServiceDefaultFrequency(s);
        }
      }
      return updated;
    });
  }, [selectedIntents]);

  // Clean up frequencies when services are removed
  useEffect(() => {
    setServiceFrequencies(prev => {
      const updated: Record<string, string> = {};
      for (const sid of selectedServices) {
        if (RECURRING_ELIGIBLE.has(sid)) {
          updated[sid] = prev[sid] || getServiceDefaultFrequency(sid);
        }
      }
      return updated;
    });
  }, [selectedServices]);
  
  // Get available upsell services
  const getAvailableUpsells = () => {
    const upsells: { service: string; prompt: string; intentLabel: string }[] = [];
    
    for (const intentId of selectedIntents) {
      const intent = SERVICE_INTENTS.find(i => i.id === intentId);
      if (intent && intent.upsellServices.length > 0) {
        intent.upsellServices.forEach(s => {
          if (!selectedServices.includes(s)) {
            upsells.push({
              service: s,
              prompt: intent.upsellPrompt,
              intentLabel: intent.label,
            });
          }
        });
      }
    }
    
    return upsells;
  };
  
  const hasRecurring = hasAnyRecurringService(selectedServices);

  const getPrimaryFrequency = (): string => {
    const freqs = Object.values(serviceFrequencies);
    const recurring = freqs.filter(f => f !== "one-time");
    if (recurring.length === 0) return "one-time";
    const counts: Record<string, number> = {};
    for (const f of recurring) {
      counts[f] = (counts[f] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  };

  const getFrequencyOptionsForService = (serviceId: string) => {
    const maxFreq = getServiceMaxFrequency(serviceId);
    if (!maxFreq) return [];
    const rank: Record<string, number> = { weekly: 3, "bi-weekly": 2, monthly: 1 };
    const maxRank = rank[maxFreq] || 0;
    return FREQUENCY_OPTIONS.filter(opt => {
      if (opt.value === "one-time") return true;
      return (rank[opt.value] || 0) <= maxRank;
    });
  };

  const recurringCount = Object.values(serviceFrequencies).filter(f => f !== "one-time").length;

  // Calculate price range
  const getMeasurementsForPricing = (): ServiceMeasurements => {
    if (!measurementBundle) return {};
    return {
      propertySize: measurementBundle.lawnAreaSqFt,
      linearFeet: measurementBundle.rooflineWithOverhangFt,
      zones: measurementBundle.estimatedZones,
    };
  };
  
  const priceRange = calculateTotalPriceRange(
    selectedServices,
    {},
    getMeasurementsForPricing(),
    propertyType,
    "one-time",
    serviceFrequencies
  );
  
  const { toast } = useToast();
  
  // Submit quote mutation
  const submitQuoteMutation = useMutation({
    mutationFn: async (data: ContactData) => {
      if (!measurementBundle) {
        throw new Error("Property measurements not found. Please go back and enter your address.");
      }
      
      const primaryService = selectedServices[0] || "lawn-mowing";
      
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message || "",
        address: address || "",
        city,
        propertyType: propertyType || "residential",
        serviceType: primaryService,
        selectedServices,
        frequency: getPrimaryFrequency(),
        serviceFrequencies,
        propertySize: measurementBundle?.lawnAreaSqFt || 5000,
        serviceData: selectedServices.reduce((acc, serviceId) => {
          acc[serviceId] = {
            propertySize: measurementBundle?.lawnAreaSqFt,
            linearFeet: measurementBundle?.rooflineWithOverhangFt,
            zones: measurementBundle?.estimatedZones,
            perimeterFt: measurementBundle?.lotPerimeterFt,
            hedgeLengthFt: measurementBundle?.estimatedHedgeFt,
            frequency: serviceFrequencies[serviceId] || "one-time",
          };
          return acc;
        }, {} as Record<string, any>),
      };
      
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit quote");
      }
      return response.json();
    },
    onSuccess: async (response: any) => {
      setQuoteId(response.quoteId || response.id || null);
      setFinalQuote(response);
      setIsSubmitted(true);
      setTimeout(() => {
        if (formContainerRef.current) {
          formContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      toast({
        title: "Quote submitted!",
        description: "We'll contact you shortly with a detailed estimate.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error submitting quote",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = contactForm.handleSubmit((data) => {
    submitQuoteMutation.mutate(data);
  });
  
  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
    );
  };
  
  const canProceedToPhase2 = measurementBundle !== null;
  const canProceedToPhase3 = selectedServices.length > 0;
  
  return (
    <div ref={formContainerRef} className={`max-w-2xl mx-auto ${className}`}>
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                phase >= step 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              }`}
              data-testid={`progress-step-${step}`}
            >
              {phase > step ? <Check className="w-5 h-5" /> : step}
            </div>
            {step < 3 && (
              <div className={`w-12 h-1 mx-1 rounded ${phase > step ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>
      
      {/* Phase 1: Property */}
      {phase === 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <Image 
                src="/images/lawn-care-kuna-icon.png" 
                alt="Lawn Care Kuna" 
                width={56}
                height={56}
                className="mx-auto mb-3"
              />
              <h2 className="text-2xl font-bold text-foreground">Where's your property?</h2>
              <p className="text-muted-foreground mt-1">
                Enter your address and we'll automatically measure your property
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Property Address</label>
                <AddressAutocomplete
                  value={address}
                  onChange={(val) => setAddress(val)}
                  onAddressSelect={(result) => handleAddressSelect(result.label, result.raw)}
                  city={city}
                  placeholder="Start typing your address..."
                  className="w-full"
                  data-testid="input-address"
                />
                {address.length > 5 && !measurementBundle && !isLookingUp && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => handleAddressSelect(address)}
                    data-testid="button-use-address"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Use this address
                  </Button>
                )}
              </div>
              
              {isLookingUp && (
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg" data-testid="lookup-loading">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-muted-foreground">Looking up property details...</span>
                </div>
              )}
              
              {lookupError && (
                <Alert variant="default">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{lookupError}</AlertDescription>
                </Alert>
              )}
              
              {measurementBundle && !isLookingUp && (
                <div 
                  className="p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-lg"
                  data-testid="property-confirmation"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-primary">
                        Property Found
                      </div>
                      <div className="text-sm text-primary mt-1">
                        {getMeasurementSummary(measurementBundle).join(" • ")}
                      </div>
                      <div className="text-xs text-primary mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs py-0">
                          {getConfidenceLabel(measurementBundle.confidence).label}
                        </Badge>
                        <Badge variant="outline" className="text-xs py-0" data-testid="detected-city">
                          {city}, Idaho
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary"
                      data-testid="button-adjust-measurements"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Adjust
                    </Button>
                  </div>
                </div>
              )}
              
              {measurementBundle && (
                <div className="flex gap-3 pt-2">
                  <Button
                    variant={propertyType === "residential" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setPropertyType("residential")}
                    data-testid="button-residential"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Residential
                  </Button>
                  <Button
                    variant={propertyType === "commercial" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setPropertyType("commercial")}
                    data-testid="button-commercial"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Commercial
                  </Button>
                </div>
              )}
            </div>
            
            {measurementBundle && (
              <Button 
                className="w-full mt-6" 
                size="lg"
                onClick={() => setPhase(2)}
                disabled={!canProceedToPhase2}
                data-testid="button-continue-to-services"
              >
                Continue to Services
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Phase 2: Services */}
      {phase === 2 && (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <Image 
                  src="/images/lawn-care-kuna-icon.png" 
                  alt="Lawn Care Kuna" 
                  width={56}
                  height={56}
                  className="mx-auto mb-3"
                />
                <h2 className="text-2xl font-bold text-foreground">What do you need?</h2>
                <p className="text-muted-foreground mt-1">
                  Select what you're looking for and we'll recommend the right services
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" data-testid="intent-grid">
                {SERVICE_INTENTS.map((intent) => {
                  const Icon = intent.icon;
                  const isSelected = selectedIntents.includes(intent.id);
                  return (
                    <button
                      key={intent.id}
                      onClick={() => {
                        setSelectedIntents(prev =>
                          prev.includes(intent.id)
                            ? prev.filter(i => i !== intent.id)
                            : [...prev, intent.id]
                        );
                      }}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected 
                          ? "border-primary bg-primary/10" 
                          : "border-muted hover:border-primary/50"
                      }`}
                      data-testid={`intent-${intent.id}`}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="font-medium text-sm">{intent.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{intent.description}</div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {selectedServices.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Selected Services</h3>
                  <Badge variant="secondary">{selectedServices.length} services</Badge>
                </div>
                
                <div className="space-y-2">
                  {selectedServices.map((serviceId) => {
                    const service = ALL_SERVICES.find(s => s.id === serviceId);
                    if (!service) return null;
                    const isRecurringEligible = RECURRING_ELIGIBLE.has(serviceId);
                    const freqOptions = isRecurringEligible ? getFrequencyOptionsForService(serviceId) : [];
                    const currentFreq = serviceFrequencies[serviceId] || "one-time";
                    return (
                      <div 
                        key={serviceId}
                        className="p-3 bg-muted/50 rounded-lg"
                        data-testid={`selected-service-${serviceId}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-primary" />
                            <span className="font-medium">{service.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleService(serviceId)}
                            className="text-muted-foreground hover:text-destructive"
                            data-testid={`remove-service-${serviceId}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        {isRecurringEligible && freqOptions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5" data-testid={`frequency-selector-${serviceId}`}>
                            {freqOptions.map(opt => (
                              <button
                                type="button"
                                key={opt.value}
                                onClick={() => setServiceFrequencies(prev => ({ ...prev, [serviceId]: opt.value }))}
                                className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                                  currentFreq === opt.value
                                    ? "border-primary bg-primary/10 text-primary font-medium"
                                    : "border-muted text-muted-foreground hover:border-primary/50"
                                }`}
                                data-testid={`frequency-${serviceId}-${opt.value}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {getAvailableUpsells().length > 0 && (
                  <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg" data-testid="upsell-section">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">We also recommend</span>
                    </div>
                    <div className="space-y-2">
                      {getAvailableUpsells().map(({ service, prompt }) => {
                        const serviceData = ALL_SERVICES.find(s => s.id === service);
                        if (!serviceData) return null;
                        return (
                          <button
                            key={service}
                            onClick={() => toggleService(service)}
                            className="w-full flex items-center justify-between p-3 bg-background rounded-lg border border-muted hover:border-primary/50 transition-all group"
                            data-testid={`upsell-${service}`}
                          >
                            <div className="flex items-center gap-2">
                              <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                              <span className="text-sm">{serviceData.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Add</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setShowAllServices(!showAllServices)}
                  data-testid="button-add-more-services"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {showAllServices ? "Hide additional services" : "Add more services"}
                </Button>
                
                {showAllServices && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {ALL_SERVICES.filter(s => !selectedServices.includes(s.id)).map((service) => (
                      <button
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        className="p-2 text-left text-sm rounded border border-muted hover:border-primary hover:bg-primary/5 transition-all"
                        data-testid={`add-service-${service.id}`}
                      >
                        <Plus className="w-3 h-3 inline mr-1" />
                        {service.name}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {selectedServices.length > 0 && (
            <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm text-muted-foreground" data-testid="footer-service-summary">
                    {selectedServices.length} service{selectedServices.length !== 1 ? "s" : ""}
                    {recurringCount > 0 ? `, ${recurringCount} recurring` : ""}
                  </div>
                  <div className="text-2xl font-bold text-primary" data-testid="price-range">
                    {formatPriceRange(priceRange.min, priceRange.max)}
                  </div>
                </div>
                <Button 
                  size="lg"
                  onClick={() => setPhase(3)}
                  disabled={!canProceedToPhase3}
                  data-testid="button-continue-to-review"
                >
                  Get My Quote
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Phase 3: Review & Submit */}
      {phase === 3 && (
        <div className="space-y-6">
          {!isSubmitted ? (
            <>
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-bold mb-4">Your Quote Summary</h2>
                  
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Property</div>
                    <div className="font-medium">{address || "Address not provided"}</div>
                    {measurementBundle && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {getMeasurementSummary(measurementBundle).join(" • ")}
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground mb-2">Services ({selectedServices.length})</div>
                    <div className="space-y-1">
                      {selectedServices.map((serviceId) => {
                        const service = ALL_SERVICES.find(s => s.id === serviceId);
                        const freq = serviceFrequencies[serviceId];
                        const freqLabel = freq && freq !== "one-time"
                          ? FREQUENCY_OPTIONS.find(o => o.value === freq)?.label || freq
                          : null;
                        return (
                          <div key={serviceId} className="flex items-center justify-between text-sm" data-testid={`review-service-${serviceId}`}>
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-primary" />
                              <span>{service?.name || serviceId}</span>
                            </div>
                            {freqLabel && (
                              <Badge variant="secondary" className="text-xs">{freqLabel}</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-primary/10 rounded-lg text-center">
                    <div className="text-sm text-muted-foreground">Estimated Price Range</div>
                    <div className="text-3xl font-bold text-primary">
                      {formatPriceRange(priceRange.min, priceRange.max)}
                    </div>
                    {recurringCount > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {recurringCount} recurring service{recurringCount !== 1 ? "s" : ""} included
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Your Contact Information</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Name *</label>
                      <Input
                        {...contactForm.register("name")}
                        placeholder="Your full name"
                        data-testid="input-name"
                      />
                      {contactForm.formState.errors.name && (
                        <p className="text-sm text-destructive mt-1">
                          {contactForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Email *</label>
                      <Input
                        {...contactForm.register("email")}
                        type="email"
                        placeholder="your@email.com"
                        data-testid="input-email"
                      />
                      {contactForm.formState.errors.email && (
                        <p className="text-sm text-destructive mt-1">
                          {contactForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Phone *</label>
                      <Input
                        {...contactForm.register("phone")}
                        type="tel"
                        placeholder="(208) 555-1234"
                        data-testid="input-phone"
                      />
                      {contactForm.formState.errors.phone && (
                        <p className="text-sm text-destructive mt-1">
                          {contactForm.formState.errors.phone.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Additional Notes (optional)</label>
                      <textarea
                        {...contactForm.register("message")}
                        className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm"
                        placeholder="Any special requests or details about your property..."
                        data-testid="input-message"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={submitQuoteMutation.isPending}
                      data-testid="button-submit-quote"
                    >
                      {submitQuoteMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Getting your quote...
                        </>
                      ) : (
                        <>
                          <Star className="w-4 h-4 mr-2" />
                          Get My Free Quote
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 dark:bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Quote Submitted!</h2>
                  <p className="text-muted-foreground mt-2">
                    We've received your request and will contact you within 24 hours with a detailed estimate.
                  </p>
                </div>
                
                <div className="p-4 bg-primary/10 rounded-lg text-center mb-6">
                  <div className="text-sm text-muted-foreground">Estimated Price Range</div>
                  <div className="text-3xl font-bold text-primary">
                    {formatPriceRange(priceRange.min, priceRange.max)}
                  </div>
                  {recurringCount > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {recurringCount} recurring service{recurringCount !== 1 ? "s" : ""} included
                    </div>
                  )}
                </div>
                
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Services Requested</div>
                  <div className="space-y-1">
                    {selectedServices.map((serviceId) => {
                      const service = ALL_SERVICES.find(s => s.id === serviceId);
                      const freq = serviceFrequencies[serviceId];
                      const freqLabel = freq && freq !== "one-time"
                        ? FREQUENCY_OPTIONS.find(o => o.value === freq)?.label || freq
                        : null;
                      return (
                        <div key={serviceId} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-primary" />
                            <span>{service?.name || serviceId}</span>
                          </div>
                          {freqLabel && (
                            <Badge variant="secondary" className="text-xs">{freqLabel}</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {quoteId && (
                  <div className="text-center text-sm text-muted-foreground">
                    Quote Reference: <span className="font-mono">{quoteId.slice(0, 8)}</span>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full mt-6"
                  onClick={() => {
                    setPhase(1);
                    setIsSubmitted(false);
                    setSelectedServices([]);
                    setSelectedIntents([]);
                    setMeasurementBundle(null);
                    setAddress("");
                    setServiceFrequencies({});
                    contactForm.reset();
                  }}
                  data-testid="button-new-quote"
                >
                  Start a New Quote
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
