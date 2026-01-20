import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import type { Lead } from "@shared/schema";
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Clock, MapPin, Building } from "lucide-react";
import { calculateQuoteRange } from "@shared/utils";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function AnalyticsDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const isAdmin = user?.role === "admin";
  const [, setLocation] = useLocation();

  // Route guard: require admin authentication for the analytics dashboard.
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !isAdmin) {
      setLocation("/admin");
    }
  }, [authLoading, isAuthenticated, isAdmin, setLocation]);

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    enabled: isAuthenticated && isAdmin,
  });

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Calculate metrics
  const pendingLeads = leads.filter(l => l.status === "pending_admin");
  const availableLeads = leads.filter(l => l.status === "available");
  const purchasedLeads = leads.filter(l => l.status === "purchased");
  const acceptedLeads = leads.filter(l => l.status === "accepted");

  const totalLeadValue = leads.reduce((sum, lead) => {
    return sum + (lead.finalQuote ? calculateQuoteRange(lead.finalQuote, 0.15).point : 0);
  }, 0);

  const totalRevenue = purchasedLeads.reduce((sum, lead) => {
    return sum + parseFloat(lead.purchasePrice || "0");
  }, 0);

  const avgLeadPrice = availableLeads.length > 0
    ? availableLeads.reduce((sum, lead) => sum + parseFloat(lead.currentLeadPrice || "0"), 0) / availableLeads.length
    : 0;

  // Group by city
  const leadsByCity = leads.reduce((acc, lead) => {
    acc[lead.city] = (acc[lead.city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by service type
  const leadsByService = leads.reduce((acc, lead) => {
    acc[lead.serviceType] = (acc[lead.serviceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Conversion rate
  const conversionRate = leads.length > 0
    ? ((purchasedLeads.length / leads.length) * 100).toFixed(1)
    : "0.0";

  if (authLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading analytics...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="container py-8" data-testid="page-analytics">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Lead distribution metrics and business insights
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Leads
            </CardDescription>
            <CardTitle className="text-3xl" data-testid="metric-total-leads">
              {leads.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {pendingLeads.length} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Purchased Leads
            </CardDescription>
            <CardTitle className="text-3xl" data-testid="metric-purchased-leads">
              {purchasedLeads.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {conversionRate}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardDescription>
            <CardTitle className="text-3xl" data-testid="metric-revenue">
              {formatCurrency(totalRevenue)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              From {purchasedLeads.length} sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Lead Price
            </CardDescription>
            <CardTitle className="text-3xl" data-testid="metric-avg-price">
              {formatCurrency(avgLeadPrice)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {availableLeads.length} available
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Lead Status Breakdown</CardTitle>
            <CardDescription>Distribution of leads by current status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between" data-testid="status-pending">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Pending Admin Review</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{pendingLeads.length}</span>
                <div className="w-24 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(pendingLeads.length / leads.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between" data-testid="status-available">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Available to Subcontractors</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{availableLeads.length}</span>
                <div className="w-24 bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(availableLeads.length / leads.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between" data-testid="status-purchased">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Purchased by Subcontractors</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{purchasedLeads.length}</span>
                <div className="w-24 bg-muted rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(purchasedLeads.length / leads.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between" data-testid="status-accepted">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Accepted by Admin</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{acceptedLeads.length}</span>
                <div className="w-24 bg-muted rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${(acceptedLeads.length / leads.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Cities</CardTitle>
            <CardDescription>Leads by geographic location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(leadsByCity)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([city, count]) => (
                <div key={city} className="flex items-center justify-between" data-testid={`city-${city}`}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm capitalize">{city}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{count}</span>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(count / leads.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Type Distribution</CardTitle>
          <CardDescription>Most requested services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(leadsByService)
            .sort((a, b) => b[1] - a[1])
            .map(([service, count]) => (
              <div key={service} className="flex items-center justify-between" data-testid={`service-${service}`}>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{service.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{count}</span>
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(count / leads.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {((count / leads.length) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
