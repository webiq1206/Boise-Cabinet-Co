"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { PLACEHOLDER_PROJECT } from "@/shared/portalPlaceholder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check } from "lucide-react";

const SELECTIONS = [
  { category: "Collection", value: "Heritage Shaker", status: "selected" },
  { category: "Door style", value: "Full overlay shaker", status: "selected" },
  { category: "Finish", value: "White Oak — Natural", status: "pending" },
  { category: "Hardware", value: "Matte black bar pulls", status: "selected" },
  { category: "Layout", value: "L-shape with island", status: "review" },
];

const statusBadge: Record<string, "default" | "secondary" | "outline"> = {
  selected: "default",
  pending: "secondary",
  review: "outline",
};

export default function ProjectDesignPage() {
  const params = useParams();
  const projectId = params.id as string;
  const project = PLACEHOLDER_PROJECT;

  return (
    <PortalShell variant="customer" title="Design Selections">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={`/portal/projects/${projectId}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to project
          </Link>
        </Button>

        <div>
          <h2 className="text-xl font-sans font-light tracking-tight">
            Design <em className="brc-accent text-accent">selections</em>
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {project.title} — review and approve your cabinet choices
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current selections</CardTitle>
            <CardDescription>
              Placeholder data — selections will sync from Design Studio when connected
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {SELECTIONS.map((item) => (
              <div
                key={item.category}
                className="flex flex-wrap items-center justify-between gap-2 py-3 border-b last:border-0"
              >
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {item.category}
                  </p>
                  <p className="font-medium text-sm mt-0.5">{item.value}</p>
                </div>
                <Badge variant={statusBadge[item.status] ?? "outline"}>{item.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Check className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
              3D renderings and detailed spec sheets will appear here once your design is finalized.
            </p>
            <Button variant="brand" asChild>
              <Link href="/design-studio">Open Design Studio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
