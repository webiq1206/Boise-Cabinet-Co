"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

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

  if (isLoading || !isAdmin) return null;

  return (
    <PortalShell variant="admin" title="Projects">
      <div className="space-y-4">
        {loadingProjects ? (
          <p className="text-muted-foreground">Loading projects...</p>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No projects yet. Convert a lead from the{" "}
              <Link href="/admin/leads" className="underline">
                Lead Marketplace
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
                      <Badge variant="outline">{project.status}</Badge>
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
  );
}
