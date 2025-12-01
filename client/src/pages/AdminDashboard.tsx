import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2, XCircle, Clock, DollarSign, MapPin, Phone, Mail, Building, ChevronDown, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Lead } from "@shared/schema";
import { useState } from "react";

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

function formatMeasurement(serviceId: string, data: ServiceDataEntry | undefined): string {
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
}

function QuoteBreakdownSection({ lead }: { lead: Lead }) {
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
      <div className="border-t pt-4">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between p-0 h-auto font-medium text-sm hover:bg-transparent"
            data-testid={`button-toggle-breakdown-${lead.id}`}
          >
            <span className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              Quote Breakdown
            </span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="pt-3" data-testid={`section-breakdown-${lead.id}`}>
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
                    data-testid={`lineitem-${lead.id}-${index}`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="font-medium text-sm" data-testid={`text-service-name-${lead.id}-${index}`}>
                        {serviceName}
                      </span>
                      <span className="font-semibold text-sm text-primary" data-testid={`text-service-price-${lead.id}-${index}`}>
                        {formatPrice(price)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground" data-testid={`text-service-desc-${lead.id}-${index}`}>
                        {item.description}
                      </p>
                    )}
                    {measurement && (
                      <p className="text-xs text-muted-foreground mt-1" data-testid={`text-service-measurement-${lead.id}-${index}`}>
                        Measurement: {measurement}
                      </p>
                    )}
                    {item.calculationExplanation && (
                      <p className="text-xs text-muted-foreground/70 italic mt-2 pl-2 border-l-2 border-muted" data-testid={`text-service-explanation-${lead.id}-${index}`}>
                        {item.calculationExplanation}
                      </p>
                    )}
                  </div>
                );
              })}
              
              {lead.finalQuote && (
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold text-sm">Total Quote</span>
                  <span className="font-bold text-lg text-primary" data-testid={`text-total-quote-${lead.id}`}>
                    ${parseFloat(lead.finalQuote).toLocaleString()}
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
                      <span className="font-medium">{svcId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <span className="text-muted-foreground ml-2">{formatMeasurement(svcId, data)}</span>
                    </div>
                  ))}
                </div>
              )}
              {lead.finalQuote && (
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold text-sm">Total Quote</span>
                  <span className="font-bold text-lg text-primary" data-testid={`text-total-quote-${lead.id}`}>
                    ${parseFloat(lead.finalQuote).toLocaleString()}
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

export default function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    enabled: isAuthenticated,
  });

  const acceptLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await apiRequest("POST", `/api/leads/${leadId}/accept`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Lead Accepted",
        description: "You have accepted this lead.",
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
      const res = await apiRequest("POST", `/api/leads/${leadId}/decline`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Lead Declined",
        description: "Lead is now available for subcontractors.",
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

  const pendingLeads = leads.filter(l => l.status === "pending_admin");
  const acceptedLeads = leads.filter(l => l.status === "accepted");
  const declinedLeads = leads.filter(l => l.status === "available");
  const allPurchasedLeads = leads.filter(l => l.status === "purchased");

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

  const LeadCard = ({ lead, showActions = false }: { lead: Lead; showActions?: boolean }) => (
    <Card key={lead.id} className="overflow-hidden" data-testid={`card-lead-${lead.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg" data-testid={`text-lead-name-${lead.id}`}>
              {lead.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {lead.serviceType.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())} in {lead.city}
            </CardDescription>
          </div>
          <Badge variant={lead.status === "pending_admin" ? "default" : lead.status === "purchased" ? "secondary" : "outline"} data-testid={`badge-status-${lead.id}`}>
            {lead.status === "pending_admin" ? "Pending Review" : lead.status === "purchased" ? "Purchased" : "Available"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Quote: {formatCurrency(lead.finalQuote)}</p>
              <p className="text-muted-foreground">Lead Price: {formatCurrency(lead.currentLeadPrice)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{formatDate(lead.createdAt)}</p>
              <p className="text-muted-foreground text-xs">{lead.frequency || "one-time"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm border-t pt-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span data-testid={`text-email-${lead.id}`}>{lead.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span data-testid={`text-phone-${lead.id}`}>{lead.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span data-testid={`text-address-${lead.id}`}>
              {lead.address && lead.address !== "***" ? lead.address : `${lead.city.charAt(0).toUpperCase() + lead.city.slice(1)}, Idaho`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>{lead.propertyType.replace(/-/g, " ")}</span>
          </div>
        </div>

        {lead.message && (
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-1">Customer Message:</p>
            <p className="text-sm" data-testid={`text-message-${lead.id}`}>{lead.message}</p>
          </div>
        )}

        <QuoteBreakdownSection lead={lead} />

        {showActions && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => acceptLeadMutation.mutate(lead.id)}
              disabled={acceptLeadMutation.isPending}
              className="flex-1"
              data-testid={`button-accept-${lead.id}`}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Accept Lead
            </Button>
            <Button
              onClick={() => declineLeadMutation.mutate(lead.id)}
              disabled={declineLeadMutation.isPending}
              variant="outline"
              className="flex-1"
              data-testid={`button-decline-${lead.id}`}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Decline (Send to Subcontractors)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container py-8" data-testid="page-admin-dashboard">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage incoming leads and quote requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="count-pending">{pendingLeads.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accepted by You</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="count-accepted">{acceptedLeads.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available to Subs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="count-available">{declinedLeads.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Purchased</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="count-purchased">{allPurchasedLeads.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" data-testid="tab-pending">
            Pending ({pendingLeads.length})
          </TabsTrigger>
          <TabsTrigger value="accepted" data-testid="tab-accepted">
            Accepted ({acceptedLeads.length})
          </TabsTrigger>
          <TabsTrigger value="available" data-testid="tab-available">
            Available ({declinedLeads.length})
          </TabsTrigger>
          <TabsTrigger value="all" data-testid="tab-all">
            All Purchased ({allPurchasedLeads.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingLeads.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending leads to review
              </CardContent>
            </Card>
          ) : (
            pendingLeads.map(lead => <LeadCard key={lead.id} lead={lead} showActions />)
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          {acceptedLeads.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                You haven't accepted any leads yet
              </CardContent>
            </Card>
          ) : (
            acceptedLeads.map(lead => <LeadCard key={lead.id} lead={lead} />)
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          {declinedLeads.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No leads available for subcontractors
              </CardContent>
            </Card>
          ) : (
            declinedLeads.map(lead => <LeadCard key={lead.id} lead={lead} />)
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {allPurchasedLeads.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No purchased leads yet
              </CardContent>
            </Card>
          ) : (
            allPurchasedLeads.map(lead => <LeadCard key={lead.id} lead={lead} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
