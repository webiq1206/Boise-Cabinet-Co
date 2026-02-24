"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, TrendingUp, Users, Clock, ShoppingCart, ListChecks } from "lucide-react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import type { User } from "@shared/schema";

type AdminAnalyticsResponse = {
  success: boolean;
  range: { start: string; end: string; days: number };
  allTime: {
    totalLeads: number;
    pendingAdmin: number;
    accepted: number;
    available: number;
    purchased: number;
    totalRevenue: number;
  };
  kpis: {
    leadsCreated: number;
    leadsReviewed: number;
    leadsPurchased: number;
    revenue: number;
    avgPurchasePrice: number;
    purchaseConversion: number;
    avgTimeToReviewHours: number;
    avgTimeToPurchaseHours: number;
    availableNow: number;
    availableAvgAgeHours: number;
    activeSubcontractors: number;
    subcontractorsAgreementAccepted: number;
  };
  charts: {
    daily: Array<{
      date: string; // YYYY-MM-DD
      leadsCreated: number;
      leadsReviewed: number;
      leadsPurchased: number;
      revenue: number;
    }>;
    byService: Array<{
      serviceType: string;
      leadsCreated: number;
      purchases: number;
      revenue: number;
      conversion: number;
      avgPurchasePrice: number;
    }>;
    byCity: Array<{
      city: string;
      leadsCreated: number;
      purchases: number;
      revenue: number;
      conversion: number;
      avgPurchasePrice: number;
    }>;
    topBuyers: Array<{
      userId: string;
      displayName: string;
      purchases: number;
      revenue: number;
    }>;
  };
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);
}

function formatPercent(value: number) {
  return `${Math.round((value || 0) * 1000) / 10}%`;
}

function formatHours(value: number) {
  if (!Number.isFinite(value)) return "—";
  if (value < 24) return `${Math.round(value)}h`;
  return `${Math.round((value / 24) * 10) / 10}d`;
}

