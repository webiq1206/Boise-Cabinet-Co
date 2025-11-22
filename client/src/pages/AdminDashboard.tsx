import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Clock, DollarSign, MapPin, Phone, Mail, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Lead } from "@shared/schema";
import { useState } from "react";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  
  // TODO: Get real userId from Replit Auth context
  const currentUserId = "admin-temp-id";

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: [`/api/leads?userId=${currentUserId}`],
  });

  const acceptLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await apiRequest("POST", `/api/leads/${leadId}/accept`, {
        userId: "admin-temp-id", // TODO: Get from auth context
      });
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
      const res = await apiRequest("POST", `/api/leads/${leadId}/decline`, {
        userId: "admin-temp-id", // TODO: Get from auth context
      });
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
          {lead.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span data-testid={`text-address-${lead.id}`}>{lead.address}</span>
            </div>
          )}
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
