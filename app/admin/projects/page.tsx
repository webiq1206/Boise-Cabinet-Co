"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { formatProjectStatus } from "@/lib/formatStatus";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminProjectsPage() {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) router.push("/admin");
  }, [isAdmin, isLoading, router]);

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["/api/admin/projects"],
    queryFn: async () => {
      const res = await fetch("/api/admin/projects");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    enabled: isAdmin,
  });

  if (isLoading || !isAdmin) {
    return (
      <AdminAuthGate title="Projects">
        <span />
      </AdminAuthGate>
    );
  }

  return (
    <AdminAuthGate title="Projects">
    <PortalShell variant="admin" title="Projects">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Track active jobs converted from leads, their status, and assignments.
        </p>
        {loadingProjects ? (
          <Skeleton className="h-32 w-full" />
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No projects yet. Convert a lead from{" "}
              <Link href="/admin/leads" className="underline">
                Leads
              </Link>
              .
            </CardContent>
          </Card>
        ) : (
          projects.map(
            (project: {
              id: string;
              title: string;
              name: string;
              city: string;
              status: string;
              contractAmount?: string | null;
              startDate?: string | null;
            }) => (
              <Card key={project.id} className="hover:bg-muted/30 transition-colors">
                <Link href={`/admin/projects/${project.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-base">{project.title}</CardTitle>
                      <Badge variant="outline">{formatProjectStatus(project.status)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p>{project.name} · {project.city}</p>
                    {project.contractAmount && (
                      <p className="mt-1">
                        Contract: ${parseFloat(project.contractAmount).toLocaleString()}
                      </p>
                    )}
                  </CardContent>
                </Link>
              </Card>
            )
          )
        )}
      </div>
    </PortalShell>
    </AdminAuthGate>
  );
}
