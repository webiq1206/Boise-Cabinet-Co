"use client";

import { useQuery } from "@tanstack/react-query";
import { PortalShell } from "@/components/portal/PortalShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import {
  Users,
  Building2,
  FolderKanban,
  Send,
  Mail,
  MailOpen,
  MousePointerClick,
  TrendingUp,
  Phone,
  ArrowRight,
  Plus,
  Upload,
  Clock,
} from "lucide-react";

interface DashboardData {
  leads: {
    total: number;
    emailable: number;
    homeowner: number;
    business: number;
    newToday: number;
    pipeline: Record<string, number>;
  };
  outreach: {
    total: number;
    sent: number;
    failed: number;
    opened: number;
    clicked: number;
    sentLast24h: number;
  };
  projects: { total: number; active: number };
  recentLeads: Array<{
    id: string;
    name: string | null;
    companyName: string | null;
    leadType: string;
    phone: string | null;
    email: string | null;
    city: string | null;
    serviceArea: string | null;
    source: string | null;
    pipelineStage: string;
    createdAt: string;
  }>;
}

const PIPELINE_LABELS: Record<string, string> = {
  new: "New",
  consultation_booked: "Booked",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
  on_hold: "On hold",
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminDashboardPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/admin/dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard");
      return res.json();
    },
    enabled: isAdmin,
    refetchInterval: 60_000,
  });

  if (!isAdmin && !authLoading) {
    return <AdminAuthGate title="Dashboard"><span /></AdminAuthGate>;
  }
  if (authLoading) {
    return <AdminAuthGate title="Dashboard"><span /></AdminAuthGate>;
  }

  const loading = isLoading || !data;

  return (
    <AdminAuthGate title="Dashboard">
      <PortalShell variant="admin" title="Dashboard">
        <div className="space-y-6">
          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/leads">
                <Users className="h-4 w-4 mr-1.5" /> View all leads
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/outreach">
                <Send className="h-4 w-4 mr-1.5" /> Outreach
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/projects">
                <FolderKanban className="h-4 w-4 mr-1.5" /> Projects
              </Link>
            </Button>
          </div>

          {/* Lead stats row */}
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total leads"
              value={data?.leads.total}
              loading={loading}
              icon={<Users className="h-4 w-4" />}
              href="/admin/leads"
            />
            <MetricCard
              label="Emailable"
              value={data?.leads.emailable}
              loading={loading}
              icon={<Mail className="h-4 w-4" />}
              href="/admin/leads"
            />
            <MetricCard
              label="New today"
              value={data?.leads.newToday}
              loading={loading}
              icon={<TrendingUp className="h-4 w-4" />}
              accent={data?.leads.newToday ? "green" : undefined}
            />
            <MetricCard
              label="Active projects"
              value={data?.projects.active}
              loading={loading}
              icon={<FolderKanban className="h-4 w-4" />}
              sub={data ? `${data.projects.total} total` : undefined}
              href="/admin/projects"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pipeline breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Lead pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(PIPELINE_LABELS).map(([key, label]) => {
                      const count = data.leads.pipeline[key] ?? 0;
                      const pct = data.leads.total > 0 ? (count / data.leads.total) * 100 : 0;
                      return (
                        <Link
                          key={key}
                          href={`/admin/leads`}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-colors group"
                        >
                          <span className="text-sm flex-1">{label}</span>
                          <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary/60 transition-all"
                              style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium tabular-nums w-10 text-right">
                            {count}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Outreach stats */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Outreach activity</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/outreach">
                      View all <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <MiniStat
                      icon={<Send className="h-3.5 w-3.5" />}
                      label="Sent"
                      value={data.outreach.sent}
                      sub={`${data.outreach.sentLast24h} last 24h`}
                    />
                    <MiniStat
                      icon={<MailOpen className="h-3.5 w-3.5" />}
                      label="Opened"
                      value={data.outreach.opened}
                      sub={data.outreach.sent > 0 ? `${Math.round((data.outreach.opened / data.outreach.sent) * 100)}% rate` : "—"}
                    />
                    <MiniStat
                      icon={<MousePointerClick className="h-3.5 w-3.5" />}
                      label="Clicked"
                      value={data.outreach.clicked}
                      sub={data.outreach.sent > 0 ? `${Math.round((data.outreach.clicked / data.outreach.sent) * 100)}% rate` : "—"}
                    />
                    <MiniStat
                      icon={<Mail className="h-3.5 w-3.5 text-red-500" />}
                      label="Failed"
                      value={data.outreach.failed}
                      sub="delivery errors"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent leads */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Recent leads</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/leads">
                    View all <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : data.recentLeads.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No leads yet.
                </div>
              ) : (
                <div className="divide-y">
                  {data.recentLeads.map((lead) => {
                    const displayName =
                      lead.leadType === "business"
                        ? lead.companyName || lead.name
                        : lead.name || lead.companyName;
                    return (
                      <Link
                        key={lead.id}
                        href={`/admin/leads?leadId=${lead.id}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted shrink-0">
                          {lead.leadType === "business" ? (
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Users className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {displayName || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {lead.serviceArea || lead.city || "—"}
                            {lead.source ? ` · ${lead.source}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="secondary" className="text-xs">
                            {PIPELINE_LABELS[lead.pipelineStage] ?? lead.pipelineStage}
                          </Badge>
                          <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {relativeTime(lead.createdAt)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lead type breakdown */}
          <div className="grid gap-3 grid-cols-2">
            <Card className="border-dashed">
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-semibold tabular-nums">
                    {loading ? <Skeleton className="h-7 w-12 inline-block" /> : data.leads.homeowner}
                  </p>
                  <p className="text-xs text-muted-foreground">Homeowner leads</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-dashed">
              <CardContent className="p-4 flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-semibold tabular-nums">
                    {loading ? <Skeleton className="h-7 w-12 inline-block" /> : data.leads.business}
                  </p>
                  <p className="text-xs text-muted-foreground">Business leads</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PortalShell>
    </AdminAuthGate>
  );
}

function MetricCard({
  label,
  value,
  loading,
  icon,
  href,
  sub,
  accent,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
  icon: React.ReactNode;
  href?: string;
  sub?: string;
  accent?: "green";
}) {
  const inner = (
    <Card className={href ? "hover:bg-muted/50 transition-colors cursor-pointer" : ""}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-muted-foreground">{icon}</span>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <>
            <p className={`text-2xl font-semibold tabular-nums ${accent === "green" && value ? "text-green-600" : ""}`}>
              {value ?? 0}
            </p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

function MiniStat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