export function AdminAnalyticsPanel({ user }: { user: User | undefined }) {
  const [days, setDays] = useState<string>("30");
  const daysNum = useMemo(() => Math.max(1, Math.min(365, parseInt(days, 10) || 30)), [days]);

  const analyticsUrl = useMemo(() => `/api/admin/analytics?days=${daysNum}`, [daysNum]);

  const { data, isLoading, error } = useQuery<AdminAnalyticsResponse>({
    queryKey: [analyticsUrl],
    enabled: !!user && user.role === "admin",
  });

  const topServices = useMemo(() => (data?.charts.byService ?? []).slice(0, 6), [data?.charts.byService]);
  const topCities = useMemo(() => (data?.charts.byCity ?? []).slice(0, 6), [data?.charts.byCity]);
  const topBuyers = useMemo(() => (data?.charts.topBuyers ?? []).slice(0, 5), [data?.charts.topBuyers]);

  return (
    <div className="space-y-3 md:space-y-4" data-testid="admin-analytics-panel">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-lg md:text-xl font-semibold truncate">KPIs & Analytics</h2>
          {data?.range?.days ? <Badge variant="secondary">{data.range.days}d</Badge> : null}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm text-muted-foreground hidden sm:inline">Range</span>
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last 365 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-4 text-sm text-destructive">
            {(error as Error).message || "Failed to load analytics"}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">New Leads</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold">{isLoading ? "\u2014" : data?.kpis.leadsCreated ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Avg Review</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold">{isLoading ? "\u2014" : formatHours(data?.kpis.avgTimeToReviewHours ?? 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Purchases</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold">{isLoading ? "\u2014" : data?.kpis.leadsPurchased ?? 0}</div>
            <div className="text-[10px] md:text-xs text-muted-foreground">
              {isLoading ? "\u2014" : formatPercent(data?.kpis.purchaseConversion ?? 0)} conv.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Revenue</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold">{isLoading ? "\u2014" : formatCurrency(data?.kpis.revenue ?? 0)}</div>
            <div className="text-[10px] md:text-xs text-muted-foreground">
              Avg: {isLoading ? "\u2014" : formatCurrency(data?.kpis.avgPurchasePrice ?? 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm md:text-base font-semibold">Daily Lead Flow</span>
            </div>
            <ChartContainer
              className="h-[180px] md:h-[240px] w-full"
              config={{
                leadsCreated: { label: "Leads created", color: "hsl(var(--chart-1))" },
                leadsReviewed: { label: "Reviewed", color: "hsl(var(--chart-2))" },
                leadsPurchased: { label: "Purchased", color: "hsl(var(--chart-3))" },
              }}
            >
              <LineChart data={data?.charts.daily ?? []} margin={{ left: 0, right: 4, top: 4, bottom: 4 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickMargin={6} minTickGap={32} tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} width={28} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="leadsCreated" stroke="var(--color-leadsCreated)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="leadsReviewed" stroke="var(--color-leadsReviewed)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="leadsPurchased" stroke="var(--color-leadsPurchased)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm md:text-base font-semibold">Daily Revenue</span>
            </div>
            <ChartContainer
              className="h-[180px] md:h-[240px] w-full"
              config={{
                revenue: { label: "Revenue", color: "hsl(var(--chart-4))" },
              }}
            >
              <BarChart data={data?.charts.daily ?? []} margin={{ left: 0, right: 4, top: 4, bottom: 4 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickMargin={6} minTickGap={32} tick={{ fontSize: 11 }} />
                <YAxis width={48} tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11 }} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <div className="flex w-full justify-between gap-6">
                          <span className="text-muted-foreground">{name}</span>
                          <span className="font-mono font-medium tabular-nums">{formatCurrency(Number(value) || 0)}</span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        <Card className="lg:col-span-2">
          <CardContent className="p-3 md:p-4">
            <h3 className="text-sm md:text-base font-semibold mb-3">Top Services</h3>
            <div className="space-y-2">
              {topServices.length === 0 ? (
                <div className="text-sm text-muted-foreground py-2">No data in this range.</div>
              ) : (
                topServices.map((s) => (
                  <div key={s.serviceType}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-4 py-1">
                      <div className="font-medium text-sm capitalize">{s.serviceType.replace(/-/g, " ")}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.leadsCreated} leads, {s.purchases} purchased, {formatCurrency(s.revenue)}
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm md:text-base font-semibold">Network</span>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Active subs</span>
                <span className="font-medium">{data?.kpis.activeSubcontractors ?? 0}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Agreed</span>
                <span className="font-medium">
                  {data?.kpis.subcontractorsAgreementAccepted ?? 0}/{data?.kpis.activeSubcontractors ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Available now</span>
                <span className="font-medium">{data?.kpis.availableNow ?? 0}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Avg age</span>
                <span className="font-medium">{formatHours(data?.kpis.availableAvgAgeHours ?? 0)}</span>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="space-y-1.5">
              <div className="text-sm font-medium">Top Buyers</div>
              {topBuyers.length === 0 ? (
                <div className="text-sm text-muted-foreground">No purchases in this range.</div>
              ) : (
                topBuyers.map((b) => (
                  <div key={b.userId} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">{b.displayName}</span>
                    <span className="text-muted-foreground text-xs">
                      {b.purchases}, {formatCurrency(b.revenue)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <h3 className="text-sm md:text-base font-semibold mb-3">Top Cities</h3>
            <div className="space-y-2">
              {topCities.length === 0 ? (
                <div className="text-sm text-muted-foreground py-2">No data in this range.</div>
              ) : (
                topCities.map((c) => (
                  <div key={c.city} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-4 text-sm py-1">
                    <span className="font-medium">{c.city}</span>
                    <span className="text-xs text-muted-foreground">
                      {c.leadsCreated} leads, {c.purchases} purchased, {formatCurrency(c.revenue)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <h3 className="text-sm md:text-base font-semibold mb-3">All-time Snapshot</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Total leads</span>
                <span className="font-medium">{data?.allTime.totalLeads ?? 0}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Pending review</span>
                <span className="font-medium">{data?.allTime.pendingAdmin ?? 0}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Available</span>
                <span className="font-medium">{data?.allTime.available ?? 0}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Purchased</span>
                <span className="font-medium">{data?.allTime.purchased ?? 0}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Total revenue</span>
                <span className="font-medium">{formatCurrency(data?.allTime.totalRevenue ?? 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

