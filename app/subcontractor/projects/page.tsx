"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { ComplianceBanner } from "@/components/portal/ComplianceBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

export default function SubcontractorProjectsPage() {
  const { isSubcontractor, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isSubcontractor) router.push("/subcontractor");
  }, [isSubcontractor, isLoading, router]);

  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isSubcontractor,
  });

  if (isLoading || !isSubcontractor) return null;

  return (
    <PortalShell variant="subcontractor" title="My Projects">
      <ComplianceBanner />
      <div className="space-y-4">
        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No project assignments yet.
            </CardContent>
          </Card>
        ) : (
          projects.map(
            (p: {
              id: string;
              title: string;
              city: string;
              status: string;
              assignment: { status: string };
            }) => (
              <Card key={p.id}>
                <Link href={`/subcontractor/projects/${p.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{p.title}</CardTitle>
                      <Badge variant="outline">{p.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {p.city} · Assignment: {p.assignment.status}
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
