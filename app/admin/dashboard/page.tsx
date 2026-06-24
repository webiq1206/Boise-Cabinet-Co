"use client";

import { useQuery } from "@tanstack/react-query";
import { PortalShell } from "@/components/portal/PortalShell";
import { PageHeader } from "@/components/portal/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { FolderKanban, Users, FileSignature } from "lucide-react";

interface AdminProject {
  id: string;
  status: string;
}

export default function AdminDashboardPage() {
  const { isAdmin, isLoading } = useAuth();

  const { data: projects = [] } = useQuery<AdminProject[]>({
    queryKey: ["/api/admin/projects"],
    queryFn: async () => {
      const res = await fetch("/api/admin/projects");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAdmin,
  });

  if (!isAdmin && !isLoading) {
    return <AdminAuthGate title="Operations Dashboard"><span /></AdminAuthGate>;
  }

  if (isLoading) {
    return <AdminAuthGate title="Operations Dashboard"><span /></AdminAuthGate>;
  }

  const activeProjects = projects.filter((p) => p.status === "active").length;

  return (
    <AdminAuthGate title="Operations Dashboard">
    <PortalShell variant="admin" title="Operations Dashboard">
      <div className="space-y-6">
        <PageHeader
          title="Operations Dashboard"
          description="Monitor leads, projects, and installation partners at a glance."
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <Button variant="outline" asChild className="h-auto py-4 justify-start">
            <Link href="/admin/leads">
              <Users className="h-4 w-4 mr-2" />
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
              <FileSignature className="h-4 w-4 mr-2" />
              Outreach
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FolderKanban className="h-4 w-4" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{activeProjects}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {projects.length} total
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalShell>
    </AdminAuthGate>
  );
}
