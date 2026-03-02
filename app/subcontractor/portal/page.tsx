"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth, User } from "@/hooks/useAuth";
import { NotificationsBell } from "@/components/NotificationsBell";
import { StripePaymentForm, StripePaymentFormSkeleton, PaymentSuccess } from "@/components/StripePaymentForm";
import {
  Leaf, MapPin, Clock, DollarSign, Building, Search, Filter, X, ArrowUpDown, Eye, 
  EyeOff, ShoppingCart, History, CheckCircle2, Info, AlertTriangle, ChevronDown, 
  Receipt, Bookmark, BookmarkCheck, Bell, LogOut, Mail, Shield, Flame, RefreshCw,
  TrendingUp, HelpCircle, FileSignature, Users, TrendingDown, ShieldCheck, Percent
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface LineItem {
  serviceId?: string;
  service?: string;
  serviceName?: string;
  description?: string;
  price?: number;
  basePrice?: number;
  adjustedPrice?: number;
  calculationExplanation?: string;
  isRecurring?: boolean;
}

const RECURRING_ELIGIBLE_SERVICE_IDS = new Set<string>([
  "lawn-mowing",
  "lawn-maintenance",
  "hedge-trimming",
  "weed-control",
]);

function isServiceRecurring(serviceId: string, frequency: string | null | undefined): boolean {
  if (!frequency || frequency === "one-time") return false;
  return RECURRING_ELIGIBLE_SERVICE_IDS.has(serviceId);
}

function getSeasonMultiplier(frequency: string | null | undefined): { multiplier: number; label: string } | null {
  if (!frequency || frequency === "one-time") return null;
  switch (frequency) {
    case "weekly": return { multiplier: 30, label: "30 weeks" };
    case "bi-weekly": return { multiplier: 15, label: "15 visits" };
    case "monthly": return { multiplier: 7, label: "7 months" };
    default: return null;
  }
}

interface ServiceDataEntry {
  propertySize?: number;
  linearFeet?: number;
  zones?: number;
  treeCount?: number;
  quantity?: number;
  [key: string]: unknown;
}

interface Lead {
  id: string;
  quoteId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city: string;
  propertyType: string;
  serviceType: string;
  selectedServices?: string[] | null;
  frequency?: string | null;
  finalQuote?: string | null;
  lineItems?: LineItem[] | null;
  serviceData?: Record<string, ServiceDataEntry> | null;
  message?: string | null;
  baseLeadPrice?: string | null;
  currentLeadPrice?: string | null;
  status: string;
  createdAt: string;
  purchasedBy?: string | null;
  purchasedAt?: string | null;
}

const PRIORITY_SERVICES = [
  { slug: "lawn-mowing", name: "Lawn Mowing" },
  { slug: "lawn-care", name: "Lawn Care" },
  { slug: "fertilization", name: "Fertilization" },
  { slug: "aeration", name: "Aeration" },
  { slug: "weed-control", name: "Weed Control" },
  { slug: "tree-trimming", name: "Tree Trimming" },
  { slug: "hedge-trimming", name: "Hedge Trimming" },
  { slug: "landscaping", name: "Landscaping" },
  { slug: "mulching", name: "Mulching" },
  { slug: "seasonal-cleanup", name: "Seasonal Cleanup" },
  { slug: "christmas-lights", name: "Christmas Lights" },
  { slug: "irrigation-installation", name: "Irrigation Installation" },
  { slug: "sprinkler-blowout", name: "Sprinkler Blowout" },
  { slug: "fence-installation", name: "Fence Installation" },
  { slug: "patio-installation", name: "Patio Installation" },
  { slug: "pond-installation", name: "Pond Installation" },
];

const AGREEMENT_VERSION = "1.0";

function calculateQuoteRange(finalQuote: string | number, variance: number = 0.15) {
  const point = typeof finalQuote === 'string' ? parseFloat(finalQuote) : finalQuote;
  if (!point || isNaN(point)) return { min: 0, max: 0, point: 0 };
  const min = Math.round(point * (1 - variance));
  const max = Math.round(point * (1 + variance));
  return { min, max, point };
}

function formatQuoteRangeWholeFromValue(value: string | number, variance: number = 0.15): string {
  const { min, max } = calculateQuoteRange(value, variance);
  if (min === 0 && max === 0) return "Pending";
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
}

function getServiceName(serviceSlug: string): string {
  const service = PRIORITY_SERVICES.find(s => s.slug === serviceSlug);
  return service ? service.name : serviceSlug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

function QuoteBreakdownSection({ lead }: { lead: Lead }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const lineItems = lead.lineItems || [];
  const hasBreakdown = lineItems.length > 0;
  
  if (!hasBreakdown && !lead.finalQuote) {
    return null;
  }
  
  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return '$0';
    return `$${price.toLocaleString()}`;
  };

  const seasonInfo = getSeasonMultiplier(lead.frequency);
  const hasAnyRecurring = lineItems.some(item => {
    const sid = item.serviceId || item.service || "";
    return item.isRecurring || isServiceRecurring(sid, lead.frequency);
  });

  const recurringTotal = lineItems.reduce((sum, item) => {
    const sid = item.serviceId || item.service || "";
    const recurring = item.isRecurring ?? isServiceRecurring(sid, lead.frequency);
    return sum + (recurring ? (item.price || item.adjustedPrice || 0) : 0);
  }, 0);
  const oneTimeTotal = lineItems.reduce((sum, item) => {
    const sid = item.serviceId || item.service || "";
    const recurring = item.isRecurring ?? isServiceRecurring(sid, lead.frequency);
    return sum + (!recurring ? (item.price || item.adjustedPrice || 0) : 0);
  }, 0);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border-t pt-2 mt-1">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between p-0 h-auto font-medium text-xs hover:bg-transparent"
          >
            <span className="flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
              Project Details
            </span>
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="pt-2">
          {lineItems.length > 0 ? (
            <div className="space-y-1.5">
              {lineItems.map((item, index) => {
                const sid = item.serviceId || item.service || "";
                const serviceName = item.serviceName || item.service || 'Service';
                const price = item.price || item.adjustedPrice || 0;
                const recurring = item.isRecurring ?? isServiceRecurring(sid, lead.frequency);
                
                return (
                  <div key={index} className="bg-muted/50 rounded-md px-2 py-1.5">
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="font-medium text-xs">{serviceName}</span>
                        {lead.frequency && lead.frequency !== "one-time" && (
                          <Badge variant={recurring ? "default" : "secondary"} className="text-[9px] px-1 py-0">
                            {recurring ? `Recurring (${lead.frequency})` : "One-time"}
                          </Badge>
                        )}
                      </div>
                      <span className="font-semibold text-xs text-primary flex-shrink-0">{formatPrice(price)}</span>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
                    )}
                  </div>
                );
              })}
              
              {lead.finalQuote && (
                <>
                  <div className="flex justify-between items-center pt-1.5 border-t">
                    <span className="font-semibold text-xs">
                      {hasAnyRecurring ? "Per-Visit Estimate" : "Estimated Project Value"}
                    </span>
                    <span className="font-bold text-sm text-primary">
                      {formatQuoteRangeWholeFromValue(lead.finalQuote, 0.15)}
                    </span>
                  </div>
                  {hasAnyRecurring && seasonInfo && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Est. seasonal value ({seasonInfo.label})</span>
                      <span className="font-semibold text-primary">
                        {formatQuoteRangeWholeFromValue(
                          (recurringTotal > 0 ? recurringTotal * seasonInfo.multiplier : parseFloat(lead.finalQuote) * seasonInfo.multiplier) + oneTimeTotal,
                          0.15
                        )}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-xs">
                  {hasAnyRecurring ? "Per-Visit Estimate" : "Estimated Project Value"}
                </span>
                <span className="font-bold text-sm text-primary">
                  {lead.finalQuote ? formatQuoteRangeWholeFromValue(lead.finalQuote, 0.15) : "Contact for quote"}
                </span>
              </div>
              {lead.finalQuote && hasAnyRecurring && seasonInfo && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Est. seasonal value ({seasonInfo.label})</span>
                  <span className="font-semibold text-primary">
                    {formatQuoteRangeWholeFromValue(parseFloat(lead.finalQuote) * seasonInfo.multiplier, 0.15)}
                  </span>
                </div>
              )}
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function LeadPricingSection({ lead, discount = 0 }: { lead: Lead; discount?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentPrice = parseFloat(lead.currentLeadPrice || "0");
  const basePrice = parseFloat(lead.baseLeadPrice || "0");
  const hasDiscount = currentPrice < basePrice;
  const discountedPrice = discount > 0 ? currentPrice * (1 - discount / 100) : currentPrice;

  const lineItems = lead.lineItems || [];
  const isRecurringLead = lead.frequency && lead.frequency !== "one-time";
  const hasAnyRecurring = lineItems.some(item => {
    const sid = item.serviceId || item.service || "";
    return item.isRecurring || isServiceRecurring(sid, lead.frequency);
  });
  const hasAnyOneTime = lineItems.some(item => {
    const sid = item.serviceId || item.service || "";
    return !(item.isRecurring || isServiceRecurring(sid, lead.frequency));
  });
  const isMixed = hasAnyRecurring && hasAnyOneTime;
  const seasonInfo = getSeasonMultiplier(lead.frequency);
  
  let pricingExplanation = "";
  if (isMixed) {
    pricingExplanation = "This lead includes both recurring and one-time services. Recurring services are priced at a competitive fixed rate based on the total seasonal contract value. One-time services are priced at approximately 10% of the estimated service price.";
  } else if (hasAnyRecurring && isRecurringLead) {
    pricingExplanation = "For recurring services, lead prices are based on a competitive fixed rate that reflects the total seasonal contract value, not just a single visit.";
  } else {
    pricingExplanation = "Lead prices are calculated as approximately 10% of the estimated project value.";
  }
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border-t pt-2 mt-1">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between p-0 h-auto font-medium text-xs hover:bg-transparent"
          >
            <span className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
              Lead Pricing Explanation
            </span>
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="pt-2 space-y-2">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>How Lead Pricing Works</AlertTitle>
            <AlertDescription className="text-xs mt-2">
              {pricingExplanation}
              {hasDiscount && " This lead has been discounted because it has been available for a while."}{" "}
              {discount > 0 && ` Your bulk discount of ${discount}% has been applied.`}
            </AlertDescription>
          </Alert>

          {hasAnyRecurring && seasonInfo && lead.finalQuote && (() => {
            const items = lead.lineItems || [];
            const recTotal = items.reduce((s, item) => {
              const sid = item.serviceId || item.service || "";
              const rec = item.isRecurring ?? isServiceRecurring(sid, lead.frequency);
              return s + (rec ? (item.price || item.adjustedPrice || 0) : 0);
            }, 0);
            const otTotal = items.reduce((s, item) => {
              const sid = item.serviceId || item.service || "";
              const rec = item.isRecurring ?? isServiceRecurring(sid, lead.frequency);
              return s + (!rec ? (item.price || item.adjustedPrice || 0) : 0);
            }, 0);
            const seasonalValue = (recTotal > 0 ? recTotal * seasonInfo.multiplier : parseFloat(lead.finalQuote) * seasonInfo.multiplier) + otTotal;
            return (
              <div className="bg-primary/5 rounded-md px-2 py-1.5 space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Per-visit estimate</span>
                  <span>{formatQuoteRangeWholeFromValue(lead.finalQuote, 0.15)}</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span>Est. seasonal value ({seasonInfo.label})</span>
                  <span className="text-primary">{formatQuoteRangeWholeFromValue(seasonalValue, 0.15)}</span>
                </div>
              </div>
            );
          })()}
          
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base lead price</span>
              <span>${basePrice.toFixed(2)}</span>
            </div>
            {hasDiscount && (
              <div className="flex justify-between text-primary">
                <span>Time-based discount</span>
                <span>-${(basePrice - currentPrice).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium">
              <span>Current price</span>
              <span>${currentPrice.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <>
                <div className="flex justify-between text-primary">
                  <span>Bulk discount ({discount}%)</span>
                  <span>-${(currentPrice - discountedPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Your price</span>
                  <span className="text-primary">${discountedPrice.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function SubcontractorPortalContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadIdParam = searchParams.get("leadId");
  const queryClient = useQueryClient();
  
  const { user, isAuthenticated, isLoading: authLoading, isSubcontractor, refetch: refetchUser } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState<"available" | "watchlist">("available");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState<string>("all");
  const [filterServiceType, setFilterServiceType] = useState<string>("all");
  const [filterPriceMax, setFilterPriceMax] = useState<string>("");
  const [filterQuoteMin, setFilterQuoteMin] = useState<string>("");
  const [filterPropertyType, setFilterPropertyType] = useState<string>("all");
  const [filterFrequency, setFilterFrequency] = useState<string>("all");
  const [filterAge, setFilterAge] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "price" | "quote">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  
  // Agreement state
  const [showAgreement, setShowAgreement] = useState(false);
  const [agreementSignature, setAgreementSignature] = useState("");
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  
  // Purchase state
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [singlePurchaseLead, setSinglePurchaseLead] = useState<Lead | null>(null);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [pendingPurchaseLeadIds, setPendingPurchaseLeadIds] = useState<string[]>([]);
  
  // Notification preferences
  const [showNotificationPrefs, setShowNotificationPrefs] = useState(false);
  const [notifyNewLeads, setNotifyNewLeads] = useState(true);
  const [notifyPriceDrops, setNotifyPriceDrops] = useState(true);

  // Route guard
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/subcontractor");
      return;
    }
    if (!isSubcontractor && user?.role !== "admin") {
      router.push("/admin/dashboard");
      return;
    }
    
    // Check if user needs to accept agreement
    if (user && !user.agreementAccepted) {
      setShowAgreement(true);
    }
  }, [authLoading, isAuthenticated, isSubcontractor, router, user]);

  // Fetch available leads
  const { data: leads = [], isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads", "available"],
    queryFn: async () => {
      const res = await fetch("/api/leads?status=available");
      if (!res.ok) throw new Error("Failed to fetch leads");
      return res.json();
    },
    enabled: isAuthenticated && (isSubcontractor || user?.role === "admin"),
  });

  // Fetch watchlist
  const { data: watchlist = [], isLoading: watchlistLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads/watchlist"],
    queryFn: async () => {
      const res = await fetch("/api/leads/watchlist");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated && (isSubcontractor || user?.role === "admin"),
  });

  const { data: myPurchases = [] } = useQuery<Lead[]>({
    queryKey: ["/api/leads/purchases"],
    queryFn: async () => {
      const res = await fetch("/api/leads/purchases");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated && (isSubcontractor || user?.role === "admin"),
  });

  const watchedLeadIds = useMemo(() => {
    const ids = new Set<string>();
    watchlist.forEach(l => ids.add(l.id));
    if (user?.watchedLeads) {
      user.watchedLeads.forEach((id: string) => ids.add(id));
    }
    return ids;
  }, [watchlist, user?.watchedLeads]);

  // Watch/unwatch mutations
  const watchLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await fetch(`/api/leads/${leadId}/watch`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to watch lead");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads/watchlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Lead Added to Watchlist", description: "You'll be notified of price changes." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const unwatchLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await fetch(`/api/leads/${leadId}/unwatch`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to unwatch lead");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads/watchlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Lead Removed from Watchlist" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Accept agreement mutation
  const acceptAgreementMutation = useMutation({
    mutationFn: async (signature: string) => {
      const res = await fetch("/api/user/accept-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          signature,
          version: AGREEMENT_VERSION,
        }),
      });
      if (!res.ok) throw new Error("Failed to accept agreement");
      return res.json();
    },
    onSuccess: () => {
      refetchUser();
      setShowAgreement(false);
      toast({ title: "Agreement Accepted", description: "You can now purchase leads." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Create payment intent mutation
  const createPaymentIntentMutation = useMutation({
    mutationFn: async ({ leadId }: { leadId: string }) => {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create payment intent");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setPaymentClientSecret(data.clientSecret);
      setPaymentAmount(data.amount);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Create bulk payment intent mutation
  const createBulkPaymentIntentMutation = useMutation({
    mutationFn: async (leadIds: string[]) => {
      const res = await fetch("/api/create-bulk-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create payment intent");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setPaymentClientSecret(data.clientSecret);
      setPaymentAmount(data.amount);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Purchase lead mutation
  const purchaseLeadMutation = useMutation({
    mutationFn: async ({ leadId, paymentIntentId }: { leadId: string; paymentIntentId?: string }) => {
      const res = await fetch(`/api/leads/${leadId}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId }),
      });
      if (!res.ok) throw new Error("Failed to purchase lead");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/watchlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/purchases"] });
      setPaymentSuccess(true);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Bulk purchase mutation
  const bulkPurchaseMutation = useMutation({
    mutationFn: async ({ leadIds, paymentIntentId }: { leadIds: string[]; paymentIntentId?: string }) => {
      const res = await fetch("/api/leads/bulk-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds, paymentIntentId }),
      });
      if (!res.ok) throw new Error("Failed to purchase leads");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/watchlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/purchases"] });
      setSelectedLeadIds([]);
      setPaymentSuccess(true);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update notification preferences
  const updateNotificationPrefsMutation = useMutation({
    mutationFn: async (prefs: { notifyNewLeads: boolean; notifyPriceDrops: boolean }) => {
      const res = await fetch("/api/user/notification-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (!res.ok) throw new Error("Failed to update preferences");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Preferences Updated" });
      setShowNotificationPrefs(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Filter leads
  const filteredLeads = useMemo(() => {
    let filtered = [...leads].filter(l => l.status === "available");
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(lead => 
        lead.city?.toLowerCase().includes(query) ||
        lead.serviceType?.toLowerCase().includes(query) ||
        lead.propertyType?.toLowerCase().includes(query)
      );
    }
    
    if (filterCity !== "all") {
      filtered = filtered.filter(l => l.city.toLowerCase() === filterCity.toLowerCase());
    }
    
    if (filterServiceType !== "all") {
      filtered = filtered.filter(l => l.serviceType === filterServiceType);
    }
    
    if (filterPriceMax) {
      const max = parseFloat(filterPriceMax);
      if (!isNaN(max)) {
        filtered = filtered.filter(l => parseFloat(l.currentLeadPrice || "0") <= max);
      }
    }
    
    if (filterQuoteMin) {
      const min = parseFloat(filterQuoteMin);
      if (!isNaN(min)) {
        filtered = filtered.filter(l => {
          if (!l.finalQuote) return false;
          const { min: quoteMin } = calculateQuoteRange(l.finalQuote, 0.15);
          return quoteMin >= min;
        });
      }
    }
    
    if (filterPropertyType !== "all") {
      filtered = filtered.filter(l => l.propertyType === filterPropertyType);
    }
    
    if (filterFrequency !== "all") {
      filtered = filtered.filter(l => (l.frequency || "one-time") === filterFrequency);
    }
    
    if (filterAge !== "all") {
      const now = new Date();
      filtered = filtered.filter(l => {
        const created = new Date(l.createdAt);
        const hours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
        switch (filterAge) {
          case "new": return hours < 24;
          case "24h": return hours >= 24 && hours < 48;
          case "48h+": return hours >= 48;
          default: return true;
        }
      });
    }
    
    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "price":
          comparison = parseFloat(a.currentLeadPrice || "0") - parseFloat(b.currentLeadPrice || "0");
          break;
        case "quote":
          const pointA = a.finalQuote ? calculateQuoteRange(a.finalQuote, 0.15).point : 0;
          const pointB = b.finalQuote ? calculateQuoteRange(b.finalQuote, 0.15).point : 0;
          comparison = pointA - pointB;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
    
    return filtered;
  }, [leads, searchQuery, filterCity, filterServiceType, filterPriceMax, filterQuoteMin, filterPropertyType, filterFrequency, filterAge, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchQuery("");
    setFilterCity("all");
    setFilterServiceType("all");
    setFilterPriceMax("");
    setFilterQuoteMin("");
    setFilterPropertyType("all");
    setFilterFrequency("all");
    setFilterAge("all");
    setSortBy("date");
    setSortOrder("desc");
  };

  const hasActiveFilters = searchQuery || filterCity !== "all" || filterServiceType !== "all" || 
    filterPriceMax || filterQuoteMin || filterPropertyType !== "all" || filterFrequency !== "all" || 
    filterAge !== "all" || sortBy !== "date" || sortOrder !== "desc";

  // Calculate bulk discount
  const getBulkDiscount = (count: number) => {
    if (count >= 10) return 20;
    if (count >= 5) return 10;
    if (count >= 3) return 5;
    return 0;
  };

  const selectedLeadsTotal = useMemo(() => {
    const selectedLeads = leads.filter(l => selectedLeadIds.includes(l.id));
    const subtotal = selectedLeads.reduce((sum, l) => sum + parseFloat(l.currentLeadPrice || "0"), 0);
    const discount = getBulkDiscount(selectedLeads.length);
    const discountAmount = subtotal * (discount / 100);
    return { subtotal, discount, discountAmount, total: subtotal - discountAmount, count: selectedLeads.length };
  }, [leads, selectedLeadIds]);

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeadIds(prev => 
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    );
  };

  const handleSinglePurchase = (lead: Lead) => {
    if (!user?.agreementAccepted) {
      setShowAgreement(true);
      return;
    }
    setSinglePurchaseLead(lead);
    setPendingPurchaseLeadIds([lead.id]);
    setPaymentClientSecret(null);
    setPaymentSuccess(false);
    setPurchaseDialogOpen(true);
    createPaymentIntentMutation.mutate({ leadId: lead.id });
  };

  const handleBulkPurchase = () => {
    if (!user?.agreementAccepted) {
      setShowAgreement(true);
      return;
    }
    if (selectedLeadIds.length === 0) return;
    setSinglePurchaseLead(null);
    setPendingPurchaseLeadIds(selectedLeadIds);
    setPaymentClientSecret(null);
    setPaymentSuccess(false);
    setPurchaseDialogOpen(true);
    createBulkPaymentIntentMutation.mutate(selectedLeadIds);
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    if (singlePurchaseLead) {
      purchaseLeadMutation.mutate({ leadId: singlePurchaseLead.id, paymentIntentId });
    } else {
      bulkPurchaseMutation.mutate({ leadIds: pendingPurchaseLeadIds, paymentIntentId });
    }
  };

  const handlePaymentCancel = () => {
    setPurchaseDialogOpen(false);
    setPaymentClientSecret(null);
    setSinglePurchaseLead(null);
    setPendingPurchaseLeadIds([]);
  };

  const handlePaymentComplete = () => {
    setPurchaseDialogOpen(false);
    setPaymentClientSecret(null);
    setPaymentSuccess(false);
    setSinglePurchaseLead(null);
    setPendingPurchaseLeadIds([]);
    router.push("/subcontractor/purchases");
  };

  const handleAcceptAgreement = () => {
    if (!agreementSignature.trim()) {
      toast({ title: "Signature Required", description: "Please type your full name as your electronic signature.", variant: "destructive" });
      return;
    }
    if (!agreementAccepted) {
      toast({ title: "Agreement Required", description: "Please check the box to accept the agreement.", variant: "destructive" });
      return;
    }
    acceptAgreementMutation.mutate(agreementSignature);
  };

  const formatCurrency = (amount: string | null | undefined) => {
    if (!amount) return "$0.00";
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const formatLeadAge = (date: Date | string | null) => {
    if (!date) return "N/A";
    const now = new Date();
    const created = new Date(date);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const LeadCard = ({ lead, isWatchlist = false }: { lead: Lead; isWatchlist?: boolean }) => {
    const isWatched = watchedLeadIds.has(lead.id);
    const isSelected = selectedLeadIds.includes(lead.id);
    const discount = getBulkDiscount(selectedLeadIds.length);
    const currentPrice = parseFloat(lead.currentLeadPrice || "0");
    const basePrice = parseFloat(lead.baseLeadPrice || "0");
    const hasTimeDiscount = currentPrice < basePrice;
    const [expanded, setExpanded] = useState(false);

    return (
      <Card className={`overflow-hidden transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`} id={`lead-${lead.id}`}>
        <CardHeader className="pb-1.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleLeadSelection(lead.id)}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <CardTitle className="text-sm md:text-base leading-tight">
                    {getServiceName(lead.serviceType)}
                  </CardTitle>
                  {hasTimeDiscount && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-primary border-primary">
                      Price Reduced
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-[11px] mt-0.5 flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5" />
                  {lead.city} - {lead.propertyType.replace(/-/g, " ")}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0"
              onClick={() => isWatched ? unwatchLeadMutation.mutate(lead.id) : watchLeadMutation.mutate(lead.id)}
              title={isWatched ? "Remove from watchlist" : "Add to watchlist"}
            >
              {isWatched ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="font-medium leading-tight">
                  {lead.finalQuote ? formatQuoteRangeWholeFromValue(lead.finalQuote, 0.15) : "Contact for quote"}
                </p>
                <p className="text-muted-foreground text-[10px] leading-tight">Est. value</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="font-medium leading-tight">
                  {formatLeadAge(lead.createdAt)}
                </p>
                <p className="text-muted-foreground text-[10px] leading-tight">{lead.frequency || "One-time"} service</p>
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center gap-1 text-xs text-muted-foreground"
              onClick={() => setExpanded(!expanded)}
              data-testid={`button-toggle-lead-details-${lead.id}`}
            >
              {expanded ? "Hide details" : "Show details"}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          <div className={`${expanded ? 'block' : 'hidden'} md:block space-y-2`}>
            {lead.selectedServices && lead.selectedServices.length > 0 && (
              <div className="border-t pt-2">
                <p className="text-xs font-medium mb-1 text-muted-foreground">Services Requested</p>
                <div className="flex flex-wrap gap-1">
                  {lead.selectedServices.map((serviceId, index) => (
                    <Badge key={index} variant="outline" className="text-[11px] px-1.5 py-0">
                      {getServiceName(serviceId)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground border-t pt-2">
              <Eye className="h-3 w-3" />
              <span className="italic">Contact info revealed after purchase</span>
            </div>

            <QuoteBreakdownSection lead={lead} />
            <LeadPricingSection lead={lead} discount={isSelected ? discount : 0} />
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              <p className="text-lg md:text-xl font-bold text-primary">{formatCurrency(lead.currentLeadPrice)}</p>
              {hasTimeDiscount && (
                <p className="text-xs text-muted-foreground line-through">{formatCurrency(lead.baseLeadPrice)}</p>
              )}
            </div>
            <Button size="sm" onClick={() => handleSinglePurchase(lead)}>
              <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
              Purchase Lead
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (authLoading || (!user && isAuthenticated)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white dark:from-primary/10 dark:to-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Leaf className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white dark:from-primary/10 dark:to-background" data-testid="page-subcontractor-portal">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-primary">Subcontractor Portal</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {user?.firstName || user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <NotificationsBell />
              <Button variant="ghost" size="icon" onClick={() => setShowNotificationPrefs(true)} title="Notification Settings">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/subcontractor/purchases")}>
                <History className="h-4 w-4 mr-0 md:mr-2" />
                <span className="hidden md:inline">My Purchases</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-0 md:mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-4 md:py-8 px-4">
        {/* How It Works Guide */}
        <Collapsible className="mb-4 md:mb-6">
          <Card>
            <CollapsibleTrigger asChild>
              <button
                className="group w-full flex items-center justify-between p-4 md:p-6 text-left hover-elevate rounded-md"
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
                      Before purchasing any leads, you will need to sign a short agreement by typing your name. This is a one-time step and only takes a moment. Once that is complete, you will have full access to browse and purchase leads.
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
                      Lead pricing depends on the type of service. For one-time services (like sprinkler blowouts or cleanups), the lead price is approximately 10% of the estimated project value. For recurring services (lawn mowing, lawn maintenance, hedge trimming, and weed control), leads are priced at a competitive fixed rate that reflects the total seasonal contract value, not just a single visit. Quotes with multiple services will have each service priced individually based on its type. The minimum lead price is $15.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      If a lead goes unclaimed, the price drops by about 1.5% each day. The price will never fall below 20% of its original value. So if you are patient, you may be able to pick up a great lead at a lower cost.
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

        {/* Agreement Status */}
        {user && !user.agreementAccepted && (
          <Alert className="mb-6 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle>Agreement Required</AlertTitle>
            <AlertDescription>
              You must accept the subcontractor agreement before purchasing leads.{" "}
              <Button variant="ghost" className="p-0 h-auto underline" onClick={() => setShowAgreement(true)}>
                Review and Accept Agreement
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">
          <Card>
            <CardHeader className="p-3 md:p-4 pb-1 md:pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Available Leads
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="text-xl md:text-3xl font-bold" data-testid="text-stat-available">{filteredLeads.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 md:p-4 pb-1 md:pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Bookmark className="h-4 w-4" /> Watchlist
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="text-xl md:text-3xl font-bold" data-testid="text-stat-watchlist">{watchlist.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 md:p-4 pb-1 md:pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> In Cart
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="text-xl md:text-3xl font-bold" data-testid="text-stat-cart">{selectedLeadIds.length}</div>
              {selectedLeadsTotal.discount > 0 && (
                <p className="text-sm text-primary">{selectedLeadsTotal.discount}% bulk discount!</p>
              )}
            </CardContent>
          </Card>
          <Card className="hover-elevate cursor-pointer" onClick={() => router.push("/subcontractor/purchases")} data-testid="card-stat-purchases">
            <CardHeader className="p-3 md:p-4 pb-1 md:pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Receipt className="h-4 w-4" /> My Purchases
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="text-xl md:text-3xl font-bold" data-testid="text-stat-purchases">{myPurchases.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Purchase Bar */}
        {selectedLeadIds.length > 0 && (
          <Card className="mb-4 md:mb-6 border-primary bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="font-medium">
                    {selectedLeadsTotal.count} lead{selectedLeadsTotal.count !== 1 ? 's' : ''} selected
                  </p>
                  <div className="text-sm text-muted-foreground space-x-2">
                    <span>Subtotal: ${selectedLeadsTotal.subtotal.toFixed(2)}</span>
                    {selectedLeadsTotal.discount > 0 && (
                      <>
                        <span className="text-primary">
                          -{selectedLeadsTotal.discount}% (${selectedLeadsTotal.discountAmount.toFixed(2)})
                        </span>
                        <span className="font-medium">= ${selectedLeadsTotal.total.toFixed(2)}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Buy 3+ for 5% off • 5+ for 10% off • 10+ for 20% off
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedLeadIds([])}>
                    Clear Selection
                  </Button>
                  <Button onClick={handleBulkPurchase}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Purchase {selectedLeadsTotal.count} Lead{selectedLeadsTotal.count !== 1 ? 's' : ''}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="mb-4 md:mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filters
              </CardTitle>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-4 w-4 mr-1" />
                  {showFilters ? "Hide" : "Show"} Filters
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by city, service type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={filterAge === "new" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilterAge(filterAge === "new" ? "all" : "new")}
              >
                <Flame className="w-4 h-4" /> New Today
              </Button>
              <Button 
                variant={filterFrequency === "recurring" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilterFrequency(filterFrequency === "recurring" ? "all" : "recurring")}
              >
                <RefreshCw className="w-4 h-4" /> Recurring
              </Button>
              <Button 
                variant={sortBy === "price" && sortOrder === "asc" ? "default" : "outline"} 
                size="sm"
                onClick={() => { setSortBy("price"); setSortOrder("asc"); }}
              >
                <DollarSign className="w-4 h-4" /> Lowest Price
              </Button>
              <Button 
                variant={sortBy === "quote" && sortOrder === "desc" ? "default" : "outline"} 
                size="sm"
                onClick={() => { setSortBy("quote"); setSortOrder("desc"); }}
              >
                <TrendingUp className="w-4 h-4" /> Highest Value
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <Label className="mb-2 block">City</Label>
                  <Select value={filterCity} onValueChange={setFilterCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {Array.from(new Set(leads.map(l => l.city))).sort().map(city => (
                        <SelectItem key={city} value={city.toLowerCase()}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Service Type</Label>
                  <Select value={filterServiceType} onValueChange={setFilterServiceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Services" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      {Array.from(new Set(leads.map(l => l.serviceType))).map(service => (
                        <SelectItem key={service} value={service}>{getServiceName(service)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Property Type</Label>
                  <Select value={filterPropertyType} onValueChange={setFilterPropertyType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Properties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Frequency</Label>
                  <Select value={filterFrequency} onValueChange={setFilterFrequency}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Frequencies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Frequencies</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                      <SelectItem value="recurring">Recurring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Lead Age</Label>
                  <Select value={filterAge} onValueChange={setFilterAge}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Ages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ages</SelectItem>
                      <SelectItem value="new">New (&lt;24h)</SelectItem>
                      <SelectItem value="24h">24-48 Hours</SelectItem>
                      <SelectItem value="48h+">48+ Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Max Lead Price</Label>
                  <Input
                    type="number"
                    placeholder="$ Max"
                    value={filterPriceMax}
                    onChange={(e) => setFilterPriceMax(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Min Project Value</Label>
                  <Input
                    type="number"
                    placeholder="$ Min"
                    value={filterQuoteMin}
                    onChange={(e) => setFilterQuoteMin(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Sort By</Label>
                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="price">Lead Price</SelectItem>
                        <SelectItem value="quote">Project Value</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-4">
          <TabsList>
            <TabsTrigger value="available">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Available ({filteredLeads.length})
            </TabsTrigger>
            <TabsTrigger value="watchlist">
              <Bookmark className="h-4 w-4 mr-2" />
              Watchlist ({watchlist.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            {leadsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading leads...</div>
            ) : filteredLeads.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  {hasActiveFilters ? "No leads match your filters" : "No leads available right now. Check back soon!"}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredLeads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="watchlist" className="space-y-4">
            {watchlistLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading watchlist...</div>
            ) : watchlist.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Your watchlist is empty.</p>
                  <p className="text-sm">Click the bookmark icon on leads to add them here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {watchlist.map(lead => <LeadCard key={lead.id} lead={lead} isWatchlist />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Agreement Dialog */}
      <Dialog open={showAgreement} onOpenChange={setShowAgreement}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Subcontractor Agreement
            </DialogTitle>
            <DialogDescription>
              Please review and accept the subcontractor agreement to purchase leads.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-md p-4 max-h-64 overflow-y-auto text-sm space-y-3">
              <h4 className="font-semibold">SUBCONTRACTOR LEAD PURCHASE AGREEMENT</h4>
              <p>Version {AGREEMENT_VERSION}</p>
              
              <p>By accepting this agreement, you agree to the following terms:</p>
              
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <strong>Lead Purchase:</strong> When you purchase a lead, you receive the contact information 
                  and project details for that customer. The lead is exclusively yours for 30 days.
                </li>
                <li>
                  <strong>No Refunds:</strong> Lead purchases are non-refundable. However, if contact information 
                  is invalid, you may submit a claim for review within 48 hours of purchase.
                </li>
                <li>
                  <strong>Professional Conduct:</strong> You agree to conduct yourself professionally when 
                  contacting customers. You represent your own business, not Lawn Care Kuna.
                </li>
                <li>
                  <strong>No Resale:</strong> You may not resell, share, or transfer leads to any third party.
                </li>
                <li>
                  <strong>Insurance & Licensing:</strong> You warrant that you maintain appropriate business 
                  insurance and any required licenses for lawn care services in Idaho.
                </li>
                <li>
                  <strong>Privacy:</strong> Customer information is confidential. You agree not to use contact 
                  information for any purpose other than providing the requested services.
                </li>
                <li>
                  <strong>Pricing:</strong> Lead prices are based on estimated project value and may decrease 
                  over time. Bulk discounts are available (5% for 3+, 10% for 5+, 20% for 10+ leads).
                </li>
              </ol>

              <p className="pt-4">
                This agreement is effective as of the date of acceptance and remains in effect until terminated 
                by either party with 30 days written notice.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="agreement"
                  checked={agreementAccepted}
                  onCheckedChange={(checked) => setAgreementAccepted(!!checked)}
                />
                <Label htmlFor="agreement" className="text-sm">
                  I have read and agree to the Subcontractor Lead Purchase Agreement
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signature">Electronic Signature (type your full name)</Label>
                <Input
                  id="signature"
                  placeholder="Your full legal name"
                  value={agreementSignature}
                  onChange={(e) => setAgreementSignature(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAgreement(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAcceptAgreement} 
              disabled={!agreementAccepted || !agreementSignature.trim() || acceptAgreementMutation.isPending}
            >
              {acceptAgreementMutation.isPending ? "Processing..." : "Accept Agreement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialogOpen} onOpenChange={(open) => !open && handlePaymentCancel()}>
        <DialogContent className="max-w-md">
          {paymentSuccess ? (
            <PaymentSuccess 
              message={`You've successfully purchased ${pendingPurchaseLeadIds.length} lead${pendingPurchaseLeadIds.length !== 1 ? 's' : ''}! View your purchase history to see the contact information.`}
              onContinue={handlePaymentComplete}
            />
          ) : paymentClientSecret ? (
            <StripePaymentForm
              clientSecret={paymentClientSecret}
              amount={paymentAmount}
              description={singlePurchaseLead 
                ? `Lead: ${getServiceName(singlePurchaseLead.serviceType)} in ${singlePurchaseLead.city}`
                : `${pendingPurchaseLeadIds.length} Leads (${selectedLeadsTotal.discount}% bulk discount)`
              }
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          ) : (
            <StripePaymentFormSkeleton />
          )}
        </DialogContent>
      </Dialog>

      {/* Notification Preferences Dialog */}
      <Dialog open={showNotificationPrefs} onOpenChange={setShowNotificationPrefs}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </DialogTitle>
            <DialogDescription>
              Choose which email notifications you&apos;d like to receive
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Leads</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new leads match your service area
                </p>
              </div>
              <Switch checked={notifyNewLeads} onCheckedChange={setNotifyNewLeads} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Price Drops</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when leads on your watchlist drop in price
                </p>
              </div>
              <Switch checked={notifyPriceDrops} onCheckedChange={setNotifyPriceDrops} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotificationPrefs(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => updateNotificationPrefsMutation.mutate({ notifyNewLeads, notifyPriceDrops })}
              disabled={updateNotificationPrefsMutation.isPending}
            >
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SubcontractorPortalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Leaf className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading portal...</p>
        </div>
      </div>
    }>
      <SubcontractorPortalContent />
    </Suspense>
  );
}
