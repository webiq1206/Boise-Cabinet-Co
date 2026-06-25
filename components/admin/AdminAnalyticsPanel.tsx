"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Clock, ListChecks, ClipboardCheck } from "lucide-react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

type AdminAnalyticsResponse = {
  success: boolean;
  range: { start: string; end: string; days: number };
  allTime: {
    totalLeads: number;
    pendingAdmin: number;
    accepted: number;
    archived: number;
  };
  kpis: {
    leadsCreated: number;
    leadsReviewed: number;
    avgTimeToReviewHours: number;
  };
  charts: {
    daily: Array<{
      date: string;
      leadsCreated: number;
      leadsReviewed: number;
    }>;
    byService: Array<{
      serviceType: string;
      leadsCreated: number;
    }>;
    byCity: Array<{
      city: string;
      leadsCreated: number;
    }>;
  };
};

interface User {
  id: string;
  role: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

function formatHours(value: number) {
  if (!Number.isFinite(value)) return "-";
  if (value < 24) return `${Math.round(value)}h`;
  return `${Math.round((value / 24) * 10) / 10}d`;
}

export function AdminAnalyticsPanel({ user }: { user: User | undefined }) {
  const [days, setDays] = useState<string>("30");
  const daysNum = useMemo(() => Math.max(1, Math.min(365, parseInt(days, 10) || 30)), [days]);

  const analyticsUrl = useMemo(() => `/api/admin/analytics?days=${daysNum}`, [daysNum]);

  const { data, isLoading, error } = useQuery<AdminAnalyticsResponse>({
    queryKey: [analyticsUrl],
    queryFn: async () => {
      const res = await fetch(analyticsUrl);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: !!user && user.role === "admin",
  });

  const topServices = useMemo(() => (data?.charts.byService ?? []).slice(0, 6), [data?.charts.byService]);
  const topCities = useMemo(() => (data?.charts.byCity ?? []).slice(0, 6), [data?.charts.byCity]);
  const hasDailyData = useMemo(
    () => (data?.charts.daily ?? []).some((d) => d.leadsCreated > 0 || d.leadsReviewed > 0),
    [data?.charts.daily],
  );

  return (
    <div className="space-y-3 md:space-y-4" data-testid="admin-analytics-panel">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg md:text-xl font-semibold">KPIs & Analytics</h2>
          {data?.range?.days ? <Badge variant="secondary">{data.range.days}d</Badge> : null}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Range</span>
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[140px]">
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
          <CardContent className="py-4 md:py-6 text-sm text-destructive">
            {(error as Error).message || "Failed to load analytics"}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
        <Card>
          <CardHeader className="p-3 md:p-4 pb-1 md:pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ListChecks className="h-4 w-4" /> New Leads
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="brc-display-num tabular-nums text-2xl md:text-3xl font-light">{isLoading ? "-" : data?.kpis.leadsCreated ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 md:p-4 pb-1 md:pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" /> Reviewed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="brc-display-num tabular-nums text-2xl md:text-3xl font-light">{isLoading ? "-" : data?.kpis.leadsReviewed ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 md:p-4 pb-1 md:pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" /> Avg Time to Review
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="brc-display-num tabular-nums text-2xl md:text-3xl font-light">{isLoading ? "-" : formatHours(data?.kpis.avgTimeToReviewHours ?? 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-3 md:p-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Daily Lead Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-0">
          {isLoading ? (
            <Skeleton className="h-[180px] md:h-[260px] w-full" />
          ) : !hasDailyData ? (
            <div className="flex h-[180px] md:h-[260px] flex-col items-center justify-center gap-1 text-center">
              <TrendingUp className="h-6 w-6 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No lead activity in this range.</p>
              <p className="text-xs text-muted-foreground">Try a longer range to see trends.</p>
            </div>
          ) : (
            <ChartContainer
              className="h-[180px] md:h-[260px] w-full"
              config={{
                leadsCreated: { label: "Leads created", color: "hsl(var(--chart-1))" },
                leadsReviewed: { label: "Reviewed", color: "hsl(var(--chart-2))" },
              }}
            >
              <LineChart data={data?.charts.daily ?? []} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickMargin={8} minTickGap={24} />
                <YAxis allowDecimals={false} width={32} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="leadsCreated" stroke="var(--color-leadsCreated)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="leadsReviewed" stroke="var(--color-leadsReviewed)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-base font-semibold">Top Services</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 space-y-3">
            {topServices.length === 0 ? (
              <div className="text-sm text-muted-foreground py-3">No data in this range.</div>
            ) : (
              topServices.map((s) => (
                <div key={s.serviceType} className="space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-medium text-sm">{s.serviceType.replace(/-/g, " ")}</div>
                    <div className="text-xs text-muted-foreground">Leads: {s.leadsCreated}</div>
                  </div>
                  <Separator />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-base font-semibold">All-time Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total leads</span>
              <span className="font-medium">{data?.allTime.totalLeads ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pending review</span>
              <span className="font-medium">{data?.allTime.pendingAdmin ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Accepted</span>
              <span className="font-medium">{data?.allTime.accepted ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Archived</span>
              <span className="font-medium">{data?.allTime.archived ?? 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-3 md:p-4">
          <CardTitle className="text-base font-semibold">Top Cities</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 space-y-3">
          {topCities.length === 0 ? (
            <div className="text-sm text-muted-foreground py-3">No data in this range.</div>
          ) : (
            topCities.map((c) => (
              <div key={c.city} className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium">{c.city}</span>
                <span className="text-muted-foreground">Leads: {c.leadsCreated}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
