"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { AttentionQueue } from "@/components/portal/AttentionQueue";
import { ProjectTimeline } from "@/components/portal/ProjectTimeline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SITE_CONFIG } from "@/shared/siteConfig";
import {
  MessageSquare,
  Upload,
  FileText,
  Palette,
  ArrowRight,
  MapPin,
} from "lucide-react";

interface DashboardData {
  projects: Array<{
    id: string;
    title: string;
    address: string;
    city: string;
    state: string;
    currentStage: string;
    status: string;
    estimatedCompletion: string;
    projectManager: string;
  }>;
  activeProject: DashboardData["projects"][0];
  attentionItems: Array<{
    id: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    href: string;
    actionLabel: string;
  }>;
}

export default function PortalHomePage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/portal/dashboard"],
    queryFn: () => fetch("/api/portal/dashboard").then((r) => r.json()),
  });

  const project = data?.activeProject;
  const attentionItems = data?.attentionItems ?? [];

  const quickActions = project
    ? [
        { label: "Message", href: `/portal/projects/${project.id}/messages`, icon: MessageSquare, description: "Chat with your project team" },
        { label: "Upload", href: `/portal/projects/${project.id}/documents`, icon: Upload, description: "Add photos or documents" },
        { label: "View Invoice", href: `/portal/projects/${project.id}/payments`, icon: FileText, description: "Review payments & invoices" },
        { label: "Design Studio", href: "/design-studio", icon: Palette, description: "Explore cabinet options" },
      ]
    : [];

  return (
    <PortalShell variant="customer" title="Dashboard">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <p className="text-muted-foreground mb-1">Welcome to your {SITE_CONFIG.name} portal</p>
          <h2 className="text-2xl font-sans font-light tracking-tight">
            Your project at a <em className="brc-accent text-accent">glance</em>
          </h2>
        </div>

        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <AttentionQueue items={attentionItems} />
        )}

        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : project ? (
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 mt-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {project.address}, {project.city}, {project.state}
                  </CardDescription>
                </div>
                <Badge variant="secondary">{project.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Project manager</p>
                  <p className="font-medium">{project.projectManager}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Est. completion</p>
                  <p className="font-medium">{project.estimatedCompletion}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Project ID</p>
                  <p className="font-medium font-mono text-xs">{project.id}</p>
                </div>
              </div>
              <Button variant="brand" asChild className="w-full sm:w-auto">
                <Link href={`/portal/projects/${project.id}`}>
                  View project hub
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {project && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project timeline</CardTitle>
              <CardDescription>Track progress from design through installation</CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectTimeline currentStage={project.currentStage as never} compact />
            </CardContent>
          </Card>
        )}

        <div>
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Quick actions
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex flex-col gap-2 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">{action.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
