import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, MapPin, Phone, Mail, Building, ShoppingCart, AlertCircle, CheckCircle2, Clock, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Lead } from "@shared/schema";
import { CITIES } from "@shared/contentData";

export default function SubcontractorPortal() {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    city: "all",
    serviceType: "",
    maxPrice: "",
  });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads", { availableOnly: "true" }],
  });

  const purchaseLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      // TODO: Integrate with Stripe to create payment intent
      const mockPaymentIntentId = `pi_mock_${Date.now()}`;
      
      const res = await apiRequest("POST", `/api/leads/${leadId}/purchase`, {
        userId: "sub-temp-id", // TODO: Get from auth context
        paymentIntentId: mockPaymentIntentId,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setShowPurchaseModal(false);
      setSelectedLead(null);
      toast({
        title: "Lead Purchased!",
        description: "You now have access to the full customer details.",
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

  const handleAcceptAgreement = async () => {
    try {
      const res = await apiRequest("POST", "/api/user/accept-agreement", {
        userId: "sub-temp-id", // TODO: Get from auth context
      });
      await res.json();
      setAgreementAccepted(true);
      setShowAgreementModal(false);
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
    setShowPurchaseModal(true);
  };

  const filteredLeads = leads.filter(lead => {
    if (filters.city !== "all" && lead.city !== filters.city) return false;
    if (filters.serviceType && !lead.serviceType.toLowerCase().includes(filters.serviceType.toLowerCase())) return false;
    if (filters.maxPrice && parseFloat(lead.currentLeadPrice || "0") > parseFloat(filters.maxPrice)) return false;
    return true;
  });

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

  return (
    <div className="container py-8" data-testid="page-subcontractor-portal">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Available Leads</h1>
        <p className="text-muted-foreground">Browse and purchase high-quality leads in your service area</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div>
              <label className="text-sm font-medium mb-2 block">Service Type</label>
              <Input
                placeholder="e.g., lawn-care, landscaping"
                value={filters.serviceType}
                onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
                data-testid="input-service-filter"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Max Price</label>
              <Input
                type="number"
                placeholder="e.g., 50"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                data-testid="input-price-filter"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="count-available">{filteredLeads.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to purchase</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Lead Price</CardTitle>
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
            <p className="text-xs text-muted-foreground mt-1">Average cost per lead</p>
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
                  .reduce((sum, l) => sum + parseFloat(l.finalQuote || "0"), 0)
                  .toFixed(2)
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Combined quote values</p>
          </CardContent>
        </Card>
      </div>

      {/* Lead Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center">Loading available leads...</CardContent>
          </Card>
        ) : filteredLeads.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No leads match your filters. Try adjusting your search criteria.
            </CardContent>
          </Card>
        ) : (
          filteredLeads.map((lead) => {
            const daysOld = calculateDaysOld(lead.createdAt);
            const originalPrice = parseFloat(lead.baseLeadPrice || "0");
            const currentPrice = parseFloat(lead.currentLeadPrice || "0");
            const discount = originalPrice > 0 ? ((originalPrice - currentPrice) / originalPrice * 100) : 0;

            return (
              <Card key={lead.id} className="overflow-hidden hover-elevate" data-testid={`card-lead-${lead.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <CardTitle className="text-lg">
                          {lead.serviceType.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </CardTitle>
                        {discount > 0 && (
                          <Badge variant="secondary" className="text-green-600">
                            {discount.toFixed(0)}% OFF
                          </Badge>
                        )}
                        {daysOld === 0 && <Badge variant="default">NEW</Badge>}
                      </div>
                      <CardDescription>
                        {lead.city.charAt(0).toUpperCase() + lead.city.slice(1)} • {lead.frequency || "One-time"} • Posted {daysOld === 0 ? "today" : `${daysOld} days ago`}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary" data-testid={`text-price-${lead.id}`}>
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
                        <p className="font-medium">Quote Value</p>
                        <p className="text-muted-foreground">{formatCurrency(lead.finalQuote)}</p>
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
                        <p className="text-muted-foreground">{lead.address || `${lead.city}, Idaho`}</p>
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

                  {lead.message && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-1">Customer Notes:</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{lead.message}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>
                      Full contact details (phone, email) available after purchase. Prices reduce daily if not purchased.
                    </span>
                  </div>

                  <Button
                    onClick={() => handlePurchaseLead(lead)}
                    className="w-full"
                    size="lg"
                    data-testid={`button-purchase-${lead.id}`}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Purchase Lead - {formatCurrency(lead.currentLeadPrice)}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Legal Agreement Modal */}
      <Dialog open={showAgreementModal} onOpenChange={setShowAgreementModal}>
        <DialogContent className="max-w-2xl" data-testid="modal-legal-agreement">
          <DialogHeader>
            <DialogTitle>Legal Agreement Required</DialogTitle>
            <DialogDescription>
              Before purchasing leads, you must accept our terms and conditions.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto border rounded-md p-4 space-y-4 text-sm">
            <h3 className="font-semibold">Lead Purchase Agreement</h3>
            <p>
              This Lead Purchase Agreement ("Agreement") is entered into between Lawn Care Kuna ("Company") and you ("Subcontractor").
            </p>
            <h4 className="font-semibold mt-4">1. No-Refund Policy</h4>
            <p>
              All lead purchases are final and non-refundable. Once you purchase a lead, you have immediate access to the customer's contact information and project details. Due to the nature of this information, we cannot offer refunds under any circumstances.
            </p>
            <h4 className="font-semibold mt-4">2. Lead Quality</h4>
            <p>
              While we strive to provide high-quality leads, we cannot guarantee that every lead will result in a closed deal. Leads are sold on a first-come, first-served basis and are exclusive to the purchaser.
            </p>
            <h4 className="font-semibold mt-4">3. Pricing</h4>
            <p>
              Lead prices are calculated at 10% of the quoted service cost for one-time services, or the cost of one service visit for recurring services. Prices automatically reduce by 1-2% daily until a minimum threshold is reached.
            </p>
            <h4 className="font-semibold mt-4">4. Usage Rights</h4>
            <p>
              You may contact the customer for the specific service requested in the lead. You may not sell, transfer, or share the lead information with third parties.
            </p>
            <h4 className="font-semibold mt-4">5. Professional Conduct</h4>
            <p>
              You agree to maintain professional standards when contacting customers and representing the Lawn Care Kuna network.
            </p>
          </div>
          <div className="flex items-start gap-2 py-4">
            <Checkbox
              id="agreement-checkbox"
              checked={agreementAccepted}
              onCheckedChange={(checked) => setAgreementAccepted(checked as boolean)}
              data-testid="checkbox-accept-agreement"
            />
            <label htmlFor="agreement-checkbox" className="text-sm leading-tight cursor-pointer">
              I have read and agree to the Lead Purchase Agreement, including the no-refund policy.
            </label>
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
              disabled={!agreementAccepted}
              data-testid="button-accept-agreement"
            >
              Accept Agreement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchase Confirmation Modal */}
      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent data-testid="modal-purchase-confirmation">
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              You're about to purchase this lead for {selectedLead && formatCurrency(selectedLead.currentLeadPrice)}
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Service:</span> {selectedLead.serviceType.replace(/-/g, " ")}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Location:</span> {selectedLead.city}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Quote Value:</span> {formatCurrency(selectedLead.finalQuote)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Lead Price:</span> {formatCurrency(selectedLead.currentLeadPrice)}
                </p>
              </div>
              <div className="bg-muted p-4 rounded-md space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
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
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPurchaseModal(false)}
              disabled={purchaseLeadMutation.isPending}
              data-testid="button-cancel-purchase"
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedLead && purchaseLeadMutation.mutate(selectedLead.id)}
              disabled={purchaseLeadMutation.isPending}
              data-testid="button-confirm-purchase"
            >
              {purchaseLeadMutation.isPending ? "Processing..." : `Confirm Purchase - ${selectedLead && formatCurrency(selectedLead.currentLeadPrice)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
