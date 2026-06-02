"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { ComplianceBanner } from "@/components/portal/ComplianceBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  ShieldCheck,
  FileSignature,
  FolderKanban,
  ShoppingBag,
  AlertTriangle,
} from "lucide-react";

export function SubcontractorHomeDashboard({
  embedded = false,
  shellVariant = "subcontractor",
}: {
  embedded?: boolean;
  shellVariant?: "subcontractor" | "partner";
} = {}) {
  const { user } = useAuth();

  const { data: compliance } = useQuery({
    queryKey: ["/api/compliance"],
    queryFn: async () => {
      const res = await fetch("/api/compliance");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ["/api/contracts"],
    queryFn: async () => {
      const res = await fetch("/api/contracts");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const pendingContracts = contracts.filter(
    (c: { status: string }) => c.status === "sent"
  );
  const activeProjects = projects.filter(
    (p: { assignment: { status: string } }) =>
      p.assignment.status === "assigned" || p.assignment.status === "active"
  );

  const content = (
    <>
      <ComplianceBanner />

      <p className="text-muted-foreground mb-6">
        Welcome back{user?.firstName ? `, ${user.firstName}` : ""}. Manage compliance, projects, and contracts from here.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                compliance?.summary?.status === "compliant"
                  ? "default"
                  : compliance?.summary?.status === "expiring_soon"
                    ? "secondary"
                    : "destructive"
              }
            >
              {compliance?.summary?.status?.replace("_", " ") ?? "Loading..."}
            </Badge>
            <Button size="sm" variant="link" className="px-0 mt-2 block" asChild>
              <Link href="/subcontractor/compliance">Manage documents</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileSignature className="h-4 w-4" />
              Pending Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingContracts.length}</p>
            {pendingContracts.length > 0 && (
              <Button size="sm" variant="link" className="px-0 mt-1" asChild>
                <Link href="/subcontractor/contracts">Sign now</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeProjects.length}</p>
            <Button size="sm" variant="link" className="px-0 mt-1" asChild>
              <Link href="/subcontractor/projects">View projects</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Lead Marketplace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Browse and purchase available leads
            </p>
            <Button size="sm" variant="outline" asChild>
              <Link href="/subcontractor/leads">Browse Leads</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {compliance?.summary?.status === "non_compliant" && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Compliance required</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload approved COI and W-9 documents to purchase leads and receive project assignments.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );

  if (embedded) return content;

  return (
    <PortalShell variant={shellVariant} title="Home">
      {content}
    </PortalShell>
  );
}
