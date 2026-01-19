import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import type { LeadPurchase, Lead } from "@shared/schema";
import { Clock, DollarSign, MapPin, Phone, Mail, Building, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { formatQuoteRangeWholeFromValue } from "@/lib/utils";

export default function PurchaseHistory() {
  const { isAuthenticated } = useAuth();
  const [selectedPurchase, setSelectedPurchase] = useState<{ purchase: LeadPurchase; lead: Lead } | null>(null);

  const { data: purchases = [], isLoading } = useQuery<Array<{ purchase: LeadPurchase; lead: Lead }>>({
    queryKey: ["/api/leads/purchases"],
    enabled: isAuthenticated,
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
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const totalSpent = purchases.reduce((sum, p) => {
    return sum + parseFloat(p.purchase.purchasePrice || "0");
  }, 0);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading purchase history...</div>
      </div>
    );
  }

  return (
    <div className="container py-8" data-testid="page-purchase-history">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Purchase History</h1>
        <p className="text-muted-foreground">
          View all leads you've purchased and access customer contact information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Leads Purchased</CardDescription>
            <CardTitle className="text-3xl" data-testid="text-total-purchases">
              {purchases.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Spent</CardDescription>
            <CardTitle className="text-3xl" data-testid="text-total-spent">
              {formatCurrency(totalSpent.toFixed(2))}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Lead Cost</CardDescription>
            <CardTitle className="text-3xl" data-testid="text-avg-cost">
              {purchases.length > 0 ? formatCurrency((totalSpent / purchases.length).toFixed(2)) : "$0.00"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {purchases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No purchases yet</h3>
            <p className="text-muted-foreground">
              When you purchase leads from the marketplace, they'll appear here with full customer contact information.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {purchases.map(({ purchase, lead }) => (
            <Card key={purchase.id} className="overflow-hidden" data-testid={`card-purchase-${purchase.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl" data-testid={`text-lead-name-${purchase.id}`}>
                      {lead.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {lead.serviceType.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())} in {lead.city}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" data-testid={`badge-status-${purchase.id}`}>
                    Purchased
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Purchased On</p>
                      <p className="font-medium" data-testid={`text-purchase-date-${purchase.id}`}>
                        {formatDate(purchase.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Purchase Price</p>
                      <p className="font-medium" data-testid={`text-purchase-price-${purchase.id}`}>
                        {formatCurrency(purchase.purchasePrice)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-3">Customer Contact Information</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <a 
                          href={`tel:${lead.phone}`} 
                          className="text-sm font-medium text-primary hover:underline"
                          data-testid={`link-phone-${purchase.id}`}
                        >
                          {lead.phone}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <a 
                          href={`mailto:${lead.email}`} 
                          className="text-sm font-medium text-primary hover:underline"
                          data-testid={`link-email-${purchase.id}`}
                        >
                          {lead.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Property Address</p>
                        <p className="text-sm font-medium" data-testid={`text-address-${purchase.id}`}>
                          {lead.address || `${lead.city}, Idaho`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Property Type</p>
                        <p className="text-sm font-medium">
                          {lead.propertyType.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {lead.message && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-1">Customer Message</p>
                    <p className="text-sm text-muted-foreground" data-testid={`text-message-${purchase.id}`}>
                      {lead.message}
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Service Details</p>
                  <div className="grid gap-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Quote Range:</span>{" "}
                      <span className="font-medium">
                        {lead.finalQuote ? formatQuoteRangeWholeFromValue(lead.finalQuote, 0.15) : "Pending"}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Frequency:</span>{" "}
                      <span className="font-medium">{lead.frequency || "One-time"}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
