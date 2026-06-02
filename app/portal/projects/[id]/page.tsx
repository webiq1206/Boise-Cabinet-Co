"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PortalShell } from "@/components/portal/PortalShell";
import { ProjectTimeline } from "@/components/portal/ProjectTimeline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ProjectStage } from "@/shared/projectStages";
import {
  LayoutDashboard,
  Palette,
  FileText,
  MessageSquare,
  CreditCard,
  MapPin,
} from "lucide-react";

const hubLinks = [
  { slug: "", label: "Overview", icon: LayoutDashboard },
  { slug: "design", label: "Design", icon: Palette },
  { slug: "documents", label: "Documents", icon: FileText },
  { slug: "messages", label: "Messages", icon: MessageSquare },
  { slug: "payments", label: "Payments", icon: CreditCard },
];

interface ProjectHubData {
  project: {
    id: string;
    title: string;
    address: string;
    city: string;
    state: string;
    currentStage: ProjectStage;
    status: string;
    estimatedCompletion: string;
    projectManager: string;
  };
}

export default function ProjectHubPage() {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.id as string;
  const basePath = `/portal/projects/${projectId}`;

  const { data, isLoading, isError } = useQuery<ProjectHubData>({
    queryKey: [`/api/portal/projects/${projectId}`],
    queryFn: async () => {
      const res = await fetch(`/api/portal/projects/${projectId}`);
      if (!res.ok) throw new Error("Failed to load project");
      return res.json();
    },
  });

  const project = data?.project;

  return (
    <PortalShell variant="customer" title={project?.title ?? "Project"}>
      <div className="max-w-5xl mx-auto space-y-6">
        <nav
          className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1"
          aria-label="Project sections"
        >
          {hubLinks.map((link) => {
            const href = link.slug ? `${basePath}/${link.slug}` : basePath;
            const active = link.slug
              ? pathname.startsWith(`${basePath}/${link.slug}`)
              : pathname === basePath;
            const Icon = link.icon;

            return (
              <Link
                key={link.slug || "overview"}
                href={href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors shrink-0",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {isLoading ? (
          <>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-48 w-full" />
          </>
        ) : isError || !project ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">
                We couldn&apos;t load this project. Return to your{" "}
                <Link href="/portal" className="text-primary underline">
                  dashboard
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{project.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5 mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {project.address}, {project.city}, {project.state}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{project.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Project manager</p>
                  <p className="font-medium">{project.projectManager}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Est. completion</p>
                  <p className="font-medium">{project.estimatedCompletion}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current stage</p>
                  <p className="font-medium">{project.status}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Full timeline</CardTitle>
                <CardDescription>Every stage from consultation to warranty</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectTimeline currentStage={project.currentStage} />
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {hubLinks.slice(1).map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.slug}
                    href={`${basePath}/${link.slug}`}
                    className="flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{link.label}</p>
                      <p className="text-xs text-muted-foreground">
                        Open {link.label.toLowerCase()}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </PortalShell>
  );
}
