import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, MapPin, Phone, Mail, Building, ShoppingCart, AlertCircle, CheckCircle2, Clock, Filter, Search, ArrowUpDown, Eye, EyeOff, Star, Receipt, ChevronDown, Info, Lock, X, Loader2, XCircle, Ruler, HelpCircle, TrendingDown, Percent, FileSignature, Users, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Lead, User } from "@shared/schema";
import { CITIES, PRIORITY_SERVICES } from "@shared/contentData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatQuoteRangeWholeFromValue } from "@/lib/utils";
import { calculateQuoteRange } from "@shared/utils";
import StripePaymentForm from "@/components/StripePaymentForm";
import { Switch } from "@/components/ui/switch";

// Type definitions
interface LineItem {
  serviceId?: string;
  service?: string;
  serviceName?: string;
  description?: string;
  price?: number;
  basePrice?: number;
  adjustedPrice?: number;
  calculationExplanation?: string;
}

interface ServiceDataEntry {
  propertySize?: number;
  linearFeet?: number;
  zones?: number;
  treeCount?: number;
  quantity?: number;
  [key: string]: any;
}

export default function SubcontractorPortal() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    city: "all",
    serviceType: "all",
    maxPrice: "",
    minPrice: "",
    minQuote: "",
    maxQuote: "",
    propertyType: "all",
    frequency: "all",
    daysOld: "all",
  });
  const [sortBy, setSortBy] = useState<"price" | "quote" | "date" | "age">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [signatureInput, setSignatureInput] = useState("");
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"available" | "watchlist">("available");
  const [welcomeCardDismissed, setWelcomeCardDismissed] = useState(false);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentStep, setPaymentStep] = useState<"confirm" | "payment" | "success">("confirm");
  const [detailViewLead, setDetailViewLead] = useState<Lead | null>(null);
  const leadIdParam = useMemo(() => new URLSearchParams(window.location.search).get("leadId"), []);
  
  // Bulk purchase state
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [showBulkPurchaseModal, setShowBulkPurchaseModal] = useState(false);
  const [bulkPaymentClientSecret, setBulkPaymentClientSecret] = useState<string | null>(null);
  const [bulkPaymentAmount, setBulkPaymentAmount] = useState<number>(0);
  const [bulkPaymentStep, setBulkPaymentStep] = useState<"confirm" | "payment" | "success">("confirm");
  
  // Bulk selection functions
  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeadIds(prev => {
      const next = new Set(prev);
      if (next.has(leadId)) {
        next.delete(leadId);
      } else {
        next.add(leadId);
      }
      return next;
    });
  };
  
  const calculateBulkDiscount = (count: number): { discountPercent: number; label: string } => {
    if (count > 20) return { discountPercent: 20, label: "20% Bulk Discount" };
    if (count >= 6) return { discountPercent: 10, label: "10% Bulk Discount" };
    if (count >= 2) return { discountPercent: 5, label: "5% Bulk Discount" };
    return { discountPercent: 0, label: "" };
  };
  
  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads?availableOnly=true"],
    enabled: isAuthenticated,
  });

  const { data: watchlistLeads = [], isLoading: watchlistLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads/watchlist"],
    enabled: isAuthenticated && activeTab === "watchlist",
  });

  const { data: userData } = useQuery<User>({
    queryKey: ["/api/user"],
    enabled: isAuthenticated,
  });

  const agreementAccepted = Boolean(userData?.agreementAccepted ?? user?.agreementAccepted);
  const emailNotificationsEnabled = Boolean((userData as any)?.emailNotificationsEnabled ?? true);

  const updateNotificationPrefsMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await apiRequest("PATCH", "/api/user/notification-preferences", {
        emailNotificationsEnabled: enabled,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Preferences updated",
        description: "Your notification settings have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Deep-link support: `/subcontractor/portal?leadId=...` scrolls to the lead card.
  useEffect(() => {
    if (!leadIdParam) return;

    // Email CTAs should land on Available customers.
    if (activeTab !== "available") {
      setActiveTab("available");
      return;
    }

    requestAnimationFrame(() => {
      const el = document.getElementById(`lead-${leadIdParam}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [activeTab, leadIdParam, leads.length, watchlistLeads.length]);

  // Keep checkbox state synced when the modal opens and/or server state changes.
  useEffect(() => {
    if (!showAgreementModal) {
      setSignatureInput("");
      return;
    }
    setAgreementChecked(agreementAccepted);
  }, [showAgreementModal, agreementAccepted]);

  const watchedLeadIds = useMemo(() => {
    if (!userData?.watchedLeads) return [];
    if (Array.isArray(userData.watchedLeads)) return userData.watchedLeads;
    if (typeof userData.watchedLeads === 'string') {
      try {
        return JSON.parse(userData.watchedLeads);
      } catch {
        return [];
      }
    }
    return [];
  }, [userData?.watchedLeads]);

  const declinedLeadIds = useMemo(() => {
    if (!userData?.declinedLeads) return [];
    if (Array.isArray(userData.declinedLeads)) return userData.declinedLeads;
    if (typeof userData.declinedLeads === 'string') {
      try {
        return JSON.parse(userData.declinedLeads);
      } catch {
        return [];
      }
    }
    return [];
  }, [userData?.declinedLeads]);

  const watchLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await apiRequest("POST", `/api/leads/${leadId}/watch`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/watchlist"] });
      toast({
        title: "Lead Added to Watchlist",
        description: "You'll be notified when the price drops.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unwatchLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await apiRequest("POST", `/api/leads/${leadId}/unwatch`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/watchlist"] });
      toast({
        title: "Lead Removed from Watchlist",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const declineLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await apiRequest("POST", `/api/leads/${leadId}/pass`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads?availableOnly=true"] });
      toast({
        title: "Lead Passed",
        description: "This lead won't appear in your available list anymore",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await apiRequest("POST", "/api/create-payment-intent", { leadId });
      return await res.json();
    },
    onSuccess: (data) => {
      setPaymentClientSecret(data.clientSecret);
      setPaymentAmount(data.amount);
      setPaymentStep("payment");
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const purchaseLeadMutation = useMutation({
    mutationFn: async ({ leadId, paymentIntentId }: { leadId: string; paymentIntentId: string }) => {
      const res = await apiRequest("POST", `/api/leads/${leadId}/purchase`, {
        paymentIntentId,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads?availableOnly=true"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/purchases"] });
      
      // Show purchased lead with revealed contact info
      if (data.lead) {
        setSelectedLead(data.lead);
        setPaymentStep("success");
      } else {
        setShowPurchaseModal(false);
        setSelectedLead(null);
      }
      
      toast({
        title: "Lead Purchased!",
        description: "Contact information is now revealed below.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Bulk purchase mutations
  const createBulkPaymentIntentMutation = useMutation({
    mutationFn: async (leadIds: string[]) => {
      const res = await apiRequest("POST", "/api/create-bulk-payment-intent", { leadIds });
      return await res.json();
    },
    onSuccess: (data) => {
      setBulkPaymentClientSecret(data.clientSecret);
      setBulkPaymentAmount(data.amount);
      setBulkPaymentStep("payment");
    },
    onError: (error: Error) => {
      toast({ title: "Payment Setup Failed", description: error.message, variant: "destructive" });
    },
  });

  const bulkPurchaseMutation = useMutation({
    mutationFn: async ({ leadIds, paymentIntentId }: { leadIds: string[]; paymentIntentId: string }) => {
      const res = await apiRequest("POST", "/api/leads/bulk-purchase", { leadIds, paymentIntentId });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads?availableOnly=true"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/purchases"] });
      const purchasedCount = data.purchasedCount || selectedLeadIds.size;
      setSelectedLeadIds(new Set());
      setBulkPaymentStep("success");
      toast({ title: "Bulk Purchase Complete!", description: `Successfully purchased ${purchasedCount} leads.` });
    },
    onError: (error: Error) => {
      toast({ title: "Bulk Purchase Failed", description: error.message, variant: "destructive" });
    },
  });

  const handleBulkPurchase = () => {
    if (!agreementAccepted) {
      setShowAgreementModal(true);
      return;
    }
    if (selectedLeadIds.size === 0) return;
    setBulkPaymentClientSecret(null);
    setBulkPaymentAmount(0);
    setBulkPaymentStep("confirm");
    setShowBulkPurchaseModal(true);
  };

  const handleBulkPaymentSuccess = async (paymentIntentId: string) => {
    const leadIds = Array.from(selectedLeadIds);
    bulkPurchaseMutation.mutate({ leadIds, paymentIntentId });
  };

  const handleBulkPaymentCancel = () => {
    setBulkPaymentStep("confirm");
    setBulkPaymentClientSecret(null);
  };

  const handleCloseBulkPurchaseModal = () => {
    setShowBulkPurchaseModal(false);
    setBulkPaymentClientSecret(null);
    setBulkPaymentStep("confirm");
  };

  const handleAcceptAgreement = async () => {
    try {
      const res = await apiRequest("POST", "/api/user/accept-agreement", {
        signature: signatureInput.trim()
      });
      await res.json();
      setAgreementChecked(true);
      setSignatureInput("");
      setShowAgreementModal(false);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Agreement Accepted",
        description: "You can now purchase leads.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept agreement",
        variant: "destructive",
      });
    }
  };

  const handlePurchaseLead = (lead: Lead) => {
    if (!agreementAccepted) {
      setShowAgreementModal(true);
      return;
    }
    setSelectedLead(lead);
    setPaymentClientSecret(null);
    setPaymentAmount(0);
    setPaymentStep("confirm");
    setShowPurchaseModal(true);
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (selectedLead) {
      purchaseLeadMutation.mutate({ leadId: selectedLead.id, paymentIntentId });
    }
  };

  const handlePaymentCancel = () => {
    setPaymentStep("confirm");
    setPaymentClientSecret(null);
  };

  const handleClosePurchaseModal = () => {
    setShowPurchaseModal(false);
    setSelectedLead(null);
    setPaymentClientSecret(null);
    setPaymentStep("confirm");
  };

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    let filtered = [...leads].filter(l => l.status === "available").filter(l => !declinedLeadIds.includes(l.id));
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(lead => 
        lead.city?.toLowerCase().includes(query) ||
        lead.serviceType?.toLowerCase().includes(query)
      );
    }
    
    // City filter
    if (filters.city !== "all") {
      filtered = filtered.filter(l => l.city.toLowerCase() === filters.city.toLowerCase());
    }
    
    // Service type filter
    if (filters.serviceType !== "all") {
      filtered = filtered.filter(l => l.serviceType.toLowerCase().includes(filters.serviceType.toLowerCase()));
    }
    
    // Price filters
    if (filters.minPrice) {
      const min = parseFloat(filters.minPrice);
      if (!isNaN(min)) {
        filtered = filtered.filter(l => parseFloat(l.currentLeadPrice || "0") >= min);
      }
    }
    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice);
      if (!isNaN(max)) {
        filtered = filtered.filter(l => parseFloat(l.currentLeadPrice || "0") <= max);
      }
    }
    
    // Quote value filters
    if (filters.minQuote) {
      const min = parseFloat(filters.minQuote);
      if (!isNaN(min)) {
        filtered = filtered.filter(l => {
          if (!l.finalQuote) return false;
          const { max: quoteMax } = calculateQuoteRange(l.finalQuote, 0.15);
          return quoteMax >= min;
        });
      }
    }
    if (filters.maxQuote) {
      const max = parseFloat(filters.maxQuote);
      if (!isNaN(max)) {
        filtered = filtered.filter(l => {
          if (!l.finalQuote) return false;
          const { min: quoteMin } = calculateQuoteRange(l.finalQuote, 0.15);
          return quoteMin <= max;
        });
      }
    }
    
    // Property type filter
    if (filters.propertyType !== "all") {
      filtered = filtered.filter(l => l.propertyType === filters.propertyType);
    }
    
    // Frequency filter
    if (filters.frequency !== "all") {
      filtered = filtered.filter(l => l.frequency === filters.frequency);
    }
    
    // Days old filter
    if (filters.daysOld !== "all") {
      const now = new Date();
      filtered = filtered.filter(l => {
        const created = new Date(l.createdAt);
        const days = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filters.daysOld) {
          case "today":
            return days === 0;
          case "1-3":
            return days >= 1 && days <= 3;
          case "4-7":
            return days >= 4 && days <= 7;
          case "7+":
            return days > 7;
          default:
            return true;
        }
      });
    }
    
    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "price":
          comparison = parseFloat(a.currentLeadPrice || "0") - parseFloat(b.currentLeadPrice || "0");
          break;
        case "quote":
          const pointA = a.finalQuote ? calculateQuoteRange(a.finalQuote, 0.15).point : 0;
          const pointB = b.finalQuote ? calculateQuoteRange(b.finalQuote, 0.15).point : 0;
          comparison = pointA - pointB;
          break;
        case "date":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "age":
          const ageA = new Date().getTime() - new Date(a.createdAt).getTime();
          const ageB = new Date().getTime() - new Date(b.createdAt).getTime();
          comparison = ageA - ageB;
          break;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });
    
    return filtered;
  }, [leads, searchQuery, filters, sortBy, sortOrder, declinedLeadIds]);

  // Computed values for bulk selection
  const selectedLeads = useMemo(() => {
    return filteredLeads.filter(l => selectedLeadIds.has(l.id));
  }, [filteredLeads, selectedLeadIds]);
  
  const bulkTotal = useMemo(() => {
    const subtotal = selectedLeads.reduce((sum, l) => sum + parseFloat(l.currentLeadPrice || "0"), 0);
    const { discountPercent } = calculateBulkDiscount(selectedLeads.length);
    const discount = subtotal * (discountPercent / 100);
    return { subtotal, discount, total: subtotal - discount, count: selectedLeads.length };
  }, [selectedLeads]);

  // Check if first-time user
  const { data: purchases = [] } = useQuery<any[]>({
    queryKey: ["/api/leads/purchases"],
    enabled: isAuthenticated,
  });
  
  const isFirstTimeUser = useMemo(() => {
    return (!agreementAccepted && (!purchases || purchases.length === 0));
  }, [agreementAccepted, purchases]);

  // Helper function to format service measurements
  const formatMeasurement = (serviceId: string, data: ServiceDataEntry | undefined): string => {
    if (!data) return '';
    
    const parts: string[] = [];
    
    if (data.propertySize) {
      parts.push(`${data.propertySize.toLocaleString()} sq ft`);
    }
    if (data.linearFeet) {
      parts.push(`${data.linearFeet.toLocaleString()} linear ft`);
    }
    if (data.zones) {
      parts.push(`${data.zones} zone${data.zones > 1 ? 's' : ''}`);
    }
    if (data.treeCount) {
      parts.push(`${data.treeCount} tree${data.treeCount > 1 ? 's' : ''}`);
    }
    if (data.quantity) {
      parts.push(`${data.quantity} unit${data.quantity > 1 ? 's' : ''}`);
    }
    
    return parts.join(', ');
  };

  // Helper function to calculate discount
  const calculateDiscount = (basePrice: string, currentPrice: string) => {
    const base = parseFloat(basePrice || "0");
    const current = parseFloat(currentPrice || "0");
    if (base <= current) return { percentage: 0, amount: 0 };
    const amount = base - current;
    const percentage = (amount / base) * 100;
    return { percentage, amount };
  };

  // Helper function to get pricing explanation
  const getPricingExplanation = (frequency: string, serviceType: string, finalQuote: string) => {
    if (frequency === "one-time") {
      const quotePoint = calculateQuoteRange(finalQuote || "0", 0.15).point;
      return `Based on 10% of project value ($${quotePoint.toFixed(0)})`;
    } else {
      // Show service-specific recurring price
      const recurringPrices: Record<string, number> = {
        "lawn-mowing": 45,
        "lawn-care": 50,
        "fertilization": 60,
        "aeration": 75,
        "weed-control": 55,
        "tree-trimming": 85,
        "hedge-trimming": 65,
        "landscaping": 80,
        "mulching": 70,
        "seasonal-cleanup": 90,
        "christmas-lights": 150,
      };
      const price = recurringPrices[serviceType] || 60;
      return `Based on cost of one service visit ($${price})`;
    }
  };

  // Get service name helper
  const getServiceName = (serviceSlug: string): string => {
    const service = PRIORITY_SERVICES.find(s => s.slug === serviceSlug);
    return service ? service.name : serviceSlug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "$0.00";
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDaysOld = (date: Date | string) => {
    const now = new Date();
    const created = new Date(date);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Quote Breakdown Section Component
  const QuoteBreakdownSection = ({ lead }: { lead: Lead }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const lineItems = (lead.lineItems as LineItem[] | null) || [];
    const serviceData = (lead.serviceData as Record<string, ServiceDataEntry> | null) || {};
    const hasBreakdown = lineItems.length > 0 || Object.keys(serviceData).length > 0;
    
    if (!hasBreakdown && !lead.finalQuote) {
      return null;
    }
    
    const formatPrice = (price: number | undefined) => {
      if (price === undefined || price === null) return '$0';
      return `$${price.toLocaleString()}`;
    };
    
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="border-t pt-4 mt-4">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between p-0 h-auto font-medium text-sm hover:bg-transparent"
            >
              <span className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                View Full Project Details
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-3">
            {lineItems.length > 0 ? (
              <div className="space-y-3">
                {lineItems.map((item, index) => {
                  const serviceId = item.serviceId || item.service || '';
                  const serviceName = item.serviceName || item.service || 'Service';
                  const price = item.price || item.adjustedPrice || 0;
                  const measurement = serviceData[serviceId] ? formatMeasurement(serviceId, serviceData[serviceId]) : '';
                  
                  return (
                    <div 
                      key={index} 
                      className="bg-muted/50 rounded-md p-3"
                    >
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {serviceName}
                        </span>
                        <span className="font-semibold text-sm text-primary">
                          {formatPrice(price)}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                      {measurement && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Measurement: {measurement}
                        </p>
                      )}
                      {item.calculationExplanation && (
                        <p className="text-xs text-muted-foreground/70 italic mt-2 pl-2 border-l-2 border-muted">
                          {item.calculationExplanation}
                        </p>
                      )}
                    </div>
                  );
                })}
                
                {lead.finalQuote && (
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-semibold text-sm">Total Project Value</span>
                    <span className="font-bold text-lg text-primary">
                      {formatQuoteRangeWholeFromValue(lead.finalQuote, 0.15)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {Object.keys(serviceData).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Service Measurements:</p>
                    {Object.entries(serviceData).map(([svcId, data]) => (
                      <div key={svcId} className="bg-muted/50 rounded-md p-2 text-sm">
                        <span className="font-medium">{getServiceName(svcId)}</span>
                        <span className="text-muted-foreground ml-2">{formatMeasurement(svcId, data)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {lead.finalQuote && (
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-semibold text-sm">Total Project Value</span>
                    <span className="font-bold text-lg text-primary">
                      {formatQuoteRangeWholeFromValue(lead.finalQuote, 0.15)}
                    </span>
                  </div>
                )}
              </div>
            )}
            {lead.selectedServices && Array.isArray(lead.selectedServices) && lead.selectedServices.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-medium mb-2">Selected Services:</p>
                <div className="flex flex-wrap gap-2">
                  {lead.selectedServices.map((service, idx) => (
                    <Badge key={idx} variant="secondary">
                      {getServiceName(service)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };

  // Lead Pricing Section Component
  const LeadPricingSection = ({ lead }: { lead: Lead }) => {
    const [isOpen, setIsOpen] = useState(false);
    // baseLeadPrice should always be set, but fallback to currentLeadPrice if missing
    const basePrice = lead.baseLeadPrice || lead.currentLeadPrice || "0";
    const currentPrice = lead.currentLeadPrice || "0";
    // Only calculate discount if we have a valid base price that's different from current
    const discount = basePrice && basePrice !== currentPrice ? calculateDiscount(basePrice, currentPrice) : { percentage: 0, amount: 0 };
    const pricingExplanation = getPricingExplanation(lead.frequency || "one-time", lead.serviceType || "", lead.finalQuote || "0");
    
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="border-t pt-4 mt-4">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between p-0 h-auto font-medium text-sm hover:bg-transparent"
            >
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                How is this priced?
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-3 space-y-3">
            <div className="bg-muted/50 rounded-md p-3 text-sm">
              <p className="font-medium mb-2">Base Price Calculation:</p>
              <p className="text-muted-foreground">{pricingExplanation}</p>
              {lead.frequency === "one-time" && (
                <p className="text-muted-foreground mt-1 text-xs">
                  One-time projects: 10% of total project value
                </p>
              )}
              {lead.frequency !== "one-time" && (
                <p className="text-muted-foreground mt-1 text-xs">
                  Recurring services: Fixed price per service type
                </p>
              )}
            </div>
            
            {discount.percentage > 0 && (
              <div className="bg-primary/10 rounded-md p-3 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground line-through">
                    Original: {formatCurrency(basePrice)}
                  </span>
                  <Badge variant="default" className="bg-primary">
                    Save {discount.percentage.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Current Price:</span>
                  <span className="font-bold text-lg text-primary">
                    {formatCurrency(currentPrice)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  You're saving {formatCurrency(discount.amount.toString())}
                </p>
              </div>
            )}
            
            {discount.percentage === 0 && (
              <div className="bg-muted/50 rounded-md p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Current Price:</span>
                  <span className="font-bold text-lg text-primary">
                    {formatCurrency(currentPrice)}
                  </span>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-md p-3 text-xs text-muted-foreground">
              <p className="font-medium mb-1">Price Reduction Schedule:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Price reduces 1.5% daily until purchased</li>
                <li>Minimum price: 20% of base price</li>
                <li>Prices rounded to nearest $5</li>
              </ul>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };

  // Welcome Card Component
  const WelcomeCard = () => {
    if (welcomeCardDismissed || !isFirstTimeUser) return null;
    
    return (
      <Alert className="mb-6 border-primary/50 bg-primary/5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <AlertTitle className="flex items-center gap-2 mb-2">
              <Info className="h-5 w-5" />
              Welcome to the Contractor Portal
            </AlertTitle>
            <AlertDescription className="space-y-2">
              <p className="font-medium">Simple 3-step process:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Browse available customers and project details</li>
                <li>Review full project scope before you buy</li>
                <li>Purchase to unlock customer contact information</li>
              </ol>
              <div className="mt-3 pt-3 border-t space-y-1 text-sm">
                <p className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>Customer contact info (name, phone, email, address) is hidden until purchase</span>
                </p>
                <p className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>Save customers to your watchlist to get notified when prices drop</span>
                </p>
                <p className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>All purchases are final - review project details carefully before buying</span>
                </p>
              </div>
            </AlertDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={() => setWelcomeCardDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    );
  };

  return (
    <div data-testid="page-subcontractor-portal">
      {/* Hero Section with Gradient */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Contractor Portal
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse and purchase high-quality customer projects in your service area
            </p>
          </div>
        </div>
      </section>
      
      <div className="container py-8">

      <Collapsible className="mb-6">
        <Card>
          <CollapsibleTrigger asChild>
            <button
              className="w-full flex items-center justify-between p-4 md:p-6 text-left hover-elevate rounded-md"
              data-testid="button-how-it-works-toggle"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary/10">
                  <HelpCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">How It Works</h2>
                  <p className="text-sm text-muted-foreground">Learn how to browse, watch, and purchase customer leads</p>
                </div>
              </div>
              <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-6">
              <div className="border-t pt-4" />

              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-start justify-center h-9 w-9 rounded-md bg-primary/10 mt-0.5">
                  <FileSignature className="h-4 w-4 text-primary mt-2.5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold" data-testid="text-how-it-works-getting-started">Getting Started</h3>
                  <p className="text-sm text-muted-foreground">
                    After logging in for the first time, you will be asked to sign a short agreement by typing your name. This is a one-time step and you will not need to do it again. Once that is complete, you will have full access to browse and purchase leads.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-start justify-center h-9 w-9 rounded-md bg-primary/10 mt-0.5">
                  <Search className="h-4 w-4 text-primary mt-2.5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold" data-testid="text-how-it-works-browsing">Browsing Available Leads</h3>
                  <p className="text-sm text-muted-foreground">
                    The portal shows a live feed of available customer leads in the Treasure Valley area. For each lead, you can see the city, service type, property size, and estimated project value. You can also filter by city, service, and price range to find the leads that match your business.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Customer contact details (name, phone, email, and exact address) stay hidden until you purchase the lead.
                  </p>
                  <div className="flex items-start gap-2 mt-2 p-3 bg-muted/50 rounded-md">
                    <Users className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Important:</span> Until a lead is purchased, it is visible to all registered subcontractors. Adding a lead to your watchlist does not reserve it.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-start justify-center h-9 w-9 rounded-md bg-primary/10 mt-0.5">
                  <Eye className="h-4 w-4 text-primary mt-2.5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold" data-testid="text-how-it-works-watchlist">Watchlist</h3>
                  <p className="text-sm text-muted-foreground">
                    If you are interested in a lead but not ready to buy yet, you can add it to your watchlist. You will be notified when the price drops, so you can come back and grab it at a better deal. Keep in mind that the watchlist is just a bookmark and alert feature. It does not hold or reserve the lead for you, and another subcontractor can still purchase it.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-start justify-center h-9 w-9 rounded-md bg-primary/10 mt-0.5">
                  <TrendingDown className="h-4 w-4 text-primary mt-2.5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold" data-testid="text-how-it-works-pricing">How Pricing Works</h3>
                  <p className="text-sm text-muted-foreground">
                    Each lead is priced at roughly 10% of the estimated project value, with a minimum of $15. If a lead goes unclaimed, the price drops by about 1.5% each day. The price will never fall below 20% of its original value. So if you are patient, you may be able to pick up a great lead at a lower cost.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-start justify-center h-9 w-9 rounded-md bg-primary/10 mt-0.5">
                  <ShoppingCart className="h-4 w-4 text-primary mt-2.5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold" data-testid="text-how-it-works-purchasing">Purchasing a Lead</h3>
                  <p className="text-sm text-muted-foreground">
                    When you are ready to buy, click the purchase button on the lead. You will enter your payment details through Stripe, which handles everything securely. Once payment goes through, the customer's full contact information is revealed to you, including their name, phone number, email, and address. You will also receive an email with all the details for your records.
                  </p>
                  <div className="flex items-start gap-2 mt-2 p-3 bg-primary/5 rounded-md border border-primary/20">
                    <ShieldCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Exclusive leads:</span> Each lead is sold to only one subcontractor. Once you purchase a lead, that customer is exclusively yours. No other contractor will receive their information, and you will not be competing with anyone for that job.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-start justify-center h-9 w-9 rounded-md bg-primary/10 mt-0.5">
                  <Percent className="h-4 w-4 text-primary mt-2.5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold" data-testid="text-how-it-works-bulk-discounts">Bulk Discounts</h3>
                  <p className="text-sm text-muted-foreground">
                    Buying multiple leads at once saves you money. Purchase 2 or more leads to get 5% off, 6 or more for 10% off, and 20 or more for 20% off. Discounts are applied automatically at checkout.
                  </p>
                </div>
              </div>

            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Notification Preferences</CardTitle>
          <CardDescription>Control how you receive new lead notifications.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">Email notifications</p>
            <p className="text-sm text-muted-foreground">
              Turn this off if you prefer not to receive emails for new available leads. In-app notifications will still appear.
            </p>
          </div>
          <Switch
            checked={emailNotificationsEnabled}
            onCheckedChange={(checked) => updateNotificationPrefsMutation.mutate(Boolean(checked))}
            disabled={updateNotificationPrefsMutation.isPending}
            aria-label="Toggle email notifications"
          />
        </CardContent>
      </Card>

      {/* Welcome Card */}
      <WelcomeCard />

      {/* Agreement Requirement Banner */}
      {!agreementAccepted && (
        <Alert className="mb-6 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <AlertTitle className="text-orange-800 dark:text-orange-200">Accept Agreement Required</AlertTitle>
          <AlertDescription className="text-orange-700 dark:text-orange-300">
            You must accept the Lead Purchase Agreement before you can purchase customers.{" "}
            <Button
              variant="ghost"
              className="p-0 h-auto font-semibold text-orange-800 dark:text-orange-200 underline"
              onClick={() => setShowAgreementModal(true)}
            >
              Review Agreement
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter Customers
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by city or service type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, maxPrice: "50" })}
                  >
                    Under $50
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show customers priced under $50</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      setFilters({ ...filters, daysOld: "today" });
                    }}
                  >
                    Today's Customers
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show customers posted today</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, minQuote: "500" })}
                  >
                    High Value ($500+)
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show customers with project value $500 or more</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilters({
                  city: "all",
                  serviceType: "all",
                  maxPrice: "",
                  minPrice: "",
                  minQuote: "",
                  maxQuote: "",
                  propertyType: "all",
                  frequency: "all",
                  daysOld: "all",
                });
                setSearchQuery("");
              }}
            >
              Clear All
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              {/* City Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">City</label>
                <Select value={filters.city} onValueChange={(value) => setFilters({ ...filters, city: value })}>
                  <SelectTrigger data-testid="select-city-filter">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {CITIES.map(city => (
                      <SelectItem key={city.slug} value={city.slug}>{city.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Type Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Service Type</label>
                <Select value={filters.serviceType} onValueChange={(value) => setFilters({ ...filters, serviceType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {Array.from(new Set(leads.map(l => l.serviceType))).map(serviceType => (
                      <SelectItem key={serviceType} value={serviceType}>
                        {serviceType.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Property Type Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Property Type</label>
                <Select value={filters.propertyType} onValueChange={(value) => setFilters({ ...filters, propertyType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Frequency Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Frequency</label>
                <Select value={filters.frequency} onValueChange={(value) => setFilters({ ...filters, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="one-time">One-Time</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lead Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">Lead Price Range</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min $"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Max $"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Quote Value Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">Quote Value Range</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min $"
                    value={filters.minQuote}
                    onChange={(e) => setFilters({ ...filters, minQuote: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Max $"
                    value={filters.maxQuote}
                    onChange={(e) => setFilters({ ...filters, maxQuote: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Days Old Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Lead Age</label>
                <Select value={filters.daysOld} onValueChange={(value) => setFilters({ ...filters, daysOld: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Ages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="1-3">1-3 Days</SelectItem>
                    <SelectItem value="4-7">4-7 Days</SelectItem>
                    <SelectItem value="7+">7+ Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="price">Lead Price</SelectItem>
                      <SelectItem value="quote">Quote Value</SelectItem>
                      <SelectItem value="age">Age</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    title={sortOrder === "asc" ? "Ascending" : "Descending"}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="text-sm text-muted-foreground pt-2 border-t">
            Showing {filteredLeads.length} of {leads.length} available customers
          </div>
        </CardContent>
      </Card>

      {/* Stats - Only show for available tab */}
      {activeTab === "available" && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="count-available">{filteredLeads.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to purchase</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Customer Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-avg-price">
              {filteredLeads.length > 0
                ? formatCurrency(
                    (
                      filteredLeads.reduce((sum, l) => sum + parseFloat(l.currentLeadPrice || "0"), 0) /
                      filteredLeads.length
                    ).toFixed(2)
                  )
                : "$0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average cost per customer</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-value">
              {formatCurrency(
                filteredLeads
                  .reduce((sum, l) => sum + (l.finalQuote ? calculateQuoteRange(l.finalQuote, 0.15).point : 0), 0)
                  .toFixed(2)
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Combined project values</p>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Tabs for Available and Watchlist */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "available" | "watchlist")} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">Available Customers</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
        </TabsList>

      {/* Lead Cards - Responsive Grid */}
      <TabsContent value="available">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center">Loading available customers...</CardContent>
          </Card>
        ) : filteredLeads.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium mb-2">No customers match your filters</p>
              <p className="text-sm mb-4">Try adjusting your search criteria or check back later for new customers.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({
                    city: "all",
                    serviceType: "all",
                    maxPrice: "",
                    minPrice: "",
                    minQuote: "",
                    maxQuote: "",
                    propertyType: "all",
                    frequency: "all",
                    daysOld: "all",
                  });
                  setSearchQuery("");
                }}
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map((lead) => {
              const daysOld = calculateDaysOld(lead.createdAt);
              const originalPrice = parseFloat(lead.baseLeadPrice || "0");
              const currentPrice = parseFloat(lead.currentLeadPrice || "0");
              const discount = originalPrice > 0 ? ((originalPrice - currentPrice) / originalPrice * 100) : 0;
              const serviceData = (lead.serviceData as Record<string, ServiceDataEntry> | null) || {};
              const primaryServiceData = serviceData[lead.serviceType] || Object.values(serviceData)[0];
              const measurementText = primaryServiceData ? formatMeasurement(lead.serviceType, primaryServiceData) : '';

              return (
                <Card 
                  id={`lead-${lead.id}`} 
                  key={lead.id} 
                  className="overflow-hidden hover-elevate flex flex-col h-[340px] bg-gradient-to-br from-primary/5 via-background to-background" 
                  data-testid={`card-lead-${lead.id}`}
                >
                  <CardHeader className="pb-2 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <CardTitle className="text-base leading-tight">
                            {lead.serviceType.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </CardTitle>
                          {daysOld === 0 && <Badge variant="default" className="text-xs px-1.5 py-0">NEW</Badge>}
                        </div>
                        <CardDescription className="text-xs">
                          {lead.city.charAt(0).toUpperCase() + lead.city.slice(1)} • {lead.frequency || "One-time"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Checkbox
                          checked={selectedLeadIds.has(lead.id)}
                          onCheckedChange={() => toggleLeadSelection(lead.id)}
                          data-testid={`checkbox-select-${lead.id}`}
                          className="mr-1"
                        />
                        <TooltipProvider>
                          {watchedLeadIds.includes(lead.id) ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => unwatchLeadMutation.mutate(lead.id)}
                                  data-testid={`button-unwatch-${lead.id}`}
                                >
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Remove from watchlist</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => watchLeadMutation.mutate(lead.id)}
                                  data-testid={`button-watch-${lead.id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Save to watchlist</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => declineLeadMutation.mutate(lead.id)}
                                disabled={declineLeadMutation.isPending}
                                data-testid={`button-pass-${lead.id}`}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Pass on this lead</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col pt-0 pb-3 space-y-2">
                    <div className="flex items-center justify-between gap-2 py-2 border-y">
                      <div>
                        <p className="text-xs text-muted-foreground">Project Value</p>
                        <p className="font-semibold text-sm">
                          {lead.finalQuote ? formatQuoteRangeWholeFromValue(lead.finalQuote, 0.15) : "Pending"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Lead Price</p>
                        <div className="flex items-center gap-1.5">
                          {discount > 0 && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatCurrency(lead.baseLeadPrice)}
                            </span>
                          )}
                          <span className="font-bold text-primary" data-testid={`text-price-${lead.id}`}>
                            {formatCurrency(lead.currentLeadPrice)}
                          </span>
                          {discount > 0 && (
                            <Badge variant="secondary" className="text-xs px-1 py-0 text-primary">
                              {discount.toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs flex-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground truncate">
                          {lead.city.charAt(0).toUpperCase() + lead.city.slice(1)}, Idaho
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground capitalize truncate">{lead.propertyType.replace(/-/g, " ")}</span>
                      </div>
                      {measurementText && (
                        <div className="flex items-center gap-1.5">
                          <Ruler className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground truncate">{measurementText}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">{daysOld === 0 ? "Today" : `${daysOld}d ago`}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1 mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => setDetailViewLead(lead)}
                        data-testid={`button-details-${lead.id}`}
                      >
                        <Info className="mr-1.5 h-3.5 w-3.5" />
                        View Details
                      </Button>
                      <Button
                        onClick={() => handlePurchaseLead(lead)}
                        className="w-full"
                        size="sm"
                        data-testid={`button-purchase-${lead.id}`}
                      >
                        <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                        Buy - {formatCurrency(lead.currentLeadPrice)}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </TabsContent>

      {/* Watchlist Tab */}
      <TabsContent value="watchlist" className="space-y-4">
        {watchlistLoading ? (
          <Card>
            <CardContent className="py-8 text-center">Loading watchlist...</CardContent>
          </Card>
        ) : watchlistLeads.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium mb-2">Your watchlist is empty</p>
              <p className="text-sm mb-2">Save customers to your watchlist to get notified when prices drop.</p>
              <p className="text-xs text-muted-foreground/70">Click the eye icon on any customer card to add them to your watchlist.</p>
            </CardContent>
          </Card>
        ) : (
          watchlistLeads.map((lead) => {
            const daysOld = calculateDaysOld(lead.createdAt);
            const originalPrice = parseFloat(lead.baseLeadPrice || "0");
            const currentPrice = parseFloat(lead.currentLeadPrice || "0");
            const discount = originalPrice > 0 ? ((originalPrice - currentPrice) / originalPrice * 100) : 0;

            return (
              <Card id={`lead-${lead.id}`} key={lead.id} className="overflow-hidden hover-elevate border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-primary/5 via-background to-background">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <CardTitle className="text-lg">
                          {lead.serviceType.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </CardTitle>
                        <Badge variant="outline" className="border-yellow-400 text-yellow-700 dark:text-yellow-400">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400" />
                          Watching
                        </Badge>
                        {discount > 0 && (
                          <Badge variant="secondary" className="text-primary">
                            {discount.toFixed(0)}% OFF
                          </Badge>
                        )}
                        {daysOld === 0 && <Badge variant="default">NEW</Badge>}
                      </div>
                      <CardDescription>
                        {lead.city.charAt(0).toUpperCase() + lead.city.slice(1)} • {lead.frequency || "One-time"} • Posted {daysOld === 0 ? "today" : `${daysOld} days ago`}
                      </CardDescription>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => unwatchLeadMutation.mutate(lead.id)}
                        title="Remove from watchlist"
                        disabled={unwatchLeadMutation.isPending}
                      >
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </Button>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(lead.currentLeadPrice)}
                      </div>
                      {discount > 0 && (
                        <div className="text-sm text-muted-foreground line-through">
                          {formatCurrency(lead.baseLeadPrice)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium">Project Value</p>
                        <p className="text-muted-foreground">
                          {lead.finalQuote ? formatQuoteRangeWholeFromValue(lead.finalQuote, 0.15) : "Pending"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium">Property Type</p>
                        <p className="text-muted-foreground capitalize">{lead.propertyType.replace(/-/g, " ")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-muted-foreground">
                          {lead.address && lead.address !== "***" ? lead.address : `${lead.city.charAt(0).toUpperCase() + lead.city.slice(1)}, Idaho`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium">Posted</p>
                        <p className="text-muted-foreground">{formatDate(lead.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quote Breakdown Section */}
                  {lead.name === "***" && <QuoteBreakdownSection lead={lead} />}

                  {/* Lead Pricing Section */}
                  {lead.name === "***" && <LeadPricingSection lead={lead} />}

                  {/* What You'll Get Section */}
                  {lead.name === "***" && (
                    <div className="bg-primary/5 border border-primary/20 rounded-md p-3 text-sm">
                      <p className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        What You'll Get After Purchase:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs ml-1">
                        <li>Full customer contact information (name, phone, email, address)</li>
                        <li>All project details and scope (already visible above)</li>
                        <li>Customer notes and special instructions</li>
                        <li>Exclusive access - this customer is yours</li>
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={() => handlePurchaseLead(lead)}
                    disabled={purchaseLeadMutation.isPending}
                    className="w-full"
                    size="lg"
                    data-testid={`button-purchase-watchlist-${lead.id}`}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Buy This Customer - {formatCurrency(lead.currentLeadPrice)}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </TabsContent>
      </Tabs>

      {/* Legal Agreement Modal */}
      <Dialog open={showAgreementModal} onOpenChange={setShowAgreementModal}>
        <DialogContent className="max-w-2xl" data-testid="modal-legal-agreement">
          <DialogHeader>
            <DialogTitle>Lead Purchase Agreement</DialogTitle>
            <DialogDescription>
              Before purchasing leads, you must accept our terms and conditions.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto border rounded-md p-4 space-y-4 text-sm">
            <h3 className="font-semibold text-base">Lead Purchase Agreement</h3>
            <p className="text-muted-foreground">
              This Lead Purchase Agreement ("Agreement") is a legally binding contract entered into between Lawn Care Kuna LLC ("Company," "we," or "us") and you ("Subcontractor," "Contractor," or "you"). By accepting this Agreement, you acknowledge that you have read, understood, and agree to be bound by all terms and conditions set forth herein.
            </p>
            
            <h4 className="font-semibold mt-4">Key Points Summary:</h4>
            <ul className="list-disc list-inside space-y-2 mt-2 bg-muted/50 p-3 rounded-md">
              <li><strong>No Refunds:</strong> All lead purchases are final and non-refundable under any circumstances</li>
              <li><strong>Exclusive Access:</strong> Leads are sold on a first-come, first-served basis and are exclusive to the purchaser</li>
              <li><strong>No Guarantees:</strong> We do not guarantee that any lead will result in a closed deal or revenue</li>
              <li><strong>Professional Conduct:</strong> You must maintain professional standards when contacting leads</li>
              <li><strong>Confidentiality:</strong> Lead information is confidential and may not be shared with third parties</li>
            </ul>
            
            <h4 className="font-semibold mt-4">1. No-Refund Policy</h4>
            <p>
              ALL LEAD PURCHASES ARE FINAL AND NON-REFUNDABLE. Once you purchase a lead, you receive immediate access to the customer's contact information and project details. Due to the immediate delivery of this confidential information, we cannot and will not offer refunds, credits, or exchanges under any circumstances, including but not limited to: customer non-response, incorrect contact information, customer cancellation, project scope changes, or your inability to close the deal.
            </p>
            
            <h4 className="font-semibold mt-4">2. Lead Quality and Disclaimer of Warranties</h4>
            <p>
              While we strive to provide high-quality leads, THE COMPANY MAKES NO WARRANTIES, EXPRESS OR IMPLIED, REGARDING THE QUALITY, ACCURACY, OR CONVERSION RATE OF ANY LEAD. Leads are provided "as is" without any guarantee that the customer will respond, schedule service, or complete a transaction. You acknowledge that lead quality varies and that you assume all risk associated with lead purchases.
            </p>
            
            <h4 className="font-semibold mt-4">3. Pricing Structure</h4>
            <p>
              Lead prices are calculated at 10% of the quoted project value for one-time services, with a minimum price of $10. Prices may automatically reduce by 1.5% daily until reaching a minimum threshold of 20% of the base price. Pricing is subject to change at any time at the Company's sole discretion.
            </p>
            
            <h4 className="font-semibold mt-4">4. Usage Rights and Restrictions</h4>
            <p>
              You are granted a limited, non-exclusive, non-transferable license to contact the customer solely for the specific service(s) requested. You may NOT: (a) sell, transfer, assign, or share lead information with any third party; (b) use lead information for purposes other than providing the requested services; (c) contact leads for unrelated services or marketing without their express consent; (d) store lead information beyond what is necessary to complete the service.
            </p>
            
            <h4 className="font-semibold mt-4">5. Professional Conduct and Brand Standards</h4>
            <p>
              You agree to maintain the highest professional standards when contacting customers and representing the Lawn Care Kuna network. This includes: prompt response times (within 24-48 hours), professional communication, honest pricing, quality workmanship, and respectful customer interactions. Unprofessional conduct may result in suspension or termination of your account.
            </p>
            
            <h4 className="font-semibold mt-4">6. Limitation of Liability</h4>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE COMPANY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, REVENUE, OR BUSINESS OPPORTUNITIES, ARISING FROM YOUR USE OF THE LEAD DISTRIBUTION PLATFORM OR ANY LEADS PURCHASED. THE COMPANY'S TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SPECIFIC LEAD IN QUESTION.
            </p>
            
            <h4 className="font-semibold mt-4">7. Indemnification</h4>
            <p>
              You agree to indemnify, defend, and hold harmless Lawn Care Kuna LLC, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable attorney's fees) arising from: (a) your use of lead information; (b) your interactions with customers; (c) any services you provide to customers; (d) your violation of this Agreement; or (e) your violation of any applicable laws or regulations.
            </p>
            
            <h4 className="font-semibold mt-4">8. Confidentiality and Data Protection</h4>
            <p>
              All lead information is confidential and proprietary. You must protect lead data using reasonable security measures and comply with all applicable privacy laws. You may not disclose lead information to unauthorized parties and must delete lead data upon reasonable request from the Company or as required by law.
            </p>
            
            <h4 className="font-semibold mt-4">9. Termination</h4>
            <p>
              The Company reserves the right to suspend or terminate your access to the Lead Distribution Platform at any time, with or without cause, and without prior notice. Upon termination, you must immediately cease using any lead information and delete all stored lead data. No refunds will be provided for any previously purchased leads upon termination.
            </p>
            
            <h4 className="font-semibold mt-4">10. Governing Law and Dispute Resolution</h4>
            <p>
              This Agreement shall be governed by the laws of the State of Idaho, without regard to conflicts of law principles. Any disputes arising from this Agreement shall be resolved through binding arbitration in Ada County, Idaho, in accordance with the rules of the American Arbitration Association. You waive any right to participate in class action lawsuits against the Company.
            </p>
            
            <h4 className="font-semibold mt-4">11. Entire Agreement and Modifications</h4>
            <p>
              This Agreement constitutes the entire agreement between you and the Company regarding lead purchases. The Company reserves the right to modify this Agreement at any time. Continued use of the platform after modifications constitutes acceptance of the updated terms.
            </p>
            
            <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
              Agreement Version 1.0 | Effective Date: January 1, 2026 | Lawn Care Kuna LLC, Kuna, Idaho
            </p>
          </div>
          <div className="flex items-start gap-2 py-4">
            <Checkbox
              id="agreement-checkbox"
              checked={agreementChecked}
              onCheckedChange={(checked) => setAgreementChecked(checked as boolean)}
              data-testid="checkbox-accept-agreement"
            />
            <label htmlFor="agreement-checkbox" className="text-sm leading-tight cursor-pointer">
              I have read and agree to the Lead Purchase Agreement, including the no-refund policy.
            </label>
          </div>
          <div className="space-y-2 py-4">
            <Label htmlFor="signature-input">Type your full legal name as your electronic signature:</Label>
            <Input
              id="signature-input"
              placeholder="Enter your full name"
              value={signatureInput}
              onChange={(e) => setSignatureInput(e.target.value)}
              data-testid="input-signature"
              className="font-signature text-lg"
            />
            {signatureInput && (
              <p className="text-sm text-muted-foreground italic">
                Signed as: <span className="font-medium">{signatureInput}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAgreementModal(false)}
              data-testid="button-cancel-agreement"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAcceptAgreement}
              disabled={!agreementChecked || !signatureInput.trim()}
              data-testid="button-accept-agreement"
            >
              Accept Agreement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchase Confirmation Modal */}
      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent data-testid="modal-purchase-confirmation" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedLead?.name !== "***" ? "Lead Purchased - Contact Information" : "Confirm Purchase"}
            </DialogTitle>
            <DialogDescription>
              {selectedLead?.name !== "***" 
                ? "You now have full access to the customer's contact details"
                : `You're about to purchase this lead for ${selectedLead && formatCurrency(selectedLead.currentLeadPrice)}`
              }
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4 py-4">
              {selectedLead.name !== "***" ? (
                // Post-purchase: Show revealed contact info
                <>
                  <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 p-4 rounded-md">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-primary dark:text-primary font-medium">
                        Purchase successful! Contact the customer to schedule the service.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Customer Name</p>
                          <p className="font-medium" data-testid="text-customer-name">{selectedLead.name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="font-medium" data-testid="text-customer-phone">
                            <a href={`tel:${selectedLead.phone}`} className="text-primary hover:underline">
                              {selectedLead.phone}
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-medium" data-testid="text-customer-email">
                            <a href={`mailto:${selectedLead.email}`} className="text-primary hover:underline">
                              {selectedLead.email}
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Property Address</p>
                          <p className="font-medium" data-testid="text-customer-address">
                            {selectedLead.address && selectedLead.address !== "***" ? selectedLead.address : `${selectedLead.city}, Idaho`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Service Details</p>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Service:</span> {selectedLead.serviceType.replace(/-/g, " ")}</p>
                      <p>
                        <span className="text-muted-foreground">Quote Range:</span>{" "}
                        {selectedLead.finalQuote ? formatQuoteRangeWholeFromValue(selectedLead.finalQuote, 0.15) : "Pending"}
                      </p>
                      <p><span className="text-muted-foreground">Frequency:</span> {selectedLead.frequency || "One-time"}</p>
                      {selectedLead.message && (
                        <p><span className="text-muted-foreground">Customer Notes:</span> {selectedLead.message}</p>
                      )}
                    </div>
                  </div>
                </>
              ) : paymentStep === "payment" && paymentClientSecret ? (
                // Payment step: Show Stripe payment form
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm font-medium mb-2">Payment Details</p>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Service:</span> {selectedLead.serviceType.replace(/-/g, " ")}</p>
                      <p><span className="text-muted-foreground">Location:</span> {selectedLead.city}</p>
                      <p className="text-lg font-bold text-primary">
                        Total: {formatCurrency(selectedLead.currentLeadPrice)}
                      </p>
                    </div>
                  </div>
                  <StripePaymentForm
                    clientSecret={paymentClientSecret}
                    amount={paymentAmount}
                    onSuccess={handlePaymentSuccess}
                    onCancel={handlePaymentCancel}
                    isProcessing={purchaseLeadMutation.isPending}
                  />
                </div>
              ) : (
                // Pre-purchase: Show confirmation details
                <>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Service:</span> {selectedLead.serviceType.replace(/-/g, " ")}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Location:</span> {selectedLead.city}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Quote Range:</span>{" "}
                      {selectedLead.finalQuote ? formatQuoteRangeWholeFromValue(selectedLead.finalQuote, 0.15) : "Pending"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Lead Price:</span> {formatCurrency(selectedLead.currentLeadPrice)}
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded-md space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium">After purchase, you'll get:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Customer's full name and contact details</li>
                          <li>Phone number and email address</li>
                          <li>Complete property address</li>
                          <li>Customer's message and project details</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Reminder:</strong> All lead purchases are final and non-refundable. Please review the details carefully before confirming.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedLead?.name !== "***" ? (
              // Post-purchase: Show close button
              <Button
                onClick={handleClosePurchaseModal}
                data-testid="button-close-purchase"
              >
                Close
              </Button>
            ) : paymentStep === "payment" ? (
              // Payment step: Footer is handled by StripePaymentForm
              null
            ) : (
              // Confirmation step: Show proceed to payment button
              <>
                <Button
                  variant="outline"
                  onClick={handleClosePurchaseModal}
                  disabled={createPaymentIntentMutation.isPending}
                  data-testid="button-cancel-purchase"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedLead && createPaymentIntentMutation.mutate(selectedLead.id)}
                  disabled={createPaymentIntentMutation.isPending}
                  data-testid="button-proceed-to-payment"
                >
                  {createPaymentIntentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    `Proceed to Payment - ${selectedLead && formatCurrency(selectedLead.currentLeadPrice)}`
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!detailViewLead} onOpenChange={(open) => !open && setDetailViewLead(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-lead-details">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              {detailViewLead?.serviceType.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
              {detailViewLead && calculateDaysOld(detailViewLead.createdAt) === 0 && (
                <Badge variant="default">NEW</Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {detailViewLead?.city.charAt(0).toUpperCase()}{detailViewLead?.city.slice(1)} • {detailViewLead?.frequency || "One-time"} • Posted {detailViewLead && calculateDaysOld(detailViewLead.createdAt) === 0 ? "today" : `${detailViewLead && calculateDaysOld(detailViewLead.createdAt)} days ago`}
            </DialogDescription>
          </DialogHeader>
          {detailViewLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium">Project Value</p>
                    <p className="text-muted-foreground">
                      {detailViewLead.finalQuote ? formatQuoteRangeWholeFromValue(detailViewLead.finalQuote, 0.15) : "Pending"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium">Property Type</p>
                    <p className="text-muted-foreground capitalize">{detailViewLead.propertyType.replace(/-/g, " ")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">
                      {detailViewLead.city.charAt(0).toUpperCase() + detailViewLead.city.slice(1)}, Idaho
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium">Posted</p>
                    <p className="text-muted-foreground">{formatDate(detailViewLead.createdAt)}</p>
                  </div>
                </div>
              </div>

              {detailViewLead.message && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-1">Customer Notes:</p>
                  <p className="text-sm text-muted-foreground">{detailViewLead.message}</p>
                </div>
              )}

              {detailViewLead.name === "***" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-md border border-orange-200 dark:border-orange-800">
                  <Lock className="h-4 w-4 flex-shrink-0 text-orange-600" />
                  <div className="flex-1">
                    <p className="font-medium mb-1">Contact Info Hidden</p>
                    <p className="text-xs">
                      Customer contact info (name, email, phone, exact address) is hidden until purchase.
                    </p>
                  </div>
                </div>
              )}

              {/* Quote Breakdown Section */}
              {detailViewLead.name === "***" && <QuoteBreakdownSection lead={detailViewLead} />}

              {/* Lead Pricing Section */}
              {detailViewLead.name === "***" && <LeadPricingSection lead={detailViewLead} />}

              {/* What You'll Get Section */}
              {detailViewLead.name === "***" && (
                <div className="bg-primary/5 border border-primary/20 rounded-md p-3 text-sm">
                  <p className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    What You'll Get After Purchase:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs ml-1">
                    <li>Full customer contact information (name, phone, email, address)</li>
                    <li>All project details and scope (already visible above)</li>
                    <li>Customer notes and special instructions</li>
                    <li>Exclusive access - this customer is yours</li>
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Lead Price</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(detailViewLead.currentLeadPrice)}</p>
                </div>
                <Button
                  onClick={() => {
                    setDetailViewLead(null);
                    handlePurchaseLead(detailViewLead);
                  }}
                  size="lg"
                  data-testid="button-purchase-from-details"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Buy This Customer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Purchase Floating Bar */}
      {selectedLeadIds.size > 0 && (
        <div 
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-card border shadow-lg rounded-lg px-6 py-4 flex items-center gap-4 flex-wrap justify-center"
          data-testid="bulk-purchase-bar"
        >
          <div className="flex items-center gap-2 text-sm">
            <ShoppingCart className="h-4 w-4" />
            <span className="font-medium">{bulkTotal.count} leads selected</span>
          </div>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">Subtotal: {formatCurrency(bulkTotal.subtotal.toFixed(2))}</span>
            {bulkTotal.discount > 0 && (
              <>
                <Badge variant="secondary" className="text-primary">
                  {calculateBulkDiscount(bulkTotal.count).label}
                </Badge>
                <span className="text-primary">-{formatCurrency(bulkTotal.discount.toFixed(2))}</span>
              </>
            )}
            <span className="font-bold text-primary">Total: {formatCurrency(bulkTotal.total.toFixed(2))}</span>
          </div>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedLeadIds(new Set())}
              data-testid="button-clear-selection"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
            <Button
              size="sm"
              onClick={handleBulkPurchase}
              data-testid="button-bulk-purchase"
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              Purchase Selected
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Purchase Modal */}
      <Dialog open={showBulkPurchaseModal} onOpenChange={setShowBulkPurchaseModal}>
        <DialogContent data-testid="modal-bulk-purchase" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {bulkPaymentStep === "success" ? "Bulk Purchase Complete" : "Confirm Bulk Purchase"}
            </DialogTitle>
            <DialogDescription>
              {bulkPaymentStep === "success" 
                ? `You successfully purchased ${bulkTotal.count} leads.`
                : `You're about to purchase ${selectedLeadIds.size} leads for ${formatCurrency(bulkTotal.total.toFixed(2))}`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {bulkPaymentStep === "success" ? (
              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 p-4 rounded-md">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-primary dark:text-primary font-medium">
                      Your leads have been purchased! Contact information is now available in your purchased leads list.
                    </p>
                  </div>
                </div>
              </div>
            ) : bulkPaymentStep === "payment" && bulkPaymentClientSecret ? (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm font-medium mb-2">Payment Details</p>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Leads:</span> {selectedLeadIds.size}</p>
                    <p><span className="text-muted-foreground">Subtotal:</span> {formatCurrency(bulkTotal.subtotal.toFixed(2))}</p>
                    {bulkTotal.discount > 0 && (
                      <p className="text-primary"><span className="text-muted-foreground">Discount ({calculateBulkDiscount(bulkTotal.count).label}):</span> -{formatCurrency(bulkTotal.discount.toFixed(2))}</p>
                    )}
                    <p className="text-lg font-bold text-primary">
                      Total: {formatCurrency(bulkTotal.total.toFixed(2))}
                    </p>
                  </div>
                </div>
                <StripePaymentForm
                  clientSecret={bulkPaymentClientSecret}
                  amount={bulkPaymentAmount}
                  onSuccess={handleBulkPaymentSuccess}
                  onCancel={handleBulkPaymentCancel}
                  isProcessing={bulkPurchaseMutation.isPending}
                />
              </div>
            ) : (
              <>
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm font-medium mb-3">Selected Leads ({selectedLeadIds.size})</p>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {selectedLeads.map(lead => (
                      <div key={lead.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                        <span>{lead.serviceType.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())} - {lead.city}</span>
                        <span className="font-medium">{formatCurrency(lead.currentLeadPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(bulkTotal.subtotal.toFixed(2))}</span>
                  </div>
                  {bulkTotal.discount > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>Bulk Discount ({calculateBulkDiscount(bulkTotal.count).discountPercent}% off)</span>
                      <span>-{formatCurrency(bulkTotal.discount.toFixed(2))}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(bulkTotal.total.toFixed(2))}</span>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Reminder:</strong> All lead purchases are final and non-refundable. Please review the details carefully before confirming.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            {bulkPaymentStep === "success" ? (
              <Button onClick={handleCloseBulkPurchaseModal} data-testid="button-close-bulk-purchase">
                Close
              </Button>
            ) : bulkPaymentStep === "payment" ? (
              null
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleCloseBulkPurchaseModal}
                  disabled={createBulkPaymentIntentMutation.isPending}
                  data-testid="button-cancel-bulk-purchase"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createBulkPaymentIntentMutation.mutate(Array.from(selectedLeadIds))}
                  disabled={createBulkPaymentIntentMutation.isPending}
                  data-testid="button-proceed-bulk-payment"
                >
                  {createBulkPaymentIntentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    `Proceed to Payment - ${formatCurrency(bulkTotal.total.toFixed(2))}`
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
