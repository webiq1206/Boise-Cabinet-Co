"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PortalShell } from "@/components/portal/PortalShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { AdminPageIntro } from "@/components/admin/AdminPageIntro";
import {
  FolderKanban,
  Users,
  Inbox,
  Send,
  Clock,
  CheckCircle2,
  ArrowRight,
  Bell,
  Sparkles,
} from "lucide-react";

interface DashboardLead {
  id: string;
  name: string;
  city: string;
  serviceType: string;
  status: string;
  projectId?: string | null;
  createdAt: string;
}

interface DashboardProject {
  id: string;
  status: string;
}

interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  leadId?: string | null;
  projectId?: string | null;
}

function formatLeadAge(date: string): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffHours / 24);
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

const SERVICE_LABELS: Record<string, string> = {
  kitchen: "Kitchen Cabinets",
  bathroom: "Bathroom Vanities",
  laundry: "Laundry / Mudroom",
  closet: "Closet & Storage",
  other: "Other / Whole-home",
};

function serviceLabel(slug: string): string {
  return (
    SERVICE_LABELS[slug] ??
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function StatCard({
  href,
  icon: Icon,
  label,
  value,
  loading,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <Link href={href} className="group">
      <Card className="transition-colors group-hover:border-primary/40 group-hover:bg-muted/30">
        <CardHeader className="p-3 md:p-4 pb-1 md:pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-0 flex items-end justify-between">
          <div className="brc-display-num tabular-nums text-2xl md:text-3xl font-light">
            {loading ? "-" : value}
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const { isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading: loadingLeads } = useQuery<DashboardLead[]>({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error("Failed to load leads");
      return res.json();
    },
    enabled: isAdmin,
  });

  const { data: projects = [], isLoading: loadingProjects } = useQuery<DashboardProject[]>({
    queryKey: ["/api/admin/projects"],
    queryFn: async () => {
      const res = await fetch("/api/admin/projects");
      if (!res.ok) throw new Error("Failed to load projects");
      return res.json();
    },
    enabled: isAdmin,
  });

  const { data: notifications = [], isLoading: loadingNotifications } = useQuery<DashboardNotification[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAdmin,
  });

  const acceptLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await fetch(`/api/leads/${leadId}/accept`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to accept lead");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({ title: "Lead accepted" });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  if (!isAdmin || isLoading) {
    return <AdminAuthGate title="Operations Dashboard"><span /></AdminAuthGate>;
  }

  const pendingLeads = leads
    .filter((l) => !l.projectId && l.status !== "accepted" && l.status !== "archived")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const oldestPending = pendingLeads.slice(0, 5);
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const recentNotifications = notifications.slice(0, 5);

  return (
    <AdminAuthGate title="Operations Dashboard">
    <PortalShell variant="admin" title="Operations Dashboard">
      <div className="space-y-6">
        <AdminPageIntro>Monitor leads and projects at a glance.</AdminPageIntro>

        <div className="grid gap-3 sm:grid-cols-3">
          <Button variant="outline" asChild className="h-auto py-4 justify-start">
            <Link href="/admin/leads">
              <Inbox className="h-4 w-4 mr-2" />
              Leads
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-auto py-4 justify-start">
            <Link href="/admin/projects">
              <FolderKanban className="h-4 w-4 mr-2" />
              Projects
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-auto py-4 justify-start">
            <Link href="/admin/outreach">
              <Send className="h-4 w-4 mr-2" />
              Outreach
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4">
          <StatCard href="/admin/leads" icon={Users} label="Total Leads" value={leads.length} loading={loadingLeads} />
          <StatCard href="/admin/leads?tab=pending" icon={Clock} label="Pending Review" value={pendingLeads.length} loading={loadingLeads} />
          <StatCard href="/admin/projects" icon={FolderKanban} label="Active Projects" value={activeProjects} loading={loadingProjects} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
          <Card>
            <CardHeader className="p-3 md:p-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Needs attention
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0 space-y-2">
              {loadingLeads ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : oldestPending.length === 0 ? (
                <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  All caught up. No leads waiting for review.
                </div>
              ) : (
                oldestPending.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between gap-3 rounded-md border p-2.5"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{lead.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {serviceLabel(lead.serviceType)} in {lead.city} · {formatLeadAge(lead.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => acceptLeadMutation.mutate(lead.id)}
                        disabled={acceptLeadMutation.isPending}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/leads?leadId=${encodeURIComponent(lead.id)}`}>Open</Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
              {pendingLeads.length > oldestPending.length && (
                <Button variant="ghost" size="sm" asChild className="w-full justify-center">
                  <Link href="/admin/leads?tab=pending">
                    View all {pendingLeads.length} pending
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 md:p-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Recent activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0 space-y-1">
              {loadingNotifications ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : recentNotifications.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">No recent activity.</p>
              ) : (
                recentNotifications.map((n) => {
                  const href = n.projectId
                    ? `/admin/projects/${n.projectId}`
                    : n.leadId
                      ? `/admin/leads?leadId=${encodeURIComponent(n.leadId)}`
                      : "/admin/dashboard";
                  return (
                    <Link
                      key={n.id}
                      href={href}
                      className="block rounded-md p-2 -mx-1 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {!n.read && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                        <p className="font-medium text-sm truncate">{n.title}</p>
                        <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">
                          {formatLeadAge(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{n.message}</p>
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalShell>
    </AdminAuthGate>
  );
}
